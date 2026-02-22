/* 相關變數定義 */
import { defineConfig } from "astro/config";
import { SITE } from "./src/config.ts";

/* 重要組件 */
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import deno from "@deno/astro-adapter"; //add deno deploy support
import mermaid from "astro-mermaid";
import remarkToc from "remark-toc";
// @ts-ignore
import remarkCollapse from "remark-collapse";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
//import process from "node:process";

//const is_ci = process.env.CI === "true";

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
  adapter: deno({
    port: 8085, // 若無設置，則使用預設的 '8085/tcp'
    start: true,
  }),
  legacy: {
    collections: false, // `src/content`
  },
  integrations: [
    sitemap({
      filter: page => SITE.showArchives || !page.endsWith("/archives"),
    }),
    react(),
    mermaid({
      theme: "forest",
      autoTheme: true,
    }),
  ],
  markdown: {
    remarkPlugins: [
      remarkToc,
      [remarkCollapse, { test: "Table of contents" }],
      remarkMath,
    ],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: {
        light: "material-theme-lighter",
        dark: "material-theme-darker",
      },
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
    resolve: {
      /*
      alias: is_ci
        ? {
            "react-dom/server.browser":
              "https://esm.sh/react-dom@19.2.4/server.browser",
            "react-dom": "https://esm.sh/react-dom@19.2.4",
            react: "https://esm.sh/react@19.2.4",
            "@types/react": "https://esm.sh/react@19.2.4/types",
            "@types/react-dom": "https://esm.sh/react-dom@19.2.4/types",
          }
        : {},*/
    },
    plugins: [tailwindcss()],
  },
  image: {
    service: {
      entrypoint: "astro/assets/services/noop",
    },
  },
  experimental: {
    preserveScriptOrder: true,
  },
});
