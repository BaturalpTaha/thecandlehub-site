/* The CandleHub · sayfa davranışları: bölüm tonu, menü, görünme, müfredat haritası, videolar, oynatıcı */
(function () {
  "use strict";
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return [].slice.call((k || document).querySelectorAll(s)); };
  var AZ = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var kacis = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  /* ── çizim yolları: stroke-dasharray için normalize ── */
  $$(".ciz").forEach(function (p) { p.setAttribute("pathLength", "1"); });

  /* ── giriş açılışı ── */
  var giris = $(".giris");
  requestAnimationFrame(function () { setTimeout(function () { giris.classList.add("basladi"); }, 80); });
  setTimeout(function () { $$(".not, .el--alev, .el--grafik").forEach(function (e) { e.classList.add("gorundu"); }); }, AZ ? 0 : 1500);
  var alev = $("[data-alev]");
  if (alev) {
    var goster = function () { alev.classList.add("hazir"); };
    if (alev.readyState >= 2) goster(); else alev.addEventListener("loadeddata", goster, { once: true });
    if (AZ) { alev.removeAttribute("autoplay"); alev.pause(); goster(); }
    // ekran dışındayken videoyu durdur (pil, işlemci)
    new IntersectionObserver(function (e) { if (AZ) return; e[0].isIntersecting ? alev.play().catch(function () {}) : alev.pause(); }).observe(alev);
  }

  // kapanıştaki alev: yalnız görünürken oynar
  var alevSon = $("[data-alev-son]");
  if (alevSon && !AZ) {
    new IntersectionObserver(function (e) { e[0].isIntersecting ? alevSon.play().catch(function () {}) : alevSon.pause(); }, { rootMargin: "200px" }).observe(alevSon);
  }

  /* ── üst çubuk ── */
  var ust = $("[data-ust]");
  var ustGuncelle = function () { ust.classList.toggle("dolu", window.scrollY > 40); };
  window.addEventListener("scroll", ustGuncelle, { passive: true }); ustGuncelle();

  var menu = $("#menu"), menuAc = $("[data-menu-ac]");
  function menuKapat() { menu.classList.remove("acik"); menuAc.setAttribute("aria-expanded", "false"); menuAc.querySelector(".sr").textContent = "Menüyü aç"; }
  menuAc.addEventListener("click", function () {
    var acik = menu.classList.toggle("acik");
    menuAc.setAttribute("aria-expanded", String(acik));
    menuAc.querySelector(".sr").textContent = acik ? "Menüyü kapat" : "Menüyü aç";
  });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", menuKapat); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("acik")) { menuKapat(); menuAc.focus(); } });

  /* ── bölüm tonu + aktif menü bağlantısı ── */
  var bolumler = $$("[data-ton]");
  var tonGozcu = new IntersectionObserver(function (girdiler) {
    girdiler.forEach(function (g) {
      if (!g.isIntersecting) return;
      document.body.dataset.ton = g.target.dataset.ton;
      var id = g.target.id;
      $$(".menu a[href^='#']").forEach(function (a) { a.classList.toggle("aktif", a.getAttribute("href") === "#" + id); });
    });
  }, { rootMargin: "-48% 0px -48% 0px" });
  bolumler.forEach(function (b) { tonGozcu.observe(b); });

  /* ── görünme ── */
  var gorGozcu = new IntersectionObserver(function (girdiler) {
    girdiler.forEach(function (g) { if (g.isIntersecting) { g.target.classList.add("gorundu"); gorGozcu.unobserve(g.target); } });
  }, { threshold: 0.18 });
  $$(".bolum-bas, .kagit__ic, .harita, .biz__ic, .kapanis, .adim").forEach(function (e) { AZ ? e.classList.add("gorundu") : gorGozcu.observe(e); });

  /* ════════ müfredat haritası ════════ */
  var M = window.CH_MUFREDAT || [];
  var svg = $("[data-harita-svg]"), noktaKap = $("[data-kademeler]"), panel = $("[data-panel]");
  var NS = "http://www.w3.org/2000/svg";
  var dipler = M.map(function (_, i) { return { x: 50 + i * 100, y: 388 - i * 29 }; });
  var tepeler = dipler.map(function (d, i) { return { x: d.x + 50, y: d.y - 92 - (i % 3) * 10 }; });
  if (svg && M.length) {
    var yol = "M10 330 L" + dipler[0].x + " " + dipler[0].y;
    dipler.forEach(function (d, i) { if (i) yol += " L" + d.x + " " + d.y; yol += " L" + tepeler[i].x + " " + tepeler[i].y; });
    var p1 = document.createElementNS(NS, "path"); p1.setAttribute("d", yol); p1.setAttribute("class", "yol"); p1.setAttribute("pathLength", "1");
    var son = dipler[dipler.length - 1], ilk = dipler[0];
    var egim = (son.y - ilk.y) / (son.x - ilk.x);
    var p2 = document.createElementNS(NS, "path");
    p2.setAttribute("d", "M" + (ilk.x - 40) + " " + (ilk.y - 40 * egim + 14) + " L" + (son.x + 90) + " " + (son.y + 90 * egim + 14));
    p2.setAttribute("class", "trend");
    svg.appendChild(p2); svg.appendChild(p1);
  }

  var secili = 0, dugmeler = [];
  function aralik(k) { var b = k.bolumler; return "BÖLÜM " + b[0][0] + (b.length > 1 ? "–" + b[b.length - 1][0] : ""); }
  function kademeSec(i, odak) {
    secili = i;
    dugmeler.forEach(function (d, j) { d.setAttribute("aria-selected", String(j === i)); d.tabIndex = j === i ? 0 : -1; });
    var k = M[i];
    panel.setAttribute("aria-labelledby", "kademe-" + i);
    panel.innerHTML =
      '<div class="panel__ust"><span class="panel__kod">KADEME ' + (i + 1) + "/" + M.length + '</span><span class="panel__aralik">' + aralik(k) + "</span></div>" +
      '<h3 class="panel__ad">' + kacis(k.ad) + "</h3>" +
      '<p class="panel__ozet">' + kacis(k.ozet) + "</p>" +
      (k.not ? '<p class="panel__not">' + kacis(k.not) + "</p>" : "") +
      '<ol class="panel__liste">' + k.bolumler.map(function (b, j) {
        return '<li style="animation-delay:' + (AZ ? 0 : j * 35) + 'ms"><span>' + String(b[0]).padStart(2, "0") + "</span><span>" + kacis(b[1]) + "</span></li>";
      }).join("") + "</ol>";
    if (odak) dugmeler[i].focus();
    if (window.innerWidth <= 900) dugmeler[i].scrollIntoView({ block: "nearest", inline: "center", behavior: AZ ? "auto" : "smooth" });
  }
  if (noktaKap && M.length) {
    M.forEach(function (k, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "kademe"; b.id = "kademe-" + i;
      b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "harita-panel");
      b.setAttribute("aria-label", "Kademe " + (i + 1) + ": " + k.ad + ", " + aralik(k).toLocaleLowerCase("tr"));
      b.style.left = (dipler[i].x / 10) + "%"; b.style.top = (dipler[i].y / 4.2 + 2.5) + "%";
      b.style.transitionDelay = AZ ? "0s" : (0.25 + i * 0.16) + "s";
      b.innerHTML = '<span class="kademe__ok" aria-hidden="true"></span><span class="kademe__etiket">' + k.kod + "</span>";
      b.addEventListener("click", function () { kademeSec(i); });
      b.addEventListener("keydown", function (e) {
        var n = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (e.key === "Home") n = -secili; if (e.key === "End") n = M.length - 1 - secili;
        if (n == null) return;
        e.preventDefault(); kademeSec((secili + n + M.length) % M.length, true);
      });
      noktaKap.appendChild(b); dugmeler.push(b);
    });
    panel.id = "harita-panel";
    kademeSec(0);
  } else if (panel) {
    panel.innerHTML = '<p class="durum">Müfredat listesi yüklenemedi. Sayfayı yenilemeyi dene.</p>';
  }
  $$("[data-kademe-ac]").forEach(function (a) { a.addEventListener("click", function () { kademeSec(+a.dataset.kademeAc); }); });

  /* ════════ videolar ════════ */
  var V = window.CH_VIDEOLAR, alan = $("[data-videolar]");
  var tarihBicim = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  function kart(v, sinif) {
    var t = tarihBicim.format(new Date(v.tarih + "T12:00:00"));
    return '<button type="button" class="vkart ' + (sinif || "") + '" data-id="' + kacis(v.id) + '" data-tur="' + v.tur + '" data-baslik="' + kacis(v.baslik) + '">' +
      '<div class="vkart__resim">' + (v.kapak ? '<img src="' + kacis(v.kapak) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : "") + "</div>" +
      '<div class="vkart__ic"><p class="vkart__bilgi"><span class="vkart__tur">' + (v.tur === "kisa" ? "KISA" : "UZUN") + "</span><span>" + t + "</span></p>" +
      '<p class="vkart__baslik">' + kacis(v.baslik) + "</p></div></button>";
  }
  var KANAL = '<a class="kanal-git" href="https://www.youtube.com/@thecandlehubcom/videos" target="_blank" rel="noopener">Bütün videolar YouTube kanalında</a>';
  function videoCiz(tur) {
    if (!Array.isArray(V)) { alan.innerHTML = '<p class="durum">Video listesi yüklenemedi. <a href="https://www.youtube.com/@thecandlehubcom" target="_blank" rel="noopener">Kanalda izle</a></p>'; return; }
    var uzun = V.filter(function (v) { return v.tur === "uzun"; }), kisa = V.filter(function (v) { return v.tur === "kisa"; });
    var liste = tur === "uzun" ? uzun : tur === "kisa" ? kisa : V;
    if (!liste.length) { alan.innerHTML = '<p class="durum">Bu türde henüz video yok. <a href="https://www.youtube.com/@thecandlehubcom" target="_blank" rel="noopener">Kanala göz at</a></p>'; return; }
    var h = "";
    if (tur === "hepsi") {
      if (uzun.length) {
        h += '<div class="v-ust v-gir"><div class="v-one">' + kart(uzun[0]) + '</div><div class="v-liste">' + uzun.slice(1, 4).map(function (v) { return kart(v); }).join("") + "</div></div>";
      }
      if (kisa.length) {
        h += '<p class="v-serit-bas"><span>KISA VİDEOLAR</span><span aria-hidden="true">KAYDIR</span></p><div class="v-serit v-dikey v-gir" role="list">' + kisa.map(function (v) { return '<div role="listitem">' + kart(v) + "</div>"; }).join("") + "</div>";
      }
    } else if (tur === "uzun") {
      h = '<div class="v-izgara v-gir">' + uzun.map(function (v) { return kart(v); }).join("") + "</div>";
    } else {
      h = '<div class="v-izgara v-izgara--dikey v-dikey v-gir">' + kisa.map(function (v) { return kart(v); }).join("") + "</div>";
    }
    alan.innerHTML = h + KANAL;
  }
  var sekmeler = $$("[data-sekmeler] [role=tab]");
  sekmeler.forEach(function (s, i) {
    s.tabIndex = i === 0 ? 0 : -1;
    s.addEventListener("click", function () {
      sekmeler.forEach(function (x) { x.setAttribute("aria-selected", String(x === s)); x.tabIndex = x === s ? 0 : -1; });
      videoCiz(s.dataset.tur);
    });
    s.addEventListener("keydown", function (e) {
      var n = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (n == null) return;
      e.preventDefault(); var j = (i + n + sekmeler.length) % sekmeler.length; sekmeler[j].click(); sekmeler[j].focus();
    });
  });
  if (alan) videoCiz("hepsi");

  /* ── oynatıcı (YouTube yalnız tıklanınca, çerezsiz alan adından yüklenir) ── */
  var oy = $("[data-oynatici]"), oyCer = $("[data-oynatici-cerceve]");
  function oyKapat() { if (oy.open) oy.close(); }
  oy.addEventListener("close", function () { oyCer.innerHTML = ""; });
  oy.addEventListener("click", function (e) { if (e.target === oy) oyKapat(); });
  $("[data-oynatici-kapat]").addEventListener("click", oyKapat);
  alan && alan.addEventListener("click", function (e) {
    var k = e.target.closest(".vkart"); if (!k) return;
    var id = k.dataset.id, dikey = k.dataset.tur === "kisa";
    if (typeof oy.showModal !== "function") { window.open((dikey ? "https://www.youtube.com/shorts/" : "https://www.youtube.com/watch?v=") + id, "_blank", "noopener"); return; }
    oy.toggleAttribute("data-dikey", dikey);
    $("[data-oynatici-baslik]").textContent = k.dataset.baslik;
    $("[data-oynatici-yt]").href = (dikey ? "https://www.youtube.com/shorts/" : "https://www.youtube.com/watch?v=") + id;
    oyCer.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="' + kacis(k.dataset.baslik) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
    oy.showModal();
  });
})();
