import type { CollectionEntry } from "astro:content";
import { SITE } from "@/config";

const postFilter = ({ data }: CollectionEntry<"blog">) => {
  // Always show all posts in development
  if (import.meta.env.DEV) {
    return !data.draft;
  }

  // In production, only show published posts
  const currentTime = Date.now();

  // Handle date-only strings by appending a default time (12:00 PM)
  const pubDateStr = data.pubDatetime.toString();
  const pubDate = pubDateStr.includes("T")
    ? new Date(pubDateStr)
    : new Date(`${pubDateStr}T12:00:00`);

  const postTime = pubDate.getTime();
  const isPublished = currentTime >= postTime - SITE.scheduledPostMargin;

  return !data.draft && isPublished;
};

export default postFilter;
