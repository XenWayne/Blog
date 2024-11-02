---
title: NGINX+OBS+VLC实现低延迟局域网推流
tags:
  - 推流
  - OBS
categories:
  - 技术分享
cover: 'https://gcore.jsdelivr.net/gh/XenWayne/sitefile@master/img/picgo/202411011525198.webp'
abbrlink: b41cff3a
date: 2020-08-06 20:55:00
---

写在前面
====
啊这，折腾这个的原因是因为有很多手机的直播平台不提供rtmp地址，这意味着基本和obs等工具告别了。我的思路是把电脑的屏幕投到手机上，这很简单，但是这仍然和obs沾不到边，直到我看见一个obs的插件——[虚拟摄像头（OBSVirtualCam）][1]，把OBS输出源作为一个摄像头，手机上看电脑上的摄像头就可以了（我用的向日葵）,但是这个方法延迟极其感人，码率。。。。基本没有。~~这个方法废弃。~~
明确一下目标：我希望obs推流的画面和声音能在手机上显示，且延迟不能太高，这就有了局域网推流的方案。

1.NGINX部分
====
配置rtmp
----

首先需要带有rtmp模块的Nginx分支，链接附上↓

>  [nginx1.7.11.3Gryphon][2]

如果你的环境稍复杂，且已经有一个在使用的nginx实例，那可以自行添加rtmp模块，这里推荐[十三月][3]大佬的文章↓

> http://auan.cn/server/1716.html


> 本文在windows环境下操作.

安装好nginx后，打开配置文件，这里为**/conf/nginx-win.conf**，我们需要修改两处地方：

1.在第18行后添加:
```nginx
rtmp {
    server {
        listen 1935;
        chunk_size 4000;
        application live {
             live on;
             record off;
             allow play all;
        }
    }
}
```


其中**listen 1935**为rtmp监听的端口，可自定义。  

2.在第76行"server_name"后添加：
```nginx
        location /stat {
            rtmp_stat all;
            rtmp_stat_stylesheet stat.xsl;
        }
```


启动nginx
----
在目录里使用:
```powershell
nginx.exe -c conf/nginx-win.conf
```
来启动nginx并指定配置文件.

为了方便在桌面上就能打开nginx，可以写个批处理，这里是例子:

```powershell
chcp 65001
@echo 启动nginx [live推流端口1935]

d:
::进入D盘
cd nginx1.7.11.3
::进入Nginx所在目录
Timeout /T 10
nginx.exe -c conf/nginx-win.conf
::启动Nginx并指定配置文件
```
至此，nginx部分告一段落。

2.OBS部分
====
进obs设置→推流（stream）
如图：
![obs设置][4]
其中，服务器的写法为

```nginx
rtmp://本机ip:上文设置监听的端口/live
```
(写127.0.0.1也没啥毛病)，密钥自定义。

保存之后就可以点击OBS的推流了。


3.拉流部分(VLC)
====
流推好了，我们需要一个接收端，这里推荐[VLC][5]。
VLC支持绝大部分平台，这里以windows为例。
![VLC1][6]
![VLC2][7]

这里rmtp的接收地址写法：

```nginx
rtmp://推流的PC地址:上文设置的监听端口/live/上文自定义的密钥
```
效果图
====
![效果][8]

> 参考文献 
>
> https://blog.csdn.net/qq_21529143/article/details/98639407
>
> http://auan.cn/server/1716.html
>


  


  [1]: https://obsproject.com/forum/resources/obs-virtualcam.539/
  [2]: https://nginx-win.ecsds.eu/download/nginx%201.7.11.3%20Gryphon.zip
  [3]: http://auan.cn/
  [4]: https://gcore.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/RTMP1.webp
  [5]: https://github.com/videolan/vlc
  [6]: https://gcore.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/RTMP2.webp
  [7]: https://gcore.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/RTMP3.webp
  [8]: https://gcore.jsdelivr.net/gh/XenWayne/sitefile@master/img/blog/RTMP4.webp