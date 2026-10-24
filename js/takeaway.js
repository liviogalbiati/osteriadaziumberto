/* takeaway.js – ordine d'asporto dimostrativo (ritiro in osteria, nessuna consegna).
   Piatti: solo quelli con takeaway: true in menu-data.js. Il carrello sta in localStorage (try/catch). */
(function () {
  "use strict";
  var O = window.OSTERIA, T = O.takeaway;
  var KEY = "zu_cart";
  var cart = [], view = "cart", co = null, errors = {}, order = null, sheetOpen = false;

  function load() {
    try { var a = JSON.parse(Z.store.get(KEY) || "[]"); if (Array.isArray(a)) cart = a.filter(function (l) { return window.MenuUtil.byId(l.id); }); } catch (e) { cart = []; }
  }
  function save() { Z.store.set(KEY, JSON.stringify(cart)); }
  function lang() { return window.I18N.lang; }
  function lineKey(id, v) { return id + "|" + (v || ""); }
  function count() { return cart.reduce(function (n, l) { return n + l.qty; }, 0); }
  function lineUnit(l) { return window.MenuUtil.priceOf(window.MenuUtil.byId(l.id), l.variant); }
  function total() { return cart.reduce(function (s, l) { return s + lineUnit(l) * l.qty; }, 0); }
  function variantLabel(it, vid) { var v = it.variants && it.variants.filter(function (x) { return x.id === vid; })[0]; return v ? (v.label[lang()] || v.label.it) : ""; }

  /* ---------- elenco piatti ---------- */
  function renderMenu() {
    var l = lang(), html = "";
    window.MENU_CATEGORIES.forEach(function (c) {
      var items = window.MenuUtil.byCat(c.id).filter(function (i) { return i.takeaway; });
      if (!items.length) return;
      html += '<section aria-labelledby="tc-' + c.id + '"><h2 id="tc-' + c.id + '" style="font-size:1.5rem;border-bottom:2px solid var(--legno);padding-bottom:4px;margin-top:28px">' + Z.esc(c[l]) + "</h2>" +
        items.map(function (it) {
          var sel = "";
          if (it.variants) {
            sel = '<label class="sr-only" for="v-' + it.id + '">' + Z.esc(Z.t("take.variant")) + '</label><select id="v-' + it.id + '">' +
              it.variants.map(function (v) { return '<option value="' + v.id + '">' + Z.esc((v.label[l] || v.label.it).split(" (")[0]) + " · " + Z.esc(Z.euro(v.price)) + "</option>"; }).join("") + "</select>";
          }
          var pending = it.pending ? '<span class="small"> ' + window.I18N.ph(Z.esc(it.pending)) + "</span>" : "";
          return '<div class="shop-item"><h3>' + Z.esc(it.short || it.name) + '</h3><p>' + Z.esc(it.desc[l] || it.desc.it) + pending + '</p><p class="price" style="color:var(--legno)">' + (it.variants ? "" : Z.esc(Z.euro(it.price))) + "</p>" +
            '<div class="shop-ctl">' + sel + '<button type="button" class="btn btn--sm btn--primary" data-add="' + it.id + '">' + Z.esc(Z.t("take.add")) + "</button></div></div>";
        }).join("") + "</section>";
    });
    Z.$("#shop-menu").innerHTML = html;
  }

  /* ---------- carrello ---------- */
  function cartView() {
    if (!cart.length) return "<p>" + Z.esc(Z.t("take.empty")) + "</p>";
    return cart.map(function (l, i) {
      var it = window.MenuUtil.byId(l.id), vl = it.variants ? '<span class="cart-line__var">' + Z.esc(variantLabel(it, l.variant)) + "</span>" : "";
      return '<div class="cart-line"><div class="cart-line__top"><em>' + Z.esc(it.short || it.name) + "</em><span>" + Z.esc(Z.euro(lineUnit(l) * l.qty)) + "</span></div>" + vl +
        '<div class="cart-line__row"><div class="qty" role="group" aria-label="' + Z.esc(Z.t("take.qty")) + '"><button type="button" data-q="-1" data-i="' + i + '" aria-label="' + Z.esc(Z.t("take.less")) + '">–</button><output>' + l.qty + '</output><button type="button" data-q="1" data-i="' + i + '" aria-label="' + Z.esc(Z.t("take.more")) + '">+</button></div>' +
        '<button type="button" class="link-btn" data-rm="' + i + '">' + Z.esc(Z.t("take.remove")) + "</button></div>" +
        '<label class="sr-only" for="note-' + i + '">' + Z.esc(Z.t("take.note")) + '</label><input type="text" id="note-' + i + '" data-note="' + i + '" value="' + Z.esc(l.note || "") + '" placeholder="' + Z.esc(Z.t("take.note")) + '" maxlength="120"></div>';
    }).join("") + '<div class="cart-total"><span>' + Z.esc(Z.t("take.total")) + "</span><span>" + Z.esc(Z.euro(total())) + "</span></div>" +
      '<button type="button" class="btn btn--primary" style="width:100%" data-go="checkout">' + Z.esc(Z.t("take.checkout")) + "</button>" +
      '<p class="small muted" style="margin:10px 0 0">' + Z.esc(Z.t("take.pickup.where")) + "</p>";
  }

  function pickupDays() {
    var now = Z.rome(), out = [];
    for (var i = 0; i <= T.maxDaysAhead; i++) {
      var d = Z.addDays(now.ymd, i);
      if (Z.slotsOf(Z.weekdayOf(d)).length) out.push(d);
    }
    return out;
  }
  function pickupSlots(date) {
    var now = Z.rome(), res = [];
    ["lunch", "dinner"].forEach(function (m) {
      var times = Z.slotTimes(T[m], T.slotMinutes).map(function (t) { return { time: t, off: date === now.ymd && Z.toMin(t) < now.minutes + T.leadMinutes }; });
      res.push({ meal: m, times: times });
    });
    return res;
  }
  function err(k) { return errors[k] ? '<p class="error" role="alert" id="err-' + k + '">' + Z.esc(Z.t(errors[k])) + "</p>" : ""; }
  function inp(k, type, label, opt) {
    return '<div class="field' + (errors[k] ? " field--error" : "") + '"><label for="c-' + k + '">' + Z.esc(Z.t(label)) + (opt ? ' <span class="hint">' + Z.esc(Z.t("common.optional")) + "</span>" : "") + '</label><input id="c-' + k + '" name="' + k + '" type="' + type + '" value="' + Z.esc(co[k] || "") + '"' + (errors[k] ? ' aria-invalid="true"' : "") + ">" + err(k) + "</div>";
  }
  function checkoutView() {
    var days = pickupDays();
    if (!co.date || days.indexOf(co.date) < 0) {
      /* primo giorno con almeno un orario di ritiro ancora disponibile */
      co.date = days.filter(function (d) { return pickupSlots(d).some(function (g) { return g.times.some(function (t) { return !t.off; }); }); })[0] || days[0];
    }
    var slots = pickupSlots(co.date).map(function (g) {
      return '<p class="label" style="margin:10px 0 6px">' + Z.esc(Z.t("book." + g.meal)) + "</p>" + Z.slotGrid("ptime", g.times, co.time);
    }).join("");
    return '<button type="button" class="link-btn" data-go="cart">← ' + Z.esc(Z.t("take.backcart")) + '</button><h3 style="margin-top:10px">' + Z.esc(Z.t("take.checkout")) + "</h3><form novalidate onsubmit=\"return false\">" +
      '<div class="field"><label for="c-date">' + Z.esc(Z.t("take.pickup.date")) + '</label><select id="c-date" name="date">' + days.map(function (d) { return '<option value="' + d + '"' + (d === co.date ? " selected" : "") + ">" + Z.esc(Z.fmtDate(d, { weekday: "short", day: "numeric", month: "long" })) + "</option>"; }).join("") + "</select></div>" +
      '<div class="field' + (errors.time ? " field--error" : "") + '"><span class="label">' + Z.esc(Z.t("take.pickup.time")) + "</span>" + slots + err("time") + '<p class="small">' + window.I18N.h("take.lastpickup") + "</p></div>" +
      inp("name", "text", "f.name") + inp("phone", "tel", "f.phone") + inp("email", "email", "f.email", true) +
      '<div class="field"><span class="label">' + Z.esc(Z.t("take.pay")) + '</span><div class="choices">' +
      '<label class="pill"><input type="radio" name="pay" value="pickup"' + (co.pay === "pickup" ? " checked" : "") + "><span>" + Z.esc(Z.t("take.pay.pickup")) + "</span></label>" +
      '<label class="pill"><input type="radio" name="pay" value="online"' + (co.pay === "online" ? " checked" : "") + "><span>" + Z.esc(Z.t("take.pay.online")) + "</span></label></div></div>" +
      (co.pay === "online" ? '<div class="card-demo"><span class="card-demo__badge">' + Z.esc(Z.t("pay.demo")) + '</span><div class="field"><label for="cd-n">' + Z.esc(Z.t("pay.number")) + '</label><input id="cd-n" type="text" disabled placeholder="•••• •••• •••• ••••"></div><div class="form-grid form-grid--2"><div class="field"><label for="cd-e">' + Z.esc(Z.t("pay.expiry")) + '</label><input id="cd-e" type="text" disabled placeholder="MM/AA"></div><div class="field"><label for="cd-c">CVC</label><input id="cd-c" type="text" disabled placeholder="•••"></div></div></div>' : "") +
      '<div class="field' + (errors.consent ? " field--error" : "") + '" style="margin-top:14px"><label class="choice"><input type="checkbox" name="consent"' + (co.consent ? " checked" : "") + "><span>" + window.I18N.h("take.consent") + "</span></label>" + err("consent") + "</div>" +
      '<div class="cart-total"><span>' + Z.esc(Z.t("take.total")) + "</span><span>" + Z.esc(Z.euro(total())) + '</span></div><button type="button" class="btn btn--primary" style="width:100%" data-go="confirm">' + Z.esc(Z.t(co.pay === "online" ? "take.confirm.online" : "take.confirm.pickup")) + "</button></form>";
  }
  function doneView() {
    return '<div class="confirm"><p class="eyebrow">' + Z.esc(Z.t("take.done.eyebrow")) + "</p><h3>" + Z.esc(Z.t("take.done.title")) + '</h3><div class="confirm__code" style="font-size:1.5rem">' + Z.esc(order.number) + "</div>" +
      '<dl class="summary"><div><dt>' + Z.esc(Z.t("take.done.pickup")) + "</dt><dd>" + Z.esc(Z.fmtDate(order.date, { weekday: "short", day: "numeric", month: "long" }) + " · " + order.time) + "</dd></div>" +
      "<div><dt>" + Z.esc(Z.t("sum.name")) + "</dt><dd>" + Z.esc(order.name) + "</dd></div><div><dt>" + Z.esc(Z.t("take.pay")) + "</dt><dd>" + Z.esc(Z.t(order.pay === "online" ? "take.pay.online" : "take.pay.pickup")) + "</dd></div>" +
      order.lines.map(function (l) { return "<div><dt>" + l.qty + " × " + Z.esc(l.name) + (l.note ? "<br><small>" + Z.esc(l.note) + "</small>" : "") + "</dt><dd>" + Z.esc(Z.euro(l.sum)) + "</dd></div>"; }).join("") +
      "<div><dt><strong>" + Z.esc(Z.t("take.total")) + "</strong></dt><dd>" + Z.esc(Z.euro(order.total)) + "</dd></div></dl>" +
      '<p class="small">' + Z.esc(Z.t("take.pickup.where")) + '</p><p class="notice" style="text-align:left">' + Z.esc(Z.t("take.done.demo")) + '</p><button type="button" class="btn" data-go="new">' + Z.esc(Z.t("take.new")) + "</button></div>";
  }

  function renderCart() {
    var box = Z.$("#cart"), n = count();
    var close = '<button type="button" class="btn btn--sm cart-close" data-close>' + Z.esc(Z.t("take.close")) + "</button>";
    if (view === "cart") box.innerHTML = close + "<h2>" + Z.esc(Z.t("take.cart")) + "</h2>" + cartView();
    else if (view === "checkout") box.innerHTML = close + checkoutView();
    else box.innerHTML = close + doneView();
    var fab = Z.$("#cart-fab");
    fab.textContent = Z.t("take.fab", { n: n, total: Z.euro(total()) });
    fab.hidden = view === "done" ? true : n === 0;
    Z.$("#shop-cart").classList.toggle("is-open", sheetOpen);
  }

  function collectCo() {
    var f = Z.$("#cart form"); if (!f) return;
    ["name", "phone", "email"].forEach(function (k) { var e = f.elements[k]; if (e) co[k] = e.value.trim(); });
    var d = f.elements.date; if (d) co.date = d.value;
    var t = f.querySelector('[name="ptime"]:checked'); co.time = t ? t.value : (co.time && !f.querySelector('[name="ptime"][value="' + co.time + '"]:not(:disabled)') ? null : co.time);
    var p = f.querySelector('[name="pay"]:checked'); if (p) co.pay = p.value;
    var c = f.elements.consent; if (c) co.consent = c.checked;
  }

  function confirmOrder() {
    errors = {};
    if (!co.time) errors.time = "err.ptime";
    if (!co.name) errors.name = "err.name";
    if (co.phone.replace(/\D/g, "").length < 6) errors.phone = "err.phone";
    if (co.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(co.email)) errors.email = "err.email";
    if (!co.consent) errors.consent = "err.consent";
    if (Object.keys(errors).length) { renderCart(); var f = Z.$("#cart .field--error input, #cart .field--error button"); if (f) f.focus(); return; }
    order = { number: Z.code("ASP", 4), date: co.date, time: co.time, name: co.name, pay: co.pay, total: total(),
      lines: cart.map(function (l) { var it = window.MenuUtil.byId(l.id); return { qty: l.qty, name: (it.short || it.name) + (it.variants ? " – " + variantLabel(it, l.variant).split(" (")[0] : ""), note: l.note, sum: lineUnit(l) * l.qty }; }) };
    cart = []; save(); view = "done"; renderCart(); Z.$("#cart").scrollIntoView({ block: "start" });
  }

  function init() {
    if (!Z.$("#shop-menu")) return;
    load();
    co = { date: null, time: null, name: "", phone: "", email: "", pay: "pickup", consent: false };
    document.addEventListener("click", function (e) {
      var t = e.target;
      var add = t.closest("[data-add]");
      if (add) {
        var id = add.getAttribute("data-add"), it = window.MenuUtil.byId(id), sel = Z.$("#v-" + id), v = sel ? sel.value : (it.variants ? it.variants[0].id : "");
        var k = lineKey(id, v), line = cart.filter(function (l) { return lineKey(l.id, l.variant) === k; })[0];
        if (line) line.qty++; else cart.push({ id: id, variant: v, qty: 1, note: "" });
        save(); if (view !== "cart") view = "cart"; renderCart(); Z.toast(Z.esc(Z.t("take.added", { name: it.short || it.name })));
        return;
      }
      var q = t.closest("[data-q]");
      if (q) { var l = cart[+q.getAttribute("data-i")]; l.qty += +q.getAttribute("data-q"); if (l.qty < 1) cart.splice(+q.getAttribute("data-i"), 1); save(); renderCart(); var again = Z.$('[data-q][data-i="' + q.getAttribute("data-i") + '"][data-q="' + q.getAttribute("data-q") + '"]'); if (again) again.focus(); return; }
      var rm = t.closest("[data-rm]"); if (rm) { cart.splice(+rm.getAttribute("data-rm"), 1); save(); renderCart(); return; }
      var go = t.closest("[data-go]");
      if (go) {
        var g = go.getAttribute("data-go");
        if (g === "checkout") { view = "checkout"; errors = {}; renderCart(); }
        else if (g === "cart") { collectCo(); view = "cart"; renderCart(); }
        else if (g === "confirm") { collectCo(); confirmOrder(); }
        else if (g === "new") { view = "cart"; order = null; co.time = null; co.consent = false; sheetOpen = false; renderCart(); window.scrollTo(0, 0); }
        return;
      }
      if (t.closest("#cart-fab")) { sheetOpen = true; renderCart(); }
      if (t.closest("[data-close]")) { sheetOpen = false; renderCart(); }
      if (t.classList && t.id === "shop-cart") { sheetOpen = false; renderCart(); }
    });
    document.addEventListener("input", function (e) {
      var n = e.target.getAttribute && e.target.getAttribute("data-note");
      if (n != null && cart[+n]) { cart[+n].note = e.target.value; save(); }
    });
    document.addEventListener("change", function (e) {
      if (!e.target.closest || !e.target.closest("#cart form")) return;
      if (e.target.name === "date") { collectCo(); co.time = null; renderCart(); }
      if (e.target.name === "pay") { collectCo(); renderCart(); }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sheetOpen) { sheetOpen = false; renderCart(); } });
    document.addEventListener("langchange", function () { collectCo(); renderMenu(); renderCart(); });
    renderMenu(); renderCart();
  }
  Z.onReady(init);
})();
