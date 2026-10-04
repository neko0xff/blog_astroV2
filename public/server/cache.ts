/**
 * @file 快取策略：依路徑決定 Cache-Control（與 public/_headers 對齊）。
 */

import {
  ASSET_CACHE,
  ASSET_EXT_RE,
  IMMUTABLE_CACHE,
  NO_CACHE,
} from "./config.ts";

/**
 * Returns the Cache-Control header value for a given URL pathname.
 * Mirrors the rules in public/_headers (used by Deno Deploy staticd).
 * @param pathname - The URL pathname of the request
 * @returns A Cache-Control directive string
 */
export function cache_control_for(pathname: string): string {
  switch (true) {
    case pathname.startsWith("/_astro/"):
      return IMMUTABLE_CACHE;

    case pathname.startsWith("/assets/"):
    case pathname.startsWith("/pagefind/"):
    case ASSET_EXT_RE.test(pathname):
      return ASSET_CACHE;

    default:
      return NO_CACHE;
  }
}
