/* menu.js – disegna il menù da menu-data.js, con filtri, allergeni e barra delle categorie */
(function () {
  "use strict";
  var active = {};            // filtri attivi
  var order = ["vegetarian", "vegan", "glutenfree"];

  function lang() { return window.I18N.lang; }

  function allergenBadges(item) {
    var all = window.MenuUtil.allergensOf(item);
    if (item.variants) item.variants.forEach(function (v) { v.allergens.forEach(function (a) { if (all.indexOf(a) < 0) all.push(a); }); });
    return all.map(function (a) {
      var A = window.ALLERGENS[a], n = A[lang()];
      return '<button type="button" class="allergen" aria-expanded="false" aria-label="' + Z.esc(Z.t("menu.allergen") + ": " + n) + '" title="' + Z.esc(n) + '">' +
        '<span aria-hidden="true">' + A.icon + '</span><span class="allergen__name">' + Z.esc(n) + "</span></button>";
    }).join("");
  }

  function dishHtml(it) {
    var l = lang(), tags = "";
    if (it.house) tags += '<span class="tag tag--house">' + Z.esc(Z.t("menu.house")) + "</span>";
    if (it.diet.indexOf("vegan") >= 0) tags += '<span class="tag">' + Z.esc(Z.t("menu.tag.vegan")) + "</span>";
    else if (it.diet.indexOf("vegetarian") >= 0) tags += '<span class="tag">' + Z.esc(Z.t("menu.tag.veg")) + "</span>";
    if (it.diet.indexOf("glutenfree") >= 0) tags += '<span class="tag">' + Z.esc(Z.t("menu.tag.gf")) + "</span>";
    var price = it.variants ? "" : '<span class="dish__dots" aria-hidden="true"></span><span class="dish__price">' + Z.esc(Z.euro(it.price)) + (it.per ? ' <small class="muted" style="font:400 .8rem var(--sans)">' + Z.esc(Z.t("menu.perperson")) + "</small>" : "") + "</span>";
    var variants = "";
    if (it.variants) {
      variants = it.variants.map(function (v) {
        return '<div class="variant"><span>' + Z.esc(v.label[l] || v.label.it) + '</span><span class="dish__dots" aria-hidden="true"></span><span class="dish__price">' + Z.esc(Z.euro(v.price)) + "</span></div>";
      }).join("");
    }
    var data = it.diet.join(" ");
    var desc = it.variants && it.id === "vino-casa" ? "" : '<p class="dish__desc">' + Z.esc(it.desc[l] || it.desc.it) + "</p>";
    if (it.variants && it.id === "vino-casa") desc = '<p class="dish__desc">' + Z.esc(it.desc[l]) + "</p>";
    var note = (l === "en" && it.note) ? '<p class="dish__note">' + Z.esc(it.note.en) + "</p>" : "";
    var pend = it.pending ? '<p class="small" style="margin:4px 0 0">' + window.I18N.ph(Z.esc(it.pending)) + "</p>" : "";
    var meta = (tags || it.allergens.length || (it.variants && allergenBadges(it))) ? '<div class="dish__meta">' + tags + allergenBadges(it) + "</div>" : "";
    return '<article class="dish' + (it.house ? " is-house" : "") + '" id="dish-' + it.id + '" data-diet="' + data + '"><div class="dish__top"><h3 class="dish__name">' + Z.esc(it.name) + "</h3>" + price + "</div>" + variants + desc + note + pend + meta + "</article>";
  }

  function render() {
    var l = lang(), body = Z.$("#menu-body"), nav = Z.$("#catnav");
    var html = "", navHtml = "";
    window.MENU_CATEGORIES.forEach(function (c) {
      var items = window.MenuUtil.byCat(c.id);
      navHtml += '<li><a href="#cat-' + c.id + '" data-cat="' + c.id + '">' + Z.esc(c[l]) + "</a></li>";
      var extra = "";
      if (c.id === "contorni") extra = '<small>' + Z.esc(Z.t("menu.each5")) + "</small>";
      html += '<section class="menu-cat" id="cat-' + c.id + '" data-cat="' + c.id + '"><h2>' + Z.esc(c[l]) + extra + '</h2><div class="menu-cols">' + items.map(dishHtml).join("") + "</div>" +
        (c.id === "secondi" ? "" : "") + "</section>";
    });
    /* vini e fuori menù */
    var wl = "";
    for (var i = 0; i < window.WINE_PLACEHOLDERS; i++) wl += '<div><span class="ph">[' + Z.esc(Z.t("menu.wine.row")) + "]</span></div>";
    html += '<section class="menu-cat" id="cat-vini" data-cat="vini"><h2>' + Z.esc(Z.t("menu.wines")) + '</h2><p class="ph-line">' + window.I18N.h("menu.wine.ph") + '</p><div class="wine-lines">' + wl + "</div></section>";
    html += '<section class="menu-cat" id="cat-fuori" data-cat="fuori"><h2>' + Z.esc(Z.t("menu.off")) + '</h2><p>' + Z.esc(Z.t("menu.off.lead")) + '</p><p>' + window.I18N.h("menu.off.ph") + "</p></section>";
    navHtml += '<li><a href="#cat-vini" data-cat="vini">' + Z.esc(Z.t("menu.wines")) + '</a></li><li><a href="#cat-fuori" data-cat="fuori">' + Z.esc(Z.t("menu.off")) + "</a></li>";
    body.innerHTML = html; nav.innerHTML = navHtml;

    var lg = Z.$("#legend");
    lg.innerHTML = Object.keys(window.ALLERGENS).map(function (k) { var a = window.ALLERGENS[k]; return "<li><span aria-hidden=\"true\">" + a.icon + "</span> " + Z.esc(a[l]) + "</li>"; }).join("");
    applyFilters();
  }

  function applyFilters() {
    var keys = order.filter(function (k) { return active[k]; });
    Z.$$(".filter").forEach(function (b) { b.setAttribute("aria-pressed", active[b.getAttribute("data-filter")] ? "true" : "false"); });
    var shown = 0;
    Z.$$(".dish").forEach(function (d) {
      var diet = d.getAttribute("data-diet").split(" ");
      var ok = keys.every(function (k) { return diet.indexOf(k) >= 0; });
      d.hidden = !ok; if (ok) shown++;
    });
    Z.$$(".menu-cat").forEach(function (c) {
      var cat = c.getAttribute("data-cat");
      if (cat === "vini" || cat === "fuori") { c.hidden = keys.length > 0; return; }
      c.hidden = !Z.$$(".dish:not([hidden])", c).length;
    });
    Z.$$("#catnav a").forEach(function (a) { var c = Z.$("#cat-" + a.getAttribute("data-cat")); a.parentNode.hidden = !c || c.hidden; });
    var note = Z.$("#filter-note");
    var msg = "";
    if (keys.length) msg = Z.t("menu.shown", { n: shown });
    if (active.glutenfree) msg += " " + Z.t("menu.celiac");
    note.textContent = msg.trim();
  }

  function highlight() {
    var cats = Z.$$(".menu-cat:not([hidden])"), cur = null, y = (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 56) + 110;
    cats.forEach(function (c) { if (c.getBoundingClientRect().top <= y) cur = c.getAttribute("data-cat"); });
    Z.$$("#catnav a").forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("data-cat") === cur); });
  }

  Z.onReady(function () {
    render();
    document.addEventListener("langchange", render);
    Z.$("#filters").addEventListener("click", function (e) {
      var b = e.target.closest(".filter"); if (!b) return;
      var k = b.getAttribute("data-filter");
      active[k] = !active[k];
      if (k === "vegan" && active.vegan) active.vegetarian = false;
      if (k === "vegetarian" && active.vegetarian) active.vegan = false;
      applyFilters(); highlight();
    });
    document.addEventListener("click", function (e) {
      var b = e.target.closest(".allergen");
      Z.$$(".allergen.is-open").forEach(function (x) { if (x !== b) { x.classList.remove("is-open"); x.setAttribute("aria-expanded", "false"); } });
      if (b) { var o = b.classList.toggle("is-open"); b.setAttribute("aria-expanded", o ? "true" : "false"); }
    });
    window.addEventListener("scroll", highlight, { passive: true });
    highlight();
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(function () { t.scrollIntoView(); }, 60); }
  });
})();
