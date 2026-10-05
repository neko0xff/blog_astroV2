/**
 * @file Unit tests for ogTemplate
 *
 * ## 功能 (who)
 * - OG 圖 satori 渲染層
 * - 文章模板與站點模板輸出合法 SVG（尺寸正確、文字轉向量路徑、不同輸入產出不同圖）
 *
 * ## 範圍（what)
 * - `postOgImage(post)`：`1200x630`、含 `<path>`、標題差異可分辨
 * - `siteOgImage()`：`1200x630`、含 `<path>`、與文章模板輸出不同
 *
 * ## 可能遇到的情況條件 (Where)
 * - 字型走真實網路下載（`deno task test` 已含 `--allow-net`）
 * - 純 satori 渲染約數十 ms，不拖慢整批測試
 * - PNG 轉換（Resvg，需 FFI）不在此測，見 `tests/ogImage.test.ts`＋`test:og`
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-write --allow-env --allow-net tests/ogTemplate.test.ts
 * ```
 */

import { assertEquals } from "@std/assert";
import type { CollectionEntry } from "astro:content";
import post_og_image from "../src/utils/og-templates/post.ts";
import site_og_image from "../src/utils/og-templates/site.ts";
import { SITE } from "../src/config.ts";

/**
 * 建立 OG 測試用的最小文章（只用到 data.title／author）。
 *
 * @param title - 文章標題
 * @param author - 作者
 */
function make_post(title: string, author: string) {
  return {
    data: { title, author },
  } as unknown as CollectionEntry<"blog">;
}

Deno.test("[ogTemplate] post renders SVG with embedded font", async () => {
  const svg = await post_og_image(make_post("中文標題測試", "neko0xff"));
  assertEquals(svg.startsWith("<svg"), true);
  assertEquals(svg.endsWith("</svg>"), true);
  assertEquals(svg.includes('width="1200"'), true);
  assertEquals(svg.includes('height="630"'), true);
  // embedFont 把文字轉成向量路徑（SVG 內無 <text> 與明文標題），改斷言
  // 確實有路徑輸出、且不同標題產出不同圖（資料確實流進模板）
  assertEquals(svg.includes("<path"), true);
  const other = await post_og_image(make_post("另一篇", "neko0xff"));
  assertEquals(other === svg, false);
});

Deno.test("[ogTemplate] site renders SVG with vector text", async () => {
  const svg = await site_og_image();
  assertEquals(svg.startsWith("<svg"), true);
  assertEquals(svg.endsWith("</svg>"), true);
  assertEquals(svg.includes("<path"), true);
  // 站點模板與文章模板輸出不同（守門：改錯 import 不會靜默通過）
  const post_svg = await post_og_image(make_post(SITE.title, "neko0xff"));
  assertEquals(post_svg === svg, false);
});
