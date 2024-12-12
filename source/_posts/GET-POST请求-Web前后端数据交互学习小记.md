---
title: GET&POST请求-Web前后端数据交互学习小记
tags:
  - AJAX
  - JavaScript
  - XMLHttpRequest
  - Fetch
  - Axios
  - Express
  - NodeJS
Categories:
  - 技术分享
abbrlink: 6f791b0c
date: 2024-05-24 22:16:52
---



最近做一个全栈项目学习了一下前后端数据请求交互，这里用NodeJS Express做服务端，简单总结一下GET和POST请求交互的几种方案，本文不会对全部Api进行详细介绍，只是简单的示例，更多内容可以查看官方文档。

## 表单提交
通过html的form表单提交数据，浏览器默认的处理逻辑会刷新页面，并将目标url请求得到的响应渲染到页面上，大部分情况下都是通过`event.preventDefault()`阻止默认行为，然后通过其他方式处理请求，这小节我们只讨论表单提交的默认行为。

### GET请求

前端部分：
```html
<form action="//localhost:8000/formget" method="get">
    <p>表单提交 GET</p>
    <input type="text" name="a" value="100">
    <input type="text" name="b" value="200">
    <input type="submit" value="提交">
</form>
```

后端部分：
```javascript
app.get('/formget', (req, res) => {
    console.log(req.query);
    let result = parseInt(req.query.a) + parseInt(req.query.b);
    res.send('GET请求结果：' + result);
});
```

这样我们在表单中输入两个数，点击提交按钮，浏览器会跳转到`http://localhost:8000/formget?a=100&b=200`，并在新页面返回`GET请求结果：300`，浏览器默认行为将response渲染到新页面上，所以在response里塞一个html也可行，或者用`res.redirect()`重定向到其他页面。

### POST请求

前端部分：
```html
<form action="//localhost:8000/formpost" method="post">
    <p>表单提交 POST</p>
    <input type="text" name="a" value="100">
    <input type="text" name="b" value="200">
    <input type="submit" value="提交">
</form>
```

后端部分：
```javascript
app.post('/formpost', (req, res) => {
    console.log(req.body);
    let result = parseInt(req.body.a) + parseInt(req.body.b);
    res.send('POST请求结果：' + result);
});
```

浏览器行为和GET请求类似，只是POST请求不会在url上暴露参数，而是通过请求体传递参数。

表单就支持很多丰富的功能，可以通过`enctype`属性设置表单数据的编码类型，例如`multipart/form-data`适用于文件上传，关于表单的Post请求更多用例，推荐阅读:

