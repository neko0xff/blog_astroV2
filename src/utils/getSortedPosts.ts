import type { CollectionEntry } from "astro:content";
import { post_filter } from "./postFilter.ts";
import { parse_date_timestamp } from "./parseDateString.ts";

/**
 * 依發布時間排序文章（新的在前），並先濾掉不該顯示的文章。
 *
 * 時間戳預先解析一次再排序：原本 comparator 每次比較都呼叫
 * `parse_date_timestamp`（`Date` 物件輸入約 1.2 µs/次），n 筆文章
 * 共呼叫約 2·n·log n 次；改為每筆只解析一次，排序只比數字。
 *
 * @param posts - 全部文章
 * @param is_dev - 是否為開發模式，由 Astro 層傳入 `import.meta.env.DEV`
 */
const get_sorted_posts = (posts: CollectionEntry<"blog">[], is_dev = false) => {
  // 不可寫成 `posts.filter(post_filter)`：post_filter 的第二個參數是
  // is_dev，一旦當成 callback，Array.filter 會把「陣列索引」傳進去，
  // 導致索引非 0 的文章全部被當成開發模式。
  const visible_posts = posts.filter(post => post_filter(post, is_dev));

  // 每筆的時間戳只算一次（modDatetime 優先，沒有才用 pubDatetime，
  // 與舊 comparator 的取值順序一致），再依時間戳降序排列。
  // `Array.sort` 是穩定排序，時間戳相同時維持過濾後的原順序，
  // 與舊寫法結果一致。
  const with_time = visible_posts.map(post => ({
    post,
    time: post.data.modDatetime
      ? parse_date_timestamp(post.data.modDatetime)
      : parse_date_timestamp(post.data.pubDatetime),
  }));
  with_time.sort((a, b) => b.time - a.time);

  return with_time.map(({ post }) => post);
};

export default get_sorted_posts;
