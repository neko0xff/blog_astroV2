---
title: ARM-如何使用AT32 IDE & AT32 Work Bench來撰寫可編譯的程式
pubDatetime: 2023-04-06
tags:
  - "ARM"
description: ""
---

## 00 前置

> 由於筆者的電腦環境是Arch Linux，所以可能在操作和設置上會有些許的不同

- 使用到的開發板: AT-START-F423 V1.1
  - 其中[官方頁面](https://www.arterychip.com/en/product/AT32F423.jsp)有提供該開發板的相關文件
    - 位置: `AT_START_F423_V1.0.zip/04_Documents/`
- 所需環境
  - AT32 IDE
  - AT32 WorkBench

## 01 AT32 WorkBench-指定腳位

### 1-1 步驟

1. 選擇需生成的MCU型號，再按下<新建>
   ![圖片](https://hackmd.io/_uploads/rklpfChP6.png)
2. 指定所需腳位&標籤
   - 滑鼠左鍵: 指定腳位輸出/輸入部分
   - 滑鼠右鍵: 指定需標記標籤的腳位
     ![圖片](https://hackmd.io/_uploads/BJADQRnwp.png)
3. 指定所需時序 ![圖片](https://hackmd.io/_uploads/Hkd_VChvT.png)
4. 生成程式 _ 4.1: 指定輸出位置&使用的IDE _ 請勾選`重新生成代碼時保留用戶代碼` _
   4.2: 鏈結設置 _ 4.3: 指定使用的固件包 _ 請勾選`復制庫文件到項目資料夾` _ 4.4:
   再按下`確定` ![圖片](https://hackmd.io/_uploads/BywUyy6P6.png)
5. 生成完成時，則會打開提示視窗
   ![圖片](https://hackmd.io/_uploads/SJoye16Pp.png)

## 02 AT32 IDE-撰寫程式

### 2-1 步驟

1. 選擇工作目錄
   - 選擇完成請按下`Launch` ![圖片](https://hackmd.io/_uploads/ByEN_kTDa.png)
2. 選擇`import/Existing Projects into Workspace`
   ![圖片](https://hackmd.io/_uploads/HyBa_kTDp.png)
3. 匯入剛才生成的專案程式
   - 目錄部分: `/[專案]/project/AT32_IDE/`
     ![圖片](https://hackmd.io/_uploads/rJkIYJTDa.png)
4. 即可成功打開專案進行撰寫 ![圖片](https://hackmd.io/_uploads/BJL5hypDp.png)

### 2-2 Tips

- 若你是使用AT-START系列的開發板，請額外加入二個檔案進入專案的對應目錄位置

  - `bsp/at32f423_board.c` => `/[專案]/project/AT32_IDE/`
  - `at32f423_board.h` => `/[專案]/project/inc/`

  > 其中筆者提取了檔案，請向筆者的Github抓取所需的檔案:
  > https://github.com/neko0xff/note_hardware/tree/main/at32_F423/AT-START-F423

- 如果你不想在重新指定腳位後，被自動生成程式(AT32
  WorkBench)覆蓋掉己寫好的程式部分時，則可在官方指定的註解內進行撰寫
  ```c=
  /* add user code begin …... */
      (放置用戶自定義的程式碼)
  /* add user code end ...... */
  ```

## 03 實做結果

- 程式碼:
  https://github.com/neko0xff/note_hardware/tree/main/at32_F423/AT32F423VCT7_LED
- 實做影片: https://www.youtube.com/watch?v=BSLdWruhIpM
  <iframe width="560" height="315" src="https://www.youtube.com/embed/BSLdWruhIpM?si=UwAgNrstewW0GrNd" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## REF

### 官方

- 文件: https://www.arterychip.com/cn/support/index.jsp
  - 相關文件&代號
    - AN0176: `AT32 IDE 快速入门指南`
    - UM0012: `AT32 Work Bench 用户手册`
    - AN0165: `AT32F423入门使用指南`
- 影片
  - [AT32 Work Bench圖形化配置軟體介紹](https://www.youtube.com/watch?v=-25ZQxwkvQ0)
    <iframe width="560" height="315" src="https://www.youtube.com/embed/-25ZQxwkvQ0?si=r11Vk0_313a3Bhne" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### 21ic

- https://bbs.21ic.com/icview-3335672-1-1.html
- https://bbs.21ic.com/icview-3336772-1-1.html
