import type { APIRoute } from "astro";
import { type CollectionEntry, getCollection } from "astro:content";
import { getPath } from "../../../utils/getPath.ts";
import { generateOgImageForPost } from "../../../utils/generateOgImages.ts";
import { isBlogPost } from "../../../utils/isBlogPost.ts";
import { post_filter } from "../../../utils/postFilter.ts";
import { SITE } from "../../../config.ts";

/**
 *  Generates static paths for posts with dynamic OG images.
 * @returns An array of paths for posts that need OG images.
 */
export async function getStaticPaths() {
  if (!SITE.dynamicOgImage) {
    return [];
  }

  const posts = await getCollection("blog").then(p =>
    p.filter(
      // 與 index.astro 用同一個發布閘門 post_filter，否則排程中的文章
      // 會提前產生公開頁面與 OG 圖。箭頭包起來的原因見 index.astro 的註解：
      // 直接傳 post_filter 會讓 Array.filter 把陣列索引當成 is_dev。
      entry =>
        !entry.data.ogImage &&
        isBlogPost(entry) &&
        post_filter(entry, import.meta.env.DEV)
    )
  );

  return posts.map(post => ({
    params: { slug: getPath(post.id, post.filePath, false) },
    props: post,
  }));
}

/**
 * Generates the OG image for a specific post.
 * @param param0 The props containing the post data.
 * @returns A Response containing the generated OG image.
 */
export const GET: APIRoute = async ({ props }) => {
  if (!SITE.dynamicOgImage) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  try {
    const png = await generateOgImageForPost(props as CollectionEntry<"blog">);
    const pngArray = png.buffer as ArrayBuffer;

    return new Response(pngArray, {
      headers: { "Content-Type": "image/png" },
    });
  } catch {
    return new Response(null, {
      status: 500,
      statusText: "OG image error",
    });
  }
};
