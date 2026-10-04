/**
 * @file Benchmark close_void_elements
 *
 * ## 功能 (Who)
 * 測試 SVG void 元素正規化的 regex 效能（mermaid 輸出的 `<br>` 需轉自封閉，
 * 否則 `image/svg+xml` 解析失敗）
 *
 * ## 範圍（What)
 * - 含未閉合 `<br>` vs 已自封閉 vs 無 void 元素（regex 走空）
 *
 * ## 可能遇到的情況條件 (Where)
 * - 屬性值含 `>`（不得誤判為標籤結尾）、`<br />` 空格形式
 *
 * ## 執行(How)
 * ```bash
 * deno task bench
 * deno bench --unstable-kv --unstable-ffi bench/closeVoidElements.bench.ts
 * ```
 *
 * 純字串轉換，不需要任何權限旗標。
 */

import { close_void_elements } from "../src/utils/closeVoidElements.ts";

const SVG_WITH_BR =
  `<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><div>第一行<br>第二行<br>第三行</div></foreignObject></svg>`;
const SVG_SELF_CLOSED =
  `<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><div>第一行<br/>第二行<br /></div></foreignObject></svg>`;
const SVG_NO_VOID =
  `<svg xmlns="http://www.w3.org/2000/svg"><g><rect width="10" height="10"/><text>label</text></g></svg>`;
let sink = "";

Deno.bench({
  name: "[close_void] 含未閉合 br",
  group: "close-void",
  baseline: true,
  fn: () => {
    sink = close_void_elements(SVG_WITH_BR);
  },
});

Deno.bench({
  name: "[close_void] 已自封閉",
  group: "close-void",
  fn: () => {
    sink = close_void_elements(SVG_SELF_CLOSED);
  },
});

Deno.bench({
  name: "[close_void] 無 void 元素",
  group: "close-void",
  fn: () => {
    sink = close_void_elements(SVG_NO_VOID);
  },
});

export { sink };
