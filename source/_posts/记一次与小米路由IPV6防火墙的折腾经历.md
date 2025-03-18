---
title: 记一次与小米路由IPV6防火墙的折腾经历
tags:
  - IPv6
  - 小米路由
categories:
  - 技术分享
cover: https://s2.loli.net/2024/12/12/xEjgdsRoCZ6bkeh.webp
abbrlink: 133a89d9
date: 2020-10-04 11:06:00
---

早些时候新买了台小米的AX1800路由，家里莫得Wifi6设备，纯粹是~~馋那三个月腾讯加速器会员~~，有了IPV6公网IP之后就开始忙活网站迁移之类的问题，结果还没开始就结束了= =，公网死活访问不到内网服务，逛了逛贴吧大佬们也是一样的问题。

闹心.jpg，想了想小米路由的ROM也是基于OpenWRT的，OpenWRT也默认阻止一切IPV6访问，小米路由的ROM大家都懂（，可是这新机子官方还莫得开发板，还是高通的U，大佬们还没搞出能用的包（，去小米社区发了个提案，这件事就告一段落了。

事情在几个月前发生了转机，那天我闲着没事逛逛恩山无线论坛，然后就看见首页排行榜有大佬分享了AX系列路由器官方固件开启SSH的方法。


{% link 官方固件开启SSH方法, 恩山无线论坛, https://www.right.com.cn/forum/forum.php?mod=viewthread&tid=4032490&extra=page%3D1%26filter%3Dtypeid%26typeid%3D44 , new %}


开启SSH之后就简单得多了，用SSH关闭IPV6防火墙就行了，虽然有安全隐患，但是也凑合用（，~~毕竟不会写防火墙配置文件~~


> **附SSH关闭IPV6防火墙命令**
```ssh
ip6tables -F
ip6tables -X
ip6tables -P INPUT ACCEPT
ip6tables -P OUTPUT ACCEPT
ip6tables -P FORWARD ACCEPT
```


这下外网能Ping通了，但是没几天又出幺蛾子——只要路由器一重启，防火墙还是会自己开启。

路由器自身的定时任务不现实，我就想靠服务器的定时任务通过定时SSH连接到路由器并执行相关命令达到定时关闭的效果.

这就又牵扯到一个问题：路由器只支持密钥登录，ssh登录并执行指令这个过程在windows下显得尤为困难。我参考过CSDN的文章[Powershell使用SSH](https://www.cnblogs.com/hengwei/p/7866657.html)，使用其中的SSHSessions模块，在invoke-sshcommand的模式实现命令，从而在登录指令中插入关闭防火墙的指令。但是莫名其妙老报错找不到目标设备，~~估计是玄学问题吧~~，这个方案也不得不放弃。

最后还是熟悉的老朋友——老牌SSH工具PuTTY解决了问题，PuTTY在命令行中的"plink"指令可完美在行中执行命令.下面是我写好的使用"plink"的脚本.

```cmd
@echo off
echo 干翻路由ipv6防火墙_自动化脚本@森稳XenWayne
echo 需要PuTTY前置环境
plink root@192.168.1.1 -batch -pw admin "ip6tables -F"
plink root@192.168.1.1 -batch -pw admin "ip6tables -X"
plink root@192.168.1.1 -batch -pw admin "ip6tables -P INPUT ACCEPT"
plink root@192.168.1.1 -batch -pw admin "ip6tables -P OUTPUT ACCEPT"
plink root@192.168.1.1 -batch -pw admin "ip6tables -P FORWARD ACCEPT"
echo 执行完毕.
TIMEOUT /T 5
exit
```
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;最后，在windows下设置相关计划任务，这样路由就可以放心重启了（

![img][2]


----------

[2020/10/6更新]
感谢恩山论坛大佬@luffyz0rr0提供的解决方案，我是不会去改动了，现方案凑合能用（，贴出来给有需要的朋友。
1. 在 /etc/config/firewall 加入：
```
config include
        option path '/etc/firewall.user'
```


2. 在 /etc/firewall.user 加入：
```
ip6tables -F
ip6tables -X
ip6tables -P INPUT ACCEPT
ip6tables -P OUTPUT ACCEPT
ip6tables -P FORWARD ACCEPT
```


※第二条中 ip6tables -I forwarding_rule 也能加入 /etc/firewall.user
从而自定义开放端口。
{% link "[AX3600] AX3600开启IPV6外网访问的一些疑惑求解", 恩山无线论坛, https://www.right.com.cn/forum/forum.php?mod=viewthread&tid=4053486&extra=page%3D1%26filter%3Dtypeid%26typeid%3D44 , new %}


----------


[20210717更新]
&emsp;&emsp;听朋友说AX6000和AX3600的最新固件，在ipv6 native模式下已经是默认关闭防火墙的状态了，喜。(虽然我已经搭软路由了.jpg)

[20210922更新]
&emsp;&emsp;又拿到一台红米AX3000，后台已经添加了全局IPv6防火墙开关。


[2]: https://s2.loli.net/2024/12/12/xEjgdsRoCZ6bkeh.webp