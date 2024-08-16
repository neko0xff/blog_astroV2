---
title: node-MQTT服務和環境
pubDatetime: 2023-10-09 13:22:55
tags:
  - 'node'
description: ""
---

## 00 前置
本文會教使用者用nodejs來建立MQTT所需的環境和功能測試。

- 所需的函式庫
  * Client: [mqtt.js](https://www.npmjs.com/package/mqtt)
    ```bash
      $ npm install mqtt --save
    ```
  * Server: [Aedes](https://www.npmjs.com/package/aedes)
    ```bash
      $ npm install aedes --save
    ```
<!--more-->

## 01 實做部分
### 1-1 Server: MQTT Broker

#### 功能 
- 主要管理己發布和訂閱的訊息
  * 運作方式: 暫時儲存發布者(publisher)的訊息直到下回發布，只要在發布者中斷連線的情況下，就能即時提供訂閱者最近發布的訊息。

#### 程式實作
- `mqttBroker.js`
  ```javascript=
     /*MQTT Broker lib*/
     const aedes = require('aedes')();
     const server = require('net').createServer(aedes.handle);
     const port=3094; # 可自訂通訊埠 

     /*啟動伺服端*/
    server.listen(port, function () {
       console.log('MQTT Server Started!');
       console.log('MQTT Server URL: http://[Server_IP]:'+port);
    });
  ```

### 1-2 Client
- 發布者（Publisher）: 向伺服器發送主題的一方 
  ```javascript=
     var mqtt = require("mqtt")
     var Source="mqtt://localhost:3094"
     var client = mqtt.connect(Source);

     /*連結後,不停發布temp的topic內容*/
     client.on("connect", (e) => {
       console.log("success connect mqtt server");
        setInterval(() => {
           client.publish("temp", "25.6")
           console.log("send it")
        }, 1000);
     });
  ```
- 訂閱者（Subscriber）: 從伺服器獲取主題的一方
  ```javascript=
      var mqtt = require("mqtt");
      var Source= "mqtt://localhost:3094";
      var client = mqtt.connect(Source);

      /*連結後,開始訂閱temp的topic內容*/
      client.on('connect', (e) => {
        console.log("success connect mqtt server");
        client.subscribe('temp', function (err) {
           console.log("subscribe temp topic")
        });
      });

     /* 輸出訂閱的內容*/
     client.on('message', function (topic, message) {
        // message is Buffer
        console.log(topic + ":\t" + message.toString())
     });
  ```

## REF
### CSDN
- https://blog.csdn.net/qczxl520/article/details/115165285
- https://blog.csdn.net/dpjcn1990/article/details/129472214?spm=1001.2101.3001.6650.3&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EYuanLiJiHua%7EPosition-3-129472214-blog-115165285.235%5Ev32%5Epc_relevant_increate_t0_download_v2&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EYuanLiJiHua%7EPosition-3-129472214-blog-115165285.235%5Ev32%5Epc_relevant_increate_t0_download_v2&utm_relevant_index=6

### Other
- https://www.emqx.com/en/blog/how-to-use-mqtt-in-nodejs