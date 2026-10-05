/**
 * Post-build script to enhance sitemap with lastmod dates from blog collection.
 * Reads the generated sitemap and adds <lastmod> for blog posts based on frontmatter.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const sitemapIndexPath = path.join(distDir, "sitemap-index.xml");

// Blog posts directory in dist
const postsDir = path.join(distDir, "posts");

// Build a map of decoded post slug -> lastmod date from the actual HTML files
export async function buildPostLastmodMap() {
  const map = new Map();
  try {
    const entries = await fs.promises.readdir(postsDir);
    for (const entry of entries) {
      const indexPath = path.join(postsDir, entry, "index.html");
      try {
        const content = await fs.promises.readFile(indexPath, "utf-8");
        // Extract article:published_time or article:modified_time from meta tags
        const publishedMatch = content.match(
          /property="article:published_time" content="([^"]+)"/,
        );
        const modifiedMatch = content.match(
          /property="article:modified_time" content="([^"]+)"/,
        );
        const lastmod = modifiedMatch?.[1] || publishedMatch?.[1];
        if (lastmod) {
          // Use decoded entry name as key
          map.set(decodeURIComponent(entry), lastmod);
        }
      } catch (_e) {
        // Ignore individual file errors
      }
    }
  } catch (_e) {
    // Ignore directory read errors
  }
  return map;
}

// Read sitemap index to get all sitemap files
export function getSitemapFiles(sitemapIndexContent) {
  const urlMatches = sitemapIndexContent.matchAll(/<loc>([^<]+)<\/loc>/g);
  const files = [];
  for (const match of urlMatches) {
    const url = match[1];
    // Extract filename from URL
    const urlPath = new URL(url).pathname;
    // Remove leading slash, trailing slash, and .xml if already present
    let filename = urlPath.replace(/^\//, "").replace(/\/$/, "");
    if (!filename.endsWith(".xml")) {
      filename += ".xml";
    }
    files.push(filename);
  }
  return files;
}

// Extract post slug from sitemap URL
export function extractPostSlug(loc) {
  // URL is encoded, need to decode the path portion
  const urlPath = new URL(loc).pathname;
  const match = urlPath.match(/\/posts\/([^/]+)\//);
  return match ? decodeURIComponent(match[1]) : null;
}

// Enhance a single sitemap file
export async function enhanceSitemap(sitemapPath, postLastmodMap) {
  const content = await fs.promises.readFile(sitemapPath, "utf-8");

  // Use a simpler approach - replace using regex with callback
  let modified = false;
  const newContent = content.replace(
    /<url>([\s\S]*?)<\/url>/g,
    (fullMatch, urlBlock) => {
      const locMatch = urlBlock.match(/<loc>([^<]+)<\/loc>/);
      if (!locMatch) return fullMatch;

      const loc = locMatch[1];
      const postSlug = extractPostSlug(loc);

      if (postSlug && postLastmodMap.has(postSlug)) {
        const lastmod = postLastmodMap.get(postSlug);
        if (!urlBlock.includes("<lastmod>")) {
          // Add lastmod after loc
          modified = true;
          return urlBlock.replace(
            /<loc>[^<]+<\/loc>/,
            `$&<lastmod>${lastmod}</lastmod>`,
          );
        }
      }
      return fullMatch;
    },
  );

  if (modified) {
    await fs.promises.writeFile(sitemapPath, newContent, "utf-8");
    console.log(`Enhanced: ${path.basename(sitemapPath)}`);
  }
}

async function main() {
  console.log("Enhancing sitemap with lastmod dates...");

  const postLastmodMap = await buildPostLastmodMap();
  console.log(`Found ${postLastmodMap.size} posts with dates`);

  // sitemap-index 缺席屬可容忍狀態（例如 sitemap integration 被關掉）：
  // 本腳本已接回 `deno task build`，不可讓整次建置陪葬。
  let sitemapIndexContent;
  try {
    sitemapIndexContent = await fs.promises.readFile(
      sitemapIndexPath,
      "utf-8",
    );
  } catch {
    console.log("No sitemap-index.xml found, skipping.");
    return;
  }
  const sitemapFiles = getSitemapFiles(sitemapIndexContent);

  for (const file of sitemapFiles) {
    const sitemapPath = path.join(distDir, file);
    if (await fs.promises.stat(sitemapPath).catch(() => false)) {
      await enhanceSitemap(sitemapPath, postLastmodMap);
    }
  }

  console.log("Sitemap enhancement complete.");
}

// 被測試 import 時只取用函式；直接執行時才跑管線。
if (import.meta.main) {
  main().catch(console.error);
}
