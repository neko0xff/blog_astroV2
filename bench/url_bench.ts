/**
 * @file Benchmark URL Parsing
 *
 * ## 功能 (Who)
 * 測試 URL 字串解析為 URL 物件的效能
 *
 * ## 範圍（What)
 * - `new URL(source)`：將 URL 字串解析為 URL 物件
 *
 * ## 可能遇到的情況條件 (Where)
 * - URL 字串格式錯誤（無效的 URL 語法）
 * - 特殊字元處理（如連續的雙斜線 `//`）
 *
 * ## 執行(How)
 * ```bash
 * deno bench -A --unstable-kv --unstable-ffi bench/url_bench.ts
 * ```
 */

Deno.bench("[Task 1] URL Parsing", () => {
  const source = "https://dev-blog.nekolab.deno.net//";

  new URL(source);
});
