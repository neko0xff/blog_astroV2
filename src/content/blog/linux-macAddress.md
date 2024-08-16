---
title: Linux-改變網卡的Mac Address
pubDatetime: 2023-09-10 12:30:04
tags: 
    - 'Linux'
description: ""
---

## 00 前置
- 檢視網卡正在使用的Mac Address: `$ iw dev`
- 主要會動到的部分
  1. 修改NetworkManager設定檔: `/etc/NetworkManager/conf.d/mac.conf`
  2. 修改完成後，請重啟NetworkManager，使設定生效: `$ sudo systemctl restart NetworkManager`

<!--more-->

## 01 使用隨機產生Mac Address

```shell=
[device]
wifi.scan-rand-mac-address=yes
ethernet.scan-rand-mac-address=yes

[connection]
ethernet.cloned-mac-address=random
wifi.cloned-mac-address=random 
```

## 02 使用特定Mac Address
```shell=
[device]
wifi.scan-rand-mac-address=no
ethernet.scan-rand-mac-address=no

[connection]
ethernet.cloned-mac-address=[NEW_MAC1]
wifi.cloned-mac-address=[NEW_MAC2]
```

## 03 不修改+使用原機的Mac Address
```shell=
[device]
wifi.scan-rand-mac-address=no
ethernet.scan-rand-mac-address=no
```

## REF
- https://miloserdov.org/?p=6174
- https://wiki.archlinuxcn.org/wiki/NetworkManager
