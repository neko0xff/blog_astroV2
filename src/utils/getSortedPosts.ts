import type { CollectionEntry } from "astro:content";
import { post_filter } from "./postFilter.ts";
import { parse_date_timestamp } from "./parseDateString.ts";

/**
 * 依發布時間排序文章（新的在前），並先濾掉不該顯示的文章。
 *
 * @param posts - 全部文章
 * @param is_dev - 是否為開發模式，由 Astro 層傳入 `import.meta.env.DEV`
 */
const get_sorted_posts = (posts: CollectionEntry<"blog">[], is_dev = false) => {
  // 不可寫成 `posts.filter(post_filter)`：post_filter 的第二個參數是
  // is_dev，一旦當成 callback，Array.filter 會把「陣列索引」傳進去，
  // 導致索引非 0 的文章全部被當成開發模式。
  return posts
    .filter(post => post_filter(post, is_dev))
    .sort((a, b) => {
      // Use modDatetime if available, otherwise fall back to pubDatetime
      const date_a = a.data.modDatetime
        ? parse_date_timestamp(a.data.modDatetime)
        : parse_date_timestamp(a.data.pubDatetime);

      const date_b = b.data.modDatetime
        ? parse_date_timestamp(b.data.modDatetime)
        : parse_date_timestamp(b.data.pubDatetime);

      // Sort in descending order (newest first)
      return date_b - date_a;
    });
};

export default get_sorted_posts;
