---
title: docker-使用make簡化compose指令
pubDatetime: 2023-09-16 07:11:53
tags:
  - "docker"
description: ""
---

## 00 緒論

GNU Make 是一個常用於軟體開發的CLI工具，開發者只需透過自行撰寫的 `Makefile` 檔案來設計相關流程，就能實現執行單一指令就能自動化進行所需的流程(ex:容器的啟動&停止&建置&刪除)，進而簡化其他使用者的執行過程。

<!--more-->

## 01 在撰寫makefile的注意事項

- 縮排不能使用<font color=red>空白鍵</font>而是使用<font color=green>Tab鍵</font>，否則容易會出現語法問題
- 注解的方式和Shell Scrpit一樣使用`#`

## 02 步驟

1. 建立相關檔案: `makefile`/`Makefile`
2. 編寫相關指令

   ```makefile=
    # 變數定義
    CC1:=docker compose

    # phony: 指令保留字
    .PHONY: build up logs stop clean

    # 預設所執行的target
    all: build

    # target: 指令相關動作
    build:
        @$(CC1) up --build -d # 建置容器和相關鏡像檔

    up:
        @$(CC1) up -d # 啟動容器

    logs:
       @$(CC1) logs --tail=100 -f # 檢視容器內的運行過程(輸出未尾的100行)

    stop:
        @$(CC1) stop # 停止容器

    clean:
        @$(CC1) down # 停止且刪除容器
   ```

3. 下指令來驗証自己寫的makefile是否正確: `$ make`

## REF

- https://segmentfault.com/a/1190000041379546
- https://blog.goodjack.tw/2023/01/use-makefile-to-manage-workflows-for-web-projects.html
