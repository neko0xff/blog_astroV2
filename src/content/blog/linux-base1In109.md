---
title: 109工科賽-Linx-xx(Fedora_1)
pubDatetime: 2023-09-16 10:36:26
tags:
   - 'Linux'
   - '工科賽'
description: ""
---

## 00 前置
- 所動到的設定
  * SSH Login
  * 憑証
    * HTTPS 
    * AD網域使用者
  * SAMBA
    * 使用者
  * iptable(nftable)

<!--more-->

## 01 SSH

### 設定檔位置
```bash
$ sudo nano /etc/ssh/sshd_config
```
### 更改或增加連結埠(ex:2224)
- 如果不要使用預設的連結埠請註解
  ```bash
    #Port 22
    Port 2224
  ```

### 不允許用root登入
```bash=
PermitRootLogin no
```

### 限制特定使用者登入
```bash
AllowUsers Feusr0? Feusr10
```
<table><tr><td bgcolor=0000FF>
  <font color=white>上面的AllowUsers 一旦有設定，未在表列中的用戶就再也無法登入</font>
</td></tr></table>

#### 限制使用者的方式
* `AllowUsers`：由空格分隔的使用者名稱組成，設定允許登入的使用者
* `AllowGroups`：由空格分隔的群組名稱組成，設定允許登入的群組
* `DenyUsers`：由空格分隔的使用者名稱組成，設定拒絕登入的使用者
* `DenyGroups`：由空格分隔的群組名稱組成，設定拒絕登入的群組

### SELINUX & 防火牆設定
```
$ sudo semanage port -a -t ssh_port_t -p tcp 2224
```

### 重新載入 SSH 服務使其生效
```
$ sudo systemctl enable --now sshd
```

## 02 CLI顯示完整路徑
### 2-1 修改 /etc/bashrc
```bash=
$ sudo nano /etc/bashrc
```
- 修改內容: `PS1="[\u@\h\w]\\$"`
  * `\u`: 目前登入帳戶
  * `\h`: 目前的主機名
  * `\$` & `\#` : 輸出命令行`$`&`#`
  * `\w` &`\W`: 輸出目前路徑
    * `\w`: 最後路徑
    * `\W`: 絕対路徑

### 2-2 讓設定立即生效
```bash=
$ source /etc/bashrc 
```

## 03 安裝rpm套件
```
# rpm -ivh [rpm檔案]
```

## 04 OpenSSL&HTTPS服務

### 4-1 安裝
```
# dnf install openssl mod_ssl -y
```

### 4-2 建立金鑰且転成csr檔
1. 建立金鑰
```bash
[root@Linx-10 /etc/httpd]# cd /etc/pki/tls/certs
[root@Linx-10 /etc/pki/tls/certs]# openssl genrsa -out old.key
Generating RSA private key, 2048 bit long modulus (2 primes)
.....................+++++
..........+++++
e is 65537 (0x010001)
```
2. 把金鑰転成csr檔
   * 國家: `Country Name (2 letter code) [XX]:tw`
   * 要啟用的網域: `Common Name (eg, your name or your server's hostname) []:old.sivs2020.edu`

```bash
[root@Linx-10 /etc/pki/tls/certs]# openssl req -new -key old.key -out old.csr
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [XX]:tw
State or Province Name (full name) []:aaa
Locality Name (eg, city) [Default City]:aa
Organization Name (eg, company) [Default Company Ltd]:aa
Organizational Unit Name (eg, section) []:aa
Common Name (eg, your name or your server's hostname) []:old.sivs2020.edu
Email Address []: (直接按enter)

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []: (直接按enter)
An optional company name []: (直接按enter)
[root@Linx-10 /etc/pki/tls/certs]# ls
ca-bundle.crt        linx.cer  linx.key  localhost.crt  old.csr  old.pem
ca-bundle.trust.crt  linx.csr  linx.pem  old.cer        old.key
```

### 4-3 向網域提交https憑証申請
1. 請打開瀏覧器輸入`http://host-xx.sivs2020.edu/certsrv/(網域憑証申請)`
   * 先按下`[要求憑証]`
   * 再按下`[進階憑証要求]`
2. 把転好的csr檔用文字編輯器開啟且提交
  * 檢視輸出的csr檔: `[root@Linx-10]# cat /etc/pki/tls/certs/old.csr`
  * 憑証範本: `[web伺服器]` 
3. 下戴憑証

### 4-4 把憑証申請匯入本地
1. 把憑証申請複制到`/etc/pki/tls/certs`
   ```
    [root@Linx-10 ~/下載]# cp certnew.cer /etc/pki/tls/certs/old.cer
   ```
2. 把憑証申請匯入本地且転成.pem檔
   ```
     [root@Linx-10 /etc/pki/tls/certs]# openssl x509 -inform der -in old.cer -outform pem -out old.pem
   ```

