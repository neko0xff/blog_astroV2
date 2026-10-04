/**
 * @file 請求處理模組
 *
 * @description
 * - What：靜態檔案服務（內層 serve_inner）＋ access log 包裝（外層 create_handler）。
 * - Why：把「業務邏輯」與「日誌/健康檢查」分層，便於測試與維運。
 * - Who：`public/server.ts` 啟動時以 `create_handler(ctx)` 建立 handler。
 * - When：每次 HTTP 請求進來。
 * - Where：`public/server/handler.ts`。
 * - How：
 *   1. 先處理轉址與健康檢查
 *   2. 再找檔、協商壓縮、補安全/快取欄位
 *   3. 最後用 ctx 統一 logging。
 */

import { serveFile } from "@std/http/file-server";
import { contentType } from "@std/media-types";
import { extname } from "@std/path";
import { COMPRESSIBLE_EXT_RE, HEALTH_PATH, NO_CACHE } from "./config.ts";
import type { LogFormat } from "./config.ts";
import { cache_control_for } from "./cache.ts";
import { pick_variant } from "./compression.ts";
import { file_exists, resolve_file } from "./fs.ts";
import {
  client_ip,
  format_timestamp,
  log_access,
  sanitize_log_value,
} from "./logging.ts";
import type { AccessEntry } from "./logging.ts";
import { with_security_headers } from "./security.ts";

/**
 * `serve_inner` 與外層 handler 共用的運行期上下文。
 *
 * @description 5W1H：
 * - What：裝著 redirects、404 頁、根目錄、log 格式的設定包。
 * - Why：讓內層與外層共用同一份設定，避免每個函式都各自讀環境變數。
 * - Who：`public/server.ts` 建立一份後傳給 `serve_inner` 與 `create_handler`。
 * - When：進程啟動一次組好，之後唯讀。
 * - Where：物件欄位對應 fs_root、not_found_page、redirects、log_format。
 * - How：純資料結構，無副作用。
 */
export type ServerContext = {
  /** `_redirects` 載入的轉址表 */
  redirects: Map<string, string>;
  /** 404 頁的絕對路徑 */
  not_found_page: string;
  /** 網站根目錄的絕對路徑 */
  fs_root: string;
  /** access log 輸出格式 */
  log_format: LogFormat;
};

/**
 * 實際的靜態檔案服務邏輯。
 *
 * @description 依 5W1H：
 * - What：把請求對應到實體檔案並回應，或回轉址/404/405/500。
 * - Why：這是站點的主流程，必須可預期、可除錯。
 * - Who：外層 `create_handler` 呼叫。
 * - When：非 healthz、要正式處理請求時。
 * - Where：`public/server/handler.ts`。
 * - How：
 *   1. `_redirects` 優先
 *   2.  `resolve_file` 防穿越
 *   3. 找不到走 404 頁
 *   4. 預壓縮變體
 *   5. 補安全/快取標頭
 *
 * @param request - 傳入的 HTTP 請求
 * @param ctx - 運行期上下文
 * @returns 帶安全標頭的 HTTP 回應
 */
