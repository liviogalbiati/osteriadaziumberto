/* ==========================================================================
   app.js – parti comuni a tutte le pagine
   (orari in Europe/Rome, intestazione, piè di pagina, barra azioni, lucine,
   calendario, animazioni d'ingresso). Non serve modificarlo per cambiare dati:
   i dati stanno in config.js e menu-data.js, i testi in i18n.js.
   ========================================================================== */
(function () {
  "use strict";
  var O = window.OSTERIA;
  var Z = (window.Z = {});
  var readyQueue = [];
  var isReady = false;

  document.documentElement.classList.add("js");

  /* ---------- piccoli attrezzi ---------- */
  Z.pad = function (n) { return (n < 10 ? "0" : "") + n; };
  Z.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  Z.$ = function (sel, root) { return (root || document).querySelector(sel); };
  Z.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  Z.onReady = function (fn) { if (isReady) fn(); else readyQueue.push(fn); };
  Z.t = function (k, v) { return window.I18N.t(k, v); };
  Z.ph = function (txt) { return '<span class="ph">[' + Z.esc(txt) + "]</span>"; };

  /* localStorage sempre dentro try/catch (solo carrello e lingua) */
  Z.store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ignora */ } },
    del: function (k) { try { window.localStorage.removeItem(k); } catch (e) { /* ignora */ } }
  };

  Z.code = function (prefix, len) {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "";
    for (var i = 0; i < (len || 6); i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + "-" + s;
  };

  /* ---------- tempo nel fuso Europe/Rome ---------- */
  var romeFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: O.timezone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  });
  Z.rome = function (date) {
    var p = {};
    romeFmt.formatToParts(date || new Date()).forEach(function (x) { p[x.type] = x.value; });
    var y = +p.year, m = +p.month, d = +p.day;
    return {
      y: y, m: m, d: d, hh: +p.hour, mm: +p.minute,
      ymd: y + "-" + Z.pad(m) + "-" + Z.pad(d),
      wd: new Date(Date.UTC(y, m - 1, d)).getUTCDay(),
      minutes: +p.hour * 60 + +p.minute
    };
  };
  Z.parseYmd = function (s) { var a = s.split("-"); return { y: +a[0], m: +a[1], d: +a[2] }; };
  Z.ymd = function (y, m, d) { return y + "-" + Z.pad(m) + "-" + Z.pad(d); };
  Z.weekdayOf = function (ymd) { var p = Z.parseYmd(ymd); return new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay(); };
  Z.addDays = function (ymd, n) {
    var p = Z.parseYmd(ymd), dt = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
    return Z.ymd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
  };
  Z.toMin = function (hhmm) { var a = hhmm.split(":"); return +a[0] * 60 + +a[1]; };
  Z.fromMin = function (n) { return Z.pad(Math.floor(n / 60)) + ":" + Z.pad(n % 60); };
  /* ora locale di Roma → istante UTC (per il file .ics) */
  Z.romeToUtc = function (ymd, hhmm) {
    var p = Z.parseYmd(ymd), mins = Z.toMin(hhmm);
    var guess = Date.UTC(p.y, p.m - 1, p.d, 0, mins);
    var r = Z.rome(new Date(guess));
    var asUtc = Date.UTC(r.y, r.m - 1, r.d, r.hh, r.mm);
    return new Date(guess - (asUtc - guess));
  };
  Z.locale = function () { return window.I18N.lang === "it" ? "it-IT" : "en-GB"; };
  Z.fmtDate = function (ymd, opts) {
    var p = Z.parseYmd(ymd);
    return new Intl.DateTimeFormat(Z.locale(), Object.assign({ timeZone: "UTC" }, opts || { weekday: "long", day: "numeric", month: "long", year: "numeric" }))
      .format(new Date(Date.UTC(p.y, p.m - 1, p.d)));
  };
  Z.euro = function (n) { return window.MenuUtil.euro(n); };

  /* ---------- orari e stato aperto/chiuso ---------- */
  Z.slotsOf = function (wd) { return O.hours[wd] || []; };
  Z.statusNow = function (when) {
    var r = Z.rome(when), slots = Z.slotsOf(r.wd), i;
    for (i = 0; i < slots.length; i++) {
      if (r.minutes >= Z.toMin(slots[i][0]) && r.minutes < Z.toMin(slots[i][1])) return { state: "open", until: slots[i][1] };
    }
    for (i = 0; i < slots.length; i++) {
      if (r.minutes < Z.toMin(slots[i][0])) return { state: "opens", time: slots[i][0] };
    }
    var next = nextOpening(r.wd);
    return { state: slots.length ? "closedNow" : "closedToday", next: next };
  };
  function nextOpening(wd) {
    for (var k = 1; k <= 7; k++) {
      var d = (wd + k) % 7, s = Z.slotsOf(d);
      if (s.length) return { offset: k, wd: d, time: s[0][0] };
    }
    return null;
  }
  function dayName(wd, short) { return Z.t((short ? "dayS." : "day.") + wd); }
  Z.statusText = function (st) {
    var n = st.next;
    var when = n ? (n.offset === 1 ? Z.t("status.tomorrow") : dayName(n.wd)) : "";
    switch (st.state) {
      case "open": return Z.t("status.open", { time: st.until });
      case "opens": return Z.t("status.opens", { time: st.time });
      case "closedToday": return Z.t("status.closedToday") + (n ? " · " + Z.t("status.reopens", { when: when, time: n.time }) : "");
      default: return Z.t("status.closedNow") + (n ? " · " + Z.t("status.reopens", { when: when, time: n.time }) : "");
    }
  };
  function renderStatus() {
    var st = Z.statusNow();
    Z.$$("[data-status]").forEach(function (el) {
      el.className = el.className.replace(/\bstatus--\w+/g, "").trim() + " status--" + (st.state === "open" ? "open" : "closed");
      el.innerHTML = '<span class="status__dot" aria-hidden="true"></span><span>' + Z.esc(Z.statusText(st)) + "</span>";
    });
  }
  /* righe orario raggruppate: "Martedì–domenica 12:30–15:00 · 19:30–23:00" */
  Z.hoursRows = function () {
    var order = [2, 3, 4, 5, 6, 0, 1], rows = [], cur = null;
    order.forEach(function (wd) {
      var key = Z.slotsOf(wd).map(function (s) { return s[0] + "–" + s[1]; }).join(" · ");
      if (cur && cur.key === key) { cur.last = wd; } else { cur = { key: key, first: wd, last: wd }; rows.push(cur); }
    });
    return rows.map(function (r) {
      var days = r.first === r.last ? dayName(r.first) : dayName(r.first) + "–" + dayName(r.last).toLowerCase();
      return { days: days, hours: r.key || Z.t("hours.closed"), closed: !r.key };
    });
  };
  function renderHours() {
    Z.$$("[data-hours]").forEach(function (el) {
      var doubt = O.eveningCloseDoubt ? ' <span class="ph">[' + Z.esc(Z.t("ph.closeTime")) + "]</span>" : "";
      el.innerHTML = Z.hoursRows().map(function (r) {
        return '<div class="hours__row"><dt>' + Z.esc(r.days) + "</dt><dd>" + Z.esc(r.hours) + (r.closed ? "" : doubt) + "</dd></div>";
      }).join("");
    });
  }

  /* ---------- foto segnaposto (riquadri con aspect-ratio fisso) ---------- */
  var camera = '<svg class="photo__icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M6 15h8l3-5h14l3 5h8v24H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="24" cy="26" r="7" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  Z.photoHtml = function (name, ratio, cls) {
    return '<figure class="photo ' + (cls || "") + '" data-photo="' + name + '" style="--ratio:' + (ratio || "4/3") + '" role="img"></figure>';
  };
  Z.fillPhotos = function () {
    Z.$$("[data-photo]").forEach(function (el) {
      var cap = Z.t("photo." + el.getAttribute("data-photo"));
      el.setAttribute("aria-label", Z.t("photo.label", { what: cap }));
      el.innerHTML = camera + '<span class="photo__cap">' + Z.esc(cap) + "</span>";
    });
  };

  /* ---------- lucine: catenaria di lampadine in SVG inline ---------- */
  var lightId = 0;
  Z.lights = function (el) {
    var kind = el.getAttribute("data-lights") || "divider";
    var cfg = {
      hero:    { w: 1200, h: 96, anchors: 6, sag: 40, bulbs: 6, r: 7.5, drop: 11 },
      divider: { w: 800,  h: 34, anchors: 8, sag: 12, bulbs: 3, r: 3.6, drop: 4 },
      strip:   { w: 800,  h: 22, anchors: 10, sag: 7, bulbs: 3, r: 2.6, drop: 3 }
    }[kind] || null;
    if (!cfg) return;
    var id = "lg" + (++lightId), step = (cfg.w + 40) / cfg.anchors, out = "", idx = 0, a;
    var wire = "", bulbs = "";
    for (a = 0; a < cfg.anchors; a++) {
      var x0 = -20 + a * step, x1 = x0 + step, y0 = 4, cy = y0 + cfg.sag * 2;
      wire += (a === 0 ? "M" + x0 + " " + y0 : "") + " Q" + (x0 + step / 2) + " " + cy + " " + x1 + " " + y0;
      for (var b = 0; b < cfg.bulbs; b++) {
        var t = (b + 0.5) / cfg.bulbs, mt = 1 - t;
        var x = mt * mt * x0 + 2 * mt * t * (x0 + step / 2) + t * t * x1;
        var y = mt * mt * y0 + 2 * mt * t * cy + t * t * y0;
        var by = y + cfg.drop + cfg.r;
        bulbs += '<g class="bulb" style="--i:' + (idx++) + '"><line x1="' + x.toFixed(1) + '" y1="' + y.toFixed(1) + '" x2="' + x.toFixed(1) + '" y2="' + (y + cfg.drop).toFixed(1) + '" class="bulb__stem"/>' +
          '<circle cx="' + x.toFixed(1) + '" cy="' + by.toFixed(1) + '" r="' + (cfg.r * 3.2).toFixed(1) + '" fill="url(#' + id + ')" class="bulb__glow"/>' +
          '<circle cx="' + x.toFixed(1) + '" cy="' + by.toFixed(1) + '" r="' + cfg.r + '" class="bulb__lamp"/></g>';
      }
    }
    out = '<svg class="lights lights--' + kind + '" viewBox="0 0 ' + cfg.w + " " + cfg.h + '" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">' +
      '<defs><radialGradient id="' + id + '"><stop offset="0" stop-color="#F6D58E" stop-opacity=".55"/><stop offset="1" stop-color="#F6D58E" stop-opacity="0"/></radialGradient></defs>' +
      '<path d="' + wire + '" class="lights__wire" fill="none"/>' + bulbs + "</svg>";
    el.innerHTML = out;
  };

  /* ---------- toast ---------- */
  Z.toast = function (html) {
    var t = Z.$("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.setAttribute("role", "status"); t.className = "toast"; document.body.appendChild(t); }
    t.innerHTML = html; t.classList.add("is-on");
    clearTimeout(Z._tt); Z._tt = setTimeout(function () { t.classList.remove("is-on"); }, 4200);
  };

  /* ---------- calendario con giorni disattivabili ---------- */
  /* opts: { min, max, disabledWeekdays:[], value, onSelect(ymd), label } */
  Z.calendar = function (host, opts) {
    var today = Z.rome();
    var base = Z.parseYmd(opts.value || opts.min || today.ymd);
    var st = { y: base.y, m: base.m, value: opts.value || null };
    function isDisabled(ymd) {
      if (opts.min && ymd < opts.min) return true;
      if (opts.max && ymd > opts.max) return true;
      if ((opts.disabledWeekdays || []).indexOf(Z.weekdayOf(ymd)) >= 0) return true;
      return opts.isDisabled ? opts.isDisabled(ymd) : false;
    }
    function render() {
      var first = new Date(Date.UTC(st.y, st.m - 1, 1)), lead = (first.getUTCDay() + 6) % 7;
      var days = new Date(Date.UTC(st.y, st.m, 0)).getUTCDate();
      var monthLabel = new Intl.DateTimeFormat(Z.locale(), { timeZone: "UTC", month: "long", year: "numeric" }).format(first);
      var wdl = new Intl.DateTimeFormat(Z.locale(), { timeZone: "UTC", weekday: "short" });
      var heads = "", i;
      for (i = 0; i < 7; i++) heads += "<span class=\"cal__wd\" aria-hidden=\"true\">" + Z.esc(wdl.format(new Date(Date.UTC(2024, 0, 1 + i)))) + "</span>";
      var cells = "";
      for (i = 0; i < lead; i++) cells += '<span class="cal__empty"></span>';
      for (i = 1; i <= days; i++) {
        var ymd = Z.ymd(st.y, st.m, i), dis = isDisabled(ymd), sel = ymd === st.value;
        cells += '<button type="button" class="cal__day' + (sel ? " is-sel" : "") + (ymd === today.ymd ? " is-today" : "") + '" data-ymd="' + ymd + '"' +
          (dis ? " disabled" : "") + ' aria-pressed="' + (sel ? "true" : "false") + '" aria-label="' + Z.esc(Z.fmtDate(ymd) + (dis && Z.weekdayOf(ymd) === 1 ? " – " + Z.t("cal.closed") : "")) + '">' + i + "</button>";
      }
      var minM = opts.min ? Z.parseYmd(opts.min) : null, maxM = opts.max ? Z.parseYmd(opts.max) : null;
      var prevDis = minM && (st.y < minM.y || (st.y === minM.y && st.m <= minM.m));
      var nextDis = maxM && (st.y > maxM.y || (st.y === maxM.y && st.m >= maxM.m));
      host.innerHTML = '<div class="cal" role="group" aria-label="' + Z.esc(Z.t(opts.label || "cal.label")) + '">' +
        '<div class="cal__head"><button type="button" class="cal__nav" data-nav="-1" aria-label="' + Z.esc(Z.t("cal.prev")) + '"' + (prevDis ? " disabled" : "") + '>‹</button>' +
        '<strong class="cal__month" aria-live="polite">' + Z.esc(monthLabel) + '</strong>' +
        '<button type="button" class="cal__nav" data-nav="1" aria-label="' + Z.esc(Z.t("cal.next")) + '"' + (nextDis ? " disabled" : "") + '>›</button></div>' +
        '<div class="cal__grid">' + heads + cells + "</div>" +
        '<p class="cal__legend">' + Z.esc(Z.t("cal.legend")) + "</p></div>";
    }
    host.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b || !host.contains(b)) return;
      if (b.hasAttribute("data-nav")) {
        st.m += +b.getAttribute("data-nav");
        if (st.m < 1) { st.m = 12; st.y--; } if (st.m > 12) { st.m = 1; st.y++; }
        render();
        var nb = host.querySelector('[data-nav="' + b.getAttribute("data-nav") + '"]'); if (nb && !nb.disabled) nb.focus();
      } else if (b.hasAttribute("data-ymd")) {
        st.value = b.getAttribute("data-ymd"); render();
        var sb = host.querySelector('[data-ymd="' + st.value + '"]'); if (sb) sb.focus();
        if (opts.onSelect) opts.onSelect(st.value);
      }
    });
    document.addEventListener("langchange", function () { if (document.body.contains(host)) render(); });
    render();
    return { render: render, setValue: function (v) { st.value = v; render(); }, get value() { return st.value; } };
  };

  /* griglia di orari: [{time, off}] → HTML a pulsanti radio */
  Z.slotGrid = function (name, slots, selected) {
    if (!slots.length) return '<p class="muted">' + Z.esc(Z.t("slots.none")) + "</p>";
    return '<div class="slots" role="radiogroup">' + slots.map(function (s) {
      var id = name + "-" + s.time.replace(":", "");
      return '<label class="slot' + (s.off ? " is-off" : "") + '" for="' + id + '"><input type="radio" name="' + name + '" id="' + id + '" value="' + s.time + '"' +
        (s.off ? " disabled" : "") + (selected === s.time ? " checked" : "") + "><span>" + s.time + (s.off ? '<small>' + Z.esc(Z.t("slots.soldout")) + "</small>" : "") + "</span></label>";
    }).join("") + "</div>";
  };
  Z.slotTimes = function (range, step) {
    var out = [], a = Z.toMin(range.first), b = Z.toMin(range.last);
    for (var m = a; m <= b; m += step) out.push(Z.fromMin(m));
    return out;
  };
  /* numero deterministico da una stringa (per gli orari finti "esauriti") */
  Z.hash = function (s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; };

  /* ---------- intestazione, piè di pagina, barra azioni ---------- */
  var icons = {
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.6 3.5 9 3l1.6 4-1.7 1.4a11 11 0 0 0 5.7 5.7L16 12.4l4 1.6-.5 2.4c-.2.9-1 1.6-2 1.6A14.5 14.5 0 0 1 4.9 5.5c0-1 .8-1.8 1.7-2z" fill="currentColor"/></svg>',
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8.5c.2 3 2.6 5.5 5.8 6.5l1.2-1.5-2-1-.9.8a5 5 0 0 1-2-2l.8-.9-1-2z" fill="currentColor"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 0 0-13 0c0 5 6.5 11 6.5 11z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.3" fill="currentColor"/></svg>'
  };
  Z.icons = icons;

  function logoHtml(cls) {
    return '<span class="logo ' + (cls || "") + '"><span class="logo__band"><span class="logo__text">' + O.signText + "</span></span></span>";
  }
  Z.logoHtml = logoHtml;

  var NAV = [
    ["menu.html", "menu", "nav.menu"], ["prenota.html", "book", "nav.book"], ["asporto.html", "takeaway", "nav.takeaway"],
    ["buoni-regalo.html", "vouchers", "nav.vouchers"], ["eventi.html", "events", "nav.events"], ["index.html#dove", "where", "nav.where"]
  ];

  function renderChrome() {
    var page = document.body.getAttribute("data-page") || "";
    var hdr = Z.$("#site-header");
    if (hdr) {
      hdr.className = "site-header";
      hdr.innerHTML =
        '<a class="skip" href="#main" data-i18n="a11y.skip"></a>' +
        '<div class="site-header__in">' +
        '<a class="logo-link" href="index.html" data-i18n-attr="aria-label:a11y.home">' + logoHtml("logo--compact") + "</a>" +
        '<nav class="nav" id="mainnav" data-i18n-attr="aria-label:a11y.mainnav"><ul>' +
        NAV.map(function (n) {
          return '<li><a href="' + n[0] + '" data-nav="' + n[1] + '"' + (n[1] === page ? ' aria-current="page"' : "") + ' data-i18n="' + n[2] + '"></a></li>';
        }).join("") +
        '<li class="nav__cta"><a class="btn btn--primary" href="prenota.html" data-i18n="btn.book"></a></li></ul></nav>' +
        '<div class="header-tools">' +
        '<div class="lang" role="group" data-i18n-attr="aria-label:a11y.lang"><button type="button" data-lang="it" aria-pressed="true">IT</button><button type="button" data-lang="en" aria-pressed="false">EN</button></div>' +
        '<a class="btn btn--primary btn--sm header-book" href="prenota.html" data-i18n="btn.book"></a>' +
        '<button type="button" class="burger" aria-expanded="false" aria-controls="mainnav" data-i18n-attr="aria-label:a11y.menuopen"><span></span><span></span><span></span></button>' +
        "</div></div>";
    }
    var ftr = Z.$("#site-footer");
    if (ftr) {
      var a = O.address;
      ftr.className = "site-footer on-dark";
      ftr.innerHTML =
        '<div class="site-footer__lights" data-lights="divider"></div>' +
        '<div class="container footer-grid">' +
        '<div class="footer-col footer-brand">' + logoHtml("logo--compact") +
        '<p class="footer-tag" data-i18n="footer.tag"></p>' +
        '<p class="footer-social"><a href="' + O.facebook + '" target="_blank" rel="noopener">Facebook</a> <span class="ph">[<span data-i18n="ph.verifyLink"></span>]</span><br>' +
        (O.instagram ? '<a href="' + O.instagram + '" target="_blank" rel="noopener">Instagram</a>' : '<span data-i18n="ph.instagram"></span>') + "</p></div>" +
        '<div class="footer-col"><h2 data-i18n="footer.where"></h2><address>' + Z.esc(a.street) + " " + Z.esc(a.number) +
        ' <span class="ph">[<span data-i18n="ph.civico"></span>]</span><br>' + a.cap + " " + a.city + " – " + a.area + "</address>" +
        '<p><a href="tel:' + O.phoneTel + '">' + O.phoneDisplay + "</a></p>" +
        '<p>' + (O.email ? '<a href="mailto:' + Z.esc(O.email) + '">' + Z.esc(O.email) + "</a>" : '<span data-i18n="ph.email"></span>') + "</p></div>" +
        '<div class="footer-col"><h2 data-i18n="footer.hours"></h2><dl class="hours" data-hours></dl></div>' +
        '<div class="footer-col"><h2 data-i18n="footer.info"></h2><ul class="footer-links">' +
        '<li><a href="privacy.html" data-i18n="footer.privacy"></a></li><li><a href="cookie.html" data-i18n="footer.cookie"></a></li>' +
        '<li><a href="gestione.html" data-i18n="footer.admin"></a></li></ul>' +
        '<p class="footer-legal">' + (O.legal.companyName ? Z.esc(O.legal.companyName) : '<span data-i18n="ph.company"></span>') + "<br>" +
        (O.legal.vat ? "P.IVA " + Z.esc(O.legal.vat) : '<span data-i18n="ph.vat"></span>') + "</p></div></div>" +
        '<p class="footer-demo container" data-i18n="footer.demo"></p>';
    }
    var ab = Z.$("#actionbar");
    if (ab) {
      ab.className = "actionbar";
      ab.setAttribute("role", "navigation");
      ab.innerHTML =
        '<a class="act" href="tel:' + O.phoneTel + '">' + icons.phone + '<span data-i18n="act.call"></span></a>' +
        '<a class="act" data-wa href="' + (O.whatsapp ? "https://wa.me/" + O.whatsapp : "#") + '"' + (O.whatsapp ? ' target="_blank" rel="noopener"' : "") + ">" + icons.wa + '<span data-i18n="act.wa"></span></a>' +
        '<a class="act" href="' + O.directions + '" target="_blank" rel="noopener">' + icons.pin + '<span data-i18n="act.dir"></span></a>';
      ab.setAttribute("data-i18n-attr", "aria-label:a11y.actions");
      document.body.classList.add("has-actionbar");
    }
  }

  function wireChrome() {
    var burger = Z.$(".burger"), nav = Z.$("#mainnav"), hdr = Z.$("#site-header");
    if (burger && nav) {
      var setOpen = function (open) {
        hdr.classList.toggle("menu-open", open);
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        burger.setAttribute("aria-label", Z.t(open ? "a11y.menuclose" : "a11y.menuopen"));
      };
      burger.addEventListener("click", function () { setOpen(burger.getAttribute("aria-expanded") !== "true"); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && hdr.classList.contains("menu-open")) { setOpen(false); burger.focus(); } });
      nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
      document.addEventListener("langchange", function () { setOpen(burger.getAttribute("aria-expanded") === "true"); });
    }
    Z.$$(".lang button").forEach(function (b) {
      b.addEventListener("click", function () { window.I18N.setLang(b.getAttribute("data-lang")); });
    });
    var wa = Z.$("[data-wa]");
    if (wa && !O.whatsapp) wa.addEventListener("click", function (e) { e.preventDefault(); Z.toast(Z.esc(Z.t("toast.nowa")) + " " + Z.ph(Z.t("ph.wa"))); });
    /* sticky: ombra all'header dopo lo scroll */
    var onScroll = function () { if (hdr) hdr.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  function paintLangButtons() {
    Z.$$(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-lang") === window.I18N.lang ? "true" : "false"); });
  }

  /* ---------- animazioni d'ingresso ---------- */
  function wireReveal() {
    var els = Z.$$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
    /* rete di sicurezza: dopo 2,5 s tutto è visibile comunque */
    setTimeout(function () { els.forEach(function (e) { e.classList.add("in"); }); }, 2500);
  }

  /* ---------- mappa caricata solo al clic ---------- */
  function wireMap() {
    var b = Z.$("[data-load-map]");
    if (!b) return;
    b.addEventListener("click", function () {
      var host = b.closest(".map");
      host.innerHTML = '<iframe class="map__frame" title="' + Z.esc(Z.t("map.title")) + '" src="' + O.mapEmbed + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
    });
  }

  function refreshDynamic() {
    paintLangButtons(); renderStatus(); renderHours(); Z.fillPhotos();
    window.I18N.applyAttrs(document);
    var bg = Z.$(".burger");
    if (bg) bg.setAttribute("aria-label", Z.t(bg.getAttribute("aria-expanded") === "true" ? "a11y.menuclose" : "a11y.menuopen"));
  }

  /* ---------- avvio ---------- */
  function boot() {
    renderChrome();
    window.I18N.init();
    Z.$$("[data-lights]").forEach(Z.lights);
    wireChrome(); wireMap();
    refreshDynamic();
    document.addEventListener("langchange", refreshDynamic);
    setInterval(renderStatus, 30000);
    wireReveal();
    isReady = true;
    readyQueue.forEach(function (fn) { fn(); });
    document.documentElement.classList.add("ready");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
