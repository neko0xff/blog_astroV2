# blog_astroV2

Astro + Deno 部落格。回覆使用繁體中文（台灣用語），簡潔，直接給程式碼。

## 1. 指令

一律使用 `deno task <名稱>`，禁止直接執行 `astro`、`npm`（task 內含 `--unstable-ffi`、`--unstable-kv` 旗標）。

| 用途 | 指令 | 備註 |
|---|---|---|
| 開發 | `deno task dev` | `start` 為同義 |
| 建置 | `deno task build` | 輸出 `dist/` |
| 預覽 | `deno task preview` | 綁定 `0.0.0.0`，區網可存取 |
| 正式環境 | `deno task serve` | 須先 `build`，執行 `dist/server.ts` |
| Astro 型別檢查 | `deno task check` | |
| 內容同步 | `deno task sync` | 產生內容型別 |
| 搜尋索引 | `deno task pagefind` | 須先 `build` |
| Lint | `deno task lint` | 含 `--fix`，會直接修改檔案 |
| 格式化 (Deno) | `deno task fmt` | |
| 格式化 (Prettier) | `deno task format` | 會修改檔案 |
| 格式檢查 | `deno task format:check` | 唯讀 |
| 測試 | `deno task test` | 僅 `--allow-net` |
| 效能基準 | `deno task bench` | 檔案位於 `bench/` |
| 依賴檢查 | `deno task outdated:check` | 唯讀 |
| 依賴更新 | `deno task outdated:update` | 修改 `deno.json`，須經確認 |
| 安裝依賴 | `deno task install` | 含 Vite 非 ASCII 修補腳本 |
| 清理 | `deno task clean` | 刪除 `dist/` 與 `node_modules/`，須經確認 |
| 部署 (測試) | `deno task deploy:test` | org `nekolab`，app `dev-blog` |
| 部署 (正式) | `deno task deploy:release` | `--prod`，須經確認 |
| 容器啟動 | `docker compose up -d` | |
| 容器停止 | `docker compose down` | `-v` 會刪除 volume，須經確認 |

## 2. 完成前驗證（必做）

依序執行，全部通過才算完成：

1. `deno task fmt`
2. `deno task format:check`
3. `deno task lint`
4. `deno task check`
5. `deno task test`
6. `deno task build`

- 失敗須修正後重跑，不可略過。
- `lint` 會自動修正，執行後以 `git diff` 確認變更範圍，避免改到無關檔案。
- `fmt` 與 `format` 並存，若兩者格式衝突，以 `format:check` 結果為準並回報。
- 不在未驗證前宣稱完成。

## 3. 開發規範

### 3.1 程式碼規範

- TypeScript + Deno 相容，UTF-8。
- 先讀相鄰檔案，沿用現有風格與結構。
- 命名：變數/函式 `snake_case`（專案既有慣例）、類別/型別 `PascalCase`、常數 `UPPER_SNAKE_CASE`。
- 新增的函式與類別必須有 TSDoc。
- 優先純函式與不可變資料；避免不必要的抽象。
- 只改與任務相關的程式碼，不順手重構。

### 3.2 相依性

- 非必要不新增套件；新增時須說明理由與替代方案。
- 優先 Deno 標準庫與 Astro 內建功能。
- 版本固定；dev 與 production 依賴分開。

### 3.3 品質檢查重點

- 效能：圖片最佳化（Astro `<Image>`、lazy loading）、減少客戶端 JS、避免阻塞渲染。
- 安全：無硬編碼密鑰（用環境變數）、處理外部輸入時做驗證與跳脫、避免對不信任內容使用 `set:html`。
- 跨平台（Windows、Linux、macOS）：用 `node:path` / `URL` 處理路徑，不假設路徑分隔符。
- 維護：設定集中管理，不散落魔術值。

### 3.4 專案特殊規則

- `deno task install` 會執行 `scripts/patch-vite-nonascii.sh`（修補 Vite 非 ASCII 路徑問題）；重新安裝依賴須用此 task，不可改用 `deno install` 或 `npm install`。
- 修改該腳本或升級 Vite 前，須確認修補是否仍需要，並標註 `[套件版本]`。
- `pagefind` 的 `--include-characters` 已設定特殊字元，不可隨意移除。
- 現有 task 多以 `-A` 執行；新增 task 時，權限盡量最小化。
- `lint` 帶 `--fix`、`install` 帶外部腳本，行為超出名稱暗示，審查時特別留意。

### 3.5 文件查詢

