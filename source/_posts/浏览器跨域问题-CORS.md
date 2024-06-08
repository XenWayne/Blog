---
title: 浏览器跨域问题-CORS、JSONP
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

{% note info %}
需要明确的是，浏览器允许发送跨域请求，但是跨域请求的响应会受到CORS策略的限制。如果服务器没有正确配置CORS，浏览器会拦截响应回来的数据，导致请求失败。
{% endnote %}

# CORS 跨域资源共享

CORS是一个W3C标准，全称是"跨域资源共享"（Cross-origin resource sharing）。它允许浏览器向跨源服务器，发出XMLHttpRequest请求。CORS需要浏览器和服务器同时支持。目前，所有浏览器都支持该功能，IE10以上版本支持。

在该案例中，我们只需在api的响应头中添加`Access-Control-Allow-Origin: *`即可解决跨域问题。这里的`*`表示允许任意域名跨域调用，也可以指定域名，例如`Access-Control-Allow-Origin: http://www.lightzone.top`。



{% note warning flat %}
直接设置`Access-Control-Allow-Origin: *`会导致api所有的请求都允许跨域调用，这样做会存在安全问题，即**任何一个前端程序都能调用该api的数据**。所以我们最好是将`*`替换成具体的服务域名。至少在生产环境，请铭记这一点。
{% endnote %}

## 服务器端配置(Nginx)

在Nginx中配置CORS，只需要在nginx.conf中添加以下内容即可:
```nginx
location / {
    add_header Access-Control-Allow-Origin your_host;
}
```

CORS策略默认对`Access-Control-Allow-Origin: <origin> | *`的解释是指定单一的源或通配符，对于多域名的情况，可以在服务端使用`$http_origin`变量加正则表达式判断:
```nginx
location / {
    if ($http_origin ~* "^https?://(your_host_1|your_host_2)$") {
        add_header Access-Control-Allow-Origin "$http_origin";
    }
}
```

{% note default %}
MDN文档介绍了更多的CORS配置项，包括预检请求缓存时间等。详情参考[HTTP访问控制（CORS）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)。
{% endnote %}

## 使用CloudFlare修改响应头

我的站点使用了CloudFlare，那么也可以在CloudFlare中修改响应头，导航到`规则->转换规则->修改响应头->创建规则`,添加以下内容即可:

