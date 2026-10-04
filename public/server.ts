/**
 * @file 正式環境靜態站點伺服器的入口
 *
 * @description
 * - What：讀環境變數、建立 `ServerContext`、啟動 `Deno.serve`。
 * - Why：把所有「需要環境」的決策集中在入口，其他模組保持可注入、可測試。
 * - Who：`deno task serve` / `deno_prod.json service` / Docker CMD 在呼叫。
 * - When：容器、K8s Post、本機正式預覽都從這裡進入。
 * - Where：`public/server.ts`，build 後複製成 `dist/server.ts`。
 * - How：解析 PORT、`import.meta.dirname` 定位根目錄、載入 `_redirects`、建立 handler。
 */

import { join } from "@std/path";
import { DEFAULT_PORT, parse_log_format } from "./server/config.ts";
import { create_handler } from "./server/handler.ts";
import { load_redirects } from "./server/redirects.ts";

const PORT = parseInt(Deno.env.get("PORT") || String(DEFAULT_PORT));
const FS_ROOT = import.meta.dirname ?? join(Deno.cwd(), "dist");
const NOT_FOUND_PAGE = join(FS_ROOT, "404.html");

/**
 * 印出啟動時的監聽資訊
 * @param port - 監聽的埠號
 * @param fs_root - 服務的網站根目錄
 */
function log_start(port: number, fs_root: string) {
  console.log(`[Website] Service use port: ${port}`);
  console.log(`[Website] Serving a Directory: ${fs_root}`);
}

// Loaded once at startup:
// the file is baked into the image at build time and never changes while the process runs
const REDIRECTS = await load_redirects(join(FS_ROOT, "_redirects"));

// ── Entrypoint ──────────────────────────────────────────────────────────────
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
