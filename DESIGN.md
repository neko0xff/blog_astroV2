---
name: Neko_oxff Tech Blog
description: 繁體中文技術部落格，Astro + Deno 架構，強調效能與簡潔
colors:
  light-background: "#fdfdfd"
  light-foreground: "#282728"
  light-accent: "#006cac"
  light-muted: "#e6e6e6"
  light-border: "#d8d2d2"
  light-error: "#b91c1c"
  dark-background: "#212737"
  dark-foreground: "#eaedf3"
  dark-accent: "#ff6b01"
  dark-muted: "#343f60bf"
  dark-border: "#ab4b08"
  dark-error: "#f87171"
  name-gradient-start: "#f2973b"
  name-gradient-mid: "#fef1b4"
  name-gradient-glow-start: "#b42392"
  name-gradient-glow-mid: "#647eff"
typography:
  display:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.11
  headline:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.56
  title:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "0.25rem"
  md: "0.375rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  xxl: "3rem"
components:
  link-button:
    textColor: "{colors.light-accent}"
    rounded: "0"
  card-title:
    textColor: "{colors.light-accent}"
    fontWeight: 500
    fontSize: "1.125rem"
  tag-chip:
    textColor: "{colors.light-foreground}"
    rounded: "0"
    padding: "0 0.5rem"
  pagination-button:
    textColor: "{colors.light-accent}"
    rounded: "0"
  nav-link:
    textColor: "{colors.light-foreground}"
    fontWeight: 500
    padding: "0.75rem 1rem"
---

# Design System: Neko_oxff Tech Blog

## Overview

**Creative North Star: "The Terminal Notebook"**

A monospace-first technical blog that feels like a well-organized developer
notebook — precise, utilitarian, but with moments of warmth. The design language
is rooted in terminal aesthetics: monospace typography, dashed underlines as
link decoration, and a flat, border-defined spatial system. The site identity
comes from a single gradient-accented wordmark (`.name`) that provides the only
organic, non-rectilinear visual element in the system.

The system prioritizes readability and performance. There are no shadows, no
decorative gradients beyond the site name, and no glassmorphism — the focus-only
skip link carries the single `backdrop-blur` in the system. Depth is conveyed
through color contrast, borders, and typographic hierarchy. Every interaction
has a subtle, functional hover state — links shift to accent color, tags lift
slightly, social icons rotate.

**Key Characteristics:**

- Monospace typography throughout (Tailwind default mono stack, zero web-font
  downloads)
- Flat design with border-based spatial definition
- Dashed underline as the primary link decoration
- Theme-aware (light/dark) via CSS custom properties
- Max content width: 768px (max-w-3xl)
- No shadows, no gradients (except site name)
- Functional micro-interactions on all interactive elements

## Colors

The palette is theme-aware with six semantic roles per theme. Light theme uses a
warm near-white background with deep blue accent. Dark theme uses a blue-gray
background with vivid orange accent. Every color is defined once as a CSS custom
property in `src/styles/global.css` (`:root` for light,
`html[data-theme="dark"]` for dark) and consumed through Tailwind's
`@theme inline` mapping (`--color-background` etc.). Components never hardcode
hex values.

### Primary

