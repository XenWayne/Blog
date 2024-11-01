/**
 * Butterfly XenWayne Modified
 * pdf
 * {% pdf文件地址 %}
 */
hexo.extend.tag.register('pdf', function(args) {
    const fileUrl = args[0];  // 解析第一个参数作为PDF链接
    const url = `/pdfviewer/viewer.html?file=${fileUrl}`; // 拼接成完整的PDF预览链接
    return `<iframe src="${url}" style="width:100%; height:1200px;"></iframe>`;
  });
  