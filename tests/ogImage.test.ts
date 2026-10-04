/**
 * @file Unit tests for ogImage PNG pipeline
 *
 * ## 功能 (who)
 * - OG 圖完整管線（satori SVG → Resvg → PNG）
 * - 斷言輸出為合法 PNG、尺寸為 1200x630
 * - SVG 層的模板語意由 `ogTemplate.test.ts` 覆蓋，只守「轉得出正確尺寸的 PNG」
 *
 * ## 範圍（what)
 * - `generateOgImageForPost`／`generateOgImageForSite`：PNG 簽名、IHDR 寬高
 *
 * ## 可能遇到的情況條件 (Where)
 * - 字型走真實網路下載（`deno task test:og` 已含 `--allow-net`）
 * - `Buffer` 可能是池化 `ArrayBuffer` 的切片：讀寬高必須帶
 *   `buf.byteOffset` 開視窗，否則偏移算錯位置
 * - 非 ASCII 標題（中文轉向量路徑，不影響簽名斷言）
 *
 * ## 執行(how)
 * ```bash
 * deno task test:og
 * ```
 * 預設 `deno task test` 下本檔 2 測顯示 ignored 屬正常（缺 FFI 權限，
 * 詳見 docs/testing.md §8.7）。
 */

import { assertEquals } from "@std/assert";
import type { CollectionEntry } from "astro:content";

// 是否執行本檔：
// 靜態 import 會在模組載入期就觸發 Resvg NAPI 載入而炸掉，故測試內動態 import，並以環境變數守門（預設略過）。
const OG_ENABLED = Deno.env.get("OG_TEST") === "1";

/** PNG 簽名（89 50 4E 47 0D 0A 1A 0A）。 */
const PNG_SIG = [137, 80, 78, 71, 13, 10, 26, 10];

/**
 * 讀 PNG IHDR 的寬高（大端序，偏移 16／20；前 8 位元組為固定簽名）。
 *
 * @param buf - PNG bytes
 * @returns 寬高（像素）
 */
function png_size(buf: Uint8Array): { width: number; height: number } {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

Deno.test({
  name: "[ogImage] post renders 1200x630 PNG",
  ignore: !OG_ENABLED,
  fn: async () => {
    const { generateOgImageForPost } = await import(
      "../src/utils/generateOgImages.ts"
    );
    const post = {
      data: { title: "中文標題測試", author: "neko0xff" },
    } as unknown as CollectionEntry<"blog">;
    const buf = await generateOgImageForPost(post);
    assertEquals(Array.from(buf.subarray(0, 8)), PNG_SIG);
    assertEquals(png_size(buf), { width: 1200, height: 630 });
  },
});

Deno.test({
  name: "[ogImage] site renders 1200x630 PNG",
  ignore: !OG_ENABLED,
  fn: async () => {
    const { generateOgImageForSite } = await import(
      "../src/utils/generateOgImages.ts"
    );
    const buf = await generateOgImageForSite();
    assertEquals(Array.from(buf.subarray(0, 8)), PNG_SIG);
    assertEquals(png_size(buf), { width: 1200, height: 630 });
  },
});
