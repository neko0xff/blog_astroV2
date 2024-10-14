import { defineConfig, passthroughImageService } from "astro/config";
//import deno from "@deno/astro-adapter";
import { SITE } from "./src/config";
import { mermaid } from "./src/plugins/mermaid.ts";
import { proseRemarkPlugin } from "./src/plugins/prose-remark-plugin.mjs";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import remarkToc from "remark-toc";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkCollapse from "remark-collapse";
import remarkGraphviz from "remark-graphviz";
import remarkMermaid from "remark-mermaid";
import lighthouse from "astro-lighthouse";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import rehypeMermaid from "rehype-mermaid";
import rehypeGraphviz from "rehype-graphviz";
import rehypeRaw from "rehype-raw";
import wasm from 'vite-plugin-wasm';

import markdoc from "@astrojs/markdoc";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  image: {
    service: passthroughImageService(),
  },
  integrations: [tailwind({
    applyBaseStyles: true,
  }), react(), sitemap(), mdx(), lighthouse(), markdoc()],
  markdown: {
    rehypePlugins: [
      rehypeRaw,
      rehypeKatex,
      rehypeMermaid,
      rehypeStringify,
      rehypeGraphviz,
    ],
    remarkPlugins: [
      proseRemarkPlugin,
      remarkMath,
      remarkParse,
      remarkRehype,
      remarkGraphviz,
      remarkMermaid,
      mermaid,
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
    ],
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
    plugins: [
      wasm()
    ],
    optimizeDeps: {
      exclude: [
        "@resvg/resvg-js",
      ],
    },
  },
  scopedStyleStrategy: "where",
});