/**
 * @file 部落格 Markdown 不可產生空 href 連結
 *
 * ## 功能 (who)
 * 掃描 `src/data/blog/` 所有文章，擋掉會渲染成 `<a href="">` 的寫法。
 *
 * ## 為什麼 (why)
 * CommonMark 的 `[text]()` 與 `[text](<>)` 都是「空目的地」，渲染器會輸出
 * `<a href="">`。空 href 的錨點：鍵盤無法聚焦操作、Lighthouse SEO 的
 * is-crawlable 稽核會整站判為 links-not-crawlable（子項
 * "Invalid `href` attribute"）、SEO 分數被一篇文拖垮。
 *
 * ## 範圍（what)
 * - 行內連結空目的地：`]()` 與 `](<>)`
 * - 跳過圍欄程式碼區塊與行內 code，避免範例碼誤判
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read tests/markdownLinks.test.ts
 * ```
 */

import { assertEquals } from "@std/assert";

const BLOG_DIR = new URL("../src/data/blog/", import.meta.url);

/** 常見的文章副檔名。 */
const POST_EXTENSIONS = [".md", ".mdx"] as const;

/**
 * 移除圍欄程式碼區塊與行內 code，只留正文。
 *
 * @param text - Markdown 原文
 * @returns 去掉程式碼片段後的正文
 */
function strip_code(text: string): string {
  return text
    .replace(/^ {0,3}(`{3,}|~{3,})[\s\S]*?^\s*\1/gm, "")
    .replace(/`[^`\n]*`/g, "");
}

/**
 * 遞迴收集目錄下的文章檔案路徑。
 *
 * @param dir - 要掃描的目錄 URL
 * @returns 文章檔案的 URL 陣列
 */
async function collect_posts(dir: URL): Promise<URL[]> {
  const found: URL[] = [];
  for await (const entry of Deno.readDir(dir)) {
    const entry_url = new URL(entry.name, dir);
    if (entry.isDirectory) {
      found.push(...(await collect_posts(entry_url)));
    } else if (POST_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      found.push(entry_url);
    }
  }
  return found;
}

Deno.test("[markdown] no empty link destinations", async () => {
  const files = await collect_posts(BLOG_DIR);
  assertEquals(files.length > 0, true);

  const violations: string[] = [];
  for (const file of files) {
    const text = await Deno.readTextFile(file);
    strip_code(text)
      .split("\n")
      .forEach((line, index) => {
        // ](＜空白＞) 或 ](＜＞)：空目的地 → marked 輸出 <a href="">
        if (/\]\(\s*\)/.test(line) || /\]\(<>\s*\)/.test(line)) {
          violations.push(`${file.pathname}:${index + 1}: ${line.trim()}`);
        }
      });
  }

  assertEquals(
    violations,
    [],
    '空連結目的地會渲染成 <a href="">，請補上真實網址或改為純文字',
  );
});