![pPIC4Df.png](https://z1.ax1x.com/2023/09/20/pPIC4Df.png)
![pPICWvt.png](https://z1.ax1x.com/2023/09/20/pPICWvt.png)

## 验证响应头

正确配置后的响应头应该如下图所示:
![pPIChKP.png](https://z1.ax1x.com/2023/09/20/pPIChKP.png)


# JSONP(JSON with Padding)
 
JSONP的基本原理是利用 `<script>` 标签不受同源策略限制的特点来实现跨域请求，在前端创建一个回调函数，用`<script src="http://apiurl?callback=callbackName">`的方式请求数据，在js中可以使用`document.createElement('script')`动态创建标签并将其append到html文档中。本质上服务端返回的是一段javascript代码，这段代码会调用前端定义的回调函数，并将数据作为参数传递给回调函数。这样就实现了跨域请求。

## 原生javascript实现JSONP

前端
```html
<!DOCTYPE html>
<html>
<head>
  <title>JSONP Example</title>
</head>
<body>
  <script type="text/javascript">
    function handleResponse(data) {
      console.log("Name: " + data.name);
      console.log("Age: " + data.age);
    }

    // 动态创建script标签
    var script = document.createElement('script');
    script.src = 'http://example.com/data?callback=handleResponse';
    document.head.appendChild(script);
  </script>
</body>
</html>
```

服务端(Node.js Express)
```javascript
app.get('/data', (req, res) => {
  const data = {
    name: 'LightZone',
    age: 2
  };
  const callback = req.query.callback; // 获取回调函数名
  res.send(`${callback}(${JSON.stringify(data)})`); // handleResponse(data)
});
```

这个例子中前端通过js动态创建script标签，请求`http://example.com/data?callback=handleResponse`，通过get请求的url传参回调函数名`handleResponse`，服务端返回`handleResponse(data)`，此时服务端返回的js函数在我们动态创建的`<script>`标签中执行，传参调用了事先定义好的`handleResponse`函数。

## jQuery实现JSONP

```javascript
$.ajax({
  url: 'http://example.com/data',
  dataType: 'jsonp',
  jsonp: 'callback', // 自定义回调函数传参的param名
  success: function(data) {
    console.log("Name: " + data.name);
    console.log("Age: " + data.age);
  }
});
```
或者
```javascript
$.getJSON('http://example.com/data?callback=?', function(data) {
  console.log("Name: " + data.name);
  console.log("Age: " + data.age);
});
```

jQuery封装的jsonp请求如无明确指定，会在请求url中自动添加随机生成的回调函数名`callback=?`，类似于`http://example.com/data?callback=jQuery1234567890`，服务端获取`req.query.callback`，响应时拼接即可。

在更底层的方法`$.ajax`中，可以通过`jsonp`参数重写“callback”参数名，即param，如`jsonp: 'cb'`，服务端获取`req.query.cb`。可以通过`jsonpCallback`参数指定回调函数名，如`jsonpCallback: 'handleResponse'`，服务端获取`req.query.cb`的返回结果就是`handleResponse`，更多参数参考jQuery官方文档。
{% link jQuery.ajax(), jQuery API Documentation, https://api.jquery.com/jQuery.ajax/ %}

## JSONP的缺点

放到现在来看JSONP颇有一种“投机取巧”的感觉，或者说有些过时了，一般不推荐使用，除非你打算兼容IE8😄，否则更推荐使用CORS策略设置来允许部分跨域行为。

1. JSONP基于`<script>`标签实现，这意味着它只支持GET请求，不支持POST等其他请求方式。
2. 安全性问题：由于 JSONP 是通过插入 `<script>` 标签来工作的，因此它具有执行任何 JavaScript 代码的能力。且回调函数在过程中透明可见。如果你请求的服务被劫持或者你请求了一个恶意的服务，那么恶意代码就可能被插入到你的页面中并被执行，例如典型的XSS攻击。
3. 不支持错误处理，JSONP如果请求失败，那么你的回调函数将不会被调用，不会得到标准的HTTP状态码，这种错误是难以被catch的。
4. 不支持进度跟踪，JSONP无法实现像XMLHttpRequest那样提供进度事件。
5. JSONP需要服务端配合返回特定内容，严格来讲是一种非标准的请求，不是一种官方的请求方案。


# 如果你正在前端开发...

如果你不负责当前项目的服务端部分，但是又等不及和同事联调接口，vue-cli、webpack devserver等成熟的前端脚手架工具都提供了代理配置，可以将请求代理到本地，解决跨域问题。这样你就可以愉快地调试接口了。或者你可以直接暂时将浏览器的跨域策略关闭，例如chrome浏览器可以通过`--disable-web-security --user-data-dir=(新的用户数据目录)`参数启动(这里指定新的用户数据目录是现代Chrome的强制标准，因为你自己的用户数据目录可能存储着cookie、token等高度敏感的信息，在这样的用户数据目录下关闭跨域策略是极度不安全的)。


>参考文献  
[MDN: 跨域资源共享 CORS 详解](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)  
[跨域资源共享 CORS 详解-阮一峰的网络日志](https://www.ruanyifeng.com/blog/2016/04/cors.html)  
[正确配置Access-Control-Allow-Origin](https://blog.csdn.net/baijiafan/article/details/126501682)  
[解决跨域问题的n种办法](https://blog.csdn.net/sinat_34798463/article/details/114928477)
[HTTP访问控制（CORS）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)