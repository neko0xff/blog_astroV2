# blog_astroV2

Astro + Deno 部落格。回覆一律使用繁體中文（台灣用語），簡潔，直接給程式碼或指令。

用語：程式碼、函式庫、專案、登入、非同步、執行緒、記憶體。

## 1. 指令

只用 `deno task <名稱>`；禁止直接執行 `astro`、`npm`（task 內含 `--unstable-ffi`、`--unstable-kv`）。
標記：`[W]` 會修改檔案、`[C]` 須使用者確認後才可執行、`[R]` 唯讀。

| 用途 | 指令 | 標記 | 備註 |
|---|---|---|---|
| 開發 | `deno task dev` | R | `start` 同義 |
| 建置 | `deno task build` | W | 輸出 `dist/` |
| 預覽 | `deno task preview` | R | 綁定 `0.0.0.0` |
| 正式啟動 | `deno task serve` | R | 須先 `build`；執行 `dist/server.ts` |
| Astro 型別檢查 | `deno task check` | R | 不含 `tests/` |
| 測試型別檢查 | `deno task check:tests` | R | `tsconfig.tests.json` |
| 內容同步 | `deno task sync` | W | 產生內容型別 |
| 搜尋索引 | `deno task pagefind` | W | 須先 `build` |
| Lint | `deno task lint` | W | 含 `--fix` |
| 格式化 (Deno) | `deno task fmt` | W | 管 `tests/`、`bench/`、`scripts/` |
| 格式化 (Prettier) | `deno task format` | W | 管 `src/`、`public/`、`docs/` |
| 格式檢查 | `deno task format:check` | R | |
| 測試 | `deno task test` | R | 僅 `--allow-net` |
| 效能基準 | `deno task bench` | R | 檔案在 `bench/` |
| 依賴檢查 | `deno task outdated:check` | R | |
| 依賴更新 | `deno task outdated:update` | W C | 修改 `deno.json` |
| 安裝依賴 | `deno task install` | W | 含 Vite 非 ASCII 修補腳本 |
| 清理 | `deno task clean` | W C | 刪除 `dist/`、`node_modules/` |
| 部署 (測試) | `deno task deploy:test` | W | org `nekolab`、app `dev-blog` |
| 部署 (正式) | `deno task deploy:release` | W C | `--prod` |
| 容器啟動 | `docker compose up -d` | W | |
| 容器停止 | `docker compose down` | W | 加 `-v` 須 C |

## 2. 完成前驗證（必做）

依序執行，全部通過才可宣稱完成，未執行不得宣稱通過：

1. `deno task lint`
2. `deno task fmt`
3. `deno task format:check`（失敗 → `deno task format` 後重跑）
4. `deno task check`
5. `deno task check:tests`
6. `deno task test`
7. `deno task build`
8. `deno task pagefind`

- 失敗須修正後從失敗步驟重跑，不可略過。
- `lint --fix` 後以 `git diff` 確認未改到無關檔案。
- `fmt` 與 `format` 結果衝突時，以 `format:check` 為準並回報。
- 本清單與 Makefile 的 `deno_code_review` 目標須同步；增刪步驟時兩處一併改。

## 3. 開發規範

### 3.1 程式碼

- TypeScript + Deno 相容，UTF-8；先讀相鄰檔案，沿用既有風格。
- 命名：變數/函式 `snake_case`（專案慣例）、類別/型別 `PascalCase`、常數 `UPPER_SNAKE_CASE`。
- 新增函式/類別必須有 TSDoc/JSDoc；新增或修改處的註解說明「為什麼」，未修改處不補註解。
- 優先純函式與不可變資料；避免不必要抽象。
- 只改與任務相關的程式碼，不順手重構。
- 禁用 Unicode Emoji（程式碼與註解）。檢查：
  `grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src/ bench/`

### 3.2 相依性

- 非必要不新增套件；新增須說明理由與替代方案。
- 優先 Deno 標準庫與 Astro 內建功能。
- 版本固定；dev 與 production 依賴分開。

### 3.3 品質重點

- 效能：Astro `<Image>`、lazy loading、減少客戶端 JS、避免阻塞渲染。
- 安全：密鑰用環境變數；外部輸入須驗證與跳脫；不對不信任內容用 `set:html`。
- 跨平台：用 `node:path` / `URL` 處理路徑，不假設分隔符。
- 設定集中管理，不散落魔術值。

### 3.4 專案特殊規則

- `astro:content`、`astro:transitions` 為 Vite 建置期虛擬模組，Deno 無法解析。因此 `src/utils/` 下的模組：
  - 不得 import `content.config.ts`（常數改從 `src/config.ts` 取得）。
  - 不得使用 `import.meta.env`（改為可注入參數，由 `.astro` 呼叫端傳入）。
  - 詳見 `docs/testing.md` §8.2、§8.3。
