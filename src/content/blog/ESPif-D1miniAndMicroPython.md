---
title: ESPif-D1 Mini(ESP8266)+MicroPython筆記
pubDatetime: 2023-10-08 11:34:45
tags:
  - "ESPif"
description: ""
---

## 01 安裝Thonny

1. 安裝相関套件

```
   [zangmenhsu@E1304 ~]$ sudo pacman -S tk python-pip
   [zangmenhsu@E1304 ~]$ sudo pip3 install thonny
```

2. 加入用Thonny連結自己板子連結埠的權限

```
  [zangmenhsu@E1304 ~]$ sudo nano /etc/udev/rules.d/70-ttyusb.rules
  KERNEL=="ttyUSB[0-9]*",MODE="0666"
```

3. 請重啟系統

<!--more-->

## 02 手動查找自己的D1 Mini

- Windows: `COM*`
- Linux: `/dev/ttyUSB*`
  ```
   [zangmenhsu@E1304 ~]$ ls -l /dev/tty*
   crw-rw-rw- 1 root tty    5,  0  5月  8 13:29 /dev/tty
   ....
   crw-rw---- 1 root uucp 188,  0  5月  8 13:43 /dev/ttyUSB0 //自己的板子的連結埠
  ```

## 03 使用串列通訊來連結自己板子

### Windows

會比較建議安裝[PuTTY](https://www.putty.org/)

- 使用方式
  1. 選擇`Serial`
  2. 輸入用來連結的通訊埠
  3. 輸入通訊頻率
  4. 再按下`Open`

### Linux

- 相關軟體: screen
  - Arch: `$ sudo pacman -S screen`
  - Debian/Ubuntu: `$sudo apt install screen -y`
  - Fedora: `sudo dnf install screen -y`
- 使用方式: `screen 自己的板子的連結埠 通訊頻率`
  ```
     [zangmenhsu@E1304 ~]$ screen /dev/ttyUSB0 115200
  ```

### 在終端下的動作

- `CTRL-D`: 直接重啟esp8266
- `CTRL-B`: 離開終端模式

## 04 燒錄軔体

### 安裝燒錄工具

```
[zangmenhsu@E1304 ~]$ sudo pip3 install esptool
```

### 燒錄軔体

```
[zangmenhsu@E1304 ~]$ sudo esptool.py --port 連結埠 --baud 115200 write_flash --flash_size=detect -fm dio 0 軔体檔.bin
```

## 05 上伝程式到ESP8266

### 安裝

```
[zangmenhsu@E1304 ~]$ sudo pip3 install adafruit-ampy
```

### 運行

```
[zangmenhsu@E1304 17-3]$ sudo ampy --port (你的板子連結埠) (指令) (檔案)
```

- 相關指令
  - run : 立即運行
  - put : 上伝到板子上
  - ls : 列出板子上的檔案
  - get : 檢視檔案上的內容或下戴到電腦(請在最後加上檔案路徑和檔名)
  - rm : 刪掉板子上的檔案

## Ref

- Getting started with the D1 mini (ESP8266)
  - https://gist.github.com/carljdp/e6a3f5a11edea63c2c14312b534f4e53
- https://github.com/thonny/thonny/issues/511
