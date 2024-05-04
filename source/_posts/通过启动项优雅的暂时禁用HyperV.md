---
title: 通过启动项优雅的暂时禁用HyperV
tags:
  - Windows
  - HyperV
  - Win11
categories:
  - 技术分享
cover: 'https://s1.ax1x.com/2022/08/16/v0rcxf.png'
abbrlink: 7834b51
date: 2022-08-16 19:57:00
---


# 前言
折腾这个是因为让我又爱又恨的Windows11， 一方面WSL、WSA安卓子系统等基于HyperV引擎的功能确实很方便，另一方面作为一个~~苦逼~~网工人，ensp、eveng模拟器又不得不让我使用VMware和VirtualBox，众所周知HyperV和他们两位水土不服（VMware还好，只是不能开硬件虚拟化）。而模拟器什么的也不是每天都用，所以我需要一个能方便切换的暂时关闭HyperV的方法。

# 在启动项上做文章
## 1.镜像一份当前的启动项配置
>PS:这里的命令仅作参考 本质上是修改BCD引导项，使用easybcd等工具修改也可。另外Powershell以及WindowsTerminal与CMD语法有些许出入，可能需要将{XXXXX}内容外用引号``""``括起来。

管理员运行
```
bcdedit /copy {current} /d "Windows No HyperV"
```
此处"Windows No HyperV"为启动项的自定义名称，~~你甚至能输中文，虽然我不建议你这么干~~。

之后会提示已经创建了一个启动项，并返回一串ID，我们复制``{}``中的内容。

## 2.设置新启动项关闭HyperV驱动加载
管理员运行
```
bcdedit /set {XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX} hypervisorlaunchtype OFF
```

其中``XXXX``使用上述ID替换。

上述步骤完成后，应该有类似以下两项启动项:
![v0rcxf.png](https://s1.ax1x.com/2022/08/16/v0rcxf.png)
## 3.检查启动项，设置等待时间
Win+R运行msconfig，进入"引导"选项卡，你可以看到刚刚修改的启动项出现在引导项中，在此处你可以修改在进入默认OS前给予选择启动项多长的等待时间，当然也可以把NoHyperV的启动项设为默认值，然后重启看效果。
![v0r6RP.png](https://s1.ax1x.com/2022/08/16/v0r6RP.png)
![v0ryGt.jpg](https://s1.ax1x.com/2022/08/16/v0ryGt.jpg)

大功告成。

2022/09/22 Update:
今天更了一下Windows11 22H2
不是很清楚微软在更新过程干了什么
总之就是第二启动项被WindowsBootManager搞了个残废
删掉启动项重新走一遍流程就好了 = =


>Reference:
>
>https://www.cnblogs.com/Ray898/p/8455393.html