# 專案結構總覽

這份文件幫助開發者快速理解本專案的資料夾結構與運行流程。

[回專案主頁](.././README.md)

## 資料夾結構

```
blog_astroV2/
├── .agents/          # AI Agent 設定
├── .astro/           # Astro build 快取（自動生成）
├── .codex/           # Codex 設定
├── .github/          # CI/CD workflows
├── .git/             # Git 版本控制
├── .omo/             # OpenCode 設定
├── .vscode/          # VSCode 設定
├── bench/            # 效能基準測試
├── dist/             # Build 輸出（自動生成）
├── docs/             # 專案文件（本資料夾）
├── k8s/              # Kubernetes 設定
├── node_modules/     # npm 套件（自動生成）
├── public/           # 靜態資源（直接複製到 dist）
├── scripts/          # 自動化腳本
├── src/              # 源碼
├── .dockerignore
├── .gitignore
├── .prettierrc.mjs   # Prettier 格式設定
├── AGENTS.md         # Agent 指令（本專案規則）
├── docker-compose.yml
├── deno.json         # Deno task 設定（指令集）
├── Dockerfile.env
└── astro.config.ts   # Astro 設定檔
```

## src/ 詳細

```
src/
├── components/
│   ├── astro/        # Astro 元件
│   │   ├── BackButton.astro
│   │   ├── Breadcrumbs.astro
│   │   ├── Card.astro        # 文章卡片（標題、日期、描述）
│   │   ├── Comments.astro    # Giscus 留言
│   │   ├── Datetime.astro    # 日期顯示
│   │   ├── EditPost.astro    # 編輯文章連結
│   │   ├── Footer.astro
│   │   ├── Header.astro      # 導航列
│   │   ├── Pagination.astro  # 分頁
│   │   ├── ShareLinks.astro
│   │   └── ...
│   └── ...
├── layouts/          # 版面配置
│   ├── Layout.astro      # 核心 HTML 結構與 SEO meta
│   ├── Main.astro        # 主容器
│   ├── PostDetails.astro # 文章頁
│   ├── OtherDetails.astro# 靜態頁（about/terms）
│   ├── Posts.astro       # 文章列表
│   └── TagPosts.astro    # 標籤文章列表
├── pages/            # 路由頁面
│   ├── index.astro       # 首頁
│   ├── posts/            # 文章路由
│   ├── tags/             # 標籤路由
│   ├── archives/         # 歸檔
│   ├── search.astro      # 搜尋
│   ├── 404.astro
│   └── 500.astro
├── styles/           # CSS
├── scripts/          # 前端 JS
│   └── mermaid-lazy.ts   # Mermaid 圖表懶加載
├── utils/            # 工具函式
│   ├── getPath.ts        # 文章路徑（含 slugify 與轉址規則）
│   ├── getUniqueTags.ts  # 唯一標籤
│   ├── slugify.ts        # 標題 → URL slug
│   ├── postFilter.ts     # 文章過濾（草稿/排程，is_dev 由呼叫端注入）
│   ├── parseDateString.ts# 日期解析
│   └── mermaid-remark.ts # Mermaid Remark 外掛
├── config.ts         # 網站基本設定（SITE、BLOG_PATH）
├── constants.ts      # 常數
├── content.config.ts # 內容集合 schema（import astro:content，勿從 utils 引入）
└── assets/           # 圖示、圖片
```

## 重要設定檔

| 檔案                    | 用途                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `deno.json`             | Deno task 指令集、imports、nodeModulesDir                                           |
| `astro.config.ts`       | Astro 設定：sitemap、markdown、image、vite                                          |
| `src/config.ts`         | 網站標題、作者、描述、社交連結等                                                    |
| `src/content.config.ts` | 內容集合 schema 定義（zod）                                                         |
| `public/_headers`       | Deno Deploy 靜態 server 的 headers（cache、安全標頭六項，與 server/config.ts 對齊） |
| `public/_redirects`     | 301 永久轉址規則（staticd 與 server.ts 共用）                                       |
| `.prettierrc.mjs`       | Prettier 格式化設定                                                                 |
| `AGENTS.md`             | 本專案開發規則與規範                                                                |
| `deno_prod.json`        | 容器內正式環境設定（覆寫為 deno.json）                                              |
| `Dockerfile.env`        | 容器建置（含 dist/ 與 server.ts）                                                   |
| `tsconfig.json`         | Astro 側型別設定（排除 `tests/`）                                                   |
| `tsconfig.tests.json`   | `tests/` 專用型別設定（Deno 全域 + @std/assert）                                    |
| `tsconfig.server.json`  | server 模組（public/server.ts＋server/**/*.ts）專用型別設定                         |

## scripts/ 詳細

| 腳本                     | 用途                                     |
| ------------------------ | ---------------------------------------- |
| `precompress.ts`         | 產生 dist/ 下文字類檔案的 .gz 預壓縮變體 |
| `patch-vite-nonascii.sh` | 修補 Vite 非 ASCII 路徑問題（僅 7.x）    |
| `enhance-sitemap.mjs`    | Post-build 注入 sitemap `<lastmod>`      |

## bench/ 詳細

