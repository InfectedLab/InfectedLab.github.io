/* The Black Forge - search.js (multi-lang)
 * Lunr.js tabanlı istemci taraflı arama. data/posts.json üzerinden,
 * her dil için ayrı bir indeks kurar; aktif dile göre query yürütür.
 */
(function () {
  var input = document.getElementById("search-input");
  var status = document.getElementById("search-status");
  var results = document.getElementById("search-results");

  var indexes = {};   // lang -> lunr.Index
  var docs = {};      // slug -> post object
  var rawData = null;

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
    return (window.BlackForgeI18n && window.BlackForgeI18n.current()) || "tr";
  }
  function pick(field) {
    var lang = getLang();
    if (field == null) return "";
    if (typeof field === "string") return field;
    return field[lang] || field.tr || field.en || "";
  }
  function tT(key, vars) {
    if (!window.BlackForgeI18n) return key;
    var v = window.BlackForgeI18n.t(key, vars);
    return v || key;
  }
  function highlight(text, query) {
    if (!query) return escapeHtml(text);
    var safe = escapeHtml(text);
    var terms = query.split(/\s+/).filter(Boolean).map(function (t) {
      return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    });
    if (!terms.length) return safe;
    var re = new RegExp("(" + terms.join("|") + ")", "gi");
    return safe.replace(re, '<mark>$1</mark>');
  }

  function buildLabelMap() {
    var labels = {};
    (rawData.tags || []).forEach(function (t) { labels[t.slug] = pick(t.label); });
    return labels;
  }

  function render(matches, query) {
    if (!matches.length) {
      results.innerHTML = '<p class="empty-note">' + escapeHtml(tT("search.empty")) + '</p>';
      return;
    }
    var labels = buildLabelMap();
    var readLabel = tT("card.read");
    results.innerHTML = matches.map(function (m) {
      var p = docs[m.ref];
      if (!p) return "";
      var tagHtml = (p.tags || []).slice(0, 3).map(function (t) {
        return '<a href="tags.html?t=' + encodeURIComponent(t) + '" class="tag tag-' + tagColor(t) + '">' +
          escapeHtml(labels[t] || t) + '</a>';
      }).join(" ");
      return '<article class="post-card">' +
        '<div class="post-card-meta">' + tagHtml + '<time>' + escapeHtml(p.date || "") + '</time></div>' +
        '<h3><a href="' + escapeHtml(p.url) + '">' + highlight(pick(p.title), query) + '</a></h3>' +
        '<p>' + highlight(pick(p.excerpt) || "", query) + '</p>' +
        '<a href="' + escapeHtml(p.url) + '" class="post-link">' + escapeHtml(readLabel) + '</a>' +
        '</article>';
    }).join("");
  }

  function buildIndexFor(lang) {
    return lunr(function () {
      this.ref("slug");
      this.field("title", { boost: 10 });
      this.field("excerpt", { boost: 3 });
      this.field("tags", { boost: 5 });
      this.field("berserk", { boost: 4 });
      this.field("category");

      var labels = {};
      (rawData.tags || []).forEach(function (t) {
        labels[t.slug] = (t.label && (t.label[lang] || t.label.tr)) || t.slug;
      });

      rawData.posts.forEach(function (p) {
        var title    = (typeof p.title === "string") ? p.title    : (p.title[lang]    || p.title.tr || "");
        var excerpt  = (typeof p.excerpt === "string") ? p.excerpt : (p.excerpt[lang] || p.excerpt.tr || "");
        var category = (typeof p.category === "string") ? p.category : (p.category && (p.category[lang] || p.category.tr)) || "";
        // tags: hem slug hem aktif dil etiketi indekse
        var tagText = (p.tags || []).map(function (t) {
          return t + " " + (labels[t] || "");
        }).join(" ");
        this.add({
          slug: p.slug,
          title: title,
          excerpt: excerpt,
          tags: tagText,
          berserk: p.berserk,
          category: category
        });
      }, this);
    });
  }

  function search(q) {
    q = (q || "").trim();
    var lang = getLang();
    var idx = indexes[lang];
    if (!idx) {
      // İndeksi tembelce kur
      idx = indexes[lang] = buildIndexFor(lang);
    }
    if (!q) {
      var all = Object.keys(docs).map(function (k) { return { ref: k, score: 0 }; });
      all.sort(function (a, b) { return (docs[b.ref].date || "").localeCompare(docs[a.ref].date || ""); });
      render(all, "");
      status.textContent = tT("search.status.all");
      return;
    }
    try {
      var query = q.split(/\s+/).filter(Boolean).map(function (t) { return t + "*"; }).join(" ");
      var matches = idx.search(query);
      render(matches, q);
      status.textContent = tT("search.status.results", { n: matches.length });
    } catch (e) {
      status.textContent = tT("search.status.error", { e: e.message });
    }
  }

  fetch("data/posts.json", { cache: "no-cache" })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      rawData = data;
      data.posts.forEach(function (p) { docs[p.slug] = p; });

      input.disabled = false;
      input.focus();
      var initial = (function () {
        var m = /[?&]q=([^&]+)/.exec(location.search);
        return m ? decodeURIComponent(m[1]) : "";
      })();
      if (initial) input.value = initial;
      search(input.value);
    })
    .catch(function (err) {
      status.textContent = tT("search.status.error", { e: err.message });
    });

  input.addEventListener("input", function () { search(input.value); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { input.value = ""; search(""); }
  });

  // Dil değişince yeniden ara (placeholder + status + sonuç metinleri)
  document.addEventListener("infectedlab:lang-changed", function () {
    if (rawData) search(input.value);
  });
})();
