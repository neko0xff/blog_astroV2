// deno-lint-ignore-file
/**
 * @file 鍵盤快捷鍵：按 / 聚焦搜尋
 *
 * @description
 * - What：攔全站 "/" 按鍵。已在 /search/ 就聚焦輸入框，否則跳到搜尋頁並聚焦。
 * - Why：主要讀者是工程師（power user），搜尋不該是滑鼠三步驟（找放大鏡 →
 *   跳頁 → 輸入）。快捷鍵是鍵盤優先工作流的必要基礎設施。
 * - Who：由 Layout.astro 以 is:inline 引入，全站共用。
 * - How：用 sessionStorage 傳遞「跳轉後聚焦」訊號，避免 URL 帶參數被計入
 *   瀏覽紀錄；astro:transitions 換頁靠 astro:page-load 事件捕捉。
 *
 * @note IME 組合中（keyCode 229）不觸發，中文輸入按 "/" 會是選字或標點。
 */

const FOCUS_FLAG = "search-focus";
const SEARCH_PATH = "/search/";

/**
 * 目前聚焦元素是否在等文字輸入（輸入框、textarea、select、contenteditable）。
 * @returns {boolean} true 表示不該攔按鍵
 */
function is_typing_target() {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return false;
  if (active.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);
}

/**
 * 聚焦搜尋頁的輸入框。
 */
function focus_search_input() {
  document.querySelector < HTMLInputElement > ".pagefind-input"?.focus();
}

/**
 * 消費聚焦訊號：非搜尋頁按 / 跳轉過來後，聚焦輸入框並清除訊號。
 */
function consume_focus_flag() {
  if (globalThis.location.pathname !== SEARCH_PATH) {
    sessionStorage.removeItem(FOCUS_FLAG);
    return;
  }
  if (sessionStorage.getItem(FOCUS_FLAG) !== "1") return;
  sessionStorage.removeItem(FOCUS_FLAG);
  focus_search_input();
}

document.addEventListener("keydown", event => {
  if (event.key !== "/") return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  // IME 組字期間按 / 是中文輸入的一部分，不可攔。
  // isComposing 覆蓋大多數瀏覽器；key === "Process" 是部分 IME
  // （如舊版 Chrome 的組字中事件）在組字期間送出的值。
  if (event.isComposing || event.key === "Process") return;
  if (is_typing_target()) return;

  event.preventDefault();
  if (globalThis.location.pathname === SEARCH_PATH) {
    focus_search_input();
    return;
  }
  sessionStorage.setItem(FOCUS_FLAG, "1");
  globalThis.location.assign(SEARCH_PATH);
});

consume_focus_flag();
// astro:transitions 換頁後 astro:page-load 會再次觸發，補上 SPA 式跳轉
document.addEventListener("astro:page-load", consume_focus_flag);