| 檔案                         | 用途                                                             |
| ---------------------------- | ---------------------------------------------------------------- |
| `linkLoading.bench.ts`       | 友站連結 JSON 解析效能（`JSON.parse` vs `+ siteURL` 檢查）       |
| `deployedVsLocal.bench.ts`   | 同一份 JSON 從 Deno Deploy vs 本地 preview 的載入速度（需網路）  |
| `urlParsing.bench.ts`        | `new URL` 一般網址 vs 連續雙斜線網址的解析效能                   |
| `slugify.bench.ts`           | `slugifyStr` 短英文 vs 中文長標題、`slugifyAll` 批次轉換         |
| `parseDate.bench.ts`         | `parse_date_timestamp`：`Date` 物件 vs ISO vs 日期字串           |
| `escapeHtml.bench.ts`        | `escape_html` 短字串 vs 長 mermaid 原始碼                        |
| `closeVoidElements.bench.ts` | `close_void_elements`：未閉合 `<br>` vs 已自封閉 vs 無 void 元素 |
| `getPath.bench.ts`           | `getPath` 根目錄 vs 多層子目錄 vs `_` 開頭目錄                   |
| `sortPosts.bench.ts`         | `getSortedPosts`：comparator 內解析 vs 預先解析時間戳            |

前置條件：`deployedVsLocal.bench.ts` 需 `--allow-net`（`deno task bench`
已含 `-A`）與本地 `deno task preview`（port 8085）；連不上的端點會自動
略過。其餘皆為純函式，不需任何權限旗標。

撰寫與維護規範見 `bench.md`。

## k8s/ 詳細

Kubernetes 部署設定（deployment、hpa、ingress 等），用於生產環境容器部署。

## public/ 詳細

```
public/
├── assets/              # 頭像、logo、文章圖片等靜態資源
├── favicon.svg
├── toggle-theme.js      # 日夜模式切換
├── server.ts            # 正式環境靜態檔案伺服器入口（build 時複製進 dist/）
├── server/              # 伺服器模組：config、安全標頭、快取、檔案、轉址、壓縮、日誌、處理器
├── _headers             # Deno Deploy static 的快取/安全性標頭規則
├── _redirects           # 301 永久轉址規則（staticd 與 server.ts 共用）
├── googleac6e772d11122b78.html  # Google Site Verification
├── console_warning.js   # 主控台安全警告訊息
├── implementation-lcp.js # 偵測 LCP 元素是否 lazy load
├── dev.svg
├── webView.jpg
└── site.webmanifest    # PWA manifest
```

## 注意事項

- Astro 會在 `src/pages/` 目錄中尋找 `.astro` 或 `.md`
  檔案，每個檔案會依檔名對應為一個路由。
- 靜態資源（如圖片）可放置於 `public/` 目錄。
- `public/` 下的檔案（含 `server.ts`、`server/` 模組、`_headers`、`_redirects`）會由 Astro build
  原封不動複製到 `./dist/`（含子目錄），因此正式伺服器路徑為 `dist/server.ts`。
- `public/server/` 模組不直接讀環境：PORT、路徑、`LOG_FORMAT` 由入口算好，
  經 `ServerContext` 傳入；共用常數集中 `server/config.ts`。
- 所有部落格文章存放於 `src/data/blog` 目錄。

## src/ 與 Astro 虛擬模組的邊界

`astro:content`、`astro:transitions` 等是 Astro 在 **Vite 建置期**注入的
虛擬模組，Deno 原生的模組載入器無法解析（會出現
`Unsupported scheme "astro"`）。因此有兩條規則要遵守：

1. **`src/utils/` 底下的模組不得 import `content.config.ts`**
   - 需要 `BLOG_PATH` 等常數時，從零相依的 `src/config.ts` 取得
   - `content.config.ts` 會轉發 `BLOG_PATH`，維持既有 import 相容性
   - `import type` 開頭的 `astro:content` 匯入會在編譯時被抹除，不受影響；
     只有值匯入（如 `defineCollection`）才會讓 Deno 嘗試解析

2. **`src/utils/` 底下不要用 `import.meta.env`**
   - 那是 Astro/Vite 的建置期注入，Deno 型別檢查不認得
   - 需要判斷開發／正式模式時，做成可注入參數，由 `.astro` 呼叫端傳入

這兩條規則的原因與完整案例見 [testing.md](./testing.md) §8.2 與 §8.3。

## 格式化工具的分工

專案同時使用兩套格式化工具，**各管各的目錄**，不要互相覆寫：

| 工具       | 管轄範圍                                    | 指令               |
| ---------- | ------------------------------------------- | ------------------ |
| Prettier   | `src/`、`public/`、`docs/`、設定檔          | `deno task format` |
| `deno fmt` | `tests/`、`bench/`、`scripts/`、`deno.json` | `deno task fmt`    |

`deno.json` 的 `fmt.exclude` 已排除 Prettier 管轄的路徑。兩者規則不同
（Prettier 用 `arrowParens: "avoid"`，`deno fmt` 預設加括號），若同時套用
會互相覆寫而產生大量無關 diff。

## 文章 Frontmatter 範例

```yaml
---
title: 文章標題
pubDatetime: 2024-01-01T00:00:00Z
description: 文章描述（SEO meta description）
tags: ["Tag1", "Tag2"]
draft: false
featured: false
canonicalURL: https://example.com/posts/slug/ # 可選，自訂 canonical
ogImage: https://example.com/image.png # 可選，自訂 OG 圖
hideEditPost: false # 可選，隱藏編輯連結
timezone: Asia/Taipei # 可選，文章時區
---
```

---

## 參考文件

- 運行方式：[running.md](./running.md)
- 測試指南：[testing.md](./testing.md)
- 架構說明：[blog_arch.md](./blog_arch.md)
- 可選環境變數：[optional.md](./optional.md)
- 維運相関：[ops.md](./ops.md)