- **Light Accent** (#006cac): Deep ocean blue — used for article titles, link
  hover states, active states, and interactive emphasis.
- **Dark Accent** (#ff6b01): Vivid orange — same semantic role as light accent,
  optimized for dark background contrast.

### Neutral

- **Light Background** (#fdfdfd): Warm near-white — page background, card
  surfaces.
- **Dark Background** (#212737): Dark blue-gray — page background in dark mode.
- **Light Foreground** (#282728): Warm near-black — body text, headings, primary
  content.
- **Dark Foreground** (#eaedf3): Cool off-white — body text in dark mode.
- **Light Muted** (#e6e6e6): Light gray — code block backgrounds, scrollbar
  tracks.
- **Dark Muted** (#343f60bf): Semi-transparent muted blue — code blocks, subtle
  backgrounds in dark mode.
- **Light Border** (#d8d2d2): Very light warm gray (1.47:1 on the light
  background) — horizontal rules, dividers, code block borders.
- **Dark Border** (#ab4b08): Burnt orange — borders in dark mode, subtle warm
  accent.

### Error

- **Light Error** (#b91c1c): Strong red — error states, destructive actions.
- **Dark Error** (#f87171): Soft red — error states in dark mode.

### Brand Gradient

- **Name Gradient Start** (#f2973b): Warm amber — start of the site name
  gradient.
- **Name Gradient Mid** (#fef1b4): Pale gold — end of the main gradient text
  fill.
- **Name Gradient Glow** (#b42392 to #647eff): Magenta to periwinkle — the
  pseudo-element glow behind the site name, revealed on hover.

### Named Rules

**The One Accent Rule.** Each theme has exactly one accent color. It is used for
interactive elements, active states, and emphasis. No other saturated color
competes for attention.

## Typography

**Display Font:** ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
monospace (system mono stack) **Body Font:** ui-monospace, SFMono-Regular,
Menlo, Monaco, Consolas, monospace (same as display)

**Character:** The monospace treatment creates a consistent, technical
atmosphere. The system font stack means zero font downloads — performance by
default.

### Hierarchy

- **Display** (700, 2.25rem/36px, 1.11): The index hero title (`text-4xl bold`).
  Page-level h1s on article and list pages do not use Display; they scale 1.5rem
  → 1.875rem (`text-2xl sm:text-3xl`).
- **Headline** (500, 1.125rem/18px, 1.56): Post card titles
  (`text-lg font-medium`). Interactive — always links with dashed underline.
- **Title** (600, 1.875rem/30px, 1.2): Section headings on the index
  (`text-3xl font-semibold`, e.g. 精選文章 / 最近文章).
- **Body** (400, 1rem/16px, 1.6): General text and card descriptions. Article
  prose runs 1rem with looser 1.75 (28px) leading via the typography plugin.
- **Label** (400, 0.875rem/14px, 1.5): Dates, metadata, timestamps, footer text.

### Named Rules

**The Monospace Rule.** All text uses the monospace stack. No serif or
sans-serif display fonts. The technical character is non-negotiable.

## Layout

Single-column layout centered on the page. Content is constrained to a max width
of 768px (`max-w-3xl`) with 1rem horizontal padding (`px-4`).

- **Header:** Full-width bar with logo on left, navigation on right. On mobile
  (<640px), navigation collapses behind a hamburger menu.
- **Main content:** Single column, max-w-3xl, centered.
- **Footer:** Full-width bar with horizontal rule separator, copyright text and
  social icons.
- **Card grid (index):** 1 column on mobile, 2 columns on sm (640px+), 3 columns
  on lg (1024px+). Gap: 1.5rem.
- **Section spacing:** Major sections use `py-8` (2rem) or `py-12` (3rem)
  vertical padding.
- **Article content:** Prose container with max-w-3xl, images centered and
  bordered.
- **Pagination:** Centered below content with previous/next buttons.
- **List pages (posts / tags / archives):** Breadcrumb on top, then page h1 with
  an italic page description beneath (`mt-2 mb-6`), then a single-column card
  list.
- **Article pages:** Back button, post h1, metadata row, prose article, then
  dashed rules separating the tag list, the share row, and the prev/next grid.
- **Base layer:** Text selection paints accent at 75% opacity with
  background-colored text; scrollbar uses the muted color on a transparent
  track.

**Spacing rhythm:** 0.25rem base unit, scaled by Tailwind's 4px-based system.

## Elevation & Depth

**The Flat Rule.** No shadows exist in this system. Depth is conveyed through:

- Color contrast (foreground vs. background)
- 1px borders (`border-border`)
- Underline decoration on links
- Opacity shifts on secondary elements (0.6–0.85)

The flat approach reinforces the terminal-notebook aesthetic and eliminates
shadow rendering cost. The lone exception to strict flatness is the focus-only
skip link's `backdrop-blur-lg` — an accessibility affordance, not a surface
treatment.

## Shapes

- **Corner radius:** Sharp corners by default. The only rounded elements are:
  - Search input: `0.375rem` (6px)
  - Avatar: `9999px` (fully round)
  - Code blocks: `0.25rem` (4px)
- **Borders:** 1px solid `var(--border)` on code blocks, search input, and as
  horizontal rules (`<hr>`)
- **Link decoration:** Dashed underline (`decoration-dashed`); 4px offset in UI
  chrome (cards, tags, nav), 8px offset inside article prose
  (`underline-offset-8`)
- **Focus ring:** 2px dashed outline in accent color, 1px offset, on
  `:focus-visible` for links and buttons
- **Active nav:** Wavy underline (`decoration-wavy`, `decoration-2`, 4px offset)
- **Dashed dividers:** `<hr>` elements between major article sections use
  `border-dashed`

### Named Rules

**The Two Offsets Rule.** Dashed underline offset is 4px in UI chrome and 8px
inside article prose. Don't mix the two contexts.

## Components

### Links

- **Style:** Dashed underline, 4px offset, accent color on hover
- **Focus:** 2px dashed outline with accent color, offset 1px
- **Article links:** inherit foreground color, shift to accent on hover, 8px
  underline offset
- **Prose links** also `break-words` to survive long unbroken URLs

### Skip Link

- **Style:** "跳轉至內容" anchor, accent text on background, 0.5rem vertical /
  0.75rem horizontal padding
- **Visibility:** Parked above the viewport (`-top-full`); keyboard focus slides
  it in (`focus:top-4`) with `transition-all`
- **Exception:** The system's only `backdrop-blur` element

### LinkButton (Primary Interactive)

- **Shape:** Inline-block, no border, no background, no intrinsic padding
  (padding comes from the usage context)
- **Default:** Foreground color text
- **Hover:** Accent color text
- **Disabled:** 50% opacity, `aria-disabled` attribute
- **Used for:** Pagination, back button, "view all posts" CTA, navigation icon
  buttons, social icons

### Card (Post Card)

- **Shape:** List item with 1.5rem vertical margin
- **Title:** Accent color, 500 weight, 1.125rem, dashed underline (4px offset),
  hover underline solid
- **Date:** Label size, italic, 80% opacity, calendar icon
- **Description:** Foreground color, standard body text
- **Transition:** View transition name for smooth page transitions

### Tag Chip

- **Shape:** Inline-flex, no border, hash icon + text, 0.5rem right padding
  (`pr-2`)
- **Default:** Foreground color, dashed underline, 4px offset
- **Hover:** Lift 2px (`-top-0.5`), accent color
- **Sizes:** sm (default, 14px text, 16px icon) and lg (18px text, 24px icon)
- **Icon:** Hash symbol at 80% opacity

### Navigation

- **Desktop:** Horizontal flex row, 1.25rem gap (`gap-x-5`), font-medium weight
- **Link padding:** 1rem vertical / 1rem horizontal on mobile, tightening to
  0.25rem / 0.5rem on sm+
- **Mobile:** 2-column grid menu (w-44, gap 0.5rem) behind a hamburger toggle
  that swaps between menu and close icons
- **Active state:** Wavy underline decoration
- **Search & theme toggle:** Occupy the two half-width cells of the mobile grid;
  inline icon buttons on desktop
- **Theme toggle:** Icon button (48px mobile / 32px sm+) with sun/moon icons;
  `aria-label` states the resulting action ("切換至深色模式" /
  "切換至淺色模式"), not the raw theme value scale-rotate transition
- **Icons:** 24px default, stroke-based (Tabler-style, `stroke-width: 2`,
  `currentColor`)

### Pagination

- **Layout:** Centered flex, previous/next buttons flanking page counter
- **Previous:** Left arrow icon + text "上一頁"
- **Next:** Text "下一頁" + right arrow icon
- **Disabled:** 50% opacity, no pointer events
- **Spacing:** 1rem horizontal margin between buttons and counter; no intrinsic
  padding

### Social Icons

- **Shape:** Icon buttons, 24px icons, stroke 2, transparent fill, 90% opacity
- **Hover:** 6-degree rotation, accent stroke
- **Layout:** Flex-wrap, 0.25rem gap, centered on index
- **Used in:** Footer (always), Index hero section

### Search (Pagefind)

- **Input:** Full-width, 1px border, 6px radius, monospace font, padding tuned
  for the clear button (`0.5rem 2.25rem 0.5rem 2rem`)
- **Focus:** 1px accent outline
- **Keyboard shortcut:** `/` anywhere on the site focuses the search input
  (navigates from other pages, focus on the search page itself); advertised via
  `aria-keyshortcuts` and the input placeholder; suppressed during IME
  composition and while typing in form fields
- **Clear button:** Absolute positioned right (0.5rem), 24px, transparent
  background, hidden until a query exists
- **Results:** 1rem top margin, separated by bottom border
- **Result title:** Accent color, 600 weight, 1rem
- **Result excerpt:** Foreground color, 0.875rem, 85% opacity
- **Empty state:** Foreground at 60% opacity
- **Highlight:** Accent color, 600 weight, transparent background

### Hero (Index Page)

- **Structure:** One centered column, two stacked segments — intro paragraph →
  subscribe/social cluster
- **Intro:** `SITE.desc` at label size (0.875rem), foreground 75% opacity,
  `max-w-prose`; gives first-time visitors positioning before the post list
- **Cluster:** RSS anchor + `Socials` in a single wrapping flex row, 1rem gap
- **Stack:** Avatar (160px, round, eager/high priority) → h1 wordmark → intro →
  cluster, followed by a full-width `<hr>` before the featured/recent grids
- **Avatar source:** Self-hosted — `src/assets/img/avatar.jpg` through `<Image>`
  (webp/avif, immutable cache); `SITE.avatar.src` (GitHub) is only the refresh
  source (`deno task sync:avatar`, which also emits the
  `public/assets/avatar.webp` copy used by the about page's raw `<img>`)
- **Discipline:** No decorative elements beyond the wordmark gradient

### Page Header (List Pages)

- **Title:** `text-2xl font-semibold` (1.5rem) scaling to `sm:text-3xl`
  (1.875rem), foreground color
- **Description:** Italic line beneath the title, 0.5rem above / 1.5rem below
- **Used on:** posts, tags, archives, search, and other static pages

### Post Page Header

- **Title:** `text-2xl font-bold text-accent` (1.5rem, 700, accent)
  inline-block, scaling to `sm:text-3xl` (1.875rem); carries a view transition
  name
- **Metadata row:** Large Datetime (publication / update time) beside the Edit
  Post link, 1rem gap; Edit Post hides below sm

### Article Prose

- **Container:** `.prose` (Tailwind typography plugin) inside max-w-3xl, 2rem
  top margin
- **Links:** Dashed underline with 8px offset, accent on hover
- **Inline code:** 4px radius, muted background at 75%, 0.25rem padding, no
  backtick pseudo-elements
- **Code blocks:** 1px solid border, 4px radius; Shiki dual-theme variables
  drive dark colors
- **Blockquote:** Accent left border at 50%, 80% opacity
- **h3 headings:** Italic
- **Tables / hr:** 1px solid border cells and rules
- **Images:** Centered (`mx-auto`), 2px solid border
- **List markers / TOC:** Accent markers; `h2#table-of-contents` anchors the
  expanding table of contents

### Site Name (Wordmark)

- **Base:** Gradient text fill (amber to pale gold), 315-degree linear gradient
- **Glow:** Pseudo-element with magenta-to-periwinkle gradient, 50% opacity,
  sitting behind the lower band of the text (top edge at 60%)
- **Hover:** Glow band slides down (top edge 60% → 83%), opacity 100%
- **Transition:** 0.5s ease on all properties
- **Accessibility note (accepted tradeoff):** the gradient end `#fef1b4`
  measures ~1.1:1 against the light background (`#fdfdfd`), below the 3:1
  large-text floor. The gradient is the site's single brand moment and was kept
  by deliberate decision; the dark theme measures ~13:1 and passes. Revisit only
  if a darker endpoint can preserve the brand shape

### Back Button

- **Layout:** Left-aligned, chevron-left icon + "回上頁" text
- **Hover:** 75% foreground opacity
- **Behavior:** Reads `backUrl` from sessionStorage for dynamic return
  navigation

### Footer

- **Structure:** Horizontal rule, then a centered column on mobile / reversed
  row on sm+ with socials (right) and copyright (left)
- **Copyright:** "版權 © {year} | 保留所有權利." (whitespace-nowrap)
- **Padding:** 1.5rem vertical on mobile, 1rem on sm+; 1rem horizontal

### Breadcrumbs (with JSON-LD)

- **Layout:** Horizontal inline list, `»` separator, max-w-3xl centered
- **Home link:** "主頁" at 80% opacity, always first
- **Intermediate links:** 70% opacity, capitalize, hover to 100%
- **Current page:** 75% opacity, `aria-current="page"`, no link
- **JSON-LD:** BreadcrumbList structured data with position, name, item URL
- **Spacing:** 2rem top margin, 0.25rem bottom margin
- **SEO:** Enables rich snippet breadcrumb display in search results

### Prev/Next Post Navigation

- **Layout:** Full-width grid, 1 column on mobile, 2 on sm+; next post occupies
  the right column
- **Item:** Chevron + direction label ("上一篇" / "下一篇") over the linked post
  title in accent at 85%
- **Hover:** 75% opacity
- **Excluded from search:** `data-pagefind-ignore`

### Back-to-Top

- **Layout:** Shares a row with Share Links (1.5rem gap, 1rem on sm+), aligned
  right on sm+
- **Content:** Chevron rotated 90° + text "吾要到上頭"
- **Hover:** 75% opacity

### Share Links

- **Layout:** Flex-wrap, centered, 0.25rem gap
- **Label:** "分享該文章至:" in italic
- **Icons:** 24px, stroke 2, transparent fill, 90% opacity
- **Hover:** 6-degree rotation, accent stroke
- **Links:** WhatsApp, Facebook, X, Telegram, Pinterest, Mail (via `?u=` or
  `?url=` params)
- **Behavior:** Opens share dialog in new tab with encoded current URL

### Edit Post Link

- **Layout:** Inline-flex, pencil icon + text
- **Default:** 80% opacity
- **Hover:** 75% opacity
- **Icon:** 24px pencil/edit icon
- **Text:** "提出修改建議" (italic, label size)
- **Target:** GitHub Discussions page (new tab, `rel="noopener noreferrer"`)
- **Visibility:** Hidden when `SITE.editPost.enabled = false` or
  `hideEditPost = true`

### Comments (Giscus)

- **Container:** Full-width div with `id="inject-comments"`
- **Behavior:** Lazy-loaded via external script (`giscus.ts`)
- **Provider:** Giscus (GitHub Discussions-backed)
- **No visual footprint until loaded** — container is empty until script
  executes

### OG Image (Dynamic)

- **Generation:** Build-time via Satori (SVG) + Resvg (PNG)
- **Per-post:** `{slug}/index.png` — includes title, author, date, tags
- **Site-level:** `og.png` — fallback when no post-specific image
- **Dimensions:** 1200×630 (Open Graph standard)
- **Caching:** Generated once at build, served as static asset
- **SEO:** Enables rich social media previews with article metadata

### SEO Meta Tags

- **Canonical:** Absolute URL matching `getPath()` output
- **Open Graph:** `og:title`, `og:description`, `og:type`, `og:url`, `og:image`
  (absolute), `og:locale` (zh_TW)
- **Twitter Card:** `summary_large_image` with title, description, image
- **Article meta:** `article:published_time`, `article:modified_time`,
  `article:section`, `article:tag`
- **Robots:** `noindex, nofollow` for search results, 404, 500 pages
- **Theme color:** Light/dark variants via `prefers-color-scheme`

### Structured Data (JSON-LD)

- **BlogPosting:** headline, description, image, url, datePublished,
  dateModified, author, publisher, mainEntityOfPage
- **WebSite:** name, url, description, inLanguage, author (on homepage)
- **BreadcrumbList:** itemListElement with position, name, item (on all pages
  via Breadcrumbs component)
- **Escaping:** `<` escaped as `\u003c` to prevent `</script>` injection
- **Delivery:** Inline `<script type="application/ld+json">` via `set:html`

### Sitemap

- **Generation:** `@astrojs/sitemap` integration at build time
- **Filter:** Excludes archives (optional), search, 404, 500 pages
- **Output:** `sitemap-index.xml` + `sitemap-0.xml`
- **Canonical only:** Only includes canonical URLs
- **Lastmod:** Injected post-build via `scripts/enhance-sitemap.mjs`

### RSS Feed

- **Format:** RSS 2.0 XML
- **Content:** Recent articles with title, description, link, pubDate, guid
- **Auto-discovery:** `<link rel="alternate" type="application/rss+xml">` in
  `<head>`
- **Output:** `rss.xml` at build time

### Robots.txt

- **Output:** `robots.txt` at build time
- **Rules:** `Allow: /` for all crawlers
- **Sitemap reference:** Absolute URL to sitemap index
- **Noindex pages:** Search results, 404, 500 (via meta tags, not robots.txt)

### Cache-Control Strategy

- **Immutable assets** (`/_astro/`): `public, max-age=31536000, immutable` —
  content-hashed by Astro, cached forever
- **Static assets** (`/assets/`, `/pagefind/`, image/font/media extensions):
  `public, max-age=604800` — 7-day cache
- **HTML and dynamic content**: `no-cache` — revalidate on every request
- **Service worker** (`/sw.js`): `no-cache` — a browser-cached worker delays
  updates by its max-age, so the script itself must revalidate every request
- **Path-based routing**: `cache_control_for(pathname)` function in
  `public/server/cache.ts`
- **Alignment**: Mirrors `public/_headers` rules; both must be updated together
- **Benefit**: Reduces origin server load under high concurrency; browsers/CDNs
  serve cached assets without hitting origin

### Service Worker (Offline)

- **Registration:** `public/pwa.js` (is:inline, defer) on every page; failure is
  silent — PWA is enhancement only and never blocks reading
- **Scope:** `/sw.js` lives at the site root so one worker controls all paths
- **Strategies:**
  - HTML navigations + `/pagefind/`: network-first with cache fallback — content
    freshness wins; offline falls back to the cached response, then cached `/`,
    then a 503 text notice
  - All other same-origin GETs: cache-first with background revalidate
  - Cross-origin and non-GET requests (giscus, APIs) pass through uncached
- **Precache:** Minimal shell (`/`, `site.webmanifest`, `favicon.svg`,
  `logo.svg`), added per-URL so one 404 cannot fail the whole install
- **Cache version:** `neko-blog-v1` — the string must change whenever the
  strategy changes, otherwise old caches survive activation
- **astro:transitions note:** view-transition fetches are not `navigate` mode;
  `accept: text/html` is the criterion used to catch them

### Pre-compressed Variants

- **Formats**: Brotli (`.br`) preferred, Gzip (`.gz`) fallback —
  `COMPRESSED_VARIANTS` in config
- **Generation**: `scripts/precompress.ts` creates `.gz` variants at build time
  for text-based files
- **Content negotiation**: RFC 9110 compliant `Accept-Encoding` parsing
  (q-values, wildcards, case-insensitive)
- **Selection logic**: `pick_variant()` checks client acceptability + file
  existence, br > gzip priority
- **Headers**: `Content-Encoding` + `Vary: Accept-Encoding` set only when
  compressed variant served
- **CPU savings**: Pre-compressed files eliminate per-request compression CPU
  cost under load

### Security Headers

- **CSP**: `default-src 'self' https://giscus.app` — strict
  script/style/image/connect sources
- **HSTS**: `max-age=31536000; includeSubDomains` — HTTPS enforcement
- **X-Frame-Options**: `DENY` — clickjacking prevention
- **X-Content-Type-Options**: `nosniff` — MIME type sniffing prevention
- **Referrer-Policy**: `strict-origin-when-cross-origin` — privacy-preserving
  referrer
- **Permissions-Policy**: Camera, mic, geolocation, interest-cohort disabled;
  clipboard-write=(self) only
- **Applied to all responses**: 200/301/404/405/500/healthz — via
  `with_security_headers()` wrapper

### Health Check Endpoint

- **Path**: `/healthz`
- **Response**: `200 ok` with `Cache-Control: no-store`
- **No access log**: Skips logging to reduce I/O under load probe traffic
- **Use case**: Container/K8s liveness and readiness probes

### Access Logging

- **Format**: Human-readable text or JSON (via `LOG_FORMAT` env var)
- **Fields**: method, path (with query), status, duration_ms, bytes, client IP,
  User-Agent, Referer
- **Sanitization**: Log values sanitized to prevent log injection
- **Timestamp**: ISO 8601 with timezone
- **Output**: stdout (container/K8s collects via stdout/stderr)

### Server Architecture

- **Runtime**: Deno.serve — single-process, event-driven, multi-concurrency
- **Entry**: `public/server.ts` → copied to `dist/server.ts` at build
- **Context injection**: `ServerContext` object (redirects, fs_root, log_format)
  created once at startup, shared across all requests
- **Redirect map**: `load_redirects()` parses `_redirects` once at startup —
  O(1) lookup per request
- **No blocking**: All I/O is async (file reads, compression negotiation)
- **Horizontal scaling**: Stateless by design; multiple instances behind load
  balancer

## Do's and Don'ts

### Do:

- **Do** use the monospace font stack for all text elements
- **Do** read colors from the CSS custom properties (`--background`, `--accent`,
  …) exposed in `src/styles/global.css` — never hardcode hex values in
  components
- **Do** maintain the flat design language — no shadows, no glassmorphism
- **Do** use dashed underlines for content links, wavy underlines for active
  navigation
- **Do** use the 4px underline offset in UI chrome and the 8px offset inside
  article prose
- **Do** respect the single accent color per theme — no competing saturated
  colors
- **Do** use border-based separation (1px solid) instead of shadows for depth
- **Do** implement functional hover states (color shift, subtle transform) on
  all interactive elements
- **Do** use view transitions (`transition:name`, `transition:persist`) for
  smooth page navigation
- **Do** keep content within the 768px max-width container

### Don't:

- **Don't** introduce serif or sans-serif display fonts
- **Don't** add shadows, glows (except the site name gradient), or glassmorphism
  effects — the focus-only skip link's `backdrop-blur` is the single exception
- **Don't** use solid underlines for content links — dashed is the identity
- **Don't** create new accent colors — use the theme's single accent for all
  emphasis
- **Don't** add decorative gradients beyond the existing site name treatment
- **Don't** use border-radius on cards, buttons, or containers — only on search
  input, avatar, and code blocks
- **Don't** make the layout multi-column except for the card grid on index
