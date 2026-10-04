/**
 * @file Unit tests for serverLogging
 *
 * ## 功能 (who)
 * - 自託管伺服器 access log 純函式：
 * 1. 時間格式
 * 2. IP 擷取
 * 3. 標頭清理
 * 4. 單行組裝
 *
 * ## 範圍（what)
 * - `format_timestamp`：本地時間格式
 * - `client_ip`：取不到時回 "-"、tcp 取 hostname、unix 取 transport
 * - `sanitize_log_value`：引號與換行清理（防 log 注入撐破單行）
 * - `format_access_log`／`log_access`：text 與 json 輸出
 *
 * ## 可能遇到的情況條件 (Where)
 * - info 為 undefined
 * - hostname 為空字串
 * - 含換行的 user-agent
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env tests/serverLogging.test.ts
 * ```
 */

import { assertEquals } from "@std/assert";
import {
  client_ip,
  format_access_log,
  format_timestamp,
  log_access,
  sanitize_log_value,
} from "../public/server/logging.ts";
import type { AccessEntry } from "../public/server/logging.ts";

/**
 * 建立 access log 測試用的固定 entry。
 */
function make_entry(): AccessEntry {
  return {
    method: "GET",
    path: "/posts/my-post/?q=a",
    status: 200,
    duration_ms: 5,
    bytes: "827",
    ip: "127.0.0.1",
    user_agent: "curl/8.22.0",
    referer: "-",
  };
}

Deno.test("[serverLogging] format_timestamp renders local time", () => {
  // 月份與日期為個位數時補零（用本地建構避免時區漂移）
  assertEquals(
    format_timestamp(new Date(2026, 0, 5, 7, 8, 9)),
    "2026-01-05 07:08:09",
  );
  assertEquals(
    format_timestamp(new Date(2026, 11, 31, 23, 59, 59)),
    "2026-12-31 23:59:59",
  );
});

Deno.test("[serverLogging] client_ip falls back when unavailable", () => {
  assertEquals(client_ip(undefined), "-");
});

Deno.test("[serverLogging] client_ip reads tcp hostname", () => {
  const info = {
    remoteAddr: { transport: "tcp", hostname: "1.2.3.4", port: 80 },
  } as unknown as Deno.ServeHandlerInfo;
  assertEquals(client_ip(info), "1.2.3.4");
});

Deno.test("[serverLogging] client_ip handles empty hostname and unix transport", () => {
  const empty_host = {
    remoteAddr: { transport: "tcp", hostname: "", port: 80 },
  } as unknown as Deno.ServeHandlerInfo;
  assertEquals(client_ip(empty_host), "-");

  const unix = {
    remoteAddr: { transport: "unix", path: "/tmp/sock" },
  } as unknown as Deno.ServeHandlerInfo;
  assertEquals(client_ip(unix), "unix");
});

Deno.test("[serverLogging] sanitize_log_value neutralizes log injection", () => {
  // 雙引號轉單引號（保住 ua="..." 外層格式），換行壓成空白
  assertEquals(sanitize_log_value('a"b\nc\td'), "a'b c d");
  assertEquals(sanitize_log_value("plain"), "plain");
});

Deno.test("[serverLogging] format_access_log keeps single-line shape", () => {
  assertEquals(
    format_access_log("2026-10-04 07:20:02", make_entry()),
    '[2026-10-04 07:20:02] [GET] /posts/my-post/?q=a 200 5ms 827 ip=127.0.0.1 ua="curl/8.22.0" ref="-"',
  );
});

Deno.test("[serverLogging] log_access emits text and json", () => {
  const lines: string[] = [];
  const original = console.log;
  console.log = (msg: unknown) => {
    lines.push(String(msg));
  };
  try {
    log_access("2026-10-04 07:20:02", make_entry(), "text");
    log_access("2026-10-04 07:20:02", make_entry(), "json");
  } finally {
    console.log = original;
  }
  assertEquals(lines.length, 2);
  assertEquals(lines[0].startsWith("[2026-10-04 07:20:02]"), true);
  // json 分支必須是可解析的結構化物件（含 timestamp 與 status）
  const parsed = JSON.parse(lines[1]) as { timestamp: string; status: number };
  assertEquals(parsed.timestamp, "2026-10-04 07:20:02");
  assertEquals(parsed.status, 200);
});
