import { defineConfig, passthroughImageService } from "astro/config";
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
// add deno support
import deno from '@deno/astro-adapter';
i//mport nodeLoaderPlugin from "@vavite/node-loader/plugin";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  output: 'hybrid', // 開啟 prerender 預先渲染: 
  adapter: deno(),
  image: {
    service: passthroughImageService(),
  },
  integrations: [
    tailwind({
      applyBaseStyles: true,
    }), 
    react(),
    sitemap(),
    mdx(),
    lighthouse(),
    markdoc()
  ],
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
      themes: {
        light: "material-theme-lighter",
        dark: "material-theme-darker",
      },
      wrap: true,
    },
  },
  vite: {
    plugins: [
      wasm(),
      //nodeLoaderPlugin(),
    ],
    ssr: { // ssr instead of rollupOptions
      external: ['@resvg/resvg-js']
    },
    build: {
      rollupOptions: {
        external: ['@resvg/resvg-js'],
      },
      commonjsOptions: {
        ignore: ['@resvg/resvg-js'],
      },
    },
    optimizeDeps: {
      exclude: [
        "@resvg/resvg-js",
      ],
    },

  },
  scopedStyleStrategy: "where",
});
