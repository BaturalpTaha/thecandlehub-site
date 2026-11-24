/* The CandleHub · grafik motoru (canvas)
   1) Giriş: canlı akan örnek mum grafiği + imleç nişangahı
   2) Stop avı: kaydırmaya bağlı 4 adımlı anlatım (eşit dipler → stoplar → süpürme → dönüş)
   Grafik dili videolardan: canlı yeşil/kırmızı mum, blok etiket, el yazısı yorum. */
(function () {
  "use strict";
  var R = {
    yesil: "#6FAE6F", kirmizi: "#C94F4F", alev: "#C98A3E", metin: "#EDE6D6",
    solgun: "#8F978A", cizgi: "rgba(237,230,214,.09)"
  };
  var AZ = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MONO = "'Space Mono', monospace", EL = "700 {s}px Kalam, cursive", BAS = "700 {s}px Oswald, sans-serif";
  var font = function (k, s) { return k.replace("{s}", Math.round(s)); };
  var sinir = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var ara = function (a, b, t) { return a + (b - a) * t; };
  var cikis = function (t) { return 1 - Math.pow(1 - t, 3); };

  function tohum(n) { var x = n >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }

  /* canvas'ı piksel yoğunluğuna göre boyutla */
  function hazirla(cv, cb) {
    var ctx = cv.getContext("2d"), dpr = 1, w = 0, h = 0;
    function boyut() {
      var r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cb && cb(w, h);
    }
    new ResizeObserver(boyut).observe(cv);
    boyut();
    return { ctx: ctx, g: function () { return { w: w, h: h }; } };
  }

  function mum(ctx, x, gw, o, y, d, k, py, renk) {
    var c = renk || (k >= o ? R.yesil : R.kirmizi);
    ctx.strokeStyle = c; ctx.fillStyle = c;
    ctx.lineWidth = Math.max(1, gw * 0.16);
    ctx.beginPath(); ctx.moveTo(x, py(y)); ctx.lineTo(x, py(d)); ctx.stroke();
    var ust = py(Math.max(o, k)), alt = py(Math.min(o, k));
    ctx.fillRect(x - gw / 2, ust, gw, Math.max(1.5, alt - ust));
  }

  /* blok etiket (HH/HL etiketleri gibi): düz zemin, mono yazı */
  function blok(ctx, x, y, metin, zemin, yazi, s) {
    s = s || 12;
    ctx.font = "700 " + s + "px " + MONO;
    var w = ctx.measureText(metin).width + s * 1.1, h = s * 2;
    ctx.fillStyle = zemin; ctx.fillRect(x, y - h / 2, w, h);
    ctx.fillStyle = yazi; ctx.textBaseline = "middle"; ctx.fillText(metin, x + s * 0.55, y + 1);
    return w;
  }

  /* el yazısı: yazılıyormuş gibi soldan açılır (t 0→1) */
  // t: yazılma ilerlemesi, alfa: sönme (yazı geri silinmez, söner)
  function elYazi(ctx, metin, x, y, s, renk, t, aci, alfa) {
    if (t <= 0 || alfa === 0) return;
    ctx.save();
    if (alfa != null) ctx.globalAlpha = alfa;
    ctx.font = font(EL, s);
    var w = ctx.measureText(metin).width;
    // dar ekranda yazı çerçeveden taşmasın
    var cw = ctx.canvas.width / (window.devicePixelRatio > 1 ? Math.min(window.devicePixelRatio, 2) : 1);
    x = sinir(x, 10, cw - w - 12);
    ctx.translate(x, y); ctx.rotate(aci || -0.05);
    ctx.beginPath(); ctx.rect(-4, -s * 1.2, (w + 8) * cikis(sinir(t, 0, 1)), s * 2);
    ctx.clip();
    ctx.fillStyle = renk; ctx.textBaseline = "alphabetic"; ctx.fillText(metin, 0, 0);
    ctx.restore();
  }

  function elOk(ctx, x1, y1, x2, y2, renk, t, bukum, alfa) {
    if (t <= 0 || alfa === 0) return;
    var mx = (x1 + x2) / 2 + (bukum || 0), my = (y1 + y2) / 2 - Math.abs(bukum || 0) * 0.4;
    var n = 24, son = Math.max(1, Math.round(n * sinir(t, 0, 1)));
    ctx.save(); if (alfa != null) ctx.globalAlpha = alfa; ctx.strokeStyle = renk; ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    var px = x1, py = y1;
    for (var i = 0; i <= son; i++) {
      var u = i / n, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
      px = a * x1 + b * mx + c * x2; py = a * y1 + b * my + c * y2;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    if (t >= 1) {
      var ang = Math.atan2(y2 - my, x2 - mx);
      ctx.beginPath();
      ctx.moveTo(x2 - 11 * Math.cos(ang - 0.45), y2 - 11 * Math.sin(ang - 0.45));
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2 - 11 * Math.cos(ang + 0.45), y2 - 11 * Math.sin(ang + 0.45));
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ════════════ 1 · GİRİŞ: canlı akan grafik ════════════ */
  function canli(cv) {
    var rnd = tohum(20261124), seri = [], son = 100;
    function yeni() {
      var o = son, hedef = 100 + Math.sin(seri.length / 9) * 4 + Math.sin(seri.length / 23) * 6;
      var k = o + (hedef - o) * 0.12 + (rnd() - 0.5) * 2.4;
      var y = Math.max(o, k) + rnd() * 1.1, d = Math.min(o, k) - rnd() * 1.1;
      son = k; return { o: o, y: y, d: d, k: k };
    }
    for (var i = 0; i < 160; i++) seri.push(yeni());

    var okuma = document.querySelector("[data-okuma]");
    var alev = document.querySelector(".giris__alev");
    var varsayilan = "ÖRNEK GRAFİK · GERÇEK FİYAT DEĞİL";
    if (okuma) okuma.textContent = varsayilan;

    var c = hazirla(cv), ctx = c.ctx;
    var adim = 12, kayma = 0, sonEk = performance.now(), periyot = 950;
    var lo = 90, hi = 110, imlec = null, gorunur = true, oynuyor = !AZ;
    var canliMum = seri[seri.length - 1], canliHedef = canliMum.k;

    function ciz(simdi) {
      var g = c.g(), w = g.w, h = g.h;
      ctx.clearRect(0, 0, w, h);
      adim = w < 600 ? 9 : 12;
      var gw = adim * 0.62;
      // grafik, gerçek mumun (alev videosu) önünde biter
      var xSon = w - 64;
      if (alev && w > 900) {
        var ar = alev.getBoundingClientRect(), cr = cv.getBoundingClientRect();
        xSon = ar.left + ar.width * 0.2 - cr.left;   // mumun mumu: grafik, gerçek mumun gövdesinde durur
      }
      var adet = Math.ceil(xSon / adim) + 2;
      var gorunen = seri.slice(-adet);
      var mn = Infinity, mx = -Infinity;
      gorunen.forEach(function (m) { mn = Math.min(mn, m.d); mx = Math.max(mx, m.y); });
      lo = ara(lo, mn - 1.5, 0.06); hi = ara(hi, mx + 1.5, 0.06);
      var ust = 18, alt = h - 22;
      var py = function (v) { return alt - (v - lo) / (hi - lo) * (alt - ust); };

      // fiyat ekseni çizgileri (yalnız 3 seviye; okumayı kolaylaştırır)
      ctx.strokeStyle = R.cizgi; ctx.lineWidth = 1; ctx.setLineDash([2, 6]);
      for (var s = 1; s <= 3; s++) { var yy = ust + (alt - ust) * s / 4; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(xSon + 20, yy); ctx.stroke(); }
      ctx.setLineDash([]);

      // canlı mum: kapanış hedefe doğru titrer
      if (oynuyor) {
        canliMum.k = ara(canliMum.k, canliHedef, 0.08);
        canliMum.y = Math.max(canliMum.y, canliMum.k); canliMum.d = Math.min(canliMum.d, canliMum.k);
      }
      var ilerleme = oynuyor ? sinir((simdi - sonEk) / periyot, 0, 1) : 0;
      kayma = ilerleme * adim;

      ctx.save();
      for (var i = 0; i < gorunen.length; i++) {
        var m = gorunen[i];
        var x = xSon - (gorunen.length - 1 - i) * adim - kayma + adim;
        if (x < -adim) continue;
        // sola doğru sönen grafik: yazının altında bastırmasın
        ctx.globalAlpha = sinir(x / (w * 0.35), 0.12, 1);
        mum(ctx, x, gw, m.o, m.y, m.d, m.k, py);
      }
      ctx.restore();

      // son fiyat çizgisi
      var sk = canliMum.k, sy = py(sk);
      ctx.strokeStyle = canliMum.k >= canliMum.o ? R.yesil : R.kirmizi; ctx.globalAlpha = 0.5; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(xSon - 40, sy); ctx.lineTo(xSon + 30, sy); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;

      // nişangah
      if (imlec && imlec.x < xSon + adim) {
        var ix = imlec.x, iy = imlec.y;
        ctx.strokeStyle = "rgba(201,138,62,.75)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(ix, 0); ctx.lineTo(ix, h); ctx.moveTo(0, iy); ctx.lineTo(xSon + 30, iy); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = R.alev; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ix, iy, 7, 0, Math.PI * 2); ctx.stroke();
        var idx = gorunen.length - 1 - Math.round((xSon + adim - kayma - ix) / adim);
        var mm = gorunen[sinir(idx, 0, gorunen.length - 1)];
        if (okuma && mm) {
          var f = function (v) { return v.toFixed(2).replace(".", ","); };
          okuma.innerHTML = "ÖRNEK VERİ · A <b>" + f(mm.o) + "</b> · Y <b>" + f(mm.y) + "</b> · D <b>" + f(mm.d) + "</b> · K <b class='" + (mm.k >= mm.o ? "y" : "k") + "'>" + f(mm.k) + "</b>";
        }
      }

      if (oynuyor && simdi - sonEk >= periyot) {
        sonEk = simdi;
        var n = yeni(); seri.push(n); if (seri.length > 400) seri.shift();
        canliMum = n; canliHedef = n.k; canliMum.k = n.o; canliMum.y = n.o; canliMum.d = n.o;
      } else if (oynuyor && Math.random() < 0.06) {
        canliHedef = canliMum.o + (rnd() - 0.5) * 2.4;
      }
    }

    function dongu(t) { if (gorunur && !document.hidden) ciz(t); requestAnimationFrame(dongu); }
    new IntersectionObserver(function (e) { gorunur = e[0].isIntersecting; }).observe(cv);
    cv.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); imlec = { x: e.clientX - r.left, y: e.clientY - r.top }; if (AZ) ciz(performance.now()); });
    cv.addEventListener("pointerleave", function () { imlec = null; if (okuma) okuma.textContent = varsayilan; if (AZ) ciz(performance.now()); });
    if (AZ) { ciz(performance.now()); new ResizeObserver(function () { ciz(performance.now()); }).observe(cv); }
    else requestAnimationFrame(dongu);
  }

  /* ════════════ 2 · STOP AVI: kaydırmaya bağlı anlatım ════════════ */
  // Elle tasarlanmış örnek seri [açılış, yüksek, düşük, kapanış]. Fiyat ölçeği keyfi, gerçek değil.
  var STOP = [
    [108, 108.6, 106.8, 107.1], [107.1, 107.6, 105.2, 105.6], [105.6, 106.1, 104.0, 104.3], [104.3, 104.8, 102.6, 102.9],
    [102.9, 103.4, 101.3, 101.6], [101.6, 102.0, 100.0, 100.5], [100.5, 102.4, 100.2, 102.1], [102.1, 104.0, 101.8, 103.7],
    [103.7, 105.6, 103.3, 105.2], [105.2, 106.2, 104.4, 104.8], [104.8, 105.1, 103.2, 103.5], [103.5, 103.9, 101.9, 102.2],
    [102.2, 102.6, 100.6, 101.0], [101.0, 101.4, 100.05, 100.9], [100.9, 102.6, 100.6, 102.4], [102.4, 104.1, 102.0, 103.8],
    [103.8, 104.6, 103.1, 103.4], [103.4, 103.7, 102.2, 102.5], [102.5, 102.9, 101.6, 101.9], [101.9, 102.6, 101.5, 102.3],
    [102.3, 102.7, 101.4, 101.7], [101.7, 102.2, 101.2, 101.5], [101.5, 102.0, 101.1, 101.8], [101.8, 102.1, 101.2, 101.4],
    [101.4, 101.8, 97.6, 101.1],                                        // 24 · süpürme mumu
    [101.1, 103.6, 100.8, 103.3], [103.3, 105.4, 103.0, 105.1], [105.1, 105.6, 104.2, 104.6], [104.6, 107.3, 104.4, 107.0],
    [107.0, 108.8, 106.6, 108.5], [108.5, 109.0, 107.6, 108.0], [108.0, 110.4, 107.8, 110.1], [110.1, 111.2, 109.4, 110.8]
  ];
  var SEVIYE = 100, SUPUR = 24;

  function stopAvi(cv) {
    var c = hazirla(cv), ctx = c.ctx;
    var adimlar = [].slice.call(document.querySelectorAll(".adim"));
    var ilerlemeLi = [].slice.call(document.querySelectorAll(".stop__ilerleme li"));
    var hedef = 0, p = 0, gorunur = false, kirli = true;
    var rnd = tohum(7);
    var stoplar = []; for (var i = 0; i < 14; i++) stoplar.push({ x: rnd(), y: rnd(), g: rnd() });

    function olc() {
      var vh = window.innerHeight, esik = window.innerWidth <= 900 ? vh * 0.78 : vh * 0.58, t = 0, aktif = 0;
      adimlar.forEach(function (a, i) {
        var r = a.getBoundingClientRect(), f = sinir((esik - r.top) / r.height, 0, 1);
        if (r.top < esik) aktif = i;
        t += f;
      });
      hedef = AZ ? Math.ceil(t) : t;
      adimlar.forEach(function (a, i) { a.classList.toggle("aktif", i === aktif); });
      ilerlemeLi.forEach(function (li, i) { li.classList.toggle("dolu", i <= aktif && t > 0.02); });
      kirli = true;
    }

    function ciz() {
      var g = c.g(), w = g.w, h = g.h, dar = w < 560;
      ctx.clearRect(0, 0, w, h);
      var solB = dar ? 14 : 34, sagB = dar ? 52 : 86, ust = h * 0.12, alt = h - (dar ? 34 : 46);
      var lo = 96, hi = 112.2;
      var py = function (v) { return alt - (v - lo) / (hi - lo) * (alt - ust); };
      var adim = (w - solB - sagB) / STOP.length, gw = adim * 0.6;
      var px = function (i) { return solB + adim * (i + 0.5); };
      var s = dar ? 0.8 : 1;

      // fiyat ekseni (keyfi ölçek)
      ctx.font = "400 " + (dar ? 10 : 11) + "px " + MONO; ctx.textBaseline = "middle";
      for (var v = 98; v <= 110; v += 4) {
        ctx.strokeStyle = R.cizgi; ctx.setLineDash([2, 6]); ctx.beginPath(); ctx.moveTo(solB, py(v)); ctx.lineTo(w - sagB + 10, py(v)); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = R.solgun; ctx.fillText(v.toFixed(1), w - sagB + 16, py(v));
      }

      // görünen mum sayısı ilerlemeye bağlı
      var a0 = sinir(p, 0, 1), a1 = sinir(p - 1, 0, 1), a2 = sinir(p - 2, 0, 1), a3 = sinir(p - 3, 0, 1);
      var gorunen = 1 + a0 * 18 + a1 * 6 + (p > 2 ? 1 : 0) + a3 * 8;

      // destek çizgisi + seviye etiketi
      var lt = sinir((a0 - 0.55) / 0.3, 0, 1);
      if (lt > 0) {
        var xs = px(4), xe = ara(xs, w - sagB + 10, cikis(lt));
        ctx.strokeStyle = a2 > 0.35 ? "rgba(237,230,214,.35)" : R.metin; ctx.lineWidth = 1.6; ctx.setLineDash([7, 6]);
        ctx.beginPath(); ctx.moveTo(xs, py(SEVIYE)); ctx.lineTo(xe, py(SEVIYE)); ctx.stroke(); ctx.setLineDash([]);
      }

      // stop yığını (adım 2'de birikir, süpürmede tetiklenir)
      var birik = a1, tetik = a2;
      if (birik > 0) {
        var bolgeX0 = px(6), bolgeX1 = px(SUPUR + 2), yBas = py(SEVIYE) + 8;
        stoplar.forEach(function (st, i) {
          var gor = sinir(birik * stoplar.length - i, 0, 1);
          if (gor <= 0) return;
          var sx = ara(bolgeX0, bolgeX1, st.x), sy = yBas + st.y * (py(98.2) - yBas);
          var vuruldu = tetik > 0 ? sinir((tetik - 0.2 - st.y * 0.4) / 0.35, 0, 1) : 0;
          ctx.save();
          ctx.globalAlpha = gor * (1 - (vuruldu || 0));
          ctx.translate(sx, sy - (vuruldu || 0) * 10);
          ctx.strokeStyle = R.kirmizi; ctx.lineWidth = 2; var r = 4.5 * s;
          ctx.beginPath(); ctx.moveTo(-r, -r); ctx.lineTo(r, r); ctx.moveTo(r, -r); ctx.lineTo(-r, r); ctx.stroke();
          ctx.restore();
          if (vuruldu > 0 && vuruldu < 1) {
            ctx.save(); ctx.globalAlpha = (1 - vuruldu) * 0.8; ctx.strokeStyle = R.alev; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(sx, sy, 6 + vuruldu * 18, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
          }
        });
      }

      // mumlar
      for (var i = 0; i < STOP.length; i++) {
        var gor = sinir(gorunen - i, 0, 1);
        if (gor <= 0) break;
        var m = STOP[i], o = m[0], y = m[1], d = m[2], k = m[3];
        if (i === SUPUR) {
          // süpürme mumu: önce aşağı sarkar, sonra geri kapanır
          var u = a2, inis = cikis(sinir(u / 0.55, 0, 1)), donus = cikis(sinir((u - 0.55) / 0.45, 0, 1));
          d = ara(o, m[2], inis);
          var anlik = ara(ara(o, m[2] + 0.4, inis), m[3], donus);
          k = anlik; y = Math.max(o, k, ara(o, m[1], donus));
        }
        ctx.globalAlpha = i === gorunen - 1 + 0 ? 1 : 1;
        ctx.save(); ctx.globalAlpha = gor;
        mum(ctx, px(i), gw, o, y, d, k, py);
        ctx.restore();
      }

      // ── yorum katmanı ──
      var es = dar ? 0.66 : 1;
      // adım 1: eşit dipler
      var e1 = sinir((a0 - 0.62) / 0.25, 0, 1) * (1 - sinir(a2 * 1.6, 0, 1));
      if (e1 > 0) {
        ctx.globalAlpha = e1;
        [5, 13].forEach(function (i) {
          var x = px(i), y = py(STOP[i][2]) + 10;
          ctx.fillStyle = R.metin; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 7, y + 11); ctx.lineTo(x + 7, y + 11); ctx.closePath(); ctx.fill();
        });
        blok(ctx, px(5) - 18, py(SEVIYE) + 44 * es, "EŞİT DİPLER", R.metin, "#08111A", 12 * es);
        ctx.globalAlpha = 1;
        elYazi(ctx, "güçlü destek!", px(7), py(106.6), 28 * es, R.metin, sinir((a0 - 0.75) / 0.25, 0, 1), -0.06, 1 - sinir(a1 * 1.5, 0, 1));
      }
      // adım 2: stoplar
      if (a1 > 0) {
        ctx.globalAlpha = sinir(a1 * 2, 0, 1) * (1 - sinir(a2 * 1.6, 0, 1));
        blok(ctx, px(SUPUR + 2) + 10, py(99), "STOPLAR", R.kirmizi, "#1A0707", 12 * es);
        ctx.globalAlpha = 1;
        elYazi(ctx, "herkesin stopu burada", px(10), py(96.9), 26 * es, "#E58A8A", sinir((a1 - 0.35) / 0.4, 0, 1), -0.03, 1 - sinir(a2 * 1.6, 0, 1));
      }
      // adım 3: süpürme
      if (a2 > 0.2) {
        var t3 = sinir((a2 - 0.2) / 0.4, 0, 1);
        ctx.globalAlpha = t3;
        blok(ctx, px(SUPUR) + 12, py(97.6), "SWEEP", R.alev, "#140D05", 12 * es);
        ctx.globalAlpha = 1;
        var son3 = 1 - sinir(a3 * 1.6, 0, 1);
        elYazi(ctx, "stoplar tetiklendi", px(SUPUR) - 150 * es, py(107.4), 26 * es, R.alev, sinir((a2 - 0.45) / 0.4, 0, 1), -0.04, son3);
        elOk(ctx, px(SUPUR) - 40 * es, py(106.7), px(SUPUR) - 7, py(98.4), R.alev, sinir((a2 - 0.55) / 0.35, 0, 1), -46 * es, son3);
      }
      // adım 4: dönüş
      if (a3 > 0) {
        var t4 = sinir((a3 - 0.3) / 0.4, 0, 1);
        ctx.globalAlpha = t4;
        blok(ctx, px(31) - 10, py(111.6), "DÖNÜŞ", R.yesil, "#0B140B", 12 * es);
        ctx.globalAlpha = 1;
        elYazi(ctx, "sen burada çıktın", px(SUPUR) - 210 * es, py(96.6), 27 * es, R.metin, sinir((a3 - 0.45) / 0.35, 0, 1), -0.03);
        elOk(ctx, px(SUPUR) - 60 * es, py(97.1), px(SUPUR) - 6, py(97.6), R.metin, sinir((a3 - 0.6) / 0.3, 0, 1), 12);
      }
      ctx.globalAlpha = 1;
    }

    function dongu() {
      if (gorunur) {
        var onceki = p;
        p = AZ ? hedef : ara(p, hedef, 0.12);
        if (Math.abs(p - hedef) < 0.001) p = hedef;
        if (kirli || Math.abs(p - onceki) > 0.0005) { ciz(); kirli = false; }
      }
      requestAnimationFrame(dongu);
    }
    new IntersectionObserver(function (e) { gorunur = e[0].isIntersecting; kirli = true; }, { rootMargin: "100px" }).observe(cv);
    window.addEventListener("scroll", olc, { passive: true });
    window.addEventListener("resize", olc);
    new ResizeObserver(function () { kirli = true; }).observe(cv);
    olc(); requestAnimationFrame(dongu);
  }

  function basla() {
    var a = document.querySelector("[data-canli]"); if (a) canli(a);
    var b = document.querySelector("[data-stop]"); if (b) stopAvi(b);
  }
  // el yazısı ve mono fontlar yüklenmeden canvas'a yazı basma
  var fontlar = ["700 20px Kalam", "400 12px 'Space Mono'", "700 12px 'Space Mono'"].map(function (f) { return document.fonts ? document.fonts.load(f, "şğüöçıİ") : Promise.resolve(); });
  Promise.all(fontlar).then(basla, basla);
})();
