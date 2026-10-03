/**
 * @file Remark 外掛 - Mermaid 程式碼區塊轉換器
 * @description
 * 於建置期（Build-time）解析 AST，將 ```mermaid 程式碼區塊替換為 `<pre class="mermaid">` HTML 元素。
 *
 * @architecture
 * - 建置期：本外掛僅負責 HTML 結構轉譯，不引入任何 Mermaid Runtime。
 * - 執行期：由 `src/scripts/mermaid-lazy.ts` 接管，使用 IntersectionObserver 實現 Viewport Lazy Loading。
 */

/**
 * 繼承/簡化自 MDAST (Markdown Abstract Syntax Tree) 的 Code Node 型別。
 * - 僅保留本外掛進行語法樹轉換時必要的欄位，以降低對完整 mdast 套件的型別依賴。
 */
interface MdastCodeNode {
  type: string;
  lang?: string;
  value?: string;
  position?: { start?: { line?: number } };
}

/**
 * 轉譯 HTML 特殊字元，來避免 mermaid 語法中的 < > & 被瀏覽器誤判為標籤
 * @param text - 需進行轉譯的文字
 * @returns 轉譯後的文字
 */
export function escape_html(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return text.replace(/[&<>"']/g, c => map[c]);
}

/**
 * 遞迴走訪 MDAST 語法樹並處理 Mermaid 節點。
 * - 篩選條件：`node.type === "code"` 且 `node.lang === "mermaid"`
 *
 * @param {Record<string, unknown>} tree - MDAST 節點物件
 * @param {(node: MdastCodeNode) => void} callback - 處理 Mermaid 節點的回呼函數
 */
function walk_code(
  tree: unknown,
  callback: (node: MdastCodeNode) => void
): void {
  if (!tree || typeof tree !== "object") return;
  const node = tree as Record<string, unknown>;

  if (node.type === "code") callback(node as unknown as MdastCodeNode);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk_code(child, callback);
  }
}

/**
 * Mermaid Remark 外掛工廠函式
 * - 建立並回傳 Unified Transformer。
 * - Transformer 會將 Markdown AST 中所有 Mermaid 程式碼區塊（Code Node）
 *   皆轉換為 `<pre class="mermaid">` HTML 節點，後續交由 Rehype 管線原樣輸出為 HTML DOM。
 *
 * @returns Unified Transformer 處理函式
 */
export function mermaid_remark() {
  function transformer(tree: unknown) {
    walk_code(tree, node => {
      if (node.lang === "mermaid") {
        node.type = "html";
        node.value = `<pre class="mermaid">${escape_html(node.value ?? "")}</pre>`;
      }
    });
  }
  return transformer;
}

export default mermaid_remark;