- 格式化分工：Prettier 管 `src/`、`public/`、`docs/`（`arrowParens: "avoid"`）；`deno fmt` 管 `tests/`、`bench/`、`scripts/`。權責由 `deno.json` 的 `fmt.exclude` 劃分，不可互相覆寫。
- 文章網址由 `getPath()` 產生（id 套用 `slugifyStr()`）。改 slug 規則或文章改名會使舊網址失效，須在 `public/_redirects` 補 301，每個來源註冊帶／不帶尾端斜線兩種形式（staticd 與 `dist/server.ts` 共用此檔）。
- 重新安裝依賴只能用 `deno task install`（會執行 `scripts/patch-vite-nonascii.sh`），不可用 `deno install`、`npm install`。
- 該腳本目前只修補 Vite 7.x，8.x 會跳過；修改腳本或升級 Vite 前須確認修補是否仍需要，並標註 `[套件版本]`。
- `pagefind` 的 `--include-characters` 已設定特殊字元，不可移除。
- 現有 task 多用 `-A`；新增 task 時權限盡量最小化。
- `lint` 帶 `--fix`、`install` 帶外部腳本，行為超出名稱暗示，審查時特別留意。

### 3.5 文件查詢

| 需求 | 工具 |
|---|---|
| Astro、Deno、npm 套件 API | `context7` |
| TypeScript 語言細節 | `microsoft-learn` |
| 錯誤訊息、社群解法 | 網頁搜尋 |

結果衝突時以官方文件為準，並附原始連結。

### 3.6 禁止事項

- 不執行破壞性指令：`rm -rf`、`docker compose down -v`、`git push --force`、`git reset --hard`、`deno task clean`；除非使用者明確要求。
- 不提交 `.env` 或任何憑證。
- 不自行對正式環境部署。

### 3.7 SEO

修改頁面、版面配置（layout）、文章 frontmatter、路由或 `public/` 時適用。

**每頁必備（於共用 layout 集中處理，不在各頁重複）**

- `<html lang="zh-TW">`。
- `<title>`：每頁唯一，建議 60 字元內；首頁以外格式 `文章標題 | 站名`。
- `<meta name="description">`：每頁唯一，建議 120 字元內，不得為空或與其他頁重複；文章缺 `description` 時須有後備值（取摘要），不可輸出空字串。
- `<link rel="canonical">`：絕對網址，與 `getPath()` 產生的路徑一致；帶尾端斜線規則與 `_redirects` 一致。
- Open Graph / Twitter Card：`og:title`、`og:description`、`og:type`、`og:url`、`og:image`（絕對網址）、`twitter:card`。
- 單頁僅一個 `<h1>`；標題層級不跳級（h2 → h3）。
- 不想被收錄的頁面（草稿、404、搜尋結果）輸出 `<meta name="robots" content="noindex">`，並自 sitemap 排除。

**結構化資料**

- 文章頁輸出 JSON-LD `BlogPosting`（`headline`、`datePublished`、`dateModified`、`author`、`image`）。
- 以 `JSON.stringify` 產生並輸出到 `<script type="application/ld+json">`；內容含使用者可控文字時須跳脫 `<`（`\u003c`），避免 `set:html` 注入。
- 可加 `BreadcrumbList`，須與頁面實際導覽一致。

**站點層級**

- `sitemap`、`robots.txt`、RSS 須隨 `build` 產出，且僅含 canonical 網址、不含 `noindex` 頁。
- `robots.txt` 須指向 sitemap 的絕對網址。
- 網站根網址（`site`）集中於 `astro.config` / `src/config.ts`，不得硬編碼在元件內。
- 網址變動規則見 3.4（`_redirects` 301），不得用 302 或 meta refresh 取代。

**內容與效能（Core Web Vitals）**

- 圖片：用 Astro `<Image>`，必填有意義的 `alt`（純裝飾圖用 `alt=""`）、明確 `width`/`height`（避免版面位移 CLS）；首屏主圖不加 lazy loading，其餘加。
- 減少客戶端 JS 與阻塞渲染資源（見 3.3）；字型使用 `font-display: swap`。
- 內部連結用描述性錨點文字，避免「點這裡」；外部連結視情況加 `rel="noopener"`，付費/不信任連結加 `rel="nofollow"`。
- slug 使用小寫英數與連字號，穩定且不隨標題微調而變。

**建置後檢查（唯讀，`deno task build` 之後執行）**

```sh
# 缺 title 的頁面
grep -rL "<title>" dist --include=*.html
# 缺 description 的頁面
grep -rL 'name="description"' dist --include=*.html
# 缺 canonical 的頁面
grep -rL 'rel="canonical"' dist --include=*.html
# 缺 alt 的 img
grep -rnP "<img(?![^>]*\balt=)" dist --include=*.html
# sitemap、robots 是否存在
ls dist/sitemap*.xml dist/robots.txt
```

