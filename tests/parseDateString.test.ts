/**
 * @file Unit tests for parseDateString
 *
 * ## 功能 (who)
 * parseDateString.ts 中的日期字串解析邏輯
 *
 * ## 範圍（what)
 * - `parse_date_timestamp(date)`：將 Date 物件或日期字串轉換為毫秒級 timestamp
 *
 * ## 可能遇到的情況條件 (Where)
 * - Date 物件（直接取 getTime()）
 * - ISO 8601 字串（含時間與時區）
 * - 純日期字串（YYYY-MM-DD，無時間部分）會自動補上 T12:00:00
 * - 純日期字串與明確帶時間的字串應產生相同結果（時區無關）
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env tests/parseDateString.test.ts
 * ```
 */

import { assertEquals } from "@std/assert";
import { parse_date_timestamp } from "../src/utils/parseDateString.ts";

Deno.test("[parse_date_timestamp] date object", () => {
  const date = new Date("2024-01-15T10:30:00Z");
  const result = parse_date_timestamp(date);
  assertEquals(result, date.getTime());
});

Deno.test("[parse_date_timestamp] ISO string with time", () => {
  const result = parse_date_timestamp("2024-01-15T10:30:00Z");
  const expected = new Date("2024-01-15T10:30:00Z").getTime();
  assertEquals(result, expected);
});

Deno.test("[parse_date_timestamp] date only string (YYYY-MM-DD)", () => {
  const result = parse_date_timestamp("2024-01-15");
  const expected = new Date("2024-01-15T12:00:00").getTime();
  assertEquals(result, expected);
});

Deno.test("[parse_date_timestamp] date only string with different format", () => {
  const result = parse_date_timestamp("2024-12-31");
  const expected = new Date("2024-12-31T12:00:00").getTime();
  assertEquals(result, expected);
});

Deno.test("[parse_date_timestamp] different timezones give same result for date-only", () => {
  // Date-only strings should be parsed consistently regardless of timezone
  const result1 = parse_date_timestamp("2024-01-15");
  const result2 = parse_date_timestamp("2024-01-15T12:00:00");
  assertEquals(result1, result2);
});
