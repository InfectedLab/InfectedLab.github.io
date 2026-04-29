/* InfectedLab - search.js
 * Lunr.js tabanlı istemci taraflı arama. data/posts.json üzerinde indeks kurar.
 */
(function () {
  var input = document.getElementById("search-input");
  var status = document.getElementById("search-status");
  var results = document.getElementById("search-results");

  var idx = null;
  var docs = {};
  var tagLabels = {};

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

  function render(matches, query) {
    if (!matches.length) {
      results.innerHTML = '<p class="empty-note">Bu sözcükle eşleşen bir damga bulunmadı. Başka bir kelimeyle dene.</p>';
      return;
    }
    results.innerHTML = matches.map(function (m) {
      var p = docs[m.ref];
      if (!p) return "";
      var tagHtml = (p.tags || []).slice(0, 3).map(function (t) {
        return '<a href="tags.html?t=' + encodeURIComponent(t) + '" class="tag tag-' + tagColor(t) + '">' +
          escapeHtml(tagLabels[t] || t) + '</a>';
      }).join(" ");
      return '<article class="post-card">' +
        '<div class="post-card-meta">' + tagHtml + '<time>' + escapeHtml(p.date || "") + '</time></div>' +
        '<h3><a href="' + escapeHtml(p.url) + '">' + highlight(p.title, query) + '</a></h3>' +
        '<p>' + highlight(p.excerpt || "", query) + '</p>' +
        '<a href="' + escapeHtml(p.url) + '" class="post-link">Defteri Aç →</a>' +
        '</article>';
    }).join("");
  }

  function buildIndex(data) {
    docs = {};
    (data.tags || []).forEach(function (t) { tagLabels[t.slug] = t.label; });
    data.posts.forEach(function (p) { docs[p.slug] = p; });

    return lunr(function () {
      this.ref("slug");
      this.field("title", { boost: 10 });
      this.field("excerpt", { boost: 3 });
      this.field("tags", { boost: 5 });
      this.field("berserk", { boost: 4 });
      this.field("category");

      // Türkçe stemmer yok ama lunr stop-word listesi sorunsuz çalışır
      data.posts.forEach(function (p) {
        this.add({
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          tags: (p.tags || []).join(" "),
          berserk: p.berserk,
          category: p.category
        });
      }, this);
    });
  }

  function search(q) {
    q = (q || "").trim();
    if (!q) {
      // Boş arama: en yenileri göster
      var all = Object.keys(docs).map(function (k) { return { ref: k, score: 0 }; });
      all.sort(function (a, b) { return (docs[b.ref].date || "").localeCompare(docs[a.ref].date || ""); });
      render(all, "");
      status.textContent = "Tüm makaleler — bir şey yazmaya başla.";
      return;
    }
    try {
      // Wildcard ekleyerek "rans" → "ransomware" eşleşsin
      var query = q.split(/\s+/).filter(Boolean).map(function (t) {
        return t + "*";
      }).join(" ");
      var matches = idx.search(query);
      render(matches, q);
      status.textContent = matches.length + " sonuç.";
    } catch (e) {
      status.textContent = "Arama hatası: " + e.message;
    }
  }

  fetch("data/posts.json", { cache: "no-cache" })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      idx = buildIndex(data);
      input.disabled = false;
      input.focus();
      // ?q=... query string desteği
      var initial = (function () {
        var m = /[?&]q=([^&]+)/.exec(location.search);
        return m ? decodeURIComponent(m[1]) : "";
      })();
      if (initial) input.value = initial;
      search(input.value);
    })
    .catch(function (err) {
      status.textContent = "İndeks yüklenemedi: " + err.message;
    });

  input.addEventListener("input", function () { search(input.value); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { input.value = ""; search(""); }
  });
})();
