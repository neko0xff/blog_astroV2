import type { CollectionEntry } from "astro:content";

/**
 * 擁有獨立頁面、不屬於一般部落格文章的 collection id。
 * 這些 entry 不應出現在 `/posts/` 路由、文章列表與 RSS 中,
 * 避免與獨立頁面（如 `/about/`、`/terms/`）產生重複內容。
 */
const NON_POST_IDS = new Set(["about", "terms"]);

/**
 * 判斷 collection entry 是否為一般部落格文章。
 * - 排除有獨立頁面的 entry（例如 about / terms）
 * @param entry blog collection 的 entry
 * @returns 為一般部落格文章時回傳 true
 */
export const isBlogPost = (entry: CollectionEntry<"blog">): boolean =>
  !NON_POST_IDS.has(entry.id);
