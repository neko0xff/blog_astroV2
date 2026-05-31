---
title: Windows-AD網域上的五大角色
pubDatetime: 2026-05-24 13:31:51
tags:
  - "Windows"
  - "FSMO"
  - "Active Directory"
description: "彈性單一主機操作（FSMO，Flexible single master operation）,主要是指AD上的五大不同功能的操作主機服務，且這五大角色算AD上不可缺一的服務功能。"
---

## 何為 FSMO

彈性單一主機操作（FSMO，Flexible single master operation）,主要是指AD上的五大不同功能的操作主機服務，且這五大角色算AD上不可缺一的服務功能。

<!--more-->

### 負責整個網域樹系層次

- 架構 (schema master)
  - 負責處理 Active Directory 上，目錄架構設計上的所有更新與修改
  - 相關權限群組: Schema Admins
- 網域命名 (domain name master)
  - 主要負責樹系中網域的新增或刪除時的變更控管
  - 同時儲存整個目錄樹狀結構的資訊
  - 相關權限群組: Enterprise Admins

### 網域層次

- 相對識別主節點管理(relative identifier master,RID)
  - 在網域中建立物件時(例如:使用者帳戶、群組),需要藉由這個角色來負責配置所謂的唯一安全識別碼(SID,Security ID)
  - SID 主要由兩組資訊所組合
    1. 網域 SID
    2. 建立在網城中的每個安全性主體 SID 的唯一相對ID(RID)所組成
  - 相關權限群組: Domain Admins
- 基礎結構(infrastructure master)
  - 擁有多個網域的樹系架構中,如果網域中的群組成員有來自非本身網域的物件,則這部份的資訊維護便由基礎架構主機負責
  - 跨網域物件參照中，負責更新物件 SID 與辨別名稱，且同時保証物件的一致性
  - 相關權限群組: Domain Admins
- PDC模擬器(PDC emulator master)
  - 相關權限群組: Domain Admins
  - 會對執行舊版 （Windows 2000/NT 4.0前） 的工作站、成員伺服器和網域控制站通告自己是"主要"網域控制站
  - 同時兼網域中的主要的 NTP (時間同步) 伺服器
  - 是"修改群組原則(GPO)"的主要伺服器
    - 預設的狀態： 群組原則編輯器會連線到 PDC 模擬器主機,統一發佈群組原則物件的設定
  - 對於使用者密碼的變更與帳戶的鎖定,也都是由此角色負責

## 在 Windows Server 網域控制站上，負責管理五大角色的相關工具

1. Active Directory 使用者和電腦 (Active Directory Users and Computers)
   - 管理角色部分
     - RID 集區管理員
     - PDC
     - 基礎結構
2. Active Directory 網域及信任 (Active Directory Domains and Trusts)
   - 管理角色部分
     - 網域命名操作主機
3. Active Directory 架構 管理單元
   - 位置： MMC主控台
   - 管理角色部分
     - 架構主機

## 檢查重要的核心服務是否啟用(需要管理者權限)

- AD DS(`ntds`): 主要的核心服務

  ```
  C:\Users\neko_admin>sc query ntds

    SERVICE_NAME: ntds
            TYPE               : 20  WIN32_SHARE_PROCESS
            STATE              : 4  RUNNING
                                    (STOPPABLE, NOT_PAUSABLE, ACCEPTS_SHUTDOWN)
            WIN32_EXIT_CODE    : 0  (0x0)
            SERVICE_EXIT_CODE  : 0  (0x0)
            CHECKPOINT         : 0x0
            WAIT_HINT          : 0x0
  ```

- Netlogon(`netlogon`): 網域登入、信任關係與部分 DC 對外通訊

  ```
  C:\Users\neko_admin>sc query netlogon

   SERVICE_NAME: netlogon
           TYPE               : 20  WIN32_SHARE_PROCESS
           STATE              : 4  RUNNING
                                   (STOPPABLE, PAUSABLE, IGNORES_SHUTDOWN)
           WIN32_EXIT_CODE    : 0  (0x0)
           SERVICE_EXIT_CODE  : 0  (0x0)
           CHECKPOINT         : 0x0
           WAIT_HINT          : 0x0
  ```

