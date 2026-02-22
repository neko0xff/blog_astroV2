import type { APIRoute } from "astro";
import { SITE } from "@/config";

/**
 * Fetches robots.txt rules for dark visitors (AI scrapers, etc.) from external API.
 * Returns a string to be included in robots.txt.
 * - If the DARK_VISITORS_TOKEN is not set, returns an empty string.
 * - If the fetch fails, also returns an empty string (failsafe).
 * @returns A string containing rules for dark visitors to be included in robots.txt
 */
async function fetchDarkVisitorsRules(): Promise<string> {
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
        agent_types: ["AI Data Scraper", "Undocumented AI Agent"],
        disallow: "/",
      }),
    });
    return await response.text();
  } catch (e) {
    // Fallback: ignore if fetch fails
    return "";
  }
}

/**
 * Generates the robots.txt content.
 * - Includes rules for dark visitors if available
 * - Disallows Googlebot from /nogooglebot/
 * - Allows all other user agents
 * - Specifies the sitemap URL
 * @param sitemapURL The URL of the sitemap to include in robots.txt
 * @param darkVisitors Optional rules for dark visitors to include in robots.txt
 * @returns The complete content for robots.txt
 */
function generateRobotsTxt({
  sitemapURL,
  darkVisitors,
}: {
  sitemapURL: URL;
  darkVisitors?: string;
}) {
  return [
    darkVisitors?.trim(),
    "User-agent: Googlebot\nDisallow: /nogooglebot/",
    "User-agent: *\nAllow: /",
    `Sitemap: ${sitemapURL.href}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export const GET: APIRoute = async () => {
  const sitemapURL = new URL("sitemap-index.xml", SITE.website);
  const darkVisitors = await fetchDarkVisitorsRules();
  const robotsTxt = generateRobotsTxt({ sitemapURL, darkVisitors });
  return new Response(robotsTxt, {
    headers: { "Content-Type": "text/plain" },
  });
};
