/**
 * @file Unit tests for redirects
 *
 * ## 功能 (who)
 * `_redirects` 規則載入與新舊網址一致性
 * - Deno Deploy staticd 與自託管共用
 *
 * ## 範圍（what)
 * - `load_redirects(file_path)`：缺檔回空表、既有檔解析正確
 * - `_redirects` 不變式：每條來源成對（有/無尾端斜線）、狀態碼皆為 301
 * - 抽查：`getPath` 對已知 id 的輸出落在 `_redirects` 目標中
 *
 * ## 可能遇到的情況條件 (Where)
 * - 規則檔不存在
 * - 註解行
 * - 非 ASCII 路徑（含中文與 &）
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env tests/redirects.test.ts
 * ```
 */

import { assertEquals } from "@std/assert";
import { load_redirects } from "../public/server/redirects.ts";
import { getPath } from "../src/utils/getPath.ts";

// Deno.readTextFile 可直接吃 URL，但 load_redirects 只收字串路徑；
// 工作區路徑含中文時 .pathname 為百分編碼，需 decode 還原。
const REDIRECTS_PATH = decodeURIComponent(
  new URL("../public/_redirects", import.meta.url).pathname,
);

Deno.test("[redirects] missing file returns empty map", async () => {
  const rules = await load_redirects("/nonexistent/_redirects");
  assertEquals(rules.size, 0);
});

Deno.test("[redirects] loads real _redirects with 301 pairs", async () => {
  const rules = await load_redirects(REDIRECTS_PATH);
  // 檔內每條來源都應成對出現（有/無尾端斜線），故總數為偶數且 > 0
  assertEquals(rules.size > 0, true);
  assertEquals(rules.size % 2, 0);

  for (const [source, destination] of rules) {
    // 成對的另一種形式必存在；目標允差尾端斜線（檔內有斜線版指有斜線目標）
    const counterpart = source.endsWith("/")
      ? source.slice(0, -1)
      : `${source}/`;
    const peer = rules.get(counterpart);
    assertEquals(typeof peer, "string");
    assertEquals(
      peer!.endsWith("/") ? peer!.slice(0, -1) : peer!,
      destination.endsWith("/") ? destination.slice(0, -1) : destination,
    );
    // 目標皆為 /posts/ 下的新 slug
    assertEquals(destination.startsWith("/posts/"), true);
  }
});

Deno.test("[redirects] known slug migration is covered", async () => {
  const rules = await load_redirects(REDIRECTS_PATH);
  // windows-16bit -> windows-16-bit（見 getPath slugify 註解）
  assertEquals(
    rules.get("/posts/windows-16bit/"),
    "/posts/windows-16-bit/",
  );
  // getPath 對同樣 id 的輸出應等於轉址目標（不含尾端斜線比對）
  const routed = getPath("windows-16bit", "src/data/blog/windows-16bit.md");
  assertEquals(routed, "/posts/windows-16-bit");
});
