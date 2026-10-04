/**
 * @file Benchmark getPath
 *
 * ## 功能 (Who)
 * 測試文章路由路徑產生的效能（每篇文章的路由、OG 圖、RSS 都呼叫一次）
 *
 * ## 範圍（What)
 * - 根目錄文章 vs 多層子目錄（含 slugify）vs `_` 開頭目錄（需過濾）
 *
 * ## 可能遇到的情況條件 (Where)
 * - `filePath` 為 undefined（退回只用 id）、id 含 `/` 只取最後一段
 *
 * ## 執行(How)
 * ```bash
 * deno task bench
 * deno bench --unstable-kv --unstable-ffi bench/getPath.bench.ts
 * ```
 *
 * 純字串運算（`getPath` 已與 `astro:content` 解耦，可被 Deno 直接 import），
 * 不需要任何權限旗標。
 */

import { getPath } from "../src/utils/getPath.ts";

const ROOT_ID = "my-post";
const ROOT_FILE = "/src/data/blog/my-post.md";
const NESTED_ID = "my-post";
const NESTED_FILE = "/src/data/blog/My Category/Sub Category/my-post.md";
const UNDERSCORE_FILE = "/src/data/blog/_drafts/my-post.md";
let sink = "";

Deno.bench({
  name: "[getPath] 根目錄文章",
  group: "get-path",
  baseline: true,
  fn: () => {
    sink = getPath(ROOT_ID, ROOT_FILE);
  },
});

Deno.bench({
  name: "[getPath] 多層子目錄",
  group: "get-path",
  fn: () => {
    sink = getPath(NESTED_ID, NESTED_FILE);
  },
});

Deno.bench({
  name: "[getPath] 底線目錄",
  group: "get-path",
  fn: () => {
    sink = getPath(NESTED_ID, UNDERSCORE_FILE);
  },
});

export { sink };
