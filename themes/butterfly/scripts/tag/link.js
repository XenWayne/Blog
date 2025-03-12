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
    let openInNewTab = args[3] && args[3].trim() === 'new'; // 默认为 false，除非指定为 'new'

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