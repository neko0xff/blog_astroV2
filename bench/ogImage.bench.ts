/**
 * @file Benchmark ogImage
 *
 * ## 功能 (Who)
 * - 比較 OG 圖管線各段成本：
 * 1. satori 短／長標題
 * 2. 站點模板
 * 3. Resvg 転換成 PNG
 *
 * ## 範圍（What)
 * - satori： 文章短英文標題（baseline）vs 長中文標題 vs 站點模板
 * - Resvg： SVG 転換成 PNG（沿用一篇短標題 SVG，不重複渲染）
 *
 * ## 可能遇到的情況條件 (Where)
 * - 字型在 bench 外一次下載（網路只影響準備階段，不計入迭代）
 * - Resvg 是 NAPI 模組，需 `-A`（`deno task bench` 已含）
 * - 回傳值寫入 sink，避免被引擎優化掉
 *
 * ## 執行(How)
 * ```bash
 * deno task bench
 * deno bench -A --unstable-kv --unstable-ffi bench/ogImage.bench.ts
 * ```
 */

import { Resvg } from "@resvg/resvg-js";
import type { CollectionEntry } from "astro:content";
import post_og_image from "../src/utils/og-templates/post.ts";
import site_og_image from "../src/utils/og-templates/site.ts";

const SHORT_POST = {
  data: { title: "Hello World", author: "neko0xff" },
} as unknown as CollectionEntry<"blog">;
const LONG_POST = {
  data: {
    title: "如何針對特定函式和功能進行基準測試範例文章標題",
    author: "neko0xff",
  },
} as unknown as CollectionEntry<"blog">;

/** 短標題 SVG 只算一次，供 Resvg 組使用（不把 satori 成本算進 PNG 組）。 */
const SHORT_SVG = await post_og_image(SHORT_POST);

let sink = 0;

Deno.bench({
  name: "[OG] satori 短英文標題",
  group: "og-render",
  baseline: true,
  fn: async () => {
    sink = (await post_og_image(SHORT_POST)).length;
  },
});

Deno.bench({
  name: "[OG] satori 長中文標題",
  group: "og-render",
  fn: async () => {
    sink = (await post_og_image(LONG_POST)).length;
  },
});

Deno.bench({
  name: "[OG] satori 站點模板",
  group: "og-render",
  fn: async () => {
    sink = (await site_og_image()).length;
  },
});

Deno.bench({
  name: "[OG] resvg SVG 轉 PNG",
  group: "og-render",
  fn: () => {
    sink = new Resvg(SHORT_SVG).render().asPng().length;
  },
});

export { sink };
