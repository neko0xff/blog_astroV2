import { Resvg } from "@resvg/resvg-js";
import { type CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post.ts";
import siteOgImage from "./og-templates/site.ts";
import { Buffer } from "node:buffer";

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng().buffer);
}

export async function generateOgImageForPost(post: CollectionEntry<"blog">) {
  const svg = await postOgImage(post);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSite() {
  const svg = await siteOgImage();
  return svgBufferToPngBuffer(svg);
}
