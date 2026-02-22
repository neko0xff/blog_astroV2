import type { CollectionEntry } from "astro:content";
import postFilter from "./postFilter.ts";

const getSortedPosts = (posts: CollectionEntry<"blog">[]) => {
  return posts.filter(postFilter).sort((a, b) => {
    // Helper function to handle date-only strings
    const parseDate = (date: Date | string) => {
      const dateStr = date.toString();
      return dateStr.includes("T")
        ? new Date(dateStr).getTime()
        : new Date(`${dateStr}T12:00:00`).getTime();
    };

    // Use modDatetime if available, otherwise fall back to pubDatetime
    const dateA = a.data.modDatetime
      ? parseDate(a.data.modDatetime)
      : parseDate(a.data.pubDatetime);

    const dateB = b.data.modDatetime
      ? parseDate(b.data.modDatetime)
      : parseDate(b.data.pubDatetime);

    // Sort in descending order (newest first)
    return dateB - dateA;
  });
};

export default getSortedPosts;
