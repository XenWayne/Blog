---
title: Linux内核调优——内存回收
tags:
  - unraid
  - Linux
  - 内核调优
  - 内存回收
  - buff/cache
  - RAM
categories:
  - 技术分享
cover: 'https://s1.ax1x.com/2022/09/27/xeAyCV.png'
abbrlink: 8306fea3
date: 2022-09-27 21:56:00
---


## 前言
笔者之前在UbuntuServer搭建了<u>Minecaft</u>的服务端,这个架构过于无厘头XD,Ubuntu是一个Unraid(基于Slackware发行版的NAS系统)的KVM虚拟机,我很清楚这个不是什么高性能的用法=V=,莫名其妙的是Minecraft只要涉及到大范围跑图之类的会让I/O暴涨的操作,底层Unraid这边RAM占用就会boom,然后Ubuntu虚拟机也顺带着一起去世。此时```free -h```查看```buff/cache```巨高无比，大约占了整机RAM一半左右。


## 内核调优
既然buff/cache巨高,那就先查查Linux的读写缓存。


> Linux文件缓存是一项重要的性能改进，在大多数情况下，读缓存在绝大多数情况下是有益无害的（程序可以直接从RAM中读取数据）。写缓存比较复杂，Linux内核将磁盘写入缓存，过段时间再异步将它们刷新到磁盘。这对加速磁盘I/O有很好的效果，但是当数据未写入磁盘时，丢失数据的可能性会增加。


问题在于,当前的kernel貌似不能很好的处理读写脏数据缓存——他们大多都留在了RAM cache里,而并没有被内核及时回收。看起来好像有程序导致内存泄漏一样。

### 调整脏数据回收参数
文件缓存本意是好的,但是或许我们环境的RAM捉襟见肘,亦或是我们的硬盘性能不需要太多外置缓存,下述参数旨在告诉内核让更少的数据进入缓存,催促其更快的回收脏数据。

>写在缓存中的数据被修改时,该页就被标记为脏数据。

```bash
sysctl -w vm.dirty_background_ratio = 3 
```
可以填充的脏数据占可用RAM的百分比。该参数指定当文件缓存脏页数量达到何值时,触发pdflush/flush/kdmflush回写进程运行,将缓存写回硬盘,此过程是异步的。


```bash
sysctl -w vm.dirty_ratio = 5
```
写缓冲区占RAM的百分比。指定写缓冲达到何值时,开始将缓存写回硬盘,此过程是阻塞式的,在此缓存写回完成之前新的I/O请求都会被阻塞。


```bash
sysctl -w vm.dirty_expire_centisecs = 600
```
指定脏数据存活时间,单位 秒1/100。超过存活时间的页会触发脏页写回。


```bash
sysctl -w vm.vfs_cache_pressure = 900
```
定义VFS清理缓存的"努力程度",越大内核越频繁回收cache。




### 手动强制回收内存
比较粗暴的做法,通常是不推荐的,可能会引起I/O"尖峰"。

>使用```sync```命令以确保清除前,缓存被写回硬盘。

```bash
sync
echo 3 > /proc/sys/vm/drop_caches
sync
```

## 在Unraid宿主机上的实现
众所周知Unraid作为一个运行在RAM中的系统,数据持久化是个令人头疼的问题。可以通过```UserScripts```来实现开机脚本或定时回收内存或者把配置写进flash的"go"文件中,这里笔者使用前者。

![Unraid实现](https://s1.ax1x.com/2022/09/27/xeAyCV.png)


参考资料 | Reference
> https://zhuanlan.zhihu.com/p/136237953
> https://www.jianshu.com/p/2398ec6e99a1
> https://blog.csdn.net/weixin_45413603/article/details/123311250