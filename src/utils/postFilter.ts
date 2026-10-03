import type { CollectionEntry } from "astro:content";
import { SITE } from "../config.ts";
import { parse_date_timestamp } from "./parseDateString.ts";

/**
 * 判斷文章是否應顯示於前端。
 *
 * @param entry - 文章項目
 * @param is_dev - 是否為開發模式。預設 `false`（正式模式），由 Astro 層
 *                 顯式傳入 `import.meta.env.DEV`。
 *
 * 為什麼要由外部傳入而不直接讀 `import.meta.env`：
 * `import.meta.env` 是 Astro/Vite 在建置期注入的，Deno 原生跑單元測試時
 * 不認得這個型別，會讓 `deno task test` 的型別檢查直接失敗。
 * 把判斷交給呼叫端，`src/utils/` 就能同時被 Astro 與 Deno 使用。
 */
export function post_filter(
  { data }: CollectionEntry<"blog">,
  is_dev: boolean = false
): boolean {
  // 開發模式：顯示所有非草稿文章（含尚未到期的排程文章），方便預覽
  if (is_dev) return !data.draft;

  // 正式模式：只顯示已發布且已到期的文章
  const current_time = Date.now();
  const post_time = parse_date_timestamp(data.pubDatetime);
  const is_published = current_time >= post_time - SITE.scheduledPostMargin;

  return !data.draft && is_published;
}
