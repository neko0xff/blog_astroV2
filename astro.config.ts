import markdoc from "@astrojs/markdoc";
//import mdx from "@astrojs/mdx";
//import expressiveCode from "astro-expressive-code";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import deno from "@deno/astro-adapter"; // add deno support
import AstroPWA from "@vite-pwa/astro";
import lighthouse from "astro-lighthouse";
import { defineConfig, passthroughImageService } from "astro/config";
import rehypeGraphviz from "rehype-graphviz";
//import { rehypeGraphviz } from "@beoe/astro-graphviz/rehype";
import rehypeKatex from "rehype-katex";
import rehypeMermaid from "rehype-mermaid";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkCollapse from "remark-collapse";
import remarkGraphviz from "remark-graphviz";
import remarkMath from "remark-math";
import remarkMermaid from "remark-mermaid";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkToc from "remark-toc";
import wasm from "vite-plugin-wasm";
import { SITE } from "./src/config.ts";
import { mermaid } from "./src/plugins/mermaid.ts";
import { proseRemarkPlugin } from "./src/plugins/prose-remark-plugin.mjs";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";
import process from "node:process";
import partytown from "@astrojs/partytown";
//import { Graphviz } from "@hpcc-js/wasm";

const isDev = process.env.NODE_ENV === "development";
const pwaMode = isDev ? "development" : "production";
const pathMode = isDev ? "dev-dist" : "dist/client";
const patternsMode = isDev ? [] : ["**/*.{js,css,html,wasm,svg,png,ico,txt}"];

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  output: "hybrid", // 開啟 prerender 預先渲染
  adapter: deno({
    port: 8085, // 若無設置，則使用預設的 '8085/tcp'
  }),
  server: {
    port: 8085, // 若無設置，則使用預設的 '4321/tcp'
  },
  image: {
    service: passthroughImageService(),
  },
  integrations: [tailwind({
    applyBaseStyles: true,
  }), AstroPWA({
    mode: pwaMode,
    base: "/",
    scope: "/",
    includeAssets: ["favicon.svg"],
    registerType: "autoUpdate",
    manifest: {
      // `manifest.webmanifest`
      name: SITE.title,
      short_name: "Tech Blog",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#317EFB",
    },
    workbox: {
      globDirectory: pathMode,
      globPatterns: patternsMode,
      globIgnores: [
        "node_modules/**/*",
        "sw.js",
        "workbox-*.js",
        "public/**/*",
        "404.html",
        "500.html",
        "googleef3b53d5436aaff1.html",
      ],
      navigateFallback: "/",
      navigateFallbackDenylist: [
        /\/404/,
        /\/500/,
        /googleef3b53d5436aaff1\.html/,
      ],
      runtimeCaching: [
        {
          urlPattern: ({ url }) => !url.pathname.includes("404"),
          handler: "NetworkFirst",
        },
        {
          urlPattern: ({ url }) => !url.pathname.includes("500"),
          handler: "NetworkFirst",
        },
      ],
    },
    devOptions: {
      enabled: true,
      type: "module",
      navigateFallbackAllowlist: [/^\//],
    },
  }), react(), sitemap(), lighthouse(), markdoc()
  /*expressiveCode({
    themes: ['catppuccin-mocha'],
  }),
  mdx()*/, partytown()],
  markdown: {
    rehypePlugins: [
      rehypeRaw,
      rehypeKatex,
      rehypeMermaid,
      rehypeStringify,
      rehypeGraphviz,
    ],
    remarkPlugins: [
      remarkGraphviz,
      /*[
        remarkGraphviz,
        {
          graphviz: await Graphviz.load(),
        },
      ],*/
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
      proseRemarkPlugin,
      remarkMath,
      remarkParse,
      remarkRehype,
      remarkMermaid,
      mermaid,
      remarkToc,
      remarkReadingTime,
    ],
    shikiConfig: {
      themes: {
        light: "material-theme-lighter",
        dark: "material-theme-darker",
      },
      wrap: true,
    },
  },
  vite: {
    logLevel: "error",
    server: {
      port: 8085,
      hmr: {
        protocol: "ws",
        host: "localhost",
        port: 8085,
      },
    },
    plugins: [wasm()],
    ssr: {
      // ssr instead of rollupOptions
      external: ["@resvg/resvg-js"],
    },
    assetsInclude: ["**/*.wasm"],
    build: {
      rollupOptions: {
        external: ["@resvg/resvg-js", "@hpcc-js/wasm"],
      },
      commonjsOptions: {
        ignore: ["@resvg/resvg-js"],
      },
    },
    optimizeDeps: {
      exclude: ["@resvg/resvg-js", "@hpcc-js/wasm"],
    },
  },
  scopedStyleStrategy: "where",
});