{% link 四种常见的 POST 提交数据方式,JerryQu 的博客,https://imququ.com/post/four-ways-to-post-data-in-http.html , new %}

## AJAX
表单提交的默认行为在登录表单的场景应用尚可，但在现代web应用中，我们更多的是通过AJAX请求来实现数据交互，这样可以避免页面刷新，提升用户体验。

AJAX（Asynchronous JavaScript and XML，异步JavaScript和XML）是一种在无需重新加载整个网页的情况下，通过与服务器进行异步通信来更新网页部分内容的概念，通过操作XMLHttpRequest对象来实现，只要用脚本发起通信，就可以叫做AJAX通信。

### GET请求

前端部分：
```html
<button onclick="get()">发送get请求</button>
<div id="result"></div>
```

```javascript
function get() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '//localhost:8000/get?a=100&b=200');
    xhr.send();
    xhr.onreadystatechange = function () {
        // readyState: 0-未初始化, 1-启动, 2-发送, 3-接收, 4-完成
        if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
            console.log(xhr.status); //状态码
            console.log(xhr.statusText); //状态字符串
            console.log(xhr.getAllResponseHeaders()); //获取所有响应头
            console.log(xhr.response); //获取响应体

            const result = document.getElementById('result');
            result.innerHTML = xhr.response;
        }
    }
}
```

后端部分：
```javascript
// get请求
app.get('/get', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    let a = parseInt(req.query.a);
    let b = parseInt(req.query.b);

    if (isNaN(a) || isNaN(b)) {
        res.status(400).send('Invalid parameters');
    } else {
        res.send((a + b).toString() + ' from GET');
    }
});
```
GET请求的参数直接拼接在url上，通过`xhr.open()`方法指定请求方法和url，`xhr.send()`发送请求，`xhr.onreadystatechange`监听请求状态，`xhr.readyState`的值代表的状态见下表:

| readyState | 含义                                                     |
| :--------: | :------------------------------------------------------- |
|     0      | 未初始化，还没有调用open()方法                           |
|     1      | 启动，已经调用open()方法，但还没有调用send()方法         |
|     2      | 发送，已经调用send()方法，但还没有接收到响应             |
|     3      | 接收，已经接收到部分响应数据                             |
|     4      | 完成，已经接收到全部响应数据，而且已经可以在客户端使用了 |

至于`xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300`这个判断条件，HTTP状态码200-299表示请求成功，300-399表示重定向，我们只在请求成功时处理响应。

关于`res.setHeader('Access-Control-Allow-Origin', '*');`这一行，是为了解决跨域问题，如果前端和后端不在同一个域下，浏览器会拦截请求，这里设置允许所有域的请求，生产环境下不建议这样设置，可以根据实际情况设置允许的域名。

### POST请求

前端部分：
```html
<button onclick="post()">发送post</button>
<div id="result"></div>
```

```javascript
function post() {
    const result = document.getElementById('result');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '//localhost:8000/post');

    // 设置请求头
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');// 设置请求体内容类型
    xhr.send('a=100&b=200');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
            console.log(xhr.status); //状态码
            console.log(xhr.statusText); //状态字符串
            console.log(xhr.getAllResponseHeaders()); //获取所有响应头
            console.log(xhr.response); //获取响应体
            result.innerHTML = xhr.response;
        }
    }
}
```

后端部分：
```javascript
// post请求
app.post('/post', express.urlencoded({ extended: true }), (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('post: ' + req.body);
    let a = parseInt(req.body.a);
    let b = parseInt(req.body.b);
    res.send((a + b).toString() + ' from POST');
});
```

POST请求的参数通过`xhr.send()`方法传递，`xhr.setRequestHeader()`设置请求头，这里请求头的`Content-Type`是`application/x-www-form-urlencoded`，表示请求体内容类型，xhr.send()所接受的参数可以随意设计，只要后端有对应的中间件解析即可。

后端使用的中间件为`express.urlencoded({ extended: true })`，用于解析请求体，`req.body`中存放了解析后的请求体内容。

实际应用中更常用的是`application/json`，表示请求体内容是json格式，这里给出一个json格式的POST请求示例：

### JSON格式POST请求示例

前端部分：
```html
<button onclick="postJson()">发送post(json)</button>
<div id="result"></div>
```

```javascript
function postJson() {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '//localhost:8000/postjson');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ a: 100, b: 200 }));

    // 设置xhr响应类型
    xhr.responseType = 'json';

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
            // // 手动转换json
            // let data = JSON.parse(xhr.response);
            // result.innerHTML = data.name + ' from json';
            result.innerHTML = xhr.response.name + ' from json';
        }
    }
}
```

后端部分：
```javascript
//post JSON
app.all('/postjson', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    const data = {
        name: 'testJson'
    };
    res.send(JSON.stringify(data));
});
```

这里的`xhr.responseType = 'json';`表示响应体是json格式，这样xhr会自动将响应体转换为json对象，不需要手动转换，当然示例中也给出了使用`JSON.parse()`手动转换的方法。

后端之所以用`app.all()`监听所有方法的请求，是因为对于设置`Content-Type`为`application/json`的行为，浏览器会先发送一个OPTIONS请求，询问服务器是否支持这种请求，服务器需要返回一个包含`Access-Control-Allow-Headers`的响应头，告诉浏览器支持的请求头，这里我们直接设置为`*`，表示支持所有请求头，这里让其监听all，用这一个方法处理两次请求，开发时为了方便，可以用通配符处理全局预检请求:

```javascript
// 处理全局预检请求
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.send();
});
```

需要说明的是，这里仅是为了给测试提供方便，面向生产环境的应用，应该根据实际情况设置更加细分的允许范围。

## AJAX in jQuery

jQuery是一个快速、简洁的JavaScript库，它简化了HTML文档遍历、事件处理、动画等操作，相较于原生写法，jQuery实现AJAX请求更加简洁，这里给出前端部分的示例。

```html
<button onclick="jqueryGet()">jQuery发送get请求</button>
<button onclick="jqueryPost()">jQuery发送post请求</button>
<div id="result"></div>
```
### GET请求

```javascript
function jqueryGet() {
    $.get('//localhost:8000/get', { a: 100, b: 200 }, function (data) {
        console.log(data);
        $('#result').html(data);
    });
}
```

### POST请求

```javascript
function jqueryPost() {
    $.post('//localhost:8000/post', { a: 100, b: 200 }, function (data) {
        console.log(data);
        $('#result').html(data);
    });
}
```

上述写法中，`$.get()`和`$.post()`分别是jQuery的get和post方法，适合一些简单的请求，接受四个参数，分别是(url, data, success, dataType)，其中url是请求的url，data是请求参数，success是请求成功的回调函数，dataType是响应体类型，如果dataType没有被指定，jQuery会根据响应体自动判断响应体类型。

其实jQuery中`$.get()`和`$.post()`方法返回的是一个jqXHR对象，这个对象是jQuery的封装，实现了Promise接口，所以可以.done(), .fail(), .always(), .then()等方法添加不同情况下的回调函数。

### jQuery.ajax()通用方法

```javascript
function jqueryAjax() {
    $.ajax({
        // 请求URL
        url: '//localhost:8000/post',
        // 请求方法
        type: 'POST',
        // 请求头
        headers: {
            'Content-Type': 'application/json'
        },
        // 参数
        data: { a: 100, b: 200 },
        // 响应体类型
        dataType: 'json',
        // 成功回调函数
        success: function (data) {
            console.log(data);
            $('#result').html(data);
        }
        // 超时时间
        timeout: 3000,
        // 失败回调函数
        error: function (error) {
            console.log(error);
        }
    });
}
```


## Fetch

Fetch API 是现代 JavaScript 中用于进行网络请求的接口，它提供了比传统 XMLHttpRequest 更加灵活和强大的功能。Fetch API 使得网络请求的处理更加简洁，并且原生支持 Promises，从而简化了异步代码的编写和错误处理，这里只给出前端部分的示例。

### GET请求

GET请求是fetch的默认请求方法，可以不指定method，如果需要传递参数，可以直接拼接在url上。

```javascript
function fetchGet() {
    fetch('//localhost:8000/get?a=100&b=200')
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                return Promise.reject('Fetch failed');
            }
        })
        .then(data => {
            console.log(data);
            const result = document.getElementById('result');
            result.innerHTML = data;
        })
        .catch(error => {
            console.log(error);
        });
}
```

### POST请求

```javascript
function fetchPost() {
    fetch('//localhost:8000/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'a=100&b=200'
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                return Promise.reject('Fetch failed');
            }
        })
        .then(data => {
            console.log(data);
            const result = document.getElementById('result');
            result.innerHTML = data;
        })
        .catch(error => {
            console.log(error);
        });
}
```

Promise的链式调用过程中，如果前一个Promise返回的是reject状态，那么后续的then方法就会被跳过，直接执行catch方法，这样就可以在catch方法中统一处理错误。每一个.then()都接受一个回调函数，这个回调函数接受上一个Promise的返回值作为参数，返回一个新的Promise，这样就可以实现链式调用。

以上述代码为例，`fetch()`返回的是一个Promise对象，第一个then()方法接受response对象，判断`response.ok`是否为true，如果为true，返回`response.text()`，否则返回`Promise.reject('Fetch failed')`，第二个`then()`方法接受第一个`then()`方法返回的值，即`response.text()`，命名为data，并将其渲染到页面上，如果第一个`then()`方法返回的是reject状态，那么第二个`then()`方法就会被跳过，直接执行catch方法。

Fetch在请求时除了接受url，还接受一个配置对象，其中method表示请求方法，headers表示请求头，body表示请求体，还有更多配置项，具体可以查看[MDN-Web-API-fetch()](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch#options)，一个典型的配置对象如下:

```javascript
{
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ a: 100, b: 200 })
}
```

## Axios

Axios 是一个基于Promise的网络请求库，旨在简化浏览器和 Node.js 中进行 HTTP 请求的过程。Axios是[isomorphic](https://www.lullabot.com/articles/what-is-an-isomorphic-application)的，即无论是在浏览器端还是在服务器端，它都能提供一致的 API 和功能，在Node.js中其使用原生Node.js的http模块，浏览器端使用XMLHttpRequest。

Axios的使用方式和Fetch类似，但是Axios提供了更多的功能，比如拦截器、取消请求等，服务器端使用Axios多数用于代理请求或与其他服务通信时使用，这里只给出前端部分请求的示例。

### GET请求

axios#get(url[, config])

```javascript
function axiosGet() {
    axios.get('//localhost:8000/get', {
        // 请求参数，也可以直接拼接在url上
        params: {
            a: 100,
            b: 200
        },
        // 请求头
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(response => {
            console.log(response.data);
            const result = document.getElementById('result');
            result.innerHTML = response.data;
        })
        .catch(error => {
            console.log(error);
        });
}
```

### POST请求

axios#post(url[, data[, config]])

```javascript
function axiosPost() {
    axios.post('//localhost:8000/post', { a: 100, b: 200 }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log(response.data);
            const result = document.getElementById('result');
            result.innerHTML = response.data;
        })
        .catch(error => {
            console.log(error);
        });
}
```

Axios的post()`方法接受三个参数，第一个参数是url，第二个参数是请求体，第三个参数是配置对象，其中params表示请求参数，headers表示请求头，Axios的请求方法返回的是一个Promise对象，可以通过`then()`方法处理成功的响应，`catch()`方法处理失败的响应。

### Axios通用方法

axios(url[, config])

```javascript
axios({
    url: '//localhost:8000/post',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    params: {
        a: 100,
        b: 200
    },
    data: { a: 100, b: 200 }
})
    .then(response => {
        console.log(response.data);
        const result = document.getElementById('result');
        result.innerHTML = response.data;
    })
    .catch(error => {
        console.log(error);
    });
```

这种写法如果不在config指定method，Axios默认的请求方法是GET。  
对于一些复杂场景的传参，我们可能需要在POST请求时同时传递params和data，即同时通过URL和请求体传递参数，这种情况下，params中的参数会拼接在url上，data中的参数会放在请求体中。后端以Express为例，可以通过`req.query`获取url上的参数，通过`req.body`获取请求体中的参数。

Axios提供了很多实用的功能，比如拦截器、取消请求、全局配置等，值得一提的是，可以通过`axios.defaults.baseURL`设置全局请求的基础url，这样在请求时就不用每次都写完整的url，只需要写相对路径即可。

## 其他方案

除了上述几种方案，还有一些其他的方案，比如JSONP、WebSocket、Server-Sent Events等，其中JSONP是一种较为过时的跨域解决方案，我在下面这篇文章提到过。
{% link 浏览器跨域问题-CORS、JSONP,https://xenwayne.top/posts/d651e145/,/posts/d651e145/ , new %}


>参考资料：  
> [MDN-XMLHttpRequest](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest)  
> [MDN-Web-API-fetch()](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch#options)  
> [Axios](https://axios-http.com/zh/docs/)  
> [CSDN-前端请求数据方法](https://blog.csdn.net/qq_53895518/article/details/135505979)
> [express解析post请求的几个中间件](https://blog.csdn.net/weixin_43972437/article/details/102717320)
> [Ajax jQuery API Documentation](https://api.jquery.com/category/ajax/)
