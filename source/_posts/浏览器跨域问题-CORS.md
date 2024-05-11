---
title: 浏览器跨域问题-CORS
tags:
  - Nginx
  - CORS
  - 前端
  - 跨域
  - API
  - CloudFlare
categories:
  - 技术分享
cover: 'https://s11.ax1x.com/2023/09/20/pPIPcZT.png'
abbrlink: d651e145
date: 2023-09-20 19:35:00
---


# 浏览器报错案例

前段时间写LightZone网站调用api的时候遇到了跨域问题，今天来唠唠。浏览器报错:
![pPIC5b8.png](https://z1.ax1x.com/2023/09/20/pPIC5b8.png)

要明白跨域报错的原因，首先要了解一下什么是跨域。
> 跨域是指浏览器不能执行其他网站的脚本。它是由浏览器的同源策略造成的，是浏览器对JavaScript施加的安全限制。所谓同源是指，域名，协议，端口相同。同源策略限制从一个源加载的文档或脚本如何与来自另一个源的资源进行交互。这是一个用于隔离潜在恶意文件的关键的安全机制。

"域名"、"协议"、"端口"三者有一个不同就会产生跨域问题。值得一提的是，即使两个域名解析到同一个ip，也是跨域的。这里我们就要抛出一个疑问:既然调用不同源的资源会产生跨域问题，那么在html中调用第三方css、js不也算作跨域吗？为什么不会报错呢？这是因为浏览器对部分场景允许跨域调用。但是对于ajax、fetch等请求，浏览器就会做限制，不允许跨域调用。以下几种情况是浏览器允许跨域调用的(不全面，仅供参考):

```html
<script src="..."></script>
<link href="..."></link>
<img src="..."></img>
<iframe src="..."></iframe>
<video src="..."></video>
<audio src="..."></audio>
@font-face引入的字体
more...
```
上述案例中我使用js调用外源api返回的json请求被浏览器拦截。这里调用的api.lightzone.top显然与当前域名不同，所以会产生跨域问题。

# CORS 跨域资源共享

CORS是一个W3C标准，全称是"跨域资源共享"（Cross-origin resource sharing）。它允许浏览器向跨源服务器，发出XMLHttpRequest请求。CORS需要浏览器和服务器同时支持。目前，所有浏览器都支持该功能，IE10以上版本支持。

在该案例中，我们只需在api的响应头中添加`Access-Control-Allow-Origin: *`即可解决跨域问题。这里的`*`表示允许任意域名跨域调用，也可以指定域名，例如`Access-Control-Allow-Origin: http://www.lightzone.top`。


[note type="warning flat"]
值得一提的是，直接设置`Access-Control-Allow-Origin: *`会导致api所有的请求都允许跨域调用，这样做会存在安全问题，即**任何一个前端程序都能调用该api的数据**。所以我们最好是将`*`替换成具体的服务域名。至少在生产环境，请铭记这一点。
[/note]

## 服务器端配置(Nginx)

在Nginx中配置CORS，只需要在nginx.conf中添加以下内容即可:
```nginx
location / {
    add_header Access-Control-Allow-Origin your_host;
}
```
对于多域名的情况，可以使用`$http_origin`变量加正则表达式判断:
```nginx
location / {
    if ($http_origin ~* "^https?://(your_host_1|your_host_2)$") {
        add_header Access-Control-Allow-Origin "$http_origin";
    }
}
```
## 使用CloudFlare修改响应头

我的站点使用了CloudFlare，那么也可以在CloudFlare中修改响应头，导航到`规则->转换规则->修改响应头->创建规则`,添加以下内容即可:

![pPIC4Df.png](https://z1.ax1x.com/2023/09/20/pPIC4Df.png)
![pPICWvt.png](https://z1.ax1x.com/2023/09/20/pPICWvt.png)

# 验证响应头

正确配置后的响应头应该如下图所示:
![pPIChKP.png](https://z1.ax1x.com/2023/09/20/pPIChKP.png)

>参考文献  
[MDN: 跨域资源共享 CORS 详解](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)  
[跨域资源共享 CORS 详解-阮一峰的网络日志](https://www.ruanyifeng.com/blog/2016/04/cors.html)  
[正确配置Access-Control-Allow-Origin](https://blog.csdn.net/baijiafan/article/details/126501682)  
[解决跨域问题的n种办法](https://blog.csdn.net/sinat_34798463/article/details/114928477)