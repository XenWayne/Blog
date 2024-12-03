---
title: 解决EAC反作弊“A debugger has been found running in your system”
abbrlink: da05f60f
date: 2020-02-24 11:33:00
cover: https://cdn.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/EAC1.webp
tags:
    - EAC
    - 反作弊
categories:
    - 游戏
---

## 写在前面 ##
此方法只针对于反作弊启动失败导致游戏无法启动，网银/OD等问题另寻高明。

   进入正题，报错信息长这样↓
![info][1]
   寻找了半天楞是没找到我哪个进程涉及到了debug.
   折腾半天后整合度娘步骤如下：

1.以**管理员权限**打开CMD，运行以下指令：
===============
```cmd
bcdedit /set testsigning off
```
（一般这一步之后即可恢复，如问题依然存在，看第二步↓）


2.win+r启动运行，输入msconfig回车
========================
   切换到“引导”选项卡，选择“高级选项”。
   ![yindao][2]
   取消“调试端口”和“调试”前面的对勾。
   ![tiaoshi][3]

应用保存后重启即可。



本文仅个人经验，不保证对所有人有效，希望对你有帮助。


  [1]: https://cdn.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/EAC1.webp
  [2]: https://cdn.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/EAC2.webp
  [3]: https://cdn.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/EAC3.webp