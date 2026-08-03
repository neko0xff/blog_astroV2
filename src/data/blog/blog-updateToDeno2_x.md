---
title: blog-升上 Deno2.x 後的重構記錄
pubDatetime: 2025-01-12
updated: 2026-08-03
tags:
  - "blog"
description: ""
---

## 關於現在的自身狀態

由於現在還在宜蘭金六結營區服法定四個月的義務(不願)役，所以在每一週放週六洞八(早上08:00)後回來定期抽空維護本Blog。。。

> 服役時間: 2024-11-26~2025-03-07(己用軍訓課學分，折了約 10 日)

> 2025-01: 當前使用 Deno 版本為 2.1.4 

> 2026-08: 當前使用 Deno 版本為 2.9.4

## 專案建立: 透過 deno 重新建 Astro.js 樣版

### 前置

```zsh
$ deno -A npm:create-astro@latest --template satnaing/astro-paper
 astro   Launch sequence initiated.

   dir   Where should we create your new project?
         ./square-singularity
```

### 相關指令

- 環境配置
  - 預覽正式環境: `$ deno run -A npm:astro preview --host 0.0.0.0`
  - 開發除錯: `$ deno run -A --unstable npm:astro dev`
    - 支援 HMR ( hot module replacement,熱更新)，不需重新手動加戴且即時預覽修改效果
- 結果建置
  - 把專案輸出成靜態網頁或 SSR 服務: `$ deno run -A --unstable npm:astro build`
  - 提供服務:
    `$ deno serve --allow-net --allow-read --allow-env ./dist/server/entry.mjs`

## 套件管理: 不使用`npm`,直接使用 deno 管理

由於 Deno 2.x 提供了 npm 套件兼容功能，其中套件依賴部分可以直接記錄在
`deno.json`(Deno) 或 `package.json`(npm) 內方便集中管理。

- 套件管理
  - 安裝: `$ deno install --allow-scripts`
  - 加入: `$ deno add npm:[npm套件]`
  - 移除: `$ deno remove npm:[npm套件]`
