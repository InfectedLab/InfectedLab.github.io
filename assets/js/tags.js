/* InfectedLab - tags.js
 * Etiket bulutu + filtreli liste. data/posts.json'u okur.
 * URL: tags.html?t=ransomware -> sadece "ransomware" etiketli postları gösterir.
 */
(function () {
  var cloudEl = document.getElementById("tag-cloud");
  var resultsEl = document.getElementById("tag-results");
  var emptyEl = document.getElementById("tag-empty");
  var titleEl = document.getElementById("page-title");
  var subtitleEl = document.getElementById("page-subtitle");

  function qs(name) {
    var m = new RegExp("[?&]" + name + "=([^&]+)").exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c];
    });
  }

  function loadIndex() {
    return fetch("data/posts.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("posts.json yüklenemedi");
        return r.json();
      });
  }

  function tagColor(slug) {
    // Berserk paletten deterministik renk
    var palette = ["red", "violet", "bone"];
    var sum = 0;
    for (var i = 0; i < slug.length; i++) sum += slug.charCodeAt(i);
    return palette[sum % palette.length];
  }

  function renderCloud(data, activeTag) {
    var counts = {};
    data.posts.forEach(function (p) {
      (p.tags || []).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
    });
    var labels = {};
    (data.tags || []).forEach(function (t) { labels[t.slug] = t.label; });

    var html = '<a href="tags.html" class="tag-chip ' + (activeTag ? "" : "tag-chip-active") + '">Tümü <span class="tag-count">' + data.posts.length + '</span></a>';
    Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).forEach(function (t) {
      var label = labels[t] || t;
      var color = tagColor(t);
      var active = (t === activeTag) ? "tag-chip-active" : "";
      html += '<a href="tags.html?t=' + encodeURIComponent(t) + '" class="tag-chip tag-' + color + ' ' + active + '">' +
        escapeHtml(label) + ' <span class="tag-count">' + counts[t] + '</span></a>';
    });
    cloudEl.innerHTML = html;
  }

  function renderResults(data, activeTag) {
    var posts = data.posts.slice();
    if (activeTag) {
      posts = posts.filter(function (p) { return (p.tags || []).indexOf(activeTag) !== -1; });
    }
    posts.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });

    if (!posts.length) {
      resultsEl.innerHTML = "";
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    var labels = {};
    (data.tags || []).forEach(function (t) { labels[t.slug] = t.label; });

    resultsEl.innerHTML = posts.map(function (p) {
      var tagHtml = (p.tags || []).slice(0, 3).map(function (t) {
        return '<a href="tags.html?t=' + encodeURIComponent(t) + '" class="tag tag-' + tagColor(t) + '">' + escapeHtml(labels[t] || t) + '</a>';
      }).join(" ");
      return '<article class="post-card">' +
        '<div class="post-card-meta">' + tagHtml + '<time>' + escapeHtml(p.date || "") + '</time></div>' +
        '<h3><a href="' + escapeHtml(p.url) + '">' + escapeHtml(p.title) + '</a></h3>' +
        '<p>' + escapeHtml(p.excerpt || "") + '</p>' +
        '<a href="' + escapeHtml(p.url) + '" class="post-link">Defteri Aç →</a>' +
        '</article>';
    }).join("");
  }

  loadIndex().then(function (data) {
    var t = qs("t");
    var labels = {};
    (data.tags || []).forEach(function (x) { labels[x.slug] = x.label; });

    if (t) {
      var label = labels[t] || t;
      titleEl.textContent = "Etiket: " + label;
      subtitleEl.textContent = "Bu damgayı taşıyan tüm makaleler aşağıda.";
      document.title = label + " — Etiketler — InfectedLab";
    }

    renderCloud(data, t);
    renderResults(data, t);
  }).catch(function (err) {
    resultsEl.innerHTML = '<p class="empty-note">İndeks yüklenemedi: ' + escapeHtml(err.message) + '</p>';
  });
})();
