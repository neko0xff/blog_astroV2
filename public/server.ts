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
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://giscus.app",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
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
   accept_encoding: string | null,
 ): { path: string; encoding: "br" | "gzip" } | null {
   if (!accept_encoding) return null;

   for (const { encoding, ext } of COMPRESSED_VARIANTS) {
     if (accept_encoding.includes(encoding) && file_exists(`${file_path}${ext}`)) {
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
    const info = Deno.statSync(resolved);

    if (info.isDirectory) {
      return join(resolved, "index.html");
    }

    return resolved;
  } catch {
    return null;
  }
}

/**
 * Service Start a Console Log
 */
function log_start(){
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

  const file_path = resolve_file(pathname);

  if (!file_path || !file_exists(file_path)) {
    if (file_exists(NOT_FOUND_PAGE)) {
      const body = await Deno.readFile(NOT_FOUND_PAGE);

      return with_security_headers(new Response(body, {
        status: 404,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": NO_CACHE,
        },
      }));
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
        contentType(extname(file_path)) ?? "application/octet-stream",
      );
    } else if (COMPRESSIBLE_EXT_RE.test(file_path)) {
      headers.set("Vary", "Accept-Encoding");
    }

    headers.set("Cache-Control", cache_control_for(pathname));

    return with_security_headers(new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[Website] serving request: ${error}`);

    return with_security_headers(
      new Response("Internal Server Error", { status: 500 }),
    );
  }
};

// ── Entrypoint ──────────────────────────────────────────────────────────────
// eslint-disable-next-line no-console
log_start()
Deno.serve({ port: PORT }, handler);
