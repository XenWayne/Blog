Hexo DIY修改文档

* 1.自定义css和js存在github仓库sitefile/blog_custom中，在主题包中的_config.yml文件中引用
```yml
# Inject
# Insert the code to head (before '</head>' tag) and the bottom (before '</body>' tag)
# 插入代码到头部 </head> 之前 和 底部 </body> 之前
inject:
  head:
    -
  bottom:
    # Butterfly自定义样式美化
    - <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/XenWayne/sitefile@latest/blog_custom/custom.css">
    - <script src="https://cdn.jsdelivr.net/gh/XenWayne/sitefile@latest/blog_custom/custom.js"></script>
```

* 2.footer模板略有修改
node_modules/hexo-theme-butterfly/layout/includes/footer.pug
```pug
#footer-wrap
  if theme.footer.owner.enable
    - var now = new Date()
    - var nowYear = now.getFullYear()
    if theme.footer.owner.since && theme.footer.owner.since != nowYear
      .copyright!= `&copy;${theme.footer.owner.since} - ${nowYear} Copyright ${config.author}`
    else
      .copyright!= `&copy;${nowYear} Copyright ${config.author}`
  if theme.footer.copyright
    .framework-info
      //- span= _p('footer.framework') + ' '
      span= 'Powered by' + ' '
      a(href='https://hexo.io')= 'Hexo'
      span.footer-separator |
      //- span= _p('footer.theme') + ' '
      span= 'Theme' + ' '
      a(href='https://github.com/jerryc127/hexo-theme-butterfly')= 'Butterfly'
      span= ' ' +'Modified'
  if theme.footer.custom_text
    .footer_custom_text!=`${theme.footer.custom_text}`
```
* 3.header模板略有修改(增加wave样式)
node_modules/hexo-theme-butterfly/layout/includes/header/index.pug
```pug
if !theme.disable_top_img && page.top_img !== false
  if is_post()
    - var top_img = page.top_img || page.cover || theme.default_top_img
  else if is_page()
    - var top_img = page.top_img || theme.default_top_img
  else if is_tag()
    - var top_img = theme.tag_per_img && theme.tag_per_img[page.tag] 
    - top_img = top_img ? top_img : (theme.tag_img !== false ? theme.tag_img || theme.default_top_img : false)
  else if is_category()
    - var top_img = theme.category_per_img && theme.category_per_img[page.category]
    - top_img = top_img ? top_img : (theme.category_img !== false ? theme.category_img || theme.default_top_img : false)
  else if is_home()
    - var top_img = theme.index_img !== false ? theme.index_img || theme.default_top_img : false
  else if is_archive()
    - var top_img = theme.archive_img !== false ? theme.archive_img || theme.default_top_img : false
  else
    - var top_img = page.top_img || theme.default_top_img

  if top_img !== false
    - var imgSource = top_img && isImgOrUrl(top_img) ? `background-image: url('${url_for(top_img)}')` : `background: ${top_img}`
    - var bg_img = top_img ? imgSource : ''
    - var site_title = page.title || page.tag || page.category || config.title
    - var isHomeClass = is_home() ? 'full_page' : 'not-home-page'
    - is_post() ? isHomeClass = 'post-bg' : isHomeClass
  else
    - var isHomeClass = 'not-top-img'
else
  - var top_img = false
  - var isHomeClass = 'not-top-img'

- const isFixedClass = theme.nav.fixed ? ' fixed' : ''

header#page-header(class=`${isHomeClass+isFixedClass}` style=bg_img)
  !=partial('includes/header/nav', {}, {cache: true})
  div(style="width: 100%; position: absolute;bottom: 0;")
  svg.waves(xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto")
    defs
      path#gentle-wave(d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z")
    g.parallax
      use(xlink:href="#gentle-wave" x="48" y="0" fill="var(--wave-color1)")
      use(xlink:href="#gentle-wave" x="48" y="5" fill="var(--wave-color2)")
      use(xlink:href="#gentle-wave" x="48" y="7" fill="var(--wave-color3)")
      use(xlink:href="#gentle-wave" x="48" y="12" fill="var(--wave-color4)")
  if top_img !== false
    if is_post()
      include ./post-info.pug
    else if is_home() 
      #site-info
        h1#site-title=site_title
        if theme.subtitle.enable
          - var loadSubJs = true
          #site-subtitle
            span#subtitle
        if(theme.social)
          #site_social_icons
            !=partial('includes/header/social', {}, {cache: true})
      #scroll-down
        i.fas.fa-angle-down.scroll-down-effects
    else
      #page-site-info
        h1#site-title=site_title
```

