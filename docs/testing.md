# 測試

本文件說明如何為本專案撰寫與維護單元測試。

[回專案主頁](.././README.md)

## 1. Deno 測試基本觀念

Deno 內建測試 runner，無需額外安裝套件。

```typescript
import { assertEquals } from "@std/assert";

Deno.test("測試名稱", () => {
  const result = 1 + 1;
  assertEquals(result, 2);
});
```

## 2. 測試檔案位置

```
tests/
├── bundle_audit.test.ts      # Bundle 大小報告（dist/ 不存在時略過）
├── blogSchema.test.ts        # frontmatter schema 測試
├── closeVoidElements.test.ts # SVG void 元素正規化測試
├── enhanceSitemap.test.ts    # sitemap lastmod 測試
├── getPath.test.ts           # 文章路徑測試
├── getSortedPosts.test.ts    # 文章排序測試（降序、mod 優先、穩定、過濾）
├── googleFont.test.ts        # Google Fonts 下載測試（fetch stub）
├── handler.test.ts           # 靜態伺服器請求處理測試
├── headers_parity.test.ts   # _headers 與 server/config.ts 一致性測試
├── isBlogPost.test.ts        # 獨立頁（about/terms）排除測試
├── links.test.ts             # 友站連結欄位與 myLinks.json 一致性測試
├── mermaidRemark.test.ts     # Mermaid HTML 跳脫測試
├── ogImage.test.ts           # OG 管線 PNG 測試（需 test:og，見 §8.7）
├── ogTemplate.test.ts        # OG satori 模板 SVG 測試
├── parseDateString.test.ts   # 日期解析測試
├── postFilter.test.ts        # 文章過濾測試
├── postsUtils.test.ts        # 標籤/分組測試
├── precompress.test.ts       # 預壓縮副檔名過濾與收集測試
├── redirects.test.ts         # _redirects 載入與成對不變式測試
├── searchMarkup.test.ts      # 搜尋片段 tokenizer（XSS 剝除）測試
├── serverLogging.test.ts     # access log 純函式測試
├── serverFs.test.ts          # 路徑安全測試（穿越、symlink 逃逸）
├── serverUtils.test.ts       # 伺服器純函式測試（log/快取/壓縮協商/安全標頭）
└── slugify.test.ts           # URL slug 測試
```

## 3. 執行測試

```bash
# --allow-write 供 temp fixture 建檔（resolve_file、handler、compress_file 測試）
deno test --allow-read --allow-write --allow-env --allow-net tests/
```

**task 說明**：`deno task test` 已設定為
`deno test --allow-read --allow-write --allow-env --allow-net`，
直接執行即可涵蓋大部分測試需求。

## 4. 撰寫範例

### 4.1 檔案註解格式

每個測試檔開頭必須包含以下格式的註解：

````typescript
/**
 * @file Unit tests for [模組名稱]
 *
 * ## 功能 (who)
 * [說明此測試檔測試什麼]
 *
 * ## 範圍（what)
 * - [列出被測試的函式]
 *
 * ## 可能遇到的情況條件 (Where)
 * - [邊界條件、特殊情況]
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-write --allow-env --allow-net tests/xxx.test.ts
 * ```
 */
````

### 4.2 基本斷言

```typescript
import { assertEquals } from "@std/assert";

Deno.test("範例測試", () => {
  assertEquals(actual, expected);
});
```

### 4.3 需要權限的測試

```typescript
Deno.test("讀取檔案", async () => {
  const content = await Deno.readTextFile("example.txt");
  assertEquals(content.length > 0, true);
});
```

### 4.4 依賴注入的測試

`src/utils/` 底下的函式若需要判斷開發／正式模式，請設計成可注入參數，
不要在函式內讀取環境變數或 `import.meta.env`。測試就能直接控制情境。

```typescript
// src/utils/postFilter.ts
export function post_filter(
  { data }: CollectionEntry<"blog">,
  is_dev: boolean = false
): boolean {
  if (is_dev) return !data.draft;
  // ...
}
```

```typescript
// tests/postFilter.test.ts
Deno.test("[post_filter] excludes future posts in production", () => {
  const futurePost = createMockPost({ pubDatetime: 未來日期 });
  assertEquals(post_filter(futurePost, false), false);
});
```

