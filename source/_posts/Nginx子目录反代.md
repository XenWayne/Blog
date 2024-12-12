---
title: Nginx子目录反代
tags:
  - Nginx
  - 反向代理
categories:
  - 技术分享
cover: 'https://s2.loli.net/2024/12/12/SEI5aLPWpqHeicy.png'
abbrlink: 2ca49b12
date: 2023-09-20 18:38:00
---


## 站点配置文件:

```nginx
#PROXY-START/
    location ^~ /map/
    {
        rewrite ^/map/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:8100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header REMOTE-HOST $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        # proxy_hide_header Upgrade;
    }
#PROXY-END/
```

## 具体剖析:

- `location ^~ /map/`：这是一个Nginx `location` 指令，用于匹配以`/map/`开头的请求路径。

- `rewrite ^/map/(.*)$ /$1 break;`：将请求URL中的`/map/`前缀去除，并使用 `rewrite` 指令进行重写。以便能以正确路径正确访问到源站点的资源。

- `proxy_pass http://127.0.0.1:8100;`：将匹配的请求代理转发到`http://127.0.0.1:8100`服务器。

- `proxy_set_header`：一系列指令，用于设置HTTP请求头信息，包括：
   - `Host $host;`：传递客户端请求的`Host`头信息。
   - `X-Real-IP $remote_addr;`：传递客户端真实IP地址。
   - `X-Forwarded-For $proxy_add_x_forwarded_for;`：将客户端原始IP地址添加到`X-Forwarded-For`头信息中。
   - `REMOTE-HOST $remote_addr;`：传递客户端IP地址。
   - `Upgrade $http_upgrade;`：传递`Upgrade`头信息，通常用于WebSocket等协议升级。
   - `Connection $connection_upgrade;`：传递`Connection`头信息，通常用于WebSocket等协议升级。

- `# proxy_hide_header Upgrade;`：这行注释掉的指令是可选的，用于隐藏特定的响应头信息（`Upgrade`头信息）。

该配置文件实现反向代理以`/map/`开头的请求到`http://127.0.0.1:8100`服务器，并在代理过程中传递必要的HTTP头信息，以确保目标服务器正确处理这些请求。  

实际上该案例所使用的服务只设置`proxy_pass`和`rewrite`即可正确实现访问，其他的HTTP头信息可以根据实际情况进行调整。