- 診斷網域控制站上的 DNS & NTP & LDAP 服務狀態

  ```
  C:\Users\neko_admin>dcdiag /v

    目錄伺服器診斷

    正在執行初始安裝程式:
       嘗試尋找主伺服器...
       * 確認本機電腦 WIN-ML8SV4QSBOG 是目錄伺服器。
       主伺服器 = WIN-ML8SV4QSBOG
       * 正在連線到伺服器 WIN-ML8SV4QSBOG 上的目錄服務。
       * 識別的 AD 樹系。
       Collecting AD specific global data
       * 正在收集站台資訊。
       Calling ldap_search_init_page(hld,CN=Sites,CN=Configuration,DC=nekolab,DC=local,LDAP_SCOPE_SUBTREE,(objectCategory=ntDSSiteSettings),.......
       The previous call succeeded
       Iterating through the sites
       Looking at base site object: CN=NTDS Site Settings,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=nekolab,DC=local
       Getting ISTG and options for the site
       * 正在識別所有伺服器。
       Calling ldap_search_init_page(hld,CN=Sites,CN=Configuration,DC=nekolab,DC=local,LDAP_SCOPE_SUBTREE,(objectClass=ntDSDsa),.......
       The previous call succeeded....
       The previous call succeeded
       Iterating through the list of servers
       Getting information for the server CN=NTDS Settings,CN=WIN-ML8SV4QSBOG,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=nekolab,DC=local
       objectGuid obtained
       InvocationID obtained
       dnsHostname obtained
       site info obtained
       All the info for the server collected
       * 正在識別所有 NC 交互參照。
       * 找到 1 個 DC。正在測試其中的 1。
       已完成收集初始資訊。

    正在執行初始的必要測試

       正在測試伺服器: Default-First-Site-Name\WIN-ML8SV4QSBOG
          正在啟動測試: Connectivity
             * Active Directory LDAP Services Check
             Determining IP4 connectivity
             * Active Directory RPC Services Check
             ......................... WIN-ML8SV4QSBOG 通過測試 Connectivity

    正在執行主要測試

       正在測試伺服器: Default-First-Site-Name\WIN-ML8SV4QSBOG
          正在啟動測試: Advertising
             The DC WIN-ML8SV4QSBOG is advertising itself as a DC and having a DS.
             The DC WIN-ML8SV4QSBOG is advertising as an LDAP server
             The DC WIN-ML8SV4QSBOG is advertising as having a writeable directory
             The DC WIN-ML8SV4QSBOG is advertising as a Key Distribution Center
             The DC WIN-ML8SV4QSBOG is advertising as a time server
             The DS WIN-ML8SV4QSBOG is advertising as a GC.
             ......................... WIN-ML8SV4QSBOG 通過測試 Advertising
          使用者要求略過的測試: CheckSecurityError
          使用者要求略過的測試: CutoffServers
          正在啟動測試: FrsEvent
             * 檔案複寫服務事件記錄檔測試
             因為伺服器執行的是 DFSR，所以略過測試。
             ......................... WIN-ML8SV4QSBOG 通過測試 FrsEvent
          正在啟動測試: DFSREvent
             The DFS Replication Event Log.
             在 SYSVOL 開始共用的最近 24 小時之內，發生警告或錯誤事件。 SYSVOL 複寫失敗的問題，可能導致群組原則問題。
             發生警告事件。EventID: 0x800008A4
                產生時間: 05/23/2026   09:09:31
                事件字串:
                DFS 複寫服務在磁碟區 C: 上偵測到意外 的關機。如果服務異常終止 (例如，由於電源 中斷) 或磁碟區發生錯誤，就會發生此情形。 服務已自動初始復原程序。如果服務判定無法 可靠地復原資料庫，將會重建資料庫。不需要 使用者採取任何動作。

                其他資訊:
                磁碟區: C:
                GUID: 0C17CB4E-37D0-4F62-B863-C0F1F104B591
             ......................... WIN-ML8SV4QSBOG 通過測試 DFSREvent
          正在啟動測試: SysVolCheck
             * 檔案複寫服務 SYSVOL 準備測試
             檔案複寫服務的 SYSVOL 已經就緒
             ......................... WIN-ML8SV4QSBOG 通過測試 SysVolCheck
          正在啟動測試: KccEvent
             * The KCC Event log test
             Found no KCC errors in "Directory Service" Event log in the last 15 minutes.
             ......................... WIN-ML8SV4QSBOG 通過測試 KccEvent
          正在啟動測試: KnowsOfRoleHolders
             Role Schema Owner = CN=NTDS Settings,CN=WIN-ML8SV4QSBOG,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=nekolab,DC=local
             Role Domain Owner = CN=NTDS Settings,CN=WIN-ML8SV4QSBOG,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=nekolab,DC=local
             Role PDC Owner = CN=NTDS Settings,CN=WIN-ML8SV4QSBOG,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=nekolab,DC=local
             Role Rid Owner = CN=NTDS Settings,CN=WIN-ML8SV4QSBOG,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=nekolab,DC=local
             Role Infrastructure Update Owner = CN=NTDS Settings,CN=WIN-ML8SV4QSBOG,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=nekolab,DC=local
             ......................... WIN-ML8SV4QSBOG 通過測試 KnowsOfRoleHolders
          正在啟動測試: MachineAccount
             Checking machine account for DC WIN-ML8SV4QSBOG on DC WIN-ML8SV4QSBOG.
             * SPN found :LDAP/WIN-ML8SV4QSBOG.nekolab.local/nekolab.local
             * SPN found :LDAP/WIN-ML8SV4QSBOG.nekolab.local
             * SPN found :LDAP/WIN-ML8SV4QSBOG
             * SPN found :LDAP/WIN-ML8SV4QSBOG.nekolab.local/NEKOLAB
             * SPN found :LDAP/94168073-ce2b-42cc-a97f-fd67ef059ade._msdcs.nekolab.local
             * SPN found :E3514235-4B06-11D1-AB04-00C04FC2DCD2/94168073-ce2b-42cc-a97f-fd67ef059ade/nekolab.local
             * SPN found :HOST/WIN-ML8SV4QSBOG.nekolab.local/nekolab.local
             * SPN found :HOST/WIN-ML8SV4QSBOG.nekolab.local
             * SPN found :HOST/WIN-ML8SV4QSBOG
             * SPN found :HOST/WIN-ML8SV4QSBOG.nekolab.local/NEKOLAB
             * SPN found :GC/WIN-ML8SV4QSBOG.nekolab.local/nekolab.local
             ......................... WIN-ML8SV4QSBOG 通過測試 MachineAccount
          正在啟動測試: NCSecDesc
             * Security Permissions check for all NC's on DC WIN-ML8SV4QSBOG.
             * 安全性權限檢查
               DC=ForestDnsZones,DC=nekolab,DC=local
                (NDNC,Version 3)
             * 安全性權限檢查
               DC=DomainDnsZones,DC=nekolab,DC=local
                (NDNC,Version 3)
             * 安全性權限檢查
               CN=Schema,CN=Configuration,DC=nekolab,DC=local
                (Schema,Version 3)
             * 安全性權限檢查
               CN=Configuration,DC=nekolab,DC=local
                (Configuration,Version 3)
             * 安全性權限檢查
               DC=nekolab,DC=local
                (Domain,Version 3)
             ......................... WIN-ML8SV4QSBOG 通過測試 NCSecDesc
          正在啟動測試: NetLogons
             * Network Logons Privileges Check
             Verified share \\WIN-ML8SV4QSBOG\netlogon
             Verified share \\WIN-ML8SV4QSBOG\sysvol
             ......................... WIN-ML8SV4QSBOG 通過測試 NetLogons
          正在啟動測試: ObjectsReplicated
             WIN-ML8SV4QSBOG is in domain DC=nekolab,DC=local
             Checking for CN=WIN-ML8SV4QSBOG,OU=Domain Controllers,DC=nekolab,DC=local in domain DC=nekolab,DC=local on 1 servers
                Object is up-to-date on all servers.
             Checking for CN=NTDS Settings,CN=WIN-ML8SV4QSBOG,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=nekolab,DC=local in domain CN=Configuration,DC=nekolab,DC=local on 1 servers
                Object is up-to-date on all servers.
             ......................... WIN-ML8SV4QSBOG 通過測試 ObjectsReplicated
          使用者要求略過的測試: OutboundSecureChannels
          正在啟動測試: Replications
             * Replications Check
             * Replication Latency Check
             ......................... WIN-ML8SV4QSBOG 通過測試 Replications
          正在啟動測試: RidManager
             * Available RID Pool for the Domain is 1601 to 1073741823
             * WIN-ML8SV4QSBOG.nekolab.local is the RID Master
             * DsBind with RID Master was successful
             * rIDAllocationPool is 1101 to 1600
             * rIDPreviousAllocationPool is 1101 to 1600
             * rIDNextRID: 1128
             ......................... WIN-ML8SV4QSBOG 通過測試 RidManager
          正在啟動測試: Services
             * Checking Service: EventSystem
             * Checking Service: RpcSs
             * Checking Service: NTDS
             * Checking Service: DnsCache
             * Checking Service: DFSR
             * Checking Service: IsmServ
             * Checking Service: kdc
             * Checking Service: SamSs
             * Checking Service: LanmanServer
             * Checking Service: LanmanWorkstation
             * Checking Service: w32time
             * Checking Service: NETLOGON
             ......................... WIN-ML8SV4QSBOG 通過測試 Services
          正在啟動測試: SystemLog
             * The System Event log test
             發生警告事件。EventID: 0x000003F6
                產生時間: 05/23/2026   09:08:53
                事件字串: 設定的 DNS 伺服器沒有回應後，名稱_ldap._tcp.dc._msdcs.nekolab.local.名稱解析逾時。用戶端 PID 1456.
             發生警告事件。EventID: 0x000727AA
                產生時間: 05/23/2026   09:09:12
                事件字串:
                WinRM 服務無法建立下列 SPN: WSMAN/WIN-ML8SV4QSBOG.nekolab.local; WSMAN/WIN-ML8SV4QSBOG。

                 其他資料
                 收到的錯誤為 1355: %%1355。

                 使用者動作
                 系統管理員可使用 setspn.exe 公用程式來建立 SPN。
             發生警告事件。EventID: 0x0000000C
                產生時間: 05/23/2026   09:09:31
                事件字串:
                時間提供者 NtpClient: 這台電腦被設定成使用網域階層來判定它的時間來源，但它是樹系根目錄的網域 AD PDC 模擬器，因此在網域階層中沒有在其上可用來做為時間來源的電腦。建議您最好在根目錄網域設定可靠的時間服務，或是手動設定 AD PDC，以便與外部的時間來源進行同步處理。否則，這台電腦將做為網域階層 中的系統授權時間來源。如果沒有設定外部的時間來源或外部時間來源沒有用在 這台電腦，您可以選擇停用 NtpClient。
             發生錯誤事件。EventID: 0xC0000007
                產生時間: 05/23/2026   09:09:33
                事件字串: 安全性帳戶管理員在處理一個 KDC 要求時發生意外失敗。錯誤位在資料欄中。帳戶名稱是 ，搜尋類型 0x108。
             發生警告事件。EventID: 0x80000434
                產生時間: 05/23/2026   09:10:42
                事件字串: 使用者 NEKOLAB\installer 針對上次意外關閉此電腦所提出的理由是: 其他 (不在計劃之中)
                 理由代碼: 0xa000000
                 問題識別碼:
                 檢查錯誤的字串:
                 註解:

             發生錯誤事件。EventID: 0x00000014
                產生時間: 05/23/2026   09:13:13
                事件字串: 安裝失敗: Windows 無法安裝下列更新，錯誤 0x80073D02: 9N0DX20HK701-Microsoft.WindowsTerminal。
             發生錯誤事件。EventID: 0x00000014
                產生時間: 05/23/2026   09:13:18
                事件字串: 安裝失敗: Windows 無法安裝下列更新，錯誤 0x80073D02: 9NBLGGH4NNS1-Microsoft.DesktopAppInstaller。
             發生錯誤事件。EventID: 0x00000709
                產生時間: 05/23/2026   09:14:00
                事件字串:
                安全開機憑證已更新，但尚未套用至裝置韌體。檢閱已發佈的指引以完成更新並確保完整保護。此裝置簽章資訊包含在此處。
                DeviceAttributes： BaseBoardManufacturer:Oracle Corporation;FirmwareManufacturer:innotek GmbH;FirmwareVersion:VirtualBox;OEMModelNumber:VirtualBox;OEMModelBaseBoard:VirtualBox;OEMModelSystemFamily:Virtual Machine;OEMManufacturerName:innotek GmbH;OEMModelSKU:;OSArchitecture:amd64;
                BucketId： 3d18f3d936113b0527c53aae6bd2aa89263a978345beb2b2db4869ced83c6d0a
                BucketConfidenceLevel： No Data Observed - Action Required
                UpdateType：
                如需詳細資訊，請參閱 https://go.microsoft.com/fwlink/?linkid=2301018.
             發生警告事件。EventID: 0x80001083
                產生時間: 05/23/2026   09:25:53
                事件字串:
                TCP/IP 無法建立傳出連線，因為選取的本機端點最近曾用來連線到相同的遠端端點。這個錯誤的發生時 機，通常是在傳出連線的開啟和關閉次數太頻繁，導致所有可用的本機連接埠都已用盡，並且迫使 TCP/IP 必須重複使用本機連接埠做為傳出連線。為將資料損毀的風險降到最低，TCP/IP 標準要求必須 經過一段最小時間週期之後，才能再從本機端點連線到遠端端點。
             ......................... WIN-ML8SV4QSBOG 未通過測試 SystemLog
          使用者要求略過的測試: Topology
          使用者要求略過的測試: VerifyEnterpriseReferences
          正在啟動測試: VerifyReferences
             系統物件參照 (serverReference) CN=WIN-ML8SV4QSBOG,OU=Domain Controllers,DC=nekolab,DC=local 與
             CN=WIN-ML8SV4QSBOG,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=nekolab,DC=local 的返回連結正確。
             系統物件參照 (serverReferenceBL)
             CN=WIN-ML8SV4QSBOG,CN=Topology,CN=Domain System Volume,CN=DFSR-GlobalSettings,CN=System,DC=nekolab,DC=local 與
             CN=NTDS Settings,CN=WIN-ML8SV4QSBOG,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=nekolab,DC=local 的返回連結正確。
             系統物件參照 (msDFSR-ComputerReferenceBL)
             CN=WIN-ML8SV4QSBOG,CN=Topology,CN=Domain System Volume,CN=DFSR-GlobalSettings,CN=System,DC=nekolab,DC=local 與
             CN=WIN-ML8SV4QSBOG,OU=Domain Controllers,DC=nekolab,DC=local 的返回連結正確。
             ......................... WIN-ML8SV4QSBOG 通過測試 VerifyReferences
          使用者要求略過的測試: VerifyReplicas

          使用者要求略過的測試: DNS
          使用者要求略過的測試: DNS

       正在執行分割測試的位置 : ForestDnsZones
          正在啟動測試: CheckSDRefDom
             ......................... ForestDnsZones 通過測試 CheckSDRefDom
          正在啟動測試: CrossRefValidation
             ......................... ForestDnsZones 通過測試 CrossRefValidation

       正在執行分割測試的位置 : DomainDnsZones
          正在啟動測試: CheckSDRefDom
             ......................... DomainDnsZones 通過測試 CheckSDRefDom
          正在啟動測試: CrossRefValidation
             ......................... DomainDnsZones 通過測試 CrossRefValidation

       正在執行分割測試的位置 : Schema
          正在啟動測試: CheckSDRefDom
             ......................... Schema 通過測試 CheckSDRefDom
          正在啟動測試: CrossRefValidation
             ......................... Schema 通過測試 CrossRefValidation

       正在執行分割測試的位置 : Configuration
          正在啟動測試: CheckSDRefDom
             ......................... Configuration 通過測試 CheckSDRefDom
          正在啟動測試: CrossRefValidation
             ......................... Configuration 通過測試 CrossRefValidation

       正在執行分割測試的位置 : nekolab
          正在啟動測試: CheckSDRefDom
             ......................... nekolab 通過測試 CheckSDRefDom
          正在啟動測試: CrossRefValidation
             ......................... nekolab 通過測試 CrossRefValidation

       正在執行企業測試的位置 : nekolab.local
          使用者要求略過的測試: DNS
          使用者要求略過的測試: DNS
          正在啟動測試: LocatorCheck
             GC 名稱: \\WIN-ML8SV4QSBOG.nekolab.local
             Locator Flags: 0xe007f3fd
             PDC Name: \\WIN-ML8SV4QSBOG.nekolab.local
             Locator Flags: 0xe007f3fd
             Time Server Name: \\WIN-ML8SV4QSBOG.nekolab.local
             Locator Flags: 0xe007f3fd
             Preferred Time Server Name: \\WIN-ML8SV4QSBOG.nekolab.local
             Locator Flags: 0xe007f3fd
             KDC Name: \\WIN-ML8SV4QSBOG.nekolab.local
             Locator Flags: 0xe007f3fd
             ......................... nekolab.local 通過測試 LocatorCheck
          正在啟動測試: Intersite
             跳過站台 Default-First-Site-Name，這個站台所在的領域，位在所提供之命令列引數提供的領域之外。
             ......................... nekolab.local 通過測試 Intersite
  ```

