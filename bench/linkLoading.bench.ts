/**
 * @file Benchmark Link Loading
 *
 * ## 功能 (Who)
 * 測試友站連結 JSON 解析的效能（`public/assets/myLinks.json` 的內容形狀）
 *
 * ## 範圍（What)
 * - `JSON.parse`：單純解析 JSON 字串
 * - `JSON.parse + 欄位檢查`：解析後再驗證每筆是否有 `siteURL`（真實使用情境）
 *
 * ## 可能遇到的情況條件 (Where)
 * - JSON 格式錯誤（此處只用合法樣本，解析失敗會直接丟出例外）
 * - 非 ASCII 內容（樣本含中文、日文站名，與實際資料一致）
 *
 * ## 為什麼不用 fetch（初學者請看）
 * 舊版直接 `fetch` 遠端與本地網址來測速，有三個問題：
 * 1. 網路抖動大，每次跑的數字都不同，無法比較；
 * 2. 需要 `--allow-net` 權限，不加旗標跑就會 `NotCapable` 失敗；
 * 3. 本地組要求開發伺服器先跑在 `localhost:8085`，沒啟動就連線失敗。
 * 改測純函式 `JSON.parse` 後，不需要任何權限旗標，隨時可重現。
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

const SAMPLE_JSON =
  `[{"name":"Mikan","site":"Aaki's Notebook","siteURL":"https://blog.mikan.ac.cn","icon":"https://gravatar.loli.net/avatar/da416f8013b9815f1e1c81754fffd701?s=300"},` +
  `{"name":"Alpha UMi","site":"Cynosura","siteURL":"https://cynosura.one/","icon":"https://cynosura.one/img/avatar.webp"},` +
  `{"name":"高科技大脑指挥部","site":"高科技的指挥中心","siteURL":"https://blog.hightechbrain.net/","icon":"https://blog.hightechbrain.net/img/avatar.png"},` +
  `{"name":"Oさんです","site":"minetaro12","siteURL":"https://0sn.net","icon":"https://0sn.net/img/saber.png"}]`;

// 暫存解析結果，讓引擎無法把 `JSON.parse` 整段優化掉。
let sink = 0;

/**
 * 解析友站連結 JSON
 *
 * @description
 * 只回傳陣列長度（避免把物件建立成本之外的操作算入）
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
 * 真實渲染前一定會做這層過濾，否則壞資料會讓整頁連結失效。
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