- 版本檢查(僅在`2.1.4`後)
  - 僅檢查: `$ deno outdated`

  ```
  # user @ Host-02 in ~/文件/GitHub/blog_astroV2 on git:main x [12:13:56]
   $ deno outdated
   ┌───────────────────────────────┬─────────┬────────┬─────────────────────────────────┐
   │ Package                       │ Current │ Update │ Latest                          │
   ├───────────────────────────────┼─────────┼────────┼─────────────────────────────────┤
   │ npm:satori                    │ 0.12.0  │ 0.12.1 │ 0.12.1                          │
   ├───────────────────────────────┼─────────┼────────┼─────────────────────────────────┤
   │ npm:@tailwindcss/typography   │ 0.5.15  │ 0.5.16 │ 0.5.16                          │
   ├───────────────────────────────┼─────────┼────────┼─────────────────────────────────┤
   │ npm:marked                    │ 15.0.5  │ 15.0.6 │ 15.0.6                          │
   ├───────────────────────────────┼─────────┼────────┼─────────────────────────────────┤
   │ npm:@types/react              │ 19.0.2  │ 19.0.4 │ 19.0.4                          │
   ├───────────────────────────────┼─────────┼────────┼─────────────────────────────────┤
   │ npm:react                     │ 19.0.0  │ 19.0.0 │ 19.1.0-canary-fc8a898d-20241226 │
   ├───────────────────────────────┼─────────┼────────┼─────────────────────────────────┤
   │ npm:react-dom                 │ 19.0.0  │ 19.0.0 │ 19.1.0-canary-fc8a898d-20241226 │
   ├───────────────────────────────┼─────────┼────────┼─────────────────────────────────┤
   │ npm:prettier                  │ 3.4.2   │ 3.4.2  │ 4.0.0-alpha.10                  │
   ├───────────────────────────────┼─────────┼────────┼─────────────────────────────────┤
   │ npm:tailwindcss               │ 3.4.17  │ 3.4.17 │ 4.0.0-beta.9                    │
   ├───────────────────────────────┼─────────┼────────┼─────────────────────────────────┤
   │ npm:@astrojs/react            │ 4.1.2   │ 4.1.3  │ 4.1.3                           │
   ├───────────────────────────────┼─────────┼────────┼─────────────────────────────────┤
   │ npm:astro                     │ 5.1.2   │ 5.1.5  │ 5.1.5                           │
   ├───────────────────────────────┼─────────┼────────┼─────────────────────────────────┤
   │ npm:typescript                │ 5.7.2   │ 5.7.3  │ 5.8.0-dev.20250110              │
   ├───────────────────────────────┼─────────┼────────┼─────────────────────────────────┤
   │ npm:@astrojs/tailwind         │ 5.1.4   │ 5.1.4  │ 6.0.0-beta.0                    │
   ├───────────────────────────────┼─────────┼────────┼─────────────────────────────────┤
   │ npm:@typescript-eslint/parser │ 8.19.0  │ 8.19.1 │ 8.19.2-alpha.7                  │
   ├───────────────────────────────┼─────────┼────────┼─────────────────────────────────┤
   │ npm:typescript-eslint         │ 8.19.0  │ 8.19.1 │ 8.19.2-alpha.7                  │
   ├───────────────────────────────┼─────────┼────────┼─────────────────────────────────┤
   │ npm:eslint                    │ 9.17.0  │ 9.18.0 │ 9.18.0                          │
   └───────────────────────────────┴─────────┴────────┴─────────────────────────────────┘

   Run deno outdated --update --latest to update to the latest available versions,
   or deno outdated --help for more information.
  ```

  - 檢查且更新: `$ deno outdated --update --latest`

  ```
  # user @ Host-02 in ~/文件/GitHub/blog_astroV2 on git:main x [12:14:00]
    $ deno outdated --update --latest
    Updated 15 dependencies:
     - npm:@astrojs/react             4.1.2 ->                           4.1.3
     - npm:@astrojs/tailwind          5.1.4 ->                    6.0.0-beta.0
     - npm:@tailwindcss/typography   0.5.15 ->                          0.5.16
     - npm:@types/react              19.0.2 ->                          19.0.4
     - npm:@typescript-eslint/parser 8.19.0 ->                  8.19.2-alpha.7
     - npm:astro                      5.1.2 ->                           5.1.5
     - npm:eslint                    9.17.0 ->                          9.18.0
     - npm:marked                    15.0.5 ->                          15.0.6
     - npm:prettier                   3.4.2 ->                  4.0.0-alpha.10
     - npm:react                     19.0.0 -> 19.1.0-canary-fc8a898d-20241226
     - npm:react-dom                 19.0.0 -> 19.1.0-canary-fc8a898d-20241226
     - npm:satori                    0.12.0 ->                          0.12.1
     - npm:tailwindcss               3.4.17 ->                    4.0.0-beta.9
     - npm:typescript                 5.7.2 ->              5.8.0-dev.20250110
     - npm:typescript-eslint         8.19.0 ->                  8.19.2-alpha.7
  ```

## Docker: 使用官方的docker image + 重寫建置腳本

- Docker Hub: [denoland/deno](https://hub.docker.com/r/denoland/deno)
- Dockerfile

  ```dockerfile
    FROM denoland/deno:debian-2.9.4 AS builder

    # Install system dependencies
    RUN apt-get update && apt-get install -y \
        python3 \
        make \
        npm \
        g++ \
        && rm -rf /var/lib/apt/lists/*

    # Setup Environment
    WORKDIR /app
    ENV NODE_ENV=production

    COPY . .

    RUN mkdir -p /app/.npm && \
        npm config set cache /app/.npm --global

    RUN deno install --allow-scripts --no-lock && deno task build

    # Generate search index
    RUN deno task pagefind

    # Final stage
    FROM denoland/deno:alpine-2.9.4
    WORKDIR /app

    # Copy built files
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/server.ts ./server.ts
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/deno_prod.json ./deno.json

    # Expose port
    EXPOSE 8085

    # Switch to non-root user for security
    USER deno

    # Start the server with logging
    CMD ["task", "serve"]
  ```

## PaaS: 使用 Deno Deploy 服務

在研究 Deno 時，發現能用 Github Action 搭配自身的 Deploy 服務來提供 Serverless 環境。 

其中會分配 `[project_name].deno.dev` 的域名給開發者使用，且支援主流的前端框架(ex: Astro,Next.js,.....)！

### 從 Deno Deploy Classic 遷移至新版 Deno Deploy 

> 2026-08-03 更新：由於 Deno Deploy Classic（`dash.deno.com`）與 deployctl 工具已於 2026-07-20 停用，所以原有服務須手動遷移至新版 Deno Deploy（`console.deno.com`)

