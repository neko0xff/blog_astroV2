/**
 * @file 預壓縮變體選擇模組
 *
 * @description
 * - What（做什麼）：從磁碟上的 `.br` / `.gz` 預壓縮檔中挑最適合的版本。
 * - Why（為什麼）：靜態站已預先壓縮，傳輸壓縮版本比即時壓縮省 CPU、降延遲。
 * - Who（誰用）：`handler.ts` 的 `serve_inner` 在送出檔案前呼叫。
 * - When（何時）：每次回應靜態檔案且請求帶 `Accept-Encoding` 時。
 * - Where（在何處）：`public/server/compression.ts`。
 * - How（怎麼做）：先解析 RFC 9110 的 content coding 語意，再依 br > gzip 優序挑現存變體。
 *   細節語意見 `acceptable_codings` 註解。
 */

import { COMPRESSED_VARIANTS } from "./config.ts";
import { file_exists } from "./fs.ts";

/**
 * 解析 `Accept-Encoding` 為可用的 coding 集合。
 *
 * @description
 * - What：把原始標頭解析成「客戶端可接受的 coding 名稱集合」。
 * - Why：
 *   * 舊版用子字串比對會誤判，例如 `gzip;q=0` 明確拒絕仍被接受、`xbr` / `gzippy` 因含 `br`/`gzip` 字元被誤收為接受
 *   * 必須嚴格照 RFC 9110 §12.5.3
 * - Who：`pick_variant` 與未來需要協商內容編碼的地方呼叫。
 * - When：每次有請求要決定是否回傳預壓縮檔。
 * - Where：本函式的純字串解析邏輯。
 * - How：逐段拆 `,` 與 `;q=`；`q>0` 或被 `q>0` 的 `*` 涵蓋才算可接受；q 解析失敗視為拒絕。
 *
 * @param header - 原始 Accept-Encoding 標頭值
 * @returns 客戶端以 q > 0 接受的 coding 名稱集合
 */
export function acceptable_codings(header: string): Set<string> {
  const explicit = new Map<string, number>();
  // RFC 9110 §12.5.3：
  // 1. 未明列的 coding、且沒有 `*` 萬用字元時，預設就是不可接受
  // 2. 若萬用字元預設改為 1，`xbr`、`deflate` 會被誤判。
  let wildcard = 0;

  for (const part of header.split(",")) {
    const [raw_name, ...params] = part.trim().split(";");
    // coding 名稱不區分大小寫（RFC 9110 §8.4.1）
    const name = raw_name.trim().toLowerCase();
    if (!name) continue;

    let q = 1;
    for (const param of params) {
      const [key, value] = param.split("=").map(s => s.trim());
      // q > 0 才算明確接受
      // 0（明確拒絕）與 1（預設）無法區分，但參數未明給時視為 1，依 RFC 是可接受的。
      if (key?.toLowerCase() === "q") {
        const parsed = Number.parseFloat(value ?? "");
        // q 值解析失敗時視為拒絕（fail-closed）：寧可少給壓縮，也不要給錯的。
        q = Number.isNaN(parsed) ? 0 : parsed;
      }
    }

    if (name === "*") wildcard = q;
    else explicit.set(name, q);
  }

  const accepted = new Set<string>();
  for (const [name, q] of explicit) {
    if (q > 0) accepted.add(name);
  }
  // 萬用字元只補上「沒有被明列」的 coding
  // 明列者（含 q=0）以明列為準。
  if (wildcard > 0) {
    for (const { encoding } of COMPRESSED_VARIANTS) {
      if (!explicit.has(encoding)) accepted.add(encoding);
    }
  }
  return accepted;
}

/**
 * 從 Accept-Encoding 與磁碟現存檔挑選預壓縮版本。
 *
 * @description
 * - What：回傳「客戶端可接受且磁碟存在」的預壓縮變體路徑與編碼。
 * - Why：避免送出客戶端無法解碼、或實際不存在的編碼檔案。
 * - Who：`serve_inner` 組回應時呼叫。
 * - When：每次決定以 `.br`/`.gz` 上線傳輸前。
 * - Where：以 `COMPRESSED_VARIANTS` 順序（br > gzip）掃檔。
 * - How：逐一檢查 `*.br`、`*.gz` 是否存在且在 `acceptable_codings` 集合內，命中就用。
 *
 * @param file_path - 未壓縮原檔的絕對路徑
 * @param accept_encoding - 請求的 Accept-Encoding 標頭（可為 null）
 * @returns 變體檔案路徑與編碼；找不到可用變體時回傳 null
 */
export function pick_variant(
  file_path: string,
  accept_encoding: string | null
): { path: string; encoding: "br" | "gzip" } | null {
  if (!accept_encoding) return null;

  const acceptable = acceptable_codings(accept_encoding);

  for (const { encoding, ext } of COMPRESSED_VARIANTS) {
    if (acceptable.has(encoding) && file_exists(`${file_path}${ext}`)) {
      return { path: `${file_path}${ext}`, encoding };
    }
  }

  return null;
}