## 05 httpd

### 5-1 http加入驗證機制
#### 5-1-1 建立目錄和網頁
```
$ sudo mkdir /var/www/linx
$ sudo nano /var/www/linx/index.html
```
##### 內容
```htmlembedded=
<html>
<head><title>linx</title>
</head>
<body>this is linx.sivs2020.edu！</body>
</html>
```

#### 5-1-2 設定httpd的虛擬主機対応
```
$ sudo nano /etc/httpd/conf.d/linx.conf
```
##### 內容 
```
<VirtualHost *:443>
   DocumentRoot /var/www/linx
   ServerName   linx.sivs2020.edu
   SSLEngine    on
   SSLCertificateFile     /etc/pki/tls/certs/linx.pem
   SSLCertificateKeyFile  /etc/pki/tls/certs/linx.key
</VirtualHost>

<Directory "/var/www/linx">
   AllowOverride   AuthConfig
   Order   allow,deny
   Allow   from   all
</Directory>
```

#### 5-1-3 建立相關檔案
- 建立保護目錄下的`.htaccess`檔
  ```
    $ cd /var/www/linx
    $ sudo nano .htaccess
      AuthName     "Login"
      Authtype     Basic
      AuthUserFile /var/www/apache.passwd
      require user root
  ```
- 建立密碼檔: `$ sudo htpasswd -c /var/www/apache.passwd root`
- 檢視是否成立: `$ cat /var/www/apache.passwd`
- 請重啟apache httpd: `$ sudo systemctl restart httpd`

### 5-2 http自動導向指定的網址
- 建立目錄和網頁
  ```
    $ sudo mkdir /var/www/old
    $ sudo nano /var/www/old/index.html
  ```

#### 內容 
- `<meta http-equiv="refresh" content="轉跳的時間;url=轉跳的網址" />`
  ```htmlembedded=
    <html>
    <head>
       <title>old</title>
       <meta http-equiv="refresh" content="0;url=https://www.sivs2020.edu">
    </head>
    </html>
  ```

### 5-3 設定httpd的虛擬主機対応
```
$ sudo nano /etc/httpd/conf.d/old.conf
```
#### 內容 
```xml=
<VirtualHost *:443>
   DocumentRoot /var/www/old
   ServerName   old.sivs2020.edu
   SSLEngine    on
   SSLCertificateFile     /etc/pki/tls/certs/old.pem
   SSLCertificateKeyFile  /etc/pki/tls/certs/old.key
</VirtualHost>

<Directory "/var/www/old">
   Options FollowSymLinks
   AllowOverride All
</Directory>
```

<table><tr><td bgcolor=0000FF>
  <font color=white>寫完請重啟apache httpd: `$ sudo systemctl restart httpd`</font>
</td></tr></table>

### 5-4 設置防火牆
```
$ sudo firewall-cmd --add-service=http --permanent
$ sudo firewall-cmd --add-service=https --permanent
$ sudo firewall-cmd --reload
```

## 06 檢視目前SELinux詳細狀態
```bash
[root@Linx-10 /home/user]# sestatus
SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux root directory:         /etc/selinux
Loaded policy name:             targeted
Current mode:                   enforcing
Mode from config file:          enforcing
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Memory protection checking:     actual (secure)
Max kernel policy version:      33
```
* SELinux的預設模式: enforcing

## 07 SAMBA
### 7-1 前置
- 建立目錄
```
[root@Linx-10 ~]# mkdir -p /shared/Feusr
[root@Linx-10 ~]# chcon -t samba_share_t /shared/Feusr
[root@Linx-10 ~]# chgrp FeGroups /shared/Feusr
[root@Linx-10 ~]# chmod g=rwx /shared/Feusr
[root@Linx-10 ~]# chmod o= /shared/Feusr
```
- 安裝samba: `$ sudo dnf install samba samba-client -y`

### 7-2 設置samba.conf
```
[root@Linx-10 ~]# nano /etc/samba/smb.conf
```

#### 7-2-1 存取日誌設置(在[Golobel])
```
[Golobel]
syslog = 0
syslog only = yes
```

#### 7-2-2 啟用dfs功能
```
[global]
        workgroup = SAMBA
        security = user
        netbios name = Linx-xx
        host msdfs = yes

# 新加部分 [Feusr]
[Feusr]
        path = /shared/Feusr
        msdfs root = yes
        valid users = @FeGroups
        read only = no
        browseable = yes
        create mask = 777
        directory mask = 777
        public = yes
```

#### 7-2-3 建立samba使用者(和Linux內建不同)

<table><tr><td bgcolor=0000FF>
  <font color=white>請到Host-XX的"AD使用者和電腦"啟用対応的使用者帳戶</font>
</td></tr></table>

