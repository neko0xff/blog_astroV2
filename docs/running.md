如何運行該專案
===

[回專案主頁](.././README.md)

## 前置需求

- [Deno](https://deno.com/)
- [Docker](https://www.docker.com/)

## 手動執行

### 本地開發環境

1. 安裝相依套件:

   ```zsh
   deno task install
   ```

2. 啟動開發伺服器（`localhost:8085`）：

```zsh
deno task dev
# 或
deno task start
```

### 建置靜態站點

- 建置流程
  1. 建置靜態網站到 `./dist/`
     ```zsh
     deno task build
     ```
     - `build` 結尾會自動跑 `scripts/enhance-sitemap.mjs`，從 `dist/posts/*/index.html`
       的 meta 取日期，為 sitemap 缺 `lastmod` 的文章 URL 補上（已有者不覆寫）
     - `.gz` 預壓縮變體由 `scripts/precompress.ts` 另行產生（容器建置見
       `Dockerfile.env`；本機手動跑 `deno run -A scripts/precompress.ts`），
       不在 `deno task build` 內
  2. 產生 Pagefind 搜尋索引（輸出至 `./dist/pagefind/`）
     ```zsh
     deno task pagefind
     ```
  3. 以 `dist/server.ts` 啟動正式伺服器（`http://localhost:8085`）
     - `server.ts` 是薄入口，邏輯在 `public/server/` 各模組；
       Astro build 時會一併複製進 `dist/`（`dist/server.ts`＋`dist/server/`）
     ```zsh
     deno task serve
     ```

### 容器鏡像打包

- 本專案使用 `docker compose` 搭配 `Dockerfile.env` 建置，以下為須注意的重點：
  1. `docker-compose.yml` 的相關配置
     - 對外埠號為 `8585`，對應容器內的 `8085`
     - 瀏覽器請開啟：`http://localhost:8585`
  2. 容器內的正式環境
     - 靜態伺服器的相關檔案路徑：`dist/server.ts`（入口）＋`dist/server/`（模組）
     - 容器內的啟動行為由 `deno_prod.json` 的 `service` 任務定義

- 建置相關指令
  - 建置映像檔並啟動容器（背景執行）
    ```zsh
    docker compose up -d --build
    ```
  - 查看容器運行時的記錄日誌（100 筆內）
    ```zsh
    docker compose logs --tail=100 -f
    ```
  - 停止並移除現在所運行的容器
    ```zsh
    docker compose down
    ```

## 使用專案內的自動化腳本（Makefile）

- 預設目標（`make`）：列出所有可用目標
- 指令前綴：
  - `deno_xxx`: 使用 deno 做為開發選項
  - `img_xxx`: 建置成容器選項

### 常用目標

| Target             | 作用                                           |
| :----------------- | :--------------------------------------------- |
| `make all`         | 建置並啟動容器（預設）                         |
| `make build_local` | 本機建置（clean + install + build + pagefind） |
| `make img_build`   | 建置映像檔並啟動容器（背景）                   |
| `make img_logs`    | 追蹤容器日誌（最後 100 行）                    |
| `make img_stop`    | 停止容器                                       |
| `make img_clean`   | 停止並移除容器                                 |
| `make deno_serve`  | 以 `dist/server.ts` 啟動正式伺服器             |
| `make deno_clean`  | 清除建置產物與相依套件                         |

## 開發時的常用指令

所有指令皆在專案根目錄執行：

| Command                    | Action                                                                                           |
| :------------------------- | :----------------------------------------------------------------------------------------------- |
| `deno task install`        | 安裝相依套件（含 vite non-ASCII patch）                                                          |
| `deno task dev`            | 啟動開發伺服器 `localhost:8085`                                                                  |
| `deno task build`          | 建置正式網站至 `./dist/`（結尾自動跑 `enhance-sitemap` 補 sitemap `lastmod`）                    |
| `deno task pagefind`       | 為 `./dist/` 建置 Pagefind 搜尋索引（需在 build 之後執行）                                       |
| `deno task serve`          | 以 `./dist/server.ts` 啟動正式伺服器（含安全性標頭、快取策略、預壓縮變體、健康檢查、access log） |
| `deno task preview`        | 以 `astro preview` 預覽建置結果                                                                  |
| `deno task check`          | 以 `astro check` 檢查 Astro 側（`src/` 等）型別                                                  |
| `deno task check:tests`    | 以 `astro check --tsconfig tsconfig.tests.json` 檢查 `tests/` 型別                               |
| `deno task test`           | 執行單元測試並做 Deno 型別檢查                                                                   |
| `deno task test:og`        | 執行 OG PNG 管線測試（需 FFI，見 `docs/testing.md` §8.7）                                        |
| `deno task bench`          | 執行 `bench/` 效能基準測試（規範見 `docs/bench.md`）                                             |
| `deno task sync`           | 為所有 Astro 模組產生 TypeScript 型別定義                                                        |
| `deno task lint`           | 以 Deno lint 檢查程式碼                                                                          |
| `deno task fmt` / `format` | 格式化程式碼（Deno fmt / Prettier）                                                              |
| `deno task format:check`   | 唯讀檢查 Prettier 格式（不修改檔案）                                                             |
| `deno task clean`          | 清除建置產物（`./dist`、`./node_modules`）                                                       |
| `deno task outdated:check` | 檢查相依套件是否有新版                                                                           |
| `deno task deploy:release` | 部署至 Deno Deploy（production，static mode）                                                    |
| `docker compose up -d`     | 以 Docker 啟動正式伺服器（port `8585`）                                                          |
| `docker compose down -v`   | 停止並移除容器與相關資源                                                                         |

## 注意事項

- `deno task serve` 與容器內的伺服器皆為 `dist/server.ts`，
- 執行前必須先 `deno task build` & `deno task pagefind`
  - `public/` 下的檔案（含 `server.ts`、`server/` 模組、`_headers`、`_redirects`）會由 Astro build 原封不動複製到 `./dist/`

## 網址異動與轉址

- `getPath()` 會對文章 id 套用 `slugifyStr()`。
- 若日後改用不同的 slug 規則、或文章改名，網址可能跟著改變，舊的外部連結與搜尋引擎排名就會失效。

## 轉址規則

集中在 `public/_redirects`（Netlify 語法），同時被兩個部署環境使用：

| 環境                       | 讀取方式                              |
| -------------------------- | ------------------------------------- |
| Deno Deploy（static mode） | staticd 自動解析 `_redirects`         |
| Docker / `deno task serve` | `dist/server.ts` 啟動時載入同一份檔案 |

規則格式為 `<來源> <目標> <狀態碼>`。每個來源都要註冊「帶尾端斜線」與
「不帶尾端斜線」兩種形式，因為 staticd 預設不會自動正規化路徑。
成對不變式由 `tests/redirects.test.ts` 自動檢查，新增規則後跑
`deno task test` 即可驗證。

```
/posts/Ansible-Playbooks/ /posts/ansible-playbooks/ 301
/posts/Ansible-Playbooks  /posts/ansible-playbooks  301
```

改完後務必實際驗證轉址有生效：

```zsh
deno task build
PORT=8099 deno run --allow-net --allow-read --allow-env dist/server.ts &

curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" \
  "http://localhost:8099/posts/Ansible-Playbooks/"
# 預期：301 -> http://localhost:8099/posts/ansible-playbooks/
```
