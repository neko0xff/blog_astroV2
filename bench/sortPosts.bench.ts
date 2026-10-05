/**
 * @file Benchmark getSortedPosts
 *
 * ## 功能 (Who)
 * - 驗證「comparator 內重複解析日期」vs「預先解析時間戳再排序」的差異
 *
 * ## 範圍（What)
 * - 舊版：`sort` comparator 每次比較呼叫 2 次 `parse_date_timestamp`
 * - 新版（`src/utils/getSortedPosts.ts`）：每筆只解析一次，比數字排序
 *
 * ## 可能遇到的情況條件 (Where)
 * - 部分文章有 `modDatetime`（優先採用）、草稿被濾掉
 * - 傳 `is_dev=true` 固定過濾結果，避免 `Date.now()` 讓數據抖動
 *
 * ## 執行(How)
 * ```bash
 * deno task bench
 * deno bench --unstable-kv --unstable-ffi bench/sortPosts.bench.ts
 * ```
 */

import type { CollectionEntry } from "astro:content";
import get_sorted_posts from "../src/utils/getSortedPosts.ts";
import { post_filter } from "../src/utils/postFilter.ts";
import { parse_date_timestamp } from "../src/utils/parseDateString.ts";

type mock_post = {
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

/**
 * @description
 * - 測試資料在 bench 外準備：日期分散在 3 年內，約 1/3 有 modDatetime，含 5% 草稿（驗證過濾路徑）
 */
function build_fixture(): mock_post[] {
  const base = new Date("2024-01-01T00:00:00.000Z").getTime();
  const posts: mock_post[] = [];
  for (let i = 0; i < POST_COUNT; i++) {
    const pub = new Date(base + i * 3_000_000 + (i % 7) * 86_400_000);
    posts.push({
      id: `post-${i}`,
      data: {
        title: `Post ${i}`,
        tags: [`tag-${i % 10}`],
        draft: i % 20 === 0,
        pubDatetime: pub,
        modDatetime: i % 3 === 0
          ? new Date(pub.getTime() + 3_600_000)
          : undefined,
      },
    });
  }
  return posts;
}

const FIXTURE = build_fixture();

/**
 * 舊版實作（改寫前的 `getSortedPosts` 原樣複刻，作為 baseline）。
 *
 * @param posts - 全部文章
 * @returns 排序後的文章（新的在前）
 */
function get_sorted_posts_old(
  posts: mock_post[],
  is_dev = false,
): mock_post[] {
  return posts
    .filter((post) =>
      post_filter(post as unknown as CollectionEntry<"blog">, is_dev)
    )
    .sort((a, b) => {
      const date_a = a.data.modDatetime
        ? parse_date_timestamp(a.data.modDatetime)
        : parse_date_timestamp(a.data.pubDatetime);

      const date_b = b.data.modDatetime
        ? parse_date_timestamp(b.data.modDatetime)
        : parse_date_timestamp(b.data.pubDatetime);

      return date_b - date_a;
    });
}

let sink = 0;

Deno.bench({
  name: "[Sort] comparator 內解析",
  group: "sort-posts",
  baseline: true,
  fn: () => {
    const sorted = get_sorted_posts_old(
      FIXTURE as unknown as CollectionEntry<"blog">[],
      true,
    ) as unknown as mock_post[];
    sink = sorted.length + sorted[0].id.length +
      sorted[sorted.length - 1].id.length;
  },
});

Deno.bench({
  name: "[Sort] 預先解析時間戳",
  group: "sort-posts",
  fn: () => {
    const sorted = get_sorted_posts(
      FIXTURE as unknown as CollectionEntry<"blog">[],
      true,
    ) as unknown as mock_post[];
    sink = sorted.length + sorted[0].id.length +
      sorted[sorted.length - 1].id.length;
  },
});

export { sink };
