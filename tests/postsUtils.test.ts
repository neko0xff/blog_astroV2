/**
 * @file Unit tests for postsUtils
 *
 * ## 功能 (who)
 * postsUtils 中的文章標籤與分組工具函式
 *
 * ## 範圍（what)
 * - `getUniqueTags(posts)`：取得文章中所有唯一標籤（已過濾草稿、排序）
 * - `getPostsByTag(posts, tag)`：依 slug 化標籤篩選文章
 * - `getPostsByGroupCondition(posts, fn)`：依自訂條件分組文章
 *
 * ## 可能遇到的情況條件 (Where)
 * - 標籤經過 slugify（kebabcase）處理
 * - 重複標籤會去重
 * - 草稿文章（draft: true）會被排除
 * - 空 posts 陣列
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env tests/postsUtils.test.ts
 * ```
 */

import { assertEquals } from "@std/assert";
import getUniqueTags from "../src/utils/getUniqueTags.ts";
import getPostsByTag from "../src/utils/getPostsByTag.ts";
import getPostsByGroupCondition from "../src/utils/getPostsByGroupCondition.ts";

interface BlogPostData {
  title: string;
  tags: string[];
  draft: boolean | undefined;
  pubDatetime: Date;
  modDatetime: Date | undefined;
  description: string;
  author: string;
  featured: boolean;
  timezone: string;
  hideEditPost: boolean;
  canonicalURL: string;
  ogImage: undefined;
}

interface CollectionEntryMock {
  id: string;
  data: BlogPostData;
  filePath: string;
  collection: "blog";
  render: () => Promise<{ Content: () => null }>;
}

/**
 * 模擬：建立新的文章至本 Blog
 */
function createMockPost(data: Record<string, unknown>): CollectionEntryMock {
  return {
    id: data.id as string,
    data: {
      title: data.title as string,
      tags: data.tags as string[],
      draft: data.draft as boolean | undefined,
      pubDatetime: new Date(data.pubDatetime as string),
      modDatetime: data.modDatetime
        ? new Date(data.modDatetime as string)
        : undefined,
      description: data.description as string,
      author: "test",
      featured: false,
      timezone: "UTC",
      hideEditPost: false,
      canonicalURL: "",
      ogImage: undefined,
    },
    filePath: "",
    collection: "blog",
    render: () => Promise.resolve({ Content: () => null }),
  };
}

Deno.test("[getUniqueTags] basic tags", () => {
  const posts = [
    createMockPost({
      id: "1",
      tags: ["tag1", "tag2"],
      draft: false,
      pubDatetime: "2024-01-01",
    }),
    createMockPost({
      id: "2",
      tags: ["tag2", "tag3"],
      draft: false,
      pubDatetime: "2024-01-02",
    }),
  ];
  const result = getUniqueTags(posts);
  assertEquals(result.length, 3);
  // slugifyStr uses lodash.kebabcase which keeps alphanumeric but lowercases
  // "tag1" becomes "tag-1" due to kebabcase
  assertEquals(result.map((t) => t.tag).sort(), ["tag-1", "tag-2", "tag-3"]);
});

Deno.test("[getUniqueTags] duplicate tags removed", () => {
  const posts = [
    createMockPost({
      id: "1",
      tags: ["tag1", "tag1"],
      draft: false,
      pubDatetime: "2024-01-01",
    }),
    createMockPost({
      id: "2",
      tags: ["tag1"],
      draft: false,
      pubDatetime: "2024-01-02",
    }),
  ];
  const result = getUniqueTags(posts);
  assertEquals(result.length, 1);
  assertEquals(result[0].tag, "tag-1");
});

Deno.test("[getUniqueTags] draft posts excluded", () => {
  const posts = [
    createMockPost({
      id: "1",
      tags: ["published"],
      draft: false,
      pubDatetime: "2024-01-01",
    }),
    createMockPost({
      id: "2",
      tags: ["draft"],
      draft: true,
      pubDatetime: "2024-01-02",
    }),
  ];
  const result = getUniqueTags(posts);
  assertEquals(result.length, 1);
  assertEquals(result[0].tag, "published");
});

