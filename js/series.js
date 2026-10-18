(function () {
  "use strict";
  var S = window.SCP;
  var PER = 40;
  var all = [];
  var meta = null;
  var state = { series: 1, cls: "", page: 1 };
  var el = {};

  function readState() {
    state.series = Math.min(10, Math.max(1, parseInt(S.getParam("series") || "1", 10) || 1));
    state.cls = S.getParam("class") || "";
    state.page = Math.max(1, parseInt(S.getParam("page") || "1", 10) || 1);
  }

  function updateUrl() {
    var u = new URLSearchParams();
    u.set("series", state.series);
    if (state.cls) u.set("class", state.cls);
    if (state.page > 1) u.set("page", state.page);
    history.replaceState(null, "", "series.html?" + u.toString());
  }

  function seriesItems() {
    return all.filter(function (i) { return i.s === state.series; }).sort(function (a, b) { return a.n - b.n; });
  }

  function makeHref(p) {
    var u = new URLSearchParams();
    u.set("series", state.series);
    if (state.cls) u.set("class", state.cls);
    if (p > 1) u.set("page", p);
    return "series.html?" + u.toString();
  }

  function renderHead(items) {
    var r = S.seriesRange(state.series);
    var filled = items.filter(function (i) { return i.st === "content"; });
    var classes = {};
    filled.forEach(function (i) { classes[i.c] = 1; });
    el.kicker.textContent = "SERIES " + S.pad(state.series, 2) + " / " + S.seriesLabel(state.series);
    el.title.textContent = "系列 " + S.pad(state.series, 2);
    el.desc.textContent = "SCP-" + (r[0] < 1000 ? S.pad(r[0], 3) : r[0]) + " 至 SCP-" + r[1] + " 的全部编号档案。";
    el.total.textContent = items.length.toLocaleString("zh-CN");
    el.filled.textContent = filled.length.toLocaleString("zh-CN");
    el.classes.textContent = Object.keys(classes).length || "—";
    el.cover.src = "assets/images/series-" + S.pad(state.series, 2) + ".svg";
    el.cover.alt = "系列 " + S.pad(state.series, 2) + " 封面";
    document.title = "系列 " + S.pad(state.series, 2) + " — SCP 基金会中文档案数据库";
  }

  function renderTabs() {
    var html = "";
    for (var s = 1; s <= 10; s++) {
      html += '<a href="series.html?series=' + s + '" class="' + (s === state.series ? "active" : "") + '">' + S.pad(s, 2) + "</a>";
    }
    el.tabs.innerHTML = html;
  }

  function renderClassChips(items) {
    var counts = {};
    items.forEach(function (i) {
      if (i.st === "content") counts[i.c] = (counts[i.c] || 0) + 1;
    });
    var classes = (meta.classes || []).filter(function (c) { return counts[c]; });
    var html = '<button type="button" class="chip' + (!state.cls ? " active" : "") + '" data-class="">全部 <span class="n">' + items.length + "</span></button>";
    html += classes.map(function (c) {
      return '<button type="button" class="chip' + (state.cls === c ? " active" : "") + '" data-class="' + S.esc(c) + '">' + S.esc(c) + ' <span class="n">' + counts[c] + "</span></button>";
    }).join("");
    el.classChips.innerHTML = html;
  }

  function render() {
    var base = seriesItems();
    renderHead(base);
    var list = state.cls ? base.filter(function (i) { return i.c === state.cls; }) : base;
    renderClassChips(base);
    var pages = Math.max(1, Math.ceil(list.length / PER));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * PER;
    var pageItems = list.slice(start, start + PER);
    el.count.textContent = list.length.toLocaleString("zh-CN");
    el.range.textContent = list.length ? (start + 1) + " — " + Math.min(start + PER, list.length) : "0";
    if (!pageItems.length) {
      el.list.innerHTML = '<div class="empty"><strong>该筛选下没有记录</strong><p>切换到其他项目等级或返回全部。</p></div>';
      el.pagination.innerHTML = "";
    } else {
      el.list.innerHTML = '<div class="compact-list">' + pageItems.map(S.compactRow).join("") + "</div>";
      el.pagination.innerHTML = S.pagination(list.length, state.page, PER, makeHref);
    }
    updateUrl();
  }

  S.loadIndex().then(function (data) {
    all = data.items;
    meta = data.meta;
    el.kicker = document.getElementById("series-kicker");
    el.title = document.getElementById("series-title");
    el.desc = document.getElementById("series-desc");
    el.total = document.getElementById("series-total");
    el.filled = document.getElementById("series-filled");
    el.classes = document.getElementById("series-classes");
    el.cover = document.getElementById("series-cover");
    el.tabs = document.getElementById("series-tabs");
    el.classChips = document.getElementById("series-class-chips");
    el.count = document.getElementById("series-count");
    el.range = document.getElementById("series-range");
    el.list = document.getElementById("series-list");
    el.pagination = document.getElementById("series-pagination");
    readState();
    renderTabs();
    render();
    el.classChips.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-class]");
      if (!btn) return;
      state.cls = btn.getAttribute("data-class");
      state.page = 1;
      render();
    });
  }).catch(function (err) {
    S.errorBox(document.getElementById("series-list"), "请确认 data/index.json 已上传，并通过网站地址访问。");
    console.error(err);
  });
})();
