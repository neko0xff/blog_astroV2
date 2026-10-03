/* 相關變數定義 */
import { defineConfig } from "astro/config";
import { SITE } from "./src/config.ts";
import { rehypeShiki, unified } from "@astrojs/markdown-remark";

/* 重要組件 */
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { mermaid_remark } from "./src/utils/mermaid-remark.ts";
import { pagefind_dev_server } from "./src/integrations/pagefind-dev-server.ts";

// Node.js built-in modules that Deno can polyfill (from @deno/astro-adapter source)
const COMPATIBLE_NODE_MODULES = [
  "assert",
  "assert/strict",
  "async_hooks",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "diagnostics_channel",
  "dns",
  "events",
  "fs",
  "fs/promises",
  "http",
  "http2",
  "https",
  "inspector",
  "module",
  "net",
  "os",
  "path",
  "path/posix",
  "path/win32",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "stream/promises",
  "stream/web",
  "string_decoder",
  "sys",
  "timers",
  "timers/promises",
  "tls",
  "trace_events",
  "tty",
  "url",
  "util",
  "util/types",
  "v8",
  "vm",
  "wasi",
  "worker_threads",
  "zlib",
];

/*
 * 這個配置文件是用於Astro框架的配置
 *  相關文件: https://astro.build/config
 */
export default defineConfig({
  site: SITE.website,
  base: "/",
  trailingSlash: "always", // 統一結尾斜線，避免 /post 與 /post/ 被視為重複網頁或觸發重新導向
  /*提供服務部分*/
  output: "static", // 靜態輸出選項: Astro 4 = "hybrid" , Astro 5 = "static"
  server: {
    port: 8085, // 若無設置，則使用預設的 '4321/tcp'
  },
  legacy: {
    collectionsBackwardsCompat: false,
  },
  integrations: [
    sitemap({
      filter: page =>
        (SITE.showArchives || !page.endsWith("/archives")) &&
        !page.endsWith("/search/") &&
        !page.endsWith("/404/") &&
        !page.endsWith("/500/"),
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
        remarkMath,
        mermaid_remark,
      ],
      rehypePlugins: [
        [
          rehypeShiki,
          {
            themes: {
              light: "material-theme-lighter",
              dark: "material-theme-darker",
            },
            wrap: true,
          },
        ],
        rehypeKatex,
      ],
    }),
  },
  vite: {
    build: {
      // Mermaid is intentionally isolated and loaded only when a diagram is visible.
      chunkSizeWarningLimit: 700,
      // 不要把 script chunk inline 進 HTML，但維持 CSS 的預設行為。
      //
      // 為什麼：public/_headers 的 CSP 是 `script-src 'self' https://giscus.app`，
      // 沒有 'unsafe-inline' 也沒有任何 hash。Astro 預設會把 <4096B 的 script
      // chunk 直接 inline 成 <script type="module">…</script>（見 Astro 的
      // shouldInlineScriptChunk），那些 inline 腳本在 CSP 下全部被擋下，
      // 導致選單開關、BackButton、sessionStorage 寫入、giscus 注入全部失效。
      //
      // 這裡回傳 false 只針對 .js；回傳 undefined 讓 Astro 沿用預設的 4096B
      // 規則。刻意不用 `assetsInlineLimit: 0`：那會連 CSS 一起改成外部檔
      // （實測外部 stylesheet 從 104 個增到 206 個），是不必要的行为改變。
      //
      // 也刻意不在 CSP 裡掛 sha256 hash：hash 會隨任何腳本內容變動而失效，
      // 每次建置都得重算並同步 _headers 與 server.ts，維護成本高且容易漏。
      assetsInlineLimit: (filePath: string) =>
        filePath.endsWith(".js") ? false : undefined,
    },
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
    resolve: {
      alias: [
        // Deno requires node: prefix for Node built-ins; Vite may strip it
        ...COMPATIBLE_NODE_MODULES.map(mod => ({
          find: mod,
          replacement: `node:${mod}`,
        })),
      ],
    },
    plugins: [tailwindcss(), pagefind_dev_server()],
  },
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
});
