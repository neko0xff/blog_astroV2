/**
 * @file Benchmark slugify
 *
 * ## 功能 (Who)
 * - 測試文章 slug 產生的效能
 * - 全站 URL、標籤、路由都經過 slugify
 * - 該模組的呼叫次數最多
 * - 純字串轉換，不需要任何權限旗標。
 *
 * ## 範圍（What)
 * - `slugifyStr` 短英文 vs 中文長標題
 * - `slugifyAll` 批次轉換標籤陣列
 *
 * ## 可能遇到的情況條件 (Where)
 * - 空字串
 * - 中文（`lodash.kebabcase` 保留非 ASCII）
 * - 特殊字元
 * - 多空格
 *
 * ## 執行(How)
 * ```bash
 * deno task bench
 * deno bench --unstable-kv --unstable-ffi bench/slugify.bench.ts
 * ```
 *
 */

import { slugifyAll, slugifyStr } from "../src/utils/slugify.ts";

const SHORT_EN = "Hello World";
const ZH_TITLE = "如何針對特定函式和功能進行基準測試範例文章標題";
const TAG_LIST = ["Deno", "My Tag", "系統管理經驗", "windows-16bit", "Astro"];
let sink: string | string[] = "";

Deno.bench({
  name: "[slugify] 短英文(str)",
  group: "slug",
  baseline: true,
  fn: () => {
    sink = slugifyStr(SHORT_EN);
  },
});

Deno.bench({
  name: "[slugify] 中文長標題(str)",
  group: "slug",
  fn: () => {
    sink = slugifyStr(ZH_TITLE);
  },
});

Deno.bench({
  name: "[slugify] 標籤陣列(all)",
  group: "slug",
  fn: () => {
    sink = slugifyAll(TAG_LIST);
  },
});

export { sink };
