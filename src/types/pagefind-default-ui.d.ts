/**
 * Type declarations for @pagefind/default-ui v1.5.2
 *
 * @pagefind/default-ui provides a pre-built search UI component
 * that integrates with the Pagefind search index.
 */

declare module "@pagefind/default-ui" {
  /**
   * Configuration options for the PagefindUI instance.
   */
  export interface PagefindUIOptions {
    /**
     * CSS selector or HTMLElement to mount the search UI.
     * This is the only required option.
     */
    element: string | HTMLElement;

    /** Number of results per page before "Load more" (default: 5). */
    pageSize?: number;

    /** Show per-heading sub-results in search results (default: false). */
    showSubResults?: boolean;

    /** Show result thumbnail images (default: true). */
    showImages?: boolean;

    /** Maximum number of words in result excerpts (default: 30). */
    excerptLength?: number;

    /** Debounce delay in milliseconds after the user stops typing (default: 300). */
    debounceTimeoutMs?: number;

    /** Focus the search input on render (default: false). */
    autofocus?: boolean;

    /** Press "/" anywhere on the page to focus the search input (default: false). */
    focusOnSlash?: boolean;

    /** Show filter values with 0 results (default: true). */
    showEmptyFilters?: boolean;

    /** Filter names that should be open by default. */
    openFilters?: string[];

    /** Apply Pagefind CSS reset (default: true). */
    resetStyles?: boolean;

    /** Default sort order, overrides relevance sorting.
     * @example { "date": "desc" }
     */
    sort?: Record<string, "asc" | "desc">;

    /** Custom translation strings for the UI. */
    translations?: Record<string, string>;

    /**
     * Hook to process or normalize the search term before searching.
     * @param term - The raw search term from the input.
     * @returns The processed search term.
     */
    processTerm?: (term: string) => string;

    /**
     * Hook to process or modify each search result before rendering.
     * @param result - The raw search result object.
     * @returns The processed result.
     */
    processResult?: (result: unknown) => unknown;

    /**
     * Override the path to the Pagefind bundle directory.
     * Useful when Pagefind is deployed to a sub-path.
     */
    bundlePath?: string;

    /**
     * Override the base URL for canonical result links.
     */
    baseUrl?: string;
  }

  /**
   * The Pagefind search UI instance.
   */
  export class PagefindUI {
    /**
     * Create a new PagefindUI search component.
     * @param options - Configuration options.
     */
    constructor(options: PagefindUIOptions);

    /**
     * Programmatically trigger a search with the given query.
     * @param query - The search term to execute.
     */
    triggerSearch(query: string): void;

    /**
     * Programmatically set active filters.
     * @param filters - A map of filter names to arrays of active filter values.
     */
    triggerFilters?(filters: Record<string, string[]>): void;

    /**
     * Destroy the search UI instance and clean up event listeners.
     * Useful when re-initializing (e.g., after a language change).
     */
    destroy(): void;
  }
}
