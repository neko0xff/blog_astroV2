---
title: Windows-AD網域上的使用者與群組
pubDatetime: 2025-12-27 10:58:51
tags:
  - "Windows"
  - "使用者"
  - "群組"
  - "Active Directory"
description: "Windows AD網域上的使用者與群組的基本概念與使用方法，包括帳戶管理、權限控制與安全性設定"
---

## Active Directory 的本質
- Active Directory(AD) 不只是 ”單一” 的帳號清單，而是 “身分識別和存取權管理 (Identity and access management,IAM) ” 中心
  * 擔任第一層的身分安全驗證伺服器
- 管理的核心內容（釐清並定義）
    1. 誰是誰(身分識別): 可以識別、認證和授權允許使用網域內資源的使用者個人
    2. 能做什麼(權限授權): 識別和授權該使用者，所能使用的資源 (ex: 硬體和應用程式) 範圍
- 一旦發生 AD 的架構設計錯誤
  * 其影響可能持續 5 ~ 10 年（長期）
  * 因此在初始設計時需極為慎重（所有設定皆為全網域等級影響）

<!--more-->

## 管理
- 帳號
  * 一人一帳號，禁止共用： 嚴禁多位管理員或使用者共用同一個帳號，以確保稽核時的不可否認性
  * 命名需一致，以便於識別與管理（ex: "名字.姓名"）
  * 落實密碼策略控管
- 職能分離：應將管理員&服務專用帳號與日常一般帳號分離
  * 禁止使用 "真人" (使用者個人) 帳號跑服務
      * 管理員平時應使用一般帳號處理一般事務，僅在執行管理工作時才切換至管理帳號
- 對於"離職人員"的帳號
  * 應採取 **「停用而非刪除」** 的策略,以保留相關檔案權限與歷史紀錄的完整性
      * 停用流程
        1. 先設定該人員的帳號到期日為今天過期
        2. 設定完成後，再對該人員的帳戶進行停用
        3. 停用完成後，帳戶直接移至相對 OU (ex: 離職人員)

## 群組與權限觀念
- 以 ”群組” 為中心的權限模型
  * 範圍：人 → 群組 → 權限
  * 分類管理：明確區分「使用者群組」、「權限群組」與「管理群組」之範疇
- 權限永遠給 “群組” ，不直接給 “人”
  * 管理時
      * 應將”人員”加入對應”群組”
      * 再由”群組”承接”權限”
- 遵循最小權限原則（Least Privilege）
  * 管理服務帳號時，應釐清其「能做什麼」
  * 僅授予執行該服務所需的最低必要權限
  * 若環境允許，應考慮優先使用 gMSA (受管理的服務帳號)

## 組織單位(OU)設計核心觀念
- OU 是管理邊界，而非單純的檔案分類資料夾
- 設計時應以套用群組原則 (GPO) 與權限委派 (Delegation) 為主要導向
    - 不建議完全依公司組織圖設計
    - 避免過深的巢狀結構（建議 2–4 層）

## 網域管理中權力最高的群組
- 在 Active Directory (AD) 架構中，Domain Admins (網域管理員，簡稱 DA) 是網域內三個權限最高的核心群組之一（另外兩個為 Enterprise Admins 和 Administrators）
  *  群組性質：它是一個位於網域「使用者 (Users)」容器中的全域安全群組
      *  DA 在其所屬的網域內被視為「全能強大」(繼承了許多敏感的用戶權利)
          *  幾乎可以在 AD 及所有已加入網域的系統上執行任何動作
                *  只要相關群組的帳號遭竊取，則會對網域整個樹系造成毀滅性影響（是勒索病毒的第一目標）
          *  包括但不限於
                * 取得檔案或其他物件的擁有權
                * 備份與還原檔案及目錄
                * 變更系統時間與時區
                * 讓電腦與使用者帳戶受信賴以進行委派
  *  管理規範
      *  嚴格限制成員：嚴禁將所有人（或過多的人）加入 DA 群組，唯一的預設成員應僅為該網域的內建系統管理員帳戶
      *  職能分離：管理員應將管理專用帳號與日常一般帳號分離
      *  登入限制：DA 帳號不可用於日常登入一般電腦，以防止其憑證在一般工作站上被側錄或竊取
      *  最小權限原則：禁止濫用 Domain Admin，且只有在「重大」或「緊急」案例中才需要使用 DA 成員資格

## 總結
- 嚴禁高風險行為
  * 禁止濫用或把所有人加入 Domain Admin
  * 用真人帳號跑服務
  * 網域控制站用快照回復
- AD 不是 “試試看” 的系統
  * 能不動就不要亂動
  * 要動一定要知道影響範圍

## REF
### 國家資通安全研究院(NICS)
- [GCB數位教材-NICS](https://www.nics.nat.gov.tw/core_business/cybersecurity_defense/GCB/GCB_Digital_Materials/)
    * [108-108年GCB實作研習活動_Windows Server 2016v1.0_1081111](https://download.nics.nat.gov.tw/api/v4/file-service/UploadFile/attachfilegcb/108%E5%B9%B4GCB%E5%AF%A6%E4%BD%9C%E7%A0%94%E7%BF%92%E6%B4%BB%E5%8B%95_Windows%20GCB%E9%83%A8%E7%BD%B2%E8%AA%AA%E6%98%8E%E8%88%87%E5%AF%A6%E4%BD%9C%E7%B7%B4%E7%BF%92v1.0_1081111.pdf)
    * [107年GCB實作研習活動_Windows 10派送說明v1.0_1071116](https://download.nics.nat.gov.tw/api/v4/file-service/UploadFile/attachfilegcb/107%E5%B9%B4GCB%E5%AF%A6%E4%BD%9C%E7%A0%94%E7%BF%92%E6%B4%BB%E5%8B%95_Windows%2010%E6%B4%BE%E9%80%81%E8%AA%AA%E6%98%8Ev1.0_1071116.pdf)
    * [112年GCB實作文件_Windows Server 2022v1.0_1130702](https://download.nics.nat.gov.tw/api/v4/file-service/UploadFile/attachfilegcb/112%E5%B9%B4GCB%E5%AF%A6%E4%BD%9C%E6%96%87%E4%BB%B6_Windows%20Server%202022v1.0_1130702.pdf)
### Microsoft Learn
- [Windows 的組策略處理](https://learn.microsoft.com/zh-tw/windows-server/identity/ad-ds/manage/group-policy/group-policy-processing)