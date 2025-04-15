---
title: Server-虛擬化的介紹&主流方案
pubDatetime: 2023-10-13 08:39:01
modDatetime: 2024-11-04
tags:
  - "Server"
description: ""
---

## 何為虛擬化？

其運作方式，就是先在宿主主機(Host)上分割且提供一部分硬體資源來模擬出一個至多個接近實體主機的環境( Guest )。且能讓程式在不同硬體上執行時，都以為自己本身在同一個原始環境中執行！

### 可能會遇到的問題

由於每台機器的環境不同而寫好的程式可能剛好跟開發者的電腦上的環境相容或者不相容，可能需要有多個不同的測試環境(ex:相容性測試)來進行測試。

其中會碰到的一些變因，進而需要一個不需花時間進行調整就能立即開箱即用的環境。

- 變因
  - 軟體: 不同作業系統的設置會有所不同(ex: Linux發行版)
    - 環境變數
    - 撰寫的程式語言(ex: Python,Node,Rust,Go,PHP,...)
    - 函式庫(ex: npm,cargo)
    - 資料庫(ex: MySQL,MongoDB)
    - 系統設定(ex: 套件管理)
  - 硬體: 每台電腦規格配置都不同
    - CPU: 架構
      - 架構
      - 核心數
    - RAM
      - 服務運行時，所需的占用量
      - 物理記憶體所己安裝的容量

### 必要的條件

如果想入門虛擬化且能夠發揮所有效能時，其中得必需注意的部分

