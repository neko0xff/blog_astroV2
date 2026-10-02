/**
 * 測試：時間點字串転換成數值
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