- `dist/pagefind/` 與 404 等刻意 `noindex` 的頁面若出現在結果中屬預期，須在回報中說明。
- Lighthouse（SEO、Performance）屬手動檢查，結果須附分數與頁面網址；無法在本環境執行時標 `[無法查證]`，不得自行填數字。
- 使用 SEO 相關整合套件（如 sitemap、RSS）時，標註 `[套件版本]`，行為以官方文件為準（見 3.5）。

## 4. 測試與基準

### 4.1 測試

- 執行 `deno task test` 並回報結果。
- 無測試或覆蓋不足：針對核心功能與邊界（空值、空陣列、超長字串、非法輸入、非 ASCII）靜態檢視，並列出建議補的測試案例。
- 測試僅授權 `--allow-net`；需讀寫檔案時，先說明並更新 task，不可自行加 `-A`。

### 4.2 效能基準

效能優化建議須附 `deno bench` 修改前後數據，不得僅憑推測。

- 適用：純函式、資料轉換、字串處理、排序/搜尋、Markdown 解析。
- 不適用：元件渲染、頁面/圖片載入；改用 `deno task build` 建置時間或 Lighthouse。
- 位置與命名：`bench/<模組名>_bench.ts`（`deno task bench` 僅執行 `bench/*`）；不納入 `build` 產出。
- 每個 `Deno.bench` 只測一件事；用 `group` + `baseline: true` 比較。
- 測試資料在 bench 外準備；被測函式回傳值須被使用，避免被最佳化掉。
- 單檔執行：`deno bench -A --unstable-kv --unstable-ffi bench/<檔名>_bench.ts`
- 差異小於 5% 視為雜訊，不列為改善項目。
- 同一環境、同一次執行比較，並註明 Deno 版本。

```ts
import { make_slug } from "../src/utils/slug.ts";

const SAMPLE = "Hello World 範例文章標題";

Deno.bench({ name: "舊版", group: "slug", baseline: true, fn: () => { make_slug_old(SAMPLE); } });
Deno.bench({ name: "新版", group: "slug", fn: () => { make_slug(SAMPLE); } });
```

回報格式：

| 項目 | 舊版 (avg) | 新版 (avg) | 差異 |
|---|---|---|---|
| make_slug | 1.20 µs | 0.80 µs | -33% |

## 5. 審查標籤

嚴禁臆測或編造解法；符合條件必須標註：

| 標籤 | 觸發條件 |
|---|---|
| `[無法查證]` | 第三方套件行為無法由程式碼、`deno.json`、官方文件確認；無基準數據的效能主張 |
| `[邏輯矛盾]` | 程式碼與需求/規格衝突（簡述衝突點）；AGENTS.md 與 `deno.json` 實際 task 不一致時，以 `deno.json` 為準並回報 |
| `[套件版本]` | 引用第三方套件時標註版本（如 `astro v5.x`） |

版本來源以 `deno.json` / `package.json` 為準；查不到則同時標 `[無法查證]`。

## 6. Code Review 輸出

優先級：安全性 > 效能 > 結構。依序輸出：

1. **改善項目清單**：每項含「檔案:行號、問題、影響、建議做法、等級（必須修正／建議）」；效能項須附 4.2 數據。
2. **修改對照**：僅列受影響段落，用可直接替換的 `diff` 區塊。

```diff
- 舊程式碼
+ 新程式碼
```

無問題直接回報「未發現問題」，不為湊數量而列項。

## 7. PR 規則

- 從獨立專用分支發 PR，禁止直接推送主線；不得自行 merge，須使用者審查確認。
- Atomic PR：一個 PR 只解決一個問題，無關變更另開。
- slug 規則變動或文章改名時，`public/_redirects` 的 301 規則須在同一 PR。
- 標題：`<type>(<scope>): <summary>`；`type` 限 `feat`、`fix`、`refactor`、`test`、`docs`、`chore`（依賴、設定、腳本）。

### 7.1 發起前自檢（全部通過才可發）

1. 第 2 節 8 步全部通過。
2. `git diff` 確認 `lint --fix` 未改到無關檔案。
3. diff 與 commit 歷史無密鑰、未提交 `.env`。
4. 新功能附測試；新函式/類別附 TSDoc/JSDoc。
5. 外部輸入已驗證與跳脫；無 `set:html` 用於不信任內容。
6. 效能主張已附 bench 數據。
7. Emoji 檢查（3.1）無結果。
8. `deno.json` 依賴異動已說明理由與替代方案。
9. 涉及頁面/layout/路由/frontmatter 變更者，3.7 建置後檢查指令無缺漏（或已說明例外）。

### 7.2 PR Description 範本

~~~markdown
## Summary
<變更目的，1–2 句>

## Changes
- <具體修改項目>

## Verification
<各驗證指令與結果；效能類附 bench 表格>

## Checklist
- [ ] 第 2 節 8 步驗證全數通過
- [ ] 無洩漏密鑰 / `.env`
- [ ] 舊網址變動已補 `_redirects`（無則填 N/A）
~~~

### 7.3 Agent 執行 Code Review 時

遵循第 5、6 節；每項意見指出檔案/行號並附 `diff` 修正碼。
