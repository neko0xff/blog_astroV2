---
title: Database-PostgreSQL設置
pubDatetime: 2025-01-11
tags:
  - "Database"
description: ""
---

> 2024-11: 以PostgreSQL 17 為準

## 安裝服務

- Arch: `$ sudo pacman -S postgresql`
- RHEL 9 Like(Rocky&Alma): 使用 PostgreSQL 官方來源庫
  1. 加入來源: `$ sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm`
  2. 安裝: `$ sudo dnf install postgresql17 postgresql17-server`

## 系統設置

1. 開機自啟動服務
   - Arch: `$ sudo systemctl enable postgresql.service`
   - RHEL 9 Like(Rocky&Alma): `$ sudo systemctl enable postgresql-17`
2. 切換至專用使用者: `$ sudo -iu postgres`
3. 初始化資料庫

   ```bash
   [postgres@Host-02 ~]$ initdb -D /var/lib/postgres/data
   資料庫系統的檔案屬於使用者 "postgres"，該使用者也必須擁有伺服器行程。

   資料庫叢集將以區域 "zh_TW.UTF-8" 進行初始化。
   預設資料庫編碼已被設為 "UTF8"。
   initdb: 無法找到適用於區域 "zh_TW.UTF-8" 的文字搜尋配置
   預設文字搜尋配置將被設為 "simple"。

   已停用資料頁檢查。

   修復現有目錄 /var/lib/postgres/data 的權限… ok
   建立子目錄… ok
   選擇動態共享記憶體實作方式… posix
   選擇預設 max_connections … 100
   選擇預設 shared_buffers … 128MB
   選擇預設時區 … Asia/Taipei
   建立組態檔… ok
   執行啟動腳本… ok
   執行啟動後的初始化程序… ok
   同步資料到磁碟… ok

   initdb: 警告: 啟動本機連線的 "trust" 身份驗證
   initdb: 提示: 您可以在下次執行 initdb 時透過編輯 pg_hba.conf 或用選項 -A 或 --auth-local 和 --auth-host 來變更這個設定。

   成功，您現在可以用下列命令啟動資料庫伺服器:

       pg_ctl -D /var/lib/postgres/data -l logfile start
   ```

4. 啟動伺服器
   - Arch: `$ sudo systemctl start postgresql.service`
   - RHEL 9 Like(Rocky&Alma): `$ sudo systemctl start postgresql-17`
5. 因不同發行版而相關設置檔的存放位置不同
   - Arch: `/var/lib/postgres/data/`
     ```bash
     [root@Host-02 user]# cd /var/lib/postgres/data/
     [root@Host-02 data]# ls
     base          pg_dynshmem    pg_logical    pg_replslot   pg_stat      pg_tblspc    pg_wal                postgresql.conf
     global        pg_hba.conf    pg_multixact  pg_serial     pg_stat_tmp  pg_twophase  pg_xact               postmaster.opts
     pg_commit_ts  pg_ident.conf  pg_notify     pg_snapshots  pg_subtrans  PG_VERSION   postgresql.auto.conf  postmaster.pid
     ```
   - RHEL 9 Like(Rocky&Alma): `/var/lib/pgsql/17/data`
     ```bash
     [root@Server02 user]# cd /var/lib/pgsql/17/data
     [root@Server02 data]# ls
     base              pg_hba.conf    pg_serial     pg_twophase           postmaster.opts
     current_logfiles  pg_ident.conf  pg_snapshots  PG_VERSION            postmaster.pid
     global            pg_logical     pg_stat       pg_wal
     log               pg_multixact   pg_stat_tmp   pg_xact
     pg_commit_ts      pg_notify      pg_subtrans   postgresql.auto.conf
     pg_dynshmem       pg_replslot    pg_tblspc     postgresql.conf
     ```

## 配置修改

> 請注意: 進行配置更改後，請重啟服務使配置生效

### 允許遠端連線&加大連線數量

- `postgresql.conf`: 主要配置

  ```bash
  #------------------------------------------------------------------------------
  # CONNECTIONS AND AUTHENTICATION
  #------------------------------------------------------------------------------

  # - Connection Settings -

  listen_addresses = '*'                  # what IP address(es) to listen on;
                                          # comma-separated list of addresses;
                                          # defaults to 'localhost'; use '*' for all
                                          # (change requires restart)
  port = 5432                             # (change requires restart)
  max_connections = 200                   # (change requires restart)

  ```

- `pg_hba.conf`: 指定允許連接哪些主機、它們的驗證方法以及它們可以存取的資料庫

  ```bash
  # listen on a non-local interface via the listen_addresses
  # configuration parameter, or via the -i or -h command line switches.

  # CAUTION: Configuring the system for local "trust" authentication
  # allows any local user to connect as any PostgreSQL user, including
  # the database superuser.  If you do not trust all your local users,
  # use another authentication method.


  # TYPE  DATABASE        USER            ADDRESS                 METHOD

  # "local" is for Unix domain socket connections only
  local   all             all                                     trust
  local   all             user                                    scram-sha-256
  # IPv4 local connections:
  host    all             all             127.0.0.1/32            trust
  # IPv6 local connections:
  host    all             all             ::1/128                 trust
  # Allow replication connections from localhost, by a user with the
  # replication privilege.
  local   replication     all                                     trust
  host    replication     all             127.0.0.1/32            trust
  host    replication     all             ::1/128                 trust
  host    all             all             0.0.0.0/0               scram-sha-256
  ```

### 資料庫連線優化

- `postgresql.conf`: 主要配置
  - 加大快取: `shared_buffers`

