/**
 * @file 預壓縮變體：依 Accept-Encoding 挑 br / gzip（RFC 9110 §12.5.3 語意）。
 */

import { COMPRESSED_VARIANTS } from "./config.ts";
import { file_exists } from "./fs.ts";

/**
 * Resolves which content codings the client declared acceptable.
 *
 * @description
 * 為什麼需要這個函式：
 * - 原本用 `accept_encoding.includes(encoding)` 做子字串比對，那是錯的。
 * - `gzip;q=0` 是客戶端「明確拒絕」gzip，但子字串比對會命中；
 * - `xbr` / `gzippy` 這種從未登記的 coding token 也會因為含有 `br` / `gzip` 這幾個字元而被誤判為接受。
 * - RFC 9110 §12.5.3 規定：只有明列且 q > 0，或被 q > 0 的萬用字元 `*` 涵蓋的 coding 才是可接受的。
 *
 * @param header - 原始 Accept-Encoding 請求標頭值
 * @returns 客戶端以 q > 0 接受的 coding 名稱集合
 */
export function acceptable_codings(header: string): Set<string> {
  const explicit = new Map<string, number>();
  // 萬用字元的預設值是 0，不是 1。RFC 9110 §12.5.3 規定「未被列出的 coding
  // 不算可接受」，所以當標頭裡沒有 `*` 時，未明列的 coding（例如只寫了
  // `br;q=0` 的情況下的 gzip）必須視為不可接受。若這裡預設成 1，
  // `Accept-Encoding: xbr` 或 `deflate` 都會被誤判成接受 gzip。
  let wildcard = 0;

  for (const part of header.split(",")) {
    const [raw_name, ...params] = part.trim().split(";");
    // coding 名稱不區分大小寫（RFC 9110 §8.4.1）
    const name = raw_name.trim().toLowerCase();
    if (!name) continue;

    let q = 1;
    for (const param of params) {
      const [key, value] = param.split("=").map(s => s.trim());
      if (key?.toLowerCase() === "q") {
        const parsed = Number.parseFloat(value ?? "");
        // q 值解析失敗時視為拒絕（fail-closed），寧可少給壓縮也不要給錯的
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
  // 萬用字元只涵蓋「未被明列」的 coding；明列者（含 q=0）以明列為準
  if (wildcard > 0) {
    for (const { encoding } of COMPRESSED_VARIANTS) {
      if (!explicit.has(encoding)) accepted.add(encoding);
    }
  }
  return accepted;
}

/**
 * Picks the best precompressed variant (br > gzip) a client accepts.
 * @param file_path - Absolute path of the uncompressed file
 * @param accept_encoding - The request's Accept-Encoding header (nullable)
 * @returns The variant path and encoding, or null when none is available
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
