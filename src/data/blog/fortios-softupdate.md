---
title: Fortigate-手動離線更新 FortiOS 上的類別項目
pubDatetime: 2026-05-31 09:16:45
tags:
  - "Fortigate"
  - "Fortios"
description: "更新的主要目的，是讓 Fortigate 能持續辨識最新的攻擊手法、惡意程式、應用程式類型與網路服務"
---

## 前提

- 更新的主要目的，是讓 Fortigate 能持續辨識最新的攻擊手法、惡意程式、應用程式類型與網路服務。

## 環境
- Fortios: 6.2.17
  * 測試機器
    * FG-50E
    * FWF-50E-2R
    * FG-140D-POE

## 注意部分
- 在 Fortios 7.4.3 後，會開始限制授權合約無效（ex: 未註冊 & 過期）的機器限制手動升級至最新版本
  * 相關控制模組： "System contracts" => "Firmware & General Updates (FMWR)"
- 檢查現行合約授權情況: `diagnose test update info contract`
  ```
  System contracts:
    HDWR,Thu Apr 17 08:00:00 2025
    ENHN,Thu Apr 17 08:00:00 2025
    COMP,Thu Apr 17 08:00:00 2025
    FMWR,Thu Apr 17 08:00:00 2025
    FURL,Wed Jun 11 08:00:00 2025
    SPAM,Wed Jun 11 08:00:00 2025
    SPRT,Thu Apr 17 08:00:00 2025
    FRVS,Thu Apr 17 08:00:00 2025

    APDB,Thu Apr 17 08:00:00 2025
    CIDB,Thu Apr 17 08:00:00 2025
    UWDB,Thu Apr 17 08:00:00 2025
    MCDB,Wed Jun 11 08:00:00 2025
  ```

## 每個更新檔的功能
### Fortios 系統
- 設備韌體映像(`FWF_...out`)
  * 更新後,會更新的相關核心模組
      *  系統的 Kernel
      *  IPS engine
      *  AV engine

### IPS
- APDB (`apdb_OSXXX.APDB.pkg`)
  * 更新的安全特徵碼/資料庫部分
      * Application Control database
  * 用於
      * 幫助設備判斷流量來源與應用類型
      * 辨識
          * 應用程式（Application Control）
          * 裝置和系統類型（device & OS detection）
- ISDB (`isdb_OS???.pkg`)
  * 更新的安全特徵碼/資料庫部分
      * Internet Service Database
      * 工業安全攻擊定義
  * 用於 
      * 將特定的 IP/ASN/CIDR 範圍對應成網際網路服務（`internet-service`）名稱
      * 同時方便讓政策規則,能直接套用在已知雲端服務或網路服務上
- NIDS (`nids_OSXXX.NIDS.pkg`)
  * 更新的安全特徵碼/資料庫部分
      * Attack Definition
      * IPS / NIDS 簽名資料庫
  * 用於
      * 偵測辨識已知特徵
          * 入侵行為
          * 漏洞利用
          * 網路攻擊
- IRIS (`IRISUpdate-OSXXX-fgt.pkg`)
  * 更新的安全特徵碼/資料庫部分
      * Botnet IP database
  * 用於
      * 提供已知惡意 Botnet 來源 IP 的資料
      * 幫助設備攔截與辨識殭屍網路相關流量

### AV(AntiVirus,防毒特徵碼)
- ETDB (`vsigupdate-OSXXX.ETDB.High.pkg`)
  * 更新的安全特徵碼/資料庫部分
      * Emerging Threat DB
  * 快速更新的高優先威脅簽名（Emerging Threats / ET signatures）
  * 主要補強新出現的攻擊或高風險事件的偵測能力
- MMDB(`vsigupdate-OSXXX.MMDB.pkg`) 
  * 針對移動端的惡意程式與威脅資料庫
  * 更新的安全特徵碼/資料庫部分
      * malware
      * reputation
      * intelligence DB
  * 用於
      * malware 偵測
      * IP/domain reputation

### other-objects（其它類型）
- FFDB (`ffdb_OS???.pkg`)
  * 更新的安全特徵碼/資料庫部分
      * Internet Service Definition
      * FortiGuard Web Filter: Web URL 分類資料庫

