import type { CollectionEntry } from "astro:content";
import { SITE } from "../config.ts";
import { parse_date_timestamp } from "./parseDateString.ts";

function isDev(): boolean {
  return Deno.env.get("NODE_ENV") !== "production";
}

export function post_filter({ data }: CollectionEntry<"blog">): boolean {
  // Always show all posts in development
  if (isDev()) {
    return !data.draft;
  }

  // In production, only show published posts
  const current_time = Date.now();
  const post_time = parse_date_timestamp(data.pubDatetime);
  const is_published = current_time >= post_time - SITE.scheduledPostMargin;

  return !data.draft && is_published;
}
