import type { CollectionEntry } from "astro:content";
import { post_filter } from "./postFilter.ts";
import { parse_date_timestamp } from "./parseDateString.ts";

const get_sorted_posts = (posts: CollectionEntry<"blog">[]) => {
  return posts.filter(post_filter).sort((a, b) => {
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