4.网址卡片外置标签(https://blog.zhheo.com/p/ccaf9148.html)
node_modules\hexo-theme-butterfly\scripts\tag\link.js
```js
/**
 * Butterfly XenWayne Modified
 * link
 * {% link 标题,网站名称(subtitle),地址,是否在新标签页打开(new,不填) %}
 */

function link(args) {
    args = args.join(' ').split(',');
    let title = args[0];
    let sitename = args[1];
    let link = args[2];
    let openInNewTab = args[3] === 'new'; // 默认为 false，除非指定为 'new'

    let target = openInNewTab ? '_blank' : '_self';

    return `<a class="tag-Link" target="${target}" href="${link}">
    <div class="tag-link-tips">引用站外地址</div>
    <div class="tag-link-bottom">
        <div class="tag-link-left"><i class="fa-solid fa-link"></i></div>
        <div class="tag-link-right">
            <div class="tag-link-title">${title}</div>
            <div class="tag-link-sitename">${sitename}</div>
        </div>
        <i class="fa-solid fa-angle-right"></i>
    </div>
    </a>`;
}

hexo.extend.tag.register('link', link, { ends: false });

```

5.menus_item修改支持_blank选项
\node_modules\hexo-theme-butterfly\layout\includes\header\menu_item.pug

```pug
if theme.menu
  .menus_items
    each value, label in theme.menu
      if typeof value !== 'object'
        .menus_item
          - const valueArray = value.split('||')
          - const target = valueArray[2] && trim(valueArray[2]) === '_blank' ? '_blank' : '_self'
          a.site-page(href=url_for(trim(valueArray[0])) target=target)
            if valueArray[1]
              i.fa-fw(class=trim(valueArray[1]))
            span=' '+label
      else
        .menus_item
          - const labelArray = label.split('||')
          - const hideClass = labelArray[2] && trim(labelArray[2]) === 'hide' ? 'hide' : ''
          a.site-page.group(class=`${hideClass}` href='javascript:void(0);')
            if labelArray[1]
              i.fa-fw(class=trim(labelArray[1]))
            span=' '+ trim(labelArray[0])
            i.fas.fa-chevron-down
          ul.menus_item_child
            each val, lab in value 
              - const valArray = val.split('||')
              - const target = valArray[2] && trim(valArray[2]) === '_blank' ? '_blank' : '_self'
              li
                a.site-page.child(href=url_for(trim(valArray[0])) target=target)
                  if valArray[1]
                    i.fa-fw(class=trim(valArray[1]))
                  span=' '+ lab
```

6.layout/includes/layout.pug

添加live2d挂载父元素
```pug
- var htmlClassHideAside = theme.aside.enable && theme.aside.hide ? 'hide-aside' : ''
- page.aside = is_archive() ? theme.aside.display.archive: is_category() ? theme.aside.display.category : is_tag() ? theme.aside.display.tag : page.aside
- var hideAside = !theme.aside.enable || page.aside === false ? 'hide-aside' : ''
- var pageType = is_post() ? 'post' : 'page'

doctype html
html(lang=config.language data-theme=theme.display_mode class=htmlClassHideAside)
  head
    include ./head.pug
  body
    if theme.preloader.enable
      !=partial('includes/loading/index', {}, {cache: true})

    if theme.background
      #web_bg
      
    !=partial('includes/sidebar', {}, {cache: true})

    if page.type !== '404'
      #body-wrap(class=pageType)
        include ./header/index.pug

        main#content-inner.layout(class=hideAside)
          if body
            div!= body
          else
            block content
            if theme.aside.enable && page.aside !== false
              include widget/index.pug

        - var footerBg = theme.footer_bg
        if (footerBg)
          if (footerBg === true)
            - var footer_bg = bg_img
          else
            - var footer_bg = isImgOrUrl(theme.footer_bg) ? `background-image: url('${url_for(footerBg)}')` : `background: ${footerBg}`
        else
          - var footer_bg = ''

        footer#footer(style=footer_bg)
          !=partial('includes/footer', {}, {cache: true})

    else
      include ./404.pug

    #live2d-container(style="position: fixed; left: 0px; bottom: 0px; z-index: 2;")
    
    include ./rightside.pug
    include ./additional-js.pug
```

7. footer增加deploy actions相关哈希
   layout/includes/footer.pug

```pug
#footer-wrap
  if theme.footer.owner.enable
    - var now = new Date()
    - var nowYear = now.getFullYear()
    if theme.footer.owner.since && theme.footer.owner.since != nowYear
      .copyright!= `&copy;${theme.footer.owner.since} - ${nowYear} Copyright ${config.author}`
    else
      .copyright!= `&copy;${nowYear} Copyright ${config.author}`
  if theme.footer.copyright
    .framework-info
      //- span= _p('footer.framework') + ' '
      span= 'Powered by' + ' '
      a(href='https://hexo.io')= 'Hexo'
      span.footer-separator |
      //- span= _p('footer.theme') + ' '
      span= 'Theme' + ' '
      a(href='https://github.com/jerryc127/hexo-theme-butterfly')= 'Butterfly'
      span= ' ' +'Modified'
  if theme.footer.custom_text
    .footer_custom_text!=`${theme.footer.custom_text}`
  //- deploy git 哈希值 文件_data/deploy.yml
  .git-commit
      i.fa-brands.fa-git-alt
      span(style="margin-left: 4px;")= site.data.deploy.sha
```

----------
标签外挂文档:
https://butterfly.js.org/posts/4aa8abbe/#label
https://butterfly.js.org/posts/4073eda/#%E6%8F%92%E4%BB%B6%E6%8E%A8%E8%96%A6
https://butterfly.js.org/posts/4aa8abbe/#%E6%A8%99%E7%B1%A4%E5%A4%96%E6%8E%9B%EF%BC%88Tag-Plugins%EF%BC%89

Twikoo评论插件相关文档:
https://github.com/Android-KitKat/twikoo-import-tools-typecho

hexo-bilibili-bangumi插件相关文档:
https://github.com/HCLonely/hexo-bilibili-bangumi
在hexo generate或hexo deploy之前使用hexo bangumi -u命令更新追番数据，使用hexo cinema -u命令更新追剧数据！(追剧bangumi api不可用)
删除数据命令:hexo bangumi -d/hexo cinema -d

----------


diagrams使用标签示例：

diagrams测试 CITEST
{% diagramsnet "/diagrams/test.drawio"  %}

diagrams测试 allow-zoom-in=true max-height="500px"
{% diagramsnet "/diagrams/test.drawio" allow-zoom-in=true max-height="500px" %}