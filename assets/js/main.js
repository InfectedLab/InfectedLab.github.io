/* InfectedLab - main.js
 * Hafif etkileşimler: yıl, kart hover ışığı, kod blokları için "kopyala" düğmesi,
 * Berserker zırh modu (kalıcı yüksek-kontrast tema).
 */
(function () {
  // Yıl
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // ===== Tema modu (Berserk / Operator) =====
  // FOUC önleme zaten <head> içindeki inline script ile yapılır.
  var THEME_KEY = "infectedlab.theme";
  function applyTheme(name) {
    var operator = (name === "operator");
    if (operator) document.documentElement.setAttribute("data-theme", "operator");
    else          document.documentElement.removeAttribute("data-theme");

    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", operator ? "true" : "false");
      var titleKey = operator ? "theme.toggle.title.operator" : "theme.toggle.title.berserk";
      var v = window.InfectedLabI18n ? window.InfectedLabI18n.t(titleKey) : null;
      if (v) btn.title = v;
    }
  }
  // İlk yüklemede DOM'daki state'i sync et
  applyTheme(document.documentElement.getAttribute("data-theme") === "operator" ? "operator" : "berserk");

  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var isOperator = document.documentElement.getAttribute("data-theme") === "operator";
      var next = isOperator ? "berserk" : "operator";
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      applyTheme(next);
    });
  }

  // i18n yüklenince title'ı yeniden uygula
  document.addEventListener("infectedlab:lang-changed", function () {
    var cur = document.documentElement.getAttribute("data-theme") === "operator" ? "operator" : "berserk";
    applyTheme(cur);
  });

  // ===== Berserker zırh modu =====
  // Kullanıcının seçimini localStorage'da tutarız ki sayfa geçişlerinde kalıcı olsun.
  var STORAGE_KEY = "infectedlab.armor";
  function applyArmor(on) {
    document.body.classList.toggle("berserker-mode", !!on);
    var btn = document.getElementById("armor-toggle");
    if (btn) {
      btn.classList.toggle("armor-on", !!on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.title = on ? "Berserker Zırh: AÇIK" : "Berserker Zırh: KAPALI";
    }
  }
  // Sayfa yüklenirken durumu uygula (FOUC azaltmak için inline yapılabilir, ama ilk
  // renderdan hemen sonra çalıştığı için yeterli).
  try {
    applyArmor(localStorage.getItem(STORAGE_KEY) === "1");
  } catch (e) {}

  var armorBtn = document.getElementById("armor-toggle");
  if (armorBtn) {
    armorBtn.addEventListener("click", function () {
      var on = !document.body.classList.contains("berserker-mode");
      applyArmor(on);
      try { localStorage.setItem(STORAGE_KEY, on ? "1" : "0"); } catch (e) {}
    });
  }

  // Post-card hover spotlight (parlama efekti)
  document.querySelectorAll(".post-card, .beast").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var r = card.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top) / r.height) * 100;
      card.style.background =
        "radial-gradient(600px circle at " + x + "% " + y + "%, rgba(196,32,42,0.10), transparent 40%), " +
        "linear-gradient(180deg, rgba(20,20,26,0.85), rgba(12,12,14,0.95))";
    });
    card.addEventListener("mouseleave", function () {
      card.style.background = "";
    });
  });

  // Tüm <pre><code> bloklarına "kopyala" düğmesi ekle
  document.querySelectorAll("pre > code").forEach(function (codeEl) {
    var pre = codeEl.parentElement;
    if (pre.dataset.enhanced) return;
    pre.dataset.enhanced = "1";
    pre.style.position = "relative";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Kopyala";
    btn.setAttribute("aria-label", "Kod bloğunu kopyala");
    btn.style.cssText =
      "position:absolute;top:8px;right:8px;font-family:'JetBrains Mono',monospace;" +
      "font-size:0.7rem;letter-spacing:0.14em;text-transform:uppercase;" +
      "padding:4px 8px;background:rgba(20,20,26,0.85);color:#d6cdb5;" +
      "border:1px solid rgba(214,205,181,0.2);cursor:pointer;opacity:0;transition:opacity .2s;";
    pre.appendChild(btn);
    pre.addEventListener("mouseenter", function () { btn.style.opacity = "1"; });
    pre.addEventListener("mouseleave", function () { btn.style.opacity = "0"; });

    btn.addEventListener("click", function () {
      var text = codeEl.innerText;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = "Damga ✓";
          setTimeout(function () { btn.textContent = "Kopyala"; }, 1400);
        });
      }
    });
  });
})();
