/* InfectedLab - main.js
 * Hafif etkileşimler: yıl, kart hover ışığı, kod blokları için "kopyala" düğmesi.
 */
(function () {
  // Yıl
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

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
