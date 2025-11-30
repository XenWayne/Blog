---
title: 虚拟机单盘LVM扩容
date: 2025-08-05 06:05:05
tags:
  - LVM
  - Linux
  - 系统管理
categories:
  - 技术分享
cover: 'https://oss.xenwayne.top/img/2025/08/4ea916bce6500e98a17a0d6662728b1f.webp'
abbrlink: 2eca1925
---

## 场景
虚拟机为了仿照服务器场景，用默认的LVM配置安装了RockyLinux，在后期测试过程中需要扩容空间，因为虚拟机硬盘动态可调，所以不打算使用新挂载硬盘的方式，而是直接扩容物理卷，这并不算是LVM的常用用法。

## 步骤
此处略过宿主机扩充虚拟磁盘的步骤，按各虚拟化平台修改相关配置即可。
### 1.查看当前分区信息

```bash
[xenwayne@localhost ~]$ lsblk
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sr0      11:0    1 10.2G  0 rom  /run/media/xenwayne/Rocky-9-4-x86_64-dvd
nvme0n1 259:0    0   80G  0 disk 
├─nvme0n1p1
│       259:1    0    1G  0 part /boot
└─nvme0n1p2
        259:2    0   19G  0 part 
  ├─rl-root
  │     253:0    0   17G  0 lvm  /
  └─rl-swap
        253:1    0    2G  0 lvm  [SWAP]
```

以上结果为例，当前虚拟硬盘为80G，有`nvme0n1p1`和`nvme0n1p2`两个物理分区，`nvme0n1p2`为LVM物理卷，大小19G，下属`rl-root`和`rl-swap`两个逻辑卷，分别为17G和2G。

我们的目标是将多出来的空间全部划分`rl-root`逻辑卷。

### 2.扩容物理分区
扩容物理分区`nvme0n1p2`，这里使用cfdisk工具。
```bash
[xenwayne@localhost ~]$ sudo cfdisk /dev/nvme0n1
```
对`nvme0n1p2`分区进行Resize，回车接受默认最大值，然后Write保存并退出。

再次查看分区信息，分区已经扩容成功。
```bash
[root@localhost ~]# lsblk
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sr0      11:0    1 10.2G  0 rom  /run/media/xenwayne/Rocky-9-4-x86_64-dvd
nvme0n1 259:0    0   80G  0 disk 
├─nvme0n1p1
│       259:1    0    1G  0 part /boot
└─nvme0n1p2
        259:2    0   79G  0 part 
  ├─rl-root
  │     253:0    0   17G  0 lvm  /
  └─rl-swap
        253:1    0    2G  0 lvm  [SWAP]
```
### 3.更新Physical Volume(PV)物理卷信息

使用`pvresize`命令更新物理卷信息
```bash
[root@localhost ~]# pvs
  PV             VG Fmt  Attr PSize   PFree
  /dev/nvme0n1p2 rl lvm2 a--  <19.00g    0 
[root@localhost ~]# pvresize /dev/nvme0n1p2
  Physical volume "/dev/nvme0n1p2" changed
  1 physical volume(s) resized or updated / 0 physical volume(s) not resized
[root@localhost ~]# pvs
  PV             VG Fmt  Attr PSize   PFree 
  /dev/nvme0n1p2 rl lvm2 a--  <79.00g 60.00g
```
### 4.扩容Logical Volume(LV)逻辑卷

因为PV直接扩容，没有向卷组新加入新PV的操作，所以VG卷组不需要做任何操作，VG的可用空间直接变更：
```bash
[root@localhost ~]# vgs
  VG #PV #LV #SN Attr   VSize   VFree 
  rl   1   2   0 wz--n- <79.00g 60.00g
```

使用`lvresize`命令扩容逻辑卷`rl-root`

```bash
[root@localhost ~]# lvresize -l +100%FREE /dev/mapper/rl-root
  Size of logical volume rl/root changed from <17.00 GiB (4351 extents) to <77.00 GiB (19711 extents).
  Logical volume rl/root successfully resized.
```

### 5.扩容文件系统
这里用的是xfs：
```bash
[root@localhost ~]# xfs_growfs /dev/mapper/rl-root

meta-data=/dev/mapper/rl-root    isize=512    agcount=4, agsize=1113856 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=0
         =                       reflink=1    bigtime=1 inobtcount=1 nrext64=0
data     =                       bsize=4096   blocks=4455424, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=16384, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
data blocks changed from 4455424 to 20184064


[root@localhost mnt]# df -h
文件系统             容量  已用  可用 已用% 挂载点
devtmpfs             4.0M     0  4.0M    0% /dev
tmpfs                1.8G     0  1.8G    0% /dev/shm
tmpfs                726M  9.7M  716M    2% /run
/dev/mapper/rl-root   77G   17G   61G   22% /
/dev/nvme0n1p1       960M  304M  657M   32% /boot
tmpfs                363M  104K  363M    1% /run/user/1000
/dev/sr0              11G   11G     0  100% /run/media/xenwayne/Rocky-9-4-x86_64-dvd
```

其他文件系统按需搜索，大同小异。

> 参考 | Reference
[Unlocking the Power of Storage: A Beginner's Guide to LVM in Linux](https://itsfoss.com/lvm-guide/) 
[Linux - 通过LVM对磁盘进行动态扩容 (Linux的逻辑卷)](https://www.cnblogs.com/shoufeng/p/10615452.html)
[Ubuntu 系统 LVM 逻辑卷扩容教程](https://zhuanlan.zhihu.com/p/23979967894)