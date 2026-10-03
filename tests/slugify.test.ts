/**
 * @file Unit tests for slugify
 *
 * ## 功能 (who)
 * slugify.ts 中的字串轉換工具
 *
 * ## 範圍（what)
 * - `slugifyStr()`：單一字串轉換（小寫化、連字號）
 * - `slugifyAll()`：字串陣列批次轉換
 *
 * ## 可能遇到的情況條件 (Where)
 * - 中文字元（保留原樣）
 * - 混合中英文（英文轉小寫、中文保留）
 * - 特殊字元（轉為連字號或移除）
 * - 多空格、前後空格、空字串
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env tests/slugify.test.ts
 * ```
 */
import { assertEquals } from "@std/assert";
import { slugifyAll, slugifyStr } from "../src/utils/slugify.ts";

Deno.test("[slugifyStr] basic lowercase", () => {
  assertEquals(slugifyStr("Hello World"), "hello-world");
});

Deno.test("[slugifyStr] Chinese characters", () => {
  assertEquals(slugifyStr("你好世界"), "你好世界");
});

Deno.test("[slugifyStr] mixed Chinese and English", () => {
  assertEquals(slugifyStr("Hello 世界"), "hello-世界");
});

Deno.test("[slugifyStr] special characters converted to hyphen", () => {
  assertEquals(slugifyStr("Hello@#$%World"), "hello-world");
});

Deno.test("[slugifyStr] multiple spaces", () => {
  assertEquals(slugifyStr("a  b   c"), "a-b-c");
});

Deno.test("[slugifyStr] leading/trailing spaces", () => {
  assertEquals(slugifyStr("  hello  "), "hello");
});

Deno.test("[slugifyStr] empty string", () => {
  assertEquals(slugifyStr(""), "");
});

Deno.test("[slugifyAll] array of strings", () => {
  assertEquals(slugifyAll(["Hello World", "Test Case"]), [
    "hello-world",
    "test-case",
  ]);
});

Deno.test("[slugifyAll] empty array", () => {
  assertEquals(slugifyAll([]), []);
});
