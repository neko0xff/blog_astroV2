/* 相關變數定義 */
import { defineConfig } from "astro/config";
import { SITE } from "./src/config.ts";
import { rehypeShiki, unified } from "@astrojs/markdown-remark";

/* 重要組件 */
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import mermaid from "astro-mermaid";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import process from "node:process";
import { readFileSync } from "node:fs";

const is_ci = process.env.CI === "true";

/* 從 package.json 讀取 react 版本，避免 CI alias 與相依宣告的版本漂移 */
const pkg_deps = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
).dependencies as Record<string, string>;

const strip_range = (version: string): string => version.replace(/^[\^~]/, "");
const react_version = strip_range(pkg_deps.react);
const react_dom_version = strip_range(pkg_deps["react-dom"]);

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
      filter: (page) =>
        (SITE.showArchives || !page.endsWith("/archives")) &&
        !page.endsWith("/search/"),
    }),
    react(),
    mermaid({
      theme: "forest",
      autoTheme: false,
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
        remarkMath,
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
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
    resolve: {
      alias: [
        // Deno requires node: prefix for Node built-ins; Vite may strip it
        ...COMPATIBLE_NODE_MODULES.map((mod) => ({
          find: mod,
          replacement: `node:${mod}`,
        })),
        ...(is_ci
          ? [
            {
              find: "react-dom/server.browser",
              replacement:
                `https://esm.sh/react-dom@${react_dom_version}/server.browser`,
            },
            {
              find: "react-dom",
              replacement: `https://esm.sh/react-dom@${react_dom_version}`,
            },
            {
              find: "react",
              replacement: `https://esm.sh/react@${react_version}`,
            },
            {
              find: "@types/react",
              replacement: `https://esm.sh/react@${react_version}/types`,
            },
            {
              find: "@types/react-dom",
              replacement:
                `https://esm.sh/react-dom@${react_dom_version}/types`,
            },
          ]
          : []),
      ],
    },
    plugins: [tailwindcss()],
  },
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
});
