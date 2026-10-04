/**
 * @file Unit tests for links
 *
 * ## 功能 (who)
 * - 友站連結資料驗證：
 * 1. `src/data/links.ts` 欄位合法性
 * 2. 與`public/assets/myLinks.json` 的內容一致性
 * - 兩者並存，改一處忘另一處會讓頁面與 JSON 端點（bench 取用）出現落差
 *
 * ## 範圍（what)
 * - `LINKS`：每筆四欄位非空、siteURL／icon 為合法 https URL、名稱不重複
 * - 一致性：`LINKS` 與 `myLinks.json` 筆數與逐筆內容相等
 *
 * ## 可能遇到的情況條件 (Where)
 * - 空字串欄位
 * - 非 https 協定
 * - 尾端斜線差異
 * - 非 ASCII 站名
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env tests/links.test.ts
 * ```
 */

import { assertEquals } from "@std/assert";
import { LINKS } from "../src/data/links.ts";
import type { Link } from "../src/data/links.ts";

const MY_LINKS_URL = new URL("../public/assets/myLinks.json", import.meta.url);

/**
 * 斷言單筆友站連結的欄位合法性。
 *
 * @param link - 待檢查的連結
 */
function assert_valid_link(link: Link): void {
  assertEquals(typeof link.name === "string" && link.name.length > 0, true);
  assertEquals(typeof link.site === "string" && link.site.length > 0, true);
  for (const field of [link.siteURL, link.icon] as const) {
    const url = new URL(field);
    assertEquals(url.protocol, "https:");
  }
}

Deno.test("[links] every entry is valid", () => {
  assertEquals(LINKS.length > 0, true);
  for (const link of LINKS) assert_valid_link(link);
});

Deno.test("[links] names are unique", () => {
  const names = LINKS.map((link) => link.name);
  assertEquals(new Set(names).size, names.length);
});

Deno.test("[links] matches public/assets/myLinks.json", async () => {
  // Deno.readTextFile 可直接吃 URL 物件，避免非 ASCII 工作區路徑的
  // percent-encoding 問題（見 docs/testing.md §8.6）
  const raw = await Deno.readTextFile(MY_LINKS_URL);
  const from_json = JSON.parse(raw) as Link[];
  assertEquals(from_json.length, LINKS.length);
  for (let i = 0; i < LINKS.length; i++) {
    assert_valid_link(from_json[i]);
    assertEquals(from_json[i], LINKS[i]);
  }
});
