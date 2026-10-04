/**
 * @file 共用常數與輕量設定解析模組
 *
 * @description
 * - What：集中放不需 `Deno.env` / `import.meta` 的純常數與純解析函式。
 * - Why：讓這些值可被 `deno check` 與單元測試直接引用，不必啟動伺服器。
 * - Who：`handler.ts`、`server.ts`、測試與部署設定共用。
 * - When：需要跨模組共用設定時才從這裡取值。
 * - Where：`public/server/config.ts`。
 * - How：入口 `server.ts` 在啟動時讀環境變數，再透過 `ServerContext` 傳入需要的模組。
 */

/** 未設 PORT 環境變數時使用的預設埠號。 */
export const DEFAULT_PORT = 8085;

/** 健康檢查路徑；探測用途，不記 access log。 */
export const HEALTH_PATH = "/healthz";

/** access log 輸出格式：人讀 `text`，或給日誌收集器的 `json`。 */
export type LogFormat = "text" | "json";

/**
 * 解析 LOG_FORMAT 環境變數。
 *
 * @description
 * - What：把字串值標準化為 `"text" | "json"`。
 * - Why：避免大小寫、前後空白或未知值讓 log 輸出行為不一致。
 * - Who：入口 `server.ts` 啟動時呼叫一次。
 * - When：建立 `ServerContext` 之前。
 * - Where：純字串判斷。
 * - How：轉小寫後精確比對 `"json"`；其他（含 undefined）回 `"text"`。
 *
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
/** 一般靜態資源：安全起見快取一週。 */
export const ASSET_CACHE = "public, max-age=604800";
/** HTML 頁與其他內容：每次請求都重新驗證。 */
export const NO_CACHE = "no-cache";

/** 視為長壽命靜態資源的副檔名。 */
export const ASSET_EXT_RE =
  /\.(png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|eot|mp4|webm|mp3|ogg|pdf)$/i;

/** 值得提供預壓縮版本的（文字類）副檔名。 */
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

// 與 public/_headers 的 `Permissions-Policy` 對齊（Deno Deploy staticd），
// 兩個部署目標維持同一套策略。
//
// clipboard-write=(self) 而非 clipboard-write=()：
// - postDetails.ts 的複製鈕會呼叫 navigator.clipboard.writeText，而 Permissions Policy 會被 document 繼承給所有同源 script。
// - 寫成 () 會連自己的複製鈕一起擋掉。
// - 寫成 (self) 只授權同源，giscus 跨來源 iframe 仍被拒絕。
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
