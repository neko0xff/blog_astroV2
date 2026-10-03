import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify.ts";
import { post_filter } from "./postFilter.ts";

interface Tag {
  tag: string;
  tagName: string;
}

/**
 * 取得全部文章中出現過的唯一標籤（已排除草稿，依字母排序）。
 *
 * @param posts - 全部文章
 * @param is_dev - 是否為開發模式，由 Astro 層傳入 `import.meta.env.DEV`
 */
const getUniqueTags = (posts: CollectionEntry<"blog">[], is_dev = false) => {
  const tags: Tag[] = posts
    // 同上，不可直接把 post_filter 當 callback 傳入
    .filter(post => post_filter(post, is_dev))
    .flatMap(post => post.data.tags)
    .map(tag => ({ tag: slugifyStr(tag), tagName: tag }))
    .filter(
      (value, index, self) =>
        self.findIndex(tag => tag.tag === value.tag) === index
    )
    .sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));
  return tags;
};

export default getUniqueTags;