- 硬體
  - 必要部分: 宿主主機的CPU必須支援虛擬化技術的指令(ex: `Intel VT-x`,`AMD-V`)才能正常運行
  ```zsh
    # user @ Host-02 in ~ [9:59:31] C:1
    $ egrep '(vmx | svm)' /proc/cpuinfo
    flags           : fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ht tm pbe syscall nx rdtscp lm constant_tsc arch_perfmon pebs bts rep_good nopl xtopology nonstop_tsc cpuid aperfmperf pni pclmulqdq dtes64 monitor ds_cpl vmx est tm2 ssse3 cx16 xtpr pdcm pcid sse4_1 sse4_2 x2apic popcnt tsc_deadline_timer aes xsave avx lahf_lm epb pti ssbd ibrs ibpb stibp tpr_shadow flexpriority ept vpid xsaveopt dtherm ida arat pln pts vnmi md_clear flush_l1d
    vmx flags       : vnmi preemption_timer invvpid ept_x_only flexpriority tsc_offset vtpr mtf vapic ept vpid unrestricted_guest
    flags           : fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ht tm pbe syscall nx rdtscp lm constant_tsc arch_perfmon pebs bts rep_good nopl xtopology nonstop_tsc cpuid aperfmperf pni pclmulqdq dtes64 monitor ds_cpl vmx est tm2 ssse3 cx16 xtpr pdcm pcid sse4_1 sse4_2 x2apic popcnt tsc_deadline_timer aes xsave avx lahf_lm epb pti ssbd ibrs ibpb stibp tpr_shadow flexpriority ept vpid xsaveopt dtherm ida arat pln pts vnmi md_clear flush_l1d
    vmx flags       : vnmi preemption_timer invvpid ept_x_only flexpriority tsc_offset vtpr mtf vapic ept vpid unrestricted_guest
    flags           : fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ht tm pbe syscall nx rdtscp lm constant_tsc arch_perfmon pebs bts rep_good nopl xtopology nonstop_tsc cpuid aperfmperf pni pclmulqdq dtes64 monitor ds_cpl vmx est tm2 ssse3 cx16 xtpr pdcm pcid sse4_1 sse4_2 x2apic popcnt tsc_deadline_timer aes xsave avx lahf_lm epb pti ssbd ibrs ibpb stibp tpr_shadow flexpriority ept vpid xsaveopt dtherm ida arat pln pts vnmi md_clear flush_l1d
    vmx flags       : vnmi preemption_timer invvpid ept_x_only flexpriority tsc_offset vtpr mtf vapic ept vpid unrestricted_guest
    flags           : fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ht tm pbe syscall nx rdtscp lm constant_tsc arch_perfmon pebs bts rep_good nopl xtopology nonstop_tsc cpuid aperfmperf pni pclmulqdq dtes64 monitor ds_cpl vmx est tm2 ssse3 cx16 xtpr pdcm pcid sse4_1 sse4_2 x2apic popcnt tsc_deadline_timer aes xsave avx lahf_lm epb pti ssbd ibrs ibpb stibp tpr_shadow flexpriority ept vpid xsaveopt dtherm ida arat pln pts vnmi md_clear flush_l1d
    vmx flags       : vnmi preemption_timer invvpid ept_x_only flexpriority tsc_offset vtpr mtf vapic ept vpid unrestricted_guest
  ```
  - 可選部分: 若你的CPU&主機版晶片組支援 AMD 的"輸入輸出主記憶體管理單元(`IOMMU`)"或 Intel 的"直接輸入/輸出虛擬化(Virtualization for Directed I/O，`VT-d`)",則可讓虛擬機直接取用宿主主機的週邊硬體資源
  ```bash
   root@pve01:~# dmesg | grep DMAR
   [    0.008574] ACPI: DMAR 0x00000000DAE978A8 0000B8 (v01 INTEL  BDW      00000001 INTL 00000001)
   [    0.008607] ACPI: Reserving DMAR table memory at [mem 0xdae978a8-0xdae9795f]
   [    0.044440] DMAR: IOMMU enabled
   [    0.129854] DMAR: Host address width 39
   [    0.129855] DMAR: DRHD base: 0x000000fed90000 flags: 0x0
   [    0.129864] DMAR: dmar0: reg_base_addr fed90000 ver 1:0 cap c0000020660462 ecap f0101a
   [    0.129866] DMAR: DRHD base: 0x000000fed91000 flags: 0x1
   [    0.129869] DMAR: dmar1: reg_base_addr fed91000 ver 1:0 cap d2008c20660462 ecap f010da
   [    0.129871] DMAR: RMRR base: 0x000000dbe69000 end: 0x000000dbe78fff
   [    0.129874] DMAR: RMRR base: 0x000000dd000000 end: 0x000000df1fffff
   [    0.129876] DMAR-IR: IOAPIC id 8 under DRHD base  0xfed91000 IOMMU 1
   [    0.129877] DMAR-IR: HPET id 0 under DRHD base 0xfed91000
   [    0.129878] DMAR-IR: x2apic is disabled because BIOS sets x2apic opt out bit.
   [    0.129879] DMAR-IR: Use 'intremap=no_x2apic_optout' to override the BIOS setting.
   [    0.130400] DMAR-IR: Enabled IRQ remapping in xapic mode
   [    0.290377] DMAR: No ATSR found
   [    0.290378] DMAR: No SATC found
   [    0.290379] DMAR: IOMMU feature pgsel_inv inconsistent
   [    0.290380] DMAR: IOMMU feature sc_support inconsistent
   [    0.290381] DMAR: IOMMU feature pass_through inconsistent
   [    0.290382] DMAR: dmar0: Using Queued invalidation
   [    0.290388] DMAR: dmar1: Using Queued invalidation
   [    0.380144] DMAR: Intel(R) Virtualization Technology for Directed I/O
   [    4.518854] i915 0000:00:02.0: [drm] DMAR active, disabling use of stolen memory
  ```
- 軟體
  - 系統: 相對應支援虛擬化功能的核心模組
  - BIOS: 有些主機板可能預設未開啟或閹割，請務必確認是否有相關的設置且手動啟用

### 特點

可用來降低資訊系統建置和其附加的維護成本