## 檢查服務

- 五大角色的目前所在位置
  - PowerShell

    ```
    PS C:\Users\neko_admin> Get-ADDomain | select PDCEmulator,RIDMaster,InfrastructureMaster | format-list


      PDCEmulator          : WIN-ML8SV4QSBOG.nekolab.local
      RIDMaster            : WIN-ML8SV4QSBOG.nekolab.local
      InfrastructureMaster : WIN-ML8SV4QSBOG.nekolab.local
    ```

  - CMD
    ```
    PS C:\Users\neko_admin> netdom query fsmo
      架構主機                    WIN-ML8SV4QSBOG.nekolab.local
      網域命名主機                WIN-ML8SV4QSBOG.nekolab.local
      PDC                         WIN-ML8SV4QSBOG.nekolab.local
      RID 集區管理員              WIN-ML8SV4QSBOG.nekolab.local
      基礎結構主機                WIN-ML8SV4QSBOG.nekolab.local
      命令已經成功完成。
    ```

- 網域相関資源（ex: 群組原則與登入腳本）位置

  ```
  C:\Users\neko_admin>net share
    共用名稱   資源                        說明

    -------------------------------------------------------------------------------
    C$           C:\                             預設共用
    IPC$                                         遠端 IPC
    ADMIN$       C:\WINDOWS                      遠端管理
    CertEnroll   C:\WINDOWS\system32\CertSrv\CertEnroll
                                                 Active Directory 憑證服務共用
    NETLOGON     C:\WINDOWS\SYSVOL\sysvol\nekolab.local\SCRIPTS
                                                 登入伺服器共用
    SYSVOL       C:\WINDOWS\SYSVOL\sysvol        登入伺服器共用
    命令已經成功完成。
  ```

