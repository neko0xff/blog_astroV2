/**
 * @file 轉址規則：啟動時從 `_redirects` 載入（與 staticd 共用同一份檔案）。
 */

/**
 * Reads permanent redirect rules from `_redirects` at startup.
 *
 * The file uses Netlify syntax (`<source> <destination> [status]`), the same
 * format Deno Deploy's staticd reads, so both deployment targets stay in sync
 * from a single source. Only 3xx rules are honoured here; staticd additionally
 * supports rewrites (status 200/404), which this server has no use for.
 * @param file_path - Absolute path of the `_redirects` file
 * @returns A map of request path to redirect destination
 */
export async function load_redirects(
  file_path: string
): Promise<Map<string, string>> {
  const rules = new Map<string, string>();

  let text: string;
  try {
    text = await Deno.readTextFile(file_path);
  } catch {
    // No rules file is a valid state; the site simply has no redirects
    return rules;
  }

  for (const line of text.split("\n")) {
    // Strip comments and surrounding whitespace before splitting on spaces
    const rule = line.split("#")[0].trim();
    if (!rule) continue;

    const parts = rule.split(/\s+/);
    if (parts.length < 2) continue;

    const [source, destination, status] = parts;
    // Only follow explicit redirects; a missing status defaults to 302 in
    // staticd, so treat it the same way here
    const code = Number(status ?? 302);
    if (!Number.isInteger(code) || code < 300 || code > 399) continue;

    rules.set(source, destination);
  }

  return rules;
}
