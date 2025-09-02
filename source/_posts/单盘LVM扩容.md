---
title: 单盘LVM扩容
tags:
  - LVM
  - Linux
  - 系统管理
categories:
  - 技术分享
cover: 'https://oss.xenwayne.top/img/2025/08/4ea916bce6500e98a17a0d6662728b1f.webp'
abbrlink: 2eca1925
---

## 场景
虚拟机为了仿照服务器场景，用默认的LVM配置安装了RockyLinux，在后期测试过程中需要扩容空间，因为虚拟机硬盘动态可调，所以不打算使用新挂载硬盘的方式，而是直接扩容物理卷。



