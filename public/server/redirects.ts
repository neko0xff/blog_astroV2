/**
 * @file 轉址規則載入模組
 *
 * @description
 * - What：啟動時讀 `_redirects` 建立 path → destination 對照表。
 * - Why：讓 Deno Deploy staticd 與本機/容器伺服器用同一份規則行為一致。
 * - Who：入口 `server.ts` 啟動時呼叫一次，結果放入 `ServerContext.redirects`。
 * - When：進程啟動第一次、處理任何請求前。
 * - Where：檔案通常在 `dist/_redirects`。
 * - How：
 *   1. 逐行去註解後 split 欄位，只保留 3xx 規則
 *   2. 缺檔視為空規則表
 */

/**
 * 讀取 `_redirects` 的永久轉址規則。
 *
 * @description
 * - What：回傳 `Map<path, destination>`。
 * - Why：集中管理改名文章的舊網址，避免外部連結與搜尋排名失效。
 * - Who：`server.ts` 啟動時呼叫。
 * - When：app 初始化階段。
 * - Where：讀檔位置由參數決定，通常是 `dist/_redirects`。
 * - How：
 *   * 每行格式 `<source> <destination> [status]`
 *   * 無 status 視為 302
 *   * 非 3xx 略過
 *
 * @param file_path - `_redirects` 的絕對路徑
 * @returns request path → redirect destination 的對照表
 */
export async function load_redirects(
  file_path: string
): Promise<Map<string, string>> {
  const rules = new Map<string, string>();

  let text: string;
  try {
    text = await Deno.readTextFile(file_path);
  } catch {
    // 規則檔不存在屬正常狀態：站點單純沒有轉址。
    return rules;
  }

  for (const line of text.split("\n")) {
    // 先去註解與前後空白，再以空白切欄位。
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
