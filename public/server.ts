/**
 * @file Web Service
 * ## 功能 (who)
 * 在正式環境下，給輸出靜態站點的前端提供 HTTP Web Service
 *
 */

import { serveFile } from "@std/http/file-server";
import { contentType } from "@std/media-types";
import { extname, join, normalize, SEPARATOR } from "@std/path";

const PORT = parseInt(Deno.env.get("PORT") || "8085");
const FS_ROOT = import.meta.dirname ?? join(Deno.cwd(), "dist");
const NOT_FOUND_PAGE = join(FS_ROOT, "404.html");

const COMPRESSED_VARIANTS = [
  { encoding: "br", ext: ".br" },
  { encoding: "gzip", ext: ".gz" },
] as const;

/** Files under /_astro/ are content-hashed by Astro → immutable forever. */
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";
/** Static assets: safe to cache for a week. */
const ASSET_CACHE = "public, max-age=604800";
/** HTML pages and anything else: revalidate every request. */
const NO_CACHE = "no-cache";

/** Extensions treated as long-lived static assets. */
const ASSET_EXT_RE =
  /\.(png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|eot|mp4|webm|mp3|ogg|pdf)$/i;

/** Extensions worth serving precompressed (text-like payloads). */
const COMPRESSIBLE_EXT_RE =
  /\.(html?|js|mjs|cjs|css|json|xml|txt|webmanifest|map|svg|ics)$/i;

// ── Security Headers Configuration ──────────────────────────────────────────

const CONTENT_SECURITY_POLICY = [
  "default-src 'self' https://giscus.app",
  "script-src 'self' https://giscus.app",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://giscus.app",
  "font-src 'self' https://fonts.gstatic.com https://giscus.app",
  "img-src 'self' data: https:",
  "connect-src 'self' https://giscus.app https://api.github.com",
  "frame-src https://giscus.app",
  "media-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const PERMISSIONS_POLICY = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "interest-cohort=()",
].join(", ");

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": PERMISSIONS_POLICY,
};

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Appends security headers to an HTTP response.
 * @param response - The original Response object
 * @returns A new Response with security headers attached
 */
