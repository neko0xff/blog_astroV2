---
title: Server-微服務(Microservice)
pubDatetime: 2023-04-06
tags:
  - "Server"
description: ""
---

## 00 緒論

主要是一種<font color=red>重新建構應用程式架構且以服務為導向</font>的方法。

原理就是將一個應用程式中不同的業務功能(ex: 前端和後端部分)切開隔離變成彼此模組化成獨立運作的容器個體且使用API和網路協定進行通訊，使得其中一個出問題時整個系統都不會受其影響。

> 『將那些因為相同理由而改變的東西集合起來，將那些因為不同理由而改變的東西分離開來』- 建構微服務

## 01 定義

- 一群協同運作的小型自主服務(Autonomous Service)
  - 小巧，專注，自主性
  - 組合性&最佳可替換性
    - 使用 API 溝通: 不同服務之間透過API呼叫來溝通(ex: HTTP,MQTT)，強化了服務之間的分隔，避免緊密耦合的危險性
  - 技術異質性
    - 資料管理去中心化(decentralized data management): 可自訂資料存放點
    - 每個服務都可自訂的不同種類的資料庫(ex: MS-SQLServer&MariaDB)&語言框架
  - 組織調教&彈性
    - 低耦合（loose coupling）& 高內聚力（high cohesion）: 服務與服務之間必須關聯性低且不互相牽制，而相同功能應該要放在同一個服務之內。如此達成的效果是想要改變一項功能只需要去一個地方修改，並且不會影響到其他服務
  - 容易擴展&獨立佈署: 運維在維護時可以直接更新現有服務和調整硬體配置，而不需花費較多時間和精力在重新部署整個應用程式&環境且同時簡化上服務上線的流程

## REF

- Andrew Wu. (2017, April 15). 架構師觀點 - 轉移到微服務架構的經驗分享 (Part 1). 安德魯的部落格. https://columns.chicken-house.net/2017/04/15/microservice8-case-study/
- 施靜樺. (2019, January 27). Container 概念筆記. Medium. https://medium.com/@jinghua.shih/container-%E6%A6%82%E5%BF%B5%E7%AD%86%E8%A8%98-b0963ae2d7c6
- https://www.itdr.tw/dispPageBox/getFile/GetView.aspx?FileLocation=PJ-SITEVC%5CFiles%5CPrjFiles%5C139%5C&FileFullName=%E5%85%A8%E6%96%87%E5%A0%B1%E5%91%8A.pdf&FileName=FR3470361884yzNR5.PDF
- https://www.netadmin.com.tw/netadmin/zh-tw/technology/7D13ABD7390F4A94B796C738420D8660
- https://medium.com/%E5%80%8B%E4%BA%BA%E6%9B%B8%E6%91%98/%E5%BB%BA%E6%A7%8B%E5%BE%AE%E6%9C%8D%E5%8B%99-%E6%9B%B8%E6%91%98-5b90f4e710c0
