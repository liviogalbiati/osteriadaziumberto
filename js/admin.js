/* admin.js – area ristoratore DIMOSTRATIVA. Dati fittizi, nessun login, nulla viene salvato. */
(function () {
  "use strict";
  var autos = [
    { id: "confirm", on: true, key: "msg.sms.confirm" },
    { id: "remind", on: true, key: "msg.sms.remind" },
    { id: "review", on: true, key: "msg.sms.review" }
  ];
  var texts = {};         // testi modificati dal ristoratore (solo in memoria)
  var edits = {};         // modifiche ai piatti (solo in memoria)

  function badge(k, cls) { return '<span class="badge' + (cls ? " badge--" + cls : "") + '">' + Z.esc(Z.t(k)) + "</span>"; }

  function renderRes() {
    var now = Z.rome();
    Z.$("#a-res-sub").textContent = Z.t("admin.res.sub", { date: Z.fmtDate(now.ymd) });
    var rows = [
      ["12:45", "Rossi M.", 4, "book.table.square", "admin.st.confirmed", "", "—"],
      ["13:15", "Bianchi L.", 2, "book.table.room", "admin.st.arrived", "", "—"],
      ["13:30", "Esposito G.", 6, "book.table.any", "admin.st.confirmed", "", "—"],
      ["20:00", "Conti A.", 3, "book.table.room", "admin.st.confirmed", "", "—"],
      ["20:30", "Gruppo Verdi (compleanno)", 10, "book.table.square", "admin.st.pending", "warn", "admin.dep.deposit"],
      ["21:00", "Ferri S.", 2, "book.table.square", "admin.st.confirmed", "", "—"],
      ["21:15", "Marino P.", 8, "book.table.room", "admin.st.confirmed", "", "admin.dep.card"]
    ];
    Z.$("#a-res-table").innerHTML = "<thead><tr><th>" + Z.esc(Z.t("sum.time")) + "</th><th>" + Z.esc(Z.t("sum.name")) + "</th><th>" + Z.esc(Z.t("sum.people")) + "</th><th>" + Z.esc(Z.t("sum.table")) + "</th><th>" + Z.esc(Z.t("admin.col.status")) + "</th><th>" + Z.esc(Z.t("admin.col.deposit")) + "</th></tr></thead><tbody>" +
      rows.map(function (r) { return "<tr><td>" + r[0] + "</td><td>" + Z.esc(r[1]) + "</td><td>" + r[2] + "</td><td>" + Z.esc(Z.t(r[3])) + "</td><td>" + badge(r[4], r[5]) + "</td><td>" + (r[6] === "—" ? "—" : badge(r[6], "warn")) + "</td></tr>"; }).join("") + "</tbody>";
  }

  function sampleVars() {
    var now = Z.rome(), d = Z.addDays(now.ymd, 3);
    return { name: "Marta", code: "ZU-K7P4XQ", people: 4, time: "20:30", date: Z.fmtDate(d, { weekday: "long", day: "numeric", month: "long" }), link: "[LINK RECENSIONE GOOGLE]" };
  }
  function fill(t, v) { return t.replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); }

  function renderAutos() {
    var host = Z.$("#a-auto-list");
    host.innerHTML = autos.map(function (a) {
      var txt = texts[a.id] != null ? texts[a.id] : Z.t(a.key);
      return '<div class="auto-item"><label class="switch"><span><strong>' + Z.esc(Z.t("admin.auto." + a.id)) + '</strong><br><span class="muted small">' + Z.esc(Z.t("admin.auto." + a.id + ".sub")) + '</span></span>' +
        '<input type="checkbox" data-auto="' + a.id + '"' + (a.on ? " checked" : "") + '><span class="switch__ui" aria-hidden="true"></span></label>' +
        '<label class="label" for="at-' + a.id + '">' + Z.esc(Z.t("admin.auto.text")) + '</label><textarea id="at-' + a.id + '" data-text="' + a.id + '">' + Z.esc(txt) + "</textarea>" +
        '<p class="small muted" style="margin:6px 0 2px">' + Z.esc(Z.t("admin.auto.preview")) + '</p><div class="bubble bubble--sms' + (a.on ? "" : " is-off") + '" id="ap-' + a.id + '">' + window.I18N.ph(Z.esc(fill(txt, sampleVars()))) + "</div></div>";
    }).join("");
  }

  function dishText(it) { return edits[it.id] || {}; }
  function renderPreview() {
    var it = window.MenuUtil.byId(Z.$("#a-dish").value), e = dishText(it), l = window.I18N.lang;
    var price = e.price != null ? e.price : (it.variants ? it.variants[0].price : it.price);
    var desc = e.desc != null ? e.desc : (it.desc[l] || it.desc.it);
    var off = e.avail === "no";
    Z.$("#a-preview").innerHTML = '<div class="dish__top"><h3 class="dish__name">' + Z.esc(it.name) + '</h3><span class="dish__dots" aria-hidden="true"></span><span class="dish__price">' + (off ? '<span style="color:var(--mattone)">' + Z.esc(Z.t("admin.menu.soldout")) + "</span>" : Z.esc(Z.euro(+price))) + '</span></div><p class="dish__desc">' + Z.esc(desc) + "</p>";
  }
  function loadDishFields() {
    var it = window.MenuUtil.byId(Z.$("#a-dish").value), e = dishText(it), l = window.I18N.lang;
    Z.$("#a-price").value = e.price != null ? e.price : (it.variants ? it.variants[0].price : it.price);
    Z.$("#a-desc").value = e.desc != null ? e.desc : (it.desc[l] || it.desc.it);
    Z.$("#a-avail").value = e.avail || "yes";
    renderPreview();
  }
  function renderDishSelect() {
    var sel = Z.$("#a-dish"), cur = sel.value;
    sel.innerHTML = window.MENU_ITEMS.map(function (it) { return '<option value="' + it.id + '">' + Z.esc(it.short || it.name) + "</option>"; }).join("");
    if (cur) sel.value = cur;
    loadDishFields();
  }

  function renderLists() {
    Z.$("#a-orders").innerHTML = "<thead><tr><th>N.</th><th>" + Z.esc(Z.t("take.done.pickup")) + "</th><th>" + Z.esc(Z.t("take.total")) + "</th><th>" + Z.esc(Z.t("admin.col.status")) + "</th></tr></thead><tbody>" +
      [["ASP-4821", "12:50", "26 €", "admin.st.ready", ""], ["ASP-4822", "13:10", "38 €", "admin.st.preparing", "warn"], ["ASP-4823", "20:15", "17 €", "admin.st.confirmed", ""]].map(function (r) {
        return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td><td>" + r[2] + "</td><td>" + badge(r[3], r[4]) + "</td></tr>"; }).join("") + "</tbody>";
    Z.$("#a-gifts").innerHTML = "<thead><tr><th>" + Z.esc(Z.t("sum.code")) + "</th><th>" + Z.esc(Z.t("gift.v.to")) + "</th><th>" + Z.esc(Z.t("take.total")) + "</th><th>" + Z.esc(Z.t("admin.col.status")) + "</th></tr></thead><tbody>" +
      [["ZU-8H2M4C7D", "Anna", "60 €", "admin.st.sent", ""], ["ZU-3Q9T6E2K", "Luca", "100 €", "admin.st.scheduled", "warn"], ["ZU-5V7R2N8B", "Giulia", "30 €", "admin.st.redeemed", ""]].map(function (r) {
        return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td><td>" + r[2] + "</td><td>" + badge(r[3], r[4]) + "</td></tr>"; }).join("") + "</tbody>";
  }

  function renderAll() { renderRes(); renderAutos(); renderLists(); renderDishSelect(); }

  Z.onReady(function () {
    if (!Z.$("#a-res-table")) return;
    renderAll();
    document.addEventListener("langchange", function () { texts = {}; renderAll(); });
    var host = Z.$("#a-auto-list");
    host.addEventListener("input", function (e) {
      var id = e.target.getAttribute("data-text"); if (!id) return;
      texts[id] = e.target.value; Z.$("#ap-" + id).innerHTML = window.I18N.ph(Z.esc(fill(e.target.value, sampleVars())));
    });
    host.addEventListener("change", function (e) {
      var id = e.target.getAttribute("data-auto"); if (!id) return;
      autos.filter(function (a) { return a.id === id; })[0].on = e.target.checked;
      Z.$("#ap-" + id).classList.toggle("is-off", !e.target.checked);
    });
    Z.$("#a-dish").addEventListener("change", loadDishFields);
    ["a-price", "a-desc", "a-avail"].forEach(function (id) {
      Z.$("#" + id).addEventListener("input", function () {
        var did = Z.$("#a-dish").value, e = edits[did] || (edits[did] = {});
        e.price = Z.$("#a-price").value; e.desc = Z.$("#a-desc").value; e.avail = Z.$("#a-avail").value; renderPreview();
      });
    });
  });
})();
