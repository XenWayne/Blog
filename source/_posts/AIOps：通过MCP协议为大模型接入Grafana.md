---
title: ​AIOps：通过MCP协议为LLM接入Grafana
tags:
  - AIOps
  - Grafana
  - MCP
  - 大模型
  - LLM
categories:
  - 技术分享
cover: 'https://oss.xenwayne.top/img/2025/10/a5b07e1632a094ffd243a1ff3de95bf9.webp'
abbrlink: d83bdeb5
date: 2025-10-29 10:00:00
---

## 引言

Grafana作为广泛使用的监控可视化平台，积累了海量的运维数据。通过模型上下文协议（MCP）​，我们可以将大语言模型接入，构建出能够自行构建查询、理解并分析运维数据的智能体。这种结合的核心价值在于：LLM可以自然语言交互的方式，让运维人员直接对话监控数据，无需编写复杂的查询语句，降低运维分析门槛。更进一步，还可以结合告警信息建立相关工作流，例如根据故障内容将工单路由到更精确的团队，将L1的简单问题出具方案结合自动化运维工具，人工审批后自动化处理等。

### MCP协议简介

MCP（Model Context Protocol）模型上下文协议，是一种用于构建模型和数据之间的上下文和关系的协议，它允许模型和数据之间进行交互，并使用模型进行推理。MCP协议定义了模型和数据之间的交互方式，以及如何使用模型进行推理。智能体通过其所在的MCP客户端，在初始化阶段向MCP服务器发起请求，服务器则按照MCP协议的标准格式返回其提供的所有工具的元数据。其中包括工具的名称、描述、输入参数和输出结果等信息。

简而言之，MCP Server可以看作是一个中间件，他将目标服务的若干API或聚合或单独的封装为MCP Tool，并同时向LLM解释每个Tool的功能和使用方法。LLM通过调用这些Tool完成这些目标服务的相关操作，实现和外部世界的交互。

例为一个典型的`tools/list`请求返回结果：
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "maps_weather",
        "description": "查询指定城市的实时天气数据",
        "inputSchema": {
          "type": "object",
          "properties": {
            "city": {
              "type": "string"
            }
          },
          "required": ["city"]
        }
      }
    ]
  }
}
```

当智能体收到这个工具列表后，它会：
1.​解析与集成​：将每个工具的name和description集成到其当前的决策上下文中。
2.​意图匹配​：当用户提出问题时，AI会将用户意图与所有工具的description进行匹配。
3.​参数提取​：如果找到合适的工具，AI会根据inputSchema从用户问题中提取或推断出必要的参数。
4.​发起调用​：最终，AI会通过MCP客户端向服务器发送一个tools/call请求，其中包含选定的工具name和生成的参数。 

AI不需要预先学习或编码这些工具，而是通过这张标准化的“菜单”实现按需调用，但对一个智能体来说，不应同时接入太多相近的工具，否则会导致意图匹配的混淆，同时也额外占用上下文长度。这就是为什么会出现[RAG-MCP](https://arxiv.org/abs/2505.03275)和[MCP-Zero](https://github.com/xfey/MCP-Zero)这种通过分层语义路由等技术路线来解决Prompt膨胀问题的项目，当然，这不在本文讨论范围内。


### 为什么是Grafana？

Grafana作为一个开源的监控可视化平台，广泛应用于各类IT基础设施和应用的监控。它支持多种数据源（如Prometheus、InfluxDB、Elasticsearch等），并提供强大的可视化和告警功能。正因Grafana作为最终的可视化终端，他几乎汇集了全部的指标数据和告警信息，是运维数据的集中展示平台，因此选择Grafana作为MCP协议接入的目标服务，能够最大化地利用现有的监控数据和告警机制。

且Grafana的Dashboard元信息，即我们创建仪表盘时所填写的描述信息、与之相关的查询语句，是我们最常用、最关心的运维指标，这些信息本身就能够辅助LLM理解监控数据的含义，提升智能体构建查询调用的准确性。  

退一步讲，对于大部分轻量级场景来说，其实Grafana也就接了唯一的Prometheus数据源，Grafana官方的[mcp-grafana](https://github.com/grafana/mcp-grafana)本身就提供了对Prometheus的查询能力，这使得智能体接入Grafana后，实际上也就间接获得了对Prometheus的查询能力，而无需对Prometheus额外构建MCP Server，较为适合大部分常见的查询场景。


## 准备工作

### 创建Grafana服务账户
要让MCP服务器能够访问Grafana API，首先需要在Grafana中创建一个服务账户，一般给只读角色Viewer即可。
> 首页 > 管理 > 用户和访问权限 > 服务账户 > 添加服务账户  

![grafana服务账户](https://oss.xenwayne.top/img/2025/10/97351e70bfe1a03cc5dc207d9a73d622.webp)

### 创建Token
创建服务账户后，需要为该账户生成一个API Token，用于MCP服务器与Grafana API的认证。  
![](https://oss.xenwayne.top/img/2025/10/421a88cb72fbe1f6543c71e0471e7c9d.webp)  
名称、到期日期之类的看实际需求，妥善保存Token。

## 部署MCP-Grafana服务器
Grafana官方提供了一个开源的MCP服务器实现[mcp-grafana](https://github.com/grafana/mcp-grafana)，能覆盖大部分常见的查询场景，有更多需求可以基于此项目和Grafana API文档自行扩展。

这里用Docker方式简单部署
```shell
docker run -d \
  --name mcp-grafana \
  --restart=always \
  -p 8000:8000 \
  -e GRAFANA_URL=http://<Grafana-Host>:3000 \
  -e GRAFANA_SERVICE_ACCOUNT_TOKEN=<your service account token> \
  mcp/grafana \
  --disable-loki \
  --disable-pyroscope \
  --disable-oncall \
  --disable-incident \
  --disable-alerting \
  --disable-sift
```
这里我为了精简上下文，用`--disable-xxx`参数禁用了部分用不上的模块，实际使用中请根据实际需求自行配置。官方提供了一个服务健康检查端点`/healthz`，可以通过访问`http://<MCP-Grafana-Host>:8000/healthz`来确认服务是否启动成功。

## 使用智能体测试

至此，MCP-Grafana服务器已经部署完成，接下来就可以使用支持MCP协议的客户端进行测试了。这里以[CherryStudio](https://www.cherry-ai.com/)为例，大同小异。

在设置中添加MCP服务(SSE方式)：
![](https://oss.xenwayne.top/img/2025/10/d65702223417e055f772859a518d1e2b.webp)

拿智谱清言的产品GLM-4.5-Flash执行一个简单的Prompt测试，查一台交换机的当前流量：
![](https://oss.xenwayne.top/img/2025/10/492aa6fd67c8f4facd67a002c51799fb.webp)

实际使用上来讲最好结合知识库一起使用或者手动做一些常用的调用工具链实例，因为MCP工具的描述信息一般比较简短，LLM不一定能准确理解每个工具的使用场景和调用方式。结合知识库或者示例可以帮助LLM更好地理解如何使用这些工具，从而提高查询的准确性和相关性。