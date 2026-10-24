/* voucher.js – buono regalo dimostrativo con anteprima dal vivo e stampa */
(function () {
  "use strict";
  var O = window.OSTERIA, V = O.voucher;
  var s, errors = {}, step = "form", host;

  function fresh() { return { kind: "amount", amount: V.amounts[1], custom: "", from: "", to: "", toEmail: "", msg: "", delivery: "email", sendDate: Z.rome().ymd, consent: false, code: null, yourEmail: "" }; }

  function amountLabel() {
    if (s.kind === "experience") return V.experience.price != null ? Z.euro(V.experience.price) : null;
    var n = s.kind === "custom" ? parseFloat(String(s.custom).replace(",", ".")) : s.amount;
    return isFinite(n) && n > 0 ? Z.euro(n) : null;
  }
  function err(k) { return errors[k] ? '<p class="error" role="alert" id="err-' + k + '">' + Z.esc(Z.t(errors[k])) + "</p>" : ""; }
  function inp(k, type, label, opt, extra) {
    return '<div class="field' + (errors[k] ? " field--error" : "") + '"><label for="g-' + k + '">' + Z.esc(Z.t(label)) + (opt ? ' <span class="hint">' + Z.esc(Z.t("common.optional")) + "</span>" : "") + '</label><input id="g-' + k + '" name="' + k + '" type="' + type + '" value="' + Z.esc(s[k]) + '"' + (errors[k] ? ' aria-invalid="true"' : "") + (extra || "") + ">" + err(k) + "</div>";
  }

  function formHtml() {
    var amounts = V.amounts.map(function (a) { return '<label class="pill"><input type="radio" name="kind" value="a' + a + '"' + (s.kind === "amount" && s.amount === a ? " checked" : "") + "><span>" + Z.esc(Z.euro(a)) + "</span></label>"; }).join("");
    var exp = V.experience;
    return "<form novalidate onsubmit=\"return false\"><fieldset><legend>" + Z.esc(Z.t("gift.f.what")) + "</legend>" +
      '<div class="field' + (errors.amount ? " field--error" : "") + '"><div class="amount-pills" role="radiogroup" aria-label="' + Z.esc(Z.t("gift.f.what")) + '">' + amounts +
      '<label class="pill"><input type="radio" name="kind" value="custom"' + (s.kind === "custom" ? " checked" : "") + "><span>" + Z.esc(Z.t("gift.f.custom")) + "</span></label>" +
      '<label class="pill"><input type="radio" name="kind" value="experience"' + (s.kind === "experience" ? " checked" : "") + "><span>" + Z.esc(exp.name) + "</span></label></div>" +
      '<p class="small">' + window.I18N.h("gift.f.amounts.ph") + "</p>" + err("amount") + "</div>" +
      (s.kind === "custom" ? '<div class="field"><label for="g-custom">' + Z.esc(Z.t("gift.f.custom.label")) + '</label><input id="g-custom" name="custom" type="number" inputmode="decimal" min="' + V.customMin + '" max="' + V.customMax + '" step="1" value="' + Z.esc(s.custom) + '"></div>' : "") +
      (s.kind === "experience" ? '<p class="notice">' + Z.esc(exp.name) + ": " + window.I18N.h("gift.f.exp.ph") + "</p>" : "") + "</fieldset>" +
      "<fieldset><legend>" + Z.esc(Z.t("gift.f.who")) + '</legend><div class="form-grid form-grid--2">' + inp("from", "text", "gift.f.from") + inp("to", "text", "gift.f.to") + "</div>" +
      '<div class="field"><label for="g-msg">' + Z.esc(Z.t("gift.f.msg")) + ' <span class="hint">' + Z.esc(Z.t("common.optional")) + '</span></label><textarea id="g-msg" name="msg" maxlength="200">' + Z.esc(s.msg) + '</textarea><span class="hint">' + Z.esc(Z.t("gift.f.msg.hint")) + "</span></div></fieldset>" +
      "<fieldset><legend>" + Z.esc(Z.t("gift.f.delivery")) + '</legend><div class="choices" role="radiogroup">' +
      '<label class="pill"><input type="radio" name="delivery" value="email"' + (s.delivery === "email" ? " checked" : "") + "><span>" + Z.esc(Z.t("gift.f.d.email")) + "</span></label>" +
      '<label class="pill"><input type="radio" name="delivery" value="print"' + (s.delivery === "print" ? " checked" : "") + "><span>" + Z.esc(Z.t("gift.f.d.print")) + "</span></label></div>" +
      (s.delivery === "email" ? '<div class="form-grid form-grid--2" style="margin-top:14px">' + inp("toEmail", "email", "gift.f.toemail") + '<div class="field"><label for="g-sendDate">' + Z.esc(Z.t("gift.f.senddate")) + '</label><input id="g-sendDate" name="sendDate" type="date" min="' + Z.rome().ymd + '" value="' + Z.esc(s.sendDate) + '"></div></div>' : "") +
      inp("yourEmail", "email", "gift.f.youremail", s.delivery !== "print") + "</fieldset>" +
      '<fieldset><legend>' + Z.esc(Z.t("gift.f.pay")) + '</legend><div class="card-demo"><span class="card-demo__badge">' + Z.esc(Z.t("pay.demo")) + '</span><div class="field"><label for="cd-n">' + Z.esc(Z.t("pay.number")) + '</label><input id="cd-n" type="text" disabled placeholder="•••• •••• •••• ••••"></div><div class="form-grid form-grid--2"><div class="field"><label for="cd-e">' + Z.esc(Z.t("pay.expiry")) + '</label><input id="cd-e" type="text" disabled placeholder="MM/AA"></div><div class="field"><label for="cd-c">CVC</label><input id="cd-c" type="text" disabled placeholder="•••"></div></div><p class="small muted" style="margin:0">' + Z.esc(Z.t("pay.demo.note")) + "</p></div></fieldset>" +
      '<div class="field' + (errors.consent ? " field--error" : "") + '"><label class="choice"><input type="checkbox" name="consent"' + (s.consent ? " checked" : "") + "><span>" + window.I18N.h("gift.f.consent") + "</span></label>" + err("consent") + "</div>" +
      '<button type="button" class="btn btn--primary" data-act="buy">' + Z.esc(Z.t("gift.f.buy")) + "</button></form>";
  }

  function doneHtml() {
    return '<div class="confirm"><p class="eyebrow">' + Z.esc(Z.t("gift.done.eyebrow")) + "</p><h2>" + Z.esc(Z.t("gift.done.title")) + "</h2><p>" + Z.esc(Z.t("gift.done.code")) + '</p><div class="confirm__code">' + Z.esc(s.code) + "</div>" +
      '<p>' + Z.esc(s.delivery === "email" ? Z.t("gift.done.email", { to: s.toEmail, date: Z.fmtDate(s.sendDate, { day: "numeric", month: "long", year: "numeric" }) }) : Z.t("gift.done.print")) + "</p>" +
      '<div class="btn-row" style="justify-content:center"><button type="button" class="btn btn--primary" data-act="print">' + Z.esc(Z.t("btn.print")) + '</button><button type="button" class="btn" data-act="again">' + Z.esc(Z.t("gift.again")) + "</button></div>" +
      '<p class="notice" style="margin-top:1.4rem;text-align:left">' + Z.esc(Z.t("gift.done.demo")) + "</p></div>";
  }

  function paintVoucher() {
    var a = amountLabel();
    var amountEl = Z.$("#v-amount");
    amountEl.innerHTML = a ? Z.esc(a) : (s.kind === "experience" ? '<span class="ph" style="font-size:.5em">[' + Z.esc(Z.t("gift.f.exp.price")) + "]</span>" : "– €");
    var who = [];
    if (s.to) who.push(Z.t("gift.v.to") + " <strong>" + Z.esc(s.to) + "</strong>");
    if (s.from) who.push(Z.t("gift.v.from") + " <strong>" + Z.esc(s.from) + "</strong>");
    Z.$("#v-names").innerHTML = who.join(" · ") || '<span class="muted">' + Z.esc(Z.t("gift.v.names")) + "</span>";
    Z.$("#v-msg").textContent = s.msg || Z.t("gift.v.msg");
    Z.$("#v-code").textContent = s.code || "ZU-XXXXXX";
    Z.$("#v-title").textContent = s.kind === "experience" ? V.experience.name : "";
  }

  function render(focus) {
    host.innerHTML = step === "form" ? formHtml() : doneHtml();
    paintVoucher();
    if (focus) { var f = host.querySelector(".field--error input"); if (f) f.focus(); }
  }

  function read() {
    var f = host.querySelector("form"); if (!f) return;
    var k = f.querySelector('[name="kind"]:checked');
    if (k) { if (k.value === "custom") s.kind = "custom"; else if (k.value === "experience") s.kind = "experience"; else { s.kind = "amount"; s.amount = +k.value.slice(1); } }
    ["custom", "from", "to", "toEmail", "msg", "sendDate", "yourEmail"].forEach(function (n) { var e = f.elements[n]; if (e) s[n] = e.value; });
    var d = f.querySelector('[name="delivery"]:checked'); if (d) s.delivery = d.value;
    var c = f.elements.consent; if (c) s.consent = c.checked;
  }

  function validate() {
    errors = {};
    if (s.kind === "custom") { var n = parseFloat(String(s.custom).replace(",", ".")); if (!isFinite(n) || n < V.customMin || n > V.customMax) errors.amount = "gift.err.amount"; }
    if (!s.from.trim()) errors.from = "gift.err.from";
    if (!s.to.trim()) errors.to = "gift.err.to";
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (s.delivery === "email" && !re.test(s.toEmail)) errors.toEmail = "err.email";
    if (s.delivery === "email" && (!s.sendDate || s.sendDate < Z.rome().ymd)) errors.toEmail = errors.toEmail || "gift.err.date";
    if (s.yourEmail && !re.test(s.yourEmail)) errors.yourEmail = "err.email";
    if (!s.consent) errors.consent = "err.consent";
    return !Object.keys(errors).length;
  }

  function init() {
    host = Z.$("#gift-form-card"); if (!host) return;
    s = fresh();
    var vt = document.createElement("p"); vt.id = "v-title"; vt.className = "voucher__names"; vt.style.fontWeight = "600";
    Z.$("#v-amount").parentNode.insertBefore(vt, Z.$("#v-amount").nextSibling);
    host.addEventListener("input", function (e) {
      var n = e.target.name; if (!n || n === "kind" || n === "delivery" || n === "consent") return;
      if (n in s) { s[n] = e.target.value; paintVoucher(); }
    });
    host.addEventListener("change", function (e) {
      var n = e.target.name;
      if (n === "kind" || n === "delivery") { read(); render(); var again = host.querySelector('[name="' + n + '"]:checked'); if (again) again.focus(); }
      else if (n === "sendDate") s.sendDate = e.target.value;
    });
    host.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (!b) return;
      var a = b.getAttribute("data-act");
      if (a === "buy") { read(); if (!validate()) { render(true); return; } s.code = Z.code("BR", 8).replace("BR-", "ZU-"); step = "done"; render(); Z.$("#voucher").scrollIntoView({ block: "center" }); }
      if (a === "again") { s = fresh(); step = "form"; errors = {}; render(); window.scrollTo(0, 0); }
      if (a === "print") { document.body.classList.add("print-voucher"); window.print(); setTimeout(function () { document.body.classList.remove("print-voucher"); }, 500); }
    });
    window.addEventListener("afterprint", function () { document.body.classList.remove("print-voucher"); });
    document.addEventListener("langchange", function () { read(); render(); });
    render();
  }
  Z.onReady(init);
})();
