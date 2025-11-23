---
title: 使用GrafanaCtl批量备份Grafana仪表盘
categories:
  - 技术分享
tags:
  - Grafana
  - 备份
  - 自动化
  - 可观测性
cover: 'https://oss.xenwayne.top/img/2025/11/8a36a651ddcef47e75072ab514e820b3.webp'
abbrlink: c3b0cefb
date: 2025-11-23 18:23:48
---

## Foreword

最近陆陆续续写了一堆Grafana仪表板，因为里里外外涉及很多次仪表板的修改，有时候可能还需要回滚之类的操作，WebUI上面一个一个导出仪表板太麻烦，于是想着找个能批量备份仪表板的方法。  

我最先想到的是Grafana的API应该有相关的接口能调，顺着这个思路找到个[grafana-backup-tool](https://github.com/ysde/grafana-backup-tool),但是看起来有年头没维护了，而且看issues貌似`Does not work with Grafana v12`，就没继续看了，顺带发现了一个Grafana官方的项目[Grizzly](https://github.com/grafana/grizzly)，打眼一看仓库顶上一个大大的Archived，说明该项目将被`grafanactl`取代：

{% link "Grafana CLI" , https://github.com/grafana/grafanactl , "https://github.com/grafana/grafanactl", new %}

{% note primary %}
截至目前，`grafanactl`是一个仍在开发中的命令行工具，且仅适用于Grafana 12及更高版本。
{% endnote %}


## Installation

`grafanactl`的release本身就是一个单二进制文件，对应操作系统直接可以运行。为了方便点建议找个目录给他，加上环境变量。


## Configuration

`grafanactl`支持通过环境变量和配置文件。环境变量只能描述单个上下文，一般是CI/CD环境下用，配置文件可以描述多个上下文，适合本地使用，尤其是你要管理多个Grafana实例的时候。  

定义上，一个上下文(`context`)对应一个Grafana实例，默认上下文名称是`default`。
我们就直接使用默认上下文了，默认应该存放在用户目录下，你可以使用`grafanactl config check`来查看当前配置文件路径。

```shell
⚡XenWayne ❯❯ grafanactl config check
✔ Configuration file: C:\Users\XenWayne\AppData\Local\grafanactl\config.yaml
```

像git一样，除了直接编辑配置文件外，你可以通过`grafanactl config set <key> <value>`来修改配置文件。
你需要提前给grafanactl创建一个服务账户，并创建token，考虑到grafanactl可以实现备份和恢复，这个服务账户可以有读写权限。

```shell
# 对于自部署的Grafana OSS/Enterprise，设置org-id，如果你没有多租户场景，一般是1
grafanactl config set contexts.default.grafana.org-id 1
grafanactl config set contexts.default.grafana.server http://localhost:3000
grafanactl config set contexts.default.grafana.token service-account-token
```

你可以直接修改上述的`contexts.default`，例如`contexts.my-grafana`来编辑一个新的上下文，可以通过`grafanactl config list-contexts`查看当前所有可用的上下文。

```shell
⚡XenWayne ❯❯ grafanactl config list-contexts
CURRENT  NAME        GRAFANA SERVER
         default     http://localhost:3000
*        my-grafana  http://10.10.10.10:3000
```

使用`grafanactl config use-context staging`来切换当前上下文。


## Backup Dashboards

准备一个目录，例如`/tmp/dashboards`。

```shell
grafanactl resources pull --path /tmp/dashboards
# 默认导出为JSON，如果你想导出为YAML，可以加上-o yaml参数:
grafanactl resources pull --path /tmp/dashboards -o yaml
```

就像远端仓库一样，你可以把本地的文件推送到Grafana实例：

```shell
grafanactl resources push --path /tmp/dashboards
```

## Tips

做完一切感觉少点什么，哦对，**版本控制**！  
每次`grafanactl resources pull`之后如果没有额外备份可就覆盖旧版本了，但这个问题很容易想到解决方案——在备份导出的文件夹里直接`git init`建个git仓库就好了😆，这样每次备份时候的操作就是:

```shell
grafanactl resources pull --path /tmp/dashboards
cd /tmp/dashboards
git add .
git commit -m "backup $(date)"
# 如果有远端仓库还能顺便push做个远端备份
git push
```

## Reference
{% link "Grafana CLI","Grafana CLI is a command-line tool designed to simplify interaction with Grafana instances", "https://grafana.github.io/grafanactl/" , new %}

