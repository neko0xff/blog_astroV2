import type { APIRoute } from "astro";
import { generateOgImageForSite } from "@/utils/generateOgImages.ts";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { SITE } from "../config.ts";

export const GET: APIRoute = async () => {
  try {
    const buffer: Buffer = await generateOgImageForSite();

    // 將 Buffer 轉為 Uint8Array
    // 以符合 Response body 型別
    return new Response(new Uint8Array(buffer), {
      headers: { "Content-Type": "image/png" },
    });
  } catch {
    // 產生失敗時回退到 public/ 下的 SITE.ogImage 預設圖。
    //
    // 為什麼用 readFile 而不是 fetch：這是建置期（prerender）程式碼，
    // 沒有 HTTP server，fetch("/webView.jpg") 這種相對 URL 在建置時
    // 必定拋 TypeError: Invalid URL，會從 catch 裡再往外 throw，
    // 把「OG 產生失敗」變成「整次建置失敗」，再乘上 CI 的 3 次重試。
    const og_image = SITE.ogImage;
    // ../../public/<name>：本檔位於 src/pages/，往上兩層才是 repo 根，
    // 預設圖放在 public/ 之下（也就是 Astro 會原樣複製到 dist/ 的來源）。
    const fallback_path = new URL(`../../public/${og_image}`, import.meta.url);

    try {
      const data = await readFile(fallback_path);

      return new Response(data, {
        headers: {
          "Content-Type": og_image.endsWith(".png")
            ? "image/png"
            : "image/jpeg",
        },
      });
    } catch {
      // 若預設圖也找不到
      return new Response(null, {
        status: 404,
        statusText: "OG image not found",
      });
    }
  }
};
