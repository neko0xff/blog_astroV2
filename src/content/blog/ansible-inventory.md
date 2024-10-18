---
title: Ansible-Inventory
pubDatetime: 2023-04-06
tags:
  - "Ansible"
description: ""
---

## 00 緒論

在Ansible中，"Inventory"是定義所需管理設備的連結資訊(包含用於參數設定的變數)，且可把多台的設備分成多個群組進行各別的設定。

- 定義方式
  - 靜態: 己定義的連線資訊
  - 動態: 對外部系統進行查詢來即時產生目錄

## 01 指定靜態方式連線

### 1-1 流程

1. 建立所需的Inventory清單檔案
   - 預設保存位置
     - Linux: `/etc/ansible/hosts`
       ```zsh
       $ mkdir -p /etc/ansible
       $ cd /etc/ansible
       $ touch hosts
       ```
   - 或者在執行命令時,加上`-i`來指定自定義的Inventory
   ```zsh
   $ sudo ansible all -i [自定義的Inventory] -m [指令]
   ```
2. 同時在剛建立的檔案內部加入相關的檔案定義

   ```config=
    [dev]
    vagrant-machine ansible_host=127.0.0.1 ansible_port=2222 ansible_user=vagrant ansible_ssh_private_key_file=.vagrant/machines/default/virtualbox/private_key
    edge01 ansible_host=[server_ip] ansible_port=2444 ansible_user=user ansible_ssh_pass="<password>"

    [servers:children]
    dev
   ```

3. 測試是否連線成功: `$sudo ansible all -i [Inventory檔案名] -m ping`
   ```zsh
   $ sudo ansible all -i hosts -m ping
    edge01 | SUCCESS => {
        "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python3"
        },
        "changed": false,
        "ping": "pong"
    }
    vagrant-machine | SUCCESS => {
        "ansible_facts": {
            "discovered_interpreter_python": "/usr/bin/python3"
        },
        "changed": false,
        "ping": "pong"
    }
   ```

### 1-2 相關變數

- 格式: `[主機名稱] [連線參數]`
  - 一台設備或者一個群組=各單獨一行
  - 連線參數(`ansible_*`)
    - 連結部分
      - `ansible_host`: 伺服器位置
      - `ansible_port`: 伺服器的通訊埠
      - `ansible_user`: 用於Login的使用者名稱
    - 密碼
      - `ansible_ssh_private_key_file`: SSH 私鑰
      - `ansible_ssh_pass`: 用於Login的使用者的密碼
      - `ansible_sudo_pass`: 切到管理員的密碼 :::info
        `ansible_*_pass`的部分，需要安裝`sshpass`才能支援 :::
    - 其它
      - `ansible_sudo_exe`: 切到管理員後的預設命令路徑
      - `ansible_connection`: 連線類型
      - `ansible_shell_type`: 使用的Unix shell類型(ex: zsh,bash,ksh,....)

### 1-3 分組方式

- 不分組
  ```
  vagrant-machine ansible_host=127.0.0.1 ansible_port=2222 ansible_user=vagrant ansible_ssh_private_key_file=.vagrant/machines/default/virtualbox/private_key
  ```
- 分成多組

  ```
    [node]
    vagrant-machine ansible_host=127.0.0.1 ansible_port=2222 ansible_user=vagrant ansible_ssh_private_key_file=.vagrant/machines/default/virtualbox/private_key

    [servers:children]
    node
  ```

## 02 檢查Inventory設定檔

1. 檢查指定群組內主機: `$ ansible [群組] -i [inventory檔名] --list-hosts`
   ```zsh
   # user @ Host-02 in ~/ansible [9:25:49]
   $ ansible node -i cnServers --list-hosts
     hosts (1):
       edge01
   ```
2. 檢查所有群組的主機: `$ ansible all -i [inventory檔名] --list-hosts`
   ```zsh
   # user @ Host-02 in ~/ansible [9:34:18]
   $ ansible all -i cnServers --list-hosts
     hosts (1):
       edge01
   ```

## REF

- https://dywang.csie.cyut.edu.tw/dywang/ansible/
- https://wiki.archlinux.org/title/Ansible