Deno.test("[getUniqueTags] sorted alphabetically", () => {
  const posts = [
    createMockPost({
      id: "1",
      tags: ["zebra"],
      draft: false,
      pubDatetime: "2024-01-01",
    }),
    createMockPost({
      id: "2",
      tags: ["alpha"],
      draft: false,
      pubDatetime: "2024-01-02",
    }),
    createMockPost({
      id: "3",
      tags: ["beta"],
      draft: false,
      pubDatetime: "2024-01-03",
    }),
  ];
  const result = getUniqueTags(posts);
  // zebra -> zebra, alpha -> alpha, beta -> beta
  assertEquals(result.map((t) => t.tag), ["alpha", "beta", "zebra"]);
});

Deno.test("[getPostsByTag] filters by tag", () => {
  const posts = [
    createMockPost({
      id: "1",
      tags: ["tag1"],
      draft: false,
      pubDatetime: "2024-01-01",
    }),
    createMockPost({
      id: "2",
      tags: ["tag2"],
      draft: false,
      pubDatetime: "2024-01-02",
    }),
    createMockPost({
      id: "3",
      tags: ["tag1", "tag3"],
      draft: false,
      pubDatetime: "2024-01-03",
    }),
  ];
  // getPostsByTag uses slugifyAll which converts "tag1" to "tag-1"
  const result = getPostsByTag(posts, "tag-1", true);
  assertEquals(result.length, 2);
  assertEquals(result.map((p) => p.id).sort(), ["1", "3"]);
});

Deno.test("[getPostsByTag] slugified tag matching", () => {
  const posts = [
    createMockPost({
      id: "1",
      tags: ["My Tag"],
      draft: false,
      pubDatetime: "2024-01-01",
    }),
  ];
  // "My Tag" -> "my-tag"
  const result = getPostsByTag(posts, "my-tag", true);
  assertEquals(result.length, 1);
});

Deno.test("[getPostsByGroupCondition] groups by year", () => {
  const posts = [
    createMockPost({
      id: "1",
      tags: [],
      draft: false,
      pubDatetime: "2023-01-01",
    }),
    createMockPost({
      id: "2",
      tags: [],
      draft: false,
      pubDatetime: "2023-06-01",
    }),
    createMockPost({
      id: "3",
      tags: [],
      draft: false,
      pubDatetime: "2024-01-01",
    }),
  ];
  const result = getPostsByGroupCondition(
    posts,
    (post) => post.data.pubDatetime.getFullYear(),
  );
  assertEquals(Object.keys(result).sort(), ["2023", "2024"]);
  assertEquals(result["2023"].length, 2);
  assertEquals(result["2024"].length, 1);
});

Deno.test("[getPostsByGroupCondition] groups by month", () => {
  const posts = [
    createMockPost({
      id: "1",
      tags: [],
      draft: false,
      pubDatetime: "2024-01-15",
    }),
    createMockPost({
      id: "2",
      tags: [],
      draft: false,
      pubDatetime: "2024-01-20",
    }),
    createMockPost({
      id: "3",
      tags: [],
      draft: false,
      pubDatetime: "2024-02-01",
    }),
  ];
  const result = getPostsByGroupCondition(
    posts,
    (post) => post.data.pubDatetime.getMonth() + 1,
  );
  assertEquals(Object.keys(result).sort(), ["1", "2"]);
  assertEquals(result["1"].length, 2);
  assertEquals(result["2"].length, 1);
});

Deno.test("[getPostsByGroupCondition] empty posts array", () => {
  const result = getPostsByGroupCondition(
    [],
    (post) => post.data.pubDatetime.getFullYear(),
  );
  assertEquals(result, {});
});
