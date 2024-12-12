---
title: QMK/VIA固件键盘无需调整Layer实现锁win键
tags:
  - QMK
  - VIA
  - 键盘
  - 外设
  - Nuphy
categories:
  - 技术分享
cover: 'https://s2.loli.net/2024/12/12/I24ZMmvnAEpeUWN.png'
abbrlink: '87210117'
date: 2024-03-03 16:46:00
---


# 前言  
本文假设你已经能够使得viaapp连接上你的设备，如果你刚刚接触QMK/VIA，推荐*风尘小沙弥*大佬的[入门教程](https://zhuanlan.zhihu.com/p/557005056)。



# 问题
笔者目前手持Nuphy Air96 V2，它哪里都好，就是原厂固件竟然没做Fn+win触发锁win键= =，不过貌似很多做了VIA的键盘都没做这个功能，很神奇吧，可能这就是伟大的DIY世界观(。・∀・)ノ。

其实QMK键值是有相关定义的，详见[QMK Firmware- Magic Keyccodes](https://docs.qmk.fm/#/zh-cn/keycodes_magic)。但是截至本文写作时，VIA尚未支持这些键值，只能另寻他法了。
| QK_MAGIC_TOGGLE_GUI | GU_TOGG | Toggles the status of the GUI keys |
| :------------------- | :------- | :---------------------------------- |
| QK_MAGIC_GUI_ON     | GU_ON   | Enable the GUI keys                |
| QK_MAGIC_GUI_OFF    | GU_OFF  | Disable the GUI keys               |

网上搜了搜大伙第一反应都能想到的都是切Layer，但是为了一个锁win键，切Layer有点大材小用了，虽说Nuphy原厂给了8个Layer(,最后我还是在[keychron的博客](https://www.keychron.com/blogs/archived/how-to-lock-the-windows-key-on-a-keychron-qmk-via-keyboard)里看到的相关键值= =。

# 修改Fn层win键的键值

我手里的Nuphy Air96 V2导入json之后默认用到了前五个层，Layer0、1是mac模式下的，Layer2、3是win模式下的，Layer4是额外功能层，1、3层是长按Fn后切换到的层，这里我们要修改win模式下Fn层，也就是Layer3的键值，记得找到自己键盘对应的Layer。  
切换到对应Layer后，选择win键位置，在列表中选择*Special->Any*，然后在弹出的窗口中手动输入16进制的键值`0x5d61`或`0x700b`，按照Keychron的说法，具体哪个键值生效貌似与QMK固件版本有关，笔者生效的是`0x700b`。
![1](https://s2.loli.net/2024/12/12/I24ZMmvnAEpeUWN.png)
![2](https://s2.loli.net/2024/12/12/JSaWzNqcCgV79AY.webp)

如果一切顺利，在Confirm后你的键盘现在应该能够通过Fn+win键锁定win键了。

# 参考资料
- [QMK Firmware- Magic Keyccodes](https://docs.qmk.fm/#/zh-cn/keycodes_magic)
- [How to lock the Windows key on a Keychron QMK/VIA keyboard](https://www.keychron.com/blogs/archived/how-to-lock-the-windows-key-on-a-keychron-qmk-via-keyboard)
- [分享关于使用via实现锁win键功能的方法](https://www.zfrontier.com/app/flow/DrZBMYJBGy5V)