export const serve_inner = async (
  request: Request,
  ctx: ServerContext
): Promise<Response> => {
  const url = new URL(request.url);
  const accept_encoding = request.headers.get("accept-encoding");
  let pathname: string;

  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return with_security_headers(new Response("Bad Request", { status: 400 }));
  }

  // Honour _redirects before touching the filesystem so renamed articles keep
  // their old URLs working. Runs first so a redirect wins even if a stale file
  // still sits at the old path.
  const destination = ctx.redirects.get(pathname);
  if (destination) {
    // Carry the query string across so `?utm_source=...` survives the redirect
    const target = url.search
      ? `${destination}?${url.search.slice(1)}`
      : destination;

    // The Location header must be ASCII (ByteString). Paths containing
    // non-ASCII characters, e.g. `/posts/Ansible-安裝&相關設置/`, have to be
    // percent-encoded or the Response constructor throws and the request 500s.
    const location = encodeURI(target);

    return with_security_headers(
      new Response(null, {
        status: 301,
        headers: { Location: location, "Cache-Control": NO_CACHE },
      })
    );
  }

  const file_path = resolve_file(pathname, ctx.fs_root);

  if (!file_path || !file_exists(file_path)) {
    if (file_exists(ctx.not_found_page)) {
      const body = await Deno.readFile(ctx.not_found_page);

      return with_security_headers(
        new Response(body, {
          status: 404,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": NO_CACHE,
            "Content-Length": String(body.length),
          },
        })
      );
    }
    return with_security_headers(new Response("Not Found", { status: 404 }));
  }

  try {
    const variant = pick_variant(file_path, accept_encoding);
    const response = await serveFile(request, variant?.path ?? file_path);
    const headers = new Headers(response.headers);

    // `serveFile` 會在檔案不存在或 method 不被允許時提早回傳（405 / 404），那時回傳的 body 是純文字、並沒有套用 variant。
    // 若仍照樣設定 Content-Encoding，客戶端會拿到一個標示為 br 卻無法解碼的 body，而且資產路徑還會被 Cache-Control: public 快取七天。
    // 所以只在「確定有壓縮檔被實際回傳」時才設定 Content-Encoding。
    if (variant && response.status === 200) {
      headers.set("Content-Encoding", variant.encoding);
      headers.set("Vary", "Accept-Encoding");
      headers.set(
        "Content-Type",
        contentType(extname(file_path)) ?? "application/octet-stream"
      );
    } else if (COMPRESSIBLE_EXT_RE.test(file_path)) {
      headers.set("Vary", "Accept-Encoding");
    }

    // RFC 9110 §15.5.6：405 回應 MUST 帶 Allow 標明支援的 method。
    // 實際的 method 政策由 @std/http 決定，所以直接讀回應、不另外硬編一份，
    // 避免與上游實作漂移。
    if (response.status === 405 && !headers.has("allow")) {
      headers.set("Allow", "GET, HEAD");
    }

    headers.set("Cache-Control", cache_control_for(pathname));

    return with_security_headers(
      new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[Website] serving request: ${error}`);

    return with_security_headers(
      new Response("Internal Server Error", { status: 500 })
    );
  }
};

/**
 * 包住 serve_inner 的外層 handler。
 *
 * @description 依 5W1H：
 * - What：量測耗時、輸出 access log、統一錯誤回應。
 * - Why：讓每個請求都留下可追蹤記錄，失敗也有標準 500。
 * - Who：`Deno.serve` 直接使用的 handler。
 * - When：每次 HTTP 請求；healthz 提早回應且不記 log。
 * - Where：`public/server/handler.ts` 的 `create_handler`。
 * - How：先攔 /healthz，再包 serve_inner；catch 後回 500，最後統一寫 access log。
 *
 * @param ctx - 運行期上下文
 * @returns 可直接傳給 `Deno.serve` 的 handler
 */
export function create_handler(
  ctx: ServerContext
): (request: Request, info: Deno.ServeHandlerInfo) => Promise<Response> {
  return async (
    request: Request,
    info: Deno.ServeHandlerInfo
  ): Promise<Response> => {
    const start_ms = Date.now();

    let raw_pathname = "";
    let raw_search = "";
    try {
      const url = new URL(request.url);
      raw_pathname = url.pathname;
      raw_search = url.search;
    } catch {
      // 解析失敗時維持空字串，下方 path 顯示 "-"
    }

    // 健康檢查：給容器 / K8s 探測用，回最小回應且不記 access log
    if (raw_pathname === HEALTH_PATH) {
      return with_security_headers(
        new Response("ok", {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        })
      );
    }

    let response: Response;
    try {
      response = await serve_inner(request, ctx);
    } catch (error) {
      // serve_inner 的 serveFile 區塊已有自己的 catch，這裡只接
      // redirect / 404 頁讀取等外層流程丟出的例外
      // eslint-disable-next-line no-console
      console.error(`[Website] serving request: ${error}`);
      response = with_security_headers(
        new Response("Internal Server Error", { status: 500 })
      );
    }

    const entry: AccessEntry = {
      method: request.method,
      path: raw_pathname ? `${raw_pathname}${raw_search}` : "-",
      status: response.status,
      duration_ms: Date.now() - start_ms,
      bytes: response.headers.get("content-length") ?? "-",
      ip: client_ip(info),
      user_agent: sanitize_log_value(request.headers.get("user-agent") ?? "-"),
      referer: sanitize_log_value(request.headers.get("referer") ?? "-"),
    };
    log_access(format_timestamp(new Date()), entry, ctx.log_format);

    return response;
  };
}
