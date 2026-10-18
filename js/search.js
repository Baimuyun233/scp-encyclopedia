(function () {
  "use strict";
  var S = window.SCP;
  var PER = 24;
  var all = [];
  var state = { q: "", page: 1 };
  var input, results, summary, range, pagination, form;

  function normalize(q) {
    return q.trim();
  }

  function search(q) {
    var raw = normalize(q);
    if (!raw) return [];
    var lower = raw.toLowerCase();
    var norm = S.normalizeId(raw);
    var scored = [];
    all.forEach(function (i) {
      var title = (i.t || "").toLowerCase();
      var id = i.id.toLowerCase();
      var score = -1;
      if (i.id === norm) score = 100;
      else if (id === lower) score = 95;
      else if (title === lower) score = 90;
      else if (id.indexOf(lower) === 0) score = 80;
      else if (title.indexOf(lower) === 0) score = 70;
      else if (id.indexOf(lower) !== -1) score = 60;
      else if (title.indexOf(lower) !== -1) score = 50;
      if (score >= 0) scored.push({ item: i, score: score });
    });
    scored.sort(function (a, b) {
      if (a.score !== b.score) return b.score - a.score;
      return a.item.n - b.item.n;
    });
    return scored.map(function (x) { return x.item; });
  }

  function makeHref(p) {
    var u = new URLSearchParams();
    if (state.q) u.set("q", state.q);
    if (p > 1) u.set("page", p);
    return "search.html" + (u.toString() ? "?" + u.toString() : "");
  }

  function updateUrl() {
    var u = new URLSearchParams();
    if (state.q) u.set("q", state.q);
    if (state.page > 1) u.set("page", state.page);
    history.replaceState(null, "", "search.html" + (u.toString() ? "?" + u.toString() : ""));
  }

  function render() {
    var q = state.q.trim();
    input.value = q;
    if (!q) {
      summary.textContent = "输入关键词开始检索";
      range.textContent = "";
      results.innerHTML = '<div class="empty"><strong>等待查询</strong><p>编号与标题支持部分匹配。也可以从全编号目录进入。</p></div>';
      pagination.innerHTML = "";
      updateUrl();
      return;
    }
    var list = search(q);
    var pages = Math.max(1, Math.ceil(list.length / PER));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * PER;
    var pageItems = list.slice(start, start + PER);
    summary.textContent = "“" + q + "” · 共 " + list.length.toLocaleString("zh-CN") + " 条结果";
    range.textContent = list.length ? (start + 1) + " — " + Math.min(start + PER, list.length) : "";
    if (!pageItems.length) {
      results.innerHTML = '<div class="empty"><strong>没有找到匹配档案</strong><p>尝试只输入数字，或使用更短的标题片段。</p></div>';
      pagination.innerHTML = "";
      updateUrl();
      return;
    }
    results.innerHTML = '<div class="entry-grid">' + pageItems.map(S.entryCard).join("") + "</div>";
    pagination.innerHTML = S.pagination(list.length, state.page, PER, makeHref);
    updateUrl();
    S.initReveal();
  }

  function go(q) {
    state.q = normalize(q);
    state.page = 1;
    render();
  }

  S.loadIndex().then(function (data) {
    all = data.items;
    input = document.getElementById("search-input");
    results = document.getElementById("search-results");
    summary = document.getElementById("search-summary");
    range = document.getElementById("search-range");
    pagination = document.getElementById("search-pagination");
    form = document.getElementById("search-form");

    state.q = S.getParam("q") || "";
    state.page = Math.max(1, parseInt(S.getParam("page") || "1", 10) || 1);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      go(input.value);
    });
    input.addEventListener("input", S.debounce(function () {
      state.page = 1;
      state.q = input.value;
      render();
    }, 180));

    render();
  }).catch(function (err) {
    S.errorBox(document.getElementById("search-results"), "请确认 data/index.json 已上传，并通过网站地址访问。");
    console.error(err);
  });
})();
