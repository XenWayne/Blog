---
title: HomeLab - OpenWrt DHCPv6小记与防火墙最佳实践
abbrlink: 676ecf57
date: 2025-03-18 02:58:09
tags: [网络, IPv6, OpenWrt, DHCPv6, 防火墙]
---

春节回去把家里的软路由换上了OpenWrt 24.10，感觉现在OpenWrt对IPv6的支持已经非常完善了，顺便完善一下网关层面的防火墙。 

拨号之后看到运营商分配了一个/60的<ruby>前缀<rt>PD</rt></ruby>，动态静态没太在意，反正下面设备都有DDNS。问题是IPv6的防火墙，IPv4的话因为有NAT，指向内网的固定IP就好了，IPv6的话设备动态IP就不太好办了，初步思路是匹配固定的后缀。

## IPv6地址结构

典型的可聚合全球单播地址结构如下：


{% mermaid %}
%%{
  init: {
    "logLevel": "info",
    "packet": {
      "bitsPerRow": 128,
      "bitWidth": 7
    }
  }
}%%

packet-beta
0-2: "001"
3-47: "Global Routing Prefix"
48-63: "Subnet ID"
64-127: "Interface ID"
{% endmermaid %}

实际上作为终端用户，我们只需要关注后缀部分，假设我从运营商那里得到的前缀为`240e:3c11:5665:1df0::/60`，则我们的地址结构如下：

{% mermaid %}
%%{
  init: {
    "logLevel": "info",
    "packet": {
      "bitsPerRow": 128,
      "bitWidth": 7
    }
  }
}%%

packet-beta
0-59: "240e:3c11:5665:1df0"
60-63: "Sub"
64-127: "Interface ID"
{% endmermaid %}

除了接口后缀的64位，和运营商固定的60位前缀外，中间还有4bit，可以用来划分子网，不过家庭场景没什么需求，就全部置0，整个作为/64的前缀就好。当然，也可以把需要公网服务的设备单独划一个子网，并对这个子网应用一些特殊的防火墙规则。

## IPv6地址分配

### SLAAC

SLAAC即Stateless Address Autoconfiguration，无状态自动配置，是一种自动配置机制。顾名思义，SLAAC不需要DHCP服务器分配地址，其工作原理是：路由器在网络上广播RA（Router Advertisement）包，RA包中包含了网络的前缀信息，设备收到RA包后，`根据前缀信息自动配置IPv6地址`。

上文中`根据前缀信息自动配置IPv6地址`，即设备自己生成`Interface ID`，然后和RA通告中的前缀拼接为完整地址，这样的好处是显而易见的 —— 有效减少DHCP服务器的压力，路由只需要广播RA消息，而不需要监听每个设备的地址分配请求。

不考虑临时地址，对于`Interface ID`的生成，有两种规范：

