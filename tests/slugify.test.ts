/**
 * 測試：slug 轉換工具函式（slugifyStr 與 slugifyAll）的功能性與邊界條件
 */
import { assertEquals } from "@std/assert";
import { slugifyStr, slugifyAll } from "../src/utils/slugify.ts";

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
