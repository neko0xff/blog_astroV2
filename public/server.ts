/**
 * @file Web Service
 * ## 功能 (who)
 * 在正式環境下，給輸出靜態站點的前端提供 HTTP Web Service
 *
 * 薄入口：只負責讀環境變數、組運行期上下文、啟動伺服器；
 * 實際邏輯在 `./server/` 各模組（設定、安全標頭、快取、檔案、
 * 轉址、預壓縮、日誌、請求處理）。
 */

import { join } from "@std/path";
import { DEFAULT_PORT, parse_log_format } from "./server/config.ts";
import { create_handler } from "./server/handler.ts";
import { load_redirects } from "./server/redirects.ts";

const PORT = parseInt(Deno.env.get("PORT") || String(DEFAULT_PORT));
const FS_ROOT = import.meta.dirname ?? join(Deno.cwd(), "dist");
const NOT_FOUND_PAGE = join(FS_ROOT, "404.html");

/**
 * Service Start a Console Log
 * @param port - 監聽的埠號
 * @param fs_root - 服務的網站根目錄
 */
function log_start(port: number, fs_root: string) {
  console.log(`[Website] Service use port: ${port}`);
  console.log(`[Website] Serving a Directory: ${fs_root}`);
}

// Loaded once at startup: the file is baked into the image at build time and
// never changes while the process runs
const REDIRECTS = await load_redirects(join(FS_ROOT, "_redirects"));

// ── Entrypoint ──────────────────────────────────────────────────────────────
// eslint-disable-next-line no-console
log_start(PORT, FS_ROOT);
Deno.serve(
  { port: PORT },
  create_handler({
    redirects: REDIRECTS,
    not_found_page: NOT_FOUND_PAGE,
    fs_root: FS_ROOT,
    log_format: parse_log_format(Deno.env.get("LOG_FORMAT")),
  })
);
