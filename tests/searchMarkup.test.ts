/**
 * @file Unit tests for searchMarkup
 *
 * ## 功能 (who)
 * Pagefind 搜尋片段 tokenizer：只保留 <mark> 語意，其餘標籤一律剝除
 *
 * ## 範圍（what)
 * - `tokenize_search_markup(value)`：mark 保留、惡意標籤剝除、實體解碼
 *
 * ## 可能遇到的情況條件 (Where)
 * - script/img/a 注入
 * - 大小寫 MARK
 * - 未閉合標籤
 * - 空字串
 * - 非 ASCII
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env tests/searchMarkup.test.ts
 * ```
 */

import { assertEquals } from "@std/assert";
import { tokenize_search_markup } from "../src/utils/searchMarkup.ts";

Deno.test("[searchMarkup] keeps mark semantics", () => {
  const tokens = tokenize_search_markup("hello <mark>world</mark> end");
  assertEquals(tokens, [
    { text: "hello ", mark: false },
    { text: "world", mark: true },
    { text: " end", mark: false },
  ]);
});

Deno.test("[searchMarkup] strips script tag but keeps text", () => {
  const tokens = tokenize_search_markup(
    '<script>alert("xss")</script>safe',
  );
  // 不得有任何 token 帶有標籤字元殘留的結構資訊：全部攤平成文字
  assertEquals(tokens.map((t) => t.text).join(""), 'alert("xss")safe');
  assertEquals(tokens.every((t) => t.mark === false), true);
});

Deno.test("[searchMarkup] strips img onerror and links", () => {
  const tokens = tokenize_search_markup(
    '<img src=x onerror=alert(1)>pic<a href="https://evil.example">link</a>',
  );
  assertEquals(tokens.map((t) => t.text).join(""), "piclink");
});

Deno.test("[searchMarkup] mark matching is case-insensitive", () => {
  const tokens = tokenize_search_markup("<MARK>Hi</MARK>");
  assertEquals(tokens, [{ text: "Hi", mark: true }]);
});

Deno.test("[searchMarkup] decodes entities and handles empty", () => {
  assertEquals(tokenize_search_markup(""), []);
  const tokens = tokenize_search_markup("a &lt;mark&gt; b &amp; c");
  assertEquals(tokens.map((t) => t.text).join(""), "a <mark> b & c");
});

Deno.test("[searchMarkup] keeps non-ASCII text", () => {
  const tokens = tokenize_search_markup("中文 <mark>搜尋</mark> 測試");
  assertEquals(tokens, [
    { text: "中文 ", mark: false },
    { text: "搜尋", mark: true },
    { text: " 測試", mark: false },
  ]);
});
