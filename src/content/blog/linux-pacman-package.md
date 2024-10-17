---
title: Linux-在pacman中加入第三方己編譯的套件包倉庫源
pubDatetime: 2023-09-10 07:33:09
tags:
  - "Linux"
description: ""
---

## 00 緒論

當官方套件庫無使用者需要的套件包時，則需要手動加入第三方套件庫來擴充來源。

<!--more-->

## 01 加入新來源

### 1-1 來源&鏡像伺服器

- `/etc/pacman.conf`中的[section]都會定義了一個使用的套件包的倉庫
  - 說明文件: https://archlinux.org/pacman/pacman.conf.5.html
  ```shell=
     [repo-ck]
     SigLevel = Never
     Server = http://repo-ck.com/$arch
     Server = https://mirrors.tuna.tsinghua.edu.cn/repo-ck/$arch
  ```
- 倉庫是多個套件包的邏輯上的集合，通常會存放在一個或多個伺服器做為鏡像

### 1-2 金鑰部分

在預設的設定下，系统只會安装有效的密鑰簽署的套件包，除非自行設置SigLevel的層級。

- 套件包種類
  1. 自定義
     - 使用者自行構建套件包且用本地密鑰進行簽署
  2. 非官方
     - 開發者: 構建軟並簽署套件包
     - 使用者: 需要用自己的密鑰來簽署開發者的密鑰使其套件包變為可信
  3. 官方
     - 開發者: 構建軟件包，而開發者的密鑰已經被 Arch 主密鑰簽名
     - 使用者: 用自己的密鑰簽名主密鑰，這樣就能信任官方的開發者
- SigLevel的設置
  - `SigLevel=TrustOnly`/`SigLevel = Required DatabaseOptional TrustedOnly`: 安裝有效的密鑰簽署的套件包
  - `SigLevel=TrustAll`: 安裝信任所有的密鑰簽署的套件包(限測試使用)
  - `SigLevel = Never`: 不去驗証密鑰簽署,直接安裝

## 02 加入第三方倉庫的金鑰

```bash
$ sudo pacman-key -r 5EE46C4C --keyserver hkp://pool.sks-keyservers.net
$ sudo pacman-key --lsign-key 5EE46C4C
```

## 03 開始安裝

1. 重新確認來源: `$ sudo pacman -Syyu`
2. 安裝套件: `$ sudo pacman -S linux-ck linux-ck-headers`

## REF

- https://wiki.archlinux.org/title/Unofficial_user_repositories_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)
- https://wiki.archlinux.org/title/Pacman_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)
- https://wiki.archlinux.org/title/Pacman_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)/Package_signing_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)