> 為什麼不用 `import.meta.env.DEV` 或 `Deno.env.get("NODE_ENV")`？
> 前者是 Astro 在建置期注入的，Deno 的型別檢查不認得，會讓
> `deno task test` 直接失敗；後者在 `deno task build` 時不會被設定，
> 判斷結果恆為開發模式，正式建置的過濾邏輯會整個失效。
> 由 Astro 呼叫端（`.astro` 檔）傳入 `import.meta.env.DEV` 是較安全的作法。

## 5. 測試覆蓋重點

| 模組                          | 測試重點                                                           | 邊界條件                                                                                               |
| ----------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `slugify.ts`                  | slugifyStr、slugifyAll                                             | 空字串、中文、特殊字元、多空格                                                                         |
| `parseDateString.ts`          | parse_date_timestamp                                               | Date 物件、ISO 字串、日期字串、不同時區                                                                |
| `getPath.ts`                  | getPath                                                            | 子目錄、`_` 開頭目錄、id 含 `/`、前導／尾端斜線、空 id、filePath undefined／空字串／尾端斜線、非 ASCII |
| `getSortedPosts.ts`           | get_sorted_posts                                                   | 降序、modDatetime 優先、等時間戳穩定排序、草稿／排程過濾、空陣列                                       |
| `isBlogPost.ts`               | isBlogPost                                                         | about／terms 排除、近似 id（about-us 不排除）、大小寫、空字串                                          |
| `getUniqueTags.ts`            | getUniqueTags                                                      | 空 tags、重複 tag、draft 過濾、排序                                                                    |
| `getPostsByTag.ts`            | getPostsByTag                                                      | slug 匹配、多 tag 文章、空結果                                                                         |
| `getPostsByGroupCondition.ts` | getPostsByGroupCondition                                           | 依年份、依月份、空陣列                                                                                 |
| `postFilter.ts`               | post_filter                                                        | draft、`is_dev` 兩種模式、未來文章                                                                     |
| `mermaid-remark.ts`           | escape_html                                                        | `<>` `&` `"` `'` 字元                                                                                  |
| `closeVoidElements.ts`        | close_void_elements                                                | 未閉合 `<br>`、已自封閉保留、屬性值含 `>`、大小寫、冪等                                                |
| `searchMarkup.ts`             | tokenize_search_markup                                             | script／img／a 注入剝除、大小寫 MARK、實體解碼、非 ASCII                                               |
| `redirects.ts`                | load_redirects                                                     | 缺檔回空表、來源成對（有／無尾端斜線）、目標皆為 301 轉址                                              |
| `config.ts`（server）         | parse_log_format                                                   | 大小寫、空值、未知值 fallback                                                                          |
| `cache.ts`                    | cache_control_for                                                  | `/_astro/` immutable、assets／pagefind、HTML 預設 no-cache                                             |
| `compression.ts`              | acceptable_codings                                                 | `q=0` 明確拒絕、子字串陷阱（xbr）、萬用字元、大小寫                                                    |
| `security.ts`                 | with_security_headers                                              | 保留原狀態碼、附加 CSP 等六項標頭                                                                      |
| `fs.ts`                       | file_exists、resolve_file                                          | 目錄非檔、`..` 穿越、檔／目錄 symlink 逃逸、index 二次檢查                                             |
| `handler.ts`                  | serve_inner、create_handler                                        | 轉址 query 保留、非 ASCII Location 編碼、壞編碼 400、自訂 404、gzip 協商、healthz                      |
| `loadGoogleFont.ts`           | loadGoogleFonts                                                    | fetch stub、雙字重、CSS 無匹配拋錯                                                                     |
| `logging.ts`                  | format_timestamp、client_ip、sanitize_log_value、format_access_log | 個位數補零、IP fallback、log 注入清理、text／json 雙格式                                               |
| `links.ts`                    | LINKS 欄位、myLinks.json 一致性                                    | 四欄位非空、https URL、名稱唯一、逐筆相等                                                              |
| `blogSchema.ts`               | create_blog_schema                                                 | 必填拒絕、tags／author 預設、modDatetime 可空、字串 ogImage                                            |
| `og-templates/`               | post／site satori 模板                                             | 合法 SVG、1200x630、向量路徑輸出、模板間可分辨                                                         |
| `generateOgImages.ts`         | SVG→Resvg→PNG（需 `test:og`）                                      | PNG 簽名、IHDR 1200x630                                                                                |
| `precompress.ts`              | COMPRESSIBLE_EXT_RE、collect_files、compress_file                  | 可壓縮／二進位副檔名、與 server 清單同源、遞迴收集皆為檔、寫入與略過                                   |
| `enhance-sitemap.mjs`         | extractPostSlug、getSitemapFiles、enhanceSitemap（真函式直測）     | 非 post URL、重複 lastmod、URL 編碼、temp 檔注入                                                       |

