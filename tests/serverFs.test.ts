/**
 * @file Unit tests for serverFs
 *
 * ## 功能 (who)
 * - 自託管伺服器路徑安全：
 * 1. 存在檢查
 * 2. 防目錄穿越解析
 *
 * ## 範圍（what)
 * - `file_exists`：檔案／目錄／不存在
 * - `resolve_file`：一般檔、目錄轉 index.html、`..` 穿越、symlink 逃逸（含目錄內 index.html 二次檢查）、不存在
 *
 * ## 可能遇到的情況條件 (Where)
 * - temp dir fixture（需 `--allow-write` 建檔與 symlink）
 * - macOS temp 路徑本身即 symlink：不斷言絕對路徑字串，只斷言內容
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-write --allow-env tests/serverFs.test.ts
 * ```
 */

import { assertEquals } from "@std/assert";
import { file_exists, resolve_file } from "../public/server/fs.ts";

/**
 * 建 temp 站點根目錄：
 * root/index.html、root/sub/index.html，另有 root 外的 outside 區
 * （outside.txt＋index.html，供 symlink 逃逸測試用）。
 *
 * @returns 站點根目錄、站外檔、站外目錄路徑
 */
async function make_site(): Promise<
  { root: string; outside: string; outside_dir: string }
> {
  const root = await Deno.makeTempDir({ prefix: "site-" });
  const outside_dir = await Deno.makeTempDir({ prefix: "outside-" });
  await Deno.mkdir(`${root}/sub`, { recursive: true });
  await Deno.writeTextFile(`${root}/index.html`, "home");
  await Deno.writeTextFile(`${root}/sub/index.html`, "sub");
  const outside = `${outside_dir}/outside.txt`;
  await Deno.writeTextFile(outside, "secret");
  await Deno.writeTextFile(`${outside_dir}/index.html`, "secret");
  return { root, outside, outside_dir };
}

Deno.test("[serverFs] file_exists distinguishes files", async () => {
  const { root } = await make_site();
  assertEquals(file_exists(`${root}/index.html`), true);
  assertEquals(file_exists(`${root}/sub`), false);
  assertEquals(file_exists(`${root}/missing.html`), false);
});

Deno.test("[serverFs] resolve_file serves files and directory index", async () => {
  const { root } = await make_site();
  const home = resolve_file("/", root);
  assertEquals(home === null, false);
  assertEquals(await Deno.readTextFile(home!), "home");

  const sub = resolve_file("/sub/", root);
  assertEquals(sub === null, false);
  assertEquals(await Deno.readTextFile(sub!), "sub");
});

Deno.test("[serverFs] resolve_file blocks traversal", async () => {
  const { root } = await make_site();
  assertEquals(resolve_file("/../../etc/passwd", root), null);
  assertEquals(resolve_file("/sub/../../etc/passwd", root), null);
});

Deno.test("[serverFs] resolve_file blocks symlink escape", async () => {
  const { root, outside } = await make_site();
  // 檔 symlink：站內路徑實際指向站外
  await Deno.symlink(outside, `${root}/evil.html`);
  assertEquals(resolve_file("/evil.html", root), null);
});

Deno.test("[serverFs] resolve_file rechecks index.html behind dir symlink", async () => {
  const { root, outside_dir } = await make_site();
  // 目錄本身在 root 內，但其 index.html 指到站外：必須擋下
  await Deno.symlink(outside_dir, `${root}/dirlink`);
  assertEquals(resolve_file("/dirlink/", root), null);
});

Deno.test("[serverFs] resolve_file returns null for missing paths", async () => {
  const { root } = await make_site();
  assertEquals(resolve_file("/missing.html", root), null);
});
