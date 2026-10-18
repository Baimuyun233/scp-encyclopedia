/* global window, document */
(function () {
  "use strict";

  var indexPromise = null;
  var indexData = null;
  var DATA = "data/";

  var STATUS = {
    content: "已收录",
    catalog: "目录条目",
    restricted: "权限受限",
    deleted: "已删除",
    missing: "暂无公开档案"
  };

  var CLASS_COLOR = {
    Safe: "#6fbf9b",
    Euclid: "#d6b06a",
    Keter: "#d86868",
    Thaumiel: "#7f9fe0",
    Apollyon: "#c45aa6",
    Neutralized: "#8b98a5",
    Explained: "#78a6c8",
    Archon: "#b08ad6",
    Uncontained: "#d69b63",
    Decommissioned: "#8f8f8f",
    "未知": "#7a8794"
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function truncate(s, n) {
    var a = Array.from(String(s || ""));
    return a.length > n ? a.slice(0, n).join("") + "…" : a.join("");
  }

  function fetchJSON(path) {
    return fetch(path).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status + " " + path);
      return r.json();
    });
  }

  function loadIndex() {
    if (indexData) return Promise.resolve(indexData);
    if (!indexPromise) {
      indexPromise = fetchJSON(DATA + "index.json").then(function (d) {
        indexData = d;
        return d;
      });
    }
    return indexPromise;
  }

  function getItems() {
    return indexData ? indexData.items : [];
  }

  function normalizeId(raw) {
    if (!raw) return "";
    var s = String(raw).trim().toUpperCase().replace(/\s+/g, "");
    var m = s.match(/^(?:SCP-?)?(\d{1,4})$/);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n >= 1 && n <= 9999) return "SCP-" + (n < 1000 ? pad(n, 3) : n);
    }
    return s;
  }

  function pad(n, len) {
    n = String(n);
    while (n.length < len) n = "0" + n;
    return n;
  }

  function byId(id) {
    id = normalizeId(id);
    var items = getItems();
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  }

  function itemNumber(item) {
    return item && typeof item.n === "number" ? item.n : parseInt(String(item.id).replace(/\D/g, ""), 10);
  }

  function seriesOf(n) {
    return Math.min(10, Math.max(1, Math.floor(n / 1000) + 1));
  }

  function seriesRange(s) {
    var start = s === 1 ? 1 : (s - 1) * 1000;
    return [start, s * 1000 - 1];
  }

  function seriesLabel(s) {
    var r = seriesRange(s);
    return (r[0] < 1000 ? pad(r[0], 3) : r[0]) + " — " + r[1];
  }

  function classColor(c) {
    return CLASS_COLOR[c] || "#7a8794";
  }

  function statusLabel(st) {
    return STATUS[st] || "未知状态";
  }

  function tagsOf(item, n) {
    return (item && item.g ? item.g : []).slice(0, n || 3);
  }

  function badge(item) {
    var c = item && item.c ? item.c : "未知";
    return '<span class="class-badge class-' + esc(c) + '">' + esc(c) + "</span>";
  }

  function status(item) {
    var st = item && item.st ? item.st : "missing";
    var label = statusLabel(st);
    if (st === "catalog") label = "目录 · 未收录正文";
    return '<span class="status status-' + esc(st) + '">' + esc(label) + "</span>";
  }

  function tagsHTML(item, n, linkMode) {
    var tags = tagsOf(item, n);
    if (!tags.length) return "";
    return '<div class="tag-list">' + tags.map(function (t) {
      var isSens = /^(成人内容|性|性暗示|性露骨|性侵害|血腥|虐待|虐待儿童|自杀|自残|政治|政治性|生殖性|身体恐怖|精神恐怖|nsfw|adult|gore|sex|abuse)$/i.test(t);
      if (linkMode) {
        return '<a class="tag' + (isSens ? " is-sensitive" : "") + '" href="browse.html?tag=' + encodeURIComponent(t) + '">' + esc(t) + "</a>";
      }
      return '<span class="tag' + (isSens ? " is-sensitive" : "") + '">' + esc(t) + "</span>";
    }).join("") + "</div>";
  }

  function placeholderSVG(item) {
    var id = item && item.id ? item.id : "SCP-000";
    var cls = item && item.c ? item.c : "未知";
    var title = item && item.t ? item.t : "未命名档案";
    var color = classColor(cls);
    var n = itemNumber(item) || 0;
    var mode = Math.abs(n) % 4;
    var geo = "";
    if (mode === 0) {
      geo = '<g fill="none" stroke="' + color + '" stroke-opacity=".38"><circle cx="626" cy="208" r="138"/><circle cx="626" cy="208" r="94"/><circle cx="626" cy="208" r="50"/><path d="M626 38v340M456 208h340"/></g>';
    } else if (mode === 1) {
      geo = '<g fill="none" stroke="' + color + '" stroke-opacity=".38"><path d="M488 330L626 78l138 252z"/><path d="M532 330L626 158l94 172z"/><path d="M444 354h364"/></g>';
    } else if (mode === 2) {
      geo = '<g fill="none" stroke="' + color + '" stroke-opacity=".38"><rect x="514" y="92" width="224" height="224" transform="rotate(14 626 204)"/><rect x="558" y="136" width="136" height="136" transform="rotate(14 626 204)"/><path d="M438 344L790 112"/></g>';
    } else {
      geo = '<g fill="none" stroke="' + color + '" stroke-opacity=".38"><path d="M452 300c42-146 178-230 316-192"/><path d="M470 338c48-112 156-178 270-150"/><path d="M490 376c52-80 126-118 212-102"/></g>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">' +
      '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#070b10"/><stop offset=".6" stop-color="#0b141c"/><stop offset="1" stop-color="#060a0e"/></linearGradient>' +
      '<pattern id="g" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M34 0H0V34" fill="none" stroke="#7fa8b8" stroke-opacity=".09"/></pattern>' +
      '<radialGradient id="glow" cx=".78" cy=".42" r=".6"><stop offset="0" stop-color="' + color + '" stop-opacity=".16"/><stop offset="1" stop-color="' + color + '" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="800" height="450" fill="url(#bg)"/><rect width="800" height="450" fill="url(#g)"/><rect width="800" height="450" fill="url(#glow)"/>' +
      geo +
      '<g fill="' + color + '" opacity=".5"><rect x="36" y="42" width="46" height="2"/><rect x="90" y="42" width="12" height="2"/></g>' +
      '<g font-family="Consolas,Courier New,monospace" fill="#7f98a5" font-size="9" letter-spacing="2.2">' +
      '<text x="36" y="34">FOUNDATION ARCHIVE // VISUAL FILE</text>' +
      '<text x="764" y="34" text-anchor="end">SERIES ' + pad(seriesOf(n), 2) + "</text>" +
      '<text x="764" y="426" text-anchor="end">NO IMAGE ON FILE</text></g>' +
      '<g font-family="Microsoft YaHei,Segoe UI,sans-serif" fill="#dbe7ed">' +
      '<text x="36" y="286" font-size="74" font-weight="700" letter-spacing="1">' + esc(id) + "</text>" +
      '<text x="38" y="334" font-size="19" fill="#9fb6c2">' + esc(truncate(title, 24)) + "</text>" +
      '<text x="38" y="382" font-size="11" letter-spacing="3" fill="' + color + '">' + esc(String(cls).toUpperCase()) + "</text></g>" +
      '<g stroke="' + color + '" stroke-opacity=".42" fill="none"><path d="M20 20h26M20 20v26M780 20h-26M780 20v26M20 430h26M20 430v-26M780 430h-26M780 430v-26"/></g>' +
      '<rect x="36" y="356" width="210" height="5" fill="' + color + '" opacity=".35"/></svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function media(item) {
    return placeholderSVG(item);
  }

  function entryCard(item) {
    var href = "item.html?id=" + encodeURIComponent(item.id);
    var tags = tagsHTML(item, 3, false);
    var wc = item.w ? (item.w > 1000 ? (item.w / 1000).toFixed(1) + "k 字" : item.w + " 字") : "无正文";
    var blurb = {
      content: "档案正文已收录。",
      catalog: "目录中保留编号，正文尚未收录。",
      restricted: "完整文档受权限限制。",
      deleted: "该编号已被删除或废除。",
      missing: "该编号暂无公开档案。"
    }[item.st] || "基金会档案条目。";
    return '<article class="entry-card fade-up">' +
      '<a class="entry-media" href="' + href + '" tabindex="-1" aria-hidden="true">' +
      '<img src="' + media(item) + '" alt="' + esc(item.id + " " + item.t) + '" loading="lazy">' +
      '<span class="overlay-id">' + esc(item.id) + "</span></a>" +
      '<div class="entry-body"><div class="entry-top">' + badge(item) + status(item) + "</div>" +
      '<h3><a href="' + href + '">' + esc(item.t || "未命名档案") + "</a></h3>" +
      '<div class="entry-desc">' + (tags || '<span class="dim">' + esc(blurb) + "</span>") + "</div>" +
      '<div class="entry-foot"><span class="mono" style="font-size:9px;color:var(--faint)">' + esc(wc) + '</span><span class="mono" style="font-size:9px;color:var(--faint)">' + esc("系列 " + pad(seriesOf(item.n), 2)) + "</span></div>" +
      "</div></article>";
  }

  function compactRow(item) {
    var href = "item.html?id=" + encodeURIComponent(item.id);
    return '<a class="compact-row" href="' + href + '">' +
      '<span class="num">' + esc(item.id) + "</span>" +
      '<span class="name">' + esc(item.t || "未命名档案") + "<small>" + esc(seriesLabel(seriesOf(item.n))) + "</small></span>" +
      badge(item) + status(item) + "</a>";
  }

  function pageHref(base, page) {
    var u = new URL(base, window.location.href);
    u.searchParams.set("page", page);
    return u.pathname.split("/").pop() + u.search;
  }

  function pagination(total, page, per, makeHref) {
    var pages = Math.max(1, Math.ceil(total / per));
    page = Math.max(1, Math.min(pages, page));
    if (pages <= 1) return "";
    var out = [];
    function link(p, label, cls) {
      if (p === page) return '<span class="current">' + (label || p) + "</span>";
      return '<a class="' + (cls || "") + '" href="' + esc(makeHref(p)) + '">' + (label || p) + "</a>";
    }
    out.push(page > 1 ? link(page - 1, "上一页") : '<span class="gap">上一页</span>');
    var nums = [];
    nums.push(1);
    for (var i = page - 2; i <= page + 2; i++) if (i > 1 && i < pages) nums.push(i);
    if (pages > 1) nums.push(pages);
    nums = nums.filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
    var prev = 0;
    nums.forEach(function (p) {
      if (prev && p - prev > 1) out.push('<span class="gap">…</span>');
      out.push(link(p));
      prev = p;
    });
    out.push(page < pages ? link(page + 1, "下一页") : '<span class="gap">下一页</span>');
    return '<nav class="pagination" aria-label="分页">' + out.join("") + "</nav>";
  }

  function groupBySeries(items) {
    var map = {};
    items.forEach(function (it) {
      (map[it.s] = map[it.s] || []).push(it);
    });
    return Object.keys(map).sort(function (a, b) { return a - b; }).map(function (k) {
      return { series: parseInt(k, 10), items: map[k] };
    });
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function setParam(name, value) {
    var u = new URL(window.location.href);
    if (value === null || value === undefined || value === "") u.searchParams.delete(name);
    else u.searchParams.set(name, value);
    history.replaceState(null, "", u.pathname.split("/").pop() + u.search + u.hash);
  }

  function debounce(fn, ms) {
    var t = null;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  function fileNotice() {
    if (window.location.protocol !== "file:") return;
    var bar = document.createElement("div");
    bar.className = "file-notice";
    bar.textContent = "当前以本地文件方式打开，浏览器会阻止读取 data/ 目录。请按 DEPLOY.md 部署到 GitHub Pages 后访问。";
    document.body.insertBefore(bar, document.body.firstChild);
  }

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    var page = document.body.getAttribute("data-page");
    document.querySelectorAll(".site-nav a").forEach(function (a) {
      if (a.getAttribute("data-nav") === page) a.classList.add("active");
    });
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
    var top = document.createElement("button");
    top.className = "to-top";
    top.type = "button";
    top.setAttribute("aria-label", "回到顶部");
    top.innerHTML = "↑";
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(top);
    window.addEventListener("scroll", function () {
      top.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });
  }

  var revealObserver = null;
  function initReveal() {
    var nodes = document.querySelectorAll(".fade-up:not(.in)");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("in"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            revealObserver.unobserve(e.target);
          }
        });
      }, { rootMargin: "0px 0px -30px 0px", threshold: 0.04 });
    }
    nodes.forEach(function (n) { revealObserver.observe(n); });
  }

  function errorBox(el, msg) {
    if (!el) return;
    el.innerHTML = '<div class="empty"><strong>数据未能载入</strong><p>' + esc(msg || "请刷新页面后重试。") + "</p></div>";
  }

  function randomItems(count) {
    var filled = getItems().filter(function (i) { return i.st === "content"; });
    var out = [];
    var used = {};
    var guard = 0;
    while (out.length < count && guard < 1000 && filled.length) {
      guard++;
      var i = Math.floor(Math.random() * filled.length);
      if (used[filled[i].id]) continue;
      used[filled[i].id] = true;
      out.push(filled[i]);
    }
    return out;
  }

  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  window.SCP = {
    DATA: DATA,
    fetchJSON: fetchJSON,
    loadIndex: loadIndex,
    getItems: getItems,
    getMeta: function () { return indexData ? indexData.meta : null; },
    byId: byId,
    normalizeId: normalizeId,
    seriesOf: seriesOf,
    seriesRange: seriesRange,
    seriesLabel: seriesLabel,
    classColor: classColor,
    statusLabel: statusLabel,
    badge: badge,
    status: status,
    tagsHTML: tagsHTML,
    placeholderSVG: placeholderSVG,
    media: media,
    entryCard: entryCard,
    compactRow: compactRow,
    pagination: pagination,
    groupBySeries: groupBySeries,
    getParam: getParam,
    setParam: setParam,
    debounce: debounce,
    initNav: initNav,
    initReveal: initReveal,
    errorBox: errorBox,
    randomItems: randomItems,
    esc: esc,
    truncate: truncate,
    pad: pad,
    q: q,
    qa: qa
  };

  document.addEventListener("DOMContentLoaded", function () {
    fileNotice();
    initNav();
    initReveal();
  });
})();
