/**
 * @file Benchmark uniqueTags
 *
 * ## 功能 (Who)
 * - 比較 getUniqueTags 去重策略
 * - 比對現行所使用的演算法: findIndex O(n²) vs Map O(n)
 *
 * ## 範圍（What)
 * - 舊版：`src/utils/getUniqueTags.ts`（filter + findIndex 去重）
 * - 新版：同流程但以 Map 按 slug 去重（候選優化，尚未合入 src）
 *
 * ## 可能遇到的情況條件 (Where)
 * - 200 篇文章
 * - 每篇 5 tags
 * - 約 1/3 重複
 * - 含 5% 草稿
 * - 傳 is_dev=true 固定過濾結果，避免 Date.now 抖動
 *
 * ## 執行(How)
 * ```bash
 * deno task bench
 * deno bench -A --unstable-kv --unstable-ffi bench/uniqueTags.bench.ts
 * ```
 */

import type { CollectionEntry } from "astro:content";
import getUniqueTags from "../src/utils/getUniqueTags.ts";
import { post_filter } from "../src/utils/postFilter.ts";
import { slugifyStr } from "../src/utils/slugify.ts";

type MockPost = {
  id: string;
  data: {
    title: string;
    tags: string[];
    draft: boolean;
    pubDatetime: Date;
    modDatetime: Date | undefined;
  };
};

const POST_COUNT = 200;
const TAG_POOL = [
  "Deno",
  "Astro",
  "系統管理",
  "My Tag",
  "windows-16bit",
  "React",
  "Linux",
  "網路管理",
  "TypeScript",
  "Docker",
];

/**
 * 測試資料在 bench 外準備，避免把建立時間算入結果。
 */
function build_fixture(): MockPost[] {
  const posts: MockPost[] = [];
  for (let i = 0; i < POST_COUNT; i++) {
    posts.push({
      id: `post-${i}`,
      data: {
        title: `Post ${i}`,
        tags: [0, 1, 2, 3, 4].map((k) => TAG_POOL[(i + k) % TAG_POOL.length]),
        draft: i % 20 === 0,
        pubDatetime: new Date("2024-01-01T00:00:00.000Z"),
        modDatetime: undefined,
      },
    });
  }
  return posts;
}

const FIXTURE = build_fixture();
const ENTRIES = FIXTURE as unknown as CollectionEntry<"blog">[];

/**
 * 候選新版：以 Map 去重，其餘流程與 src 一致。
 *
 * @param posts - 全部文章
 */
function get_unique_tags_map(
  posts: CollectionEntry<"blog">[],
): { tag: string; tagName: string }[] {
  const seen = new Map<string, string>();
  for (const post of posts) {
    if (!post_filter(post, true)) continue;
    for (const tag of post.data.tags) {
      const slug = slugifyStr(tag);
      if (!seen.has(slug)) seen.set(slug, tag);
    }
  }
  return [...seen.entries()]
    .map(([tag, tagName]) => ({ tag, tagName }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

let sink = 0;

Deno.bench({
  name: "[Tags] findIndex 去重",
  group: "unique-tags",
  baseline: true,
  fn: () => {
    sink = getUniqueTags(ENTRIES, true).length;
  },
});

Deno.bench({
  name: "[Tags] Map 去重",
  group: "unique-tags",
  fn: () => {
    sink = get_unique_tags_map(ENTRIES).length;
  },
});

export { sink };
