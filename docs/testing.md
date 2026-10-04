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
├── bundle_audit.test.ts    # Bundle 大小稽核
├── closeVoidElements.test.ts # SVG void 元素正規化測試
├── enhanceSitemap.test.ts  # sitemap lastmod 測試
├── getPath.test.ts         # 文章路徑測試
├── mermaidRemark.test.ts   # Mermaid HTML 跳脫測試
├── parseDateString.test.ts # 日期解析測試
├── postFilter.test.ts      # 文章過濾測試
├── postsUtils.test.ts      # 標籤/分組測試
└── slugify.test.ts         # URL slug 測試
```

## 3. 執行測試

```bash
# 需要 --allow-read 讀取檔案 + --allow-env 環境變數
deno test --allow-read --allow-env --allow-net tests/
```

**task 說明**：`deno task test` 已設定為
`deno test --allow-read --allow-env --allow-net`，
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
 * deno test --allow-read --allow-env tests/xxx.test.ts
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

| 模組                          | 測試重點                      | 邊界條件                                                                                               |
| ----------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| `slugify.ts`                  | slugifyStr、slugifyAll        | 空字串、中文、特殊字元、多空格                                                                         |
| `parseDateString.ts`          | parse_date_timestamp          | Date 物件、ISO 字串、日期字串、不同時區                                                                |
| `getPath.ts`                  | getPath                       | 子目錄、`_` 開頭目錄、id 含 `/`、前導／尾端斜線、空 id、filePath undefined／空字串／尾端斜線、非 ASCII |
| `getUniqueTags.ts`            | getUniqueTags                 | 空 tags、重複 tag、draft 過濾、排序                                                                    |
| `getPostsByTag.ts`            | getPostsByTag                 | slug 匹配、多 tag 文章、空結果                                                                         |
| `getPostsByGroupCondition.ts` | getPostsByGroupCondition      | 依年份、依月份、空陣列                                                                                 |
| `postFilter.ts`               | post_filter                   | draft、`is_dev` 兩種模式、未來文章                                                                     |
| `mermaid-remark.ts`           | escape_html                   | `<>` `&` `"` `'` 字元                                                                                  |
| `closeVoidElements.ts`        | close_void_elements           | 未閉合 `<br>`、已自封閉保留、屬性值含 `>`、大小寫、冪等                                                |
| `enhance-sitemap.mjs`         | extractPostSlug、lastmod 注入 | 非 post URL、重複 lastmod、URL 編碼                                                                    |

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
- name: Run tests
  run: deno test --allow-read --allow-env --allow-net tests/
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
