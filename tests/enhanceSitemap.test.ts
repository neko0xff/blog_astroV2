/**
 * @file Unit tests for enhance sitemap
 *
 * ## 功能 (who)
 * enhance-sitemap.mjs 中的 sitemap lastmod 補充邏輯（直接 import 真函式，
 * 非複刻；本腳本已接回 `deno task build`）
 *
 * ## 範圍（what)
 * - `extractPostSlug()`：從 URL 中提取文章 slug
 * - `getSitemapFiles()`：從 sitemap-index 取出待處理檔名
 * - `enhanceSitemap()`：為匹配的 URL 注入 `<lastmod>` 標籤（temp 檔實測）
 *
 * ## 可能遇到的情況條件 (Where)
 * - 非文章 URL（tags 頁、首頁）不加 lastmod
 * - 已有 lastmod 的 URL 不重複覆寫
 * - URL 編碼路徑的中文 slug
 * - temp sitemap 檔（需 `--allow-write`）
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-write --allow-env tests/enhanceSitemap.test.ts
 * ```
 */
import { assertEquals, assertExists } from "@std/assert";
import {
  enhanceSitemap,
  extractPostSlug,
  getSitemapFiles,
} from "../scripts/enhance-sitemap.mjs";

const MOCK_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://example.com/</loc></url>
<url><loc>https://example.com/posts/my-post/</loc></url>
<url><loc>https://example.com/posts/another-post/</loc></url>
<url><loc>https://example.com/tags/tag1/</loc></url>
</urlset>`;

const MOCK_INDEX = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap><loc>https://example.com/sitemap-0.xml</loc></sitemap>
<sitemap><loc>https://example.com/sitemap-1.xml/</loc></sitemap>
</sitemapindex>`;

const MOCK_POST_LASTMOD = new Map([
  ["my-post", "2024-01-15T10:00:00.000Z"],
  ["another-post", "2024-02-20T15:30:00.000Z"],
]);

Deno.test("[enhanceSitemap] extractPostSlug", () => {
  assertEquals(
    extractPostSlug("https://example.com/posts/my-post/"),
    "my-post",
  );
  assertEquals(
    extractPostSlug("https://example.com/posts/hello-world/"),
    "hello-world",
  );
  assertEquals(
    extractPostSlug(
      "https://example.com/posts/%E4%B8%AD%E6%96%87%E6%A8%99%E9%A1%8C/",
    ),
    "中文標題",
  );
  assertEquals(extractPostSlug("https://example.com/tags/tag1/"), null);
  assertEquals(extractPostSlug("https://example.com/"), null);
});

Deno.test("[enhanceSitemap] getSitemapFiles lists xml files", () => {
  assertEquals(getSitemapFiles(MOCK_INDEX), [
    "sitemap-0.xml",
    "sitemap-1.xml",
  ]);
});

Deno.test("[enhanceSitemap] add lastmod to matching URLs", async () => {
  const dir = await Deno.makeTempDir({ prefix: "sitemap-" });
  const sitemap_path = `${dir}/sitemap-0.xml`;
  await Deno.writeTextFile(sitemap_path, MOCK_SITEMAP);

  await enhanceSitemap(sitemap_path, MOCK_POST_LASTMOD);
  const result = await Deno.readTextFile(sitemap_path);

  assertEquals(
    result.includes("<lastmod>2024-01-15T10:00:00.000Z</lastmod>"),
    true,
  );
  assertEquals(
    result.includes("<lastmod>2024-02-20T15:30:00.000Z</lastmod>"),
    true,
  );
  assertEquals(result.match(/<lastmod>/g)?.length, 2);
});

Deno.test("[enhanceSitemap] does not add lastmod to non-post URLs", async () => {
  const dir = await Deno.makeTempDir({ prefix: "sitemap-" });
  const sitemap_path = `${dir}/sitemap-0.xml`;
  await Deno.writeTextFile(sitemap_path, MOCK_SITEMAP);

  await enhanceSitemap(sitemap_path, MOCK_POST_LASTMOD);
  const result = await Deno.readTextFile(sitemap_path);

  // Check home page URL block - find the <url> block containing the home loc
  const homeUrlMatch = result.match(
    /<url>[^<]*<loc>https:\/\/example\.com\/<\/loc>[^<]*<\/url>/,
  );
  assertExists(homeUrlMatch);
  assertEquals(homeUrlMatch![0].includes("<lastmod>"), false);

  // Check tag page URL block
  const tagUrlMatch = result.match(
    /<url>[^<]*<loc>https:\/\/example\.com\/tags\/tag1\/<\/loc>[^<]*<\/url>/,
  );
  assertExists(tagUrlMatch);
  assertEquals(tagUrlMatch![0].includes("<lastmod>"), false);
});

Deno.test("[enhanceSitemap] does not duplicate lastmod if already present", async () => {
  const dir = await Deno.makeTempDir({ prefix: "sitemap-" });
  const sitemap_path = `${dir}/sitemap-0.xml`;
  const sitemapWithLastmod = MOCK_SITEMAP.replace(
    "<url><loc>https://example.com/posts/my-post/</loc></url>",
    "<url><loc>https://example.com/posts/my-post/</loc><lastmod>2023-01-01T00:00:00.000Z</lastmod></url>",
  );
  await Deno.writeTextFile(sitemap_path, sitemapWithLastmod);

  await enhanceSitemap(sitemap_path, MOCK_POST_LASTMOD);
  const result = await Deno.readTextFile(sitemap_path);
  const myPostBlock = result.match(
    /<url>[\s\S]*?<loc>https:\/\/example\.com\/posts\/my-post\/<\/loc>[\s\S]*?<\/url>/,
  );
  assertExists(myPostBlock);
  assertEquals(myPostBlock![0].includes("2023-01-01T00:00:00.000Z"), true);
  assertEquals(myPostBlock![0].includes("2024-01-15T10:00:00.000Z"), false);
});
