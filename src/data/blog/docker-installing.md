---
title: docker-安裝相關服務
pubDatetime: 2023-10-15 11:30:06
tags:
  - "docker"
description: ""
---

## 00 安裝需求

- CPU指令集支緩:
  - 虛擬化支援(VT-X & VT-D)
  - 64bit CPU+OS
    - X86: Intel(EM64T)&AMD(amd64)
    - ARM: armv8之後(AArch64)
- RAM: 至少4GB以上
- OS
  - Linux: Kernel 3.8以上
  - macOS: 10.14 以後
  - Windows: 10/Server 2016以上 + Hyper-V支援
  <!--more-->

## 01 安裝&設定

### 1-1 Linux

#### 01 安裝套件包

- 使用Linux發行版套件庫的版本
  - fedora/RHEL like: `$ sudo dnf install -y docker`
  - arch: `$ sudo pacman -S docker`
  - debian: `$ sudo apt install docker.io`
- 使用官方套件庫的版本
  - fedora/RHEL like
    - 加入&啟用來源套件庫:
      `$ sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo`
    - 開始安裝:
      `$ sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin`

#### 02 開機自動啟用docker

```zsh
$ sudo systemctl enable --now docker.socket
```

#### 03 提高當前使用者的權限,讓非root帳戶來使用Docker

```zsh
$ sudo gpasswd -a $USER docker
$ sudo newgrp docker
$ sudo chmod 666 /var/run/docker.sock
```

### 1-2 Mac&Windows

由於macOS和Windows的內核架構不同，則有對應不同的解法。

1. 安裝一台VM(ex: Ubuntu/Debian)，在其VM上安裝docker
   - [VMware](https://www.vmware.com/tw/products/workstation-player/workstation-player-evaluation.html)
   - [QEMU](https://www.qemu.org/download/)
   - [VirtualBox](https://www.virtualbox.org/)
   - [Hyper-V](https://learn.microsoft.com/zh-tw/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v)
     - [WSL2](https://learn.microsoft.com/zh-tw/windows/wsl/install)
2. 使用Docker Desktop
   - [Windows](https://docs.docker.com/desktop/install/windows-install/)
   - [macOS](https://docs.docker.com/desktop/install/mac-install/)

## 02 檢查docker是否正常安裝

- 檢視docker運行狀態: `$ docker info`

  - 輸出內容

    ```bash
     Client:
        Version:    24.0.6
        Context:    default
        Debug Mode: false
        Plugins:
          buildx: Docker Buildx (Docker Inc.)
            Version:  0.11.2
            Path:     /usr/lib/docker/cli-plugins/docker-buildx
          compose: Docker Compose (Docker Inc.)
            Version:  2.22.0
            Path:     /usr/lib/docker/cli-plugins/docker-compose

    Server:
     Containers: 3
         Running: 3
         Paused: 0
         Stopped: 0
     Images: 4
     Server Version: 24.0.6
     Storage Driver: overlay2
      Backing Filesystem: extfs
      Supports d_type: true
      Using metacopy: true
      Native Overlay Diff: false
      userxattr: false
     Logging Driver: json-file
     Cgroup Driver: systemd
     Cgroup Version: 2
     Plugins:
      Volume: local
      Network: bridge host ipvlan macvlan null overlay
      Log: awslogs fluentd gcplogs gelf journald json-file local logentries splunk syslog
     Swarm: inactive
     Runtimes: io.containerd.runc.v2 runc
     Default Runtime: runc
     Init Binary: docker-init
     containerd version: 8c087663b0233f6e6e2f4515cee61d49f14746a8.m
     runc version:
     init version: de40ad0
     Security Options:
      seccomp
       Profile: builtin
      cgroupns
     Kernel Version: 6.5.7-zen1-1-zen
     Operating System: Arch Linux
     OSType: linux
     Architecture: x86_64
     CPUs: 4
     Total Memory: 15.53GiB
     Name: Host-02
     ID: HCEI:MJBT:75N6:BTIY:EJUK:G2WU:WEUJ:AVAE:L5ZY:RFAM:O4KV:MRJP
     Docker Root Dir: /var/lib/docker
     Debug Mode: false
     Username: neko0xff
     Experimental: false
     Insecure Registries:
      127.0.0.0/8
     Live Restore Enabled: false
    ```

- 檢視己安裝docker版本: `$ docker version`

  - 輸出內容

    ```bash
       Client: Docker Engine - Community
       Version:           20.10.22
       API version:       1.41
       Go version:        go1.18.9
       Git commit:        3a2c30b
       Built:             Thu Dec 15 22:28:22 2022
       OS/Arch:           linux/amd64
       Context:           default
       Experimental:      true

       Server: Docker Engine - Community
       Engine:
        Version:          20.10.22
        API version:      1.41 (minimum version 1.12)
        Go version:       go1.18.9
        Git commit:       42c8b31
       Built:            Thu Dec 15 22:26:06 2022
        OS/Arch:          linux/amd64
        Experimental:     false
        containerd:
        Version:          1.6.14
        GitCommit:        9ba4b250366a5ddde94bb7c9d1def331423aa323
       runc:
        Version:          1.1.4
        GitCommit:        v1.1.4-0-g5fd4c4d
       docker-init:
        Version:          0.19.0
        GitCommit:        de40ad0
    ```

## REF

- https://www.server-world.info/en/note?os=Debian_11&p=docker&f=1
- https://medium.com/%E5%AE%B8-%E5%AD%B8%E7%BF%92%E7%AD%86%E8%A8%98/mac-%E5%AE%89%E8%A3%9D-docker-%E5%8F%8A%E6%93%8D%E4%BD%9C%E6%8C%87%E4%BB%A4-6a9cfaa55979
- https://wiki.archlinux.org/title/Docker_(%E6%AD%A3%E9%AB%94%E4%B8%AD%E6%96%87)
- https://docs.docker.com/engine/install/rhel/
