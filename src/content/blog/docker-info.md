---
title: docker-介紹
pubDatetime: 2023-10-15 10:22:49
tags:
  - "docker"
description: ""
---

## 00 緒論

<table><tr><td bgcolor=0000FF>
 <font color=white> `Docker`翻成中文意思就是"碼頭工人" </font>
</table>

是以<font color=red>容器為核心</font>的資訊技術 (Information Technology, IT)交付與運行的標準化系統平台與生態體系。

- 與現實所對應的角色(ex: 以海運為例)
  - 容器(Container) == 傳統運輸領域的貨櫃
  - 雲端服務提供商 == 承載貨櫃的港口
  - 所提供的基礎架構即服務(Infrastructure as a Service, IaaS) == 運送貨櫃的輪船

<!--more-->

## 01 日常可實作案例

### 1-1 原型開發

- 可使用於
  1. 原型的快速實現: 只需在容器做出一些設置，就能提供基本的後端服務來進行測試
  2. 和別人協同合作: 建置相同的開發環境，使其它使用者可以在除錯開發時都不會出錯
- 關於建置的部分，Docker可提供一些功能
  - 從私有庫(registry)或者DockerHub進行上傳(push)/抓取(pull)需要的映像檔
  - 手動匯出/入本機的映像檔&容器到別台機器上進行部署
  - 建立`Dockerfile`&`docker-compose.yml`，來快速建置相關環境的映像檔

### 1-2 部署&維運

#### 2-1 CI/CD

何為CI/CD，其實就是將程式開發的流程進行<font color=red>大量的自動化運行</font>。

> 每個自動化的環節，都可以進一步優化，一開始不必追求完美，先求有再求好並不是隨便，而是精實(lean)的體現 - 謝宗穎

![](https://i.imgur.com/Sydfxcj.png)

- 持續整合/改善(CI,continuous integration): 透過自動化「軟體交付」和「架構變更」的流程，使軟體開發時能夠更加地快捷、頻繁和可靠(ex: 構建、測試、發布)
  - 流程：
    1. 建置: 開發者在每次提交後，都能在同個環境和套件版本下自動編譯所需的程式，同時避免因環境不同而造成服務異常無法運作
    2. 測試: 當程式編譯完成後，會測試新寫的功能是否正常運行或者影響到現有其它功能，同時避免遺忘在本機的自檢
  - 目的
    1. 進行版本控管，使系統功能一致&透明化
       - 減少人工手動的反覆步驟,且同時降低人為疏失風險
       - 降低團隊負擔
    2. 減少驗證和更新所需的時間
- 持續交付(CD,continuous delivery): 讓專案可以自動化部署後，隨時有穩定版本可以運作並且能加速驗證過程
  - 流程: 透過自動化方式，將寫好的程式碼更新到機器上，使得服務可以立即上線
  - 目的
    - 需確保程式和套件的版本＆資料庫資料完整性，使每次更新程式時能順利完成
    - 透過監控系統來確保服務是否正常運行，若服務出問題時，則會即時發通知告知團隊進行處理

![](https://hackmd.io/_uploads/rkYtCCeFn.png)

#### 1-2-2 DevOps

DevOps是一種重視「軟體開發人員」和「IT運維技術人員」之間溝通合作的文化、運動或慣例。

<table><tr><td bgcolor=0000FF>
 <font color=white> DevOps = `Dev`elopment (開發) + `Op`eration`s` (日常維護) </font>
</table>

- 會比較著重於
  - 快速、更出色的應用程式開發: 更快把最新的或己修正後的軟體功能或產品發佈給客戶使用
    - 對於負責該位置的工程師，則會接手各個服務的建置和正式部署後的維運管理的相關業務，來確保環境運行時是穩定不出包。但是實際發生的情況<font color=red>絕對不是單單一個負責DevOps相關職位的人可完成所有的整合</font>！其中會遇到的最大障礙是在進行大量軟體部署時而不易管理。
  - 促進開發團隊(Dev)與其IT營運團隊(Ops)的合作夥伴之間更順暢、持續的溝通、協同作業、整合、可見度及通透性。
    - 順暢進行的條件
      - <font color=red>必須</font>時: 需要和該專案的相關人員進行配合
      - <font color=red>規劃</font>時: 皆要有所考慮所發生的情況&條件

### 1-3 PaaS(platform as a service,平台即服務)

主要提供使用者將雲端基礎設施部署至使用者端，來藉此快速獲得使用程式語言、程式庫與服務等環境等提供運算平台與解決方案服務。

- 組成架構

  1. 雲端基礎架構
     - 虛擬機器(VM)
     - 作業系統軟體(OS)
     - 儲存設備
     - 網路功能(防火牆)
  2. 環境: 用於建置、部署與管理應用程式
  3. 圖形使用者介面(GUI): 其中開發者或團隊可在其中執行他們在整個應用程式生命週期中的所有工作

- 特點
  - 直接抽象掉了硬體和作業系統的細節，可無縫地擴大或縮編所需資源
    - 開發者只需把心力放在自己的程式和資料端的優化與精進，而不需關注於管理與控制雲端基礎設施(需要控制上層的應用程式部署與應用代管環境)
  - 計價方式: 用了多少資源，則使用者就得課金課多少(和打手遊一樣)
    1. 支付固定費用以指定特定數量的資源給特定數目的使用者運用。
    2. 隨收隨付: 以使用該服務的時間來計價
  - 在雲端運算的典型層級中: PaaS層是介於<font color=green>SaaS(軟體即服務)</font>與<font color=green>IaaS(基礎設施即服務)</font>之間

## REF

### iThome

- 謝宗穎. (2015, September 1). 【JSDC客座文章】企業端如何推動持續整合開發流程. IThome. https://www.ithome.com.tw/guest-post/98457
- Neil . (2019, September 27). Day12 什麼是 CICD-就是「懶」才更需要重視DevOps. IThome. https://ithelp.ithome.com.tw/articles/10219083

### Wiki

- https://zh.m.wikipedia.org/zh-tw/%E5%B9%B3%E5%8F%B0%E5%8D%B3%E6%9C%8D%E5%8A%A1

### Other

- https://www.ibm.com/tw-zh/cloud/learn/paas
- https://www.netapp.com/zh-hant/devops-solutions/what-is-devops/
