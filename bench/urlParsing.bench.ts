/**
 * @file Benchmark URL Parsing
 *
 * ## 功能 (Who)
 * 測試 URL 字串解析為 URL 物件的效能
 *
 * ## 範圍（What)
 * - `new URL` 一般網址 vs 含連續雙斜線 `//` 的網址
 *
 * ## 可能遇到的情況條件 (Where)
 * - URL 字串格式錯誤（無效的 URL 語法會丟出例外，此處只用合法樣本）
 * - 特殊字元處理（如連續的雙斜線 `//`）
 *
 * ## 執行(How)
 * ```bash
 * deno task bench
 * deno bench --unstable-kv --unstable-ffi bench/urlParsing.bench.ts
 * ```
 */

const NORMAL_URL = "https://dev-blog.nekolab.deno.net/posts/example/";
const DOUBLE_SLASH_URL = "https://dev-blog.nekolab.deno.net//posts//example//";
let sink = "";

Deno.bench({
  name: "[URL] `/` ",
  group: "url-parsing",
  baseline: true,
  fn: () => {
    sink = new URL(NORMAL_URL).href;
  },
});

Deno.bench({
  name: "[URL] `//`",
  group: "url-parsing",
  fn: () => {
    sink = new URL(DOUBLE_SLASH_URL).href;
  },
});

export { sink };
