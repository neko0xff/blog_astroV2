/**
 * @file Benchmark postsByTag
 *
 * ## 功能 (Who)
 * - 比較依標籤篩選文章：現行逐篇 slugify vs 預建標籤索引
 * - 索引版省略過濾與排序，僅比較查找形狀
 * - 合入 src 需另行對齊語意
 *
 * ## 範圍（What)
 * - 舊版：`getPostsByTag`（每篇呼叫 `slugifyAll(tags)` 再 `includes`）
 * - 新版：一次建 `Map<slug, posts>`，查詢只做 `get`
 *
 * ## 可能遇到的情況條件 (Where)
 * - 200 篇文章、每篇 5 tags、查不存在的 tag（空結果路徑）
 * - 傳 is_dev=true 固定過濾結果，避免 Date.now 抖動
 * - fixture 與索引在 bench 外一次建好
 *
 * ## 執行(How)
 * ```bash
 * deno task bench
 * deno bench -A --unstable-kv --unstable-ffi bench/postsByTag.bench.ts
 * ```
 */

import type { CollectionEntry } from "astro:content";
import getPostsByTag from "../src/utils/getPostsByTag.ts";
import { slugifyAll } from "../src/utils/slugify.ts";

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

/** 測試資料在 bench 外準備，避免把建立時間算入結果。 */
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
const QUERY = "my-tag";
const MISSING = "no-such-tag";

/** 預建索引：slug → posts（bench 外一次建好）。 */
const TAG_INDEX = (() => {
  const index = new Map<string, CollectionEntry<"blog">[]>();
  for (const post of ENTRIES) {
    for (const slug of slugifyAll(post.data.tags)) {
      const list = index.get(slug) ?? [];
      list.push(post);
      index.set(slug, list);
    }
  }
  return index;
})();

let sink = 0;

Deno.bench({
  name: "[Tag] 逐篇 slugify 篩選",
  group: "posts-by-tag",
  baseline: true,
  fn: () => {
    sink = getPostsByTag(ENTRIES, QUERY, true).length +
      getPostsByTag(ENTRIES, MISSING, true).length;
  },
});

Deno.bench({
  name: "[Tag] 預建索引查詢",
  group: "posts-by-tag",
  fn: () => {
    sink = (TAG_INDEX.get(QUERY) ?? []).length +
      (TAG_INDEX.get(MISSING) ?? []).length;
  },
});

export { sink };
