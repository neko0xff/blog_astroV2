/**
 * @file Unit tests for precompress
 *
 * ## 功能 (who)
 * - 預壓縮腳本的可測試部分：
 * 1. 副檔名過濾
 * 2. 與 server 壓縮清單一致性
 * 3. 遞迴收集
 *
 * ## 範圍（what)
 * - `COMPRESSIBLE_EXT_RE`：可壓縮／不可壓縮副檔名
 * - 與 `public/server/config.ts` 的同名正則 `.source` 相等（防漂移）
 * - `collect_files(dir)`：遞迴、不含目錄本身、回傳皆為檔
 *
 * ## 可能遇到的情況條件 (Where)
 * - 大小寫副檔名（.HTML）、temp dir fixture（需 `--allow-write` 建檔）
 * - mtime 粒度抖動：過期案例用 `utime` 把 .gz 倒回 epoch，而非等時鐘前進
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env tests/precompress.test.ts
 * ```
 */

import { assertEquals } from "@std/assert";
import {
  collect_files,
  compress_file,
  COMPRESSIBLE_EXT_RE as script_re,
} from "../scripts/precompress.ts";
import { COMPRESSIBLE_EXT_RE as server_re } from "../public/server/config.ts";

Deno.test("[precompress] matches compressible extensions", () => {
  for (
    const name of [
      "index.html",
      "PAGE.HTML",
      "client.js",
      "style.css",
      "sitemap.xml",
      "logo.svg",
      "data.map",
    ]
  ) {
    assertEquals(script_re.test(name), true, name);
  }
});

Deno.test("[precompress] rejects binary extensions", () => {
  for (const name of ["logo.png", "font.woff2", "clip.mp4", "doc.pdf"]) {
    assertEquals(script_re.test(name), false, name);
  }
});

Deno.test("[precompress] mirrors server COMPRESSIBLE_EXT_RE", () => {
  assertEquals(script_re.source, server_re.source);
});

Deno.test("[precompress] collect_files lists files recursively", () => {
  const files = collect_files("public/assets");
  assertEquals(files.length > 0, true);
  assertEquals(
    files.every((path) => path.startsWith("public/assets")),
    true,
  );
  assertEquals(
    files.every((path) => Deno.statSync(path).isFile),
    true,
  );
});

Deno.test("[precompress] compress_file writes .gz and skips up-to-date", async () => {
  const dir = await Deno.makeTempDir({ prefix: "precompress-" });
  const src = `${dir}/a.html`;
  await Deno.writeTextFile(src, "<h1>hi</h1>".repeat(100));

  assertEquals(await compress_file(src), true);
  assertEquals(Deno.statSync(`${src}.gz`).isFile, true);
  // 已是最新：略過
  assertEquals(await compress_file(src), false);

  // 把 .gz 倒回舊時間：視為過期，重壓回傳 true
  Deno.utimeSync(`${src}.gz`, new Date(0), new Date(0));
  assertEquals(await compress_file(src), true);
});
