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
  1. 建置靜態網站到 `./dist/`，並執行 `scripts/precompress.ts` 產生 .gz 變體
     ```zsh
     deno task build
     ```
  2. 產生 Pagefind 搜尋索引（輸出至 `./dist/pagefind/`）
     ```zsh
     deno task pagefind
     ```
  3. 以 `dist/server.ts` 啟動正式伺服器（`http://localhost:8085`）
     * `server.ts` 位於 `public/`，Astro build 時會一併複製進 `dist/`
     ```zsh
     deno task serve
     ```

### 容器鏡像打包

- 本專案使用 `docker compose` 搭配 `Dockerfile.env` 建置，以下為須注意的重點：
  1. `docker-compose.yml` 的相關配置
     * 對外埠號為 `8585`，對應容器內的 `8085`
     * 瀏覽器請開啟：`http://localhost:8585`
  2. 容器內的正式環境
     * 靜態伺服器的相關檔案路徑：`dist/server.ts`
     * 容器內的啟動行為由 `deno_prod.json` 的 `service` 任務定義

- 建置相關指令
  * 建置映像檔並啟動容器（背景執行）
    ```zsh
    docker compose up -d --build
    ```
  * 查看容器運行時的記錄日誌（100 筆內）
    ```zsh
    docker compose logs --tail=100 -f
    ```
  * 停止並移除現在所運行的容器
    ```zsh
    docker compose down
    ```

## 使用專案內的自動化腳本（Makefile）

- 預設目標（`make`）：列出所有可用目標
- 指令前綴：
  - `deno_xxx`: 使用 deno 做為開發選項
  - `img_xxx`: 建置成容器選項

### 常用目標

| Target             | 作用                                    |
| :----------------- | :-------------------------------------- |
| `make all`         | 建置並啟動容器（預設）                  |
| `make build_local` | 本機建置（clean + install + build）     |
| `make img_build`   | 建置映像檔並啟動容器（背景）            |
| `make img_logs`    | 追蹤容器日誌（最後 100 行）             |
| `make img_stop`    | 停止容器                                |
| `make img_clean`   | 停止並移除容器                          |
| `make deno_serve`  | 以 `dist/server.ts` 啟動正式伺服器      |
| `make deno_clean`  | 清除建置產物與相依套件                  |

## 開發時的常用指令

所有指令皆在專案根目錄執行：

| Command                      | Action                                                                                         |
| :--------------------------- | :--------------------------------------------------------------------------------------------- |
| `deno task install`          | 安裝相依套件（含 vite non-ASCII patch）                                                        |
| `deno task dev`              | 啟動開發伺服器 `localhost:8085`                                                                |
| `deno task build`            | 建置正式網站至 `./dist/`，並執行 `scripts/precompress.ts` 產生 `.gz` 預壓縮變體                |
| `deno task pagefind`         | 為 `./dist/` 建置 Pagefind 搜尋索引（需在 build 之後執行）                                     |
| `deno task serve`            | 以 `./dist/server.ts` 啟動正式伺服器（含安全性標頭、快取策略、預壓縮變體支援）                 |
| `deno task preview`          | 以 `astro preview` 預覽建置結果                                                                |
| `deno task check`            | 以 `astro check` 檢查型別                                                                      |
| `deno task sync`             | 為所有 Astro 模組產生 TypeScript 型別定義                                                      |
| `deno task lint`             | 以 Deno lint 檢查程式碼                                                                        |
| `deno task fmt` / `format`   | 格式化程式碼（Deno fmt / Prettier）                                                            |
| `deno task clean`            | 清除建置產物（`./dist`、`./node_modules`）                                                     |
| `deno task outdated:check`   | 檢查相依套件是否有新版                                                                         |
| `deno task deploy:release`   | 部署至 Deno Deploy（production，static mode）                                                  |
| `docker compose up -d`       | 以 Docker 啟動正式伺服器（port `8585`）                                                        |
| `docker compose down -v`     | 停止並移除容器與相關資源                                                                       |

## 注意事項

- `deno task serve` 與容器內的伺服器皆為 `dist/server.ts`，
- 執行前必須先 `deno task build` & `deno task pagefind`
  * `public/` 下的檔案（含 `server.ts`、`_headers`）會由 Astro build 原封不動複製到 `./dist/`
