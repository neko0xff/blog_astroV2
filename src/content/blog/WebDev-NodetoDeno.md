---
title: WebDev-如何讓現有的Astro.js專案使用deno
pubDatetime: 2024-10-17
tags:
  - "WebDev"
description: ""
---

## 前置

Deno 從 1.39 版本開始，便持續提升與 Node.js 環境及 npm 套件的兼容性。

<!--more-->

到了 2.0 版本，這種兼容性更是大幅度提升，使得許多原本專為 Node.js 開發的工具和函式庫，都能在 Deno 中無縫接軌。尤其這項重大改進，不僅讓網頁開發者能夠更輕鬆地將既有專案從 Node.js 遷移到 Deno，同時也降低了轉換過程中的複雜度。

因此想寫相關的教學文，方便自己後續維護時進行查看。

- [Announcing Deno 2](https://www.youtube.com/live/d35SlRgVxT8)
  <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/d35SlRgVxT8?si=U8V_dcjQn-N27P60" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 注意部分

> 本教學使用範例程式: [neko0xff/blog_astroV2](https://github.com/neko0xff/blog_astroV2)

- 開發時，各項工具&環境的版本
  * 伺服端環境
      * `Deno`: `2.0.0`
      * `node`: `v21.6.2`
  * 套件依賴管理
      * `npm`: `10.8.0`
      * `npx`: `10.8.0`
  * 函式庫
      * `Astro.js`: `v4.16.2`
      * `@astrojs/react`: `^3.6.1`
- 當該專案是使用 Node (ex:`npx`,`npm`) 建立時, Deno 會優先將 npm 相依項目新增到 `package.json` 中,而不是使用 Deno 自己的相依性管理系統
- 在編譯完成後，若想預覽輸出結果或提供服務，則預設使用的通訊端口會是 '8085/tcp'

## 開始配置
1. 在 Astro.js 專案內加入相關依賴
   ```
   $ npx astro add deno
   $ npm install @deno/astro-adapter
   ```
2. 更新`astro.config.ts`配置檔
   * `output`部分請盡量使用`hybird`模式，否則某些需要開啟 `prerender` 預先渲染的組件或者套件無法成功運作(ex: `@resvg/resvg-js`)
   ```typescript=
    import { defineConfig } from 'astro/config';
    import deno from '@deno/astro-adapter';

    export default defineConfig({
      output: 'hybird',
      adapter: deno(),
    });
   ```
3. 加入`deno.json`(方便後續使用 `deno task` 進行維護)
  ```json=
    {
        "tasks": {
          "start": "deno run -A --unstable npm:astro dev",
          "dev": "deno run -A --unstable npm:astro dev",
          "preview": "deno run --allow-net --allow-read --allow-env ./dist/server/entry.mjs",
          "build": "astro build",
          "test": "deno test --allow-net",
          "lint": "deno lint"
        }
    }
  ```

## 輸出可供以預覽使用的成果
- 編譯: `$ deno task build`
  * 由於編譯過程過多，所以有做相關的刪減
```
# user @ Host-02 in ~/文件/GitHub/blog_astroV2 on git:main o [10:22:43] 
$ deno task build
Task build astro build
10:23:43 [types] Generated 5.83s
10:23:43 [build] output: "hybrid"
10:23:43 [build] directory: /home/user/文件/GitHub/blog_astroV2/dist/
10:23:43 [build] adapter: @deno/astro-adapter
10:23:43 [build] Collecting build info...
10:23:43 [build] ✓ Completed in 6.98s.
10:23:43 [build] Building hybrid entrypoints...
[Shiki] The language "htmlembedded" doesn't exist, falling back to "plaintext".
[Shiki] The language "htmlembedded" doesn't exist, falling back to "plaintext".
[Shiki] The language "config" doesn't exist, falling back to "plaintext".
[Shiki] The language "config" doesn't exist, falling back to "plaintext".
10:23:57 [vite] ✓ built in 14.07s
10:23:57 [build] ✓ Completed in 14.22s.

 building client (vite) 
10:24:01 [vite] ✓ 103 modules transformed.
10:24:01 [vite] dist/client/_astro/hoisted.BZB3xiX9.js                                                 0.14 kB │ gzip:  0.11 kB
10:24:01 [vite] dist/client/_astro/Header.astro_astro_type_script_index_0_lang.98jdeT3h.js             0.45 kB │ gzip:  0.26 kB
10:24:01 [vite] dist/client/_astro/jsx-runtime.7faW4zRM.js                                             0.92 kB │ gzip:  0.58 kB
10:24:01 [vite] dist/client/_astro/index.DhYZZe0J.js                                                   6.72 kB │ gzip:  2.69 kB
10:24:01 [vite] dist/client/_astro/ViewTransitions.astro_astro_type_script_index_0_lang.2daoxv0f.js   14.30 kB │ gzip:  4.91 kB
10:24:01 [vite] dist/client/_astro/Search.DYRar-QJ.js                                                 28.07 kB │ gzip: 11.23 kB
10:24:01 [vite] dist/client/_astro/links.DIb01Po1.js                                                  36.48 kB │ gzip: 14.90 kB
10:24:01 [vite] dist/client/_astro/client.BIGLHmRd.js                                                135.60 kB │ gzip: 44.39 kB
10:24:01 [vite] ✓ built in 3.73s

 prerendering static routes 
10:24:02 ▶ src/pages/404.astro
10:24:02   └─ /404.html (+150ms)
10:24:02 ▶ src/pages/about.astro
10:24:02   └─ /about/index.html (+40ms)
10:24:03 ▶ src/pages/links.astro
10:24:03   └─ /links/index.html (+47ms)
10:24:04 λ src/pages/og.png.ts
10:24:04   └─ /og.png (+9.89s)
10:24:14 λ src/pages/posts/[slug]/index.png.ts
10:24:14   ├─ /posts/arm-如何使用at32-ide--at32-work-bench來撰寫可編譯的程式.png (+308ms)
10:24:14   ├─ /posts/arm-atlink_ez用法.png (+229ms)
10:24:14   ├─ /posts/espif-d1-miniesp8266micropython筆記.png (+260ms)
10:24:14   ├─ /posts/espif-esp32-cam上手使用方式.png (+249ms)
10:24:15   ├─ /posts/linux-在linux下連線到forticlient-vpn.png (+249ms)
10:24:23 ▶ src/pages/posts/[slug]/index.astro
10:24:23   ├─ /posts/arm-at32ide/index.html (+41ms)
10:24:23   ├─ /posts/arm-atlinkez/index.html (+35ms)
10:24:23   ├─ /posts/espif-d1miniandmicropython/index.html (+37ms)
10:24:23   ├─ /posts/espif-esp32can/index.html (+38ms)
10:24:23   ├─ /posts/forticlien-vpn-linux/index.html (+41ms)
10:24:23   ├─ /posts/server-hypervisor/index.html (+43ms)
10:24:23   ├─ /posts/server-microservice/index.html (+43ms)
10:24:23   ├─ /posts/adding-new-posts-in-astropaper-theme/index.html (+48ms)
10:24:24   ├─ /posts/1/index.html (+46ms)
10:24:25   ├─ /posts/2/index.html (+36ms)
10:24:25   ├─ /posts/3/index.html (+37ms)
10:24:25   ├─ /posts/4/index.html (+35ms)
10:24:25   ├─ /posts/5/index.html (+65ms)
10:24:25   ├─ /posts/6/index.html (+39ms)
10:24:25   ├─ /posts/7/index.html (+47ms)
10:24:25   ├─ /posts/8/index.html (+31ms)
10:24:25   ├─ /posts/9/index.html (+39ms)
10:24:25   ├─ /posts/10/index.html (+39ms)
10:24:25 ▶ src/pages/posts/index.astro
10:24:25   └─ /posts/index.html (+42ms)
10:24:25 λ src/pages/robots.txt.ts
10:24:25   └─ /robots.txt (+2ms)
10:24:26 λ src/pages/rss.xml.ts
10:24:26   └─ /rss.xml (+22ms)
10:24:26 ▶ src/pages/search.astro
10:24:26   └─ /search/index.html (+46ms)
10:24:26 ▶ src/pages/tags/[tag]/[page].astro
10:24:26   ├─ /tags/工科賽/1/index.html (+42ms)
10:24:26   ├─ /tags/工科賽/2/index.html (+39ms)
10:24:26   ├─ /tags/ansible/1/index.html (+42ms)
10:24:26   ├─ /tags/ansible/2/index.html (+38ms)
10:24:26   ├─ /tags/archlinux/1/index.html (+39ms)
10:24:26   ├─ /tags/archlinux/2/index.html (+36ms)
10:24:26   ├─ /tags/arm/1/index.html (+40ms)
10:24:26   ├─ /tags/docker/1/index.html (+50ms)
10:24:26   ├─ /tags/docker/2/index.html (+50ms)
10:24:26   ├─ /tags/docs/1/index.html (+43ms)
10:24:26   ├─ /tags/espif/1/index.html (+32ms)
10:24:26   ├─ /tags/linux/1/index.html (+41ms)
10:24:26   ├─ /tags/linux/2/index.html (+46ms)
10:24:26   ├─ /tags/node/1/index.html (+33ms)
10:24:26   ├─ /tags/node/2/index.html (+35ms)
10:24:26   ├─ /tags/podman/1/index.html (+43ms)
10:24:26   ├─ /tags/rust-lan/1/index.html (+37ms)
10:24:26   ├─ /tags/server/1/index.html (+45ms)
10:24:26   ├─ /tags/softdev/1/index.html (+39ms)
10:24:27   ├─ /tags/windows/1/index.html (+29ms)
10:24:27   └─ /tags/windows-server/1/index.html (+108ms)
10:24:27 ▶ src/pages/tags/[tag]/index.astro
10:24:27   ├─ /tags/工科賽/index.html (+49ms)
10:24:27   ├─ /tags/ansible/index.html (+40ms)
10:24:27   ├─ /tags/archlinux/index.html (+50ms)
10:24:27   ├─ /tags/arm/index.html (+45ms)
10:24:27   ├─ /tags/docker/index.html (+37ms)
10:24:27   ├─ /tags/docs/index.html (+35ms)
10:24:27   ├─ /tags/espif/index.html (+45ms)
10:24:27   ├─ /tags/linux/index.html (+38ms)
10:24:28 ▶ src/pages/tags/index.astro
10:24:28   └─ /tags/index.html (+41ms)
10:24:28 ▶ src/pages/terms.astro
10:24:28   └─ /terms/index.html (+34ms)
10:24:28 ▶ src/pages/index.astro
10:24:28   └─ /index.html (+71ms)
10:24:28 ✓ Completed in 26.49s.

10:24:28 
 finalizing server assets 

10:24:28 [build] Rearranging server assets...
10:24:28 [@astrojs/sitemap] `sitemap-index.xml` created at `dist/client`
10:24:28 [build] Server built in 52.75s
10:24:28 [build] Complete!
```

## 執行編譯完成的結果
- 執行預覽: `$ deno task preview`
```
# user @ Host-02 in ~/文件/GitHub/blog_astroV2 on git:main o [10:26:57] 
$ deno task preview
Task preview deno run --allow-net --allow-read --allow-env ./dist/server/entry.mjs
Server running on port 8085
```
- 提供服務: `$ deno task serve`
```
$ deno task serve
Task serve deno serve --allow-net  --allow-read --allow-env ./dist/server/entry.mjs
Server running on port 8085
error: deno serve requires export default { fetch } in the main module, did you mean to run "deno run"?
```

## 建置成docker image

> 本範例會使用 Arch Linux 的 image 進行修改建置

1. 先在專案目錄下建立`Dockerfile.env`
```dockerfile=
FROM archlinux:base-devel
WORKDIR /app

# 安裝相關套件
RUN pacman -Syyu --noconfirm\
 && pacman -S --noconfirm deno nodejs npm\
 && pacman -Scc --noconfirm

# 環境建置
COPY package*.json ./
RUN deno upgrade # 由於Arch套件庫還未更新(20241015),就直接使用官方更新
RUN npm install
COPY . .

# 編譯源碼
RUN deno task build
CMD ["deno", "task", "serve"]

# 指定通訊埠
EXPOSE 8085
```
2. 再建立`docker-compose.yml`
```yaml=
services:
    weblog_deno:
      restart: always # 跟系統服務一起重啟
      ports:
        # 主機端口:容器端口
        - 8085:8085
      # 編譯時的設置
      build:
        context: .
        dockerfile: Dockerfile.env

```
3. 開始建置: `$docker compose up --build -d`

## REF
- Lucas. (2024, October 8). Astro 初見心得和筆記. 星星的筆記. https://star-note-lucas.vercel.app/posts/astro
- 李建興. (2024, September 24). Deno 2.0大改全域變數向Node.Js靠攏. Ithome. https://www.ithome.com.tw/news/165172
- 如何将你的 Astro 网站部署到 Deno. (n.d.). Astro Docs. https://docs.astro.build/zh-cn/guides/deploy/deno/