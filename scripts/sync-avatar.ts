import { SITE } from "../src/config.ts";

/**
 * @file 從 GitHub 頭像來源重新抓取自架頭像
 *
 * @description
 * - What：把 `SITE.avatar.src`（遠端來源）抓下來，產出兩份自架圖檔：
 *   1. `src/assets/img/avatar.jpg`：原尺寸，交給 astro:assets 管線
 *      （webp/avif 多密度、immutable 快取），供首頁 hero `<Image>` 使用。
 *   2. `public/assets/avatar.webp`：320px（retina 2x）webp，供 about 頁
 *      內文的 raw `<img>` 使用。
 * - Why：站上頭像一律自架，不對每位訪客發請求打 GitHub（privacy），
 *   也不依賴第三方可用性。遠端 URL 不當執行期備援——CSP `script-src
 *   'self'` 會擋掉 onerror inline handler；而是當「重新整理的來源」，
 *   頭像在 GitHub 換新後跑一次本腳本即可同步兩邊。
 * - Who：作者手動執行（`deno task sync:avatar`）。
 * - How：以 repo 根目錄為 cwd 的相對路徑讀寫（同 scripts/precompress.ts）。
 *
 * @note task 需帶 --allow-env 與 --unstable-ffi/--allow-ffi：sharp 在 Deno
 *   下會讀 `npm_package_config_libvips`，並以 FFI 載入 libvips 原生模組。
 */

/** astro:assets 管線來源（原尺寸）。 */
const OUT_PATH = "src/assets/img/avatar.jpg";

/** about 頁 raw <img> 使用的 public 副本（retina 2x）。 */
const PUBLIC_PATH = "public/assets/avatar.webp";
const PUBLIC_SIZE = 320;

/** 可接受的 JPEG/PNG/WebP 回應。 */
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

async function main(): Promise<void> {
  const response = await fetch(SITE.avatar.src);
  if (!response.ok) {
    throw new Error(`fetch failed: ${response.status} ${response.statusText}`);
  }

  const content_type = response.headers.get("content-type") ?? "";
  if (!ALLOWED_CONTENT_TYPES.has(content_type)) {
    throw new Error(`unexpected content-type: ${content_type}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());

  // 1. pipeline 來源：原尺寸交給 astro:assets 產出多密度 webp/avif
  await Deno.writeFile(OUT_PATH, bytes);
  console.log(`avatar synced -> ${OUT_PATH}`);

  // 2. public 副本：320px webp 給 about 頁 raw <img> 用
  const sharp = (await import("sharp")).default;
  await sharp(bytes).resize(PUBLIC_SIZE, PUBLIC_SIZE).webp().toFile(
    PUBLIC_PATH,
  );
  console.log(`avatar synced -> ${PUBLIC_PATH}`);
}

if (import.meta.main) {
  await main();
}
