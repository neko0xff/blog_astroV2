import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { getPath } from "@/utils/getPath";
import { generateOgImageForPost } from "@/utils/generateOgImages";
import { SITE } from "@/config";

/**
 *  Generates static paths for posts with dynamic OG images.
 * @returns An array of paths for posts that need OG images.
 */
export async function getStaticPaths() {
  if (!SITE.dynamicOgImage) {
    return [];
  }

  const posts = await getCollection("blog").then(p =>
    p.filter(({ data }) => !data.draft && !data.ogImage)
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
    // Convert Buffer to Uint8Array for web Response compatibility
    const pngArray = png.buffer as ArrayBuffer;
    return new Response(pngArray, {
      headers: { "Content-Type": "image/png" },
    });
  } catch (e) {
    // 可根據需求回傳預設圖片
    return new Response(null, {
      status: 500,
      statusText: "OG image error",
    });
  }
};
