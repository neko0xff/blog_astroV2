import type { APIRoute } from "astro";
import { generateOgImageForSite } from "@/utils/generateOgImages.ts";
import { Buffer } from "node:buffer";
import { SITE } from "@/config";

export const GET: APIRoute = async () => {
  try {
    const buffer: Buffer = await generateOgImageForSite();

    // 將 Buffer 轉為 Uint8Array
    // 以符合 Response body 型別
    return new Response(new Uint8Array(buffer), {
      headers: { "Content-Type": "image/png" },
    });
  } catch {
    const og_image = SITE.ogImage;
    const res = await fetch(`/${og_image}`);

    switch (res.ok) {
      case true:
        // 產生失敗時
        // 回退到 public/ 下的 SITE.ogImage 預設圖
        return new Response(await res.arrayBuffer(), {
          headers: {
            "Content-Type": og_image.endsWith(".png")
              ? "image/png"
              : "image/jpeg",
          },
        });
      default:
        // 若預設圖也找不到時
        return new Response(null, {
          status: 404,
          statusText: "OG image not found",
        });
    }
  }
};
