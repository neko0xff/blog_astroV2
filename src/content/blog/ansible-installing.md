---
title: Ansible-安裝&相關設置
pubDatetime: 2023-04-06
tags:
  - "Ansible"
description: ""
---

## 00 緒論

Ansible是由RedHat維護的一個能讓系統管理員可簡化系統維護&部署的開源配置工具，且能自動化的運行在任何運行Linux的裝置上(ex:
伺服器，樹莓派等),即<font color=red>"基礎架構即程式碼(IaC)"</font>。

- 特點
  - 設置控制節點後，則能<font color=red>輕易</font>管理多台設備(即受控節點)
  - 雙方只需SSH&Python(Linux)/Powershell(Windows)，就能<font color=red>無需安裝任何代理(Agentless)</font>而立即使用且更加<font color=red>安全</font>
  - 無需學習進階復雜的程式語言技巧(頂多使用Python調用Ansible
    API或者使用YAML撰寫Playbook)
- 主要組成
  - 連線: Inventory => 定義管理設備的連線<font color=red>清單</font>
  - 運行模式
    - Playbook(撰寫腳本):
      只需把要執行的指令全部寫成YAML格式和使用對應的模組，就能完成重復性高且復雜的任務
      - 腳本
        - Module => 執行的各種操作命令的<font color=red>模組</font>
        - Playbook => 呼叫各種模組的<font color=red>腳本</font>
    - Ac-hoc(臨時指令): 若是只有一個單一指令，則可完成重復性低且簡單的任務
- 影片
  - [就是要跟你聊 Red Hat Ansible 自動化怎麼讓你更安心管理系統](https://www.youtube.com/watch?v=QOMg9f6gFOs)
  <iframe width="560" height="315" src="https://www.youtube.com/embed/QOMg9f6gFOs?si=l12-juyKwRGL1Lj-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 01 安裝

- 前置必須注意部分
  - SSH連線
  - 使用者權限(部分模組可能要求使用者權限)
- 套件安裝
  - Arch: `$sudo pacman -S ansible`
  - Fedora/RHEL like: `$sudo dnf install -y ansible`
  - Debian/Ubuntu: `$sudo apt install -y ansible`

## 02 檢視

- 安裝的版本: `$ansible --version`
  ```zsh
  [zangmenhsu@Host-02 ~]  ansible --version
    ansible [core 2.16.0]
        config file = None
        configured module search path = ['/home/zangmenhsu/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
        ansible python module location = /usr/lib/python3.11/site-packages/ansible
        ansible collection location = /home/zangmenhsu/.ansible/collections:/usr/share/ansible/collections
        executable location = /usr/bin/ansible
        python version = 3.11.6 (main, Nov 14 2023, 09:36:21) [GCC 13.2.1 20230801] (/usr/bin/python)
        jinja version = 3.1.2
        libyaml = True
  ```
- 測試Ansible是否正常運行(在本地測試)
  ```zsh
  [zangmenhsu@Host-02 ~] ansible localhost -m ping
  [WARNING]: No inventory was parsed, only implicit localhost is available
  localhost | SUCCESS => {
      "changed": false,
      "ping": "pong"
  }
  ```

## 03 說明文件

若需要查詢所需的功能，可試著

- 查詢相關指令: `ansible --help`
- 查詢模組的用法資訊
  1. 離線(指令)
     - 特定: `ansible-doc [欲想查詢的模組]`
     - 使用關鍵字來查詢所需的模組: `ansible-doc -l | grep [條件]`
  2. 官方的線上文件:
     [ansible-doc](https://docs.ansible.com/ansible/2.9/modules/modules_by_category.html)

## REF

- [Ansible Taiwan](https://ansible.tw/#!docs/installation.md)
- [ArchWiki-Ansible](https://wiki.archlinux.org/title/Ansible)
- https://dywang.csie.cyut.edu.tw/dywang/ansible/
