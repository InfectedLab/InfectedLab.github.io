/* InfectedLab — i18n.js
 * Hafif istemci-taraflı çoklu dil:
 *   data-i18n="key"          : textContent
 *   data-i18n-html="key"     : innerHTML (örn. <br> içeren string'ler)
 *   data-i18n-attr="attr:key,attr:key" : istenen attribute'lara çeviri yaz
 *
 * Aktif dili belirleme önceliği:
 *   1. URL ?lang=xx
 *   2. localStorage("infectedlab.lang")
 *   3. <html lang="...">
 *   4. navigator.language ilk iki harf
 *   5. _meta.default
 */
(function () {
  var STORAGE_KEY = "infectedlab.lang";
  var STRINGS_URL = (function () {
    // Sayfa root'ta mı (index.html, tags.html...) yoksa /posts/ altında mı?
    var p = location.pathname;
    return /\/posts\//.test(p) ? "../assets/i18n/strings.json" : "assets/i18n/strings.json";
  })();
  var current = null;
  var dict = null;
  var meta = { default: "tr", supported: ["tr", "en", "ja"], names: { tr: "TR", en: "EN", ja: "JP" } };

  function pickInitial() {
    try {
      var qs = new RegExp("[?&]lang=([a-zA-Z-]+)").exec(location.search);
      if (qs && qs[1]) {
        var v = qs[1].toLowerCase().substring(0, 2);
        if (v === "jp") v = "ja"; // alias
        return v;
      }
    } catch (e) {}
    try {
      var s = localStorage.getItem(STORAGE_KEY);
      if (s) return s;
    } catch (e) {}
    var htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase().substring(0, 2);
    if (htmlLang) return htmlLang;
    var nav = (navigator.language || "tr").toLowerCase().substring(0, 2);
    return nav;
  }

  function normalize(lang) {
    if (!lang) return meta.default;
    lang = lang.toLowerCase();
    if (lang === "jp") lang = "ja";
    if (meta.supported.indexOf(lang) === -1) return meta.default;
    return lang;
  }

  function t(key, lang) {
    if (!dict) return null;
    var entry = dict[key];
    if (!entry) return null;
    return entry[lang] || entry[meta.default] || null;
  }

  function format(s, vars) {
    if (!s || !vars) return s;
    return s.replace(/\{(\w+)\}/g, function (_, k) {
      return (vars[k] !== undefined) ? vars[k] : "{" + k + "}";
    });
  }

  function applyLang(lang) {
    lang = normalize(lang);
    current = lang;
    document.documentElement.setAttribute("lang", lang === "ja" ? "ja" : lang);

    // 1) data-i18n -> textContent
    var nodes = document.querySelectorAll("[data-i18n]");
    nodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var v = t(key, lang);
      if (v != null) el.textContent = v;
    });

    // 2) data-i18n-html -> innerHTML (sadece kontrol ettiğimiz string'ler için)
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      var v = t(key, lang);
      if (v != null) el.innerHTML = v;
    });

    // 3) data-i18n-attr="placeholder:search.placeholder,title:nav.search"
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      var spec = el.getAttribute("data-i18n-attr") || "";
      spec.split(",").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts.length !== 2) return;
        var attr = parts[0].trim();
        var key  = parts[1].trim();
        var v = t(key, lang);
        if (v != null) el.setAttribute(attr, v);
      });
    });

    // 4) Multi-lang body bölümleri: <div data-lang="tr">  / "en" / "ja"
    document.querySelectorAll("[data-lang]").forEach(function (el) {
      var l = el.getAttribute("data-lang");
      el.hidden = (l !== lang);
    });

    // 5) Dil seçici aktif buton
    document.querySelectorAll(".lang-switch [data-lang-btn]").forEach(function (b) {
      var on = (b.getAttribute("data-lang-btn") === lang);
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    // 6) Armor toggle başlığı (CSS sınıfına göre)
    var armorBtn = document.getElementById("armor-toggle");
    if (armorBtn) {
      var on = armorBtn.classList.contains("armor-on");
      var v = t(on ? "armor.title.on" : "armor.title.off", lang);
      if (v) armorBtn.title = v;
    }

    // 7) Sayfaya özel post-load callback'leri tetikle
    document.dispatchEvent(new CustomEvent("infectedlab:lang-changed", { detail: { lang: lang } }));
  }

  function buildSwitcher() {
    var nav = document.querySelector(".site-nav");
    if (!nav || nav.querySelector(".lang-switch")) return;

    var wrap = document.createElement("span");
    wrap.className = "lang-switch";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Language");

    meta.supported.forEach(function (lang) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "lang-btn";
      b.textContent = meta.names[lang] || lang.toUpperCase();
      b.setAttribute("data-lang-btn", lang);
      b.addEventListener("click", function () {
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
        applyLang(lang);
      });
      wrap.appendChild(b);
    });

    nav.appendChild(wrap);
  }

  // Public API
  window.InfectedLabI18n = {
    t: function (key, vars) {
      var v = t(key, current);
      return vars ? format(v, vars) : v;
    },
    current: function () { return current; },
    set: function (lang) {
      try { localStorage.setItem(STORAGE_KEY, normalize(lang)); } catch (e) {}
      applyLang(lang);
    },
    onChange: function (cb) {
      document.addEventListener("infectedlab:lang-changed", function (e) { cb(e.detail.lang); });
    }
  };

  fetch(STRINGS_URL, { cache: "no-cache" })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      dict = data;
      if (data._meta) {
        meta.default = data._meta.default || meta.default;
        meta.supported = data._meta.supported || meta.supported;
        meta.names = data._meta.names || meta.names;
      }
      buildSwitcher();
      applyLang(pickInitial());
    })
    .catch(function (err) {
      // Yine de switcher'ı kurup mevcut DOM'u bırak
      buildSwitcher();
      console.warn("[InfectedLab i18n] strings.json yüklenemedi:", err);
    });
})();
