import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { BLOG_PATH } from "./config.ts";
import { create_blog_schema } from "./blogSchema.ts";

// 轉發 BLOG_PATH，維持 `from "../content.config.ts"` 的既有 import 相容性
export { BLOG_PATH };

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${BLOG_PATH}` }),
  schema: ({ image }) => create_blog_schema(image),
});

export const collections = { blog };
