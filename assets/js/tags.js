/* InfectedLab - tags.js (multi-lang)
 * Etiket bulutu + filtreli liste. data/posts.json'u okur.
 * URL: tags.html?t=ransomware -> sadece "ransomware" etiketli postları gösterir.
 * i18n: aktif dile göre title/excerpt/category/label çıkar.
 */
(function () {
  var cloudEl = document.getElementById("tag-cloud");
  var resultsEl = document.getElementById("tag-results");
  var emptyEl = document.getElementById("tag-empty");
  var titleEl = document.getElementById("page-title");
  var subtitleEl = document.getElementById("page-subtitle");

  var data = null;
  var activeTag = null;

  function qs(name) {
    var m = new RegExp("[?&]" + name + "=([^&]+)").exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c];
    });
  }
  function tagColor(slug) {
    var palette = ["red", "violet", "bone"];
    var sum = 0;
    for (var i = 0; i < slug.length; i++) sum += slug.charCodeAt(i);
    return palette[sum % palette.length];
  }
  function getLang() {
    return (window.InfectedLabI18n && window.InfectedLabI18n.current()) || "tr";
  }
  function pick(field) {
    var lang = getLang();
    if (field == null) return "";
    if (typeof field === "string") return field;
    return field[lang] || field.tr || field.en || "";
  }
  function tT(key, vars) {
    if (!window.InfectedLabI18n) return key;
    var v = window.InfectedLabI18n.t(key, vars);
    return v || key;
  }

  function buildLabelMap() {
    var labels = {};
    (data.tags || []).forEach(function (t) {
      labels[t.slug] = pick(t.label);
    });
    return labels;
  }

  function renderCloud() {
    var counts = {};
    data.posts.forEach(function (p) {
      (p.tags || []).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
    });
    var labels = buildLabelMap();

    var html = '<a href="tags.html" class="tag-chip ' + (activeTag ? "" : "tag-chip-active") + '">' + escapeHtml(tT("tags.all")) + ' <span class="tag-count">' + data.posts.length + '</span></a>';
    Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).forEach(function (t) {
      var label = labels[t] || t;
      var color = tagColor(t);
      var active = (t === activeTag) ? "tag-chip-active" : "";
      html += '<a href="tags.html?t=' + encodeURIComponent(t) + '" class="tag-chip tag-' + color + ' ' + active + '">' +
        escapeHtml(label) + ' <span class="tag-count">' + counts[t] + '</span></a>';
    });
    cloudEl.innerHTML = html;
  }

  function renderResults() {
    var posts = data.posts.slice();
    if (activeTag) {
      posts = posts.filter(function (p) { return (p.tags || []).indexOf(activeTag) !== -1; });
    }
    posts.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });

    if (!posts.length) {
      resultsEl.innerHTML = "";
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.textContent = tT("tags.empty");
      }
      return;
    }
    if (emptyEl) emptyEl.hidden = true;

    var labels = buildLabelMap();
    var readLabel = tT("card.read");

    resultsEl.innerHTML = posts.map(function (p) {
      var tagHtml = (p.tags || []).slice(0, 3).map(function (t) {
        return '<a href="tags.html?t=' + encodeURIComponent(t) + '" class="tag tag-' + tagColor(t) + '">' + escapeHtml(labels[t] || t) + '</a>';
      }).join(" ");
      return '<article class="post-card">' +
        '<div class="post-card-meta">' + tagHtml + '<time>' + escapeHtml(p.date || "") + '</time></div>' +
        '<h3><a href="' + escapeHtml(p.url) + '">' + escapeHtml(pick(p.title)) + '</a></h3>' +
        '<p>' + escapeHtml(pick(p.excerpt) || "") + '</p>' +
        '<a href="' + escapeHtml(p.url) + '" class="post-link">' + escapeHtml(readLabel) + '</a>' +
        '</article>';
    }).join("");
  }

  function refreshHeading() {
    if (!titleEl || !subtitleEl) return;
    if (activeTag) {
      var labels = buildLabelMap();
      var label = labels[activeTag] || activeTag;
      titleEl.textContent = tT("tags.tag.title", { t: label });
      subtitleEl.textContent = tT("tags.tag.sub");
      document.title = label + " — " + tT("tags.title") + " — InfectedLab";
    } else {
      titleEl.textContent = tT("tags.title");
      subtitleEl.textContent = tT("tags.sub");
    }
  }

  function renderAll() {
    renderCloud();
    renderResults();
    refreshHeading();
  }

  fetch("data/posts.json", { cache: "no-cache" })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      data = d;
      activeTag = qs("t");
      renderAll();
    })
    .catch(function (err) {
      resultsEl.innerHTML = '<p class="empty-note">' + escapeHtml(tT("tags.indexerr", { e: err.message })) + '</p>';
    });

  // Dil değişince yeniden render et
  document.addEventListener("infectedlab:lang-changed", function () {
    if (data) renderAll();
  });
})();
