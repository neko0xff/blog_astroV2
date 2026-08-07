import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import getSortedPosts from "@/utils/getSortedPosts.ts";
import { isBlogPost } from "../utils/isBlogPost.ts";
import { SITE } from "../config.ts";

/**
 * 從 markdown 內文擷取 RSS description 用文字
 * - 移除特定項目的標記
 *    * 程式碼區塊
 *    * 標題
 *    * 列表
 *    * 引用
 *    * 行內碼
 * - 並壓縮不必要的空白
 *
 * @param body markdown 內文
 * @returns 擷取後的前 120 字元描述
 */
function extractDescription(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, "") // 移除程式碼區塊
    .replace(/[#>*`]/g, "") // 移除標題/列表/引用/行內碼標記
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // 連結取顯示文字
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

/**
 * RSS feed API 路由
 * - 成功時回傳 application/xml
 * - 失敗時回傳 500 與錯誤訊息
 * - 排除有獨立頁面的 entry（about / terms），避免與站內頁面重複內容
 *
 * @returns RSS 訂閱內容
 */
export async function GET() {
  const posts = await getCollection("blog", isBlogPost);
  const sortedPosts = getSortedPosts(posts);

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(({ data, id, body }) => ({
      link: `posts/${id}/`,
      title: data.title,
      description: data.description || extractDescription(body ?? ""),
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
  });
}