---

## 6. 型別檢查分工

`tests/` 是純 Deno 程式碼，但 `astro check` 是以 `tsconfig.json` 為準的
TypeScript 檢查，兩者對「Deno 全域」與 `jsr:` 模組的解析能力不同。
因此型別檢查分成兩個任務：

| 檢查                    | 涵蓋範圍                              | 設定檔                |
| ----------------------- | ------------------------------------- | --------------------- |
| `deno task check`       | `src/`、`astro.config.ts` 等 Astro 側 | `tsconfig.json`       |
| `deno task check:tests` | `tests/`                              | `tsconfig.tests.json` |

`tsconfig.json` 的 `exclude` 已排除 `tests`，`astro check` 不會檢查它；
`tsconfig.tests.json` 則補上 `@types/deno` 與 `@std/assert` 的路徑映射。

`tests/` 另有 `deno task test` 內建的 Deno 型別檢查把關，兩者互補。

---

## 7. CI/CD 測試

`.github/workflows/ci.yml` 會在 push/PR 時自動執行測試。

```yaml
- name: Typecheck and test
  run: |
    deno task check
    deno task check:tests
    deno task test # --allow-read --allow-write --allow-env --allow-net
```

## 8. 常見問題

### 8.1 測試碼在 Astro 環境中報錯

錯誤範例：

```
TS2304: Cannot find name 'Deno'.
```

**原因**：`deno test` 使用 Deno runtime，但 `astro check` 使用 TypeScript
設定，未包含 Deno 型別。

**解決**：確認 `tsconfig.json` 的 `exclude` 有列 `tests`，並改用
`deno task check:tests` 檢查測試檔。

### 8.2 `astro:content` 無法解析

錯誤範例：

```
Unsupported scheme "astro" for module "astro:content".
Supported schemes: blob, data, file, http, https, jsr, npm
```

**原因**：`astro:content` 是 Astro 在 **Vite 建置期**注入的虛擬模組，
不是 npm 套件也不是實體檔案。Deno 原生的模組載入器沒有註冊 `astro:`
這個 scheme，只要測試的依賴鏈經過任何 import `astro:content` 的模組，
`deno test` 就會整個失敗。

**常見觸發路徑**：有模組為了拿一個普通常數，卻 import 了
`content.config.ts`。例如 `src/utils/getPath.ts` 早期從
`../content.config.ts` 取得 `BLOG_PATH`，連帶把虛擬模組拖進模組圖。

**解決**：把常數移出 `content.config.ts`，放進零相依的模組
（例如 `src/config.ts`），並在原檔轉發以維持相容性。

```diff
 # src/config.ts
+export const BLOG_PATH = "src/data/blog";

 # src/content.config.ts
-import { SITE } from "./config.ts";
-export const BLOG_PATH = "src/data/blog";
+import { BLOG_PATH, SITE } from "./config.ts";
+export { BLOG_PATH };

 # src/utils/getPath.ts
-import { BLOG_PATH } from "../content.config.ts";
+import { BLOG_PATH } from "../config.ts";
```

**驗證方式**：`import type` 開頭的 `astro:content` 匯入會在編譯時被
抹除，不會造成問題。只有**值匯入**（如 `defineCollection`、`getCollection`）
才會讓 Deno 嘗試解析。

### 8.3 `Property 'env' does not exist on type 'ImportMeta'`

錯誤範例：

```
TS2339: Property 'env' does not exist on type 'ImportMeta'.
```

