(function () {
  "use strict";
  var S = window.SCP;
  var PER = 24;
  var all = [];
  var meta = null;
  var state = { q: "", cls: "", tag: "", status: "", series: 0, page: 1 };
  var el = {};

  function readState() {
    state.q = S.getParam("q") || "";
    state.cls = S.getParam("class") || "";
    state.tag = S.getParam("tag") || "";
    state.status = S.getParam("status") || "";
    state.series = parseInt(S.getParam("series") || "0", 10) || 0;
    state.page = Math.max(1, parseInt(S.getParam("page") || "1", 10) || 1);
  }

  function writeState() {
    var u = new URL("browse.html", window.location.href);
    if (state.q) u.searchParams.set("q", state.q);
    if (state.cls) u.searchParams.set("class", state.cls);
    if (state.tag) u.searchParams.set("tag", state.tag);
    if (state.status) u.searchParams.set("status", state.status);
    if (state.series) u.searchParams.set("series", state.series);
    if (state.page > 1) u.searchParams.set("page", state.page);
    history.replaceState(null, "", "browse.html" + (u.search || ""));
  }

  function countBy(keyFn) {
    var m = {};
    all.forEach(function (i) {
      var k = keyFn(i);
      if (k) m[k] = (m[k] || 0) + 1;
    });
    return m;
  }

  function buildClassChips() {
    var counts = {};
    all.forEach(function (i) {
      if (i.st === "content") counts[i.c] = (counts[i.c] || 0) + 1;
    });
    var classes = (meta.classes || []).filter(function (c) { return counts[c]; });
    var html = '<button type="button" class="chip' + (!state.cls ? " active" : "") + '" data-class="">全部 <span class="n">' + all.length + "</span></button>";
    html += classes.map(function (c) {
      return '<button type="button" class="chip' + (state.cls === c ? " active" : "") + '" data-class="' + S.esc(c) + '">' + S.esc(c) + ' <span class="n">' + counts[c] + "</span></button>";
    }).join("");
    el.classChips.innerHTML = html;
  }

  function buildTagOptions() {
    var counts = countBy(function (i) { return null; });
    all.forEach(function (i) {
      (i.g || []).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
    });
    var tags = (meta.topTags || []).slice();
    if (state.tag && tags.indexOf(state.tag) === -1) tags.unshift(state.tag);
    var html = '<option value="">全部标签</option>' + tags.map(function (t) {
      return '<option value="' + S.esc(t) + '">' + S.esc(t) + "  ·  " + (counts[t] || 0) + "</option>";
    }).join("");
    el.tagSelect.innerHTML = html;
    el.tagSelect.value = state.tag || "";
  }

  function buildSeriesJump() {
    var parts = ['<a href="browse.html" class="' + (!state.series ? "active" : "") + '" data-series="0">全部</a>'];
    for (var s = 1; s <= 10; s++) {
      parts.push('<a href="browse.html?series=' + s + '" class="' + (state.series === s ? "active" : "") + '" data-series="' + s + '">系列 ' + S.pad(s, 2) + "</a>");
    }
    el.seriesJump.innerHTML = parts.join("");
    S.qa("[data-series]", el.seriesJump).forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        state.series = parseInt(a.getAttribute("data-series"), 10);
        state.page = 1;
        writeState();
        render();
        buildSeriesJump();
      });
    });
  }

  function filtered() {
    var q = state.q.trim().toLowerCase();
    return all.filter(function (i) {
      if (state.series && i.s !== state.series) return false;
      if (state.cls && i.c !== state.cls) return false;
      if (state.status && i.st !== state.status) return false;
      if (state.tag && (i.g || []).indexOf(state.tag) === -1) return false;
      if (q) {
        var hay = (i.id + " " + i.t).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    }).sort(function (a, b) { return a.n - b.n; });
  }

  function makeHref(p) {
    var u = new URLSearchParams();
    if (state.q) u.set("q", state.q);
    if (state.cls) u.set("class", state.cls);
    if (state.tag) u.set("tag", state.tag);
    if (state.status) u.set("status", state.status);
    if (state.series) u.set("series", state.series);
    if (p > 1) u.set("page", p);
    return "browse.html" + (u.toString() ? "?" + u.toString() : "");
  }

  function render() {
    var list = filtered();
    var pages = Math.max(1, Math.ceil(list.length / PER));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * PER;
    var pageItems = list.slice(start, start + PER);
    el.count.textContent = list.length.toLocaleString("zh-CN");
    el.range.textContent = list.length ? (start + 1).toLocaleString("zh-CN") + " — " + Math.min(start + PER, list.length).toLocaleString("zh-CN") : "0";
    if (!pageItems.length) {
      el.results.innerHTML = '<div class="empty"><strong>没有匹配的档案</strong><p>调整关键词或筛选条件后再试。</p></div>';
      el.pagination.innerHTML = "";
      writeState();
      return;
    }
    var groups = S.groupBySeries(pageItems);
    var groupCounts = {};
    list.forEach(function (i) { groupCounts[i.s] = (groupCounts[i.s] || 0) + 1; });
    el.results.innerHTML = groups.map(function (g) {
      return '<section class="browse-group"><div class="group-head"><h2>系列 ' + S.pad(g.series, 2) + " / " + S.seriesLabel(g.series) + '</h2><span>' + groupCounts[g.series] + " 条</span></div>" +
        '<div class="entry-grid">' + g.items.map(S.entryCard).join("") + "</div></section>";
    }).join("");
    el.pagination.innerHTML = S.pagination(list.length, state.page, PER, makeHref);
    writeState();
    S.initReveal();
  }

  function bind() {
    el.q.addEventListener("input", S.debounce(function () {
      state.q = el.q.value;
      state.page = 1;
      render();
    }, 160));
    el.tagSelect.addEventListener("change", function () {
      state.tag = el.tagSelect.value;
      state.page = 1;
      render();
    });
    el.statusSelect.addEventListener("change", function () {
      state.status = el.statusSelect.value;
      state.page = 1;
      render();
    });
    el.classChips.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-class]");
      if (!btn) return;
      state.cls = btn.getAttribute("data-class");
      state.page = 1;
      S.qa(".chip", el.classChips).forEach(function (c) { c.classList.toggle("active", c === btn); });
      render();
    });
    S.qa("[data-clear]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.cls = "";
        state.page = 1;
        buildClassChips();
        render();
      });
    });
    el.reset.addEventListener("click", function () {
      state = { q: "", cls: "", tag: "", status: "", series: 0, page: 1 };
      el.q.value = "";
      el.tagSelect.value = "";
      el.statusSelect.value = "";
      buildClassChips();
      buildTagOptions();
      buildSeriesJump();
      history.replaceState(null, "", "browse.html");
      render();
    });
  }

  S.loadIndex().then(function (data) {
    all = data.items;
    meta = data.meta;
    el.q = document.getElementById("filter-q");
    el.classChips = document.getElementById("class-chips");
    el.tagSelect = document.getElementById("tag-select");
    el.statusSelect = document.getElementById("status-select");
    el.reset = document.getElementById("reset-filters");
    el.seriesJump = document.getElementById("series-jump");
    el.results = document.getElementById("browse-results");
    el.pagination = document.getElementById("browse-pagination");
    el.count = document.getElementById("result-count");
    el.range = document.getElementById("result-range");
    document.getElementById("meta-total").textContent = meta.total.toLocaleString("zh-CN");
    document.getElementById("meta-filled").textContent = meta.filled.toLocaleString("zh-CN");
    readState();
    el.q.value = state.q;
    el.statusSelect.value = state.status || "";
    buildClassChips();
    buildTagOptions();
    buildSeriesJump();
    render();
    bind();
  }).catch(function (err) {
    S.errorBox(document.getElementById("browse-results"), "请确认 data/index.json 已上传，并通过网站地址访问。");
    console.error(err);
  });
})();
