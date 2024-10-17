---
title: Windows-如何在Windows7以上的系統運行16位元以下的老程式
pubDatetime: 2023-09-10 06:22:44
tags:
  - "Windows"
description: ""
---

## 00 緒論

由於萬惡的微軟在Windows 7後拿掉16位元相容性的支持(提升系統本身的安全性)，則需要自行手動啟用/加入相關的支緩，使得一些在`M$-DOS`/`Windows 9x`的老程式(ex: 比較經典的Galagame)可在現代的系統上運行。

<!--more-->

## 01 環境: 32位元(IA-32/x86)

- 需使用元件: NTVDM
  - Windows 內建元件(限32位元)
  - 需管理者權限
- 啟用方式: `DISM`
  - 啟用: `DISM /online /enable-feature /all /featurename:NTVDM`
  - 停用: `DISM /online /disable-feature /featurename:NTVDM`

## 02 環境: 64位元(EM64T/AMD64)

- 需使用元件: OTVDM
  - 相関函式庫: Microsoft Visual C++ Redistributable for Visual Studio 2017 (32-bit)
    - dll: `VCRUNTIME140.dll`
    - [官方戴點](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170)
  - Github Project: https://github.com/otya128/winevdm
    - [官方戴點](https://github.com/otya128/winevdm/releases)
- 安裝方式
  1. 下載並解壓縮
  2. 執行install捷徑安裝元件
  3. 可以開始運行
  <table><tr><td bgcolor=#FFFF00>
    <font color=white> 在運行過程中，部分程式可能報錯或者功能不正常</font>
  </td></tr></table>

## REF

- https://learn.microsoft.com/zh-tw/windows/compatibility/ntvdm-and-16-bit-app-support
- https://www.techbang.com/posts/93475-winevdm-windows-16bit
