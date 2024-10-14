import type { APIRoute } from "astro";
import { SITE } from "@config";

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
