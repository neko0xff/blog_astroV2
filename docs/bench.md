# 基準測試維護

本文件說明如何為本專案撰寫、執行與維護 `bench/` 下的效能基準測試。

[回專案主頁](.././README.md)

## 1. 基本觀念

- `deno bench` 內建、免額外套件。
- 基準測試
  - 只回答「同一次執行下 A是否比 B 快」，不回答「上線後有多快」：後者看 `build` 時間或Lighthouse。

```typescript
Deno.bench({
  name: "新版",
  group: "slug",
  baseline: true,
  fn: () => {
    sink = slugifyStr(SAMPLE);
  },
});
```

## 2. 檔案位置與命名

```
bench/
├── slugify.bench.ts           # slugifyStr / slugifyAll
├── parseDate.bench.ts         # parse_date_timestamp
├── escapeHtml.bench.ts        # escape_html
├── closeVoidElements.bench.ts # close_void_elements
├── getPath.bench.ts           # getPath
├── sortPosts.bench.ts         # getSortedPosts 新舊版對照
├── uniqueTags.bench.ts        # getUniqueTags：findIndex 去重 vs Map 去重
├── postsByTag.bench.ts        # getPostsByTag：逐篇 slugify vs 預建索引
├── redirectsParse.bench.ts    # _redirects 行解析：split vs 正則
├── precompress.bench.ts       # gzip：全部壓縮 vs 先過濾副檔名
├── ogImage.bench.ts           # OG 管線：satori 短／長標題／站點模板／Resvg PNG
└── linkLoading.bench.ts       # 友站 JSON 解析（500 筆純函式，可重現）
```

- 檔名：`<模組名>.bench.ts`，一律 camelCase，與 `src/utils/` 對應。
- 格式化由 `deno fmt` 管（Prettier 不管 `bench/`，見 `AGENTS.md` §3.4）。

## 3. 執行

```bash
deno task bench                                        # 全部（-A，已含網路權限）
deno bench --unstable-kv --unstable-ffi bench/<檔名>.bench.ts  # 單檔
```

## 4. 撰寫規範

1. **一個 `Deno.bench` 只測一件事**，以 `group`＋`baseline` 分組比較。
2. **測試資料在 bench 外準備**，避免把建立時間算入結果。
3. **回傳值須被使用**：寫入模組級 `let sink` 並 `export { sink }`
   （防引擎優化＋過 `deno lint` 的 `no-unused-vars`）。
4. 只測純函式：字串處理、資料轉換、排序／搜尋、解析。
   不測 Astro 元件渲染、頁面載入、圖片（改用 `build` 時間或 Lighthouse）。
5. 新增的函式與類別必須有 TSDoc；註解寫給初學者看「為什麼這樣寫」。
6. 每個 bench 檔頭
   - 維持 Who／What／Where／How 註解
   - How 內的檔名須與實際檔名一致

## 5. 新增／修改／刪除流程

- **新增**：
  1. 確認 `src` 有對應純函式
  2. 抄最近的 `*.bench.ts` 格式
  3. fixture 貼近真實呼叫（可抄 `tests/` 的 mock）
  4. 跑單檔確認有 summary 對照輸出
  5. 更新 `docs/dev_guide.md` 的 bench 表格
- **修改 `src` 受測函式**：
  - 同步跑對應 bench，前後數據記入 PR 說明
  - 差異小於 5% 視為雜訊，不列為改善
- **刪除**：函式移除時 bench 一併刪除，不留孤兒檔。
  - 只回答「是否有優化槓桿」的 bench（如 `new URL` 兩組差 23ns、線上 fetch
    單次 minmax 差 2 倍）確認為雜訊後刪除，並同步更新本文件 §2 與
    `dev_guide.md` 表格。

## 6. 常見問題

### 6.1 `NotCapable: Requires net access`

- 直接跑 `deno bench bench/xxx.bench.ts` 不帶 `-A` 就會觸發
- 一律用 `deno task bench`（已含 `-A`），或單檔時補上 `-A --unstable-kv --unstable-ffi`。

### 6.2 `sink is never used`

- `let sink` 只寫不讀會被 `deno lint` 擋。
- 檔尾加 `export { sink };` 即可，無執行期成本。
