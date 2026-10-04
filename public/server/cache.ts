/**
 * @file 快取策略決策模組
 *
 * @description
 * - What（做什麼）：輸入請求 pathname，輸出對應的 `Cache-Control` 指令字串。
 * - Why（為什麼）：避免 HTML、雜湊資產、一般靜態檔被瀏覽器/CDN 錯誤快取。
 * - Who（誰用）：`public/server/handler.ts` 在組回應標頭時呼叫。
 * - When（何時）：每個非轉址、且成功解析到檔案的請求，回應前呼叫一次。
 * - Where（在何處）：模組 `public/server/cache.ts` 的 `cache_control_for`。
 * - How（怎麼做）：用路徑分流規則分類；與 `public/_headers` 對齊，修改時兩處同步。
 */

import {
  ASSET_CACHE,
  ASSET_EXT_RE,
  IMMUTABLE_CACHE,
  NO_CACHE,
} from "./config.ts";

/**
 * 依請求路徑決定 `Cache-Control`。
 *
 * @description
 * - What：回傳對該 pathname 套用的 Cache-Control 值。
 * - Why：讓雜湊資產長期 immutable、一般資產保守、HTML 每次驗證，降低更新後讀到舊頁的風險。
 * - Who：handler 產生回應標頭時呼叫。
 * - When：靜態檔案已找到、即將回傳前。
 * - Where：函式內依 `pathname` 與副檔名規則分流。
 * - How：用 `switch (true)` 依序比對 `/_astro/`、`/assets/`、`/pagefind/` 與資產副檔名；其他回 no-cache。
 *
 * @param pathname - 請求的 URL pathname
 * @returns Cache-Control 指令字串
 */
export function cache_control_for(pathname: string): string {
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
