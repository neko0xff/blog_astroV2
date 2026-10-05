/**
 * Pagefind 搜尋片段 tokenizer（瀏覽器與 Deno 測試共用）
 *
 * 刻意零依賴、不碰 DOM 與 `import.meta.env`：
 * 1. `src/utils/` 下的模組會被 Deno 測試直接 import，任何瀏覽器全域都不能出現在模組頂層。
 * 2. 真正的 DOM 組裝留在 `pageFindSearch.ts`，這裡只做純字串切割。
 */

/**
 * 搜尋結果片段的純資料 token（不依賴 DOM，可被 Deno 單元測試直接引用）。
 */
export type SearchMarkupToken = {
  /** 文字內容（已去除標籤、已解碼常見實體） */
  text: string;
  /** 是否位於 `<mark>` 高亮區內 */
  mark: boolean;
};

/**
 * 把 Pagefind 回傳的 HTML 片段切成純文字 token，只保留 `<mark>` 語意。
 *
 * 為什麼不用 DOMParser：
 * - Deno 測試環境沒有 DOMParser，且 Pagefind 片段只含文字與 `<mark>`，手寫掃描器足以處理
 * - 其餘標籤一律視為普通容器（只取其文字，不建立元素），`<script>` 等惡意標籤因此無法產生元素。
 *
 * @param value - Pagefind 回傳的 HTML 片段
 * @returns 文字 token 陣列（空字串片段會被捨去）
 */
export function tokenize_search_markup(value: string): SearchMarkupToken[] {
  const tokens: SearchMarkupToken[] = [];
  let buf = "";
  let mark_depth = 0;

  const flush = () => {
    if (buf) {
      tokens.push({ text: decode_search_entities(buf), mark: mark_depth > 0 });
      buf = "";
    }
  };

  let i = 0;
  while (i < value.length) {
    if (value[i] === "<") {
      const end = value.indexOf(">", i + 1);
      if (end === -1) {
        buf += value.slice(i);
        break;
      }
      const tag = value
        .slice(i + 1, end)
        .trim()
        .toLowerCase();
      flush();
      if (tag === "mark") mark_depth += 1;
      else if (tag === "/mark" && mark_depth > 0) mark_depth -= 1;
      // 其餘標籤（含 script/img/a）：捨去標籤本身，內容文字會在後續累積
      i = end + 1;
    } else {
      buf += value[i];
      i += 1;
    }
  }
  flush();
  return tokens;
}

/**
 * 解碼 Pagefind 片段常見的 HTML 實體（避免 `<mark>` 內出現 `&lt;` 這類殘留）
 *
 * @param text - 含實體的文字
 * @returns 解碼後的文字
 */
function decode_search_entities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}
