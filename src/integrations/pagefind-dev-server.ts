/**
 * @file Vite Plugin - Pagefind Dev Server Middleware
 * @description
 * 在開發模式（`vite dev`）下為 Pagefind 提供靜態檔案服務
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
import { fileURLToPath } from "node:url";
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
 * 回傳檔案副檔名對應的 MIME type
 *
 * @description
 * 找不到時回傳 application/octet-stream
 *
 * @param filename - 檔案名稱
 * @returns MIME type 字串
 */
function mime_type_for(filename: string): string {
  return MIME_TYPES[extension_for(filename)] ?? "application/octet-stream";
}

/**
 * 把 `/pagefind/<name>` 的路徑片段解析成 `dist/pagefind/` 底下的實體檔案路徑。
 *
 * @description
 * ## 為什麼需要這個函式 （Who)
 * 1. 原本的守衛只檢查字串是否含 `..`，但後續還會呼叫 `new URL(relative, PAGEFIND_DIST)`。
 * 2. 當 `relative` 以 `/` 開頭時，WHATWG URL 解析會把它當成「絕對路徑參考」而**丟掉 base**，於是守衛檢查的字串和實際拿去開檔的值不是同一個
 * 3. `/pagefind//etc/passwd` 就能讀到 dist/pagefind/ 以外
 *
 * ## 必做防護(How)
 * - 兩層都必須成立才回傳路徑：
 * 1. 形狀檢查：必須是純相對路徑（不開頭 `/`、不含反斜線、不含 `..` 或 NUL）。
 * 2. 包含性檢查：解析後的實體路徑必須仍在 `dist/pagefind/` 之下，確保「檢查的字串」與「實際開檔的值」永遠一致。
 *
 * @param pathname - 已解碼的請求路徑，應以 `/pagefind/` 開頭
 * @returns 安全的實體檔案路徑；任一條件不成立時回傳 `null`
 */
function resolve_pagefind_file(pathname: string): string | null {
  const relative = pathname.slice("/pagefind/".length);

  // 形狀檢查：以 / 開頭者會讓 new URL() 丟掉 base；反斜線是 Windows 分隔符，
  // 在跨平台情境下同樣危險，兩者都必須擋掉。
  if (
    !relative ||
    relative.startsWith("/") ||
    relative.includes("\\") ||
    relative.includes("..") ||
    relative.includes("\0")
  ) {
    return null;
  }

  const file_url = new URL(relative, PAGEFIND_DIST);

  // 包含性檢查：實際要用來讀檔的值必須仍在 dist/pagefind/ 之內。
  // PAGEFIND_DIST 結尾自帶 "/"，所以直接 startsWith 即可，
  // 且天然擋掉 /pagefind-evil/ 這種同前綴的兄弟目錄。
  const dist_root = fileURLToPath(PAGEFIND_DIST);
  if (!fileURLToPath(file_url).startsWith(dist_root)) {
    return null;
  }

  return file_url.pathname;
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

        // 惡意的 percent-escape（例如 /pagefind/%zz）會讓 decodeURIComponent 丟出
        // URIError。production 的 public/server.ts 有 try/catch 擋成 400，
        // dev 這邊也要一致，否則會變成 Vite 產生的 404/500，掩蓋真正的問題。
        let pathname: string;
        try {
          pathname = decodeURIComponent(
            new URL(url, "http://localhost").pathname
          );
        } catch {
          res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Bad Request");
          return;
        }

        const file_path = resolve_pagefind_file(pathname);

        // 400：形狀不合法（有 ../ 或開頭的絕對路徑）
        // 404：形狀合法但檔案不存在
        if (file_path === null) {
          res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Bad Request");
          return;
        }

        try {
          const data = readFileSync(file_path);

          res.writeHead(200, {
            "Content-Type": mime_type_for(pathname),
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
