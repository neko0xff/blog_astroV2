/**
 * 測試： Mermaid 語法在前端進行渲染的情況
 */

import { assertEquals } from "@std/assert";
import { escape_html } from "../src/utils/mermaid-remark.ts";

const DQUOTE = "\u0022";
const DQUOTE_ENTITY = "\u0026" + "quot;";
const AMP_ENTITY = "\u0026" + "amp;";
const LT_ENTITY = "\u0026" + "lt;";
const GT_ENTITY = "\u0026" + "gt;";
const SQ_ENTITY = "\u0026" + "#39;";

Deno.test("[escape_html] basic characters", () => {
  // The function correctly escapes & < > " ' to HTML entities
  assertEquals(escape_html("a & b"), "a " + AMP_ENTITY + " b");
  assertEquals(escape_html("a < b"), "a " + LT_ENTITY + " b");
  assertEquals(escape_html("a > b"), "a " + GT_ENTITY + " b");
  assertEquals(escape_html("a \u0022 b"), "a " + DQUOTE_ENTITY + " b");
  assertEquals(escape_html("a ' b"), "a " + SQ_ENTITY + " b");
});

Deno.test("[escape_html] multiple characters", () => {
  assertEquals(
    escape_html("<script>alert('xss')</script>"),
    LT_ENTITY + "script" + GT_ENTITY + "alert(" + SQ_ENTITY + "xss" + SQ_ENTITY + ")" + LT_ENTITY + "/script" + GT_ENTITY
  );
});

Deno.test("[escape_html] no special characters", () => {
  assertEquals(escape_html("hello world"), "hello world");
});

Deno.test("[escape_html] empty string", () => {
  assertEquals(escape_html(""), "");
});

Deno.test("[escape_html] mermaid diagram syntax", () => {
  const mermaidCode = "graph TD;\n    A[\u0022Input\u0022] ==>|data| B[\u0022Process\u0022];\n    B --> C[\u0022Output\u0022];";
  const result = escape_html(mermaidCode);
  // Should escape the double quotes to "
  assertEquals(result.includes(DQUOTE_ENTITY), true);
  assertEquals(result.includes(DQUOTE), false);
  assertEquals(result.includes("<"), false);
  assertEquals(result.includes(">"), false);
});
