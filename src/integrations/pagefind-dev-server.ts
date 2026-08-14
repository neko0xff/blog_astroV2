/**
 * @file Vite Plugin - Pagefind Dev Server Middleware
 * @description
 * 在開發模式（`vite dev`）下為 Pagefind 提供靜態檔案服務。
 *
 * @context
 * 1. Astro Dev Server 預設僅服務 `public/` 資料夾。
 * 2. Pagefind 搜尋索引為建置產物（位於 `dist/pagefind/`）。
 * 3. Vite 限制不可動態 `import()` 位於 `public/` 的檔案，否則 `pagefind.js` 會載入失敗。
 *
 * @solution
 * 於 Vite Middleware Chain 前端優先攔截 `/pagefind/*` 路由，
 * 直接讀取 `dist/pagefind/` 實體檔案並回應，維持 Dev 與 Prod 環境行為一致。
 */

import { readFileSync } from "node:fs";
const PAGEFIND_DIST = new URL("../../dist/pagefind/", import.meta.url);

/** 可被 pagefind 索引抓取的檔案副檔名 → MIME type 對照表 */
const MIME_TYPES: Record<string, string> = {
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".wasm": "application/wasm",
  ".pagefind": "application/wasm", // pagefind 的 wasm 產物（wasm.unknown.pagefind）
  ".pf_meta": "application/octet-stream",
  ".pf_index": "application/octet-stream",
  ".pf_fragment": "application/octet-stream",
};

function extension_for(filename: string): string {
  const last_dot = filename.lastIndexOf(".");

  return last_dot >= 0 ? filename.slice(last_dot).toLowerCase() : "";
}

/**
 * 回傳檔案副檔名對應的 MIME type，找不到時回傳 application/octet-stream。
 * @param filename - 檔案名稱
 * @returns MIME type 字串
 */
function mime_type_for(filename: string): string {
  return MIME_TYPES[extension_for(filename)] ?? "application/octet-stream";
}

/**
 * 建立 Vite 外掛：dev 模式用 middleware 服務 /pagefind/* 靜態檔案。
 * @returns Vite 外掛物件
 */
export function pagefind_dev_server(): {
  name: string;
  configureServer: (server: {
    middlewares: {
      use: (
        handler: (
          req: { url?: string },
          res: {
            writeHead: (
              status: number,
              headers?: Record<string, string>
            ) => void;
            end: (body?: string | Uint8Array) => void;
          },
          next: () => void
        ) => void
      ) => void;
    };
  }) => void;
} {
  return {
    name: "pagefind-dev-server",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/pagefind/")) {
          next();
          return;
        }

        const pathname = decodeURIComponent(
          new URL(url, "http://localhost").pathname
        );
        const relative = pathname.slice("/pagefind/".length);

        // 防止目錄穿越（../）與空路徑
        if (!relative || relative.includes("..") || relative.includes("\0")) {
          res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Bad Request");
          return;
        }

        const file_url = new URL(relative, PAGEFIND_DIST);

        try {
          const data = readFileSync(file_url);

          res.writeHead(200, {
            "Content-Type": mime_type_for(relative),
            "Cache-Control": "no-cache",
          });
          res.end(data);
        } catch {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Not Found");
        }
      });
    },
  };
}
