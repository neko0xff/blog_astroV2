---
title: podman-入門使用
pubDatetime: 2023-09-11 09:41:29
tags:
  - "podman"
description: ""
---

## 00 緒論

podman是由RedHat開發的一個無背景程序(Daemonless)的容器引擎，其中提供了和docker類似的功能&相容的服務。

- 提供的功能
  1. 可管理&運行任何符合 OCI（Open Container Initiative）規範的容器和容器鏡像
  2. 提供了一個與 Docker 兼容的命令行前端&功能來管理 Docker鏡像＆容器
  3. 不需要啟用任何背景(daemon)程序，且可在沒有root(管理者)權限的情況下運作
     - 相對的容器在運行/構建容器鏡像時，可提升系統本身的安全性(減少系統安全性漏洞)
     - 原理: 是透過`runC(run container)`等工具直接去跟Linux核心構通+建置/運行容器

<!--more-->

- 己收錄在套件庫的發行版
  - Red Hat系
    1. Fedora
    2. CentOS Stream
    3. RHEL(包含Rocky等變體)
  - Debian系
    1. Debian
    2. Ubuntu
  - 其它
    1. Arch Linux

## 01 前置

1. 使用者權限設置
   ```zsh
      $ sudo usermod --add-subuids 100000-165535 --add-subgids 100000-165535 [username]
   ```
2. 安裝相關套件
   - arch: `$ sudo pacman -S podman slirp4netns`
   - fedora/rhel: `$ sudo dnf install podman`
   - ubuntu/debian: `$ sudo apt install podman`
3. 啟用相關服務: `$sudo systemctl enable --now podman`

## 02 指令

<table><tr><td bgcolor=0000FF>
  <font color="white">大部分和`docker`指令操作一致</font>
</td></tr></table>

- run: Pull image + Create container

  ```zsh
     ╭─zangmenhsu@Host-02 ~
     ╰─➤  podman run quay.io/podman/hello
        !... Hello Podman World ...!

                .--"--.
              / -     - \
             / (O)   (O) \
          ~~~| -=(,Y,)=- |
           .---. /`  \   |~~
            ~/  o  o \~~~~.----. ~~
             | =(X)= |~  / (O (O) \
               ~~~~~~~  ~| =(Y_)=- |
              ~~~~    ~~~|   U     |~~

     Project:   https://github.com/containers/podman
     Website:   https://podman.io
     Documents: https://docs.podman.io
     Twitter:   @Podman_io
  ```

- 重啟podman: `$ podman system reset`

## 03 管理工具

podman提供了一些管理Container&Image的工具

- 終端命令列: `podman-tui`

  - Arch: [AUR](https://aur.archlinux.org/packages/podman-tui)

- 桌面端: `podman-desktop`

  - Arch: [AUR](https://aur.archlinux.org/packages/podman-desktop)

- Cockpit: `cockpit-podman`

## 04 打包成容器

### 4-1 安裝

<table><tr><td bgcolor=0000FF>
   <font color=white> 請確認是否安裝`python3` </font>
</td></tr></table>

- arch: `$ sudo pacman -S podman-compose`
- pip: `$ sudo pip3 install podman-compose`

### 4-2 指令操作

podman-compose和docker-compose操作都大致相同,且podman-compose可同時使用docker-compose.yaml+Dockerfile的組合來進行自動建置容器的部分。

- 指令
  - 建置: `$ podman-compose up -d`
  - 停止: `$ podman-compose down`
  - 檢視運行的容器: `$ podman-compose ps`
  - 檢視容器內的運行過程: `$ podman-compose logs`
  - 檢視版本: `$ podman-compose version`
  - 檢視相關指令說明: `$ podman-compose --help`

### 4-3 注意部分

若`podman-compose`&`docker-compose`都已安裝在相同的系統上，請注意二者無法以交替方式進行呼叫。

  <table><tr><td bgcolor=0000FF>
   <font color=white> 容器若是由`podman-compose`啟動，相對的則無法使用 `docker-compose`來查詢或停止</font>
  </td></tr></table>

## REF

- https://blog.while-true-do.io/podman-graphical-interfaces/
- https://wiki.archlinux.org/title/Podman
- https://docs.oracle.com/zh-tw/learn/podman-compose/index.html#confirm-podman-compose-is-working
- https://dywang.csie.cyut.edu.tw/dywang/download/pdf/docker-podman.pdf
- https://ithelp.ithome.com.tw/articles/10238749
- https://www.huweihuang.com/kubernetes-notes/runtime/runtime.html