- 人力
  1. 可預先建立好己安裝好相關服務的模版，等到要建置新的服務時，則可復制一份進行需要的設定再進行佈署
  2. 不用擔心某一台實體主機硬體的故障，而導致整個系統掛掉
  3. 可進行集中管理: 簡化管理複雜度與提高管理彈性，同時提升系統可用性
- 硬體
  - 減少需要的實體主機數量，節省採購成本和其所需的用電量且同時達成節能減碳的目標
  - 可使用P2V( Physical to Virtual ,實體機轉虛擬機)技術來解決無法升級老舊系統硬體&軟體的問題，同時提升系統穩定性
  - 在同一時間內，虛擬機可和原本的宿主主機同時運行，且能執行系統架構不同的OS來滿足不同的使用需求和場景

## 日常中經常使用的種類

- 祼機(Bare-Metal): 在實體主機開機後,記憶體載入作業系統和相關服務，並且開始消耗CPU&記憶體等系統硬體資源
  - 活/死定義
    - 活: 電源<font color=red>打開</font>
    - 死: 電源關閉
  ```mermaid
    graph LR;
       電源打開 --> 戴入資源 --> 消耗資源 --> 電源關閉
  ```
- 虛擬機器(VM): 從虛擬機器管理器(Hypervisor)分配到資源(CPU，記憶體)後，才會開始真正消耗實體伺服器的系統資源
  - 例如
    - VMWare: [ESXI](https://www.vmware.com/products/cloud-infrastructure/esxi-and-esx)
    - Linux: KVM ( Kernel-bases Virtual Machine , 基於核心的虛擬機器)/Libvirt
    - [Xen](https://xenproject.org/)
    - Windows: [Hyper-V](https://learn.microsoft.com/zh-tw/virtualization/hyper-v-on-windows/about/)
  - 活/死定義
    - 活: 啟用後，<font color=red>開始</font>消耗
    - 死: 關閉後，停止消耗
  ```mermaid
    graph LR;
       資源分配 --> 啟用服務 --> 停用服務
  ```
- 容器(Container): 容器從映像檔創建且正式執行後,才開始消耗系統資源
  - 例如
    - Docker
    - Podman
    - LXC ( Linux Containers )
    - OpenVZ
  - 活/死定義
    - 活: 創建/執行時
    - 死: 刪除/停止時
  - 存在定義
    - 執行前: 容器根本不存在於本機或者平台上，所以不會有活著或死掉的問題
    - 執行後: 容器才會誕生且存在於本機
  ```mermaid
    graph LR;
       建立容器 --> 啟用服務 --> 停用服務&容器 --> 拾棄容器
  ```

## VM(虛擬機器) vs Container(容器)

![](https://i.imgur.com/WrvRUTd.png)

### Virtual Machine(VM,虛擬機器)

在<font color=red>系統層</font>上虛擬化: 在本機作業系統(Host OS)上再裝一個獨立運行於本機的作業系統(Guest OS)，然後讓兩個作業系統彼此不會因環境不同而不相容。

- 目標: 將一個應用程式所需的執行環境打包起來，建立一個獨立環境，方便在不同的硬體中移動
- 特點: 完全把系統的硬體資源隔離
  - 優: 由於硬體資源己經完全隔離，相對資料保護的安全性高
  - 缺: 需佔用宿主的資源(ex:硬碟&RAM)較多，所以效能會因此而影響
- 其中的關係
  - Host: 需要在VM內裝作業系統(Guest OS)
  - Guest OS: 開機需要花一點時間

### Container(容器)

在<font color=red>作業系統層</font>上虛擬化: 不需額外在容器安裝作業系統（Guest OS），而是透過容器管理工具直接將一個應用程式所需的程式碼和函式庫一同打包成容器，且同時建立資源控管機制直接隔離各個容器並分配宿主主機上的系統資源給容器使用。

同時建立容器時所需的系統資源&開機時間可大幅降低，進而改善虛擬機器因為需要裝 Guest OS ,而會有啟動慢、佔較多的系統資源的問題。

- 目標：提供一個不需自己花時間調整就能開箱即用的環境
- 特點: 只需提供容器能運行的環境
  - 優
    1. 維護流程可大幅簡化:系統管理員只需替換鏡像檔，服務立即重新上線
    2. 可輕易自動化部署: 方便管理多台伺服器
    3. 容器所占用的宿主的資源(ex:硬碟&RAM)可大幅度減少
       - 使用精簡化的小型OS(ex: Windows nano Server,Ubuntu Core,Fedora Core OS)會是未來運行的方向
  - 缺
    1. 改一行程式時就得重新建置一次image，除非重建與部署image容易且快速
    2. 替換image時慢又麻煩，除非image部署容易
    3. 只能更新己經產生差異的部分
    4. 由於底層是和宿主OS共用同一個Kernel(隔離性不如VM),相對資料保護的安全性低
- 其中的關係
  - Host: 管理&運行本機的容器&映像檔
  - Guest
    - 映像檔(Image): 直接從`Docker Hub`或`私有的Registry`抓取開發者所建置完成的映像檔
    - 容器(Container): 使用己抓取的映像檔進行配置,完成後啟動上線的速度比VM快

## 可建置的環境種類

Docker & VM 不只可單獨使用，也能互相搭配混合使用。

1. 祼機(Bare-Metal): 直接在實體伺服器安裝容器平台後，在其上運作數量眾多的容器以便提供應用程式及服務
   - [Fedora Core OS](https://fedoraproject.org/coreos/)
   - [Ubuntu Core](https://ubuntu.com/core)
   - [Windows Nano Server](https://www.netadmin.com.tw/netadmin/zh-tw/feature/0AD8DFBB99D84786A1D13FCBE577F226)
   - [VMware Photon OS](https://vmware.github.io/photon/)
2. VM平台: 在實體伺服器建置虛擬主機,以硬體資源隔離的方式提供應用程式及服務
   - [VMware ESXI](https://www.vmware.com/tw/products/esxi-and-esx.html)
   - [KVM(Kernel-based Virtual Machine,Kernel 型虛擬機器)](https://zh.wikipedia.org/zh-tw/%E5%9F%BA%E4%BA%8E%E5%86%85%E6%A0%B8%E7%9A%84%E8%99%9A%E6%8B%9F%E6%9C%BA)
   - [Xen](https://zh.wikipedia.org/zh-tw/Xen)
3. VM+Container混合使用: 在虛擬主機中建置容器平台運作多個容器，同時提供正式營運所需的應用程式及服務，且能兼顧資料保護的安全性高&效能好等特性
   ![](https://i.imgur.com/MSFVC3o.png)

## REF

- Container的生命週期. (n.d.). 全面易懂的Docker指令大全. https://joshhu.gitbooks.io/dockercommands/content/Containers/concepts.html
- 在公有雲、傳統主機左右為難？【裸機服務不失為兩全其美選項】. (2022, March 1). 數位通國際. https://www.easpnet.com/blog/bare-metal-server/
- 臺中市政府資訊中心. (2012, May). 雲端虛擬化平台於臺中市政府資訊中心之建置與應用-第295期(5月). 政府機關資訊通報. https://www.dgbas.gov.tw/public/Data/24301042171.pdf
- 花小錢辦大事，打造一台虛空電腦——實戰服務器虛擬化. 無情開評. https://www.youtube.com/watch?v=h1oZnncNSRA
  {%youtube h1oZnncNSRA %}
- 林宣佑(柚子). (2012, October). Linux KVM 核心虛擬技術. Linux KVM 研究室. http://linuxkvm.blogspot.com/p/linux-kvm.html
- X86虛擬化. (2017/9/6). 維基百科. https://zh.wikipedia.org/zh-tw/X86%E8%99%9A%E6%8B%9F%E5%8C%96
- https://hackmd.io/@108213034/B1_qNP2xc