## 主要相關指令: `execute restore` 
- 支援
  * 可還原項目
      * av：還原 AntiVirus database（avdb.pkg）
      * config：還原整個 device config（backup.conf）
      * image：還原/更新 FortiOS firmware 映像檔
      * ips：還原 IPS signatures（nids.pkg）
      * ipsuserdefsig：匯入自訂的 IPS signature
      * other-objects：還原其他物件（objects）
      * script：匯入 CLI automation script
      * secondary-image：寫入 secondary firmware slot（便於 rollback）
    ```
    Nekolab_FG-50E # execute restore 
    av                 av
    config             config
    image              image
    ips                ips
    ipsuserdefsig      ipsuserdefsig
    other-objects      other-objects
    script             script
    secondary-image    secondary-image
    ```
  * 更新方式
      * tftp
      * ftp
    ```
    Nekolab_FG-50E # execute restore ips 
    ftp     Restore IPS database from FTP server.
    tftp    Restore IPS database from TFTP server.
    ```
- 手動更新範例
  * IPS: `execute restore ips tftp nids_OS6.2.0_35.00180.NIDS.pkg <tftp-server-ip>`
  * AV: `execute restore av tftp avdb.pkg <tftp-server-ip>`
  * Fortios image: `execute restore image tftp FWF_50E_2R-v6-build1405-FORTINET.out <tftp-server-ip>`

## 更新類別顯示圖標
- 當你更新完 IPS & APDB 類別的特徵庫後,界面上 App 類別圖標顯示不對時
  * 可自行手動去向 Fortiguard 下戴，己修正後的 CSS & png
  * 不需相關授權，即可正常進行更新

```
Nekolab_FG-50E # diagnose fortiguard-resource update sprite-map.png
Deleted cached resource files
Downloading...
Successfully downloaded sprite-map.png
Size:   2785193 bytes
ETag:   "69bf3144-2a7fa9"
MD5:    cc099f7d38ebb5db2460aa7f5d8c8f9c

Nekolab_FG-50E # diagnose fortiguard-resource update sprite-map.css
Deleted cached resource files
Downloading...
Successfully downloaded sprite-map.css
Size:   568837 bytes
ETag:   "69bf3144-8adfb"
MD5:    2fa459bc67c2a03fc101d63aeb0752ba

Nekolab_FG-50E # diagnose fortiguard-resource update sprite-isdb.png
Deleted cached resource files
Downloading...
Successfully downloaded sprite-isdb.png
Size:   363839 bytes
ETag:   "69bf314d-58d3f"
MD5:    7c1b45f9ca182499d1427096d52668aa

Nekolab_FG-50E # diagnose fortiguard-resource update sprite-isdb.css
Deleted cached resource files
Downloading...
Successfully downloaded sprite-isdb.css
Size:   23818 bytes
ETag:   "69bf314d-5d00"
MD5:    f3d55bcbda1e48ea6bbcfa1cd0601eb3
```

## 檢查現行機器的版本
- GUI
  * FortiOS: "系統管理" > "韌體管理"
  * 特徵庫: "系統管理" > "FortiGuard"
