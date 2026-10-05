/**
 * @file Unit tests for blogSchema
 *
 * ## 功能 (who)
 * 部落格 frontmatter schema：必填、預設值、可空欄位、型別拒絕
 *
 * ## 範圍（what)
 * - `create_blog_schema(image)`：完整物件解析、預設值、錯誤案例
 *
 * ## 可能遇到的情況條件 (Where)
 * - 缺 title
 * - draft 型別錯誤
 * - modDatetime null／缺席
 * - 非 ASCII 標題
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env tests/blogSchema.test.ts
 * ```
 */

import { assertEquals } from "@std/assert";
import { z } from "zod";
import { create_blog_schema } from "../src/blogSchema.ts";
import { SITE } from "../src/config.ts";

// 測試用 image helper：
// Astro 真實傳入的是圖片 schema，這裡用字串代替，
// 只測「字串或圖片二選一」的分支形狀（.or 不存在會在建 schema 時就報錯）。
const schema = create_blog_schema(() => z.string());

/**
 * 建立最小合法 frontmatter。
 */
function make_frontmatter() {
  return {
    title: "中文標題測試",
    pubDatetime: new Date("2024-01-01T00:00:00.000Z"),
    description: "描述",
    tags: ["Tag1"],
  };
}

Deno.test("[blogSchema] accepts minimal valid frontmatter with defaults", () => {
  const parsed = schema.parse(make_frontmatter());
  assertEquals(parsed.author, SITE.author);
  assertEquals(parsed.tags, ["Tag1"]);
});

Deno.test("[blogSchema] applies tags default", () => {
  const { tags: _omitted, ...rest } = make_frontmatter();
  const parsed = schema.parse(rest);
  assertEquals(parsed.tags, ["others"]);
});

Deno.test("[blogSchema] accepts null and missing modDatetime", () => {
  const with_null = schema.parse({ ...make_frontmatter(), modDatetime: null });
  assertEquals(with_null.modDatetime, null);
  const missing = schema.parse(make_frontmatter());
  assertEquals(missing.modDatetime, undefined);
});

Deno.test("[blogSchema] rejects missing title and wrong draft type", () => {
  const { title: _omitted, ...no_title } = make_frontmatter();
  assertEquals(schema.safeParse(no_title).success, false);
  assertEquals(
    schema.safeParse({ ...make_frontmatter(), draft: "yes" }).success,
    false,
  );
});

Deno.test("[blogSchema] accepts string ogImage", () => {
  const parsed = schema.parse({
    ...make_frontmatter(),
    ogImage: "https://example.com/image.png",
  });
  assertEquals(parsed.ogImage, "https://example.com/image.png");
});
