import { z } from "zod";
// `astro:content` 的 `z` re-export 已被棄用（ts6385）；Astro 7 的 content
// layer 以 zod v4 為基準，直接使用專案依賴的 `zod`，兩者為同一主版本。
import { SITE } from "./config.ts";

/**
 * 建立部落格文章的 frontmatter schema。
 *
 * 刻意放在零相依模組（只 import `zod` 與 `src/config.ts`）：
 * 1. `content.config.ts`的 `defineCollection` 是 Astro 建置期虛擬模組 `astro:content` 的值匯入，Deno 原生跑測試時無法解析
 * 2. 抽到這裡後，測試可直接引用此 factory，而 `content.config.ts` 只剩薄包裝。
 *
 * @param image - Astro 傳入的圖片 schema helper（`schema: ({ image })` 的參數），
 *                以泛型保留其具體型別，避免推斷塌成 `{}` 而讓使用端
 *               （`PostDetails.astro` 等）的 `ogImage.src` 報錯；
 *                測試可用 `() => z.string()` 代入
 * @returns 部落格文章的 zod object schema
 */
export function create_blog_schema<T extends z.ZodType>(image: () => T) {
  return z.object({
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
  });
}
