---
title: Arch-在Arch Linux安裝MS SQL Server
pubDatetime: 2023-09-10 07:12:20
tags:
  - "ArchLinux"
description: ""
---

## 00 緒論

網路上的相關的安裝設置大部分以Deb/RPM系的發行版居多，則自己就寫了一個Arch的教學文件。。。

<!--more-->

## 01 前置

### 1-1 安裝相関環境

- AUR:
  - `mssql-server`: https://aur.archlinux.org/packages/mssql-server
  - `mssql-tools`: https://aur.archlinux.org/packages/mssql-tools
- 使用yay進行安裝: `$ yay -S mssql-server mssql-tools`

### 1-2 防火牆

- firewalld
  ```
  $ sudo firewall-cmd --add-service=mssql --permanent
  $ sudo firewall-cmd --reload
  ```

## 02 環境

- 進入設置: `$ sudo /opt/mssql/bin/mssql-conf setup`
- 正式開始設置

  1. 選擇 SQL Server 的版本

  ```
    請選擇 SQL Server 的版本:
    1) Evaluation (免費，不具生產使用權限，使用期限 180 天)
    2) Developer (免費，不具生產使用權限)
    3) Express (免費)
    4) Web (付費)
    5) Standard (付費)
    6) Enterprise (付費) - 限制為 20 個實體核心/40 個超執行緒核心的 CPU 核心使用率
    7) Enterprise Core (付費) - 高達作業系統上限的 CPU 核心使用率
    8) 我從零售銷售管道購買了授權，可以輸入產品金鑰。
    如需各版本的詳細資料，請前往https://go.microsoft.com/fwlink/?LinkId=2109348&clcid=0x404

    使用此軟體的付費版本需要Microsoft 大量授權方案的獨立授權。選擇付費版本表示您確認您具備適當的授權數，可以安裝及執行此軟體。
    請輸入您的版本(1-8): 2
    您可於以下連結中/usr/share/doc/mssql-server 找到或下載授權條款:
     https://go.microsoft.com/fwlink/?LinkId=2104294&clcid=0x404

    隱私權聲明的檢視位置:
    https://go.microsoft.com/fwlink/?LinkId=853010&clcid=0x404

    您接受授權條款嗎? [Yes/No]:yes
  ```

  2. 語言

  ```
  選擇 SQL Server 的語言:
  (1) English
  (2) Deutsch
  (3) Español
  (4) Français
  (5) Italiano
  (6) 日本語
  (7) 한국어
  (8) Português
  (9) Руѝѝкий
  (10) 中文 – 简体
  (11) 中文 （繝体）
  輸入選項 1-11: 11
  ```

  3. 系統管理員密碼

  ```
  輸入 SQL Server 系統管理員密碼:
  確認 SQL Server 系統管理員密碼:
  ```

  4. 開始設置

  ```
    正在設定 SQL Server...

    ForceFlush is enabled for this instance.
    ForceFlush feature is enabled for log durability.
    DBSTARTUP (msdb, 4): FCBOpenTime took 131 ms
    DBSTARTUP (msdb, 4): FCBHeaderReadTime took 169 ms
    DBSTARTUP (msdb, 4): FileMgrPreRecoveryTime took 362 ms
    DBSTARTUP (msdb, 4): SysFiles1ScanTime took 142 ms
    DBSTARTUP (msdb, 4): LogMgrPreRecoveryTime took 158 ms
    DBSTARTUP (msdb, 4): FileMgrPostRedoTime took 154 ms
    DBSTARTUP (msdb, 4): PhysicalCompletionTime took 491 ms
    DBSTARTUP (msdb, 4): RecoveryCompletionTime took 226 ms
    DBSTARTUP (msdb, 4): UpgradeTime took 9307 ms
    DBSTARTUP (msdb, 4): StartupInDatabaseTime took 9540 ms
    DBSTARTUP (msdb, 4): RemapSysfiles1Time took 181 ms
    Created symlink /etc/systemd/system/multi-user.target.wants/mssql-server.service → /usr/lib/systemd/system/mssql-server.service.
    安裝程式已成功完成。SQL Server 現在正在啟動中。
  ```

## 03 服務使用方式

### 3-1 啟用

- Systemd: `$ sudo systemctl enable --now mssql-server`

### 3-2 CLI Login

- Login(NO SSL Login): `$ sqlcmd -S localhost -U sa -P '[Your_Password]' -C`
- 檢視安裝版本
  - 指令
    ```sql
    1> SELECT @@VERSION
    2> GO
    ```
  - 輸出結果
    ```
     Microsoft SQL Server 2019 (RTM-CU17) (KB5016394) - 15.0.4249.2 (X64)
     Jul 22 2022 12:11:33
     Copyright (C) 2019 Microsoft Corporation
     Developer Edition (64-bit) on Linux (Arch Linux) <X64>
    (1 rows affected)
    ```

## 04 資料庫的位置

- 資料庫檔案: `/var/opt/mssql/`

## REF

- https://www.sunzhongwei.com/diff-between-the-sql-server-2017-developer-version-and-express-edition
- https://learn.microsoft.com/zh-tw/sql/sql-server/editions-and-components-of-sql-server-2019?view=sql-server-ver16
- https://www.mssqltips.com/sqlservertip/4622/installing-sql-server-tools-to-make-a-database-connection-from-redhat-linux-server/
- https://learn.microsoft.com/zh-tw/sql/linux/sql-server-linux-setup?view=sql-server-ver16
