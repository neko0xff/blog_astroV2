/**
 * 測試： 文章的路由路徑
 */

import { assertEquals } from "@std/assert";
import { getPath } from "../src/utils/getPath.ts";

Deno.test("[getPath] simple post without subdirectory", () => {
  const result = getPath("my-post", "/src/data/blog/my-post.md");
  assertEquals(result, "/posts/my-post");
});

Deno.test("[getPath] post with subdirectory", () => {
  const result = getPath("my-post", "/src/data/blog/category/my-post.md");
  assertEquals(result, "/posts/category/my-post");
});

Deno.test("[getPath] post with nested subdirectory", () => {
  const result = getPath("my-post", "/src/data/blog/category/subcategory/my-post.md");
  assertEquals(result, "/posts/category/subcategory/my-post");
});

Deno.test("[getPath] includeBase false", () => {
  const result = getPath("my-post", "/src/data/blog/category/my-post.md", false);
  assertEquals(result, "category/my-post");
});

Deno.test("[getPath] slugify applied to directory names", () => {
  const result = getPath("my-post", "/src/data/blog/My Category/my-post.md");
  assertEquals(result, "/posts/my-category/my-post");
});

Deno.test("[getPath] slugify applied to id", () => {
  const result = getPath("My Post", "/src/data/blog/my-post.md");
  assertEquals(result, "/posts/my-post");
});

Deno.test("[getPath] filePath undefined", () => {
  const result = getPath("my-post", undefined);
  assertEquals(result, "/posts/my-post");
});

Deno.test("[getPath] ignores underscore directories", () => {
  const result = getPath("my-post", "/src/data/blog/_drafts/my-post.md");
  assertEquals(result, "/posts/my-post");
});

Deno.test("[getPath] id with slashes uses last segment", () => {
  const result = getPath("category/my-post", "/src/data/blog/other/my-post.md");
  assertEquals(result, "/posts/other/my-post");
});
