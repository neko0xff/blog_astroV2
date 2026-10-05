/**
 * @file Unit tests for handler
 *
 * ## 功能 (who)
 * - 靜態伺服器請求處理：
 * 1. 轉址優先
 * 2. query 保留
 * 3. 非 ASCII Location 編碼
 * 4. 壞路徑 400
 * 5. 自訂 404
 * 6. 預壓縮變體
 * 7. 服務健康檢查
 *
 * ## 範圍（what)
 * - `serve_inner`：301＋query、encodeURI、400、404 頁、200 安全標頭、gzip 變體
 * - `create_handler`：`/healthz` 200＋no-store
 *
 * ## 可能遇到的情況條件 (Where)
 * - temp fs_root fixture（需 `--allow-write` 建檔）
 * - Deno.ServeHandlerInfo 以最小 mock 代入
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-write --allow-env tests/handler.test.ts
 * ```
 */

import { assertEquals } from "@std/assert";
import { create_handler, serve_inner } from "../public/server/handler.ts";
import type { ServerContext } from "../public/server/handler.ts";

/**
 * 建 temp 站點：index.html、page.html（＋.gz 變體）、404.html。
 *
 * @returns 運行期上下文與站點根目錄
 */
async function make_ctx(): Promise<{ ctx: ServerContext; root: string }> {
  const root = await Deno.makeTempDir({ prefix: "handler-" });
  await Deno.writeTextFile(`${root}/index.html`, "<h1>home</h1>");
  await Deno.writeTextFile(`${root}/page.html`, "<h1>page</h1>");
  await Deno.writeTextFile(`${root}/page.html.gz`, "fake-gzip-bytes");
  await Deno.writeTextFile(`${root}/404.html`, "custom-404");
  const ctx: ServerContext = {
    redirects: new Map([
      ["/old", "/new-post"],
      ["/old/", "/new-post/"],
      ["/舊路徑", "/新文章"],
    ]),
    not_found_page: `${root}/404.html`,
    fs_root: root,
    log_format: "text",
  };
  return { ctx, root };
}

/**
 * 建最小 serve info mock（只用到 remoteAddr）。
 */
function make_info() {
  return {
    remoteAddr: { transport: "tcp", hostname: "127.0.0.1", port: 1234 },
  } as unknown as Deno.ServeHandlerInfo;
}

Deno.test("[handler] redirect wins with query preserved", async () => {
  const { ctx } = await make_ctx();
  const res = await serve_inner(new Request("http://x/old?utm=a"), ctx);
  assertEquals(res.status, 301);
  assertEquals(res.headers.get("Location"), "/new-post?utm=a");
  assertEquals(res.headers.get("Cache-Control"), "no-cache");
});

Deno.test("[handler] redirect Location is ASCII-safe", async () => {
  const { ctx } = await make_ctx();
  const res = await serve_inner(new Request("http://x/舊路徑"), ctx);
  assertEquals(res.status, 301);
  const location = res.headers.get("Location") ?? "";
  // 非 ASCII 必須被 encodeURI 編碼，否則 Response 建構會拋錯
  assertEquals(location, encodeURI("/新文章"));
  // 純 ASCII 字串的 UTF-8 位元組數等於字元數；含非 ASCII 則否
  assertEquals(new TextEncoder().encode(location).length, location.length);
});

Deno.test("[handler] bad percent-encoding returns 400", async () => {
  const { ctx } = await make_ctx();
  const res = await serve_inner(new Request("http://x/%E0%A4%A"), ctx);
  assertEquals(res.status, 400);
});

Deno.test("[handler] missing file serves custom 404 with security headers", async () => {
  const { ctx } = await make_ctx();
  const res = await serve_inner(new Request("http://x/nope"), ctx);
  assertEquals(res.status, 404);
  assertEquals(await res.text(), "custom-404");
  assertEquals(res.headers.get("X-Frame-Options"), "DENY");
});

Deno.test("[handler] static file carries security and cache headers", async () => {
  const { ctx } = await make_ctx();
  const res = await serve_inner(new Request("http://x/page.html"), ctx);
  assertEquals(res.status, 200);
  assertEquals(
    (res.headers.get("Content-Security-Policy") ?? "").includes("default-src"),
    true,
  );
  assertEquals(res.headers.get("Cache-Control"), "no-cache");
});

Deno.test("[handler] gzip variant negotiated", async () => {
  const { ctx } = await make_ctx();
  const res = await serve_inner(
    new Request("http://x/page.html", {
      headers: { "Accept-Encoding": "gzip" },
    }),
    ctx,
  );
  assertEquals(res.status, 200);
  assertEquals(res.headers.get("Content-Encoding"), "gzip");
});

Deno.test("[handler] healthz returns ok without store", async () => {
  const { ctx } = await make_ctx();
  const handler = create_handler(ctx);
  // access log 會寫 stdout：測試時靜音
  const original = console.log;
  console.log = () => {};
  try {
    const res = await handler(new Request("http://x/healthz"), make_info());
    assertEquals(res.status, 200);
    assertEquals(await res.text(), "ok");
    assertEquals(res.headers.get("Cache-Control"), "no-store");
  } finally {
    console.log = original;
  }
});
