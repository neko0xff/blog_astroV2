---
title: Deno-如何針對特定函式和功能進行基準測試
pubDatetime: 2025-04-21
tags:
  - "Deno"
description: ""
---

## 00 緒論

如果您想測試專案中某個函式或功能的目前執行速度，並比較它在不同作業系統平台或硬體配置上的效能表現時！

Deno 提供了內建的基準測試工具 (Benchmarking) ，並且提供了一套標準化的腳本編寫方式和一致的效能測量方法。

這樣做的好處是，在開發過程中可方便地收集和比較不同環境和硬體下的效能比較的相關資訊，並且整個過程完全不需要依賴或安裝任何額外的第三方測試工具。

## 01 範例

```typescript
async function Data1(){
    const source = "https://neko-0xff-blog.deno.dev/assets/myLinks.json";
    const jsonResponse = await fetch(source);
    const jsonData = await jsonResponse.json();
    //console.log(jsonData);
    return jsonData;
};

async function Data2(){
    const source = "http://localhost:8085/assets/myLinks.json";
    const jsonResponse = await fetch(source);
    const jsonData = await jsonResponse.json();
    //console.log(jsonData);
    return jsonData;
};


Deno.bench("Data1: Deno.dev Json", { baseline : true },async() => {
    await Data1();
});

Deno.bench("Data2: local Json", async() => {
    await Data2();
});
```

## 02 執行

- 單一腳本: `$ deno bench [檔案]`
```zsh
# user @ Host-02 in ~/文件/GitHub/blog_astroV2 on git:main x [12:35:02] C:1
$ deno bench -A --unstable-kv --unstable-ffi  bench/link_loading.ts
Check file:///home/user/文件/GitHub/blog_astroV2/bench/link_loading.ts
    CPU | Intel(R) Core(TM) i5-2450M CPU @ 2.50GHz
Runtime | Deno 2.2.10 (x86_64-unknown-linux-gnu)

file:///home/user/%E6%96%87%E4%BB%B6/GitHub/blog_astroV2/bench/link_loading.ts

benchmark              time/iter (avg)        iter/s      (min … max)           p75      p99     p995
---------------------- ----------------------------- --------------------- --------------------------
Data1: Deno.dev Json          116.2 ms           8.6 ( 63.1 ms … 375.1 ms)  67.9 ms 375.1 ms 375.1 ms
Data2: local Json              45.0 ms          22.2 ( 44.2 ms …  45.8 ms)  45.1 ms  45.8 ms  45.8 ms

summary
  Data1: Deno.dev Json
     2.58x slower than Data2: local Json
```
- 目錄下的全部腳本: `$ deno bench [目錄]/*`
```zsh
# user @ Host-02 in ~/文件/GitHub/blog_astroV2 on git:main x [8:41:52] 
$ sudo make deno_bench
Running Bench Script
Task bench deno bench -A --unstable-kv --unstable-ffi  bench/*
Check file:///home/user/文件/GitHub/blog_astroV2/bench/link_loading.ts
Check file:///home/user/文件/GitHub/blog_astroV2/bench/url_bench.ts
    CPU | Intel(R) Core(TM) i5-2450M CPU @ 2.50GHz
Runtime | Deno 2.2.10 (x86_64-unknown-linux-gnu)

file:///home/user/%E6%96%87%E4%BB%B6/GitHub/blog_astroV2/bench/link_loading.ts

benchmark              time/iter (avg)        iter/s      (min … max)           p75      p99     p995
---------------------- ----------------------------- --------------------- --------------------------
Data1: Deno.dev Json          133.6 ms           7.5 ( 61.7 ms … 394.6 ms) 106.0 ms 394.6 ms 394.6 ms
Data2: local Json              43.3 ms          23.1 ( 41.9 ms …  45.3 ms)  44.8 ms  45.3 ms  45.3 ms


file:///home/user/%E6%96%87%E4%BB%B6/GitHub/blog_astroV2/bench/url_bench.ts

benchmark     time/iter (avg)        iter/s      (min … max)           p75      p99     p995
------------- ----------------------------- --------------------- --------------------------
URL Parsing            1.1 µs       939,400 (892.2 ns …   3.2 µs)   1.0 µs   3.2 µs   3.2 µs

```
- 把測試結果輸出成JSON格式: `$ deno bench --json [目錄]/*`
```zsh
# user @ Host-02 in ~/文件/GitHub/blog_astroV2 on git:main x [12:35:27] 
$ deno bench -A --unstable-kv --unstable-ffi --json  bench/link_loading.ts
Check file:///home/user/文件/GitHub/blog_astroV2/bench/link_loading.ts
{
  "version": 1,
  "runtime": "Deno/2.2.10 x86_64-unknown-linux-gnu",
  "cpu": "Intel(R) Core(TM) i5-2450M CPU @ 2.50GHz",
  "benches": [
    {
      "origin": "file:///home/user/%E6%96%87%E4%BB%B6/GitHub/blog_astroV2/bench/link_loading.ts",
      "group": null,
      "name": "Data1: Deno.dev Json",
      "baseline": true,
      "results": [
        {
          "ok": {
            "n": 12,
            "min": 63010790.0,
            "max": 284075020.0,
            "avg": 104644459.0,
            "p75": 95610989.0,
            "p99": 284075020.0,
            "p995": 284075020.0,
            "p999": 284075020.0,
            "highPrecision": true,
            "usedExplicitTimers": false
          }
        }
      ]
    },
    {
      "origin": "file:///home/user/%E6%96%87%E4%BB%B6/GitHub/blog_astroV2/bench/link_loading.ts",
      "group": null,
      "name": "Data2: local Json",
      "baseline": false,
      "results": [
        {
          "ok": {
            "n": 22,
            "min": 42731490.0,
            "max": 45794837.0,
            "avg": 44579127.0,
            "p75": 45128766.0,
            "p99": 45794837.0,
            "p995": 45794837.0,
            "p999": 45794837.0,
            "highPrecision": true,
            "usedExplicitTimers": false
          }
        }
      ]
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

<iframe width="560" height="315" src="https://www.youtube.com/embed/IVde_GTN6TM?si=yl1OctCEGlbMZ4K5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>