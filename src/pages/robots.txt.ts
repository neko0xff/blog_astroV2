import type { APIRoute } from "astro";
import { SITE } from "@/config";

/**
 * Built-in list of known AI crawler user agents.
 * Covers AI assistants, data scrapers, search crawlers and undocumented agents.
 * These rules apply even when the DarkVisitors API token is not configured,
 * so the site always has a baseline defense against AI scraping.
 */
const AI_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Amazonbot",
  //"PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "Bytespider",
  "CCBot",
  "Diffbot",
  "cohere-ai",
  "YouBot",
  //"Exabot",
  "omgili",
  "Omgilibot",
  "FacebookBot",
  "Timpibot",
  "ImagesiftBot",
] as const;

/**
 * Generates robots.txt disallow rules for the built-in AI user agent list.
 * @returns A string with one "User-agent ... Disallow: /" block per agent
 */
function generate_builtin_rules(): string {
  return AI_USER_AGENTS.map(agent => `User-agent: ${agent}\nDisallow: /`).join(
    "\n\n"
  );
}

/**
 * Fetches robots.txt rules for dark visitors (AI scrapers, etc.) from external API.
 * Returns a string to be included in robots.txt.
 * - If the DARK_VISITORS_TOKEN is not set, returns an empty string.
 * - If the fetch fails, also returns an empty string (failsafe).
 * @returns A string containing rules for dark visitors to be included in robots.txt
 */
async function fetch_dark_visitors_rules(): Promise<string> {
  const token = import.meta.env.DARK_VISITORS_TOKEN;
  if (!token) return "";

  try {
    const response = await fetch("https://api.darkvisitors.com/robots-txts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_types: [
          "AI Assistant",
          "AI Data Scraper",
          "AI Search Crawler",
          "Undocumented AI Agent",
        ],
        disallow: "/",
      }),
    });

    return await response.text();
  } catch {
    // Fallback: ignore if fetch fails
    return "";
  }
}

/**
 * Generates the robots.txt content.
 * - Includes dynamic rules for dark visitors if available
 * - Includes a built-in baseline list of AI crawler user agents
 * - Allows all well-behaved crawlers
 * - Specifies the sitemap URL
 * @param sitemapURL The URL of the sitemap to include in robots.txt
 * @param darkVisitors Optional rules for dark visitors to include in robots.txt
 * @returns The complete content for robots.txt
 */
function generate_robots_txt({
  sitemapURL,
  darkVisitors,
}: {
  sitemapURL: URL;
  darkVisitors?: string;
}) {
  return [
    darkVisitors?.trim(),
    generate_builtin_rules(),
    "User-agent: *\nAllow: /\nDisallow: /search/",
    `Sitemap: ${sitemapURL.href}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export const GET: APIRoute = async () => {
  const sitemapURL = new URL("sitemap-index.xml", SITE.website);
  const darkVisitors = await fetch_dark_visitors_rules();
  const robotsTxt = generate_robots_txt({ sitemapURL, darkVisitors });

  return new Response(robotsTxt, {
    headers: { "Content-Type": "text/plain" },
  });
};
