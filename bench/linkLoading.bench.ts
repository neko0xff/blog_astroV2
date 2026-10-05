/**
 * @file Benchmark Link Loading
 *
 * ## 功能 (Who)
 * 測試友站連結 JSON （`public/assets/myLinks.json`）解析的效能
 *
 * ## 範圍（What)
 * - `JSON.parse`：單純解析 JSON 字串（500 筆）
 * - `JSON.parse + 欄位檢查`：解析後再驗證每筆是否有 `siteURL`（真實使用情境，含 2% 空值）
 *
 * ## 可能遇到的情況條件 (Where)
 * - JSON 格式錯誤（此處只用合法樣本，解析失敗會直接丟出例外）
 * - 非 ASCII 內容（站名含中文，與實際資料一致）
 * - fixture 在 bench 外一次建好（500 筆，約真實資料的量級放大）
 *
 * ## 執行(How)
 * ```bash
 * deno task bench
 * deno bench --unstable-kv --unstable-ffi bench/linkLoading.bench.ts
 * ```
 */

type friend_link = {
  name: string;
  site: string;
  siteURL: string;
  icon: string;
};

const SAMPLE_LINKS: friend_link[] = Array.from(
  { length: 500 },
  (_, i) => ({
    name: `站點${i}號`,
    site: `Site ${i}`,
    siteURL: i % 50 === 0 ? "" : `https://example-${i}.net/`,
    icon: `https://example-${i}.net/img/avatar.png`,
  }),
);

const SAMPLE_JSON = JSON.stringify(SAMPLE_LINKS);

let sink = 0;

/**
 * 解析友站連結 JSON
 *
 * @description
 * - 只回傳陣列長度
 * - 避免把物件建立成本之外的操作算入
 *
 * @param raw - JSON 字串
 * @returns 解析出的連結筆數
 */
function parse_link_count(raw: string): number {
  return (JSON.parse(raw) as friend_link[]).length;
}

/**
 * 解析友站連結 JSON，並檢查每筆是否有合法的 `siteURL`。
 *
 * @description
 * - 真實渲染前一定會做這層過濾
 * - 否則壞掉的資料會讓整頁連結失效
 *
 * @param raw - JSON 字串
 * @returns 通過檢查的連結筆數
 */
function parse_link_checked(raw: string): number {
  const links = JSON.parse(raw) as friend_link[];
  return links.filter((link) =>
    typeof link.siteURL === "string" && link.siteURL.length > 0
  ).length;
}

Deno.bench({
  name: "[Parse] JSON.parse",
  group: "link-json-parse",
  baseline: true,
  fn: () => {
    sink = parse_link_count(SAMPLE_JSON);
  },
});

Deno.bench({
  name: "[Parse] JSON.parse + siteURL Check",
  group: "link-json-parse",
  fn: () => {
    sink = parse_link_checked(SAMPLE_JSON);
  },
});

export { sink };
