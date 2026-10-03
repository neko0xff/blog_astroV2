/**
 * @file Unit tests for closeVoidElements
 *
 * ## 功能 (who)
 * closeVoidElements.ts 中的 SVG void 元素正規化邏輯
 *
 * ## 範圍（what)
 * - `close_void_elements(svg)`：把未閉合的 void 元素轉成自封閉形式
 *
 * ## 可能遇到的情況條件 (Where)
 * - 未閉合的 `<br>`（mermaid v12 實際輸出形狀）
 * - 已自封閉的 `<br/>`、`<br />`（必須原樣保留）
 * - 大寫標籤、帶屬性、屬性值內含 `>`
 * - 非 void 元素、跳脫文字、空字串（必須原樣保留）
 * - 冪等性：處理兩次，第二次必須是 no-op
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env tests/closeVoidElements.test.ts
 * ```
 */
import { assertEquals } from "@std/assert";
import { close_void_elements } from "../src/utils/closeVoidElements.ts";

Deno.test("[close_void_elements] bare br from mermaid output", () => {
  assertEquals(close_void_elements("<br>"), "<br/>");
  assertEquals(
    close_void_elements("<p>DNS 服務<br>AD 整合區域</p>"),
    "<p>DNS 服務<br/>AD 整合區域</p>",
  );
});

Deno.test("[close_void_elements] realistic foreignObject snippet", () => {
  const input = '<foreignObject><div xmlns="http://www.w3.org/1999/xhtml">' +
    "<p>時間同步<br>w32tm /resync</p></div></foreignObject>";
  const expected = '<foreignObject><div xmlns="http://www.w3.org/1999/xhtml">' +
    "<p>時間同步<br/>w32tm /resync</p></div></foreignObject>";
  assertEquals(close_void_elements(input), expected);
});

Deno.test("[close_void_elements] already closed tags stay untouched", () => {
  assertEquals(close_void_elements("<br/>"), "<br/>");
  assertEquals(close_void_elements("<br />"), "<br />");
  assertEquals(close_void_elements("<BR/>"), "<BR/>");
});

Deno.test("[close_void_elements] case and attributes", () => {
  assertEquals(close_void_elements("<BR>"), "<BR/>");
  assertEquals(
    close_void_elements('<br class="node-break">'),
    '<br class="node-break"/>',
  );
  // 屬性值裡的 `>` 不可被誤判為標籤結尾
  assertEquals(
    close_void_elements('<div title="a > b"><br></div>'),
    '<div title="a > b"><br/></div>',
  );
});

Deno.test("[close_void_elements] other void elements", () => {
  assertEquals(close_void_elements("<hr>"), "<hr/>");
  assertEquals(close_void_elements('<img src="x.png">'), '<img src="x.png"/>');
});

Deno.test("[close_void_elements] non-void content stays untouched", () => {
  assertEquals(close_void_elements("<brick>"), "<brick>");
  assertEquals(close_void_elements("<div>text</div>"), "<div>text</div>");
  assertEquals(close_void_elements("a &lt;br&gt; b"), "a &lt;br&gt; b");
  assertEquals(close_void_elements(""), "");
  assertEquals(close_void_elements("hello world"), "hello world");
});

Deno.test("[close_void_elements] idempotent and byte-exact", () => {
  const input = "<p>a<br>b<br/>c<br />d</p>";
  const once = close_void_elements(input);
  assertEquals(once, "<p>a<br/>b<br/>c<br />d</p>");
  // 第二次處理必須是 no-op
  assertEquals(close_void_elements(once), once);
  // 除了補上的 `/`，不可增減任何位元組
  assertEquals(once.length - input.length, 1);
});
