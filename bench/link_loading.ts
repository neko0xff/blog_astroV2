/**
 * @file Benchmark Link Loading
 *
 * ## 功能 (Who)
 * 測試不同環境下的友站連結 JSON 檔案載入速度
 *
 * ## 範圍（What)
 * - `Data1()`：從 Deno Deploy 正式環境載入 myLinks.json
 * - `Data2()`：從本地開發伺服器載入 myLinks.json
 *
 * ## 可能遇到的情況條件 (Where)
 * - Deno Deploy 回應延遲高（跨國網路）
 * - 本地開發伺服器未啟動（localhost:8085 連線失敗）
 * - JSON 解析失敗（格式錯誤或回應為空）
 *
 * ## 執行(How)
 * ```bash
 * deno bench -A --unstable-kv --unstable-ffi bench/link_loading.ts
 * ```
 */

/**
 * @function From Deno Deploy (SaaS)
 *
 * ## 功能(Who)
 * 從 Deno Deploy 正式環境載入 myLinks.json
 *
 * @returns myLinks.json 的 JSON 資料
 */
async function Data1() {
  const source = "https://dev-blog.nekolab.deno.net/assets/myLinks.json";
  const jsonResponse = await fetch(source);
  const jsonData = await jsonResponse.json();

  //console.log(jsonData);
  return jsonData;
}

/**
 * @function From Local Dev Server
 *
 * ## 功能(Who)
 * 從本地開發伺服器載入 myLinks.json
 *
 * @returns myLinks.json 的 JSON 資料
 */
async function Data2() {
  const source = "http://localhost:8085/assets/myLinks.json";
  const jsonResponse = await fetch(source);
  const jsonData = await jsonResponse.json();

  //console.log(jsonData);
  return jsonData;
}

Deno.bench("[Data1] Deno Deploy Json", { baseline: true }, async () => {
  await Data1();
});

Deno.bench("[Data2] local Json", async () => {
  await Data2();
});
