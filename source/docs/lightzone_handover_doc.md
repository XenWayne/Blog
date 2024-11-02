---
title: LNU_LightZoneV3.2 交接文档 - XenWayne Wu
date: 2024-11-02 21:45:36
---

{% note warning %}
此文档为LNU_LightZoneV3.2 交接文档，仅供接手人员参考。  
在本警告标签移除前均表示此文档处于编写过程中(WIP)。
{% endnote %}

## 阅前须知

- **此文档不包括任何握手密钥、MUA_Union_Key等敏感信息，此类私密信息请确认接手的人员[联系我](/about/#联系方式Contact)获取。**
- 此文档中提及的许多时间点均为大致时间，因为很多事件已经不可考。
- {% label "此文档面向有相关经验的人士，仅提供基本的迁移交接说明，这" default %} {% label "不是" red %}{% label "一篇step-by-step的教程。" default %}
- **作为接手人，我希望你拥有**: 自托管或云服务的服务器资源(理论上不必具备公网IP)、可支配的域名、对搭建web站点、Git仓库、MySQL数据库使用的相关经验、Minecraft服务器管理经验、Frp反代相关知识。
- 理论上这是觅忆视觉MeVisual实际意义上的所剩的最后一个项目，所以转移后我将不再续费LightZone及MeVisual相关域名，所以在你迁移到自己的域名之后请向MUA方面提交相关说明，使其更新文档。
- 文档涉及到的内容可能会有所遗漏，如有未尽事宜还请联系我，本人精力有限，在交接之后恕不提供除未尽事宜说明之外的其他技术支持。
- 联系我拿到文件包后，你可以不按本文介绍的现有技术架构组织服务，但请确保数据平稳迁移，并保留之前相关贡献人员的署名。

## LNU_LightZone概述

觅光之境<ruby>LightZone<rt>/laɪtzoʊn/</rt></ruby> 是一个基于Velocity/PaperSpigot/PurpurMC的群组社区化Minecraft服务器，由[**XenWayne**](/about/#关于我About)最早于2020年底创建并维护。最初用于小规模娱乐活动，经过数十次版本迭代后于2023年底加入中国Minecraft高校联盟（Minecraft University Alliance，简称MUA）的联合大厅项目并转而为辽宁大学Minecraft交流协会提供公益服务。

## 迁移相关事宜

### 相关MySQL数据库迁移


### 服务端迁移

当前停留在Minecraft版本1.21.1，原则上交接前不再有更新。

#### 1.代理端Velocity

#### 2.子服Oriland(PurPur)

#### 3.子服Pixeltale(PurPur)

#### 4.子服Forecus(PurPur)

#### 5.子服Beta(缺省项)

### MUA相关事宜

#### 1.MUA_Union_Key用途

#### 2.接入MUA联合大厅(Frp)


### Web站点迁移

#### 1.LNU_LightZone官网

#### 2.LNU_LightZone皮肤站

#### 3.LNU_LightZone文档站

#### 4.LightZone_API(PHP站点)

#### 5.Bluemap(插件内部Web服务器反代)

### 结束语


<div style="text-align: right;">
今日はいい天気ですね，散歩しましょう : )<br/>
XenWayne Wu
</div>