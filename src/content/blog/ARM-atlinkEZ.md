---
title: ARM-ATLink_EZ用法
pubDatetime: 2023-04-06
tags:
  - "ARM"
description: ""
---

## 基本規格

- 所使用的MCU型號: AT32F403
  - 編程部分: 在線除錯&燒錄
  - USB to Serial

## LED

- LED狀態燈用法
  - <font color=red>LED1(Red)</font>: 在線操作時的`連結`狀態
  - <font color=green>LED2(Green)</font>: 在線操作時的`運行`狀態
  - <font color=blue>LED3(Blue)</font>: ATLink_EZ和主機端的連線狀態
  - <font color=orange>LED4(Orange)</font>: 電源
- 各項工作的運行狀態
  - 通電時
    | Status | LED1 | LED2 |
    | :--------: | :------------: | :------------: |
    | 通電初始化 | 4個LED全閃一遍 | 4個LED全閃一遍 |
    | 空閒時 | off | off |
  - 使用IDE時
    | Status | LED1 | LED2 |
    | :--------: | :--: | :--: |
    | 操作設置 | on | off |
    | 停止除錯 | on | off |
    | 開始除錯 | on | off |
    | 除錯進行中 | on | off |
  - 使用ICP時
    | Status | LED1 | LED2 |
    | :----: | :--: | :--: |
    | 配置中 | on | off |
  - 在線下戴時
    | Status | LED1 | LED2 |
    | :----: | :------: | :------: |
    | 進行中 | 交替閃爍 | 交替閃爍 |
    | 成功 | off | 慢閃爍 |
    | 失敗 | 快閃爍 | off |

## 使用AT32 IDE進行除錯

### 設置除錯設定檔

1. 請先確認是否選擇且成功打開專案，否則無法進行相關設置
2. 請在`Launch Configurations`的部分，點`New Launch Configurations`
3. 選擇建立的類型後，按下`Next`
   - 3.1: `Mode`(模式)= Run/Debug
   - 3.2: `Configuration Type`= GDB AT-Link Debugging
4. 除錯設置部分(1): 專案和建置設置檔位置
5. 除錯設置部分(2): 確認AT-Link設置&MCU型號
   - 請勾選`WinUSB`&`Allocate Console for AT-Link`
6. 確認無誤請按下`Apply`&`Finish`

當除錯配置設置完成時，就可開始進行二進制檔的編譯建置和燒錄至開發板

## Serial(串口)

- 不同OS的顯示方式
  - Linux: `/dev/ttyACM*`
  - Windows: `COM*`
- 建議的使用工具
  - Windows: [PuTTY](https://www.putty.org/)
  - Linux: [screen](https://linux.die.net/man/1/screen)
    - 指令用法
    ```bash=
    # 請使用管理員權限執行
    port=/dev/ttyACM0 # 位置
    bps=115200 # 通訊時，使用的鮑率
    screen $port $bps
    ```

## REF

### 官方

- 文件: https://www.arterychip.com/cn/support/index.jsp
  - 相關文件&代號
    - UM004: `AT-Link连接器用户手册`
    - AN0176: `AT32 IDE 快速入门指南`

### Other

- https://blog.gtwang.org/linux/screen-command-examples-to-manage-linux-terminals/
