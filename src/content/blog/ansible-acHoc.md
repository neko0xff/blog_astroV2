---
title: Ansible-Ad_hoc模式
pubDatetime: 2023-04-06
tags: 
  - 'Ansible'
description: ""
---

## 00 緒論
若要在多台機器上佈署單一指令時，可使用Ad-Hoc模式來加快效率。

- 指令用法: `$ansible [群組」 -i [inventory file]  -a "[指令]"`
  * 關鍵參數: `-a`

## 01 下指令
- neofetch
    ```zsh
    # user @ Host-02 in ~/ansible [10:05:15]
    $ ansible node -i cnServers -a "neofetch"
    edge01 | CHANGED | rc=0 >>
            #####           user@edge01 
           #######          ----------- 
           ##O#O##          OS: Rocky Linux 9.3 (Blue Onyx) x86_64 
           #######          Kernel: 5.14.0-362.8.1.el9_3.x86_64 
         ###########        Uptime: 17 days, 4 hours, 45 mins 
        #############       Packages: 1308 (rpm) 
       ###############      Shell: bash 5.1.8 
       ################     Terminal: /dev/pts/0 
      #################     CPU: AMD A8-5500 APU (4) @ 3.200GHz 
    #####################   GPU: AMD ATI Radeon HD 7560D 
    #####################   Memory: 2192MiB / 6859MiB 
      #################
    ```
- 查詢現在時間
    ```zsh
    # user @ Host-02 in ~/ansible [11:07:54] 
    $ ansible node -i cnServers -a "date"              
    edge01 | CHANGED | rc=0 >>
    西元2023年12月15日 (週五) 11時08分06秒 CST
    ```

## REF
- https://dic.vbird.tw/network_project/zunit05.php