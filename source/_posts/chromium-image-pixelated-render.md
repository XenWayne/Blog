---
title: 关于Chromium内核浏览器对图像缩放产生锯齿的问题
cover: https://oss.xenwayne.top/img/2026/05/eb14162fa11e90fd5aec1d30c3712367.webp
categories:
  - 技术分享
tags:
  - html
  - css
  - web
  - Chromium
  - Chrome
  - Edge
  - 前端
abbrlink: 51a85628
date: 2026-05-04 23:45:27
---

# Issues  
在更换网页的部分图片时，在部分图片需要尺寸重映射至更小的尺寸，例如使用`object-fit: cover`时，Chromium内核的浏览器（Chrome、Edge等）对图像进行缩放处理的默认行为导致图像在缩小后出现明显的锯齿状边缘，但通过手动指定`width`和`height`则貌似不会触发该现象，我在Firefox和手头安卓的webview上并没有复现相同的问题，这种现象似乎在高分辨率显示器上尤为明显。

{% gallery %}
![](https://oss.xenwayne.top/img/2026/05/eb14162fa11e90fd5aec1d30c3712367.webp)
![](https://oss.xenwayne.top/img/2026/05/c771f833d2367c626a6212f3b5f4da15.webp)
{% endgallery %}

{% link Poor interpolation demo , codepen.io , https://codepen.io/brianpeiris/pen/PoVroPX , new %}


 
 `Chromium Issue 40230839`记录了类似的问题,并附带一个复现demo。
{% link Chromium Issue 40230839 , Object-fit: cover makes the image pixelated , https://issues.chromium.org/issues/40230839 , new %}

我把原帖的复现demo稍加修改贴出来，如果此刻你正在使用Chromium内核的浏览器，在你点击下面的蓝色按钮时，你应当看到图片在被添加`object-fit: cover`属性后，出现焦外虚化尤其锐的现象。

{% iframe /assets/chromium-image-pixelated-render_demo1.html 100% 600px %}


{% note info %}
Demo图片来自Unsplash，大小4.21MB,分辨率3456*5184,加载可能不畅。
{% endnote %}

# Cause  

首先搜到了[kanochan](https://kanochan.net/archives/3323.html)在2023年的博客，看起来跟我遇到的问题完全一致，顺藤摸瓜又找到了相关的Chromium issue。

简单总结issue的讨论，该问题和Chrome的渲染引擎行为有关，Chrome 在使用 `object-fit: cover` 时，貌似禁用了 Mipmap 多级纹理过滤，强制使用原图线性采样，导致极端缩放下出现锯齿、糊、像素化。官方测试最早的Bad Build为`Chromium 102.0.4961.0`，相关提交[Sharpen mipmaps with OOP-R](https://chromium-review.googlesource.com/c/chromium/src/+/3538212)。

本文写作时，该Issue的优先级为P2，直至2026年2月20日，该Issue仍在讨论。

# Workaround

MDN文档提到了`image-rendering`属性，这个属性控制图片的渲染方式，但`smooth`这个值截至本文写作，仍为实验性特性，Chromium尚不支持，至于他对解决这个问题是否有帮助，只能放到将来讨论了。  

1.[StackOverFlow一个帖子](https://stackoverflow.com/questions/71251416/google-chrome-strange-image-artifacts-pixelated-broken)提到，似乎可以在客户端层面关闭`chrome://flags/#enable-gpu-rasterization (使用GPU光栅化图像)`。

2.最简单也是最粗暴的办法，对于大小固定的场景，避免使用`cover`，转而设置固定的宽高值，亦或是在图片源文件上做文章，准备和容器尺寸一致的原图片，避免浏览器缩放图片。

3.经过我尝试，对`img`使用`transform: translate3d(0, 0, 0) scale(1.0001)`或者`will-change: transform`,可以消除该问题。究其原因，应该是`transform`相关属性触发了GPU渲染管线高质量重采样相关的逻辑，即使是`will-change`这种提前宣告的属性，也一样会触发相关逻辑，我准备了一个demo:

{% iframe /assets/chromium-image-pixelated-render_demo2.html 100% 400px %}

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Image rendering comparison</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
            width: 100%;
            height: 100%;
        }
        body {
            background: #222;
            color: white;
            font-family: sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 10px;
        }
        #userAgent {
            white-space: pre;
            font-size: 14px;
            margin-bottom: 22px;
            max-height: 65px;
        }
        .comparison-row {
            display: flex;
            gap: 28px;
            align-items: flex-end;
            flex-wrap: wrap;
            justify-content: center;
        }
        .comparison-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
        }
        .label {
            font-size: 16px;
            text-align: center;
            max-width: 150px;
        }
        code {
            background: #333;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 14px;
        }
        img {
            width: 160px;
            height: 160px;
        }
        .cover, .cover-fix, .cover-will-change {
            height: 161px;
            object-fit: cover;
        }
        .cover-fix {
            transform: translate3d(0, 0, 0) scale(1.0001);
        }
        .cover-will-change {
            will-change: transform;
        }
        @media (max-width: 700px) {
            img {
                width: 120px;
                height: 120px;
            }
            .cover, .cover-fix, .cover-will-change {
                height: 121px;
            }
            .comparison-row {
                gap: 15px;
            }
            .comparison-item {
                gap: 8px;
            }
            .label {
                font-size: 12px;
                max-width: 110px;
            }
            code {
                font-size: 11px;
            }
            #userAgent {
                font-size: 11px;
                max-height: 45px;
                margin-bottom: 15px;
            }
        }
        @media (max-width: 480px) {
            img {
                width: 90px;
                height: 90px;
            }
            .cover, .cover-fix, .cover-will-change {
                height: 91px;
            }
            .comparison-row {
                gap: 10px;
            }
            .comparison-item {
                gap: 6px;
            }
            .label {
                font-size: 10px;
                max-width: 90px;
            }
            code {
                font-size: 9px;
                padding: 1px 4px;
            }
            #userAgent {
                font-size: 10px;
                max-height: 40px;
                margin-bottom: 12px;
            }
            body {
                padding: 8px;
            }
        }
    </style>
</head>
<body>
    <div id="userAgent"></div>

    <div class="comparison-row">
        <div class="comparison-item">
            <div class="label">Poor: </br><code>object-fit: cover</code></div>
            <img class="cover" src="https://gcore.jsdelivr.net/gh/XenWayne/sitefile/img/avatar.webp" />
        </div>
        <div class="comparison-item">
            <div class="label">Good: </br>no <code>object-fit</code></div>
            <img src="https://gcore.jsdelivr.net/gh/XenWayne/sitefile/img/avatar.webp" />
        </div>
        <div class="comparison-item">
            <div class="label">Fixed: </br><code>translate3d(0,0,0) scale(1.0001)</code></div>
            <img class="cover-fix" src="https://gcore.jsdelivr.net/gh/XenWayne/sitefile/img/avatar.webp" />
        </div>
        <div class="comparison-item">
            <div class="label">Fixed: </br><code>will-change</code></div>
            <img class="cover-will-change" src="https://gcore.jsdelivr.net/gh/XenWayne/sitefile/img/avatar.webp" />
        </div>
    </div>

    <script>
        document.getElementById("userAgent").textContent = navigator.userAgent.replaceAll(") ", ')\n');
    </script>
</body>
</html>
```


# Reference

{% link Chromium Issue 40230839 , Object-fit: cover makes the image pixelated , https://issues.chromium.org/issues/40230839 , new %}
{% link Chromium Issue 40258544 , background-size: cover caused pixelated image , https://issues.chromium.org/issues/40258544 , new %}
{% link 关于CSS缩小图像会产生锯齿的原因探讨 , KanoChan の VERSE , https://kanochan.net/archives/3323.html , new %}
{% link CSS image-rendering 属性 , MDN Web Docs , https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference/Properties/image-rendering , new %}
{% link Google Chrome images distorted & pixelated after latest update for some (workarounds inside) , piunikaweb ,https://piunikaweb.com/2022/04/19/google-chrome-images-distorted-pixelated-after-latest-update-for-some/, new %}
