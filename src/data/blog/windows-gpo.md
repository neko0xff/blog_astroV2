---
title: Windows-AD上的GPO(群組原則)
pubDatetime: 2025-12-27 10:58:51
tags:
  - "Windows"
  - "GPO"
  - "Active Directory"
description: "Windows 群組原則(GPO)的基本概念與使用方法，包括策略設定、套用範圍與管理方式"
---

## 群組原則是什？

GP(Group Policy,群組原則/組策略) 是 Windows NT 作業系統核心家族(Windows 10/11 & Windows Server) 所提供方便集中控制主機上使用者帳戶&該主機上所有的組態環境配置。

其中控制對象從不只單一台主機（LGPO），而是到整個 Active Directory 網域上的多台主機&使用者進行集中化管理！

<!--more-->

## 主要目的

1. 管理使用者和電腦的一般性功能與安全性管理
   - 配置各階層組織單位，給予不同原則限制
   - 確保集中管理的主機 & 使用者
     - 有相同的操作介面&系統環境設定
     - 強制實施必要的安全性設定
2. 軟體&批次檔腳本部署派送
   - 應用程式(僅限MSI封裝的安裝程式)
   - 系統更新
   - 批次檔腳本 (ex: 登入後自動掛戴網路磁碟)

## 套用規則

- 套用順序: L(ocal) → S(ite) → D(omain) → OU
  1. 本機 (Local)：首先套用儲存在個別電腦上的本機 GPO
  2. 站台 (Site)：接著套用連結至 Active Directory 站台的 GPO
  3. 網域 (Domain)：隨後套用連結至網域的 GPO
  4. 組織單位 (OU)：最後套用與 OU 相關聯的 GPO
- 覆寫原則與優先權
  - 後者為準：由於每個後續套用的原則都可以覆寫先前原則的設定，因此處理順序非常重要
  - 最接近者優先：根據預設處理順序，最接近電腦或使用者的 AD 容器（例如子 OU）所設定的原則，會覆寫較高層級容器（如網域或站台）中的設定
- 例外狀況
  - 強制執行 (Enforced)：若 GPO 設定為強制執行，其設定將無法被較低層級的 GPO 覆寫
  - 封鎖繼承 (Block Inheritance)：此功能會停止上層（站台、網域、父 OU）的原則套用至該容器，但**「強制執行」的優先權高於「封鎖繼承」**

## 同步原則

- 不同的對象，所套用的初始化時間點(前景政策應用)
  - 衝突優先順序: 電腦主機優先
    | 針對對象 | 套用時間點 |
    |:----------:|:------------------:|
    | 電腦主機 | 系統下一回啟動時 |
    | 使用者帳戶 | 使用者下一回登入時 |
- 前置處理可以是同步或異步
  - 在同步模式中
    - 在成功套用計算機原則之前，計算機不會完成系統啟動。
    - 使用者登入過程在用戶原則順利完成套用之前不會完成。
  - 在異步模式中
    - 如果沒有需要同步處理的原則變更，電腦可以在電腦原則的應用程式完成之前完成開始順序。
    - 使用者政策的應用完成之前，使用者即可使用桌面。 然後，系統會在背景中定期套用（重新整理）組策略。
- 時間點
  - 系統會在背景中定期(預設:每隔 90 分鐘/1回) 進行套用/重新整理GPO
    - 在重新整理期間，原則設定會以異步方式套用
  - 且非所有組策略延伸模組或個別腳本都會在背景重新整理期間處理
    | 組策略 | 處理時機 |
    |:--------------:|:------------------------------------------------:|
    | 資料夾重新導向 | 僅在使用者登入時處理 |
    | 軟體安裝原則 | 僅在開機或登入時處理 |
    | 指令碼 | 雖會背景處理，但通常只在登入/登出或開/關機時執行 |

## 不同對像的複寫

1. 電腦： 自動重新整理時間 (Client Refresh Interval)
   - 預設背景更新頻率：在電腦啟動或使用者登入（前景處理）之後，系統會在背景定期套用原則
     - 對於一般的電腦與使用者，預設重新整理間隔為 90 分鐘
   - 隨機位移時間 (Random Offset)：為了避免大量電腦同時向網域控制站 (DC) 請求更新導致網路擁塞，系統會隨機加入 0 ～ 30 分鐘的位移時間
     - 因此，實際重新整理時間通常落在 90 至 120 分鐘之間
