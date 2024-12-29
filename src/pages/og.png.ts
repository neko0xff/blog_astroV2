import type { APIRoute } from "astro";
import { generateOgImageForSite } from "@utils/generateOgImages.tsx";

export const GET: APIRoute = async () =>
  new Response(await generateOgImageForSite(), {
    headers: { "Content-Type": "image/png" },
  });
