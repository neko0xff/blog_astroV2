/**
 * @file 靜態伺服器的共用常數與輕量設定解析。
 *
 * 只放不依賴執行期環境的常數；需要 `Deno.env` / `import.meta`
 * 的值由入口 `public/server.ts` 算好再傳入，保持本模組可被
 * `deno check` 與單元測試直接引用。
 */

/** 沒有設定 PORT 環境變數時的預設埠號。 */
export const DEFAULT_PORT = 8085;

/** 健康檢查路徑：給容器 / 編排器探測用，不記 access log。 */
export const HEALTH_PATH = "/healthz";

/** Access log 輸出格式：人讀的 `text` 或給日誌收集器的 `json`。 */
export type LogFormat = "text" | "json";

/**
 * 解析 LOG_FORMAT 環境變數，未設定或無法識別時回傳 `text`。
 * @param value - 原始環境變數值
 * @returns 解析後的格式
 */
export function parse_log_format(value: string | undefined): LogFormat {
  return value?.toLowerCase() === "json" ? "json" : "text";
}

export const COMPRESSED_VARIANTS = [
  { encoding: "br", ext: ".br" },
  { encoding: "gzip", ext: ".gz" },
] as const;

/** Files under /_astro/ are content-hashed by Astro → immutable forever. */
export const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";
/** Static assets: safe to cache for a week. */
export const ASSET_CACHE = "public, max-age=604800";
/** HTML pages and anything else: revalidate every request. */
export const NO_CACHE = "no-cache";

/** Extensions treated as long-lived static assets. */
export const ASSET_EXT_RE =
  /\.(png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|eot|mp4|webm|mp3|ogg|pdf)$/i;

/** Extensions worth serving precompressed (text-like payloads). */
export const COMPRESSIBLE_EXT_RE =
  /\.(html?|js|mjs|cjs|css|json|xml|txt|webmanifest|map|svg|ics)$/i;

// ── Security Headers Configuration ──────────────────────────────────────────

export const CONTENT_SECURITY_POLICY = [
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
// clipboard-write=(self) 而非 clipboard-write=()：
// - 本站在 postDetails.ts 的複製鈕會呼叫 navigator.clipboard.writeText，而 Permissions Policy 會被文件繼承給所有同源 script。
// - 寫成 () 會連自己的複製鈕一起封掉
// - 寫成 (self) 只授權同源，giscus 那個跨來源 iframe 仍然被拒絕。
export const PERMISSIONS_POLICY = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "interest-cohort=()",
  "clipboard-write=(self)",
].join(", ");

export const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": PERMISSIONS_POLICY,
};
