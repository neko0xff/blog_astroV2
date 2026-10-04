/**
 * @file Unit tests for isBlogPost
 *
 * ## 功能 (who)
 * - 判斷 collection entry 是否為一般部落格文章
 * - 排除 about / terms 獨立頁
 *
 * ## 範圍（what)
 * - `isBlogPost(entry)`：一般文章回 true，獨立頁回 false
 *
 * ## 可能遇到的情況條件 (Where)
 * - id 大小寫
 * - 空字串
 * - 近似 id（about-us 不應被排除）
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env tests/isBlogPost.test.ts
 * ```
 */

import { assertEquals } from "@std/assert";
import { isBlogPost } from "../src/utils/isBlogPost.ts";

/**
 * 建立最小 collection entry mock
 *
 * - 只取 isBlogPost 會讀到的 id 欄位
 *
 * 為什麼用 unknown 轉型：
 * 1. 真正的 CollectionEntry 含 render 等方法，
 * 2. 這裡只測 id 比對，不需要完整結構
 *
 * @param id - entry id
 */
function make_entry(id: string) {
  return { id } as unknown as Parameters<typeof isBlogPost>[0];
}

Deno.test("[isBlogPost] normal post returns true", () => {
  assertEquals(isBlogPost(make_entry("my-post")), true);
});

Deno.test("[isBlogPost] about and terms return false", () => {
  assertEquals(isBlogPost(make_entry("about")), false);
  assertEquals(isBlogPost(make_entry("terms")), false);
});

Deno.test("[isBlogPost] similar ids are not excluded", () => {
  assertEquals(isBlogPost(make_entry("about-us")), true);
  assertEquals(isBlogPost(make_entry("terms-en")), true);
  assertEquals(isBlogPost(make_entry("")), true);
});

Deno.test("[isBlogPost] matching is case-sensitive", () => {
  assertEquals(isBlogPost(make_entry("About")), true);
  assertEquals(isBlogPost(make_entry("TERMS")), true);
});
