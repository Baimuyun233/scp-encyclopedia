(function () {
  "use strict";
  var S = window.SCP;

  function fmt(n) {
    return Number(n || 0).toLocaleString("zh-CN");
  }

  function renderTerminal(item) {
    var img = document.getElementById("terminal-img");
    var id = document.getElementById("terminal-id");
    var title = document.getElementById("terminal-title");
    var desc = document.getElementById("terminal-desc");
    var badges = document.getElementById("terminal-badges");
    var series = document.getElementById("terminal-series");
    if (!item) {
      title.innerHTML = '<a href="browse.html">暂无可用档案</a>';
      desc.textContent = "档案索引为空。";
      return;
    }
    img.src = S.media(item);
    img.alt = item.id + " " + item.t;
    id.textContent = item.id;
    title.innerHTML = '<a href="item.html?id=' + encodeURIComponent(item.id) + '">' + S.esc(item.t) + "</a>";
    desc.textContent = item.st === "content" ? "档案正文已收录，可在详情页查看收容措施、描述及附录。" : "该编号位于目录中，正文尚未收录。";
    badges.innerHTML = S.badge(item) + " " + S.status(item);
    series.textContent = "SERIES " + S.pad(item.s, 2);
  }

  function renderRandom() {
    var grid = document.getElementById("random-grid");
    var picks = S.randomItems(3);
    if (!picks.length) {
      S.errorBox(grid, "没有可抽取的正文条目。");
      return;
    }
    grid.innerHTML = picks.map(S.entryCard).join("");
    S.initReveal();
  }

  S.loadIndex().then(function (data) {
    var items = data.items;
    var meta = data.meta;
    var filled = items.filter(function (i) { return i.st === "content"; });
    document.getElementById("stat-total").textContent = fmt(meta.total);
    document.getElementById("stat-filled").textContent = fmt(meta.filled);
    document.getElementById("stat-series").textContent = "10";
    document.getElementById("stat-tags").textContent = fmt(meta.topTags ? meta.topTags.length : 0);

    var counts = {};
    filled.forEach(function (i) { counts[i.s] = (counts[i.s] || 0) + 1; });
    S.qa("[data-series-count]").forEach(function (el) {
      var s = parseInt(el.getAttribute("data-series-count"), 10);
      el.textContent = (counts[s] || 0) + " 条正文";
    });

    var pool = filled.slice();
    var pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : items[0];
    renderTerminal(pick);
    renderRandom();

    document.getElementById("random-refresh").addEventListener("click", renderRandom);
  }).catch(function (err) {
    S.errorBox(document.getElementById("random-grid"), "请确认 data/index.json 已上传，并通过网站地址访问。");
    console.error(err);
  });
})();