```bash=
u="Feusr"
p="Fedora@2020"

for i in $(seq -f "%02g" 1 1 50)
do
    echo -ne "$p\n$p\n" | smbpasswd -a -s $u$i
done
```

### 7-2-4 啟用samba
```
[root@Linx-10 ~]# systemctl enable --now smb
Created symlink /etc/systemd/system/multi-user.target.wants/smb.service → /usr/lib/systemd/system/smb.service.
[root@Linx-10 ~]# systemctl enable --now nmb
Created symlink /etc/systemd/system/multi-user.target.wants/nmb.service → /usr/lib/systemd/system/nmb.service.
```
### 7-2-5 防火牆和SELinux
```
[root@Linx-10 ~]# sudo firewall-cmd --add-service=samba --permanent
[root@Linx-10 ~]# sudo firewall-cmd --reload
[root@Linx-10 ~]# sudo semanage fcontext --add --type public_content_rw_t "/shared(/.*)?"
[root@Linx-10 ~]# groupadd public_readonly
[root@Linx-10 ~]# groupadd public_readwrite
[root@Linx-10 ~]# getent group public_readonly public_readwrite
```

## 08 iptables(Nftables)防火牆
### 8-1 関閉firewalld
```
[root@Linx-10 ~]# systemctl stop firewalld
[root@Linx-10 ~]# systemctl disable firewalld
[root@Linx-10 ~]# systemctl mask --now firewalld
```
### 8-2 設定iptables-nft清除且輸出目前的規則
#### 清除 
```
[root@Linx-10 ~]# iptables-nft -F
[root@Linx-10 ~]# iptables-nft -X
[root@Linx-10 ~]# iptables-nft -Z
```
#### 輸出目前的規則
```
[root@Linx-10 ~]# iptables-nft -nL
Chain INPUT (policy ACCEPT)
target     prot opt source               destination     

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination   

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination         
```
### 8-3 建立対応的防火牆規則
#### INPUT Chain = DROP
```
[root@Linx-10 ~]# iptables-nft -P INPUT DROP
[root@Linx-10 ~]# iptables-nft -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
```
#### 建立準備開放連線的連結埠
```
[root@Linx-10 ~]# iptables-nft -A INPUT -p tcp --dport 443 -j ACCEPT
[root@Linx-10 ~]# iptables-nft -A INPUT -p tcp --dport 2224 -j ACCEPT
[root@Linx-10 ~]# iptables-nft -A INPUT -p udp --dport 137 -j ACCEPT
[root@Linx-10 ~]# iptables-nft -A INPUT -p udp --dport 138 -j ACCEPT
[root@Linx-10 ~]# iptables-nft -A INPUT -p tcp --dport 139 -j ACCEPT
[root@Linx-10 ~]# iptables-nft -A INPUT -p tcp --dport 445 -j ACCEPT
```
##### 檢視己建立的規則
```
[root@Linx-10 ~]# iptables-nft -nL
Chain INPUT (policy DROP)
target     prot opt source               destination         
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0            state RELATED,ESTABLISHED
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:443
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:2224
ACCEPT     udp  --  0.0.0.0/0            0.0.0.0/0            udp dpt:137
ACCEPT     udp  --  0.0.0.0/0            0.0.0.0/0            udp dpt:138
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:139
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:445

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination         
```
### 8-4 建立規則檔(重開自動套用)
1. 輸出規則檔的內容
```
[root@Linx-10 ~]# nft list ruleset
table ip filter {
	chain INPUT {
		type filter hook input priority filter; policy drop;
		ct state related,established counter packets 16 bytes 1008 accept
		meta l4proto tcp tcp dport 443 counter packets 0 bytes 0 accept
		meta l4proto tcp tcp dport 2224 counter packets 0 bytes 0 accept
		meta l4proto udp udp dport 137 counter packets 0 bytes 0 accept
		meta l4proto udp udp dport 138 counter packets 4 bytes 935 accept
		meta l4proto udp udp dport 139 counter packets 0 bytes 0 accept
		meta l4proto tcp tcp dport 139 counter packets 0 bytes 0 accept
		meta l4proto tcp tcp dport 445 counter packets 0 bytes 0 accept
	}
}
```
2. 請另存成"linx.nft": `[root@Linx-10 ~]# nano /etc/nftables/linx.nft`
3. 在nftables設定檔加入要加戴的規則檔
  ```
   [root@Linx-10 ~]# nano /etc/sysconfig/nftables.conf
   include  "/etc/nftables/linx.nft"
  ```

4. 啟動Nftables且重新啟動
   ```
     [root@Linx-10 ~]# systemctl enable --now nftables
     Created symlink /etc/systemd/system/multi-user.target.wants/nftables.service → /usr/lib/systemd/system/nftables.service.
     [root@Linx-10 ~]# reboot
   ```

## REF
- http://n.sfs.tw/content/index/10747
- http://linux.vbird.org/linux_server/0360apache.php