function with_security_headers(response: Response): Response {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ── Redirects ───────────────────────────────────────────────────────────────

const REDIRECTS_FILE = join(FS_ROOT, "_redirects");

/**
 * Reads permanent redirect rules from `_redirects` at startup.
 *
 * The file uses Netlify syntax (`<source> <destination> [status]`), the same
 * format Deno Deploy's staticd reads, so both deployment targets stay in sync
 * from a single source. Only 3xx rules are honoured here; staticd additionally
 * supports rewrites (status 200/404), which this server has no use for.
 * @returns A map of request path to redirect destination
 */
async function load_redirects(): Promise<Map<string, string>> {
  const rules = new Map<string, string>();

  let text: string;
  try {
    text = await Deno.readTextFile(REDIRECTS_FILE);
  } catch {
    // No rules file is a valid state; the site simply has no redirects
    return rules;
  }

  for (const line of text.split("\n")) {
    // Strip comments and surrounding whitespace before splitting on spaces
    const rule = line.split("#")[0].trim();
    if (!rule) continue;

    const parts = rule.split(/\s+/);
    if (parts.length < 2) continue;

    const [source, destination, status] = parts;
    // Only follow explicit redirects; a missing status defaults to 302 in
    // staticd, so treat it the same way here
    const code = Number(status ?? 302);
    if (!Number.isInteger(code) || code < 300 || code > 399) continue;

    rules.set(source, destination);
  }

  return rules;
}

// Loaded once at startup: the file is baked into the image at build time and
// never changes while the process runs
const REDIRECTS = await load_redirects();

// ── Caching ─────────────────────────────────────────────────────────────────

/**
 * Returns the Cache-Control header value for a given URL pathname.
 * Mirrors the rules in public/_headers (used by Deno Deploy staticd).
 * @param pathname - The URL pathname of the request
 * @returns A Cache-Control directive string
 */
function cache_control_for(pathname: string): string {
  switch (true) {
    case pathname.startsWith("/_astro/"):
      return IMMUTABLE_CACHE;

    case pathname.startsWith("/assets/"):
    case pathname.startsWith("/pagefind/"):
    case ASSET_EXT_RE.test(pathname):
      return ASSET_CACHE;

    default:
      return NO_CACHE;
  }
}

/**
 * Checks whether a path points to an existing file on disk.
 * @param path - Absolute path to check
 * @returns True when the path is an existing regular file
 */
function file_exists(path: string): boolean {
  try {
    return Deno.statSync(path).isFile;
  } catch {
    return false;
  }
}

/**
 * Picks the best precompressed variant (br > gzip) a client accepts.
 * @param file_path - Absolute path of the uncompressed file
 * @param accept_encoding - The request's Accept-Encoding header (nullable)
 * @returns The variant path and encoding, or null when none is available
 */
function pick_variant(
  file_path: string,
  accept_encoding: string | null
): { path: string; encoding: "br" | "gzip" } | null {
  if (!accept_encoding) return null;

  for (const { encoding, ext } of COMPRESSED_VARIANTS) {
    if (
      accept_encoding.includes(encoding) &&
      file_exists(`${file_path}${ext}`)
    ) {
      return { path: `${file_path}${ext}`, encoding };
    }
  }

  return null;
}

/**
 * Resolves a URL pathname to an absolute file path inside FS_ROOT,
 * preventing directory traversal. Directories fall back to index.html.
 * @param pathname - The URL pathname
 * @returns The resolved file path, or null when the path escapes FS_ROOT
 */
function resolve_file(pathname: string): string | null {
  const resolved = normalize(join(FS_ROOT, pathname));

  if (resolved !== FS_ROOT && !resolved.startsWith(FS_ROOT + SEPARATOR)) {
    return null;
  }

  try {
    const canonical_root = Deno.realPathSync(FS_ROOT);
    const canonical_path = Deno.realPathSync(resolved);
    if (
      canonical_path !== canonical_root &&
      !canonical_path.startsWith(canonical_root + SEPARATOR)
    ) {
      return null;
    }

    const info = Deno.statSync(canonical_path);

    if (info.isDirectory) {
      return join(canonical_path, "index.html");
    }

    return canonical_path;
  } catch {
    return null;
  }
}

/**
 * Service Start a Console Log
 */
function log_start() {
  console.log(`[Website] Service use port: ${PORT}`);
  console.log(`[Website] Serving a Directory: ${FS_ROOT}`);
}

// ── Request Handler ─────────────────────────────────────────────────────────

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const accept_encoding = request.headers.get("accept-encoding");
  let pathname: string;

  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return with_security_headers(new Response("Bad Request", { status: 400 }));
  }

  // Honour _redirects before touching the filesystem so renamed articles keep
  // their old URLs working. Runs first so a redirect wins even if a stale file
  // still sits at the old path.
  const destination = REDIRECTS.get(pathname);
  if (destination) {
    // Carry the query string across so `?utm_source=...` survives the redirect
    const target = url.search
      ? `${destination}?${url.search.slice(1)}`
      : destination;

    // The Location header must be ASCII (ByteString). Paths containing
    // non-ASCII characters, e.g. `/posts/Ansible-安裝&相關設置/`, have to be
    // percent-encoded or the Response constructor throws and the request 500s.
    const location = encodeURI(target);

    return with_security_headers(
      new Response(null, {
        status: 301,
        headers: { Location: location, "Cache-Control": NO_CACHE },
      })
    );
  }

  const file_path = resolve_file(pathname);

  if (!file_path || !file_exists(file_path)) {
    if (file_exists(NOT_FOUND_PAGE)) {
      const body = await Deno.readFile(NOT_FOUND_PAGE);

      return with_security_headers(
        new Response(body, {
          status: 404,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": NO_CACHE,
          },
        })
      );
    }
    return with_security_headers(new Response("Not Found", { status: 404 }));
  }

  try {
    const variant = pick_variant(file_path, accept_encoding);
    const response = await serveFile(request, variant?.path ?? file_path);
    const headers = new Headers(response.headers);

    if (variant) {
      headers.set("Content-Encoding", variant.encoding);
      headers.set("Vary", "Accept-Encoding");
      headers.set(
        "Content-Type",
        contentType(extname(file_path)) ?? "application/octet-stream"
      );
    } else if (COMPRESSIBLE_EXT_RE.test(file_path)) {
      headers.set("Vary", "Accept-Encoding");
    }

    headers.set("Cache-Control", cache_control_for(pathname));

    return with_security_headers(
      new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[Website] serving request: ${error}`);

    return with_security_headers(
      new Response("Internal Server Error", { status: 500 })
    );
  }
};

// ── Entrypoint ──────────────────────────────────────────────────────────────
// eslint-disable-next-line no-console
log_start();
Deno.serve({ port: PORT }, handler);
