---
title: Arch-如何使用AUR(Arch User Repository)上套件包
pubDatetime: 2023-09-10 07:52:36
tags:
  - "ArchLinux"
description: "當官方套件庫找不到需要的套件時，Arch則提供了AUR(Arch User Repository,AUR)這個由其它使用者維護的倉庫，讓需要的使用者可自行編譯且安裝所需的套件。"
---

## 00 緒論

當官方套件庫找不到需要的套件時，Arch則提供了AUR(Arch User Repository,AUR)這個由其它使用者維護的倉庫，讓需要的使用者可自行編譯且安裝所需的套件。

<!--more-->

## 01 前置

- 安裝編譯時必要項目: `$ sudo pacman -S -needed base-devel git`

## 02 第一種: 手動取得方式

1. 在AUR找自己需要的包：https://aur.archlinux.org/
2. 使用AUR倉庫的源且弄到local(ex:android-studio)
   - 取得: `$ git clone https://aur.archlinux.org/android-studio.git`
   - 更新: `$ git pull`
3. 開始編譯
   - 到要編譯的AUR源的資料夾:` $ cd android-studio`
   - 編譯
     - 直接編譯+安裝: `$ makepkg -i`
     - 包含安裝相依的套件:`$ makepkg -is`
     - 安裝己編譯完成的套件包: `$ pacman -U [套件包]`

## 03 第二種: 使用第三方的套件管理

### 3-1 安裝第三方的套件管理(yay)

- GitHub: [https://github.com/Jguer/yay](https://github.com/Jguer/yay)
  - 官方說明: https://github.com/Jguer/yay#examples-of-custom-operations
    ![](https://i.imgur.com/HyTR9NJ.png)
- 安裝過程
  1. 將原始碼移動到 `/opt/` 目錄: `$ cd /opt/`
  2. 使用AUR倉庫的源且弄到local
     ```
       $ git clone https://aur.archlinux.org/yay-git.git
     ```
  3. 転到要編譯的AUR源的資料夾: `$ cd yay-git`
  4. 開始編譯: `$ makepkg -is`

## REF

### Arch wiki

- https://wiki.archlinux.org/title/Arch_User_Repository_(%E6%AD%A3%E9%AB%94%E4%B8%AD%E6%96%87)
- https://wiki.archlinux.org/title/Makepkg_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)
