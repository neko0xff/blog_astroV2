/**
 * @file Benchmark parse_date_timestamp
 *
 * ## 功能 (Who)
 * - 測試日期解析轉時間戳的效能
 * - 排序／過濾熱路徑：`getSortedPosts` 的 comparator 每次比較呼叫 2 次
 * - 純資料轉換，不需要任何權限旗標
 *
 * ## 範圍（What)
 * - `Date` 物件 vs ISO 字串（含 `T`）vs 日期字串（不含 `T`，需補 `T12:00:00`）
 *
 * ## 可能遇到的情況條件 (Where)
 * - 不同時區、日期字串 vs 完整 ISO 字串
 *
 * ## 執行(How)
 * ```bash
 * deno task bench
 * deno bench --unstable-kv --unstable-ffi bench/parseDate.bench.ts
 * ```
 *
 */

import { parse_date_timestamp } from "../src/utils/parseDateString.ts";

const DATE_OBJ = new Date("2024-01-15T12:00:00.000Z");
const ISO_STR = "2024-01-15T12:00:00.000Z";
const DATE_ONLY_STR = "2024-01-15";
let sink = 0;

Deno.bench({
  name: "[Parse] Date 物件",
  group: "parse-date",
  baseline: true,
  fn: () => {
    sink = parse_date_timestamp(DATE_OBJ);
  },
});

Deno.bench({
  name: "[Parse] ISO 字串",
  group: "parse-date",
  fn: () => {
    sink = parse_date_timestamp(ISO_STR);
  },
});

Deno.bench({
  name: "[Parse] 日期字串",
  group: "parse-date",
  fn: () => {
    sink = parse_date_timestamp(DATE_ONLY_STR);
  },
});

export { sink };
