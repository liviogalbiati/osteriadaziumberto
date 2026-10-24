/* home.js – piatti in evidenza e domande frequenti della home */
(function () {
  "use strict";
  var FEATURED = [
    ["cacio-pepe", "cacio"], ["amatriciana", "amatriciana"], ["gricia", "amatriciana"],
    ["carbonara", "carbonara"], ["fiori-zucca", "fiori"], ["coda", "coda"]
  ];
  var FAQ_COUNT = 10;

  function renderDishes() {
    var host = Z.$("#home-dishes");
    if (!host) return;
    var lang = window.I18N.lang;
    host.innerHTML = FEATURED.map(function (f) {
      var it = window.MenuUtil.byId(f[0]);
      if (!it) return "";
      return '<article class="card dish-card reveal in">' + Z.photoHtml(f[1], "4/3") +
        '<div class="dish-card__body"><div class="dish-card__top"><h3>' + Z.esc(it.short || it.name) + '</h3><span class="price">' + Z.esc(Z.euro(window.MenuUtil.priceOf(it))) + "</span></div>" +
        "<p>" + Z.esc(it.desc[lang] || it.desc.it) + '</p><a href="menu.html#dish-' + it.id + '">' + Z.esc(Z.t("home.dishes.inmenu")) + " →</a></div></article>";
    }).join("");
    Z.fillPhotos();
  }

  function renderFaq() {
    var host = Z.$("#faq-list");
    if (!host) return;
    var html = "";
    for (var i = 1; i <= FAQ_COUNT; i++) {
      html += "<details><summary>" + window.I18N.h("faq." + i + ".q") + "</summary><div>" + window.I18N.h("faq." + i + ".a") + "</div></details>";
    }
    host.innerHTML = html;
  }

  Z.onReady(function () {
    renderDishes(); renderFaq();
    document.addEventListener("langchange", function () { renderDishes(); renderFaq(); });
  });
})();
