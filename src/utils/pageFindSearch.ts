interface PagefindResultData {
  url: string;
  excerpt: string;
  plain_excerpt?: string;
  meta: Record<string, string>;
}

interface PagefindResult {
  data(): Promise<PagefindResultData>;
}

interface PagefindSearch {
  results: PagefindResult[];
  total_result_count: number;
}

interface PagefindModule {
  search: (term: string) => Promise<PagefindSearch>;
}

const PARAMS = new URLSearchParams(globalThis.location.search);
const ON_IDLE = globalThis.requestIdleCallback ||
  ((cb: () => void) => setTimeout(cb, 1));
const PAGE_FINDFIND_ENTRY = "/pagefind/pagefind.js";
const MAX_RESULTS = 10;

let pagefind_module: PagefindModule | null = null;

/**
 * 載入 Pagefind 的瀏覽器端 API（首次呼叫時才載入）
 * @returns Pagefind 模組，載入失敗時回傳 null
 */
async function load_pagefind(): Promise<PagefindModule | null> {
  if (pagefind_module) return pagefind_module;
  try {
    pagefind_module = await import(
      /* @vite-ignore */ PAGE_FINDFIND_ENTRY
    ) as PagefindModule;
    return pagefind_module;
  } catch {
    return null;
  }
}

/**
 * 更新網址列與 sessionStorage 的 backUrl，且不重新載入頁面
 * @param term - 目前的搜尋字詞
 * @param back_url - 回上頁的基礎 URL
 */
function update_url(term: string, back_url: string): void {
  if (term) {
    PARAMS.set("q", term);
  } else {
    PARAMS.delete("q");
  }
  const query = PARAMS.toString();
  history.replaceState(
    history.state,
    "",
    query ? `?${query}` : globalThis.location.pathname,
  );
  sessionStorage.setItem("backUrl", back_url + (query ? `?${query}` : ""));
}

/**
 * 建立單筆搜尋結果的元素
 * @param result - Pagefind 回傳的結果資料
 * @returns 包裝結果的 <article> 元素
 */
function create_result_item(result: PagefindResultData): HTMLElement {
  const item = document.createElement("article");
  item.className = "pagefind-result";

  const link = document.createElement("a");
  link.className = "pagefind-result-link";
  link.href = result.url;

  const title = document.createElement("h3");
  title.className = "pagefind-result-title";
  // Pagefind 已對內容做 HTML 跳脫，只會注入 <mark> 標籤，因此可安全使用 innerHTML
  title.innerHTML = result.meta.title ?? result.url;
  link.appendChild(title);

  if (result.excerpt) {
    const excerpt = document.createElement("p");
    excerpt.className = "pagefind-result-excerpt";
    excerpt.innerHTML = result.excerpt;
    link.appendChild(excerpt);
  }

  item.appendChild(link);
  return item;
}

/**
 * 執行搜尋並將結果渲染到結果區塊
 * @param input - 搜尋輸入框
 * @param results_box - 結果容器
 * @param back_url - 回上頁的基礎 URL
 * @param term - 搜尋字詞
 */
async function run_search(
  results_box: HTMLElement,
  back_url: string,
  term: string,
): Promise<void> {
  update_url(term, back_url);

  if (!term.trim()) {
    results_box.replaceChildren();
    return;
  }

  const api = await load_pagefind();
  if (!api) {
    results_box.replaceChildren();
    const notice = document.createElement("p");
    notice.className = "pagefind-empty";
    notice.textContent = "搜尋索引尚未建立，請先執行 deno task pagefind";
    results_box.appendChild(notice);
    return;
  }

  const search = await api.search(term);
  const results = await Promise.all(
    search.results.slice(0, MAX_RESULTS).map((result) => result.data()),
  );

  results_box.replaceChildren();

  if (results.length === 0) {
    const empty = document.createElement("p");
    empty.className = "pagefind-empty";
    empty.textContent = "沒有找到相符的結果";
    results_box.appendChild(empty);
    return;
  }

  for (const result of results) {
    results_box.appendChild(create_result_item(result));
  }
}

/**
 * 初始化搜尋表單並綁定輸入事件
 */
function init_search(): void {
  const container = document.querySelector<HTMLElement>("#pagefind-search");
  if (!container || container.dataset.searchInit === "true") return;
  container.dataset.searchInit = "true";

  const input = container.querySelector<HTMLInputElement>(".pagefind-input");
  const clear_button = container.querySelector<HTMLButtonElement>(
    ".pagefind-clear",
  );
  const results_box = container.querySelector<HTMLElement>(".pagefind-results");
  const back_url = container.dataset.backurl ?? "";
  if (!input || !clear_button || !results_box) return;

  // 網址帶有 q 參數時，直接在空閒時觸發搜尋
  const query = PARAMS.get("q");
  if (query) {
    input.value = query;
    ON_IDLE(() => run_search(results_box, back_url, query));
  }

  let debounce_timer: ReturnType<typeof globalThis.setTimeout> | undefined;
  input.addEventListener("input", () => {
    clear_button.hidden = input.value.trim() === "";
    globalThis.clearTimeout(debounce_timer);
    debounce_timer = globalThis.setTimeout(
      () => run_search(results_box, back_url, input.value),
      200,
    );
  });

  clear_button.addEventListener("click", () => {
    input.value = "";
    clear_button.hidden = true;
    run_search(results_box, back_url, "");
    input.focus();
  });

  // 阻止表單送出造成整頁跳轉，改為直接執行搜尋
  container.querySelector("form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    run_search(results_box, back_url, input.value);
  });
}

// 監聽 Astro View Transitions 切換事件
document.addEventListener("astro:after-swap", () => {
  const container = document.querySelector<HTMLElement>("#pagefind-search");
  if (container && container.dataset.searchInit !== "true") {
    init_search();
  }
});

/* 主程式進入點 */
init_search();

export {};
