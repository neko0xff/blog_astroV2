/**
 * @file Unit tests for googleFont
 *
 * ## 功能 (who)
 * - Google Fonts 下載
 * - CSS 解析取字型 URL
 * - 錯誤路徑
 *
 * ## 範圍（what)
 * - `loadGoogleFonts(text)`：成功回兩份字型、data 為下載 bytes
 * - CSS 無匹配時拋錯（防靜默拿到空字型導致 OG 圖缺字）
 *
 * ## 可能遇到的情況條件 (Where)
 * - `fetch` 全 stub，不碰真實網路
 * - satori 渲染不在此測（需 FFI，由 build 背書）
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-write --allow-env tests/googleFont.test.ts
 * ```
 */

import { assertEquals, assertRejects } from "@std/assert";
import load_google_fonts from "../src/utils/loadGoogleFont.ts";

const FAKE_CSS =
  "@font-face{font-family:'LXGW';src: url(https://example.com/font.woff2) format('truetype');}";
const FAKE_BYTES = new Uint8Array([1, 2, 3, 4]);

/**
 * 以假 CSS／假字型 bytes 接管全域 fetch。
 *
 * @param css - 要回傳的 Google Fonts CSS（預設含合法 truetype 連結）
 */
function stub_fetch(css: string = FAKE_CSS): () => void {
  const original = globalThis.fetch;
  globalThis.fetch = ((input: unknown) => {
    const raw = String(input);
    let isGoogleFontsCss = false;
    try {
      const url = new URL(raw);
      isGoogleFontsCss = url.hostname === "fonts.googleapis.com";
    } catch {
      isGoogleFontsCss = false;
    }

    if (isGoogleFontsCss) {
      return Promise.resolve(new Response(css));
    }
    return Promise.resolve(new Response(FAKE_BYTES));
  }) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

Deno.test("[googleFont] downloads two weights", async () => {
  const restore = stub_fetch();
  try {
    const fonts = await load_google_fonts("測試");
    assertEquals(fonts.length, 2);
    assertEquals(fonts[0].name, "LXGW WenKai Mono TC");
    assertEquals(fonts[0].data.byteLength, FAKE_BYTES.length);
  } finally {
    restore();
  }
});

Deno.test("[googleFont] throws when CSS has no font URL", async () => {
  const restore = stub_fetch("body{color:red}");
  try {
    await assertRejects(
      () => load_google_fonts("測試"),
      Error,
      "Failed to download dynamic font",
    );
  } finally {
    restore();
  }
});
