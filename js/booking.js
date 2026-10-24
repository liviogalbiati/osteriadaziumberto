/* booking.js – prenotazione dimostrativa a passi, con caparra/carta a garanzia quando serve.
   Nessun dato parte: tutto resta nella pagina. Regole e orari: js/config.js */
(function () {
  "use strict";
  var O = window.OSTERIA, B = O.booking;
  var host, state, stepIdx, errors;

  function fresh() {
    return { date: null, people: 2, meal: "dinner", time: null, table: "any", name: "", phone: "", email: "", notes: "", allergies: "",
      ch: { sms: true, email: false, wa: false }, consentPrivacy: false, consentReview: false, guarantee: null, code: null };
  }

  /* ---------- regole caparra (da config.js) ---------- */
  function depositReasons(s) {
    var r = [], D = O.deposit;
    if (s.people >= D.groupSize) r.push("group");
    if (s.date && D.dates.indexOf(s.date.slice(5)) >= 0) r.push("date");
    if (D.saturdayDinner && s.date && Z.weekdayOf(s.date) === 6 && s.meal === "dinner") r.push("saturday");
    return r;
  }
  function steps() {
    var list = ["when", "time", "details", "remind"];
    if (state.date && depositReasons(state).length) list.push("deposit");
    list.push("summary");
    return list;
  }

  /* ---------- orari proposti ---------- */
  function slotsFor() {
    var range = B[state.meal], times = Z.slotTimes(range, B.slotMinutes), now = Z.rome();
    return times.map(function (t) {
      var off = Z.hash(state.date + t + state.meal) < B.soldOutShare;
      if (state.date === now.ymd && Z.toMin(t) < now.minutes + 30) off = true;
      return { time: t, off: off };
    });
  }

  /* ---------- piccoli pezzi di HTML ---------- */
  function fieldErr(k) { return errors[k] ? '<p class="error" id="err-' + k + '" role="alert">' + Z.esc(Z.t(errors[k])) + "</p>" : ""; }
  function field(k, type, label, val, extra) {
    extra = extra || {};
    return '<div class="field' + (errors[k] ? " field--error" : "") + '"><label for="f-' + k + '">' + Z.esc(Z.t(label)) + (extra.opt ? ' <span class="hint">' + Z.esc(Z.t("common.optional")) + "</span>" : "") + "</label>" +
      (type === "textarea" ? '<textarea id="f-' + k + '" name="' + k + '"' + (extra.ph ? ' placeholder="' + Z.esc(Z.t(extra.ph)) + '"' : "") + (errors[k] ? ' aria-invalid="true" aria-describedby="err-' + k + '"' : "") + ">" + Z.esc(val) + "</textarea>" :
        '<input id="f-' + k + '" name="' + k + '" type="' + type + '" value="' + Z.esc(val) + '"' + (extra.auto ? ' autocomplete="' + extra.auto + '"' : "") + (errors[k] ? ' aria-invalid="true" aria-describedby="err-' + k + '"' : "") + ">") +
      (extra.hint ? '<span class="hint">' + window.I18N.h(extra.hint) + "</span>" : "") + fieldErr(k) + "</div>";
  }
  function progress() {
    var list = steps();
    return '<ol class="steps" aria-hidden="true">' + list.map(function (s, i) { return '<li class="' + (i < stepIdx ? "is-done" : i === stepIdx ? "is-now" : "") + '"></li>'; }).join("") + "</ol>" +
      '<p class="step-title">' + Z.esc(Z.t("book.step", { n: stepIdx + 1, total: list.length })) + "</p>";
  }
  function nav(nextKey) {
    return '<div class="form-nav">' + (stepIdx > 0 ? '<button type="button" class="btn" data-act="back">' + Z.esc(Z.t("btn.back")) + "</button>" : "<span></span>") +
      '<button type="button" class="btn btn--primary" data-act="next">' + Z.esc(Z.t(nextKey || "btn.next")) + "</button></div>";
  }
  function pill(name, val, label, checked, sub) {
    return '<label class="pill pill--block"><input type="radio" name="' + name + '" value="' + val + '"' + (checked ? " checked" : "") + "><span>" + Z.esc(Z.t(label)) + (sub ? "<small>" + Z.esc(Z.t(sub)) + "</small>" : "") + "</span></label>";
  }

  /* ---------- i passi ---------- */
  var views = {
    when: function () {
      var max = B.maxPeople;
      return '<fieldset><legend>' + Z.esc(Z.t("book.when.legend")) + '</legend>' +
        '<div class="field' + (errors.date ? " field--error" : "") + '"><span class="label" id="lbl-date">' + Z.esc(Z.t("book.date")) + '</span><div id="cal-host"></div>' + fieldErr("date") +
        '<p class="small" id="date-picked">' + (state.date ? Z.esc(Z.fmtDate(state.date)) : "") + "</p></div>" +
        '<div class="field"><span class="label" id="lbl-people">' + Z.esc(Z.t("book.people")) + '</span><div class="stepper" role="group" aria-labelledby="lbl-people">' +
        '<button type="button" data-act="minus" aria-label="' + Z.esc(Z.t("book.people.less")) + '">–</button><output id="people-out" aria-live="polite">' + state.people + '</output>' +
        '<button type="button" data-act="plus" aria-label="' + Z.esc(Z.t("book.people.more")) + '">+</button></div>' +
        '<span class="hint">' + (state.people >= max ? Z.esc(Z.t("book.people.max", { n: max })) + ' <a href="eventi.html">' + Z.esc(Z.t("book.people.events")) + "</a>" : Z.esc(Z.t("book.people.hint"))) + "</span></div>" +
        '<div class="field"><span class="label" id="lbl-meal">' + Z.esc(Z.t("book.meal")) + '</span><div class="choices" role="radiogroup" aria-labelledby="lbl-meal">' +
        '<label class="pill"><input type="radio" name="meal" value="lunch"' + (state.meal === "lunch" ? " checked" : "") + '><span>' + Z.esc(Z.t("book.lunch")) + " · " + B.lunch.first + "–" + O.hours[2][0][1] + '</span></label>' +
        '<label class="pill"><input type="radio" name="meal" value="dinner"' + (state.meal === "dinner" ? " checked" : "") + '><span>' + Z.esc(Z.t("book.dinner")) + " · " + B.dinner.first + "–" + O.hours[2][1][1] + "</span></label></div></div></fieldset>" + nav();
    },
    time: function () {
      var slots = slotsFor();
      return '<fieldset><legend>' + Z.esc(Z.t("book.time.legend")) + '</legend><p class="muted">' + Z.esc(Z.fmtDate(state.date)) + " · " + Z.esc(Z.t("book.people.n", { n: state.people })) + " · " + Z.esc(Z.t("book." + state.meal)) + "</p>" +
        '<div class="field' + (errors.time ? " field--error" : "") + '">' + Z.slotGrid("time", slots, state.time) + fieldErr("time") +
        (O.booking.lastEntryConfirmed ? "" : '<p class="small">' + window.I18N.h("book.lastentry") + "</p>") + "</div>" +
        '<div class="field"><span class="label" id="lbl-table">' + Z.esc(Z.t("book.table")) + '</span><div class="choices" role="radiogroup" aria-labelledby="lbl-table">' +
        ["room", "square", "any"].map(function (t) { return '<label class="pill"><input type="radio" name="table" value="' + t + '"' + (state.table === t ? " checked" : "") + "><span>" + Z.esc(Z.t("book.table." + t)) + "</span></label>"; }).join("") +
        '</div><span class="hint">' + Z.esc(Z.t("book.table.hint")) + "</span></div></fieldset>" + nav();
    },
    details: function () {
      return '<fieldset><legend>' + Z.esc(Z.t("book.details.legend")) + '</legend><div class="form-grid form-grid--2">' +
        field("name", "text", "f.name", state.name, { auto: "name" }) + field("phone", "tel", "f.phone", state.phone, { auto: "tel" }) + "</div>" +
        field("email", "email", "f.email", state.email, { auto: "email", opt: true }) +
        field("allergies", "textarea", "book.allergies", state.allergies, { opt: true, ph: "book.allergies.ph" }) +
        field("notes", "textarea", "book.notes", state.notes, { opt: true }) + "</fieldset>" + nav();
    },
    remind: function () {
      function ck(k, label, sub) { return '<label class="choice"><input type="checkbox" name="ch" value="' + k + '"' + (state.ch[k] ? " checked" : "") + "><span>" + Z.esc(Z.t(label)) + "<small>" + Z.esc(Z.t(sub)) + "</small></span></label>"; }
      return '<fieldset><legend>' + Z.esc(Z.t("book.remind.legend")) + '</legend><p>' + Z.esc(Z.t("book.remind.lead", { hours: B.reminderHoursBefore })) + '</p>' +
        '<div class="field' + (errors.ch ? " field--error" : "") + '" role="group" aria-labelledby="lbl-ch"><span class="label" id="lbl-ch">' + Z.esc(Z.t("book.remind.channels")) + "</span>" +
        ck("sms", "ch.sms", "book.ch.sms.sub") + ck("email", "ch.email", "book.ch.email.sub") + ck("wa", "ch.wa", "book.ch.wa.sub") + fieldErr("ch") + "</div></fieldset>" +
        '<fieldset><legend>' + Z.esc(Z.t("book.consent.legend")) + '</legend>' +
        '<div class="field' + (errors.consentPrivacy ? " field--error" : "") + '"><label class="choice"><input type="checkbox" name="consentPrivacy"' + (state.consentPrivacy ? " checked" : "") + (errors.consentPrivacy ? ' aria-invalid="true"' : "") + "><span>" + window.I18N.h("book.consent.privacy") + "</span></label>" + fieldErr("consentPrivacy") + "</div>" +
        '<label class="choice"><input type="checkbox" name="consentReview"' + (state.consentReview ? " checked" : "") + "><span>" + Z.esc(Z.t("book.consent.review")) + "<small>" + Z.esc(Z.t("book.consent.review.sub")) + "</small></span></label></fieldset>" + nav();
    },
    deposit: function () {
      var reasons = depositReasons(state).map(function (r) {
        return "<li>" + Z.esc(Z.t("dep.reason." + r, { n: O.deposit.groupSize })) + "</li>";
      }).join("");
      var amount = O.deposit.perPerson != null ? Z.esc(Z.euro(O.deposit.perPerson)) + " " + Z.esc(Z.t("dep.perperson")) + " (" + Z.esc(Z.euro(O.deposit.perPerson * state.people)) + " " + Z.esc(Z.t("dep.total")) + ")" : '<span class="ph">[' + Z.esc(Z.t("dep.amount.ph")) + "]</span>";
      var policy = O.deposit.cancellationPolicy ? Z.esc(O.deposit.cancellationPolicy) : '<span class="ph">[' + Z.esc(Z.t("dep.policy.ph")) + "]</span>";
      return '<fieldset><legend>' + Z.esc(Z.t("dep.legend")) + '</legend><p class="notice">' + Z.esc(Z.t("dep.why")) + '</p><ul>' + reasons + "</ul>" +
        '<div class="field' + (errors.guarantee ? " field--error" : "") + '" role="radiogroup" aria-labelledby="lbl-g"><span class="label" id="lbl-g">' + Z.esc(Z.t("dep.choose")) + "</span><div class=\"grid\">" +
        '<label class="pill pill--block"><input type="radio" name="guarantee" value="deposit"' + (state.guarantee === "deposit" ? " checked" : "") + "><span>" + Z.esc(Z.t("dep.deposit")) + "<small>" + Z.esc(Z.t("dep.deposit.sub")) + "</small></span></label>" +
        '<label class="pill pill--block"><input type="radio" name="guarantee" value="card"' + (state.guarantee === "card" ? " checked" : "") + "><span>" + Z.esc(Z.t("dep.card")) + "<small>" + Z.esc(Z.t("dep.card.sub")) + "</small></span></label></div>" + fieldErr("guarantee") + "</div>" +
        '<p><strong>' + Z.esc(Z.t("dep.amount")) + ":</strong> " + amount + "</p><p><strong>" + Z.esc(Z.t("dep.policy")) + ":</strong> " + policy + "</p>" +
        cardDemo() + "</fieldset>" + nav();
    },
    summary: function () {
      return '<fieldset><legend>' + Z.esc(Z.t("book.summary.legend")) + "</legend>" + summaryHtml() +
        (state.guarantee ? '<p class="notice">' + Z.esc(Z.t("dep.summary." + state.guarantee)) + "</p>" : "") +
        '<p class="small">' + Z.esc(Z.t("book.summary.fine")) + "</p></fieldset>" + nav("book.confirm.btn");
    }
  };

  function cardDemo() {
    return '<div class="card-demo"><span class="card-demo__badge">' + Z.esc(Z.t("pay.demo")) + '</span>' +
      '<div class="field"><label for="cd-n">' + Z.esc(Z.t("pay.number")) + '</label><input id="cd-n" type="text" disabled placeholder="•••• •••• •••• ••••"></div>' +
      '<div class="form-grid form-grid--2"><div class="field"><label for="cd-e">' + Z.esc(Z.t("pay.expiry")) + '</label><input id="cd-e" type="text" disabled placeholder="MM/AA"></div>' +
      '<div class="field"><label for="cd-c">CVC</label><input id="cd-c" type="text" disabled placeholder="•••"></div></div>' +
      '<p class="small muted" style="margin:0">' + Z.esc(Z.t("pay.demo.note")) + "</p></div>";
  }

  function chList() {
    return ["sms", "email", "wa"].filter(function (k) { return state.ch[k]; }).map(function (k) { return Z.t("ch." + k); }).join(", ");
  }
  function summaryHtml() {
    var rows = [
      ["sum.date", Z.fmtDate(state.date)], ["sum.time", state.time + " (" + Z.t("book." + state.meal) + ")"], ["sum.people", String(state.people)],
      ["sum.table", Z.t("book.table." + state.table)], ["sum.name", state.name], ["sum.phone", state.phone]
    ];
    if (state.email) rows.push(["sum.email", state.email]);
    if (state.allergies) rows.push(["sum.allergies", state.allergies]);
    if (state.notes) rows.push(["sum.notes", state.notes]);
    rows.push(["sum.remind", chList()]);
    if (state.code) rows.unshift(["sum.code", state.code]);
    return '<dl class="summary">' + rows.map(function (r) { return "<div><dt>" + Z.esc(Z.t(r[0])) + "</dt><dd>" + Z.esc(r[1]) + "</dd></div>"; }).join("") + "</dl>";
  }

  /* ---------- anteprima messaggi ---------- */
  function messages() {
    var firstName = state.name.split(" ")[0] || state.name;
    var v = { name: firstName, code: state.code, people: state.people, time: state.time, date: Z.fmtDate(state.date, { weekday: "long", day: "numeric", month: "long" }), link: "[LINK RECENSIONE GOOGLE]" };
    var remindAt = Z.romeToUtc(state.date, state.time); remindAt = new Date(remindAt.getTime() - B.reminderHoursBefore * 3600000);
    var rr = Z.rome(remindAt);
    var reviewDay = Z.addDays(state.date, 1);
    var when = {
      confirm: Z.t("msg.when.confirm"),
      remind: Z.t("msg.when.remind", { hours: B.reminderHoursBefore, at: Z.fmtDate(rr.ymd, { weekday: "short", day: "numeric", month: "short" }) + " " + Z.pad(rr.hh) + ":" + Z.pad(rr.mm) }),
      review: Z.t("msg.when.review", { at: Z.fmtDate(reviewDay, { weekday: "short", day: "numeric", month: "short" }) })
    };
    return { v: v, when: when };
  }
  function previewHtml() {
    var m = messages(), kinds = ["confirm", "remind", "review"], chs = ["sms", "wa", "email"].filter(function (k) { return state.ch[k]; });
    var tabs = '<div class="tabs" role="tablist">' + chs.map(function (c, i) { return '<button type="button" role="tab" id="tab-' + c + '" data-tab="' + c + '" aria-selected="' + (i === 0 ? "true" : "false") + '" aria-controls="panel-' + c + '">' + Z.esc(Z.t("ch." + c)) + "</button>"; }).join("") + "</div>";
    var panels = chs.map(function (c, i) {
      return '<div class="msgs" role="tabpanel" id="panel-' + c + '" aria-labelledby="tab-' + c + '"' + (i ? " hidden" : "") + ">" + kinds.map(function (k) {
        var off = k === "review" && !state.consentReview;
        var label = '<div class="msg-label"><span>' + Z.esc(Z.t("msg.kind." + k)) + "</span><span>" + Z.esc(off ? Z.t("msg.off") : m.when[k]) + "</span></div>";
        if (c === "email") {
          var body = window.I18N.ph(Z.esc(Z.t("msg.mail." + k + ".body", m.v)));
          var alt = k === "review" ? '<span class="mail__alt"><a href="' + Z.esc(O.privateContactHref()) + '">' + Z.esc(Z.t("msg.private")) + "</a></span>" : "";
          return "<div>" + label + '<div class="mail' + (off ? " is-off" : "") + '"><div class="mail__head"><strong>' + Z.esc(Z.t("msg.from")) + "</strong> · " + Z.esc(Z.t("msg.mail." + k + ".subj", m.v)) + '</div><div class="mail__body">' + body + alt + "</div></div></div>";
        }
        var txt = window.I18N.ph(Z.esc(Z.t("msg." + c + "." + k, m.v)));
        return "<div>" + label + '<div class="bubble bubble--' + c + (off ? " is-off" : "") + '">' + txt + "</div></div>";
      }).join("") + "</div>";
    }).join("");
    return '<section aria-labelledby="pv-h"><h2 id="pv-h" style="font-size:1.35rem">' + Z.esc(Z.t("book.preview.title")) + '</h2><p class="muted">' + Z.esc(Z.t("book.preview.lead")) + "</p>" + tabs + panels + "</section>";
  }

  function doneView() {
    return '<div class="confirm"><p class="eyebrow">' + Z.esc(Z.t("book.done.eyebrow")) + "</p><h2>" + Z.esc(Z.t("book.done.title", { name: state.name.split(" ")[0] })) + "</h2>" +
      '<p>' + Z.esc(Z.t("book.done.code")) + '</p><div class="confirm__code" aria-label="' + Z.esc(Z.t("sum.code")) + '">' + Z.esc(state.code) + "</div>" + summaryHtml() +
      (state.guarantee ? '<p class="notice" style="text-align:left;max-width:520px;margin:0 auto 1rem">' + Z.esc(Z.t("dep.summary." + state.guarantee)) + "</p>" : "") +
      '<div class="btn-row" style="justify-content:center"><button type="button" class="btn btn--primary" data-act="ics">' + Z.esc(Z.t("book.ics")) + '</button><a class="btn" href="index.html">' + Z.esc(Z.t("book.done.home")) + '</a><button type="button" class="btn" data-act="again">' + Z.esc(Z.t("book.again")) + "</button></div>" +
      '<p class="notice" style="margin-top:1.4rem">' + Z.esc(Z.t("book.done.demo")) + "</p></div><hr style=\"border:0;border-top:1px solid var(--line);margin:24px 0\">" + previewHtml();
  }

  /* ---------- .ics ---------- */
  function icsStamp(d) { return d.getUTCFullYear() + Z.pad(d.getUTCMonth() + 1) + Z.pad(d.getUTCDate()) + "T" + Z.pad(d.getUTCHours()) + Z.pad(d.getUTCMinutes()) + "00Z"; }
  function icsEsc(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
  function downloadIcs() {
    var start = Z.romeToUtc(state.date, state.time), end = new Date(start.getTime() + 2 * 3600000);
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Osteria da Zi Umberto//Prenotazione//IT", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT",
      "UID:" + state.code + "@osteria-da-zi-umberto.invalid", "DTSTAMP:" + icsStamp(new Date()), "DTSTART:" + icsStamp(start), "DTEND:" + icsStamp(end),
      "SUMMARY:" + icsEsc(Z.t("ics.summary")), "LOCATION:" + icsEsc("Piazza di San Giovanni della Malva 14, 00153 Roma"),
      "DESCRIPTION:" + icsEsc(Z.t("ics.desc", { code: state.code, people: state.people })), "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsEsc(Z.t("ics.summary")), "TRIGGER:-PT" + B.reminderHoursBefore + "H", "END:VALARM", "END:VEVENT", "END:VCALENDAR"];
    var blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "prenotazione-" + state.code + ".ics";
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- lettura dei campi e validazione ---------- */
  function val(n) { var e = host.querySelector('[name="' + n + '"]'); return e ? e.value : null; }
  function checked(n) { var e = host.querySelector('[name="' + n + '"]:checked'); return e ? e.value : null; }
  function collect() {
    var cur = steps()[stepIdx];
    if (cur === "when") { var m = checked("meal"); if (m) state.meal = m; }
    if (cur === "time") { var t = checked("time"); if (t) state.time = t; var tb = checked("table"); if (tb) state.table = tb; }
    if (cur === "details") { ["name", "phone", "email", "allergies", "notes"].forEach(function (k) { var v = val(k); if (v != null) state[k] = v.trim(); }); }
    if (cur === "remind") {
      state.ch = { sms: false, email: false, wa: false };
      Array.prototype.forEach.call(host.querySelectorAll('[name="ch"]:checked'), function (e) { state.ch[e.value] = true; });
      var p = host.querySelector('[name="consentPrivacy"]'), r = host.querySelector('[name="consentReview"]');
      if (p) state.consentPrivacy = p.checked; if (r) state.consentReview = r.checked;
    }
    if (cur === "deposit") { var g = checked("guarantee"); if (g) state.guarantee = g; }
  }
  function validate() {
    var cur = steps()[stepIdx]; errors = {};
    if (cur === "when") {
      if (!state.date) errors.date = "err.date";
      else if (!slotsFor().some(function (s) { return !s.off; })) errors.date = "err.noslots";
    }
    if (cur === "time" && !state.time) errors.time = "err.time";
    if (cur === "details") {
      if (!state.name) errors.name = "err.name";
      if (state.phone.replace(/\D/g, "").length < 6) errors.phone = "err.phone";
      if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) errors.email = "err.email";
    }
    if (cur === "remind") {
      if (!state.ch.sms && !state.ch.email && !state.ch.wa) errors.ch = "err.channel";
      else if (state.ch.email && !state.email) errors.ch = "err.channel.email";
      if (!state.consentPrivacy) errors.consentPrivacy = "err.consent";
    }
    if (cur === "deposit" && !state.guarantee) errors.guarantee = "err.guarantee";
    return !Object.keys(errors).length;
  }

  /* ---------- disegno ---------- */
  var done = false;
  function render(focus) {
    if (done) { host.innerHTML = doneView(); wireDone(); return; }
    var cur = steps()[stepIdx];
    host.innerHTML = progress() + '<form novalidate onsubmit="return false">' + views[cur]() + "</form>";
    if (cur === "when") {
      state._cal = Z.calendar(Z.$("#cal-host"), {
        min: Z.rome().ymd, max: Z.addDays(Z.rome().ymd, B.maxDaysAhead), disabledWeekdays: B.closedWeekdays, value: state.date,
        onSelect: function (d) { state.date = d; state.time = null; errors.date = null; Z.$("#date-picked").textContent = Z.fmtDate(d); var er = Z.$("#err-date"); if (er) er.remove(); }
      });
    }
    if (focus) { var f = host.querySelector(".field--error input, .field--error textarea, .field--error button") || host.querySelector("legend"); if (f) { if (!f.hasAttribute("tabindex") && f.tagName === "LEGEND") f.setAttribute("tabindex", "-1"); f.focus(); } }
  }
  function wireDone() {
    Z.$$("[data-tab]", host).forEach(function (b) {
      b.addEventListener("click", function () {
        Z.$$("[data-tab]", host).forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
        Z.$$("[role=tabpanel]", host).forEach(function (p) { p.hidden = p.id !== "panel-" + b.getAttribute("data-tab"); });
      });
    });
  }

  function init() {
    host = Z.$("#book-app"); if (!host) return;
    state = fresh(); stepIdx = 0; errors = {}; done = false;
    host.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (!b) return;
      var a = b.getAttribute("data-act");
      if (a === "plus" || a === "minus") {
        state.people = Math.max(1, Math.min(B.maxPeople, state.people + (a === "plus" ? 1 : -1)));
        collect(); render(); var nb = host.querySelector('[data-act="' + a + '"]'); if (nb) nb.focus(); return;
      }
      if (a === "ics") return downloadIcs();
      if (a === "again") { state = fresh(); stepIdx = 0; errors = {}; done = false; render(); window.scrollTo(0, 0); return; }
      collect();
      if (a === "back") { errors = {}; stepIdx = Math.max(0, stepIdx - 1); render(); window.scrollTo(0, 0); return; }
      if (a === "next") {
        if (!validate()) { render(true); return; }
        if (steps()[stepIdx] === "summary") { state.code = Z.code("ZU"); done = true; render(); window.scrollTo(0, 0); return; }
        stepIdx++; if (steps()[stepIdx - 1] === "when" && !steps()[stepIdx]) stepIdx = steps().length - 1;
        errors = {}; render(); window.scrollTo(0, 0);
      }
    });
    host.addEventListener("change", function (e) {
      /* il cambio di data o pasto può far comparire/sparire il passo caparra: nulla da fare finché non si va avanti */
      if (e.target.name === "meal") state.meal = e.target.value;
    });
    document.addEventListener("langchange", function () { if (!done) collect(); render(); });
    render();
  }
  Z.onReady(init);
})();
