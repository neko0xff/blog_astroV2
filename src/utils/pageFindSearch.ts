const { PagefindUI } = await import("@pagefind/default-ui");
const PARAMS = new URLSearchParams(globalThis.location.search);
const ON_IDLE =
  globalThis.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1));

/**
 * 初始化 Pagefind 搜尋組件
 * 確保在 Astro View Transitions 之下能動態獲取最新的 DOM 節點
 */
function init_search() {
  const page_find_search =
    document.querySelector<HTMLElement>("#pagefind-search");

  // 檢查 Pagefind 搜尋表單是否存在
  if (!page_find_search) return;

  // 確保在瀏覽器空閒時初始化
  ON_IDLE(() => {
    const search = new PagefindUI({
      element: "#pagefind-search",
      showSubResults: true,
      showImages: false,
      processTerm: (term: string): string => {
        const back_url = page_find_search?.dataset?.backurl || "";

        // 更新網址參數且不刷新頁面
        PARAMS.set("q", term);
        history.replaceState(history.state, "", "?" + PARAMS.toString());
        sessionStorage.setItem("backUrl", back_url + "?" + PARAMS.toString());

        return term;
      },
    });

    const query = PARAMS.get("q");

    const search_input = document.querySelector<HTMLInputElement>(
      ".pagefind-ui__search-input"
    );
    const clear_button = document.querySelector<HTMLButtonElement>(
      ".pagefind-ui__search-clear"
    );

    // 如果網址帶有參數，觸發搜尋
    if (query) {
      search.triggerSearch(query);
    }

    // 當搜尋欄被清空時，重設 URL 參數
    search_input?.addEventListener("input", reset_search_param);
    clear_button?.addEventListener("click", reset_search_param);

    function reset_search_param(e: Event): void {
      if ((e.target as HTMLInputElement)?.value.trim() === "") {
        history.replaceState(history.state, "", globalThis.location.pathname);
      }
    }
  });
}

// 監聽 Astro View Transitions 切換事件
document.addEventListener("astro:after-swap", () => {
  const page_find_search = document.querySelector("#pagefind-search");

  // 如果新頁面上有搜尋框，且尚未初始化（沒有內含 form 元素），則初始化
  if (page_find_search && !page_find_search.querySelector("form")) {
    init_search();
  }
});

/* 主程式進入點 */
init_search();

export {};
