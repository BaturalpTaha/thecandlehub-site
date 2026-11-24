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

  var tarihBicim = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  var tarihYaz = function (t) { return tarihBicim.format(new Date(t + "T12:00:00")); };
  var buyuk = function (s) { return String(s).toLocaleUpperCase("tr-TR"); };
  var ytAdres = function (id, kisa) { return (kisa ? "https://www.youtube.com/shorts/" : "https://www.youtube.com/watch?v=") + id; };

  /* ════════ Sıfırdan Trading haritası (YouTube oynatma listesinden) ════════ */
  var SERI = window.CH_SERI || {}, B = SERI.bolumler || [];
  var svg = $("[data-harita-svg]"), noktaKap = $("[data-kademeler]"), panel = $("[data-panel]");
  var NS = "http://www.w3.org/2000/svg";
  var adet = B.length + 1;                       // son nokta: sıradaki bölüm
  var ara = 880 / Math.max(1, adet - 1);
  var dipler = []; for (var di = 0; di < adet; di++) dipler.push({ x: 60 + di * ara, y: 384 - di * (250 / Math.max(1, adet - 1)) });
  var tepeler = dipler.map(function (d, i) { return { x: d.x + ara / 2, y: d.y - 96 - (i % 3) * 10 }; });
  var sayiEt = $("[data-seri-sayi]"); if (sayiEt && B.length) sayiEt.textContent = "BÖLÜM " + B[0].no + "–" + B[B.length - 1].no;

  if (svg && B.length) {
    var yol = "M10 330 L" + dipler[0].x + " " + dipler[0].y;
    for (var pi = 0; pi < B.length; pi++) { if (pi) yol += " L" + dipler[pi].x + " " + dipler[pi].y; yol += " L" + tepeler[pi].x + " " + tepeler[pi].y; }
    var p1 = document.createElementNS(NS, "path"); p1.setAttribute("d", yol); p1.setAttribute("class", "yol"); p1.setAttribute("pathLength", "1");
    // sıradaki bölüm: henüz çizilmemiş, kesik çizgi
    var sonT = tepeler[B.length - 1], sonD = dipler[B.length];
    var p3 = document.createElementNS(NS, "path"); p3.setAttribute("class", "yol-gelecek");
    p3.setAttribute("d", "M" + sonT.x + " " + sonT.y + " L" + sonD.x + " " + sonD.y + " L" + (sonD.x + 34) + " " + (sonD.y - 60));
    var ilk = dipler[0], egim = (sonD.y - ilk.y) / (sonD.x - ilk.x);
    var p2 = document.createElementNS(NS, "path");
    p2.setAttribute("d", "M" + (ilk.x - 40) + " " + (ilk.y - 40 * egim + 14) + " L" + (sonD.x + 60) + " " + (sonD.y + 60 * egim + 14));
    p2.setAttribute("class", "trend");
    svg.appendChild(p2); svg.appendChild(p3); svg.appendChild(p1);
  }

  var secili = 0, dugmeler = [];
  function bolumSec(i, odak, kullanici) {
    secili = i;
    dugmeler.forEach(function (d, j) { d.setAttribute("aria-selected", String(j === i)); d.tabIndex = j === i ? 0 : -1; });
    var b = B[i], baslik = b.soru + (b.etiket ? " | " + b.etiket : "");
    var oynat = 'data-oynat data-id="' + kacis(b.id) + '" data-tur="uzun" data-baslik="' + kacis(baslik) + '"';
    panel.setAttribute("aria-labelledby", "bolum-" + i);
    panel.innerHTML =
      '<div class="panel__ust"><span class="panel__kod">BÖLÜM ' + b.no + (b.etiket ? " · " + kacis(buyuk(b.etiket)) : "") + "</span>" +
      '<span class="panel__aralik">' + tarihYaz(b.tarih) + (b.sure ? " · " + b.sure : "") + "</span></div>" +
      '<h3 class="panel__ad">' + kacis(b.soru) + "</h3>" +
      '<button type="button" class="panel__resim" ' + oynat + ' aria-label="Bölüm ' + b.no + ' videosunu oynat">' +
        (b.kapak ? '<img src="' + kacis(b.kapak) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : "") + "</button>" +
      (b.aciklama ? '<p class="panel__ozet">' + kacis(b.aciklama) + "</p>" : "") +
      '<div class="panel__dugmeler"><button type="button" class="dugme" ' + oynat + '>Bölümü izle</button>' +
      '<a class="panel__yt" href="' + ytAdres(b.id) + '" target="_blank" rel="noopener">YouTube\'da aç</a></div>';
    if (odak) dugmeler[i].focus({ preventScroll: true });
    // telefonda seçili basamağı yatay şeritte ortala; sayfayı dikeyde kaydırma (ilk yüklemede hiç kaydırma)
    if (kullanici && window.innerWidth <= 900) {
      var d = dugmeler[i];
      noktaKap.scrollTo({ left: d.offsetLeft - noktaKap.clientWidth / 2 + d.offsetWidth / 2, behavior: AZ ? "auto" : "smooth" });
    }
  }
  if (noktaKap && B.length) {
    B.forEach(function (b, i) {
      var d = document.createElement("button");
      d.type = "button"; d.className = "kademe"; d.id = "bolum-" + i;
      d.setAttribute("role", "tab"); d.setAttribute("aria-controls", "harita-panel");
      d.setAttribute("aria-label", "Bölüm " + b.no + ": " + b.soru);
      d.style.left = (dipler[i].x / 10) + "%"; d.style.top = (dipler[i].y / 4.2 + 2.5) + "%";
      d.style.transitionDelay = AZ ? "0s" : (0.25 + i * 0.16) + "s";
      d.innerHTML = '<span class="kademe__ok" aria-hidden="true"></span><span class="kademe__etiket">' + b.no + "</span>";
      d.addEventListener("click", function () { bolumSec(i, false, true); });
      d.addEventListener("keydown", function (e) {
        var n = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (e.key === "Home") n = -secili; if (e.key === "End") n = B.length - 1 - secili;
        if (n == null) return;
        e.preventDefault(); bolumSec((secili + n + B.length) % B.length, true, true);
      });
      noktaKap.appendChild(d); dugmeler.push(d);
    });
    // sıradaki bölüm: tıklanmaz, yalnız işaret
    var y = document.createElement("span");
    y.className = "kademe kademe--yakinda";
    y.style.left = (dipler[B.length].x / 10) + "%"; y.style.top = (dipler[B.length].y / 4.2 + 2.5) + "%";
    y.style.transitionDelay = AZ ? "0s" : (0.25 + B.length * 0.16) + "s";
    y.innerHTML = '<span class="kademe__ok" aria-hidden="true"></span><span class="kademe__etiket">SIRADAKİ</span>';
    noktaKap.appendChild(y);
    panel.id = "harita-panel";
    bolumSec(0);
  } else if (panel) {
    panel.innerHTML = '<p class="durum">Bölüm listesi yüklenemedi. <a href="https://www.youtube.com/playlist?list=PLIzRN-pOHxuc" target="_blank" rel="noopener">Seriyi YouTube\'da aç</a></p>';
  }

  /* ── "Biz kimiz" tanıtım videosu ── */
  var tKap = $("[data-tanitim]"), T = SERI.tanitim;
  if (tKap && T) {
    tKap.innerHTML = '<button type="button" class="vkart" data-oynat data-id="' + kacis(T.id) + '" data-tur="uzun" data-baslik="' + kacis(T.soru) + '">' +
      '<div class="vkart__resim">' + (T.kapak ? '<img src="' + kacis(T.kapak) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : "") + "</div>" +
      '<div class="vkart__ic"><p class="vkart__bilgi"><span class="vkart__tur">TANITIM</span>' + (T.sure ? "<span>" + T.sure + "</span>" : "") + "</p>" +
      '<p class="vkart__baslik">' + kacis(T.soru) + "</p></div></button>";
  }

  /* ════════ videolar ════════ */
  var V = window.CH_VIDEOLAR, alan = $("[data-videolar]");
  function kart(v, sinif) {
    var t = tarihYaz(v.tarih);
    return '<button type="button" class="vkart ' + (sinif || "") + '" data-oynat data-id="' + kacis(v.id) + '" data-tur="' + v.tur + '" data-baslik="' + kacis(v.baslik) + '">' +
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
  // sayfadaki her [data-oynat] öğesi (video kartı, müfredat bölümü, tanıtım, stop avı bağlantıları)
  document.addEventListener("click", function (e) {
    var k = e.target.closest("[data-oynat]"); if (!k) return;
    var id = k.dataset.id, dikey = k.dataset.tur === "kisa";
    if (typeof oy.showModal !== "function") { window.open(ytAdres(id, dikey), "_blank", "noopener"); return; }
    oy.toggleAttribute("data-dikey", dikey);
    $("[data-oynatici-baslik]").textContent = k.dataset.baslik;
    $("[data-oynatici-yt]").href = ytAdres(id, dikey);
    oyCer.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="' + kacis(k.dataset.baslik) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
    oy.showModal();
  });
})();
