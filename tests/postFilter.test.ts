/**
 * 測試：文章依上傳時間點&草稿分類
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
      modDatetime: data.modDatetime ? new Date(data.modDatetime as string) : undefined,
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

/**
 * 設定： 環境變數是開發/正式模式
 */
function setDevMode(dev: boolean) {
  Deno.env.set("NODE_ENV", dev ? "development" : "production");
}

/**
 * 清除： 環境變數的原有模式
 */
function clearEnv() {
  Deno.env.delete("NODE_ENV");
}

Deno.test("[post_filter] excludes draft posts in production", () => {
  setDevMode(false);
  const draftPost = createMockPost({
    id: "1",
    draft: true,
    pubDatetime: "2024-01-01",
  });
  const result = post_filter(draftPost);
  assertEquals(result, false);
  clearEnv();
});

Deno.test("[post_filter] includes published posts in production", () => {
  setDevMode(false);
  const publishedPost = createMockPost({
    id: "1",
    draft: false,
    pubDatetime: "2020-01-01",
  });
  const result = post_filter(publishedPost);
  assertEquals(result, true);
  clearEnv();
});

Deno.test("[post_filter] excludes future posts in production", () => {
  setDevMode(false);
  const futureDate = new Date(Date.now() + 86400000).toISOString();
  const futurePost = createMockPost({
    id: "1",
    draft: false,
    pubDatetime: futureDate,
  });
  const result = post_filter(futurePost);
  assertEquals(result, false);
  clearEnv();
});

Deno.test("[post_filter] includes all non-draft posts in development", () => {
  setDevMode(true);
  const futurePost = createMockPost({
    id: "1",
    draft: false,
    pubDatetime: new Date(Date.now() + 86400000).toISOString(),
  });
  const result = post_filter(futurePost);
  assertEquals(result, true);
  clearEnv();
});

Deno.test("[post_filter] excludes draft posts in development", () => {
  setDevMode(true);
  const draftPost = createMockPost({
    id: "1",
    draft: true,
    pubDatetime: "2020-01-01",
  });
  const result = post_filter(draftPost);
  assertEquals(result, false);
  clearEnv();
});
