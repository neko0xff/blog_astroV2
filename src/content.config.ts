import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
// `astro:content` 的 `z` re-export 已被棄用（ts6385）；Astro 7 的 content
// layer 以 zod v4 為基準，直接使用專案依賴的 `zod`，兩者為同一主版本。
import { z } from "zod";
import { BLOG_PATH, SITE } from "./config.ts";

// 轉發 BLOG_PATH，維持 `from "../content.config.ts"` 的既有 import 相容性
export { BLOG_PATH };

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

export const collections = { blog };
