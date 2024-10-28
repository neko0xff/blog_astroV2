---
title: rust-如何建置環境和撰寫簡單的Hello World
pubDatetime: 2024-05-16
tags:
  - "Rust-lan"
description: ""
---

rust
是一個著重於高效能和記憶體安全性的開源程式語言，且由Mozilla主導開發整個社群。

<!--more-->

## 緒論

- 先備知識
  - 程式語言: `C/C++`
- 其中可使用的用途
  - 嵌入式系統
    - 其中支援的開發板
      1. stm32
         - https://medium.com/digitalfrontiers/rust-on-a-stm32-microcontroller-90fac16f6342
      2. esp32
         - https://esp-rs.github.io/book/introduction.html
         - https://narukara.github.io/std-training-zh-cn/01_intro.html
  - Web應用程式

## 環境設置

- Linux
  - Arch base: `pacman -S rust`
  - Fedora `dnf install -y rust cargo`
- Windows
  1. 請先安裝[Microsoft C++ Build Tools](https://visualstudio.microsoft.com/zh-hant/visual-cpp-build-tools/)
  2. 到[官方網站](https://www.rust-lang.org/tools/install)下戴安裝工具(rustup)且選擇正確的系統位元版本
  3. 執行安裝工具

## 寫一支Hello World

### 建立`hello.rs`

- 貼士
  - 換行
    1. 使用格式化字串: `print!("\n");`
    2. 輸出: `println!("");`
- 程式

```rust
/*主程式*/
fn main(){
    println!("Hello World!"); // 輸出字串
    println!("User: {}","neko"); //輸出格式化的內容
}
```

### 開始建置

```zsh
# user @ Host-02 in ~/temp [7:18:57] C:1
$ rustc hello.rs

# user @ Host-02 in ~/temp [7:19:42]
$ ./hello
Hello World!
User: neko
```

## REF

- https://www.rust-lang.org/zh-TW/
- https://zh.wikipedia.org/zh-tw/Rust
- https://learn.microsoft.com/zh-tw/windows/dev-environment/rust/setup