- CLI
  ```
  Nekolab_FG-50E # diagnose autoupdate versions

    AV Engine
    ---------
    Version: 6.00165
    Contract Expiry Date: n/a
    Last Updated using manual update on Fri Oct 15 17:05:00 2021
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    Virus Definitions
    ---------
    Version: 93.06779
    Contract Expiry Date: n/a
    Last Updated using manual update on Sat Mar 21 10:25:23 2026
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    Extended set
    ---------
    Version: 93.06779
    Contract Expiry Date: n/a
    Last Updated using manual update on Sat Mar 21 10:25:23 2026
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    Mobile Malware Definitions
    ---------
    Version: 93.06779
    Contract Expiry Date: n/a
    Last Updated using manual update on Sat Mar 21 10:27:04 2026
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    IPS Attack Engine
    ---------
    Version: 5.00280
    Contract Expiry Date: n/a
    Last Updated using manual update on Thu Feb  9 19:15:00 2023
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    IPS Config Script
    ---------
    Version: 1.00009
    Contract Expiry Date: n/a
    Last Updated using manual update on Thu Jun  6 14:02:00 2019
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    Attack Definitions
    ---------
    Version: 35.00180
    Contract Expiry Date: n/a
    Last Updated using manual update on Sat Mar 21 10:28:53 2026
    Last Update Attempt: n/a
    Result: Updates Installed

    Attack Extended Definitions
    ---------
    Version: 35.00180
    Contract Expiry Date: n/a
    Last Updated using manual update on Sat Mar 21 10:28:53 2026
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    Application Definitions
    ---------
    Version: 35.00179
    Contract Expiry Date: Wed Apr 16 2025
    Last Updated using manual update on Sat Mar 21 10:30:16 2026
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    Industrial Attack Definitions
    ---------
    Version: 35.00179
    Contract Expiry Date: n/a
    Last Updated using manual update on Sat Mar 21 10:31:03 2026
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    Botnet Definitions
    ---------
    Version: 4.00998
    Contract Expiry Date: n/a
    Last Updated using manual update on Sat Mar 21 10:58:26 2026
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    Botnet Domain Database
    ---------
    Version: 3.00737
    Contract Expiry Date: n/a
    Last Updated using manual update on Tue Apr 16 16:02:00 2024
    Last Update Attempt: n/a
    Result: Updates Installed

    Internet-service Database Apps
    ---------
    Version: 7.04414
    Contract Expiry Date: n/a
    Last Updated using manual update on Sat Mar 21 11:06:45 2026
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    Internet-service Mini Database Maps
    ---------
    Version: 7.04414
    Contract Expiry Date: n/a
    Last Updated using manual update on Sat Mar 21 11:06:45 2026
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    Device and OS Identification
    ---------
    Version: 1.00093
    Contract Expiry Date: Wed Apr 16 2025
    Last Updated using manual update on Fri May 23 16:54:00 2025
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    URL White list
    ---------
    Version: 4.00237
    Contract Expiry Date: Wed Apr 16 2025
    Last Updated using manual update on Mon May 27 08:05:00 2024
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    IP Geography DB
    ---------
    Version: 2.00027
    Contract Expiry Date: n/a
    Last Updated using manual update on Tue Nov  6 06:44:00 2018
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    Certificate Bundle
    ---------
    Version: 1.00056
    Contract Expiry Date: n/a
    Last Updated using manual update on Tue Feb 25 15:00:00 2025
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    Malicious Certificate DB
    ---------
    Version: 0.00000
    Contract Expiry Date: Tue Jun 10 2025
    Last Updated using manual update on Mon Jan  1 00:00:00 2001
    Last Update Attempt: Sun Mar 22 14:29:10 2026
    Result: Unauthorized

    Modem List
    ---------
    Version: 0.000

    FDS Address
    ---------
    209.40.106.61:443
  ```

## 升級時的除錯方式
- 允許降級刷機
   ```
    Nekolab_FG-50E # diagnose autoupdate downgrade enable
    Update downgrade enabled
   ```

## REF

### Fortinet 官方 & 代理

- [FortiGate-手動更新防護特徵碼](https://andyitsite.blog/%E6%89%8B%E5%8B%95%E6%9B%B4%E6%96%B0fortigate%E9%98%B2%E8%AD%B7%E7%89%B9%E5%BE%B5%E7%A2%BC/)
- [Technical Tip: Cannot upload the IPS database manually from the GUI without internet connection to FortiGate-Fortinet Community](https://community.fortinet.com/t5/FortiGate/Technical-Tip-Cannot-upload-the-IPS-database-manually-from-the/ta-p/198603)
- [过期 License 升级限制](https://handbook.fortinet.com.cn/system_mgmt/firmware_and_config/firmware_version/firmware_license#%E5%8D%87%E7%BA%A7%E6%9D%83%E9%99%90%E7%A4%BA%E4%BE%8B)


### Other

- [Fortinet 裝置特徵碼與韌體更新指南-Clarence 的科技學習實戰筆記](https://blog.clarence.tw/2023/12/03/fortinet-%E8%A3%9D%E7%BD%AE%E7%89%B9%E5%BE%B5%E7%A2%BC%E8%88%87%E9%9F%8C%E9%AB%94%E6%9B%B4%E6%96%B0%E6%8C%87%E5%8D%97/)
- [Manual update – Fortigate Pattern CLI](https://bob.tw/manual-update-fortigate-pattern-cli/)
- [Fortigate 手记-lxnchan.cn](https://lxnchan.cn/fortigate-notes.html)
