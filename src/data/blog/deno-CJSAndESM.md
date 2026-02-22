---
title: Deno-CJS和ESM的不同
pubDatetime: 2025-04-21
tags:
  - "Deno"
description: ""
---

## 00 緒論

當你使用 Deno 編寫函式時，會發現模組的匯出 (export) & 匯入 (import) 方式，與 Node.js 常見的作法有所不同。

因為 Deno 在函式模組化的部分，是不支援 Node 常用的 CJS/CommonJS 語法(`module.exports`,`require(<value>)`)，而是支援 ESM/ES Modules 語法(`export`,`import`)。

故為了幫助大家能快速理解這兩種不同的模組系統，以下將同時列出 ESM & CJS 的範例，供以大家進行對照參考。

## 02 導出函式

- CJS

  ```javascript
  /*Yasterday a Date*/
  function yasterDate() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const formattedYesterday = yesterday.toISOString().slice(0, 10); // 格式為 YYYY-MM-DD
    return formattedYesterday;
  }

  /*Today a Date*/
  function todayDate() {
    const today = new Date();
    const formattedToday = today.toISOString().slice(0, 10); // 格式為 YYYY-MM-DD
    return formattedToday;
  }

  /*用於匯出函式*/
  module.exports = {
    yasterDate: yasterDate,
    todayDate: todayDate,
  };
  ```

- ESM

  ```typescript
  /*Yasterday a Date*/
  export function yasterDate() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const formattedYesterday = yesterday.toISOString().slice(0, 10); // 格式為 YYYY-MM-DD
    return formattedYesterday;
  }

  /*Today a Date*/
  export function todayDate() {
    const today = new Date();
    const formattedToday = today.toISOString().slice(0, 10); // 格式為 YYYY-MM-DD
    return formattedToday;
  }
  ```

## 03 引用

當寫好了函式要給別人引用時，則可用如下方式來定義引用的函式來源。

- CJS
  ```javascript
  const clock = require("./clock.js");
  print(clock.todayDate());
  ```
- ESM
  ```typescript
  import * as clock from "./clock.ts";
  print(clock.todayDate());
  ```

## REF

### Deno Docs

- [Runtimes-Modules and dependencies](https://docs.deno.com/runtime/fundamentals/modules/)
- [Examples-Importing & exporting](https://examples.deno.land/import-export)

### Other

- [【程式語言 - Javascript】 ESM與CJS — 阿Han的沙龍 ](https://vocus.cc/article/649cc0e0fd89780001a7d34d)
- [Day 20 - JavaScript 模組化標準 ESM - 重造會 Slide 的輪子！深入 JavaScript、CSS 模組化設計](https://ithelp.ithome.com.tw/articles/10295127)
