---
title: ESPif-ESP32-CAM上手&使用方式
pubDatetime: 2023-10-08 11:41:56
tags: 
    - 'ESPif'
description: ""
---

## DataSheet
![](https://i.imgur.com/udwjI57.png)

<!--more-->

## 設置環境

### 所需部分
* Arduino IDE
* ESP32 函式庫

### 匯入函式庫來源
1. 開啟Arduino IDE後，選擇功能表的檔案/偏好設定，開啟偏好設定視窗
2. 在偏好設定視窗中下方的額外開發板管理員輸入以下網址後，按確定。
  ```
      https://dl.espressif.com/dl/package_esp32_index.json
  ```
![](https://i.imgur.com/kS8ghSc.png)

### 下戴函式庫
1. 點選工具/開發板/開發板管理員，即會出現開發板管理員視窗
2. 在開發板管理員視窗中，輸入關鍵字ESP32後，即可篩選出ESP32核心套件
3. 直接點選右側的安裝按鈕，並等候5~10分鐘讓系統下載核心套件並完成安裝，最後再關閉開發板管理員視窗
![](https://i.imgur.com/cbdQd9j.png)

## 檢視是否連結
- Windows(COMx): "裝置管理員/連結埠(`COM*`)"
- Linux/macOS(ttyUSB0): `ls /dev/tty*`
![](https://i.imgur.com/JeDburH.png)

## 燒錄
- 方式:USB転TTL(CH340)串列通訊
  * 連結接點
    1. TX(綠) => `GPIO3`
    2. RX(白) => `GPIO1`
    3. 5V(紅) => `5V`
    4. GND(黑) => `GND`
  ![](https://i.imgur.com/S3IWXKA.png)
- 燒錄模式
  * 進入燒錄模式: `IO0`+`GND`
  * 離開燒錄模式: 把`IO0`或`GND`其中一條拔掉且按下restart 
![](https://i.imgur.com/xXeNRUV.jpg)
- 在Arduino IDE的版子設置
  * Board: “ESP32 Wrover Module”
  * Upload Speed: “921600”
  * Flash Frequency: “80MHz”
  * Partition Scheme: “Huge APP (3MB No OTA/1MB SPIFFS)”
  * Core Debug Level: “None” 

## source
* https://makerpro.cc/2020/06/how-to-install-and-configure-esp32-development-environment/
* https://hackmd.io/@LHB-0222/Blynk_ESP32-Canm
* https://github.com/raphaelbs/esp32-cam-ai-thinker/blob/master/assets/ESP32-CAM_Product_Specification.pdf