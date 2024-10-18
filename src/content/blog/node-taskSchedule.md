---
title: node-排程任務
pubDatetime: 2023-10-09 12:22:51
tags:
  - "node"
description: ""
---

## 00 緒論

若需要一些定期定時的執行一些工作(ex:
爬蟲&測試服務功能是否正常)時，則可能需要加入相關的排程套件來進行協助操作。

<!--more-->

## 01 node-cron

### 前置

1. [npm主頁](https://www.npmjs.com/package/node-cron)
2. 安裝: `$npm install node-cron --save`

### 範例

1. 引用相關函式庫

```javascript=
const cron = require('node-cron');
```

2. 寫成函數

```javascript=
// task1: 每天08點00分執行一回
function task1(){
   const task = schedule.scheduleJob('0 8 * * *', () => {
       console.log(`[${clock.consoleTime()}] task is running`);
       crawler.getData();
   });
   return task;
}
```

3. 呼叫

```javascript=
task1();
```

## 02 node-schedule

### 前置

1. [npm主頁](https://www.npmjs.com/search?q=node-schedule)
2. 安裝: `$npm install node-schedule --save`

### 範例

1. 引用相關函式庫

```javascript=
const schedule = require('node-schedule');
```

2. 寫成函數

```javascript=
 // task1: 每天08點00分執行一回
function task1(){
   cron.schedule('0 8 * * *', () => {
      console.log(`[${clock.consoleTime()}] task is running`);
      crawler.getData();
  });
 }
```

3. 呼叫

```javascript=
task1();
```

## REF

### ithome

- https://ithelp.ithome.com.tw/articles/10243928
- https://ithelp.ithome.com.tw/articles/10249462

### Other

- https://pjchender.dev/npm/npm-node-cron/
