/**
 * Type declarations for remark-collapse v0.1.2
 *
 * remark-collapse is a remark plugin that collapses sections under a heading
 * into a `<details>/<summary>` HTML element.
 */

declare module "remark-collapse" {
  /**
   * Options for the remark-collapse plugin.
   */
  interface RemarkCollapseOptions {
    /**
     * Heading text to match (e.g., "Table of contents").
     * The section under this heading will be collapsed.
     */
    test: string;

    /**
     * Custom summary text or a function that receives the heading text
     * and returns a summary string.
     *
     * Default: `"Open " + headingText`
     */
    summary?: string | ((headingText: string) => string);
  }

  /**
   * A remark plugin that collapses sections under a matching heading
   * into a `<details>` element with a `<summary>`.
   *
   * @param options - Configuration options.
   * @returns A remark transformer function.
   */
  declare function remarkCollapse(
    options: RemarkCollapseOptions,
  ): (node: unknown) => void;

  export default remarkCollapse;
}
