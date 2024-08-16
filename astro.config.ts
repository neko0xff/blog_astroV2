import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";
import remarkMath from 'remark-math';
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGraphviz from 'remark-graphviz';
//import remarkMermaid from 'astro-diagram/remark-mermaid';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from "rehype-stringify";
import rehypeMermaid from "rehype-mermaid";
import rehypeGraphviz from "rehype-graphviz";
//import redotStringify from "redot-stringify";
import rehypeRaw from 'rehype-raw';

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap(),
  ],
  markdown: {
   // redotPlugins: [
      //redotStringify,
   // ],
    rehypePlugins: [
      rehypeRaw,
      rehypeKatex,
      //rehypeMermaid,
      rehypeStringify,
      rehypeGraphviz
    ],
    remarkPlugins: [
      //proseRemarkPlugin,
      remarkMath,
      remarkParse,
      remarkRehype,
      remarkGraphviz,
      //remarkMermaid,
      //mermaid,
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
      themes: { light: "min-light", dark: "night-owl" },
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});
