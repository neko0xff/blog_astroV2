/**
 * @file Unit tests for getPath
 *
 * ## 功能 (who)
 * getPath.ts 中的文章路由路徑生成邏輯
 *
 * ## 範圍（what)
 * - `getPath(id, filePath, includeBase)`：將內容檔案路徑轉換為前端路由 URL
 *
 * ## 可能遇到的情況條件 (Where)
 * - 文章無子目錄（直接在 blog/ 根目錄）
 * - 文章在子目錄中（單層/多層）
 * - `includeBase` 為 false 時不包含 `/posts` 前綴，且不產生前導斜線
 * - 目錄名或 id 經過 slugify 處理（中文保留原樣）
 * - `filePath` 為 undefined 或空字串時的 fallback
 * - `filePath` 帶尾端斜線（視為沒有檔名，退回只用 id）
 * - `filePath` 不含 `BLOG_PATH` 前綴時的防禦行為
 * - `_` 開頭的目錄會被排除（多層亦然）
 * - id 含有 `/` 時只取最後一段；帶前導／尾端斜線時仍能正確取出 slug
 * - id 為空字串或只有斜線時降級為 `/posts`（不產生空 slug）
 * - 非 ASCII 目錄名搭配 `includeBase=false`
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env tests/getPath.test.ts
 * ```
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
  const result = getPath(
    "my-post",
    "/src/data/blog/category/subcategory/my-post.md",
  );
  assertEquals(result, "/posts/category/subcategory/my-post");
});

Deno.test("[getPath] includeBase false", () => {
  const result = getPath(
    "my-post",
    "/src/data/blog/category/my-post.md",
    false,
  );
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

Deno.test("[getPath] id with leading slash still resolves", () => {
  const result = getPath("/my-post", "/src/data/blog/my-post.md");
  assertEquals(result, "/posts/my-post");
});

Deno.test("[getPath] id with trailing slash still resolves", () => {
  const result = getPath("my-post/", "/src/data/blog/my-post.md");
  assertEquals(result, "/posts/my-post");
});

Deno.test("[getPath] id with surrounding slashes still resolves", () => {
  const result = getPath("/category/my-post/", "/src/data/blog/my-post.md");
  assertEquals(result, "/posts/my-post");
});

Deno.test("[getPath] empty id degrades to posts index", () => {
  const result = getPath("", "/src/data/blog/my-post.md");
  assertEquals(result, "/posts");
});

Deno.test("[getPath] slash-only id degrades to posts index", () => {
  const result = getPath("/", "/src/data/blog/my-post.md");
  assertEquals(result, "/posts");
});

Deno.test("[getPath] filePath empty string falls back to id", () => {
  const result = getPath("my-post", "");
  assertEquals(result, "/posts/my-post");
});

Deno.test("[getPath] filePath trailing slash treated as no filename", () => {
  const result = getPath("my-post", "src/data/blog/category/");
  assertEquals(result, "/posts/my-post");
});

Deno.test("[getPath] filePath without BLOG_PATH prefix keeps segments", () => {
  // BLOG_PATH 沒出現時 .replace() 不會替換掉任何東西，
  // 這裡鎖定「不會崩潰、會把整條路徑當成文章目錄」的防禦行為
  const result = getPath("my-post", "/other/place/my-post.md");
  assertEquals(result, "/posts/other/place/my-post");
});

Deno.test("[getPath] ignores multiple underscore directories", () => {
  const result = getPath("my-post", "/src/data/blog/_a/_b/my-post.md");
  assertEquals(result, "/posts/my-post");
});

Deno.test("[getPath] keeps non-ASCII characters in directory name", () => {
  const result = getPath("my-post", "/src/data/blog/中文分類/my-post.md");
  assertEquals(result, "/posts/中文分類/my-post");
});

Deno.test(
  "[getPath] non-ASCII directory without base has no leading slash",
  () => {
    const result = getPath(
      "my-post",
      "/src/data/blog/中文分類/my-post.md",
      false,
    );
    assertEquals(result, "中文分類/my-post");
  },
);

Deno.test("[getPath] keeps non-ASCII characters in id", () => {
  const result = getPath("中文標題", "/src/data/blog/中文標題.md");
  assertEquals(result, "/posts/中文標題");
});
