import type { APIRoute } from "astro";
import { generateOgImageForSite } from "@/utils/generateOgImages.ts";

export const GET: APIRoute = async () => {
  try {
    const buffer: Buffer = await generateOgImageForSite();
    // 將 Buffer 轉為 Uint8Array 以符合 Response body 型別
    return new Response(new Uint8Array(buffer), {
      headers: { "Content-Type": "image/png" },
    });
  } catch (e) {
    // 產生失敗時回傳 public/og-default.png
    const res = await fetch('/og-default.png');
    if (res.ok) {
      return new Response(await res.arrayBuffer(), {
        headers: { "Content-Type": "image/png" },
      });
    } else {
      // 若預設圖也找不到，才回傳 404
      return new Response(null, {
        status: 404,
        statusText: "OG image not found",
      });
    }
  }
};
