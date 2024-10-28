---
title: docker-同時建置鏡像檔&容器
pubDatetime: 2023-09-13 12:35:09
tags:
  - "docker"
description: ""
---

## 00 緒論

當寫好用來建置鏡像檔的dockerfile且同時想使用docker-compose來建置整個容器時，則可直接把需要建置的部分寫入到`docker-compose.yml`內部。

<!--more-->

## 01 方法

1. 請把己經寫好的`Dockerfile`加上`.env`的副檔名: `Dockerfile.env`
2. 在`docker-compose.yml`加入相關的設置

```yaml
version: "3"
services:
  container_server:
    restart: always # 跟系統服務一起重啟
    network_mode: host # 網路: 使用實體機
    # 編譯時的設置
    build:
      context: .
      dockerfile: Dockerfile.env
```

3. 則可開始同時建置鏡像檔&容器: `$ docker compose up -d`

## REF

- https://ithelp.ithome.com.tw/articles/10204781