**原因**：在 `src/utils/` 底下用了 `import.meta.env`。這是 Astro/Vite
在建置期注入的，Deno 的型別檢查不認得。

**解決**：改為由 Astro 呼叫端傳入，見 §4.4。

### 8.4 `NotCapable: Requires env access`

錯誤範例：

```
NotCapable: Requires env access to "NODE_ENV"
```

**原因**：缺少 `--allow-env` 權限。

**解決**：執行指令加 `--allow-env`。

### 8.5 瀏覽器專用模組測不動（缺 DOM lib）

錯誤範例：

```
TS2584: Cannot find name 'document'.
```

**原因**：`deno task test` 的型別檢查沒有 DOM lib。瀏覽器腳本
（如 `src/utils/pageFindSearch.ts`）一旦被測試 import，整條依賴鏈的
`document`、`DOMParser`、`location` 都會報錯——即使測試只用其中一個純函式。

**解決**：把純邏輯抽成零依賴模組（如 `src/utils/searchMarkup.ts`，
不碰 DOM 與 `import.meta.env`），瀏覽器殼與測試各引用它：

```diff
 # src/utils/searchMarkup.ts（新增，純字串，可被 Deno 直接 import）
+export function tokenize_search_markup(value: string) { ... }

 # src/utils/pageFindSearch.ts（瀏覽器殼，只負責組 DOM）
+import { tokenize_search_markup } from "./searchMarkup.ts";
-function append_search_markup(container, value) { /* DOMParser ... */ }
+function append_search_markup(container, value) { /* createTextNode ... */ }
```

**驗證方式**：測試只 import 零依賴模組；瀏覽器殼的行為由
`deno task build` 背書。

### 8.6 非 ASCII 工作區路徑讀檔失敗

錯誤範例：測試在本機通過，在含中文路徑的工作區卻讀不到
`public/_redirects`（`load_redirects` 回空表）。

**原因**：`new URL(path, import.meta.url).pathname` 會把中文轉成
百分編碼，`Deno.readTextFile` 吃到編碼後的字串就找不到檔案。

**解決**：字串路徑先 `decodeURIComponent` 還原：

```typescript
const REDIRECTS_PATH = decodeURIComponent(
  new URL("../public/_redirects", import.meta.url).pathname
);
```

（`Deno.readTextFile` 可直接吃 `URL` 物件，但只收字串的函式
如 `load_redirects` 就必須這樣處理。）

### 8.7 原生模組（Resvg）進不了預設測試

錯誤範例：`tests/ogImage.test.ts` 在 `deno task test` 下直接炸
（NAPI `.node` 載入需 `--allow-ffi --allow-sys`）。

**原因**：`@resvg/resvg-js` 是原生模組，預設 task 的權限載不起來；
且測試若靜態 import，模組載入期就崩，連 `ignore` 都來不及生效。

**解決**：雙重隔離——測試檔內動態 import，執行由環境變數守門，
另開專用 task（權限最小化到必要範圍）：

```typescript
const OG_ENABLED = Deno.env.get("OG_TEST") === "1";
Deno.test({
  name: "[ogImage] post renders 1200x630 PNG",
  ignore: !OG_ENABLED,
  fn: async () => {
    const { generateOgImageForPost } =
      await import("../src/utils/generateOgImages.ts");
    // ...
  },
});
```

```json
"test:og": "OG_TEST=1 deno test --allow-read --allow-write --allow-env --allow-net --allow-ffi --allow-sys tests/ogImage.test.ts"
```

**驗證方式**：`deno task test` 照跑（本檔 2 測顯示 ignored）；
`deno task test:og` 跑 PNG 管線。

### 8.8 `import type React from "react"` 在 Deno 報 TS2307

錯誤範例：

```
TS2307: Import "react" not a dependency and not in import map
```

**原因**：專案只有 `@types/react`（無 runtime `react`），
`astro check` 靠 `@types` 解析能過，Deno 原生型別檢查不行。

**解決**：模板元素改用 `Parameters<typeof satori>[0]` 別名，
不新增任何依賴，兩邊檢查器的形狀檢查都保留：

```diff
-import type React from "react";
+type SatoriElement = Parameters<typeof satori>[0];
-    } as React.ReactElement,
+    } as SatoriElement,
```
