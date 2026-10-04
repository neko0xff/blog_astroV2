/**
 * @file 安全標頭附加模組
 *
 * @description 依 5W1H：
 * - What：把 `SECURITY_HEADERS` 寫進每個回應。
 * - Why：CSP、HSTS、X-Frame-Options 等是後端最低限度防線，不能靠前端自覺。
 * - Who：`serve_inner` 與 healthz 回應都透過它。
 * - When：每一個要送給瀏覽器的回應。
 * - Where：`public/server/security.ts`。
 * - How：複製原 `Response.headers`、逐欄 `set`，再用相同 body/status 重包。
 */

import { SECURITY_HEADERS } from "./config.ts";

/**
 * 在回應上附加安全標頭。
 *
 * @description 5W1H：
 * - What：新增 CSP、HSTS、X-Content-Type-Options 等固定欄位。
 * - Why：降低 XSS、點擊劫持、當謬類型混淆風險。
 * - Who：所有回應路徑（200/301/404/405/500、healthz）。
 * - When：回應組好後、送出前。
 * - Where：以 `SECURITY_HEADERS` 常數為單一真相來源。
 * - How：複製 headers、迴圈覆蓋同名欄位、用相同 body/status 建立新 Response。
 *
 * @param response - 原始 Response
 * @returns 附加安全標頭後的新 Response
 */
export function with_security_headers(response: Response): Response {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
