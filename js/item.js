(function () {
  "use strict";
  var S = window.SCP;
  var root = document.getElementById("item-root");
  var breadcrumb = document.getElementById("breadcrumb");

  function stripText(html) {
    var d = document.createElement("div");
    d.innerHTML = html || "";
    return (d.textContent || "").replace(/\s+/g, " ").trim();
  }

  function blocksHTML(arr) {
    return (arr || []).join("");
  }

  function sourceURL(id) {
    var n = parseInt(String(id).replace(/\D/g, ""), 10);
    return "https://scp-wiki-cn.wikidot.com/" + (n < 1000 ? "scp-" + S.pad(n, 3) : "scp-" + n);
  }

  function itemActions(item) {
    var src = item.src || sourceURL(item.id);
    return '<div class="actions">' +
      (item.st !== "missing" ? '<a class="btn btn-sm" href="' + S.esc(src) + '" target="_blank" rel="noopener noreferrer">原文</a>' : "") +
      '<button class="btn btn-sm btn-ghost" type="button" id="random-item">随机档案</button></div>';
  }

  function sidePanel(item, p) {
    var tags = p && p.tags && p.tags.length ? S.tagsHTML({ g: p.tags }, 20, true) : (item.g && item.g.length ? S.tagsHTML(item, 20, true) : '<span class="dim">无标签</span>');
    var wc = p && p.wc ? p.wc : item.w;
    var caption = p && p.imgCaption ? p.imgCaption : "未附图像 · 编号占位图";
    var src = (p && p.src) || (item.st !== "missing" ? sourceURL(item.id) : "");
    return '<aside class="side-panel">' +
      '<div class="side-media"><img src="' + S.media(item) + '" alt="' + S.esc(item.id + " " + item.t) + '" loading="lazy"><div class="cap">' + S.esc(caption) + "</div></div>" +
      '<div class="side-block"><h3>档案数据</h3>' +
      '<div class="side-kv"><span>编号</span><b>' + S.esc(item.id) + "</b></div>" +
      '<div class="side-kv"><span>等级</span><b>' + S.esc(item.c || "未知") + "</b></div>" +
      '<div class="side-kv"><span>系列</span><b>系列 ' + S.pad(item.s, 2) + "</b></div>" +
      '<div class="side-kv"><span>正文</span><b>' + (wc ? Number(wc).toLocaleString("zh-CN") + " 字" : "未收录") + "</b></div>" +
      '<div class="side-kv"><span>状态</span><b>' + S.esc(S.statusLabel(item.st)) + "</b></div>" +
      "</div>" +
      '<div class="side-block"><h3>标签</h3>' + (tags || '<span class="dim">无标签</span>') + "</div>" +
      '<div class="side-block"><h3>来源</h3>' +
      (src ? '<p class="side-note" style="margin:0 0 9px">SCP 基金会中文维基公开条目。文本遵循 CC BY-SA 3.0。</p><a class="btn btn-sm" style="width:100%" href="' + S.esc(src) + '" target="_blank" rel="noopener noreferrer">查看原文</a>' : '<p class="side-note" style="margin:0">该编号暂无公开原文。</p>') +
      "</div>" +
      '<div class="side-block"><h3>操作</h3><div class="side-actions">' +
      '<button class="btn btn-sm btn-ghost" type="button" id="copy-link">复制本页链接</button>' +
      '<button class="btn btn-sm btn-ghost" type="button" id="random-item-2">随机档案</button>' +
      "</div></div>" +
      '<p class="side-note">配图为按编号生成的矢量占位图，不是原始档案图像。</p>' +
      "</aside>";
  }

  function itemNav(item) {
    var items = S.getItems();
    var prev = item.n > 1 ? items[item.n - 2] : null;
    var next = item.n < 9999 ? items[item.n] : null;
    if (!prev && !next) return "";
    function cell(it, dir) {
      if (!it) return "<span></span>";
      return '<a href="item.html?id=' + encodeURIComponent(it.id) + '"><small>' + (dir === "prev" ? "PREVIOUS" : "NEXT") + '</small><b><i>' + S.esc(it.id) + "</i>" + S.esc(it.t || "未命名档案") + "</b></a>";
    }
    return '<nav class="item-nav" aria-label="相邻档案">' + cell(prev, "prev") + cell(next, "next") + "</nav>";
  }

  function notFound(id) {
    breadcrumb.innerHTML = '<a href="index.html">首页</a><span>/</span><a href="browse.html">全编号目录</a><span>/</span><span>' + S.esc(id || "未指定编号") + "</span>";
    root.innerHTML = '<div class="empty" style="margin-top:30px"><strong>未找到该编号</strong><p>编号应为 SCP-001 至 SCP-9999。可以回到全编号目录重新选择。</p>' +
      '<div style="margin-top:18px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn btn-sm btn-primary" href="browse.html">打开目录</a><a class="btn btn-sm" href="search.html">检索档案</a></div></div>';
  }

  function noContent(item) {
    var messages = {
      catalog: "该编号在中文维基目录中存在，本站尚未收录其正文。",
      restricted: "该编号的完整文档受权限限制，公开目录不保留正文。",
      deleted: "该编号已被删除或废除，当前仅保留目录记录。",
      missing: "该编号暂无公开档案。"
    };
    var src = sourceURL(item.id);
    var body = '<div class="doc-panel"><div class="doc-top"><span><i></i>ARCHIVE DOCUMENT</span><span>STATUS: ' + S.esc(String(item.st).toUpperCase()) + "</span></div>" +
      '<div class="doc-body"><div class="doc-section"><h2><span class="no">00</span>档案状态</h2>' +
      '<div class="doc-text"><p>' + S.esc(messages[item.st] || "该编号暂无可用正文。") + "</p>" +
      (item.st === "catalog" || item.st === "restricted" ? '<p><a href="' + S.esc(src) + '" target="_blank" rel="noopener noreferrer">前往 SCP 基金会中文维基查看该条目</a></p>' : "") +
      "</div></div></div></div>";
    return body;
  }

  function renderItem(item, p, chunkError) {
    document.title = item.id + (item.t ? " " + item.t : "") + " — SCP 基金会中文档案数据库";
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", item.id + " " + item.t + "，SCP 基金会中文档案。");
    breadcrumb.innerHTML = '<a href="index.html">首页</a><span>/</span><a href="browse.html">全编号目录</a><span>/</span><a href="series.html?series=' + item.s + '">系列 ' + S.pad(item.s, 2) + "</a><span>/</span><span>" + S.esc(item.id) + "</span>";

    var isContent = !!(p && item.st === "content");
    var sensitive = !!(p && p.sensitive);
    var head = '<header class="item-head"><div>' +
      '<div class="id-line"><span class="id">' + S.esc(item.id) + "</span>" + S.badge({ c: (p && p.cls) || item.c }) + S.status(item) +
      (sensitive ? '<span class="status status-deleted">敏感内容</span>' : "") + "</div>" +
      "<h1>" + S.esc(item.t || "未命名档案") + "</h1>" +
      '<div class="subline"><span>系列 ' + S.pad(item.s, 2) + " / " + S.seriesLabel(item.s) + "</span><span>SCP 基金会中文维基</span>" +
      (p && p.wc ? "<span>" + Number(p.wc).toLocaleString("zh-CN") + " 字</span>" : "") + "</div>" +
      (p && p.tags ? '<div style="margin-top:12px">' + S.tagsHTML({ g: p.tags }, 8, true) + "</div>" : "") +
      "</div>" + itemActions(item) + "</header>";

    var body;
    if (!isContent) {
      body = noContent(item);
      if (chunkError) body = '<div class="empty" style="margin-bottom:18px"><strong>正文分片载入失败</strong><p>' + S.esc(chunkError) + "</p></div>" + body;
    } else {
      var intro = blocksHTML(p.intro);
      var introText = stripText(intro);
      var introIsWarning = intro && /警告|权限|權限|授权|授權|安保|模因|O5|HMCL/.test(introText) && introText.length < 1600;
      var gated = "";
      if (intro) {
        gated += introIsWarning
          ? '<div class="doc-intro">' + intro + "</div>"
          : '<div class="doc-text lead" style="margin-bottom:30px">' + intro + "</div>";
      }
      if (p.containment && p.containment.length) {
        gated += '<section class="doc-section"><h2><span class="no">01</span>收容措施</h2><div class="doc-text">' + blocksHTML(p.containment) + "</div></section>";
      }
      if (p.description && p.description.length) {
        gated += '<section class="doc-section"><h2><span class="no">02</span>描述</h2><div class="doc-text">' + blocksHTML(p.description) + "</div></section>";
      }
      if (!gated) {
        gated = '<div class="empty"><strong>正文为空</strong><p>该条目暂无可显示的文本。</p></div>';
      }
      if (p.addenda && p.addenda.length) {
        gated += '<div class="addenda"><h2>附录与补充记录</h2>' + p.addenda.map(function (a) {
          return '<details class="addendum"><summary>' + S.esc(a.h || "补充记录") + '</summary><div class="addendum-body doc-text">' + (a.b && a.b.length ? blocksHTML(a.b) : "") + "</div></details>";
        }).join("") + "</div>";
      }
      var gate = "";
      if (sensitive) {
        var stags = (p.sensitiveTags && p.sensitiveTags.length) ? '<div class="tag-list" style="margin-top:10px">' + p.sensitiveTags.map(function (t) { return '<span class="tag is-sensitive">' + S.esc(t) + "</span>"; }).join("") + "</div>" : "";
        gate = '<div class="sensitive" id="sensitive-gate"><div class="gate"><div class="flag">CONTENT WARNING / 敏感内容</div><h2>该档案默认折叠</h2>' +
          "<p>内容可能涉及成人、暴力、性、自残或其他引起不适的描写。展开前请确认你已成年并自愿阅读。</p>" + stags +
          '<button class="btn btn-primary" type="button" id="reveal-sensitive">我已知晓，展开档案</button></div></div>';
      }
      body = '<div class="doc-panel"><div class="doc-top"><span><i></i>ARCHIVE DOCUMENT</span><span>' +
        (sensitive ? "ACCESS: RESTRICTED" : "ACCESS: PUBLIC ARCHIVE") + "</span></div>" +
        '<div class="doc-body">' + gate + '<div class="gated" id="gated"' + (sensitive ? " hidden" : "") + ">" + gated + "</div></div></div>";
    }

    root.innerHTML = head + '<div class="item-layout">' + body + sidePanel(item, p) + "</div>" + itemNav(item) + (p && p.addenda && p.addenda.length ? "" : "");

    var reveal = document.getElementById("reveal-sensitive");
    if (reveal) {
      reveal.addEventListener("click", function () {
        var gateEl = document.getElementById("sensitive-gate");
        var gatedEl = document.getElementById("gated");
        if (gateEl) gateEl.classList.add("is-open");
        if (gatedEl) gatedEl.hidden = false;
        var y = gatedEl ? gatedEl.getBoundingClientRect().top + window.scrollY - 90 : window.scrollY;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    }
    bindActions(item);
  }

  function bindActions(item) {
    var buttons = [document.getElementById("random-item"), document.getElementById("random-item-2")];
    buttons.forEach(function (b) {
      if (!b) return;
      b.addEventListener("click", function () {
        var pool = S.randomItems(1);
        if (pool.length) location.href = "item.html?id=" + encodeURIComponent(pool[0].id);
      });
    });
    var copy = document.getElementById("copy-link");
    if (copy) {
      copy.addEventListener("click", function () {
        var url = window.location.href;
        function done() {
          copy.textContent = "已复制";
          setTimeout(function () { copy.textContent = "复制本页链接"; }, 1600);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, function () { window.prompt("复制本页链接", url); });
        } else {
          window.prompt("复制本页链接", url);
        }
      });
    }
  }

  S.loadIndex().then(function (data) {
    var items = data.items;
    var meta = data.meta;
    var raw = S.getParam("id");
    var id = S.normalizeId(raw);
    if (!raw) {
      notFound("");
      return;
    }
    var item = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) { item = items[i]; break; }
    }
    if (!item) {
      notFound(id);
      return;
    }
    if (item.st !== "content" || item.k < 0) {
      renderItem(item, null);
      return;
    }
    var chunk = meta.chunks[item.k];
    if (!chunk) {
      renderItem(item, null, "分片索引缺失。");
      return;
    }
    S.fetchJSON("data/" + chunk.file).then(function (payload) {
      var p = payload.items[item.id];
      if (!p) {
        renderItem(item, null, "分片中未找到该档案。");
        return;
      }
      renderItem(item, p);
    }).catch(function (err) {
      renderItem(item, null, "无法读取 " + chunk.file);
      console.error(err);
    });
  }).catch(function (err) {
    S.errorBox(root, "请确认 data/index.json 已上传，并通过网站地址访问。");
    console.error(err);
  });
})();
