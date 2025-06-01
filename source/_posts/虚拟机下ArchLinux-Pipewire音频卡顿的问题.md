---
title: 虚拟机下ArchLinux-Pipewire音频卡顿的问题
abbrlink: b11fff51
date: 2025-05-31 15:23:14
tags:
    - Linux
    - ArchLinux
    - Pipewire
categories:
    - 技术分享
cover: https://oss.xenwayne.top/img/2025/06/75753e088089a4c73653144b946cd514.webp
---

## Issue 
挺早之前图折腾方便，就在Vmware Workstation里装了ArchLinux，大部分情况都靠SSH连接使用，最近用它看视频的时候才发现音频有明显的卡顿现象，具体表现为播放音频时会断断续续，有明显的延迟和齿音。我这台宿主机还装有Ubuntu和RockyLinux，这两个发行版都没有这个问题，或许跟KDE有点关系`?`。有时候多等一会这种现象会自行消失，但重启复现率100%，试过更换PulseAudio也未能解决问题。

## Solution
一番搜索，问题应该跟虚拟机模拟的音频设备性能差有关，可以修改虚拟机里Pipewire的相关配置：

1. 修改`~/.config/wireplumber/wireplumber.conf.d/50-alsa-config.conf`
    ```ini
    monitor.alsa.rules = [
        {
            matches = [
                # This matches the value of the 'node.name' property of the node.
                {
                    node.name = "~alsa_output.*"
                }
            ]
            actions = {
                # Apply all the desired node specific settings here.
                update-props = {
                    api.alsa.period-size   = 1024
                    api.alsa.headroom      = 8192
                }
            }
        }
    ]
    ```

2. 重启相关服务
    ```bash
    systemctl --user restart wireplumber pipewire pipewire-pulse
    ```

`api.alsa.period-size`定义每个音频周期（period）的帧数（frames）。一个周期是ALSA处理音频数据的基本单位，增加周期大小会减少中断频率。`api.alsa.headroom`定义了音频缓冲区的额外空间（headroom），用于处理突发的音频数据流。增加上述两者的值可以减少卡顿，但同时会增加延迟。

## Reference
{% link ALSA configuration,WirePlumber 0.5.10 documentation,https://pipewire.pages.freedesktop.org/wireplumber/daemon/configuration/alsa.html , new %}

{% link PipeWire Troubleshooting,Troubleshooting-stuttering-audio-in-virtual-machine,https://gitlab.freedesktop.org/pipewire/pipewire/-/wikis/Troubleshooting#stuttering-audio-in-virtual-machine , new %}

{% link [SOLVED] Audio/Videao stuttering/crackling, Firefox + PipeWire in VMs,ArchLinux Forum,https://bbs.archlinux.org/viewtopic.php?id=280654 , new %}