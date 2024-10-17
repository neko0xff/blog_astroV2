---
title: node-快速刪除專案內的node_modules
pubDatetime: 2023-04-06
tags:
  - "node"
description: ""
---

## 01 手動

1. `rm -rf` 大法
   ```
   $ rm -rf node_modules
   ```
2. `rmdir`
   ```
   $ rmdir /s/q node_modules
   ```

## 02 套件

- [rimraf](https://www.npmjs.com/package/rimraf)
  1.  全域安裝: `$ npm install rimraf -g`
  2.  刪除指定的目錄: `$ rimraf node_modules`
- [npkill](https://www.npmjs.com/package/npkill)
  1. 全域安裝: `$ npm install npkill -g`
  2. 啟動查找`node_modules`: `$ npkill`
     - 操作部分
       - 在檔案間移動: 上下鍵
       - 刪除指定檔案: Space(空白鍵)
       - 中斷執行: Ctrl+C
     - 其中已刪除的檔案的部分，則終端機的部分會直接顯示 `DELETED`

## REF

- https://blog.51cto.com/u_15127590/3577504
- https://bonnie8ni.medium.com/%E5%BF%AB%E9%80%9F%E5%88%A0%E9%99%A4node-modules%E7%9A%84%E6%96%B9%E6%B3%95-86cd39386964
- https://peterpowerfullife.com/blog/tech-npm-npkill/
