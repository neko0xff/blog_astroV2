import type { APIRoute } from "astro";
import { type CollectionEntry, getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import { generateOgImageForPost } from "@/utils/generateOgImages";
import { isBlogPost } from "@/utils/isBlogPost";
import { SITE } from "@/config";

/**
 *  Generates static paths for posts with dynamic OG images.
 * @returns An array of paths for posts that need OG images.
 */
export async function getStaticPaths() {
  if (!SITE.dynamicOgImage) {
    return [];
  }

  const posts = await getCollection("blog").then((p) =>
    p.filter(
      (entry) => !entry.data.draft && !entry.data.ogImage && isBlogPost(entry),
    )
  );

  return posts.map((post) => ({
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
