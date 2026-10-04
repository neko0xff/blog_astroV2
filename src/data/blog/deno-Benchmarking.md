---
title: Deno-如何針對特定函式和功能進行基準測試
pubDatetime: 2025-04-21
tags:
  - "Deno"
description: ""
---

## 00 緒論

如果您想測試專案中某個函式或功能的目前執行速度，並比較它在不同作業系統平台或硬體配置上的效能表現時！

Deno 提供了內建的基準測試工具 (Benchmarking)，並且提供了一套標準化的腳本編寫方式和一致的效能測量方法。

這樣做的好處是，在開發過程中可方便地收集和比較不同環境和硬體下的效能比較的相關資訊，並且整個過程完全不需要依賴或安裝任何額外的第三方測試工具。

## 01 範例

```typescript
const SAMPLE_JSON = `[{...友站連結...}]`;
let sink = 0;

function parse_link_count(raw: string): number {
  return (JSON.parse(raw) as unknown[]).length;
}

Deno.bench({
  name: "[Parse] JSON.parse",
  group: "link-json-parse",
  baseline: true,
  fn: () => {
    sink = parse_link_count(SAMPLE_JSON);
  },
});

Deno.bench({
  name: "[Parse] JSON.parse + siteURL Check",
  group: "link-json-parse",
  fn: () => {
    sink = parse_link_checked(SAMPLE_JSON);
  },
});

export { sink };
```

## 02 執行

- 單一腳本: `$ deno bench [檔案]`

```zsh
$ deno bench --unstable-kv --unstable-ffi bench/linkLoading.bench.ts
Check file:///home/user/文件/GitHub/blog_astroV2/bench/linkLoading.bench.ts
    CPU | Intel(R) Xeon(R) E-2176M CPU @ 2.70GHz
Runtime | Deno 2.9.7 (x86_64-unknown-linux-gnu)

file:///home/user/%E6%96%87%E4%BB%B6/GitHub/blog_astroV2/bench/linkLoading.bench.ts

benchmark                        time/iter (avg)        iter/s      (min … max)      p75      p99     p995
-------------------------------- ----------------------------- --------------------- --------------------------
group link-json-parse
[Parse] JSON.parse                        1.4 µs         714,800 (  1.4 µs …   1.5 µs)    1.4 µs   1.5 µs   1.5 µs
[Parse] JSON.parse + siteURL Check         1.4 µs         714,800 (  1.4 µs …   1.5 µs)    1.4 µs   1.5 µs   1.5 µs

summary
  [Parse] JSON.parse
       1.03x faster than [Parse] JSON.parse + siteURL Check
```

> 差異小於 5% 視為雜訊：加一層 `siteURL` 檢查幾乎不增加成本。

- 目錄下的全部腳本: `$ deno task bench`

```zsh
$ deno task bench
Task bench deno bench -A --unstable-kv --unstable-ffi  bench/*
Check bench/closeVoidElements.bench.ts
Check bench/deployedVsLocal.bench.ts
Check bench/escapeHtml.bench.ts
Check bench/getPath.bench.ts
Check bench/linkLoading.bench.ts
Check bench/parseDate.bench.ts
Check bench/slugify.bench.ts
Check bench/sortPosts.bench.ts
Check bench/urlParsing.bench.ts
    CPU | Intel(R) Xeon(R) E-2176M CPU @ 2.70GHz
Runtime | Deno 2.9.7 (x86_64-unknown-linux-gnu)

file:///home/user/%E6%96%87%E4%BB%B6/GitHub/blog_astroV2/bench/urlParsing.bench.ts

benchmark                 time/iter (avg)        iter/s      (min … max)           p75      p99     p995
------------------------- ----------------------------- --------------------- --------------------------
group url-parsing
[URL] `/`                         290.3 ns       3,445,000 (271.0 ns … 621.9 ns) 289.2 ns 489.2 ns 621.9 ns
[URL] `//`                         333.3 ns       3,001,000 (304.7 ns … 607.4 ns) 335.8 ns 448.2 ns 607.4 ns

summary
  [URL] `/`
       1.15x faster than [URL] `//`
```

- 環境對照（需先跑 `deno task preview`，本地未啟會自動略過）：

```zsh
$ deno bench -A --unstable-kv --unstable-ffi bench/deployedVsLocal.bench.ts

group net-links
[Net] Deno Deploy myLinks.json          396.2 ms             2.5 (243.0 ms …   1.8 s) 290.7 ms   1.8 s   1.8 s
[Net] 本地 preview myLinks.json          366.7 µs         2,727 (198.7 µs …   8.8 ms) 426.1 µs 656.1 µs   1.2 ms
```

> 遠端組 min…max 從 243 ms 飄到 1.8 s：網路 bench 只看同一次的相對
> 倍數，跨次比較無效。可重現的效能比較請用純函式 bench。

- 把測試結果輸出成 JSON 格式: `$ deno bench --json [檔案]`（下為精簡版，只留關鍵欄位）

```zsh
$ deno bench --unstable-kv --unstable-ffi --json bench/linkLoading.bench.ts
{
  "version": 1,
  "runtime": "Deno/2.9.7 x86_64-unknown-linux-gnu",
  "cpu": "Intel(R) Xeon(R) E-2176M  CPU @ 2.70GHz",
  "benches": [
    {
      "origin": "file:///home/user/%E6%96%87%E4%BB%B6/GitHub/blog_astroV2/bench/linkLoading.bench.ts",
      "group": "link-json-parse",
      "name": "[Parse] JSON.parse",
      "baseline": true,
      "avg_ns": 1524.92
    },
    {
      "origin": "file:///home/user/%E6%96%87%E4%BB%B6/GitHub/blog_astroV2/bench/linkLoading.bench.ts",
      "group": "link-json-parse",
      "name": "[Parse] JSON.parse + siteURL Check",
      "baseline": false,
      "avg_ns": 1510.48
    }
  ]
}
```

## REF

### Deno Docs

- [`deno bench`, benchmarking tool](https://docs.deno.com/runtime/reference/cli/bench)
- [Benchmarking](https://docs.deno.com/examples/benchmarking/)

### Youtube

- [Tips and tricks with deno bench-Youtube](https://www.youtube.com/watch?v=IVde_GTN6TM)

<iframe width="560" height="315" src="https://www.youtube.com/embed/IVde_GTN6TM?si=yl1OctCEGlbMZ4K5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
