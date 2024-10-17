---
title: Ansible-Playbooks
pubDatetime: 2023-04-06
tags:
  - "Ansible"
description: "在Ansible中，用於維護和部署的腳本叫"Playbooks"且由可讀性高的YAML(YAML Ain’t a Markup Language)格式來撰寫而成。"
---

## 00 緒論

己經知道如何使用Inventory進行連線設備的設置，接下來建立需用於維護和部署的腳本。

在Ansible中，用於維護和部署的腳本叫"Playbooks"且由可讀性高的YAML(YAML Ain’t a Markup Language)格式來撰寫而成。

## 01 相關指令模組參數

- 主要功能
  - `hosts`: 部署對像主機(以Inventory檔案內定義為主)
  - `become`: 以管理員的權限執行
  - `remote_user`: 指定用於遠端的使用者
  - `become_user`: 指定以管理員的權限執行的使用者
  - `tasks`: 所需執行的工作任務
  - `name`: 工作項目名稱
- 防火牆
  - [firewalld](https://docs.ansible.com/ansible/latest/collections/ansible/posix/firewalld_module.html)
  - [ufw](https://docs.ansible.com/ansible/latest/collections/community/general/ufw_module.html)
  - [iptables](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/iptables_module.html)
- 服務管理
  - [Service](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/service_module.html)
    - 支援管理: BSD init, OpenRC, SysV, Solaris SMF, systemd, upstart
  - [Systemd](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/systemd_service_module.html#ansible-collections-ansible-builtin-systemd-service-module)
  - [SysV/sysinit](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/service_module.html)
  - [Windows](https://docs.ansible.com/ansible/latest/collections/ansible/windows/win_service_module.html#ansible-collections-ansible-windows-win-service-module)
- 套件包安裝
  - Debian/Ubuntu: `apt`
    - [相關文件](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/apt_module.html)
  - Fedora/RHEL Like: `dnf`/`yum`(本文會以Rocky Linux 9為例)
    - [相關文件](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/dnf_module.html)
  - Arch: `community.general.pacman` \* [相關文件](https://docs.ansible.com/ansible/latest/collections/community/general/pacman_module.html)
    :::success
    在這邊只能列出一些常用的模組參數，若要了解更多則需要查詢[官方文件](https://docs.ansible.com/ansible/2.8/index.html)
    :::

## 02 腳本寫法

- 宣告
  - 引用變數: 在變數外加入`{{}}`
  - 分隔檔案: `---`
  - 清單(陣列): `- `
- 任務

```yaml=
# task 1
tasks:
    - name: "任務名稱"
      `<模組名稱>`:
          `<變數1>`:`<相關的參數>`
          `<變數2>`:`<相關的參數>`
```

## 03 範例

### 3-1 連結測試

1. 建立腳本: `$touch ping.yml`
2. 同時在剛建立的檔案內部加入相關的檔案定義

```yaml=
---
- hosts: all
  tasks:
    # task 1
    - name: "test Ping"
      ping:
      register: message
    # task 2
    - name: "Print Ping"
      debug:
        msg: "{{ message }}"
```

3. 測試腳本是否正常運行: `$sudo ansible-playbook -i [inventory] [playbook file]`

```zsh
╭─zangmenhsu@Host-02 ~/Git_AUR/ansible-tutorial
╰─➤  sudo ansible-playbook -i hosts ping.yml

PLAY [all] ****************************************************************************************************************************************

TASK [test Ping] **********************************************************************************************************************************
ok: [edge01]
ok: [vagrant-machine]

TASK [Print Ping] *********************************************************************************************************************************
ok: [vagrant-machine] => {
    "msg": {
        "ansible_facts": {
            "discovered_interpreter_python": "/usr/bin/python3"
        },
        "changed": false,
        "failed": false,
        "ping": "pong"
    }
}
ok: [edge01] => {
    "msg": {
        "ansible_facts": {
            "discovered_interpreter_python": "/usr/bin/python3"
        },
        "changed": false,
        "failed": false,
        "ping": "pong"
    }
}

PLAY RECAP ****************************************************************************************************************************************
edge01                     : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
vagrant-machine            : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

### 3-2 安裝套件包

1. 建立腳本: `$touch site.yml`
2. 同時在剛建立的檔案內部加入相關的檔案定義

```yaml=
---
- hosts: all
  become: true
  tasks:
    # task 3
    - name: "Install package"
      dnf:
        name: #加入所需安裝的套件
          - python
          - epel-release
        state: latest # 狀態: 安裝
```

3. 測試腳本是否正常運行: `$sudo ansible-playbook -i [inventory] [playbook file]`

```zsh
╭─zangmenhsu@Host-02 ~/Git_AUR/ansible-tutorial
╰─➤  sudo ansible-playbook -i hosts site.yml

PLAY [all] ****************************************************************************************************************************************

TASK [Install python] *****************************************************************************************************************************
ok: [vagrant-machine]
ok: [edge01]

PLAY RECAP ****************************************************************************************************************************************
edge01                     : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
vagrant-machine            : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0

```

### 3-3 部署nginx+防火牆設置

1. 建立腳本: `$touch nginx.yml`
2. 同時在剛建立的檔案內部加入相關的檔案定義

```yaml=
---
- hosts: all
  become: true
  tasks:
    # task 1
    - name: "Install package"
      dnf:
        name:
          - python3-firewall
          - libselinux-*
          - nginx
        state: latest
    # task 2
    - name: "Start Nginx"
      service:
        name: nginx
        state: started
        enabled: true
    # task 3
    - name: "Firewall Setup : http"
      firewalld:
        service: http
        zone: public
        permanent: true
        state: enabled
    # task 4
    - name: "Firewall Setup : https"
      firewalld:
        service: https
        zone: public
        permanent: true
        state: enabled
  gather_facts: false

```

3. 測試腳本是否正常運行: `$sudo ansible-playbook -i [inventory]`

```zsh
╭─zangmenhsu@Host-02 ~/Git_AUR/ansible-tutorial
╰─➤  sudo ansible-playbook -i hosts nginx.yml

PLAY [all] ****************************************************************************************************************************************

TASK [Install package] ****************************************************************************************************************************
ok: [vagrant-machine]
ok: [edge01]

TASK [Start Nginx] ********************************************************************************************************************************
ok: [vagrant-machine]
ok: [edge01]

TASK [Firewall Setup : http] **********************************************************************************************************************
ok: [vagrant-machine]
ok: [edge01]

TASK [Firewall Setup : https] *********************************************************************************************************************
changed: [vagrant-machine]
changed: [edge01]

PLAY RECAP ****************************************************************************************************************************************
edge01                     : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
vagrant-machine            : ok=4    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0

```

### 3-4 git fetch/pull

1. 建立腳本: `$touch repo_pull.yml`
2. 同時在剛建立的檔案內部加入相關的檔案定義

```yaml=
---
- hosts: dev
  remote_user: user
  become: yes
  become_user: user
  tasks:
    - name: "task1_app"
      git:
        repo: https://github.com/neko0xff/2023_schoolResearch_ClientApp
        dest: /home/user/repo/2023_schoolResearch_ClientApp
        update: yes
        version: main
    - name: "task2_server"
      git:
        repo: https://github.com/neko0xff/2023_schoolResearch_Server-HW
        dest: /home/user/repo/2023_schoolResearch_Server-HW
        update: yes
        version: main
```

3. 測試腳本是否正常運行: `$sudo ansible-playbook repo_pull.yaml`

```zsh
# user @ Host-02 in ~/playbook [12:18:36]
$ ansible-playbook repo_pull.yaml

PLAY [dev] ***************************************************************************************************************************

TASK [Gathering Facts] ***************************************************************************************************************
ok: [Edge01]

TASK [task1_app] *********************************************************************************************************************
ok: [Edge01]

TASK [task2_server] ******************************************************************************************************************
ok: [Edge01]

PLAY RECAP ***************************************************************************************************************************
Edge01                     : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0

```

## 3-5 使用docker-compose建置container/images

1. 建立腳本: `$touch compose_backend.yml`
2. 同時在剛建立的檔案內部加入相關的檔案定義

```yaml=
---
- hosts: all
  become: yes
  remote_user: user
  become_user: user
  become_method: sudo
  tasks:
    - name: "task1: Install Docker SDK for Python"
      ansible.builtin.pip:
        name:
          - "docker==6.1.3"
          - "docker-compose"
    - name: "task2: Delete previous containers and images"
      community.docker.docker_container:
        name: "{{ item }}"
        state: absent
      loop:
        - IoTGateway-cont
        - crawler-cont
    - name: "task3: build a backend"
      community.docker.docker_compose:
        project_src: "/home/user/repo/2023_schoolResearch_Server-HW/src/Server"
        project_name: app_backend
        stopped: false
        build: true
        state: present
      register: output
```

3. 測試腳本是否正常運行: `$sudo ansible-playbook compose_backend.yml`

```zsh
$ ansible-playbook compose_backend.yml

PLAY [all] *******************************************************************************************

TASK [Gathering Facts] *******************************************************************************
ok: [Edge01]

TASK [task1: Install Docker SDK for Python] **********************************************************
ok: [Edge01]

TASK [task2: Delete previous containers and images] **************************************************
changed: [Edge01] => (item=IoTGateway-cont)
changed: [Edge01] => (item=crawler-cont)

TASK [task3: build a backend] ************************************************************************
changed: [Edge01]

PLAY RECAP *******************************************************************************************
Edge01                     : ok=4    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

## REF

- https://docs.ansible.com/ansible/2.8/modules/dnf_module.html
- https://wiki.archlinux.org/title/Ansible
- http://blog.leanote.com/post/benmo/Ansible-%E5%A5%87%E6%B7%AB%E6%8A%80%E5%B7%A7
- [Ansible 部署工具 pull git 專案](https://bonze.tw/ansible-pull-git/)
