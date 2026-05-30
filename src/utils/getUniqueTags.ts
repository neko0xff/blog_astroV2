import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify.ts";
import { post_filter } from "./postFilter.ts";

interface Tag {
  tag: string;
  tagName: string;
}

const getUniqueTags = (posts: CollectionEntry<"blog">[]) => {
  const tags: Tag[] = posts
    .filter(post_filter)
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
