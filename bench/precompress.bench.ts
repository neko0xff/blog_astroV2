/**
 * @file Benchmark precompress
 *
 * ## 功能 (Who)
 * - 比較預壓縮寫入路徑：直接 gzip 全文 vs 先檢查是否可壓縮副檔名
 *
 * ## 範圍（What)
 * - 舊版：對每個檔案直接跑 CompressionStream gzip
 * - 新版：先以 COMPRESSIBLE_EXT_RE 過濾，不可壓縮者略過
 *
 * ## 可能遇到的情況條件 (Where)
 * - HTML/JS/CSS（可壓縮）與 PNG/WOFF2（不可壓縮）混合
 * - fixture 在 bench 外準備
 * - 回傳值以 sink 累積避免被優化掉
 *
 * ## 執行(How)
 * ```bash
 * deno task bench
 * deno bench -A --unstable-kv --unstable-ffi bench/precompress.bench.ts
 * ```
 */

const COMPRESSIBLE_EXT_RE =
  /\.(html?|js|mjs|cjs|css|json|xml|txt|webmanifest|map|svg|ics)$/i;

const HTML = "<div>" + "hello 世界 ".repeat(500) + "</div>";
const HTML_BYTES = new TextEncoder().encode(HTML);
const NAMES = [
  "index.html",
  "client.js",
  "style.css",
  "logo.png",
  "font.woff2",
  "data.json",
];

/**
 * 直接 gzip（不檢查副檔名）
 */
async function gzip_all(): Promise<number> {
  let total = 0;
  for (const _name of NAMES) {
    const stream = new Blob([HTML_BYTES]).stream().pipeThrough(
      new CompressionStream("gzip"),
    );
    total += (await new Response(stream).arrayBuffer()).byteLength;
  }
  return total;
}

/**
 * 先過濾副檔名再 gzip（scripts/precompress.ts 現行策略）
 */
async function gzip_filtered(): Promise<number> {
  let total = 0;
  for (const name of NAMES) {
    if (!COMPRESSIBLE_EXT_RE.test(name)) continue;
    const stream = new Blob([HTML_BYTES]).stream().pipeThrough(
      new CompressionStream("gzip"),
    );
    total += (await new Response(stream).arrayBuffer()).byteLength;
  }
  return total;
}

let sink = 0;

Deno.bench({
  name: "[Precompress] All gzip",
  group: "precompress",
  baseline: true,
  fn: async () => {
    sink = await gzip_all();
  },
});

Deno.bench({
  name: "[Precompress] 先過濾再 gzip",
  group: "precompress",
  fn: async () => {
    sink = await gzip_filtered();
  },
});

export { sink };
