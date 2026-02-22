---
title: 108工科賽主機設定-vGate-xx(Fedora_2)
pubDatetime: 2023-09-16 09:53:05
tags:
  - "Linux"
  - "工科賽"
description: ""
---

## 00前提

- DNS請求部分
  - 內部 DNS 請求轉送至 `Host-xx`
  - 外部 DNS 請求則自行建立 `nhssc2019.edu` 之解析，並新增一條 A 紀錄供 `www`
    網頁使用
- 設定 NAT 及必要的 Port
  Forwarding，使內部使用者可以正常與外部電腦通訊，外部使用者可正確瀏覽網頁內容

<!--more-->

## 01 Firewalld(防火牆)設定

### 設定

1. 網卡指向区域設定
   - Eth0:`internal`(対內)
   ```
   [root@localhost ~]# nmcli connection modify Eth0 connection.zone internal
   ```

   - Eth1:`external`(対外)
   ```
   [root@localhost ~]# nmcli connection modify Eth1 connection.zone external
   ```
2. 転送設定

```bash
[root@localhost ~]# firewall-cmd --zone=external --permanent --add-masquerade
//允許対外的固定ip位置可以連到192.168.x.1
[root@localhost ~]# firewall-cmd --zone=external --permanent --add-forward-port=port=80:proto=tcp:toaddr=192.168.x.1
```

3. 通過服務設定
   - 允許対外能用內部的dns服務
   ```
   [root@localhost ~]# firewall-cmd --zone=external --permanent --add-service=dns
   ```

   - 不允許対外能用內部的ssh服務
   ```
   [root@localhost ~]# firewall-cmd --zone=external --permanent --remove-service=ssh
   ```

   - 檢視対外能連或拒絕連進內部的服務
   ```
   [root@localhost ~]# firewall-cmd --zone=external --permanent --list-service
   ```

   - 允許対內能用內部的dns服務
   ```
   [root@localhost ~]# firewall-cmd --zone=internal --permanent --add-service=dns
   ```
4. firewalld重新生效: `[root@localhost ~]# firewall-cmd --reload`

### 檢視

- 檢視指向区域所能通過或不能通過的服務
  ```bash
  [root@localhost ~]# firewall-cmd --info-zone=internal
  [root@localhost ~]# firewall-cmd --info-zone=external
  ```

## DNS服務-Dnsmasq

### 設定

1. 在本地的Hosts文件建立內部的解析: `[root@localhost ~]# nano /etc/hosts`
   ```bash
   //增加內部的解析
   10.19.x.1      www.nhssc2019.edu
   192.168.x.1    www.nhssc2019.edu
   ```
2. 讓dnsmasq用本地的Hosts的文件: `[root@localhost ~]# nano /etc/dnsmasq.conf`
   ```shell
   //使用本地的Hosts
   localise-queries
   ```
3. 檢查是否正常運作: `[root@localhost ~]# dnsmasq --test`
4. 啟用dnsmasq: `[root@localhost ~]# systemctl enable --now dnsmasq`
5. 檢視dnsmasq的狀態: `[root@localhost ~]# systemctl status dnsmasq`
