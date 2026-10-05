/**
 * @file Benchmark escape_html
 *
 * ## 功能 (Who)
 * - 測試 Mermaid 語法 HTML 跳脫的效能
 *
 * ## 範圍（What)
 * - 短字串 vs 長 mermaid 原始碼（含大量 `<`、`>`、`&`）
 * - 建置期每篇含 mermaid 的文章都跑一次
 *
 * ## 可能遇到的情況條件 (Where)
 * - 無特殊字元的字串（regex 直接略過）
 * - `"` `'` 引號
 *
 * ## 執行(How)
 * ```bash
 * deno task bench
 * deno bench --unstable-kv --unstable-ffi bench/escapeHtml.bench.ts
 * ```
 *
 * 純字串轉換，不需要任何權限旗標。
 */

import { escape_html } from "../src/utils/mermaid-remark.ts";

const SHORT_TEXT = "graph TD; A-->B;";
const LONG_MERMAID = "graph TD;\n" +
  "  A[開始 <init>] --> B{判斷 x > 0 & y < 10};\n".repeat(20) +
  '  B -->|"a & b"| C["輸出 <result>"];\n'.repeat(20) +
  "  C --> D['結束'];\n".repeat(10);
let sink = "";

Deno.bench({
  name: "[escape_html] 短字串",
  group: "escape-html",
  baseline: true,
  fn: () => {
    sink = escape_html(SHORT_TEXT);
  },
});

Deno.bench({
  name: "[escape_html] 長 mermaid",
  group: "escape-html",
  fn: () => {
    sink = escape_html(LONG_MERMAID);
  },
});

export { sink };
