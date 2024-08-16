---
title: Arch-preload(預加載)
pubDatetime: 2023-09-10 13:08:02
tags: 
    - 'ArchLinux'
description: ""
---

## 00 緒論
Preload（預加載）會在後台工作，以自動觀察您如何使用這台電腦並增強應用程式處理能力（需要事先加戴的文件放入RAM中），且等到運行開始/結束時，再自動選擇該文件是否保持/排除在RAM中。

安裝好Preload後，您使用頻率最高的應用程式(ex: 網頁遊覽器&辦公套件)的加載速度會明顯快於不經常使用的應用程式。

<!--more-->

## 01 操作
1. 從AUR倉庫安裝
   * 相關倉庫: https://aur.archlinux.org/packages/preload
2. 啟用: `$ sudo systemctl enable --now preload`
3. 檢視狀態: `$ sudo systemctl status preload`

## REF
- https://wiki.archlinuxcn.org/zh-mo/Preload