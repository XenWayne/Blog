---
title: OpenWRT vsftpd监听公网ip的问题
tags:
  - OpenWRT
  - vsftpd
  - FTP
  - 软路由
  - IPv6
  - bash
categories:
  - 技术分享
cover: 'https://s1.ax1x.com/2022/04/14/L12sW8.png'
abbrlink: 606c9d02
date: 2022-04-14 20:56:00
---

# 问题描述
一个很久之前的问题，因为不是很急就搁置了。在软路由的OpenWRT上用vsftpd搭建FTP服务器，因为我的环境只有IPv6公网ip，还是动态的（淦），所以勾上了vsftpd的ipv6监听，监听地址是 {% label [::] blue %}   ，本来想着和ipv4的 {% label 0.0.0.0 blue %} 一样监听所有来源IP，结果只要通过ipv6访问，它就毫无疑问的会罢工，但是只要我将IPv6的监听地址换为准确的软路由当前公网地址，就又能正常连接了。
![L12sW8.png](https://s1.ax1x.com/2022/04/14/L12sW8.png)
离谱归离谱，想解决倒是简单，我也不深究问题来源，总之想办法让这个监听地址的配置像DDNS一样跟着当前公网IPv6地址变动就行了。脚本改vsftpd配置的过程在OpenWRT伟大的UCI (Unified Configuration Interface，统一配置接口)加持下显得尤为简单，问题集中在轻量化的获取公网IP上。

# 脚本
在查问题的时候看到了CSDN有人做过了类似的shell，看起来用得上，在其基础上小改了一下，原脚本贴在下面。
> [openwrt vsftpd ipv6 地址更新脚本](https://blog.csdn.net/weixin_44148981/article/details/115429974)

```bash
#!/bin/sh
myipv6=$(cat /proc/net/if_inet6)
for var in $myipv6; do
    let i+=1
    if [$i =1 ]; then
        str=${var:0:4}:${var:4:4}:${var:8:4}:${var:12:4}:${var:20:4}:${var:24:4}:${var:28:4}
        o_str=$(uci get vsftpd.@listen[0].ipv6)
        if [$o_str !=$str ]; then
            uci set vsftpd.@listen[0].ipv6=$str
            uci commit
            sleep 1
            /etc/init.d/vsftpd restart
        fi
    fi
done
```

这个脚本是通过读取/proc/net/if_inet6的前28个字符来获取IP地址的，但是网络环境很复杂，文件第一行未必是真正的公网IP，以我的环境来说，最后一行的地址才为我需要的公网地址，所以可以结合实际情况做一点修改。

> 图：/proc/net/if_inet6文件内容
![L120ot.png](https://s1.ax1x.com/2022/04/14/L120ot.png)

另外删除了意义不明的循环，打算用crontab做定时任务。
## 1.通过读取/proc/net/if_inet6文件获取IP
```bash
#!/bin/sh

#[按需]取文件的倒数第一行，获取需要的ipv6地址
myipv6=$(tail /proc/net/if_inet6 -n 1)

#文件中的ip地址无冒号，需要做规范化
var = $myipv6
str=${var:0:4}:${var:4:4}:${var:8:4}:${var:12:4}:${var:20:4}:${var:24:4}:${var:28:4}
o_str=$(uci get vsftpd.@listen[0].ipv6)
#str:获取到的ipv6地址
#o_str:vsftpd当前监听的的ipv6地址
if [ "$o_str" != "$str" ]; then
        uci set vsftpd.@listen[0].ipv6=$str
        uci commit vsftpd
        sleep 1
        /etc/init.d/vsftpd restart #重启vsftpd
fi
```

关于对文件中IP地址的规范化，对于完整长度的IPv6地址，整理结果应当如下:
![L12wdI.png](https://s1.ax1x.com/2022/04/14/L12wdI.png)

该段应根据具体情况修改。


## 2.通过第三方api获取IP
```bash
#!/bin/sh

#从api获取ipv6地址
myipv6=$(curl http://v6.meibu.com/ips.asp)

str=$myipv6
o_str=$(uci get vsftpd.@listen[0].ipv6)
#str:获取到的ipv6地址
#o_str:vsftpd当前监听的的ipv6地址
if [ "$o_str" != "$str" ]; then
        uci set vsftpd.@listen[0].ipv6=$str
        uci commit vsftpd
        sleep 1
        /etc/init.d/vsftpd restart #重启vsftpd
fi
```

这里列举两个返回IPv6地址的API
- http://v6.meibu.com/ips.asp
- https://api-ipv6.ip.sb/ip


# 设置crontab定时任务
找个目录存放脚本，在OpenWRT设置计划任务即可，vsftpd监听地址应当会在脚本运行时自动更新。
![L12DFP.png](https://s1.ax1x.com/2022/04/14/L12DFP.png)
![L12rJf.png](https://s1.ax1x.com/2022/04/14/L12rJf.png)



> 参考文献
> [shell 取文件第 N 行方法 https://blog.51cto.com/u_15127628/4227810](https://blog.51cto.com/u_15127628/4227810)
> [crontab 定时写法整理 https://www.jianshu.com/p/48f18552be04](https://www.jianshu.com/p/48f18552be04)
> [openwrt vsftpd ipv6 地址更新脚本 https://blog.csdn.net/weixin_44148981/article/details/115429974](https://blog.csdn.net/weixin_44148981/article/details/115429974)

