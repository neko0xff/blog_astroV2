import type { CollectionEntry } from "astro:content";
import getSortedPosts from "./getSortedPosts.ts";
import { slugifyAll } from "./slugify.ts";

/**
 * 取得指定標籤的文章清單（依發布時間排序）。
 *
 * @param posts - 全部文章
 * @param tag - 目標標籤（slug 形式）
 * @param is_dev - 是否為開發模式，由 Astro 層傳入 `import.meta.env.DEV`
 */
const getPostsByTag = (
  posts: CollectionEntry<"blog">[],
  tag: string,
  is_dev = false
) =>
  getSortedPosts(
    posts.filter(post => slugifyAll(post.data.tags).includes(tag)),
    is_dev
  );

export default getPostsByTag;
