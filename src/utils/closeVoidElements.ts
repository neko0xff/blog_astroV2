/**
 * @file SVG void 元素正規化（純函式，可在 Deno 測試中直接驗證）
 * @description
 * 把 HTML void 元素正規化成自封閉形式（`<br>` → `<br/>`），讓 mermaid
 * 產生的 SVG 字串先成為良構 XML，`DOMParser` 的 `image/svg+xml` 解析
 * 就不會失敗（Firefox 會把失敗的解析記一筆 console 錯誤）。
 *
 * @architecture
 * - 本模組不依賴任何 DOM API，可被 `deno test` 直接 import。
 * - 執行期由 `src/scripts/mermaid-lazy.ts` 的 `parse_svg_root()` 呼叫，
 *   跑在 `sanitize()` 之前，不影響後續清洗。
 */

/**
 * Mermaid 輸出中可能出現的 HTML void 元素。這些元素在 HTML 序列化裡
 * 本來就不用閉合（`<br>` 合法），但放到 `image/svg+xml` 解析器裡
 * 就是「不是良構 XML」。實測 mermaid v12 輸出中出現的是 `<br>`。
 */
const SVG_VOID_ELEMENTS = "br|hr|wbr|img|source|track|embed|col";

/**
 * 匹配未必自封閉的 void 元素開始標籤。屬性部分只吞「引號配對完整」的
 * 屬性或不含 `>"'` 的字元，因此屬性值裡的 `>` 不會被誤判為標籤結尾。
 */
const VOID_TAG_PATTERN = `<(${SVG_VOID_ELEMENTS})\\b((?:"[^"]*"|'[^']*'|[^>"'])*)>`;
const VOID_ELEMENT_RE = new RegExp(VOID_TAG_PATTERN, "gi");

/**
 * 把 void 元素正規化成自封閉形式。
 *
 * 為什麼需要：mermaid 會把標籤換行輸出成 foreignObject 內的 `<br>`
 * （未閉合），嚴格的 `image/svg+xml` 解析會直接丟錯。已經自封閉的
 * （`<br/>`、`<br />`）原樣保留；`<br>` 與 `<br/>` 是同一個元素，
 * 只是序列化形式不同，不引入新語義。
 *
 * @param svg - Mermaid 產生的 SVG 字串
 * @returns 正規化後的字串
 */
export function close_void_elements(svg: string): string {
  return svg.replace(VOID_ELEMENT_RE, (match, tag: string, attrs: string) =>
    attrs.trimEnd().endsWith("/") ? match : `<${tag}${attrs}/>`
  );
}
