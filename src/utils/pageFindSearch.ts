const { PagefindUI } = await import("@pagefind/default-ui");
const pageFindSearch: HTMLElement | null =
  document.querySelector("#pagefind-search");
const params = new URLSearchParams(globalThis.location.search);
const onIdle =
  globalThis.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1));

/* Initialize Pagefind search component */
function initSearch(): void {
  // Check if Pagefind search form exists
  if (!pageFindSearch) return;

  // Check if Pagefind is already initialized
  onIdle(async () => {
    const search = new PagefindUI({
      element: "#pagefind-search",
      showSubResults: true,
      showImages: false,
      processTerm: (term: string): string => {
        const backUrl = pageFindSearch?.dataset?.backurl || "";

        // Check if the term is empty
        params.set("q", term); // Update the `q` parameter in the URL
        history.replaceState(history.state, "", "?" + params.toString()); // Push the new URL without reloading
        sessionStorage.setItem("backUrl", backUrl + "?" + params.toString()); // Store the backUrl in sessionStorage

        return term;
      },
    });

    // Check if the search input is empty
    const query = params.get("q");

    // Reset search param if search input is cleared
    const searchInput = document.querySelector<HTMLInputElement>(
      ".pagefind-ui__search-input"
    );
    const clearButton = document.querySelector<HTMLButtonElement>(
      ".pagefind-ui__search-clear"
    );

    // If search param exists (e.g., search?q=astro), trigger search
    if (query) {
      search.triggerSearch(query);
    }

    // If search input is empty, reset the search param
    searchInput?.addEventListener("input", resetSearchParam);
    clearButton?.addEventListener("click", resetSearchParam);

    function resetSearchParam(e: Event): void {
      if ((e.target as HTMLInputElement)?.value.trim() === "") {
        history.replaceState(history.state, "", globalThis.location.pathname);
      }
    }
  });
}

document.addEventListener("astro:after-swap", () => {
  const pageFindSearch = document.querySelector("#pagefind-search");

  // If Pagefind search form already exists, don't initialize search component
  if (pageFindSearch && pageFindSearch.querySelector("form")) return;

  initSearch();
});