1. [​EUI-64](https://standards.ieee.org/wp-content/uploads/import/documents/tutorials/eui.pdf) 规范: 
使用 ​EUI-64 算法生成接口标识符（IID）。具体步骤如下：
- 将设备的48位MAC地址拆分为两部分：前24位（OUI）和后24位（设备标识）。
- 在中间插入固定的16位值 FFFE。
- 将第7位（从左到右）反转（称为“U/L位”），以表示该地址是本地管理的。
例如，MAC地址 `00:1A:2B:3C:4D:5E` 转换为EUI-64格式为 `021A:2BFF:FE3C:4D5E`。

2. [RFC-7217](https://www.rfc-editor.org/rfc/rfc7217) 随机化接口标识符 
在某些实现中，SLAAC可能使用 ​RFC 7217 定义的随机化接口标识符生成方法。这种方法通过哈希函数结合网络前缀、秘密密钥和其他参数，生成稳定但隐私友好的接口标识符。

对于随机化，一些平台可能会有自己独立的实现。

### DHCPv6

说到DHCPv6，你可能听到过它有状态和无状态的区别:
- **有状态**：通过 DHCPv6 分配 IP。
- **无状态**：IP 依然采用 SLAAC 生成，但其他参数例如 DNS，网关地址等则通过 DHCPv6 获取。

{% note default %}
题外话，Android 貌似对支持有状态DHCPv6持反对态度，或许是历史遗留问题，又或许是因为Google认为这有悖它的“隐私保护策略”。
{% endnote %}


## OpenWrt 接口配置

考虑到灵活性和最大兼容性，我这里同时使用SLAAC和有状态的DHCPv6，对于需要公网访问的设备，索性用DHCPv6设置一个租期为`Infinity`的静态后缀，这样就可以在防火墙中直接匹配了。

首先OpenWrt版本要够新，早期版本的OpenWrt在RA通告这块的设置有点令人迷惑。这里我省略WAN侧拨号相关的配置，要实现这个配置，具体过程为:

1. 网络 -> 接口 -> LAN -> 编辑 -> 高级设置
   - **委托 IPv6 前缀**：决定到下级设备能否获得前缀（不影响 IPv6 地址本身的分配），可以勾上。
   - **IPv6 分配长度**：启用委托前缀时决定分配的前缀长度，划分多个子网时需要，可以填 64 或保持默认。
   - **IPv6 分配提示**：保持默认或者填0000(/60后加四位补全/64前缀)，划分子网时可选用。
   - **IPv6 后缀**：设置当前接口的 IPv6 地址后缀，仅为该路由接口的后缀，和下游设备无关，为了简洁可以填写 ::1，留空的话这也是OpenWrt的默认行为。
  
2. 网络 -> 接口 -> LAN -> 编辑 -> DHCP服务器 -> IPv6设置
    - **指定的主接口**：不勾选
    - **RA 服务**：服务器模式
    - **DHCPv6 服务**：服务器模式
    - **本地 IPV6 DNS 服务器**：勾选
    - **NDP 代理**：禁用

3. 网络 -> 接口 -> LAN -> 编辑 -> DHCP服务器 -> IPv6 RA设置
   - **默认路由器**：自动
   - **启用 SLAAC**：勾选
   - **RA 标记**：受管配置+其他配置，前者通告有状态DHCPv6可用，后者通告其他配置如DNS服务器。


## OpenWrt DHCPv6 静态分配

在IPv4的DHCP静态分配中，我们可以指定设备的MAC地址和IP地址的对应关系，在DHCPv6，我们通常指定DUID（DHCP Unique Identifier）和IP地址的对应关系。DUID是一个由客户端生成的唯一标识符，用于标识客户端，可以在路由器侧的DHCP界面查看，也可以在客户端用查看(例如Windows使用`ipconfig /all`)。

DUID在生成后，理论上只要硬件上没有变化，DUID就不会变化，但是有些设备可能会在每次重启时生成新的DUID，如果他是`LLT`类型的DUID（基于MAC地址和时间戳），那么每次生成的DUID都会有几个bit位不同，比如笔者的`unraid`服务器，令人头大😵‍💫，这种情况我要么手动指定DUID(Windows改注册表、Linux可以改dhcp client配置)，要么配防火墙的时候直接就用它SLAAC的地址后缀算了😵.

在OpenWrt中，我们可以在`网络 -> DHCP/DNS -> 静态地址分配`中指定DUID和对应后缀的对应关系，这里的IPv6后缀用无冒号的16进制填写，共`64/4=16`位，例如`0000000000000ef1`。

> 需要强调的是，后缀无论是使用 DHCPv6 还是 SLAAC（使用 EUI64和部分随机化实现），理论上生成后只要设备MAC地址等相关信息不变，生成的后缀就不会变化。我这里只是为了方便在路由中心化管理地址。


## OpenWrt 防火墙配置

有了固定的后缀，我们就可以在防火墙规则中直接匹配了，在匹配目标地址时写法如下：

```
::aaaa:bbbb:cccc:dddd/-64
```

其中`-64`表示匹配后64位，即匹配后缀。当然我们在DHCP静态分配中都能自定义后缀了，不如分配地址的时候就用零压缩定义的更简短些，例如`::ef1/64`，一个放行目标地址的Web服务的防火墙规则示例如下：

![OpenWrt 防火墙规则](https://s2.loli.net/2025/03/18/VE9rMw2vHmpob6X.webp)


## Reference
- [IPV6 DHCPv6-PD 前缀子网简单拆解](https://zhuanlan.zhihu.com/p/362151770)
- [OpenWrt 开启 IPv6 公网访问全指南](https://chenhe.me/post/openwrt-config-ipv6-public-access)
- [FIT AP V200R010C00 命令参考](https://support.huawei.com/enterprise/zh/doc/EDOC1100064380/7c01d809)