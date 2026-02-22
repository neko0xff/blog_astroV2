---
title: Deno-在固定時間的排程管理
pubDatetime: 2025-04-21
tags:
  - "Deno"
description: ""
---

## 00 緒論

> 這是一個不穩定的 API，隨時可能更改或刪除
> (當下測試版本: `2.2.10`)

當您需要在專案運行期間，定時執行特定的流程或任務時，就需要進行"任務排程"(Task Scheduling)。

在 Node 環境中，通常會選用像 `node-cron` 或 `node-schedule` 這類的第三方函式庫來達成此目標。

相對的，Deno 則內建了能處理定時任務的原生 API (`Deno.cron`)且能在 Deno Deploy 進行管理，而無需額外引入第三方函式庫。

## 01 `Deno.cron` 和其它提供排程功能的函式庫不同之處

- 時間部分: 以 UTC 時區為準
- 星期數字: 不使用基於 0 的星期數字的週開始表示(大多數的排程工具都是這樣)，而是使用數字 `1-7` 或者月份縮寫 `SUN-SAT` 表示星期日至星期六
- 任務執行: 如果執行時有時間沖到的問題，`Deno.cron` 則將會跳過下一個預定的調用以避免重復執行且直到完成該任務

## 02 範例

```typescript
/*定義排程*/
function task1() {
  // 每天早上08點00分執行一回: `0 8 * * *`
  Deno.cron("Daily Data Collection", "0 8 * * *", () => {
    /*需排程的工作*/
    console.log(`task is running in backend`);
  });
}

task1();
```

## REF

### News

- [Deno Cron新工具供開發者安排預定作業，簡化網頁應用開發-ithome](https://www.ithome.com.tw/news/160116)

### Youtube

- [All you need to know about `Deno.cron()`](https://www.youtube.com/watch?v=DFVzxJtDYSs)
  <iframe width="560" height="315" src="https://www.youtube.com/embed/DFVzxJtDYSs?si=_hPiVUiZw3ouRNtU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

- [This week at Deno...](https://www.youtube.com/watch?v=14dM7MSIBXM&t=20s)
  <iframe width="560" height="315" src="https://www.youtube.com/embed/14dM7MSIBXM?si=o0rdCj_AB-0ry-BX" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Deno Docs

- [Manual - Scheduling cron tasks](https://docs.deno.com/deploy/kv/manual/cron/)
- [Examples - `cron`](https://docs.deno.com/examples/cron/)
- [API - `Deno.cron`](https://docs.deno.com/api/deno/~/Deno.cron)
