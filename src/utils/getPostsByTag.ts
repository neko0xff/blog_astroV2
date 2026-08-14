import type { CollectionEntry } from "astro:content";
import getSortedPosts from "./getSortedPosts.ts";
import { slugifyAll } from "./slugify.ts";

const getPostsByTag = (posts: CollectionEntry<"blog">[], tag: string) =>
  getSortedPosts(
    posts.filter(post => slugifyAll(post.data.tags).includes(tag))
  );

export default getPostsByTag;
