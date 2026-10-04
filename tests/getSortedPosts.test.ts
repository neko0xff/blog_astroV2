/**
 * @file Unit tests for getSortedPosts
 *
 * ## 功能 (who)
 * 1. 依發布時間降序排列文章（日期較新的在前）
 * 2. 先濾掉不該顯示的文章
 *
 * ## 範圍（what)
 * - `get_sorted_posts(posts, is_dev)`：排序、modDatetime 優先、穩定排序、過濾
 *
 * ## 可能遇到的情況條件 (Where)
 * - 空陣列
 * - 草稿
 * - 文章的排程時間點在未來
 * - modDatetime 比 pubDatetime 舊
 * - 相同時間戳
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env tests/getSortedPosts.test.ts
 * ```
 */

import { assertEquals } from "@std/assert";
import get_sorted_posts from "../src/utils/getSortedPosts.ts";
import type { CollectionEntry } from "astro:content";

type MockPost = {
  id: string;
  data: {
    title: string;
    tags: string[];
    draft: boolean;
    pubDatetime: Date;
    modDatetime: Date | undefined;
  };
};

/**
 * 建立排序測試用的最小 mock
 *
 * - 轉型理由同 isBlogPost：只用到 data 欄位
 *
 * @param id - 文章 id
 * @param pub - 發布時間 ISO 字串
 * @param mod - 更新時間 ISO 字串（可選）
 * @param draft - 是否為草稿
 */
function make_post(
  id: string,
  pub: string,
  mod?: string,
  draft = false,
): MockPost {
  return {
    id,
    data: {
      title: id,
      tags: [],
      draft,
      pubDatetime: new Date(pub),
      modDatetime: mod ? new Date(mod) : undefined,
    },
  };
}

function as_entries(posts: MockPost[]): CollectionEntry<"blog">[] {
  return posts as unknown as CollectionEntry<"blog">[];
}

Deno.test("[getSortedPosts] sorts newest first", () => {
  const posts = [
    make_post("old", "2023-01-01T00:00:00.000Z"),
    make_post("new", "2024-06-01T00:00:00.000Z"),
    make_post("mid", "2024-01-01T00:00:00.000Z"),
  ];
  const result = get_sorted_posts(
    as_entries(posts),
    true,
  ) as unknown as MockPost[];
  assertEquals(result.map((p) => p.id), ["new", "mid", "old"]);
});

Deno.test("[getSortedPosts] prefers modDatetime over pubDatetime", () => {
  const posts = [
    make_post("a", "2024-01-01T00:00:00.000Z", "2024-12-01T00:00:00.000Z"),
    make_post("b", "2024-06-01T00:00:00.000Z"),
  ];
  const result = get_sorted_posts(
    as_entries(posts),
    true,
  ) as unknown as MockPost[];
  assertEquals(result.map((p) => p.id), ["a", "b"]);
});

Deno.test("[getSortedPosts] keeps stable order on equal timestamps", () => {
  const posts = [
    make_post("first", "2024-01-01T00:00:00.000Z"),
    make_post("second", "2024-01-01T00:00:00.000Z"),
  ];
  const result = get_sorted_posts(
    as_entries(posts),
    true,
  ) as unknown as MockPost[];
  assertEquals(result.map((p) => p.id), ["first", "second"]);
});

Deno.test("[getSortedPosts] filters drafts in dev mode", () => {
  const posts = [
    make_post("pub", "2024-01-01T00:00:00.000Z"),
    make_post("draft", "2024-06-01T00:00:00.000Z", undefined, true),
  ];
  const result = get_sorted_posts(
    as_entries(posts),
    true,
  ) as unknown as MockPost[];
  assertEquals(result.map((p) => p.id), ["pub"]);
});

Deno.test("[getSortedPosts] filters scheduled posts in prod mode", () => {
  const future = new Date(Date.now() + 86400000).toISOString();
  const posts = [
    make_post("pub", "2020-01-01T00:00:00.000Z"),
    make_post("future", future),
  ];
  const result = get_sorted_posts(
    as_entries(posts),
    false,
  ) as unknown as MockPost[];
  assertEquals(result.map((p) => p.id), ["pub"]);
});

Deno.test("[getSortedPosts] empty array returns empty", () => {
  assertEquals(get_sorted_posts([], true), []);
});