- 新版平台和 Classic 所變更部分
  * 分配網域： `{project_name}.deno.dev` => `{project_name}.{org_name}.deno.net`
  * 收費模式: 從個人變組織
  * 更換到新版後，必須驗証信用卡付款部分是否有效
  * 改用 Deno 2.x 內建的 deno deploy 指令
  * 並支援整合式建置（build 日誌直接於 dashboard 即時串流，不再需要透過 GitHub Actions 進行部署）
    * 同時 GitHub Actions workflow（`.github/workflows/ci.yml`）部分，僅保留 CI 驗證用途

### 免費方案所提供的資源限制 (2026-08-03)

- 請求
  - 100 萬次/每月
  - 每次請求時，最多只需 10ms CPU 時間
- 流量: 20GB/每月（出站頻寬）
- 網域
  - 提供免費的 `deno.dev` 子網域和自訂網域
  - HTTPS / TLS 憑証 (Let's Encrypt)
- 伺服器
  - 整合 Github 上公開與私有套件庫
  - 代管位置
    - 目前僅有美國(us)、歐洲(eu)與全球(global)三區可用
  - 無限制次數建置，供以生產部署與預覽
- 其他限制
  - 記憶體分配：最大 512MB
  - 單次部署大小上限：1 GB（含原始檔案與靜態檔案）
  - 每組織最多
    * 20 個活躍應用
    * 50 個自訂網域

### 流程

1. 在 `deno.json` 設定 `deploy` 設定（新版平台的整合式建置會讀取）：

   ```json
   {
     "deploy": {
       "install": "deno task install",
       "build": "deno task build && deno task pagefind",
       "runtime": {
         "type": "static",
         "cwd": "./dist"
       }
     }
   }
   ```

2. 到 [console.deno.com](https://console.deno.com) 建立 app 並連接 GitHub 倉庫， 之後每次 push 都會自動觸發建置與部署，build 日誌直接在 dashboard 串流（本專案為靜態站台，直接服務 `dist/` 目錄）。 
   * 部署完成後，應用程式將可於 `https://<your-project-name>.<your-org-name>.deno.net` 存取

3. 或者使用 CLI 手動部署：
   - 必需先在 `https://console.deno.com/account/access-tokens` 建立 token，並設定相関的環境變數 `DENO_DEPLOY_TOKEN`
   
   ```sh
   $ deno deploy --app neko-0xff-blog          # 預覽部署
   $ deno deploy --app neko-0xff-blog --prod   # 正式部署
   ```

4. GitHub Actions（`.github/workflows/ci.yml`）服務部分
   - 只負責 CI 驗證（install / build / pagefind），不再負責部署

## REF

### Astro

- [@deno/astro-adapter](https://docs.astro.build/en/guides/integrations-guide/deno/)
- [Deploy your Astro Site to Deno](https://docs.astro.build/en/guides/deploy/deno/)

### deno

#### 文件

- [Node and npm support](https://docs.deno.com/runtime/fundamentals/node/)
- [`deno install`](https://docs.deno.com/runtime/reference/cli/install/)
- [Migrating from Deploy Classic to Deno Deploy](https://docs.deno.com/deploy/migration_guide/)

#### Blog

- [Build an Astro site with Deno](https://deno.com/blog/build-astro-with-deno)
- [Introducing your new JavaScript package manager: Deno](https://deno.com/blog/your-new-js-package-manager)
- [Build and Ship Astro Sites with Deno and Deno Deploy](https://deno.com/blog/astro-on-deno)
