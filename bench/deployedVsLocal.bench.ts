/**
 * @file Benchmark deployed vs local
 *
 * ## 功能 (Who)
 * - 比較同一份 `assets/myLinks.json` 從 Deno Deploy 正式環境 vs 本地 preview 伺服器的載入速度（fetch + JSON 解析）
 *
 * ## 範圍（What)
 * - `[Net] Deno Deploy`：`https://dev-blog.nekolab.deno.net/assets/myLinks.json`
 * - `[Net] 本地 preview`：`http://localhost:8085/assets/myLinks.json`
 *
 * ## 前置條件 (Where)
 * - 本地組需先跑 `deno task preview`（port 8085，吃 `dist/`，改完要重 `build`）
 * - 需 `--allow-net`（`deno task bench` 已含 `-A`，直接跑 task 即可）
 * - 任一端點連不上（未啟動、無網路、無權限）會自動略過，不拖累整批 bench
 *
 * ## 執行(How)
 * ```bash
 * deno task preview   # 另開終端，先啟本地端
 * deno task bench
 * ```
 */

const REMOTE_URL = "https://dev-blog.nekolab.deno.net/assets/myLinks.json";
const LOCAL_URL = "http://localhost:8085/assets/myLinks.json";
const CONTAINER_URL = "http://localhost:8585/assets/myLinks.json";

/**
 * 探測端點是否可達。
 *
 * 任何失敗（伺服器沒啟、無網路、缺 `--allow-net` 權限、逾時、非 2xx）
 * 都回傳 false，讓該組 bench 自動略過而不是整個炸掉。
 *
 * @param url - 要探測的網址
 * @returns 可達回傳 true
 */
async function probe_endpoint(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    await res.body?.cancel();
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 下載友站連結 JSON 並回傳筆數（模擬真實載入流程：fetch + parse）。
 *
 * @param url - JSON 網址
 * @returns 連結筆數
 */
async function fetch_link_count(url: string): Promise<number> {
  const res = await fetch(url);
  return (await res.json() as unknown[]).length;
}

// 模組載入時先探測，連不上的端點其 bench 以 ignore 略過。
const [remote_ok, local_ok] = await Promise.all([
  probe_endpoint(REMOTE_URL),
  probe_endpoint(LOCAL_URL),
]);

let sink = 0;

Deno.bench({
  name: "[Network] Deno Deploy",
  group: "net-links",
  baseline: true,
  ignore: !remote_ok,
  fn: async () => {
    sink = await fetch_link_count(REMOTE_URL);
  },
});

Deno.bench({
  name: "[Network] Local Dev",
  group: "net-links",
  ignore: !local_ok,
  fn: async () => {
    sink = await fetch_link_count(LOCAL_URL);
  },
});

Deno.bench({
  name: "[Network] Docker Container",
  group: "net-links",
  ignore: !local_ok,
  fn: async () => {
    sink = await fetch_link_count(CONTAINER_URL);
  },
});

export { sink };
