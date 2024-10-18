import markdoc from "@astrojs/markdoc";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
// add deno support
import deno from "@deno/astro-adapter";
import lighthouse from "astro-lighthouse";
import { defineConfig, passthroughImageService } from "astro/config";
import rehypeGraphviz from "rehype-graphviz";
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
import { SITE } from "./src/config";
import { mermaid } from "./src/plugins/mermaid.ts";
import { proseRemarkPlugin } from "./src/plugins/prose-remark-plugin.mjs";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";
import {YouTube} from 'astro-lazy-youtube-embed'

// https://astro.build/config
export default defineConfig({
	site: SITE.website,
	output: "hybrid", // 開啟 prerender 預先渲染
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
		markdoc(),
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
			remarkReadingTime,
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
		ssr: {
			// ssr instead of rollupOptions
			external: ["@resvg/resvg-js"],
		},
		build: {
			rollupOptions: {
				external: ["@resvg/resvg-js"],
			},
			commonjsOptions: {
				ignore: ["@resvg/resvg-js"],
			},
		},
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
	},
	scopedStyleStrategy: "where",
});
