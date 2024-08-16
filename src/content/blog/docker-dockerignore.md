---
title: docker-提前自動篩選掉不需進入建置鏡像階段時的檔案&目錄
pubDatetime: 2023-09-13 11:36:22
tags: 
    - 'docker'
description: ""
---

## 00 緒論
當使用docker-compose來建置容器&鏡像時，則會發現在建置過程中會有一些不必的的檔案&目錄(ex: 在開發過程中會有的記錄檔&不必要的函式庫和說明文件)進到鏡像內，進而使整個鏡像變得容量體積變得肥大且建置的效率降低。

## 01 介紹
- `.dockerignore`
  * 主要功能: 透過一個檔案去管理所有能提前篩選掉不需要進入建置階段的檔案&目錄,功能比較類似於git中的`.gitignore`
  * 特點
    1. 加快建置時的效率和時間
    2. 縮減映像檔的所占用的空間

## 02 方式
1. 請在要建立鏡像的目錄建立`.dockerignore`的檔案
2. 且在內部加入需要提前篩選掉不需要進入建置階段的檔案類型和目錄
   ```bash
     # 目錄
     node_modules
     *~
     # 檔案類型
     .log
     .tmp
     .DS_Store
   ```
3. 在每回建置的過程中，都會自動去讀取`.dockerignore`這個檔案，來進行挑除不必要的檔案&目錄，來達成所需的結果。

## REF
- https://ithelp.ithome.com.tw/articles/10308060
- https://blog.csdn.net/qianghaohao/article/details/87902806
- https://www.netadmin.com.tw/netadmin/zh-tw/technology/7BD73E2A172C4847A3F72D238ACA5148?page=3