---
title: LAN-LAN桥接——记一次家庭内网改造
tags:
  - 网络
  - 路由器
categories:
  - 技术分享
cover: 'https://cdn.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/LANWAN1.webp'
abbrlink: b16db021
date: 2020-03-12 00:52:00
---

## 起因 ##
先放一个灵魂草图（
![linghuncaotu][1]



一开始只有一个小米路由器放在整个家的左上角且位置难以改变（买雷军的路由器一开始是冲着刷机后的可玩性去的，可后来家里的米家设备使我打消了这个念头，悲。）信号覆盖感人，2.4Ghz在卧室慢的出奇，5Ghz直接罢工。考虑过电力猫，可两个房间的电力不走一个总线（悲*2），电力猫干扰也很大，最后无奈使用了无线桥接的办法，可无线桥接的延迟和内网隔离很影响设备之间的沟通，要使用打印机都得用U盘烤来烤去= =。

淦！家庭里的内网体验不应该这样！

## 开始折腾 ##
说搞就搞，我爹用魔法（~~指冲击钻~~）给辣个墙开了个洞扯了根网线，当我把线扯到主路由这边来的时候，我傻眼了= =，这主路由就两个LAN口，一个用来接我的PC，另一个接服务器，没地方留给这根跨过千山万水过来的网线= =。

翻箱倒柜找到了很久之前用的腾达路由器，300M带宽，就我的使用场景来看没有任何瓶颈。它有四个LAN口，和主路由串联一下就~~草率的~~解决了LAN口不够的问题。卧室那里还有一个360的路由器（之前做无线桥接的）。一开始这三个路由器是依次LAN-WAN菊花链连法，网络联通是没问题，可这就组了三个局域网，设备没法互相访问，所以这个方案PASS掉。


然后就用了LAN-LAN依次连接的接法，最后的配置如下:


![INTERNET][2]


> **注：下文讲到的次级路由DHCP服务器和路由器IP地址都应该在插入上一级路由的LAN口之前修改完毕，否则在插入网线后连接会定向到主路由而无法访问次级路由的管理页面。**

**LAN-LAN桥接法要注意次级路由的①DHCP服务器全部关闭，所有IP地址由主路由来分配，次级路由变成了彻头彻尾的“交换机”。②次级路由器的IP地址应和主路由属于同一IP网段，例如我的主路由(MI)的IP为*192.168.31.1*，我就把两个次级路由分别改成*192.168.31.2*和*192.168.31.3*。次级路由（Tenda和360）设置如图。↓**

![td][3]

![td][4]

![360][5]

设置没有问题就应该能通过修改后的IP访问每个路由器的后台了。

![san][6]

莫得啥带问题= =开始冲浪（
![i][7]
![is][8]


  [1]: https://cdn.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/LANWAN1.webp
  [2]: https://cdn.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/LANWAN2.webp
  [3]: https://cdn.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/LANWAN3.webp
  [4]: https://cdn.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/LANWAN4.webp
  [5]: https://cdn.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/LANWAN5.webp
  [6]: https://cdn.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/LANWAN6.webp
  [7]: https://cdn.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/LANWAN7.webp
  [8]: https://cdn.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/LANWAN8.webp


