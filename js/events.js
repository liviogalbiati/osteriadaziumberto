/* events.js – richiesta eventi e gruppi (dimostrativa: nessun dato parte) */
(function () {
  "use strict";
  var O = window.OSTERIA;
  var host, s, errors = {}, done = false;
  var TYPES = ["birthday", "corporate", "communion", "baptism", "graduation", "other"];
  var BUDGETS = ["b25", "b35", "b50", "b50p"];

  function fresh() {
    return { type: "birthday", date: "", meal: "dinner", people: "", budget: "b35", menu: "fixed", space: "any", exclusive: "no", diet: "", requests: "",
      company: "", invoice: "", name: "", phone: "", email: "", channel: "email", consent: false, code: null };
  }
  function err(k) { return errors[k] ? '<p class="error" role="alert" id="err-' + k + '">' + Z.esc(Z.t(errors[k])) + "</p>" : ""; }
  function inp(k, type, label, opt, extra) {
    return '<div class="field' + (errors[k] ? " field--error" : "") + '"><label for="e-' + k + '">' + Z.esc(Z.t(label)) + (opt ? ' <span class="hint">' + Z.esc(Z.t("common.optional")) + "</span>" : "") + '</label><input id="e-' + k + '" name="' + k + '" type="' + type + '" value="' + Z.esc(s[k]) + '"' + (errors[k] ? ' aria-invalid="true"' : "") + (extra || "") + ">" + err(k) + "</div>";
  }
  function area(k, label, opt) {
    return '<div class="field"><label for="e-' + k + '">' + Z.esc(Z.t(label)) + (opt ? ' <span class="hint">' + Z.esc(Z.t("common.optional")) + "</span>" : "") + '</label><textarea id="e-' + k + '" name="' + k + '">' + Z.esc(s[k]) + "</textarea></div>";
  }
  function pills(name, list, current, prefix) {
    return '<div class="choices" role="radiogroup">' + list.map(function (v) { return '<label class="pill"><input type="radio" name="' + name + '" value="' + v + '"' + (current === v ? " checked" : "") + "><span>" + Z.esc(Z.t(prefix + v)) + "</span></label>"; }).join("") + "</div>";
  }
  function row(label, id, inner) { return '<div class="field"><span class="label" id="' + id + '">' + Z.esc(Z.t(label)) + "</span>" + inner + "</div>"; }

  function formHtml() {
    var corp = s.type === "corporate";
    return "<form novalidate onsubmit=\"return false\">" +
      "<fieldset><legend>" + Z.esc(Z.t("ev.f.event")) + "</legend>" + row("ev.f.type", "l-type", pills("type", TYPES, s.type, "ev.type.")) +
      '<div class="form-grid form-grid--2">' + inp("date", "date", "ev.f.date", false, ' min="' + Z.rome().ymd + '"') + inp("people", "number", "ev.f.people", false, ' min="1" max="200" inputmode="numeric"') + "</div>" +
      row("ev.f.meal", "l-meal", pills("meal", ["lunch", "dinner"], s.meal, "book.")) +
      row("ev.f.budget", "l-budget", pills("budget", BUDGETS, s.budget, "ev.budget.")) +
      row("ev.f.menu", "l-menu", pills("menu", ["fixed", "carte"], s.menu, "ev.menu.")) +
      row("ev.f.space", "l-space", pills("space", ["room", "square", "any"], s.space, "book.table.")) +
      row("ev.f.exclusive", "l-ex", pills("exclusive", ["yes", "no"], s.exclusive, "ev.ex.")) + "</fieldset>" +
      "<fieldset><legend>" + Z.esc(Z.t("ev.f.more")) + "</legend>" + area("diet", "ev.f.diet", true) + area("requests", "ev.f.requests", true) + "</fieldset>" +
      (corp ? "<fieldset><legend>" + Z.esc(Z.t("ev.f.corp")) + "</legend>" + inp("company", "text", "ev.f.company") + area("invoice", "ev.f.invoice", true) + "</fieldset>" : "") +
      "<fieldset><legend>" + Z.esc(Z.t("ev.f.contact")) + '</legend><div class="form-grid form-grid--2">' + inp("name", "text", "f.name") + inp("phone", "tel", "f.phone") + "</div>" + inp("email", "email", "f.email") +
      row("ev.f.channel", "l-ch", pills("channel", ["phone", "email", "wa"], s.channel, "ev.ch.")) + "</fieldset>" +
      '<div class="field' + (errors.consent ? " field--error" : "") + '"><label class="choice"><input type="checkbox" name="consent"' + (s.consent ? " checked" : "") + "><span>" + window.I18N.h("ev.f.consent") + "</span></label>" + err("consent") + "</div>" +
      '<button type="button" class="btn btn--primary" data-act="send">' + Z.esc(Z.t("ev.f.send")) + "</button></form>";
  }

  function doneHtml() {
    var rows = [["ev.f.type", Z.t("ev.type." + s.type)], ["ev.f.date", Z.fmtDate(s.date)], ["ev.f.meal", Z.t("book." + s.meal)], ["ev.f.people", s.people],
      ["ev.f.budget", Z.t("ev.budget." + s.budget)], ["ev.f.menu", Z.t("ev.menu." + s.menu)], ["ev.f.space", Z.t("book.table." + s.space)], ["ev.f.exclusive", Z.t("ev.ex." + s.exclusive)]];
    if (s.type === "corporate") rows.push(["ev.f.company", s.company]);
    rows.push(["sum.name", s.name], ["sum.phone", s.phone], ["sum.email", s.email], ["ev.f.channel", Z.t("ev.ch." + s.channel)]);
    return '<div class="confirm"><p class="eyebrow">' + Z.esc(Z.t("ev.done.eyebrow")) + "</p><h2>" + Z.esc(Z.t("ev.done.title")) + "</h2>" +
      '<p class="lead">' + Z.esc(Z.t("ev.done.reply", { hours: O.events.replyHours })) + '</p><p>' + Z.esc(Z.t("ev.done.code")) + '</p><div class="confirm__code">' + Z.esc(s.code) + "</div>" +
      '<dl class="summary">' + rows.map(function (r) { return "<div><dt>" + Z.esc(Z.t(r[0])) + "</dt><dd>" + Z.esc(r[1]) + "</dd></div>"; }).join("") + "</dl>" +
      '<p class="notice" style="text-align:left;max-width:520px;margin:0 auto 1rem">' + Z.esc(Z.t("ev.done.demo")) + '</p><div class="btn-row" style="justify-content:center"><a class="btn btn--primary" href="index.html">' + Z.esc(Z.t("book.done.home")) + '</a><button type="button" class="btn" data-act="again">' + Z.esc(Z.t("ev.again")) + "</button></div></div>";
  }

  function read() {
    var f = host.querySelector("form"); if (!f) return;
    ["date", "people", "diet", "requests", "company", "invoice", "name", "phone", "email"].forEach(function (n) { var e = f.elements[n]; if (e) s[n] = e.value.trim ? e.value.trim() : e.value; });
    ["type", "meal", "budget", "menu", "space", "exclusive", "channel"].forEach(function (n) { var e = f.querySelector('[name="' + n + '"]:checked'); if (e) s[n] = e.value; });
    var c = f.elements.consent; if (c) s.consent = c.checked;
  }
  function validate() {
    errors = {};
    if (!s.date || s.date < Z.rome().ymd) errors.date = "ev.err.date";
    var n = parseInt(s.people, 10); if (!(n >= 1)) errors.people = "ev.err.people";
    if (s.type === "corporate" && !s.company) errors.company = "ev.err.company";
    if (!s.name) errors.name = "err.name";
    if (s.phone.replace(/\D/g, "").length < 6) errors.phone = "err.phone";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) errors.email = "err.email";
    if (!s.consent) errors.consent = "err.consent";
    return !Object.keys(errors).length;
  }
  function render(focus) {
    host.innerHTML = done ? doneHtml() : formHtml();
    if (focus) { var f = host.querySelector(".field--error input, .field--error textarea"); if (f) f.focus(); }
  }
  function init() {
    host = Z.$("#ev-app"); if (!host) return;
    s = fresh();
    host.addEventListener("change", function (e) { if (e.target.name === "type") { read(); render(); var t = host.querySelector('[name="type"]:checked'); if (t) t.focus(); } });
    host.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (!b) return;
      if (b.getAttribute("data-act") === "send") { read(); if (!validate()) { render(true); return; } s.code = Z.code("EV"); done = true; render(); window.scrollTo(0, 0); }
      if (b.getAttribute("data-act") === "again") { s = fresh(); done = false; errors = {}; render(); window.scrollTo(0, 0); }
    });
    document.addEventListener("langchange", function () { if (!done) read(); render(); });
    render();
  }
  Z.onReady(init);
})();
