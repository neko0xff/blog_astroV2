專案的檔案結構
===

[回專案主頁](.././README.md)

## 檔案結構

You'll see the following folders and files:

```bash
/
├── public/
│   ├── assets/
│   │   └── ...（頭像、logo、文章圖片等）
│   ├── favicon.svg
│   ├── toggle-theme.js
│   ├── server.ts            # 正式環境靜態檔案伺服器（build 時複製進 dist/）
│   ├── _headers             # Deno Deploy static 的快取/安全性標頭規則
│   ├── googleac6e772d11122b78.html  # Google Site Verification
│   ├── console_warning.js   # 主控台安全警告訊息
│   ├── implementation-lcp.js # 偵測 LCP 元素是否 lazy load
│   ├── dev.svg
│   └── webView.jpg
├── dist/                    # build 輸出（含 pagefind/ 搜尋索引、server.ts，auto-generated）
├── src/
│   ├── assets/
│   │   ├── icons/
│   │   └── socialIcons.ts
│   ├── components/
│   ├── data/
│   │   ├── blog/
│   │   │   └── some-blog-posts.md
│   │   └── links.ts
│   ├── integrations/        # 自訂 Vite 外掛
│   │   └── pagefind-dev-server.ts  # dev 模式直接服務 /pagefind/* 靜態檔案
│   ├── layouts/
│   ├── pages/
│   ├── scripts/
│   │   └── postDetails.ts
│   ├── styles/
│   ├── types/
│   │   └── remark-collapse.d.ts
│   ├── utils/
│   ├── config.ts
│   ├── constants.ts
│   └── content.config.ts
├── scripts/
│   ├── precompress.ts       # 產生 dist/ 下文字類檔案的 .gz 預壓縮變體
│   ├── patch-vite-nonascii.sh  # vite 非 ASCII 路徑 patch
│   └── bundle_audit.test.ts # bundle 大小稽核測試
├── k8s/                     # Kubernetes 部署設定（deployment、hpa、ingress 等）
├── astro.config.ts
├── deno.json                # 開發用 tasks / imports
├── deno_prod.json           # 容器內正式環境設定（覆寫為 deno.json）
├── Dockerfile.env           # 容器建置（含 dist/ 與 server.ts）
├── tsconfig.json            # Astro 型別設定
└── tsconfig.server.json     # server.ts 專用型別設定
```

## 注意事項

- Astro 會在 `src/pages/` 目錄中尋找 `.astro` 或 `.md` 檔案，每個檔案會依檔名對應為一個路由。
- 靜態資源（如圖片）可放置於 `public/` 目錄。
- `public/` 下的檔案（含 `server.ts`）會由 Astro build 原封不動複製到 `./dist/`，因此正式伺服器路徑為 `dist/server.ts`。
- 所有部落格文章存放於 `src/data/blog` 目錄。
