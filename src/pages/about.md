---
layout: ../layouts/AboutLayout.astro
title: "關於作者"
---

## 自我介绍
<div>
  <img src="/assets/avatar.jpg" class="sm:w-1/2 mx-auto" alt="coding dev illustration">
</div>

- 台灣人
- 屬性
  * 真人不實體出道
  * 社交+口語障礙
  * 是什都摸什都不精一些皮毛的喵。。。。
- INTJ-T

## 主要的SNS
- [GitHub](https://github.com/neko0xff)
- [E-Mail](mailto:chzang55@gmail.com)
- [X/Twitter](https://twitter.com/neko_0xFF)
- [YouTube](https://www.youtube.com/channel/UCfBR43eCo07mPWN6K-97TEA)
- [Instagram](https://www.instagram.com/neko_0xff/)
- [BlueSky](https://bsky.app/profile/neko0xff.bsky.social)

## Blog組成架構
- 框架: [Astro](https://docs.astro.build/zh-tw/concepts/why-astro/)
- 主題: [astro-paper](https://github.com/satnaing/astro-paper)

## 曾摸過的項目
- 開發板
    * Arduino
        * UNO,Nano(atmega)
        * ESP8266/32
    * 8X51
- 前端
    * Flutter
- 後端
    * Nodejs
- DataBase
    * MariaDB
    * M$-SQLServer

## Side Project
- 111專題: 空氣感測+本地SaaS
  * [後端+硬體:Arduino+Nodejs+MariaDB](https://github.com/neko0xff/2023_schoolResearch_Server-HW)
  * [前端:Flutter](https://github.com/neko0xff/2023_schoolResearch_ClientApp)
  * 流程圖
  ```dot
      digraph G {
          rankdir=TD;
          node [shape=box];
          A[label="感測器"];
          B[label="Arduino UNO"];
          C[label="網際網路"];
          D[label="後端-API"];
          E[label="資料庫"];
          F[label="前端-介面"];
          G[label="使用者"];
          H[label="裝置"];
          I[label="開關"];
          J[label="閘道器"];
          K[label="分享器"];
          L[label="ESP8266"];

          A -> B [label="    輸出數值"];
          B -> J [label="    序列埠通訊"];
          J -> C;
          K -> C;
          C -> D [label="    插入"];
          D -> E [label="    執行對應動作"];
          F -> D [label="    查詢/修改"];
          G -> H [label="    操作"];
          H -> F ;
          I -> L [label="    控制狀態"];
          L -> K [label="    WiFi"];
    }
  ```
- MessageBot
  * Line
    * [後端:Nodejs](https://github.com/neko0xff/2023_LineBot_Node) 
  * Telegram
    * [後端:Nodejs](https://github.com/neko0xff/2021_telegram_chatbot)

## 如何加入友站鏈結
1. 向該站管理者私信或者提出Issues到`neko0xff/blog_src_astro`
    * 相關倉庫: https://github.com/neko0xff/blog_src_astro
2. 加入的格式如下
      * 由於前端框架己用Astro重寫，請用JSON格式進行提交
      * 相關文件: `public/src/pages/_myLinks.json`
  ```json=
     {
        "name": "neko0xff",
        "site": "Neko0xff Tech Blog",
        "siteURL": "https://neko0xff.github.io/",
        "icon": "https://avatars.githubusercontent.com/u/54382007?v=4"
     },
  ```
3. 管理員收到後，會自己加入提出者的友站鏈結

<div>
  <img src="/assets/dev.svg" class="sm:w-1/2 mx-auto" alt="coding dev illustration">
</div>
