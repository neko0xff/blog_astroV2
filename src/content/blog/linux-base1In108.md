---
title: 108工科賽主機設定-vGate-xx(Fedora_1)
pubDatetime: 2023-09-16 09:16:45
tags:
  - "Linux"
  - "工科賽"
description: ""
---

## 00 前提

### 主機間的關係

- xx:崗位碼
- Host-xx(192.168.x.1[Eth0]) < == > vGate-xx(192.168.x.254[Eth0] & 10.19.x.1[Eth1]) < == > Internet-xx (10.19.x.2[Eth1])

### vGate-xx(Fedora)網卡設定

- DNS Server:192.168.x.1(Host-xx)
- Eth0(enp0s3)==>Host-xx:
  - IP:192.168.x.254
  - Network Mask: 255.255.255.0
  - Gateway: 192.168.1.254
- Eth1(enp0s8)==>Internet-xx:
  - IP:10.19.x.1
  - Network Mask: 255.255.255.252
  - Gateway: 10.19.x.1

<!--more-->

## 01 Linux終端機使用方法

- nano用法:
  - Ctrl+O=`save File`(存檔)
  - Ctrl+X=`exit nano`(離開 nano)
- 權限
  - `sudo [需下的指令]`: 向系統借用暫時的最高權限
  - `su [username]`: 切換使用者
- 畫面管理部分
  - 預設呈現部分: `[目前使用的使用者@目前主機 ~]# (指令)`
  - `clear` :清除終端機畫面
  - Ctrl + Alt + F`1~7` : tty`1~7`(終端機)

## 02 啟用 root 帳戶

- 輸入時,請輸入要設定的root密碼後,再輸一遍做確認是否有錯
  ```bash
   [user@localhost ~]# sudo passwd root
  ```

## 03 主機名更改

- 使用root帳戶: `[user@localhost ~]# su -`
- 更改Hostname: `[root@localhost ~]# hostnamectl set-hostname vGate-xx`
- 輸出更改後的Hostname: `[root@localhost ~]# hostname`

## 04 新增群組

```
[root@localhost ~]# groupadd Feuser
```

## 05 大量新增使用者

- 檔案:useradd.sh
  ```
    [root@localhost ~]# nano useradd.sh
  ```
- 內容:
  ```bash=
    //username:FsuXX
    u="Fsu"
    //範圍:01~50
    for i in $(seq -f "%02g" 1 1 50)
    do
      useradd -g Feuser -s /bin/bash $u$i
      echo  "Fedora@2019" | passwd --stdin $u$i
    done
  ```
- 運行批次檔: `[root@localhost ~]# bash useradd.sh`

## 06 限制特定群組或者root不能進去圖形化介面(GDM)

- 需修改GDM的設定檔(增加指令): `[root@localhost ~]# nano /etc/pam.d/gdm-password`

### 加入的內容部分

- 如果要限制<font color=green>群組</font>
  ```bash
     auth   required pam_succeed_if.so user notingroup Feuser
  ```
- 如果要限制<font color=red>root</font>
  ```bash
     auth   required pam_succeed_if.so user != root quiet
  ```

## 07 設定 "Command history"=只存5筆記錄

- 需修改的檔案: /etc/profile.d/custom.sh

```
[root@localhost ~]# nano /etc/profile.d/custom.sh
```

- 內容:
  ```bash=
    HISTSIZE=5
  ```
- 立即生效 "Command history"=只存5筆記錄: `
[root@localhost ~]# source /etc/profile.d/custom.sh`
- 檢視"Command history"的指令: `[root@localhost ~]# history`

## 08 Port Forwarding （網路転發設定）

- 啟用網路転發: `[root@localhost ~]# nano /etc/sysctl.conf`
  ```shell=
    //ipv4転發
    net.ipv4.ip_forward=1
  ```
- 立即生效: `[root@localhost ~]# sysctl -p`
  ```shell=
    net.ipv4.ip_forward=1
  ```