- 多台網域控制站之間的復寫狀態

  ```
  C:\Users\neko_admin>repadmin /replsummary
    複寫摘要開始時間: 2026-05-23 09:33:16

    開始複寫摘要的資料收集，這將花費一些時間:
      ....


    來源 DSA          最大差異值    失敗/總計 %%   錯誤


    目的地 DSA     最大差異值    失敗/總計 %%   錯誤
  ```

## REF

### Microsoft Learn

- [Repadmin -replsummary](<https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc835092(v=ws.11)>)
- [Diagnose AD replication failures - Windows Server](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/diagnose-replication-failures)
- [診斷 Active Directory 複寫失敗 - Windows Server](https://learn.microsoft.com/zh-tw/troubleshoot/windows-server/active-directory/diagnose-replication-failures)
- [Transfer or seize Operation Master roles - Windows Server](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/transfer-or-seize-operation-master-roles-in-ad-ds)
- [AD Forest Recovery - Seizing an Operations Master Role](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/forest-recovery-guide/ad-forest-recovery-seizing-operation-master-role)

### Ithome

- [ad與fsmo關係](https://ithelp.ithome.com.tw/questions/10021618)

### Other

- [Active Directory Pro - How to Check FSMO Roles](https://activedirectorypro.com/how-to-check-fsmo-roles/)
- [MiniASP - How to Transfer Active Directory FSMO to Another Domain Controller](https://blog.miniasp.com/post/2012/07/16/How-to-transfer-Active-Directory-FSMO-to-another-Domain-Controller)
- [FSMO 五大角色轉移](https://www3.sips.ntpc.edu.tw/system/%e2%97%8efsmo%e4%ba%94%e5%a4%a7%e8%a7%92%e8%89%b2%e8%bd%89%e7%a7%bb/)
- [SHY Forum Thread 56](https://www.shy.idv.tw/forum.php?mod=viewthread&tid=56)
