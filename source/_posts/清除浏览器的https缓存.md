---
title: 清除Edge等chromium浏览器的https缓存
abbrlink: 1bc24c43
date: 2025-10-28 06:48:43
cover: https://oss.xenwayne.top/img/2025/10/ef1727c54b056e3b5919597d5cd47568.webp
categories:
  - 技术分享
tags:
    - 浏览器
    - HTTPS
    - 缓存
    - Chromium
    - Chrome
    - Edge
    - HSTS
---

## Issue  

这个问题在应用部署的过程中常见，具体来说，你先部署了`https://example.com/`，浏览器访问成功之后，你在服务端取消了https，仅保留http，然后尝试访问`http://example.com/`，结果浏览器自作主张的将请求重定向到了`https://example.com/`，导致了访问失败。

## Solution

现在新版本的浏览器基本都没有类似"Automatic HTTPS"这种明显的Flags给调整了，大概能想到的几个大方向就是缓存、HSTS相关的事情。

### 测试方案: 无痕窗口访问 

使用浏览器的无痕窗口(InPrivate Mode)，访问`http://example.com/`，测试能否正常访问。

### 清空缓存并进行硬刷新

这个便捷的Feature应该只在Chromium内核的浏览器中有效，在目标页面按下F12打开开发者工具后，鼠标长按网址栏旁的刷新按钮，选择"清除缓存并进行硬刷新"(Empty Cache and Hard Reload)。 然后再次尝试访问`http://example.com/`，问题应该能得到解决。
![Empty Cache and Hard Reload](https://oss.xenwayne.top/img/2025/10/e7911788c43a01e242f1f197f9f3c060.webp)


### HSTS Policy  

这应该是最常见的原因了，如果服务端之前设置了HSTS策略，那么浏览器会缓存这个策略。要清除HSTS缓存，访问`chrome://net-internals/#hsts` / `edge://net-internals/#hsts`，在"Delete domain security policies"部分输入你的域名，然后点击"Delete"按钮。完成后，重新尝试访问`http://example.com/`。

## Reference
{% link "清除 Microsoft Edge 自动跳转 https 的缓存" ,Microsoft Q&A, "https://kaffa.im/clear-the-301-automatic-redirection-to-https-cache-of-microsoft-edge" , new %}

{% link "Edge redirecting HTTP to HTTPS" ,kaffa.im, "https://learn.microsoft.com/en-us/answers/questions/988950/edge-redirecting-http-to-https" , new %}