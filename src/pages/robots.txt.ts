import { SITE } from "@config";
import type { APIRoute } from "astro";

// rebots.txt.ts:
// User-agent: *
// Allow: /
//
// Sitemap: ${new URL("sitemap-index.xml", "https://neko0xff-blog.netlify.app").href}

const config = `
User-agent: *
Allow: /

Sitemap: ${new URL("sitemap-index.xml", SITE.website).href}
`;

const robots = config.trim();

export const GET: APIRoute = () =>
  new Response(robots, {
    headers: { "Content-Type": "text/plain" },
  });