- 套件/框架 API（Astro、Deno、npm 套件）：先用 `context7`。
- TypeScript 語言細節：`microsoft-learn`。
- 錯誤訊息與社群解法：一般網頁搜尋。
- 結果衝突時以官方文件為準，並附原始連結。

### 3.6 禁止事項

- 不執行破壞性指令（`rm -rf`、`docker compose down -v`、`git push --force`、`git reset --hard`、`deno task clean`），除非明確要求。
- 不提交 `.env` 或任何憑證。
- 不自行對正式環境部署。

## 4. 程式碼審查輸出格式

審查或重構建議時，依序輸出：

1. **改善項目清單**，優先級：安全性 > 效能 > 結構。每項包含：問題、影響、建議做法。效能類項目須附基準數據（見 5.3）。
2. **修改對照**：僅列受影響段落，使用 `diff` 區塊，可直接替換。

```diff
- 舊程式碼
+ 新程式碼
```

無問題時直接回報「未發現問題」，不得為湊數量而列項。

## 5. 審查規則與限制

### 5.1 語言與文件

- 使用台灣繁體中文技術用語：程式碼、函式庫、專案、登入、非同步、執行緒、記憶體。
- 新增或修改的程式碼，註解需讓初學者看得懂「為什麼這樣寫」；未修改的程式碼不補註解。

### 5.2 測試與驗證

- 執行 `deno task test`，回報結果；不得未執行就宣稱通過。
- 無測試檔或覆蓋不足：針對核心功能與邊界條件（空值、空陣列、超長字串、非法輸入、非 ASCII 字元）做靜態檢視，並列出建議補上的測試案例。
- 測試僅授權 `--allow-net`；若測試需要讀寫檔案，須先說明並更新 task，不可自行加 `-A`。

### 5.3 效能基準測試 (Benchmark)

提出效能優化建議時，須以 `deno bench` 提供修改前後的數據佐證，不得僅憑推測。

**適用範圍**

- 適用：純函式、資料轉換、字串處理、排序/搜尋、Markdown 解析等。
- 不適用：Astro 元件渲染、頁面載入、圖片載入；改用 `deno task build` 的建置時間或 Lighthouse。

**檔案規範**

- 位置：`bench/` 目錄（`deno task bench` 僅執行 `bench/*`）。
- 檔名：`<模組名>_bench.ts`。
- 一個 `Deno.bench` 只測一件事；以 `group` 與 `baseline` 分組比較。
- 測試資料在 bench 外準備，避免把建立時間算入結果。
- 被測函式的回傳值須被使用，避免被引擎最佳化掉。

**範本**

```ts
import { make_slug } from "../src/utils/slug.ts";

const SAMPLE = "Hello World 範例文章標題";

Deno.bench({
  name: "make_slug 舊版",
  group: "slug",
  baseline: true,
  fn: () => {
    make_slug_old(SAMPLE);
  },
});

Deno.bench({
  name: "make_slug 新版",
  group: "slug",
  fn: () => {
    make_slug(SAMPLE);
  },
});
```

**執行與回報**

- 全部：`deno task bench`
- 單檔：`deno bench -A --unstable-kv --unstable-ffi bench/<檔名>_bench.ts`
- 回報格式：

| 項目 | 舊版 (avg) | 新版 (avg) | 差異 |
|---|---|---|---|
| make_slug | 1.20 µs | 0.80 µs | -33% |

- 差異小於 5% 視為雜訊，不列為改善項目。
- 同一環境、同一次執行下比較，並註明 Deno 版本。
- 基準測試檔不納入 `deno task build` 產出。

### 5.4 程式碼衛生

- 程式碼與註解禁用 Unicode Emoji；發現即刪除。
- 檢查指令：`grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src/ bench/`

### 5.5 審查標籤

符合下列情境必須標註，嚴禁臆測或編造解法：

| 標籤 | 觸發條件 |
|---|---|
| `[無法查證]` | 第三方套件行為無法由程式碼、`deno.json` 或官方文件確認；無基準數據的效能主張 |
| `[邏輯矛盾]` | 程式碼與需求/規格衝突，需簡述衝突點；AGENTS.md 指令與 `deno.json` 實際 task 不一致時，以 `deno.json` 為準並回報 |
| `[套件版本]` | 引用第三方套件時，標註版本（例如 `astro v5.x`、`npm:zod v3.x`） |

版本來源以 `deno.json` / `package.json` 為準；查不到則同時標 `[無法查證]`。
