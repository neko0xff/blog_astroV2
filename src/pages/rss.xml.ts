import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import getSortedPosts from "@/utils/getSortedPosts.ts";
import { SITE } from "@/config";


/**
 * RSS feed API 路由
 * - 成功時回傳 application/xml
 * - 失敗時回傳 500 與錯誤訊息
 * @returns 
 */
export async function GET() {
  const posts = await getCollection("blog");
  const sortedPosts = getSortedPosts(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(({ data, id }) => ({
      link: `posts/${id}/`,
      title: data.title,
      description: data.description,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
  });
}
