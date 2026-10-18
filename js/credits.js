(function () {
  "use strict";
  var S = window.SCP;
  S.loadIndex().then(function (data) {
    var m = data.meta;
    var el = document.getElementById("credits-meta");
    if (!el) return;
    el.textContent = "DATA BUILD " + m.generated + " · " + m.total.toLocaleString("zh-CN") + " 个编号 · " + m.filled.toLocaleString("zh-CN") + " 条正文 · " + m.chunks.length + " 个分片";
  }).catch(function () {
    var el = document.getElementById("credits-meta");
    if (el) el.textContent = "数据信息暂不可用";
  });
})();
