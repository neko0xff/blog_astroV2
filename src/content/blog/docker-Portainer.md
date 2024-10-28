---
title: docker-使用網頁/移動端進行管理docker容器&鏡像
pubDatetime: 2023-09-13 10:33:41
tags:
  - "docker"
description: ""
---

## 00 諸論

使用網頁/移動端管理容器&鏡像，則可增加管理的效率和降低使用者的學習操作成本(提供可視化的圖型操作)，且可方便查看容器內部運行的真實情況(可指定輸出運行過程的記錄檔)。

<!--more-->

## 01 Server

### 1-0 緒論

主要提供使用者管理介面+可監控所有伺服器的docker狀況

- 使用的相關埠號
  - 8000
  - 9000

#### 1-1 指令操作

1. 先建立好一個volume: `$ docker volume create portainer_data`
2. 把指定的image pull下來且開始運行

```
$ docker run -d -p 8000:8000 -p 9000:9000 \
     --name=portainer \
     --restart=always \
     -v /var/run/docker.sock:/var/run/docker.sock \
     -v portainer_data:/data portainer/portainer-ce
```

3. 完成後輸入`localhost:9000`可以進入portainer進行設定使用者的初始設置。

#### 1-2 使用docker-compose進行建置

- docker-compose.yml
  ```yaml=
  version: "3"
  services:
     portainer:
       image: portainer/portainer-ce
       restart: always
     ports:
       - 8000:8000
       - 9000:9000
     volumes:
       - /var/run/docker.sock:/var/run/docker.sock
       - portainer_data:/data
  volumes:
     portainer_data:
       external: false
  ```

### 02 Agent

只能僅能監控該伺服器的docker狀況

- 使用的相關埠號: 9001

#### 2-1 指令操作

1. 把指定的容器pull下來且開始運行

```
$ docker run -d -p 9001:9001 \
  --name portainer_agent \ --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /var/lib/docker/volumes:/var/lib/docker/volumes portainer/agent
```

2. 開啟`localhost:9000`，進入setting>endpoints>new endpoints。
3. 輸入名稱與Agent的URL，預設安裝Agent的port是9001，按下Add endpoint即可

#### 2-2 使用docker-compose進行建置

- docker-compose.yml
  ```yaml=
  version: "3"
  services:
     portainer:
       image: portainer/agent
       restart: always
     ports:
       - 9001:9001
     volumes:
       - /var/run/docker.sock:/var/run/docker.sock
       - /var/lib/docker/volumes:/var/lib/docker/volumes
  ```

## 03 升級至最新版本

1. 停止原本portainer的容器: `$ sudo docker stop portainer`
2. 刪除舊的portainer的image: `$ sudo docker rm portainer`
3. 重新抓取新的portainer的image: `$ docker pull portainer/portainer-ce`
4. 重新部署環境
   ```bash
   $ docker run -d -p 8000:8000 -p 9000:9000 \
        --name=portainer \
        --restart=always \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v portainer_data:/data portainer/portainer-ce
   ```

## 04 提供的的額外部分

- 第三方有提供移動端的部分,可使用手機或平版來管理機器上的Portainer
  - Android: Portarius
    - [Github](https://github.com/zbejas/portarius)
    - [Google Play](https://play.google.com/store/apps/details?id=si.zbe.portarius&pli=1)
    - [IzzyOnDroid](https://apt.izzysoft.de/fdroid/index/apk/si.zbe.portarius)
  - Ios: Harbour
    - [Github](https://github.com/rrroyal/Harbour)
    - [App Store]()

## REF

### Ithome

- https://ithelp.ithome.com.tw/articles/10265048
- https://ithelp.ithome.com.tw/articles/10281045

### Other

- https://www.techmarks.com/docker-updating-portainer/
- https://ivonblog.com/posts/portainer-installation/
