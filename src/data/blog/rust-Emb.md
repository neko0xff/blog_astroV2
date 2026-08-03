---
title: rust-使用rust來開發ARM嵌入式裝置
pubDatetime: 2024-05-16
tags:
  - "Rust-lan"
description: ""
---

## 所需部分

- 一塊支援的開發板
  - 本範例會以Blue Pill為例
    - MCU Part number: `STM32F103C8T6`
    - MCU Architecture: ARM Cotex M3(ARMv7e-m)
      |                        RAM                        | ROM |
      | :-----------------------------------------------: | :-: |
      |                        20K                        | 64K |
      | ![圖片](https://hackmd.io/_uploads/BJ8-ZOnGA.png) |     |
    - 中國版和ST原裝的指令集架構版本可能有所不同,而導致無法進行刷寫
      - 需更動`target/stm32f1x.cfg`內的tag id的部分
        |  版本   |     指令集架構     | tag id(SW-DP) | tag id(JTAG) |
        | :-----: | :----------------: | :-----------: | :----------: |
        | Chinese | ARM Cortex-M3 r2p0 |  0x2ba01477   |  0x0ba00477  |
        |   ST    | ARM Cortex-M3 r1p1 |  0x1ba01477   |  0x3ba00477  |
      - Source: https://0x1.ink/p/66
- 軟體環境
  - OpenOCD
  - GDB
    - gdb-multiarch
    - arm-none-eabi-gdb
  - Rust
    - 安裝相關工具
    ```zsh
    $ rustup target add thumbv6m-none-eabi thumbv7m-none-eabi thumbv7em-none-eabi thumbv7em-none-eabihf
    $ rustup component add llvm-tools-preview
    $ cargo install cargo-binutils cargo-generate cargo-embed
    ```

## 建立專案

### 1 初始化

1. 模板建立
   ```zsh
   $ cargo generate --git https://github.com/rust-embedded/cortex-m-quickstart
   🤷   Project Name: f103c8t6_p1
   🔧   Destination: /home/user/文件/rust/f103c8t6_p1 ...
   🔧   project-name: f103c8t6_p1 ...
   🔧   Generating template ...
   🔧   Moving generated files into: `/home/user/文件/rust/f103c8t6_p1`...
   🔧   Initializing a fresh Git repository
   ✨   Done! New project created /home/user/文件/rust/f103c8t6_p1
   ```
2. 建立完成到目錄
   ```zsh
   $ cd f103c8t6_p1
   ```
3. 加入一些必要功能
   - 安裝工具
     ```zsh
     $ cargo add rtt-target critical-section defmt-rtt
     ```
   - 修改`cargo.toml`
     ```toml
     [dependencies]
     cortex-m = {version="*",features = ["critical-section-single-core"]} # Access to the generic ARM peripherals
     ```

### 2 硬體配置

- MCU的指令集架構: `.cargo/config`
  ```toml
  [build]
  # Pick ONE of these default compilation targets
  # target = "thumbv6m-none-eabi"        # Cortex-M0 and Cortex-M0+
  target = "thumbv7m-none-eabi"          # Cortex-M3
  # target = "thumbv7em-none-eabi"       # Cortex-M4 and Cortex-M7 (no FPU)
  # target = "thumbv7em-none-eabihf"     # Cortex-M4F and Cortex-M7F (with FPU)
  # target = "thumbv8m.base-none-eabi"   # Cortex-M23
  # target = "thumbv8m.main-none-eabi"   # Cortex-M33 (no FPU)
  # target = "thumbv8m.main-none-eabihf" # Cortex-M33 (with FPU)
  ```
- 記憶體大小&起始地址配置: `memory.x`
  ```
  MEMORY
  {
    /* NOTE 1 K = 1 KiBi = 1024 bytes */
    /* TODO Adjust these memory regions to match your device memory layout */
    /* These values correspond to the STM32F103C8T6, one of the few devices QEMU can emulate */
    FLASH : ORIGIN = 0x08000000, LENGTH = 64K
    RAM : ORIGIN = 0x20000000, LENGTH = 20K
  }
  ```
- 函式庫管理: `cargo.toml`

```toml
[package]
authors = ["neko0xff <neko_0xff@protonmail.com>"]
edition = "2021"
readme = "README.md"
name = "f103c8t6_p1"
version = "0.1.0"

[dependencies]
cortex-m = {version="*",features = ["critical-section-single-core"]} # Access to the generic ARM peripherals
cortex-m-rt = "*"               # Startup code for the ARM Core
cortex-m-semihosting = "*"
embedded-hal = "*"              # Access to generic embedded functions (`set_high`)
panic-halt = "*"                # Panic handler
nb = "*"
debouncr = "*"
rtt-target = "*"
critical-section = "*"
defmt-rtt = "*"

[dependencies.stm32f1xx-hal]
version = "*"
features = ["rt", "stm32f103", "medium"]

# this lets you use `cargo fix`!
[[bin]]
name = "f103c8t6_p1"
test = false
bench = false

[profile.release]
codegen-units = 1 # better optimizations
debug = true # symbols are nice and they don't increase the size on Flash
lto = true # better optimizations
```

## 編寫程式

當所有環境和配置都完成後，就可開始撰寫主程式

- 範例功能部分
  - 反覆點亮三顆LED
  - 使用UART1來不停傳送字元'S'&字串'Echo ...'
- 貼士
  - 不使用
    - `#![no_std]`: Rust的標準函式庫
    - `#![no_main]`: Rust提供的main函式當進入點
  - 直接使用
    - `#[entry]`: 直接使用`cortex-m-rt crate`提供的函式當進入點
    - `use panic_halt as _;`: 提供了一個 panic_handler 定義程式的恐慌行為

### 主程式

- '/src/main.rs'

```rust
#![deny(unsafe_code)]
#![no_std]
#![no_main]

use core::fmt::Write;
use panic_halt as _;
use nb::block;
use cortex_m::asm::nop;
use cortex_m_rt::entry;
use stm32f1xx_hal::{
    pac,
    prelude::*,
    timer::Timer,
    serial::{Config, Serial},
};
use rtt_target::{rprintln, rtt_init_print};


#[entry]
fn main() -> ! {
    // Get access to the core peripherals from the cortex-m crate
    let cp = cortex_m::Peripherals::take().unwrap();
    // Get access to the device specific peripherals from the peripheral access crate
    let dp = pac::Peripherals::take().unwrap();

    // Take ownership over the raw flash and rcc devices and convert them into the corresponding
    // HAL structs
    let mut flash = dp.FLASH.constrain();
    let rcc = dp.RCC.constrain();

    // Freeze the configuration of all the clocks in the system and store the frozen frequencies in `clocks`
    let clocks = rcc.cfgr.freeze(&mut flash.acr);
    // Configure the syst timer to trigger an update every second
    let mut timer = Timer::syst(cp.SYST, &clocks).counter_hz();
    timer.start(10.Hz()).unwrap();

    // Acquire the GPIOC peripheral
    let mut gpioa = dp.GPIOA.split();
    let mut gpioc = dp.GPIOC.split();
    let mut afio = dp.AFIO.constrain();

    // Configure gpio C pin 13 & 14 & 15 as a push-pull output.
    // The `crh` register is passed to the function in order to configure the port.
    // For pins 0-7, crl should be passed instead.
    let mut led1 = gpioc.pc13.into_push_pull_output(&mut gpioc.crh);
    let mut led2 = gpioc.pc14.into_push_pull_output(&mut gpioc.crh);
    let mut led3 = gpioc.pc15.into_push_pull_output(&mut gpioc.crh);

    // USART1 on Pins A9 and A10
    let pin_tx1 = gpioa.pa9.into_alternate_push_pull(&mut gpioa.crh);
    let pin_rx1 = gpioa.pa10;
    // Create an interface struct for USART1 with 9600 Baud
    let serial1 = Serial::new(
        dp.USART1,
        (pin_tx1, pin_rx1),
        &mut afio.mapr,
        Config::default()
            .baudrate(9600.bps())
            .parity_none(),
        &clocks,
    );
    let (mut tx1, mut _rx1) = serial1.split(); // Separate into tx and rx channels

    rtt_init_print!();
    rprintln!("RTT Service is String....");
    tx1.write_str("\nUART1 is String....\n").unwrap();
    loop {
        block!(timer.wait()).unwrap();
        rprintln!("Echo ....");
        tx1.write_str("Echo ....\n").unwrap();
        for _ in 0..100_000 {
            nop();
        }
        led1.toggle();
        led2.toggle();
        led3.toggle();
        tx1.write(b'S').unwrap();
        tx1.write(b'\n').unwrap();
    }
}
```

## 編譯

當我們寫完功能需要進行除錯時，則需要進行編譯成該顆MCU支援的二進制檔案。

```
$ cargo build
```

則編譯完成的結果會直接輸出至`f103c8t6_p2/target/thumbv7m-none-eabi/debug/`下

## 刷寫編譯完成的軔體

### 方案1: OpenOCD

- 設置使用OpenOCD時刷寫的裝置類型: `openocd.cfg`
  ```txt
  source [find interface/stlink.cfg]  # 刷寫工具
  source [find target/stm32f1x.cfg]   # MCU型號
  ```
- 開始刷寫
  ```zsh
  $ openocd -s /usr/share/openocd/scripts -f openocd.cfg \
    -c "program target/thumbv7m-none-eabi/debug/f103c8t6_p1 verify reset exit"
  ```

### 方案2: cargo embed

1. 手動刷寫: `$ cargo embed --chip stm32f103c8`
2. 使用設置檔來刷寫
   - 新增`Embed.toml`

     ```toml
       [default.general]
       chip = "STM32F103C8"

       [default.rtt]
       enabled = true

       [default.gdb]
       enabled = false
     ```

   - 開始刷寫: `$cargo embed`

## REF

### 中文

- [cnblogs - linux基于VSCODE使用rust开发stm32开发环境搭建](https://www.cnblogs.com/navysummer-hardware/p/18050540)
- [csdn - 使用 rust 开发 stm32：开发环境搭建](https://blog.csdn.net/niuiic/article/details/113407435)
- [《The Embedded Rust Book》详解](https://blog.creativecc.cn/posts/embedded-rust.html)

### 英文

- [Medium - Rust on an STM32 microcontroller](https://medium.com/digitalfrontiers/rust-on-a-stm32-microcontroller-90fac16f6342)
- [jonathanklimt.de - Rust on STM32: Getting started](https://jonathanklimt.de/electronics/programming/embedded-rust/rust-on-stm32-2/)
- [Youtube - Embedded Rust setup explained](https://www.youtube.com/watch?v=TOAynddiu5M)
  {%youtube TOAynddiu5M %}
