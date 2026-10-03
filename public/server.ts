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

// Mirrors the `Permissions-Policy` line in public/_headers (Deno Deploy staticd),
// so both deployment targets ship the same policy. Keep the two in sync.
//
// clipboard-write=(self) 而非 clipboard-write=()：本站在 postDetails.ts 的
// 複製鈕會呼叫 navigator.clipboard.writeText，而 Permissions Policy 會被
// 文件繼承給所有同源 script。寫成 () 會連自己的複製鈕一起封掉；
// 寫成 (self) 只授權同源，giscus 那個跨來源 iframe 仍然被拒絕。
const PERMISSIONS_POLICY = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "interest-cohort=()",
  "clipboard-write=(self)",
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
 * Resolves which content codings the client declared acceptable.
 *
 * @description
 * 為什麼需要這個函式：原本用 `accept_encoding.includes(encoding)` 做子字串比對，
 * 那是錯的。`gzip;q=0` 是客戶端「明確拒絕」gzip，但子字串比對會命中；
 * `xbr` / `gzippy` 這種從未登記的 coding token 也會因為含有 `br` / `gzip`
 * 這幾個字元而被誤判為接受。RFC 9110 §12.5.3 規定：只有明列且 q > 0，
 * 或被 q > 0 的萬用字元 `*` 涵蓋的 coding 才是可接受的。
 *
 * @param header - 原始 Accept-Encoding 請求標頭值
 * @returns 客戶端以 q > 0 接受的 coding 名稱集合
 */
function acceptable_codings(header: string): Set<string> {
  const explicit = new Map<string, number>();
  // 萬用字元的預設值是 0，不是 1。RFC 9110 §12.5.3 規定「未被列出的 coding
  // 不算可接受」，所以當標頭裡沒有 `*` 時，未明列的 coding（例如只寫了
  // `br;q=0` 的情況下的 gzip）必須視為不可接受。若這裡預設成 1，
  // `Accept-Encoding: xbr` 或 `deflate` 都會被誤判成接受 gzip。
  let wildcard = 0;

  for (const part of header.split(",")) {
    const [raw_name, ...params] = part.trim().split(";");
    // coding 名稱不區分大小寫（RFC 9110 §8.4.1）
    const name = raw_name.trim().toLowerCase();
    if (!name) continue;

    let q = 1;
    for (const param of params) {
      const [key, value] = param.split("=").map(s => s.trim());
      if (key?.toLowerCase() === "q") {
        const parsed = Number.parseFloat(value ?? "");
        // q 值解析失敗時視為拒絕（fail-closed），寧可少給壓縮也不要給錯的
        q = Number.isNaN(parsed) ? 0 : parsed;
      }
    }

    if (name === "*") wildcard = q;
    else explicit.set(name, q);
  }

  const accepted = new Set<string>();
  for (const [name, q] of explicit) {
    if (q > 0) accepted.add(name);
  }
  // 萬用字元只涵蓋「未被明列」的 coding；明列者（含 q=0）以明列為準
  if (wildcard > 0) {
    for (const { encoding } of COMPRESSED_VARIANTS) {
      if (!explicit.has(encoding)) accepted.add(encoding);
    }
  }
  return accepted;
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

  const acceptable = acceptable_codings(accept_encoding);

  for (const { encoding, ext } of COMPRESSED_VARIANTS) {
    if (acceptable.has(encoding) && file_exists(`${file_path}${ext}`)) {
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
      // 目錄要回傳 index.html，但這個組出來的路徑必須「再走一次」上面的
      // canonical 檢查。原因是 index.html 本身可能是指向 FS_ROOT 以外的
      // symlink：目錄本身在 root 內不代表它的 index.html 也在。
      // 不重複檢查的話，/dirlink/ 會把 /dirlink/index.html -> /etc/passwd
      // 這種檔案內容送出去，而同一個 symlink 直接請求時會被擋下，
      // 形成同一個控制項內部的行為不一致。
      const index_path = join(canonical_path, "index.html");
      const canonical_index = Deno.realPathSync(index_path);
      if (
        canonical_index !== canonical_root &&
        !canonical_index.startsWith(canonical_root + SEPARATOR)
      ) {
        return null;
      }
      return canonical_index;
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

    // `serveFile` 會在檔案不存在或 method 不被允許時提早回傳（405 / 404），
    // 那時回傳的 body 是純文字、並沒有套用 variant。若仍照樣設定
    // Content-Encoding，客戶端會拿到一個標示為 br 卻無法解碼的 body，
    // 而且資產路徑還會被 Cache-Control: public 快取七天。
    // 所以只在「確定有壓縮檔被實際回傳」時才設定 Content-Encoding。
    if (variant && response.status === 200) {
      headers.set("Content-Encoding", variant.encoding);
      headers.set("Vary", "Accept-Encoding");
      headers.set(
        "Content-Type",
        contentType(extname(file_path)) ?? "application/octet-stream"
      );
    } else if (COMPRESSIBLE_EXT_RE.test(file_path)) {
      headers.set("Vary", "Accept-Encoding");
    }

    // RFC 9110 §15.5.6：405 回應 MUST 帶 Allow 標明支援的 method。
    // 實際的 method 政策由 @std/http 決定，所以直接讀回應、不另外硬編一份，
    // 避免與上游實作漂移。
    if (response.status === 405 && !headers.has("allow")) {
      headers.set("Allow", "GET, HEAD");
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
