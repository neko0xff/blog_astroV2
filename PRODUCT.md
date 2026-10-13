# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 7 + Deno + TypeScript + Tailwind CSS v4 + Sharp (images). Deployed on Deno
Deploy (primary) with Kubernetes configs for container deployment.

## Users

Primary: software engineers and system administrators seeking practical,
in-depth technical content. Secondary: tech-curious readers who want accessible
explanations of development and operations topics. Job: learn from real-world
sysadmin/dev experience, discover solutions to infrastructure and code problems,
evaluate modern tooling (Astro, Deno, edge deployment) through a live example.

## Product Purpose

A personal technical blog that shares the author's (neko0xff) hands-on
experience in software development and system administration. Success means:
articles rank for relevant technical queries, readers complete articles and
return, the site itself demonstrates the performance and architecture it
advocates (fast Core Web Vitals, edge deployment, minimal client JS), and the
codebase serves as a reference implementation for Astro + Deno projects.

## Positioning

Practical sysadmin + dev perspective: unlike pure dev blogs or pure ops blogs,
this combines both lenses — code-level decisions informed by production
operations reality, and infrastructure choices informed by developer experience.
The blog is its own case study: built with the stack it writes about (Astro 7
static output, Deno Deploy, zero-bundle client JS where possible,
benchmark-driven optimization).

## Operating Context

- Author writes in Traditional Chinese (zh-TW), timezone Asia/Taipei
- Articles authored as Markdown/MDX in `src/data/blog/` with frontmatter schema
  (title, pubDatetime, description, tags, draft, featured, canonicalURL,
  ogImage, hideEditPost, timezone)
- Content pipeline: Astro content collections → static HTML at build → Deno
  Deploy serves `dist/` + custom server (`dist/server.ts`) for headers,
  redirects, compression, logging
- Search via Pagefind (client-side, zero-API)
- OG images generated at build (Satori + Resvg) per post and site
- Comments via Giscus (GitHub Discussions)
- Analytics: none (privacy-first)
- CI/CD: GitHub Actions → Deno Deploy (test org `nekolab`, prod app `dev-blog`)
- Local dev: `deno task dev` (Astro dev server on port 8085)

## Capabilities and Constraints

**Capabilities:**

- Blog posts with tags, pagination, archives, search
- Static pages (About, Terms, Links) excluded from post lists
- Mermaid diagrams (lazy-loaded), KaTeX math, Shiki syntax highlighting
- Dynamic OG images per post + fallback site OG
- RSS feed, sitemap, robots.txt
- PWA manifest (`site.webmanifest`), service worker offline caching
  (`public/sw.js`: network-first for HTML/Pagefind, cache-first for hashed
  assets), theme toggle (light/dark)
- Pre-compressed assets (.gz) for text files
- 301 redirects via `public/_redirects` (shared by staticd and custom server)
- Performance benchmarks for core utilities (`deno task bench`)
- Comprehensive test suite (`deno task test`)

**Constraints:**

- `src/utils/` cannot import `astro:content` or use `import.meta.env` (Deno
  compatibility)
- Two formatters with split jurisdiction: Prettier for `src/`, `public/`,
  `docs/`; `deno fmt` for `tests/`, `bench/`, `scripts/`
- Slug changes require 301 entries in `_redirects` (both with and without
  trailing slash)
- Dependencies reinstalled only via `deno task install` (runs Vite non-ASCII
  patch for Vite 7.x)
- No Unicode emoji in code/comments
- All tasks via `deno task <name>`; direct `astro`/`npm` forbidden

## Brand Commitments

- Site name: "Neko_oxff Tech Blog" (hero title uses
  `<span class='name'>Neko_oxff</span>`)
- Author handle: neko0xff
- Language: zh-TW (Traditional Chinese, Taiwan)
- Timezone: Asia/Taipei
- Avatar: GitHub profile image
  (https://avatars.githubusercontent.com/u/54382007)
- Domain: https://dev-blog.nekolab.deno.net
- Social: Twitter @neko0xff
- Edit/discussion link: GitHub Discussions on the repo

## Evidence on Hand

- Live site: https://dev-blog.nekolab.deno.net/
- Source: this repository (blog_astroV2)
- Article corpus in `src/data/blog/` (Markdown/MDX with frontmatter)
- Benchmarks in `bench/` with historical data
- Test suite in `tests/` covering utilities, server, OG generation, schema, SEO
- Kubernetes manifests in `k8s/` for container deployment
- Docker Compose for local container testing
- Architecture docs: `docs/blog_arch.md`, `docs/dev_guide.md`

## Product Principles

1. **Performance is a feature, not an afterthought** — every addition measured;
   Core Web Vitals targets are non-negotiable.
2. **The blog demonstrates what it teaches** — the stack, architecture, and
   optimization techniques written about are visibly used in the blog itself.
3. **Privacy by default** — no third-party trackers, no cookies, minimal
   external requests (only Giscus comments opt-in and Google Fonts self-hosted).
4. **Deno-first, framework-second** — tooling, types, and runtime leverage
   Deno's standard library and native capabilities; Astro is the rendering
   layer, not the platform.
5. **Content stability over churn** — slugs are permanent; redirects preserve
   history; schema changes are backward-compatible.

## Accessibility & Inclusion

- WCAG 2.1 AA target: semantic HTML, sufficient contrast, focus management,
  keyboard navigation
- `lang="zh-TW"` on all pages; meaningful alt text for content images
- Reduced motion respected (`prefers-reduced-motion`)
- Font display swap for web fonts
- No autoplaying media; animations opt-in via interaction
