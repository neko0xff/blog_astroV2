/**
 * @file Benchmark redirectsParse
 *
 * ## 功能 (Who)
 * 比較 _redirects 規則行解析：現行 split 寫法 vs 正則化寫法
 *
 * ## 範圍（What)
 * - 舊版（src 現行）：去註解後 split(/\\s+/) 取三欄
 * - 新版：單一正則一次擷取 source/destination/status
 *
 * ## 可能遇到的情況條件 (Where)
 * - 註解行
 * - 空行
 * - 非 ASCII 路徑
 * - 缺 status（預設 302）
 * - fixture 在 bench 外一次建好（44 行真實規則放大 20 倍）
 *
 * ## 執行(How)
 * ```bash
 * deno task bench
 * deno bench -A --unstable-kv --unstable-ffi bench/redirectsParse.bench.ts
 * ```
 */

const SAMPLE_LINES = [
  "# 註解行",
  "",
  "/posts/windows-16bit/ /posts/windows-16-bit/ 301",
  "/posts/Ansible-安裝&相關設置/ /posts/ansible-安裝-相關設置/ 301",
  "/old-path /new-path",
  "/bad-rule not-a-status xyz",
];

const TEXT = Array(20).fill(SAMPLE_LINES.join("\n")).join("\n");

/**
 * 現行寫法（public/server/redirects.ts 原樣複刻為純函式）
 *
 * @param text - _redirects 全文
 */
function parse_split(text: string): Map<string, string> {
  const rules = new Map<string, string>();
  for (const line of text.split("\n")) {
    const rule = line.split("#")[0].trim();
    if (!rule) continue;
    const parts = rule.split(/\s+/);
    if (parts.length < 2) continue;
    const [source, destination, status] = parts;
    const code = Number(status ?? 302);
    if (!Number.isInteger(code) || code < 300 || code > 399) continue;
    rules.set(source, destination);
  }
  return rules;
}

/**
 * 候選寫法：單一正則擷取
 *
 * @param text - _redirects 全文
 */
function parse_regex(text: string): Map<string, string> {
  const rules = new Map<string, string>();
  const re = /^([^#\s]+)\s+([^#\s]+)(?:\s+(\d+))?/gm;
  for (const match of text.matchAll(re)) {
    const code = Number(match[3] ?? 302);
    if (!Number.isInteger(code) || code < 300 || code > 399) continue;
    rules.set(match[1], match[2]);
  }
  return rules;
}

let sink = 0;

Deno.bench({
  name: "[Redirects] split 解析",
  group: "redirects-parse",
  baseline: true,
  fn: () => {
    sink = parse_split(TEXT).size;
  },
});

Deno.bench({
  name: "[Redirects] 正則解析",
  group: "redirects-parse",
  fn: () => {
    sink = parse_regex(TEXT).size;
  },
});

export { sink };
