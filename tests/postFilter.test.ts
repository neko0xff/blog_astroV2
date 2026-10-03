/**
 * @file Unit tests for postFilter
 *
 * ## 功能 (who)
 * postFilter.ts 中的文章過濾邏輯
 *
 * ## 範圍（what)
 * - `post_filter(post)`：判斷文章是否應在前端顯示
 *
 * ## 可能遇到的情況條件 (Where)
 * - `is_dev = true`（開發模式）：草稿排除，未到期文章仍顯示（方便預覽）
 * - `is_dev = false`（正式模式）：草稿排除，且未到期（排程中）文章也排除
 *
 * 說明：`is_dev` 由測試直接注入，不透過環境變數控制。
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env tests/postFilter.test.ts
 * ```
 */
import { assertEquals } from "@std/assert";
import { post_filter } from "../src/utils/postFilter.ts";

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

Deno.test("[post_filter] excludes draft posts in production", () => {
  const draftPost = createMockPost({
    id: "1",
    draft: true,
    pubDatetime: "2024-01-01",
  });
  const result = post_filter(draftPost, false);
  assertEquals(result, false);
});

Deno.test("[post_filter] includes published posts in production", () => {
  const publishedPost = createMockPost({
    id: "1",
    draft: false,
    pubDatetime: "2020-01-01",
  });
  const result = post_filter(publishedPost, false);
  assertEquals(result, true);
});

Deno.test("[post_filter] excludes future posts in production", () => {
  const futureDate = new Date(Date.now() + 86400000).toISOString();
  const futurePost = createMockPost({
    id: "1",
    draft: false,
    pubDatetime: futureDate,
  });
  const result = post_filter(futurePost, false);
  assertEquals(result, false);
});

Deno.test("[post_filter] includes all non-draft posts in development", () => {
  const futurePost = createMockPost({
    id: "1",
    draft: false,
    pubDatetime: new Date(Date.now() + 86400000).toISOString(),
  });
  const result = post_filter(futurePost, true);
  assertEquals(result, true);
});

Deno.test("[post_filter] excludes draft posts in development", () => {
  const draftPost = createMockPost({
    id: "1",
    draft: true,
    pubDatetime: "2020-01-01",
  });
  const result = post_filter(draftPost, true);
  assertEquals(result, false);
});
