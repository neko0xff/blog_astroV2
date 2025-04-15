function initSearch() {
    const pageFindSearch: HTMLElement | null =
      document.querySelector("#pagefind-search");

    if (!pageFindSearch) return;

    const params = new URLSearchParams(window.location.search);

    const onIdle = window.requestIdleCallback || (cb => setTimeout(cb, 1));

    onIdle(async () => {
      // @ts-expect-error — Missing types for @pagefind/default-ui package.
      const { PagefindUI } = await import("@pagefind/default-ui");

      // Display warning inn dev mode
      if (import.meta.env.DEV) {
        pageFindSearch.innerHTML = `
            <div class="bg-muted/75 rounded p-4 space-y-4 mb-4">
              <p><strong>DEV mode Warning! </strong>You need to build the project at least once to see the search results during development.</p>
              <code class="block bg-black text-white px-2 py-1 rounded">deno task build</code>
            </div>
          `;
      }

      // Init pagefind ui
      const search = new PagefindUI({
        element: "#pagefind-search",
        showSubResults: true,
        showImages: false,
        processTerm: function (term: string) {
          params.set("q", term); // Update the `q` parameter in the URL
          history.replaceState(history.state, "", "?" + params.toString()); // Push the new URL without reloading

          const backUrl = pageFindSearch?.dataset?.backurl;
          sessionStorage.setItem("backUrl", backUrl + "?" + params.toString());

          return term;
        },
      });

      // If search param exists (eg: search?q=astro), trigger search
      const query = params.get("q");
      if (query) {
        search.triggerSearch(query);
      }

      // Reset search param if search input is cleared
      const searchInput = document.querySelector(".pagefind-ui__search-input");
      const clearButton = document.querySelector(".pagefind-ui__search-clear");
      searchInput?.addEventListener("input", resetSearchParam);
      clearButton?.addEventListener("click", resetSearchParam);

      function resetSearchParam(e: Event) {
        if ((e.target as HTMLInputElement)?.value.trim() === "") {
          history.replaceState(history.state, "", window.location.pathname);
        }
      }
    });
  }

  document.addEventListener("astro:after-swap", () => {
    const pagefindSearch = document.querySelector("#pagefind-search");

    // if pagefind search form already exists, don't initialize search component
    if (pagefindSearch && pagefindSearch.querySelector("form")) return;

    initSearch();
});

// init service
initSearch();

