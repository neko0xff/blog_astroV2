/**
 * @file 安全標頭一致性測試
 *
 * ## 功能 (who)
 * 確保 Deno Deploy（staticd 讀 `public/_headers`）與自託管
 * `public/server/config.ts` 送出的安全標頭一致，避免雙軌漂移。
 *
 * ## 執行 (how)
 * ```bash
 * deno task test
 * ```
 */

import { assertEquals } from "@std/assert";

const HEADERS_PATH = new URL("../public/_headers", import.meta.url);
const SERVER_PATH = new URL("../public/server/config.ts", import.meta.url);

/**
 * 從 `_headers` 取出指定標頭的值。
 * @param headers_text - `_headers` 檔案全文
 * @param name - 標頭名稱
 * @returns 去掉前後空白的標頭值
 */
function read_header_value(headers_text: string, name: string): string {
  const match = headers_text.match(
    new RegExp(`^\\s*${name}:\\s*(.+?)\\s*$`, "im"),
  );
  if (!match) throw new Error(`missing header ${name} in _headers`);
  return match[1];
}

/**
 * 從 `server.ts` 取出字串陣列常數的內容（例如 CONTENT_SECURITY_POLICY）。
 * @param server_text - `server.ts` 檔案全文
 * @param const_name - 常數名稱
 * @returns 陣列中的字串列表
 */
function read_string_array(server_text: string, const_name: string): string[] {
  const block = server_text.match(
    new RegExp(`const ${const_name} = \\[([\\s\\S]*?)\\]`, "m"),
  );
  if (!block) throw new Error(`missing ${const_name} in server config`);
  return [...block[1].matchAll(/"([^"]*)"/g)].map((m) => m[1]);
}

/**
 * 從 `server/config.ts` 的 SECURITY_HEADERS 取出字串字面量標頭值。
 * @param server_text - `server.ts` 檔案全文
 * @param name - 標頭名稱
 * @returns 標頭值字串
 */
function read_record_value(server_text: string, name: string): string {
  const match = server_text.match(
    new RegExp(`"${name}": "([^"]*)"`, "m"),
  );
  if (!match) throw new Error(`missing header ${name} in server config`);
  return match[1];
}

Deno.test("[headers] CSP matches _headers", async () => {
  const headers_text = await Deno.readTextFile(HEADERS_PATH);
  const server_text = await Deno.readTextFile(SERVER_PATH);

  assertEquals(
    read_string_array(server_text, "CONTENT_SECURITY_POLICY").join("; "),
    read_header_value(headers_text, "Content-Security-Policy"),
  );
});

Deno.test("[headers] Permissions-Policy matches _headers", async () => {
  const headers_text = await Deno.readTextFile(HEADERS_PATH);
  const server_text = await Deno.readTextFile(SERVER_PATH);

  assertEquals(
    read_string_array(server_text, "PERMISSIONS_POLICY").join(", "),
    read_header_value(headers_text, "Permissions-Policy"),
  );
});

for (
  const name of [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Strict-Transport-Security",
    "Referrer-Policy",
  ]
) {
  Deno.test(`[headers] ${name} matches _headers`, async () => {
    const headers_text = await Deno.readTextFile(HEADERS_PATH);
    const server_text = await Deno.readTextFile(SERVER_PATH);

    assertEquals(
      read_record_value(server_text, name),
      read_header_value(headers_text, name),
    );
  });
}
