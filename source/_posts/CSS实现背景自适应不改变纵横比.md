---
title: CSS实现背景自适应不改变纵横比
tags:
  - html
  - css
  - web
categories:
  - 技术分享
abbrlink: dec8d4a9
date: 2020-02-06 22:47:00
---

  一张好看的背景能给一个网页加分不少，通常我们在css里面直接定义“background-image”，画面在移动设备上就可能不会被背景图片占满，直接加上cover也会使背景图片随窗口变形。
  简而言之，我们希望实现能自适应屏幕大小又不会变形的背景，而且背景图片不会随着滚动条滚动而滚动。
## HTML部分 ##

```html
<body>
<div class="wrapper">
    <!--背景图片-->
    <div id="web_bg" style="background-image: url(./img/bg.jpg);"></div>
    <!--其他代码 ... -->
</div>
</body>
```

## CSS部分 ##
```css
#web_bg{
  position:fixed;
  top: 0;
  left: 0;
  width:100%;
  height:100%;
  min-width: 1000px;
  z-index:-10;
  zoom: 1;
  background-color: #fff;
  background-repeat: no-repeat;
  background-size: cover;
  -webkit-background-size: cover;
  -o-background-size: cover;
  background-position: center 0;
}
```

CSS分析
====
```css
  position:fixed;
  top: 0;
  left: 0;
```
这三句是让整个div固定在屏幕的最上方和最左方
```css
  width:100%;
  height:100%;
  min-width: 1000px;
```
上面前两句是让整个div跟屏幕实现一模一样的大小，从而达到全屏效果，而min-width是为了实现让屏幕宽度在1000px以内时，div的大小保持不变，也就是说在这种情况下，缩放屏幕宽度时，图片不要缩放，此参数可酌情修改。
```css
 z-index:-10;
```
这个很熟悉了，页面层级，只要让此div位于最底层即可。
```css
zoom: 1;
```
这句是给IE做兼容。
```css
background-repeat: no-repeat;
```
背景不重复。
```css
  background-size: cover;
  -webkit-background-size: cover;
  -o-background-size: cover;
```
   三句是一个意思，就是让图片随屏幕大小同步缩放，但是有部分可能会被裁切，不过不至于会露白，2、3行是为chrome和opera浏览器作兼容。
```css
 background-position: center 0;
```
图片位置居中。

> 转载自简书-汤利利https://www.jianshu.com/p/5480cd1a5d89 博主有修改
> 版权协议：CC BY-NC-SA 4.0

