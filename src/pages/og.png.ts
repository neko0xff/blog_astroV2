import type { APIRoute } from "astro";
import { generateOgImageForSite } from "@/utils/generateOgImages.ts";

export const GET: APIRoute = async () => {
  const buffer = await generateOgImageForSite();
  let uint8Array: Uint8Array;
  if (buffer instanceof Uint8Array) {
    uint8Array = buffer;
  } else if (buffer instanceof ArrayBuffer) {
    uint8Array = new Uint8Array(buffer);
  } else if (typeof Buffer !== "undefined" && buffer instanceof Buffer) {
    uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else {
    throw new Error("Unsupported buffer type returned from generateOgImageForSite");
  }
  return new Response(uint8Array, {
    headers: { "Content-Type": "image/png" },
  });
};
