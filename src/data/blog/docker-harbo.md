---
title: docker-自架私有映像檔倉庫
pubDatetime: 2025-08-31
tags:
  - "docker"
description: ""
---

## Who

每當開發者開發完成時,需要把打包好的image供於其它環境使用時,就得必須上傳至私有倉庫(push)供以其它人佈署(pull).

本教學會使用VMware所開發的開源image管理平台,進行image管理

- [Github:goharbor/harbor](https://github.com/goharbor/harbor)
  * 測試版本: `v2.13.1`
  * Server OS: Alma Linux 10

## 伺服端: 供存放自建置的映像檔位置服務
### 前置
- 套件
  * docker compose(v2)
- SSL憑証(可自簽)
- 需在防火牆開通訊埠部分
  * HTTP: '8081/tcp'
  * HTTPS: '8443/tcp'
  * Syslog: '1514/tcp'

### 下戴 & 安裝前設置
1. 下戴安裝檔(目前版本)
  ```
  $ curl -s https://api.github.com/repos/goharbor/harbor/releases/latest | grep browser_download_url | cut -d '"' -f 4 | grep '\.tgz$' | wget -i -
  ```
2. 解壓縮剛下戴好的安裝檔(本教學使用offline版本): `$ tar xzvf harbor-offline-installer-[version].tgz`
3. 完成後,您會得到一個目錄,則請把該目錄復制至`/usr/local` 下
   ```
   $ cp -R ./harbor /usr/local
   ```
4. 請到復制好的目錄下: `$ cd /usr/local/harbor`

### 修改相關配置

#### 00 前置
請從範本(`harbor.yml.tmpl`)修改配置(`harbor.yml`)
```
$ cp harbor.yml.tmpl harbor.yml
$ nano harbor.yml
```

#### 01 需修改 `harbor.yml` 部分
- 網路: hostname & HTTP/HTTPS 通訊埠埠號
    ```yaml
    # The IP address or hostname to access admin UI and registry service.
    # DO NOT use localhost or 127.0.0.1, because Harbor needs to be accessed by external clients.
    hostname: [you_ip_address]

    # http related config
    http:
      # port for http, default is 80. If https enabled, this port will redirect to https port
      port: 8081

    # https related config
    https:
      # https port for harbor, default is 443
      port: 8443
      # The path of cert and key files for nginx
      certificate: [your_certificate_path]
      private_key: [your_private_key_path]
      # enable strong ssl ciphers (default: false)
      # strong_ssl_ciphers: false
    ```
- 密碼: 存放 Harbor 設定的 database & 用於 Login 該服務的帳號
    ```yaml
    # Uncomment external_url if you want to enable external proxy
    # And when it enabled the hostname will no longer used
    # external_url: https://reg.mydomain.com:8433

    # The initial password of Harbor admin
    # It only works in first time to install harbor
    # Remember Change the admin password from UI after launching Harbor.
    harbor_admin_password: [you_password]

    # Harbor DB configuration
    database:
      # The password for the user('postgres' by default) of Harbor DB. Change this before any production use.
      password: [you_password]
      # The maximum number of connections in the idle connection pool. If it <=0, no idle connections are retained.
      max_idle_conns: 100
      # The maximum number of open connections to the database. If it <= 0, then there is no limit on the number of open>
      # Note: the default number of connections is 1024 for postgres of harbor.
      max_open_conns: 900
      # The maximum amount of time a connection may be reused. Expired connections may be closed lazily before reuse. If>
      # The value is a duration string. A duration string is a possibly signed sequence of decimal numbers, each with op>
      conn_max_lifetime: 5m
      # The maximum amount of time a connection may be idle. Expired connections may be closed lazily before reuse. If i>
      # The value is a duration string. A duration string is a possibly signed sequence of decimal numbers, each with op>
      conn_max_idle_time: 0
    ```

#### 03 開始配置且初始化環境

當初始化環境時,安裝程式會把剛配置完成`harbor.yml`轉換成供以啟動環境的`docker-compose.yml`,且同時會啟動服務

- 配置管理
    - 指令
      * 服務初始化: `$ ./install.sh --with-trivy`
      * 變更 harbor 的配置: `$ ./prepare --with-trivy`

- 配置過程
```
$ ./prepare
$ ./install.sh --with-trivy
[Step 0]: checking if docker is installed ...

Note: docker version: 28.2.2

[Step 1]: checking docker-compose is installed ...

Note: Docker Compose version v2.36.2

[Step 2]: loading Harbor images ...
Loaded image: goharbor/nginx-photon:v2.13.1
Loaded image: goharbor/registry-photon:v2.13.1
Loaded image: goharbor/trivy-adapter-photon:v2.13.1
Loaded image: goharbor/harbor-db:v2.13.1
Loaded image: goharbor/harbor-registryctl:v2.13.1
Loaded image: goharbor/harbor-exporter:v2.13.1
Loaded image: goharbor/redis-photon:v2.13.1
Loaded image: goharbor/harbor-jobservice:v2.13.1
Loaded image: goharbor/prepare:v2.13.1
Loaded image: goharbor/harbor-portal:v2.13.1
Loaded image: goharbor/harbor-core:v2.13.1
Loaded image: goharbor/harbor-log:v2.13.1


[Step 3]: preparing environment ...

[Step 4]: preparing harbor configs ...
prepare base dir is set to /usr/local/harbor
Clearing the configuration file: /config/portal/nginx.conf
Clearing the configuration file: /config/log/logrotate.conf
Clearing the configuration file: /config/log/rsyslog_docker.conf
Generated configuration file: /config/portal/nginx.conf
Generated configuration file: /config/log/logrotate.conf
Generated configuration file: /config/log/rsyslog_docker.conf
Generated configuration file: /config/nginx/nginx.conf
Generated configuration file: /config/core/env
Generated configuration file: /config/core/app.conf
Generated configuration file: /config/registry/config.yml
Generated configuration file: /config/registryctl/env
Generated configuration file: /config/registryctl/config.yml
Generated configuration file: /config/db/env
Generated configuration file: /config/jobservice/env
Generated configuration file: /config/jobservice/config.yml
copy /data/secret/tls/harbor_internal_ca.crt to shared trust ca dir as name harbor_internal_ca.crt ...
ca file /hostfs/data/secret/tls/harbor_internal_ca.crt is not exist
copy  to shared trust ca dir as name storage_ca_bundle.crt ...
copy None to shared trust ca dir as name redis_tls_ca.crt ...
Generated and saved secret to file: /data/secret/keys/secretkey
Successfully called func: create_root_cert
Generated configuration file: /config/trivy-adapter/env
Generated configuration file: /compose_location/docker-compose.yml
Clean up the input dir


Note: stopping existing Harbor instance ...


[Step 5]: starting Harbor ...
[+] Running 11/11
 ✔ Network harbor_harbor        Created                                                                         0.2s 
 ✔ Container harbor-log         Started                                                                         0.5s 
 ✔ Container redis              Started                                                                         0.9s 
 ✔ Container harbor-db          Started                                                                         0.9s 
 ✔ Container harbor-portal      Started                                                                         1.0s 
 ✔ Container registryctl        Started                                                                         1.1s 
 ✔ Container registry           Started                                                                         0.9s 
 ✔ Container trivy-adapter      Started                                                                         1.2s 
 ✔ Container harbor-core        Started                                                                         1.2s 
 ✔ Container nginx              Started                                                                         1.7s 
 ✔ Container harbor-jobservice  Started                                                                         1.5s 
 ✔ ----Harbor has been installed and started successfully.----
```

### 關於服務相關配置

#### 生命週期

由於 harbor 是用`docker-compose.yml`進行服務管理。所以使用時，您必須了解 docker compose 的指令!

- 相關指令
    - 查看己啟動: `$ docker compose ps`
    - 啟動: `$ docker compose start`
    - 停止: `$ docker compose stop`
    - 刪除相關服務的配置檔&存放於倉庫的image
      ```
        $ docker compose down -v
        $ rm -r /data/database
        $ rm -r /data/registry
      ```

#### 檢視運行記錄

Harbor 在運行時,會把相關 logs 存放至 `/var/log/harbor/` 目錄下。

```
$ ls /var/log/harbor/
core.log        portal.log      proxy.log  registryctl.log  trivy-adapter.log
jobservice.log  postgresql.log  redis.log  registry.lo
```

#### 讓 Systemd 管理相關服務

為了解決 Docker 啟動後 Harbor 無法同步啟動的問題，我們需撰寫一個服務設定檔，並利用 Systemd 進行服務管理，以實現 Harbor 隨系統自動啟動。

1. 請在`/etc/systemd/system` 目錄下建立 `harbor.service` , 且填入如下內容
    ```shell
    [Unit]
    Description=harbor
    After=docker.service systemd-networkd.service systemd-resolved.service
    Requires=docker.service
    Documentation=http://github.com/vmware/harbor

    [Service]
    Type=simple
    Restart=on-failure
    RestartSec=5
    ExecStart=/usr/bin/docker compose -f  /usr/local/harbor/docker-compose.yml up
    ExecStop=/usr/bin/docker compose -f  /usr/local/harbor/docker-compose.yml down

    [Install]
    WantedBy=multi-user.target
    ```
2. 啟用相關服務
    ```shell
    $ sudo systemctl enable --now harbor.service
    $ sudo systemctl daemon-reload
    ```
3. 檢視是否正常啟用
    ```
    $ sudo systemctl status harbor
    ● harbor.service - harbor
         Loaded: loaded (/etc/systemd/system/harbor.service; enabled; preset: disabled)
         Active: active (running) since Fri 2025-08-29 15:49:46 CST; 7s ago
     Invocation: a88566a595cc45f8980b963e6c208637
           Docs: http://github.com/vmware/harbor
       Main PID: 19675 (docker)
          Tasks: 24 (limit: 48791)
         Memory: 28.2M (peak: 32.4M)
            CPU: 233ms
         CGroup: /system.slice/harbor.service
                 ├─19675 /usr/bin/docker compose -f /usr/local/harbor/docker-compose.yml up
                 └─19695 /usr/libexec/docker/cli-plugins/docker-compose compose -f /usr/local/harbor/docker-compose.yml>

     8月 29 15:49:48 SWT-CIserver docker[19695]: harbor-jobservice  | 2025-08-29T07:49:48Z [INFO] [/jobservice/worker/c>
     8月 29 15:49:48 SWT-CIserver docker[19695]: harbor-jobservice  | 2025-08-29T07:49:48Z [INFO] [/jobservice/lcm/cont>
     8月 29 15:49:48 SWT-CIserver docker[19695]: harbor-jobservice  | 2025-08-29T07:49:48Z [INFO] [/jobservice/worker/c>
     8月 29 15:49:48 SWT-CIserver docker[19695]: harbor-jobservice  | 2025-08-29T07:49:48Z [INFO] [/jobservice/sync/sch>
     8月 29 15:49:48 SWT-CIserver docker[19695]: harbor-jobservice  | 2025-08-29T07:49:48Z [INFO] [/jobservice/runtime/>
     8月 29 15:49:48 SWT-CIserver docker[19695]: harbor-jobservice  | 2025-08-29T07:49:48Z [INFO] [/jobservice/sync/sch>
     8月 29 15:49:48 SWT-CIserver docker[19695]: harbor-jobservice  | 2025-08-29T07:49:48Z [INFO] [/jobservice/sync/sch>
     8月 29 15:49:48 SWT-CIserver docker[19695]: harbor-jobservice  | 2025-08-29T07:49:48Z [INFO] [/jobservice/sync/sch>
     8月 29 15:49:53 SWT-CIserver docker[19695]: harbor-jobservice  | 2025-08-29T07:49:53Z [INFO] [/jobservice/worker/c>
     8月 29 15:49:53 SWT-CIserver docker[19695]: harbor-jobservice  | 2025-08-29T07:49:53Z [INFO] [/jobservice/worker/c>
    ```

## 客戶端: 從倉庫拉取/上傳映像檔

### 如何使 docker 允許上傳或下戴未經 SSL 驗証的私有倉庫

由於是自架環境(無相關SSL驗証),必須在 Client 端部分，得手動建立 Docker Engine 的相關配置文件(`/etc/docker/daemon.json`).

1. 請修改: `/etc/docker/daemon.json`
    ```json
    {
       "insecure-registries": [
            "localhost:8081",
            "localhost:8443"
        ]
    }
    ```
2. 修改完成後,請務必重啟系統上的docker服務: `$ sudo systemctl restart docker.service`
3. 測試是否可使用
    ```shell
    $ docker login  192.168.45.51:8081
    Username: swt_dev
    Password: 

    WARNING! Your credentials are stored unencrypted in '/home/user/.docker/config.json'.
    Configure a credential helper to remove this warning. See
    https://docs.docker.com/go/credential-store/

    Login Succeeded
    ```

### Pull/Push Image
- 推送
    1. 登入自行架設的私有倉庫: `$ docker login [server]`
       ```
       $ docker login localhost:8081
       ```
    2. 標記要上傳的image: `$ docker tag [剛建置完成的image名稱] [server]/[專案]/[image name]:[version]`
        ```
        $ docker tag build_frontend-frontend_deno localhost:8081/swt_erp/frontend:1.0.0
        ```
    3. 開始上傳: `$ docker push [server]/[專案]/[image name]:[version]`
        ```
        $ docker push localhost:8081/swt_erp/frontend:latest
        ```

- 拉取
    ```
    $ docker pull 192.168.45.51:8081/swt_erp/frontend:latest
    ```

### 配合 Jenkins 把流程自動化

在試完手動推送後,您可選擇在 Jenkins 內寫 pipeline 腳本來跑自動化程序,把己經建置完成的 image 丟到 Harbor 上.

1. 先新增一個Credential: 用於定義pipeline的環境變數
   * 位置: `[管理Jenkins]` -> `[Credentials]` -> `[System]` -> `[Global credentials (unrestricted)]`
       1. 在`[Stores coped to Jenkins]`部份，找到`[Domains]`欄位，然後按下`[(global)]`
       2. 按下 `[+ Add Credentials]`
       3. 輸入Harbor相關資料
          * username: 對映至`HARBOR_USER`
          * password: 對映至`HARBOR_PSWD`
          * ID: `harbor-user`
2. 開始撰寫pipeline腳本
    ```groovy
        pipeline {
        agent any

        stages {
            stage('Send To Harbor') {
                steps {
                    script {
                        def timestamp = sh(script: "date +%Y%m%d%H%M%S", returnStdout: true).trim()
                        def imageName = "frontend"
                        def imageTag = "${imageName}:${timestamp}"
                        def latestTag = "${imageName}:latest"
                        def registry = "localhost:8081/swt_erp"

                        withCredentials([usernamePassword(credentialsId: 'harbor-user', usernameVariable: 'HARBOR_USER', passwordVariable: 'HARBOR_PSWD')]) {
                            sh(script: """
                                docker login ${registry} -u=\"${HARBOR_USER}\" --password-stdin <<<\"${HARBOR_PSWD}\"
                                docker tag build_frontend-frontend_deno ${registry}/${imageTag}
                                docker tag build_frontend-frontend_deno ${registry}/${latestTag}
                                docker push ${registry}/${imageTag}
                                docker push ${registry}/${latestTag}
                            """, credentials: [
                                usernamePassword(credentialsId: 'harbor-user', usernameVariable: 'HARBOR_USER', passwordVariable: 'HARBOR_PSWD')
                            ])
                        }
                    }
                 }
              }
          }
     }
    ```

## REF
### 不想吃土嗎？就利用開源軟體打造CICD Pipeline吧！
- [Day 19: 安裝Harbor!我的映像檔倉庫!](https://ithelp.ithome.com.tw/articles/10302063)
- [Day 20: Docker映像檔封裝存檔自動化!](https://ithelp.ithome.com.tw/articles/10302538)
### Medium
- [鏡像管理平台 Image Registry Harbor 簡介篇](https://medium.com/@kellenjohn175/%E9%8F%A1%E5%83%8F%E7%AE%A1%E7%90%86%E5%B9%B3%E5%8F%B0-harbor-%E7%B0%A1%E4%BB%8B%E7%AF%87-f9142a7eca22)
- [用 Harbor 架設私有 Docker 倉庫](https://medium.com/starbugs/%E7%94%A8-harbor-%E6%9E%B6%E8%A8%AD%E7%A7%81%E6%9C%89-docker-%E5%80%89%E5%BA%AB-9e7eb2bbf769)
### Harbor Docs
- [Reconfigure Harbor and Manage the Harbor Lifecycle](https://goharbor.io/docs/2.13.0/install-config/reconfigure-manage-lifecycle/)
- [Harbor Installation and Configuration](https://goharbor.io/docs/2.6.0/install-config/)
### Other
- [手把手教你搭建Docker私有仓库Harbor](https://www.cnblogs.com/sowler/p/18242819)
- [how to uninstall harbor with docker on linux? #14715](https://github.com/goharbor/harbor/issues/14715)
- [How to run a docker-compose as a systemd service?-askUbuntu](https://askubuntu.com/questions/1459175/how-to-run-a-docker-compose-as-a-systemd-service)
- [CloudBeesTV-How to Push a Docker Image to Docker Hub Using Jenkins](https://youtu.be/alQQ84M4CYU)
