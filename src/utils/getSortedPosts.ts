import type { CollectionEntry } from "astro:content";
import postFilter from "./postFilter.ts";

const getSortedPosts = (posts: CollectionEntry<"blog">[]) => {
  return posts
    .filter(postFilter)
    .sort((a, b) => {
      // Use modDatetime if available, otherwise fall back to pubDatetime
      const dateA = new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime();
      const dateB = new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime();
      
      // Sort in descending order (newest first)
      return dateB - dateA;
    });
};

export default getSortedPosts;
