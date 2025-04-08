---
title: Debian12限制网卡带宽并持久化配置
abbrlink: 838795f3
date: 2025-04-08 12:24:41
tags:
  - Linux
  - Debian
  - 网络
  - Shell
categories:
  - 技术分享
cover: 'https://s2.loli.net/2025/04/08/fqujvLJmTi9rxle.webp'
---

最近想把HomeLab的一些应用搬到一个独立的虚拟机上，觉得有一个独立的IP比Docker要好管理一些。一个需求是要限制这台虚拟机的网卡带宽，避免影响到其他的应用。路由层面的话OpenWrt对IPv6的流控有点费劲；在宿主机上限制的话，我的宿主机是Unraid，这个魔改的QEMU缺少一些环境。最后还是决定在虚拟机上搞定。

本来打算用[wondershaper](https://github.com/magnific0/wondershaper)这个工具，指令写起来比较简单，但是在Debian12上运行有问题，起初以为是apt仓库里的版本太低，又用了源码安装，还是有问题。回头一看这仓库上次commit是四年前😇，那行吧，直接用`tc`命令吧，tc虽然强大，但是语法还是挺冗杂的。

## 确认网卡名

使用`ifconfig`或者`ip addr`命令查看并确认要操作的对应网卡，顺带一提，Debian12应该默认已经不提供`ifconfig`命令了，该工具已被`ip`命令替代。本例使用的网卡名是`ens2`。

## 如有，清理现有规则

```bash
# 清除 ens2 的所有 tc 规则
sudo tc qdisc del dev ens2 root 2>/dev/null
sudo tc qdisc del dev ens2 ingress 2>/dev/null
```

## 添加限速规则

```bash
# 限制 ens2 上行带宽为 50Mbps
tc qdisc add dev ens2 root tbf rate 50mbit burst 32kbit latency 400ms
```

如果要限制下行带宽，将`root`改为`ingress`即可。其中的`burst`是突发流量的大小，`latency`是最大延迟，属于令牌桶过滤器的相关参数，根据网络实际情况调整，这里不做过多解释，具体可以参考[[译] 《Linux 高级路由与流量控制手册（2012）》第九章：用 tc qdisc 管理 Linux 网络带宽](https://arthurchiao.art/blog/lartc-qdisc-zh/)。

执行之后，可以用其他的终端测速工具验证规则是否生效。

## 持久化配置

要持久化无非就是系统启动时自动执行上述命令，可以注册一个服务项。

1. 创建文件`/usr/local/bin/limit_upload.sh`，内容如下：

```bash
#!/bin/bash

# 网卡名称
INTERFACE="ens2"

# 清除现有限速规则
tc qdisc del dev $INTERFACE root 2>/dev/null

# 添加新的限速规则（示例限制上传为 50Mbit带宽）
tc qdisc add dev $INTERFACE root tbf rate 50mbit burst 32kbit latency 400ms
```

2. 创建文件`/etc/systemd/system/limit_upload.service`，内容如下：

```ini
[Unit]
Description=Limit system upload bandwidth
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/limit_upload.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

3. 使服务生效并启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now limit_upload.service 
```

4. 重启系统后，检查服务是否生效：

```bash
tc qdisc show dev ens2
```

如果`tc`命令返回了我们设置的规则，那么就说明服务生效了。

**Reference：**
- [Debian/Ubuntu下使用 WonderShaper 对服务器网卡限速](https://aduan.cc/archives/39/)
- [linux下使用tc(Traffic Control) 流量控制命令模拟网络延迟和丢包](https://www.cnblogs.com/yulia/p/10346339.html)