```bash
#------------------------------------------------------------------------------
# RESOURCE USAGE (except WAL)
#------------------------------------------------------------------------------

# - Memory -
shared_buffers = 2048MB                 # min 128kB
                                        # (change requires restart)
#huge_pages = try                       # on, off, or try
                                        # (change requires restart)
#huge_page_size = 0                     # zero for system default
                                        # (change requires restart)
temp_buffers = 8MB                     # min 800kB
#max_prepared_transactions = 0          # zero disables the feature
                                        # (change requires restart)
```

- `postgresql.conf`: 主要配置
  - 加大快取: `effective_cache_size`

```bash
# - Planner Cost Constants -

#seq_page_cost = 1.0                    # measured on an arbitrary scale
#random_page_cost = 4.0                 # same scale as above
#cpu_tuple_cost = 0.01                  # same scale as above
#cpu_index_tuple_cost = 0.005           # same scale as above
#cpu_operator_cost = 0.0025             # same scale as above
#parallel_setup_cost = 1000.0   # same scale as above
#parallel_tuple_cost = 0.1              # same scale as above
#min_parallel_table_scan_size = 8MB
#min_parallel_index_scan_size = 512kB
effective_cache_size = 4GB

#jit_above_cost = 100000                # perform JIT compilation if available
                                        # and query more expensive than this;
                                        # -1 disables
#jit_inline_above_cost = 500000         # inline small functions if query is
                                        # more expensive than this; -1 disables
#jit_optimize_above_cost = 500000       # use expensive JIT optimizations if
                                        # query is more expensive than this;
                                        # -1 disables
```

- `postgresql.conf`: 主要配置
  - 最大連線數調大: `max_connections`

```bash
#------------------------------------------------------------------------------
# CONNECTIONS AND AUTHENTICATION
#------------------------------------------------------------------------------

# - Connection Settings -

listen_addresses = '*'          # what IP address(es) to listen on;
                                        # comma-separated list of addresses;
                                        # defaults to 'localhost'; use '*' for all
                                        # (change requires restart)
port = 5432                             # (change requires restart)
max_connections = 200                   # (change requires restart)
```

## 在CLI下連線到本地伺服端

1. 進入終端控制台: `psql`

   ```bash
   # user @ Host-02 in ~ [7:53:06]
   $ sudo -u postgres psql
   [sudo] user 的密碼：
   psql (16.3)
   輸入 "help" 顯示說明。

   postgres=# \conninfo
   已連線至資料庫 "postgres"，使用者 "postgres"，socket "/run/postgresql"，連接埠 "5432"。
   postgres=# \q
   ```

2. 單一SQL指令: `psql -c '[SQL指令]'`
   ```
   # user @ Host-02 in ~ [8:05:01]
   $ sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'YourSecurePassword';"
   [sudo] user 的密碼：
   ALTER ROLE
   ```

## 使用者權限管理

- 建立使用者
  ```sql
  CREATE USER [testuser] WITH ENCRYPTED PASSWORD '[Strong_Password]';
  ```
- 變更密碼
  ```sql
  ALTER USER postgres WITH PASSWORD '[YourSecurePassword]';
  ```
- 指定該使用者資料庫權限
  ```sql
  GRANT ALL PRIVILEGES ON DATABASE [testdb] TO [testuser];
  ```

## 異質資料庫轉換

當想從其它不同類型的資料庫（ex: MariaDB/MySQL , SQLServer）遷移到 PostgreSQL 時，需要進行相關的轉換工程 (即異質資料庫轉換)。

在進行轉換過程中，由於兩者的 SQL 語法和結構的差異，可能會導致轉換過程中出現錯誤。

> 本範例使用 MariaDB / MySQL

- 使用的工具: pgloader
  - Github: [dimitri/pgloader](https://github.com/dimitri/pgloader)
  - docker
  ```bash
   $ docker run --rm -it ghcr.io/dimitri/pgloader \
    pgloader  mysql://[user]:[password]@[server_ip]:3306/[DBname] \
    postgresql://[user]:[password]@[server_ip]:5432/[DBname]
  ```

## 備份&還原管理

- GUI
  - [pgAdmin](https://www.pgadmin.org/)
- CLI
  - 備份: pg_dump
    ```bash
    $ sudo -u postgres pg_dump [dbname] > [dumpfile] | gzip > [dumpfile].sql.gz
    ```
  - 還原: psql
    ```bash
    $ sudo -u postgres psql -c "CREATE DATABASE [dbname]"
    $ sudo gunzip -c [dumpfile].sql.gz | psql -U postgres -d [dbname]
    ```

## REF

- [ArchWiki-PostgreSQL](https://wiki.archlinuxcn.org/wiki/PostgreSQL)
- [Cassius. (2022, June 22). Arch Linux 安装 PostgreSQL 数据库. Cassius’s Blog. ](https://www.yuweihung.com/posts/2022/archlinux-install-postgresql/)
- [布丁. (2012, December 18). PostgreSQL的備份與復原. 布丁布丁吃什麼？.](https://blog.pulipuli.info/2012/12/postgresql.html)
- [III. 系統管理 26. 備份及還原. PostgreSQL 17.2 Documentation.](https://docs.postgresql.tw/server-administration/backup-and-restore)
- [Gmfcd128 . (2022, September 24). 三十天，PG與我-PostgreSQL資料庫備份還原. 2022 IThome 鐵人賽.](https://ithelp.ithome.com.tw/articles/10297869)
- [Wilson, J. (2022, November 4). How to Install PostgreSQL on AlmaLinux 9. Rose Hosting.](https://www.rosehosting.com/blog/how-to-install-postgresql-on-almalinux-9/)
