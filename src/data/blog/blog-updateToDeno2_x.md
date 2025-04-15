---
title: blog-升上 Deno2.x 後的重構記錄
pubDatetime: 2025-01-12
tags:
  - "blog"
description: ""
---

## 關於現在的自身狀態

由於現在還在宜蘭金六結營區服法定四個月的義務(不願)役，所以在每一週放週六洞八(早上08:00)後回來定期抽空維護本Blog。。。

> 服役時間: 2024-11-26~2025-03-07(己用軍訓課學分，折了約 10 日)

> 2025-01: 當前使用 Deno 版本為 2.1.4

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
    - 支援 HMR ( hot module replacement ,熱更新)，不需重新手動加戴且即時預覽修改效果
- 結果建置
  - 把專案輸出成靜態網頁或 SSR 服務: `$ deno run -A --unstable npm:astro build`
  - 提供服務: `$ deno serve --allow-net --allow-read --allow-env ./dist/server/entry.mjs`

## 套件管理: 不使用`npm`,直接使用 deno 管理

由於 Deno 2.x 提供了 npm 套件兼容功能，其中套件依賴部分可以直接記錄在 `deno.json`(Deno) 或 `package.json`(npm) 內方便集中管理。

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
    FROM denoland/deno:2.1.5

    # 設定使用者權限&工作目錄&環境
    WORKDIR /app
    ENV NODE_ENV=production

    # Copy Project Source Code
    COPY package*.json deno.json* deno.lock* ./
    COPY . .

    # Building
    RUN  deno task install && \
        deno task build

    # Service Start
    CMD ["deno", "task", "serve"]

    # 指定通訊埠
    EXPOSE 8085

  ```

## PaaS: 使用 Deno Deploy 服務

在研究 Deno 時，發現能用 Github Action 搭配自身的 Deploy 服務來提供 Serverless 環境。
其中會分配 `[project_name].deno.dev` 的域名給開發者使用，且支援主流的前端框架(ex: Astro,Next.js,.....)！

### 限制(免費版)

- 請求
  - 1M 次/每月
  - 每次請求時，最多只需 10ms CPU 時間
- 流量: 100GB/每月
- 網域
  - 提供免費的 `deno.dev` 子網域和自訂網域
  - HTTPS / TLS 憑証
- 伺服器
  - 整合 Github 上公開與私有套件庫
  - 可在所有 12 個網路位置執行(其中由GCP代管，且使用者不可指定位置而是隨機分配)
  - 無限制次數建置，供以生產部署與預覽

### 流程

1. 安裝橋接器: `$ deno add npm:@deno/astro-adapter`
   - Github: [denoland/deno-astro-adapter](https://github.com/denoland/deno-astro-adapter)
2. 在`astro.config.ts`加入相關設置

```typescript
  import deno from "@deno/astro-adapter"; // add deno deploy support

  export default defineConfig({
    site: SITE.website,
    output: "static", // 輸出選項: Astro 4 = "hybrid" , Astro 5 = "static"
    server: {
      port: 8085, // 若無設置，則使用預設的 '4321/tcp'
    },
    adapter: deno({
      port: 8085, // 若無設置，則使用預設的 '8085/tcp'
    }),
    ......
  })
```

4. 設定 GitHub Action & Deno Deploy

   - Workflow 腳本: `./.github/workflows/deploy.yml`

     ```yaml
     name: Deploy
     on:
       push:
         branches: main
       pull_request:
         branches: main

     jobs:
       deploy:
         name: Deploy
         runs-on: ubuntu-latest

     permissions:
       id-token: write # Needed for auth with Deno Deploy
       contents: read # Needed to clone the repository

     steps:
       - name: Clone repository
         uses: actions/checkout@v4

       - name: Install Deno
         uses: denoland/setup-deno@v2
         with:
           deno-version: v2.x

       - name: Install step
         run: "deno task install"

       - name: Build step
         run: "deno task build"

       - name: Upload to Deno Deploy
         uses: denoland/deployctl@v1
         with:
           project: "neko-0xff-blog"
           entrypoint: "server/entry.mjs"
           root: "dist"
     ```

## REF

### Astro

- [@deno/astro-adapter](https://docs.astro.build/en/guides/integrations-guide/deno/)
- [Deploy your Astro Site to Deno](https://docs.astro.build/en/guides/deploy/deno/)

### deno

#### 文件

- [Node and npm support](https://docs.deno.com/runtime/fundamentals/node/)
- [`deno install`](https://docs.deno.com/runtime/reference/cli/install/)

#### Blog

- [Build an Astro site with Deno](https://deno.com/blog/build-astro-with-deno)
- [Introducing your new JavaScript package manager: Deno](https://deno.com/blog/your-new-js-package-manager)
- [Build and Ship Astro Sites with Deno and Deno Deploy](https://deno.com/blog/astro-on-deno)