2. 伺服器：複寫時間 (Replication Latency)
   - GPO 的變更必須先複寫到各個網域控制站，客戶端才能取得最新設定
   - 複寫機制
     - Active Directory 複寫：控制原則狀態的同步
       - 在同一個站台 (Site) 內通常在 1 分鐘內完成
     - SYSVOL 資料夾複寫 (DFSR)：控制原則檔案（如指令碼）的同步
       - 在站台內每 15 分鐘複寫一次
     - 跨站台複寫：若 DC 位在不同站台，則取決於站台連結的排程
       - 其最低間隔通常也是 15 分鐘

## 修改原則

- 不要亂改預設的群組原則
  - "Default Domain Policy": 套用網域內的所有"電腦主機"
  - "Default Domain Control Policy": 套用網域內的所有"網域控制站"
- 優先使用 Security Filtering
- 修改前確認影響範圍(繼承、覆蓋與衝突) & OU
  - 套錯 OU 會完全無效
  - 電腦設定 ！= 使用者設定
- 建議保留變更紀錄，且變更前先想最壞影響
- 禁止
  - 『順手幫忙改一下』
  - 上班尖峰時間改 GPO

## 常用指令

- 手動更新主機上的GPO
  - 部分更新完成後，請重啟電腦使設定生效
    - 命令列(cmd)
    ```powershell
    gpupdate /force
    ```

    - PowerShell
    ```
     Invoke-GPUpdate
    ```

## REF

### MS Learn

- [組策略處理](https://learn.microsoft.com/zh-tw/windows-server/identity/ad-ds/manage/group-policy/group-policy-processing)
- [Windows Server 的組策略概觀](https://learn.microsoft.com/zh-tw/windows-server/identity/ad-ds/manage/group-policy/group-policy-overview)

### 資安這條路：學習 Active Directory Security(2022 Ithome 鐵人曬)

- [AD Security - [Day11] 一起來學 AD 安全吧！： Group Policy & Group Policy Objects (GPO)(1)](https://ithelp.ithome.com.tw/articles/10299242)
- [AD Security - [Day12] 一起來學 AD 安全吧！： Group 網域群組帳戶、群組類型、群組使用領域](https://ithelp.ithome.com.tw/articles/10299936)

### 國家資通安全研究院(NICS)

- [GCB數位教材-NICS](https://www.nics.nat.gov.tw/core_business/cybersecurity_defense/GCB/GCB_Digital_Materials/)
  - [108-108年GCB實作研習活動\_Windows Server 2016v1.0_1081111](https://download.nics.nat.gov.tw/api/v4/file-service/UploadFile/attachfilegcb/108%E5%B9%B4GCB%E5%AF%A6%E4%BD%9C%E7%A0%94%E7%BF%92%E6%B4%BB%E5%8B%95_Windows%20GCB%E9%83%A8%E7%BD%B2%E8%AA%AA%E6%98%8E%E8%88%87%E5%AF%A6%E4%BD%9C%E7%B7%B4%E7%BF%92v1.0_1081111.pdf)
  - [107年GCB實作研習活動\_Windows 10派送說明v1.0_1071116](https://download.nics.nat.gov.tw/api/v4/file-service/UploadFile/attachfilegcb/107%E5%B9%B4GCB%E5%AF%A6%E4%BD%9C%E7%A0%94%E7%BF%92%E6%B4%BB%E5%8B%95_Windows%2010%E6%B4%BE%E9%80%81%E8%AA%AA%E6%98%8Ev1.0_1071116.pdf)
  - [112年GCB實作文件\_Windows Server 2022v1.0_1130702](https://download.nics.nat.gov.tw/api/v4/file-service/UploadFile/attachfilegcb/112%E5%B9%B4GCB%E5%AF%A6%E4%BD%9C%E6%96%87%E4%BB%B6_Windows%20Server%202022v1.0_1130702.pdf)

### Other

- [群組原則-維基百科](https://zh.wikipedia.org/zh-tw/%E7%BB%84%E7%AD%96%E7%95%A5)
