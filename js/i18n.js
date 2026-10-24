/* ==========================================================================
   i18n.js – TUTTI I TESTI DEL SITO, in italiano (it) e inglese (en)
   --------------------------------------------------------------------------
   Come funziona
   - Nell'HTML ogni testo ha data-i18n="chiave"; qui sotto trovi la chiave.
   - Per cambiare una frase: cerca la chiave (Ctrl+F) e modifica il testo.
   - Dentro i testi {nome} è un valore inserito dal sito (es. {time}).
   - Qualunque testo tra [parentesi quadre] è un SEGNAPOSTO: il sito lo
     mostra in corsivo e colore attenuato. Quando il dato è noto, si toglie
     la parentesi (o si compila js/config.js).
   - Per aggiungere una lingua: aggiungi il suo codice in I18N.langs,
     poi un blocco I18N.add("fr", { … }) con le stesse chiavi.
     Le chiavi mancanti ricadono sull'italiano.
   I nomi dei piatti non si traducono mai (vedi menu-data.js).
   ========================================================================== */
(function () {
  "use strict";
  var I18N = (window.I18N = { dict: {}, lang: "it", fallback: "it", langs: ["it", "en"] });

  I18N.add = function (lang, obj) {
    I18N.dict[lang] = Object.assign(I18N.dict[lang] || {}, obj);
  };

  /* i segnaposto [ … ] diventano riconoscibili ma discreti */
  I18N.ph = function (html) {
    return html.replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>');
  };

  I18N.t = function (key, vars) {
    var d = I18N.dict[I18N.lang] || {}, s = d[key];
    if (s == null) s = (I18N.dict[I18N.fallback] || {})[key];
    if (s == null) return key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  };

  /* testo già pronto per innerHTML (con segnaposto evidenziati) */
  I18N.h = function (key, vars) { return I18N.ph(I18N.t(key, vars)); };

  I18N.applyAttrs = function (root) {
    Array.prototype.forEach.call((root || document).querySelectorAll("[data-i18n-attr]"), function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var i = pair.indexOf(":"); if (i < 0) return;
        el.setAttribute(pair.slice(0, i).trim(), I18N.t(pair.slice(i + 1).trim()));
      });
    });
  };

  I18N.apply = function (root) {
    Array.prototype.forEach.call((root || document).querySelectorAll("[data-i18n]"), function (el) {
      el.innerHTML = I18N.h(el.getAttribute("data-i18n"));
    });
    I18N.applyAttrs(root);
  };

  function setMeta(sel, attr, val) { var el = document.querySelector(sel); if (el) el.setAttribute(attr, val); }
  I18N.applyMeta = function () {
    var page = document.body.getAttribute("data-page");
    if (!page) return;
    var title = I18N.t("meta." + page + ".title"), desc = I18N.t("meta." + page + ".desc");
    if (title.indexOf("meta.") === 0) return;
    document.title = title;
    setMeta('meta[name="description"]', "content", desc);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", desc);
    setMeta('meta[property="og:locale"]', "content", I18N.lang === "it" ? "it_IT" : "en_GB");
  };

  I18N.setLang = function (lang, silent) {
    if (I18N.langs.indexOf(lang) < 0) lang = I18N.fallback;
    I18N.lang = lang;
    document.documentElement.setAttribute("lang", lang);
    if (window.Z && !silent) window.Z.store.set("zu_lang", lang);
    I18N.apply(document);
    I18N.applyMeta();
    if (!silent) document.dispatchEvent(new Event("langchange"));
  };

  I18N.init = function () {
    var saved = window.Z && window.Z.store.get("zu_lang");
    var guess = (navigator.language || "it").slice(0, 2).toLowerCase();
    var lang = saved || (I18N.langs.indexOf(guess) >= 0 ? guess : "en");
    I18N.setLang(lang, true);
  };

  /* ======================================================================
     TESTI COMUNI A TUTTE LE PAGINE
     ====================================================================== */
  I18N.add("it", {
    "a11y.skip": "Vai al contenuto",
    "a11y.home": "Osteria da Zi' Umberto – torna alla home",
    "a11y.mainnav": "Navigazione principale",
    "a11y.lang": "Lingua",
    "a11y.menuopen": "Apri il menu di navigazione",
    "a11y.menuclose": "Chiudi il menu di navigazione",
    "a11y.actions": "Azioni rapide",
    "nav.menu": "Menù", "nav.book": "Prenota", "nav.takeaway": "Asporto", "nav.vouchers": "Buoni regalo", "nav.events": "Eventi", "nav.where": "Dove siamo",
    "btn.book": "Prenota",
    "btn.next": "Continua", "btn.back": "Indietro", "btn.confirm": "Conferma", "btn.print": "Scarica / stampa",
    "act.call": "Chiama", "act.wa": "WhatsApp", "act.dir": "Indicazioni",
    "toast.nowa": "Il numero WhatsApp non è ancora attivo.",

    "footer.tag": "Cucina romana a Trastevere, a pranzo e a cena.",
    "footer.where": "Dove",
    "footer.hours": "Orari",
    "footer.info": "Informazioni",
    "footer.privacy": "Privacy",
    "footer.cookie": "Cookie",
    "footer.admin": "Area ristoratore",
    "footer.demo": "Anteprima dimostrativa: prenotazioni, ordini, buoni ed eventi non inviano alcun dato e nessun pagamento è reale.",

    "ph.verifyLink": "DA VERIFICARE: link preso da un vecchio articolo",
    "ph.instagram": "[DA INSERIRE: Instagram]",
    "ph.civico": "DA CONFERMARE: 14 o 14/B",
    "ph.email": "[DA INSERIRE: email]",
    "ph.company": "[DA INSERIRE: ragione sociale]",
    "ph.vat": "[DA INSERIRE: P.IVA]",
    "ph.closeTime": "DA CONFERMARE: chiusura alle 23:00 o alle 23:30",
    "ph.wa": "DA INSERIRE: numero WhatsApp",

    "status.open": "Aperto ora · fino alle {time}",
    "status.opens": "Apre alle {time}",
    "status.closedToday": "Oggi chiuso",
    "status.closedNow": "Chiuso ora",
    "status.reopens": "riapre {when} alle {time}",
    "status.tomorrow": "domani",
    "hours.closed": "Chiuso",
    "day.0": "Domenica", "day.1": "Lunedì", "day.2": "Martedì", "day.3": "Mercoledì", "day.4": "Giovedì", "day.5": "Venerdì", "day.6": "Sabato",
    "dayS.0": "Dom", "dayS.1": "Lun", "dayS.2": "Mar", "dayS.3": "Mer", "dayS.4": "Gio", "dayS.5": "Ven", "dayS.6": "Sab",

    "cal.label": "Scegli una data", "cal.prev": "Mese precedente", "cal.next": "Mese successivo",
    "cal.closed": "giorno di chiusura", "cal.legend": "Il lunedì l'osteria è chiusa.",
    "slots.none": "Nessun orario disponibile per questa scelta.", "slots.soldout": "esaurito",
    "map.title": "Mappa di Osteria da Zi Umberto",

    "photo.label": "Spazio per una foto: {what}",
    "photo.hero": "Foto da inserire: la piazza di sera, ombrelloni crema con le lucine accese, tavoli apparecchiati sui sampietrini, gente a cena.",
    "photo.sign": "Foto da inserire: l'insegna, la mantovana con la scritta verde, di giorno, frontale.",
    "photo.room": "Foto da inserire: la sala con pareti gialle piene di quadri e fotografie, travi di legno a vista, lanterne, scaffali di bottiglie. Grandangolo, luce calda, senza persone.",
    "photo.antipasti": "Foto da inserire: il banco degli antipasti, da vicino.",
    "photo.cacio": "Foto da inserire: tonnarelli cacio e pepe dall'alto, con la crema di pecorino in vista.",
    "photo.carbonara": "Foto da inserire: carbonara di tre quarti, con la forchetta che solleva gli spaghetti.",
    "photo.amatriciana": "Foto da inserire: amatriciana e gricia affiancate.",
    "photo.fiori": "Foto da inserire: fiori di zucca fritti appena usciti.",
    "photo.coda": "Foto da inserire: coda alla vaccinara o saltimbocca, luce naturale.",
    "photo.tiramisu": "Foto da inserire: il tiramisù nella sua cocottina.",
    "photo.wine": "Foto da inserire: la caraffa del vino della casa su un tavolo in piazza.",
    "photo.group": "Foto da inserire: una tavolata per un gruppo.",
    "photo.staff": "Foto da inserire: titolari e staff al lavoro (con il loro consenso)."
  });

  I18N.add("en", {
    "a11y.skip": "Skip to content",
    "a11y.home": "Osteria da Zi' Umberto – back to the home page",
    "a11y.mainnav": "Main navigation",
    "a11y.lang": "Language",
    "a11y.menuopen": "Open the navigation menu",
    "a11y.menuclose": "Close the navigation menu",
    "a11y.actions": "Quick actions",
    "nav.menu": "Menu", "nav.book": "Book", "nav.takeaway": "Takeaway", "nav.vouchers": "Gift vouchers", "nav.events": "Events", "nav.where": "Find us",
    "btn.book": "Book",
    "btn.next": "Continue", "btn.back": "Back", "btn.confirm": "Confirm", "btn.print": "Download / print",
    "act.call": "Call", "act.wa": "WhatsApp", "act.dir": "Directions",
    "toast.nowa": "The WhatsApp number isn't active yet.",

    "footer.tag": "Roman cooking in Trastevere, for lunch and dinner.",
    "footer.where": "Find us",
    "footer.hours": "Opening hours",
    "footer.info": "Information",
    "footer.privacy": "Privacy",
    "footer.cookie": "Cookies",
    "footer.admin": "Restaurant area",
    "footer.demo": "Preview only: bookings, orders, vouchers and events send no data and no payment is real.",

    "ph.verifyLink": "DA VERIFICARE: link preso da un vecchio articolo",
    "ph.instagram": "[DA INSERIRE: Instagram]",
    "ph.civico": "DA CONFERMARE: 14 o 14/B",
    "ph.email": "[DA INSERIRE: email]",
    "ph.company": "[DA INSERIRE: ragione sociale]",
    "ph.vat": "[DA INSERIRE: P.IVA]",
    "ph.closeTime": "DA CONFERMARE: chiusura alle 23:00 o alle 23:30",
    "ph.wa": "DA INSERIRE: numero WhatsApp",

    "status.open": "Open now · until {time}",
    "status.opens": "Opens at {time}",
    "status.closedToday": "Closed today",
    "status.closedNow": "Closed now",
    "status.reopens": "reopens {when} at {time}",
    "status.tomorrow": "tomorrow",
    "hours.closed": "Closed",
    "day.0": "Sunday", "day.1": "Monday", "day.2": "Tuesday", "day.3": "Wednesday", "day.4": "Thursday", "day.5": "Friday", "day.6": "Saturday",
    "dayS.0": "Sun", "dayS.1": "Mon", "dayS.2": "Tue", "dayS.3": "Wed", "dayS.4": "Thu", "dayS.5": "Fri", "dayS.6": "Sat",

    "cal.label": "Choose a date", "cal.prev": "Previous month", "cal.next": "Next month",
    "cal.closed": "closed day", "cal.legend": "We are closed on Mondays.",
    "slots.none": "No times available for this choice.", "slots.soldout": "full",
    "map.title": "Map of Osteria da Zi Umberto",

    "photo.label": "Photo placeholder: {what}",
    "photo.hero": "Photo to add: the square at night, cream umbrellas with the lights on, laid tables on the cobblestones, people having dinner.",
    "photo.sign": "Photo to add: the sign, the canvas valance with the green lettering, in daylight, front on.",
    "photo.room": "Photo to add: the dining room with yellow walls full of paintings and photographs, exposed wooden beams, lanterns, shelves of bottles. Wide angle, warm light, no people.",
    "photo.antipasti": "Photo to add: the antipasti counter, close up.",
    "photo.cacio": "Photo to add: tonnarelli cacio e pepe from above, with the pecorino cream showing.",
    "photo.carbonara": "Photo to add: carbonara at a three-quarter angle, a fork lifting the spaghetti.",
    "photo.amatriciana": "Photo to add: amatriciana and gricia side by side.",
    "photo.fiori": "Photo to add: fried zucchini flowers, just out of the fryer.",
    "photo.coda": "Photo to add: coda alla vaccinara or saltimbocca, natural light.",
    "photo.tiramisu": "Photo to add: the tiramisù in its little dish.",
    "photo.wine": "Photo to add: a carafe of house wine on a table in the square.",
    "photo.group": "Photo to add: a long table set for a group.",
    "photo.staff": "Photo to add: the owners and staff at work (with their consent)."
  });
})();

/* ==========================================================================
   TESTI DELLE SINGOLE PAGINE
   ========================================================================== */
/* ---------------------------------- HOME ---------------------------------- */
I18N.add("it", {
  "meta.home.title": "Osteria da Zi' Umberto – cucina romana a Trastevere | Osteria da Zi Umberto",
  "meta.home.desc": "Osteria da Zi' Umberto (Osteria da Zi Umberto): cucina romana tradizionale a pranzo e a cena in Piazza di San Giovanni della Malva, a Trastevere. Prenota un tavolo.",
  "ph.wa2": "[DA INSERIRE: numero WhatsApp]",
  "home.hero.tag": "Cucina romana in Piazza di San Giovanni della Malva, a Trastevere",
  "home.hero.book": "Prenota un tavolo",
  "home.hero.menu": "Guarda il menù",
  "home.about.eyebrow": "Trastevere",
  "home.about.title": "L'osteria",
  "home.about.p1": "Cucina romana tradizionale, a pranzo e a cena, in Piazza di San Giovanni della Malva.",
  "home.about.p2": "I tavoli all'aperto stanno in piazza, sotto i grandi ombrelloni color crema. Dentro c'è la sala, con le travi di legno a vista e le pareti gialle piene di quadri.",
  "home.about.p3": "In tavola i piatti di sempre della cucina romana e il vino della casa, a calice, a mezzo litro o al litro.",
  "home.about.story": "«Zi'», in romanesco, vuol dire zio. [DA INSERIRE: la storia di Zi' Umberto]",
  "home.chip1": "Pranzo e cena",
  "home.chip2": "Tavoli in piazza e sala interna",
  "home.chip3": "Spesa media 20–30 € a persona",
  "home.chip4": "Prenotazione consigliata",
  "home.dishes.eyebrow": "Dal menù",
  "home.dishes.title": "I piatti",
  "home.dishes.lead": "Sei piatti dalla carta, con i prezzi della carta.",
  "home.dishes.all": "Vedi tutto il menù",
  "home.dishes.inmenu": "Nel menù",
  "home.room.eyebrow": "Dentro e fuori",
  "home.room.title": "La sala e la piazza",
  "home.room.lead": "Pareti gialle piene di quadri e fotografie, travi di legno a vista. Fuori, i tavoli in piazza sotto gli ombrelloni.",
  "home.blocks.eyebrow": "Per te",
  "home.blocks.title": "Come vuoi vivere l'osteria",
  "home.b1.t": "Prenota un tavolo", "home.b1.d": "Scegli giorno, ora e se preferisci la sala o la piazza. La prenotazione è consigliata sia a pranzo sia a cena.", "home.b1.m": "Prenota →",
  "home.b2.t": "Asporto", "home.b2.d": "Scegli i piatti dal menù e ritirali in osteria, in Piazza di San Giovanni della Malva 14. Non c'è consegna a domicilio.", "home.b2.m": "Ordina →",
  "home.b3.t": "Buoni regalo", "home.b3.d": "Regala una cena in osteria: scegli l'importo, scrivi un messaggio, lo inviamo per email o lo stampi.", "home.b3.m": "Regala →",
  "home.b4.t": "Eventi e gruppi", "home.b4.d": "Compleanni, cene aziendali, comunioni, lauree: raccontaci cosa festeggi e ti ricontattiamo.", "home.b4.m": "Scrivici →",
  "home.rev.eyebrow": "Recensioni",
  "home.rev.title": "Dicono di noi",
  "home.rev.google": "su Google, su 2.913 recensioni",
  "home.rev.ta": "Tripadvisor · Travellers' Choice 2026",
  "home.rev.q1": "«Piatti semplici e gustosi, preparati con materie prime di ottima qualità.»",
  "home.rev.q1s": "Recensione su Google",
  "home.rev.q2": "«Uno dei pochissimi locali di Trastevere a non essere diventato prettamente turistico.»",
  "home.rev.q2s": "Recensione su Tripadvisor, settembre 2026",
  "home.rev.cited": "I piatti più citati nelle recensioni su Google",
  "home.rev.fiori": "Fiori di zucca",
  "home.rev.also": "Su Google risultano in evidenza anche i dolci, il caffè e la carta dei vini.",
  "home.rev.glink": "La scheda su Google",
  "home.rev.tlink": "La scheda su Tripadvisor",
  "home.rev.note": "Voti rilevati il 24/10/2026 dalle schede pubbliche. Le citazioni sono recensioni di clienti, riportate senza il nome di chi le ha scritte.",
  "home.faq.eyebrow": "Domande frequenti",
  "home.faq.title": "Buono a sapersi",
  "faq.1.q": "Serve prenotare?", "faq.1.a": "La prenotazione è consigliata sia a pranzo sia a cena. Puoi farlo <a href=\"prenota.html\">qui</a> o chiamando il 06 581 6646.",
  "faq.2.q": "Ci sono tavoli all'aperto?", "faq.2.a": "Sì, in piazza, oltre alla sala interna. Quando prenoti puoi dirci se preferisci la sala o la piazza.",
  "faq.3.q": "Posso venire con il cane?", "faq.3.a": "Sì, i cani sono ammessi.",
  "faq.4.q": "Il locale è accessibile in sedia a rotelle?", "faq.4.a": "Sì, l'ingresso e i tavoli sono accessibili in sedia a rotelle.",
  "faq.5.q": "Ci sono i seggioloni?", "faq.5.a": "Sì, ci sono i seggioloni.",
  "faq.6.q": "Come si può pagare?", "faq.6.a": "Con carte di credito e di debito, anche contactless (NFC). Si accettano Visa e Mastercard.",
  "faq.7.q": "Quando siete chiusi?", "faq.7.a": "Il lunedì. Da martedì a domenica siamo aperti a pranzo (12:30–15:00) e a cena (19:30–23:00). [DA CONFERMARE: chiusura serale alle 23:00 o alle 23:30] [DA INSERIRE: chiusure per ferie e festività]",
  "faq.8.q": "Fate consegne a domicilio?", "faq.8.a": "No, non c'è consegna a domicilio. Puoi ordinare e ritirare in osteria dalla pagina <a href=\"asporto.html\">Asporto</a>. [DA CONFERMARE: oggi l'osteria fa asporto?]",
  "faq.9.q": "Dove si parcheggia?", "faq.9.a": "In zona il parcheggio è difficile: c'è solo sosta a pagamento su strada.",
  "faq.10.q": "Quanto si spende?", "faq.10.a": "In media 20–30 € a persona (dato indicato da 173 persone su Google).",
  "home.where.eyebrow": "Dove siamo",
  "home.where.title": "In piazza, a Trastevere",
  "home.where.side": "Nella piazza c'è la chiesa di San Giovanni della Malva. La piazza è sul lato Trastevere di Ponte Sisto.",
  "home.where.plus": "Plus Code: VFR9+RH Roma",
  "home.where.parking.t": "Parcheggio",
  "home.where.parking": "In zona il parcheggio è difficile: c'è solo sosta a pagamento su strada.",
  "home.where.contacts": "Contatti",
  "home.where.dir": "Indicazioni stradali",
  "home.map.text": "La mappa si carica solo se vuoi.",
  "home.map.btn": "Carica la mappa",
  "home.map.privacy": "Caricandola, Google riceve i dati di navigazione (vedi la pagina Cookie)."
});
I18N.add("en", {
  "meta.home.title": "Osteria da Zi' Umberto – Roman cooking in Trastevere | Osteria da Zi Umberto",
  "meta.home.desc": "Osteria da Zi' Umberto (Osteria da Zi Umberto): traditional Roman cooking for lunch and dinner in Piazza di San Giovanni della Malva, Trastevere, Rome. Book a table.",
  "ph.wa2": "[DA INSERIRE: numero WhatsApp]",
  "home.hero.tag": "Roman cooking in Piazza di San Giovanni della Malva, in Trastevere",
  "home.hero.book": "Book a table",
  "home.hero.menu": "See the menu",
  "home.about.eyebrow": "Trastevere",
  "home.about.title": "The osteria",
  "home.about.p1": "Traditional Roman cooking for lunch and dinner, in Piazza di San Giovanni della Malva.",
  "home.about.p2": "Outdoor tables are set in the square, under big cream-coloured umbrellas. Inside, the dining room has exposed wooden beams and yellow walls covered in paintings.",
  "home.about.p3": "On the table: the classic dishes of Roman cooking and the house wine, by the glass, the half litre or the litre.",
  "home.about.story": "In Roman dialect, “Zi'” means “uncle”. [DA INSERIRE: la storia di Zi' Umberto]",
  "home.chip1": "Lunch and dinner",
  "home.chip2": "Tables in the square and indoors",
  "home.chip3": "Average spend €20–30 per person",
  "home.chip4": "Booking recommended",
  "home.dishes.eyebrow": "From the menu",
  "home.dishes.title": "The dishes",
  "home.dishes.lead": "Six dishes from the menu, at menu prices. Dish names stay in Italian, with a short explanation.",
  "home.dishes.all": "See the full menu",
  "home.dishes.inmenu": "On the menu",
  "home.room.eyebrow": "Inside and out",
  "home.room.title": "The dining room and the square",
  "home.room.lead": "Yellow walls covered in paintings and photographs, exposed wooden beams. Outside, tables in the square under the umbrellas.",
  "home.blocks.eyebrow": "For you",
  "home.blocks.title": "However you like to enjoy the osteria",
  "home.b1.t": "Book a table", "home.b1.d": "Pick a day, a time, and whether you'd rather sit inside or out in the square. Booking is recommended for both lunch and dinner.", "home.b1.m": "Book →",
  "home.b2.t": "Takeaway", "home.b2.d": "Choose dishes from the menu and pick them up at the osteria, Piazza di San Giovanni della Malva 14. We don't deliver.", "home.b2.m": "Order →",
  "home.b3.t": "Gift vouchers", "home.b3.d": "Give someone dinner at the osteria: choose an amount, write a message, and we email it or you print it.", "home.b3.m": "Give a gift →",
  "home.b4.t": "Events and groups", "home.b4.d": "Birthdays, company dinners, communions, graduations: tell us what you're celebrating and we'll get back to you.", "home.b4.m": "Get in touch →",
  "home.rev.eyebrow": "Reviews",
  "home.rev.title": "What people say",
  "home.rev.google": "on Google, from 2,913 reviews",
  "home.rev.ta": "Tripadvisor · Travellers' Choice 2026",
  "home.rev.q1": "“Simple, tasty dishes made with excellent ingredients.”",
  "home.rev.q1s": "Review on Google (translated)",
  "home.rev.q2": "“One of the very few places in Trastevere that hasn't turned purely touristy.”",
  "home.rev.q2s": "Review on Tripadvisor, September 2026 (translated)",
  "home.rev.cited": "Most mentioned dishes in Google reviews",
  "home.rev.fiori": "Fried zucchini flowers",
  "home.rev.also": "On Google, desserts, coffee and the wine list also stand out.",
  "home.rev.glink": "Our Google listing",
  "home.rev.tlink": "Our Tripadvisor page",
  "home.rev.note": "Ratings taken from the public listings on 24/10/2026. Quotes are customer reviews, shown without the author's name.",
  "home.faq.eyebrow": "Frequently asked questions",
  "home.faq.title": "Good to know",
  "faq.1.q": "Do I need to book?", "faq.1.a": "Booking is recommended for both lunch and dinner. You can do it <a href=\"prenota.html\">here</a> or by calling 06 581 6646.",
  "faq.2.q": "Are there outdoor tables?", "faq.2.a": "Yes, out in the square, as well as the indoor dining room. When you book you can tell us which you prefer.",
  "faq.3.q": "Can I bring my dog?", "faq.3.a": "Yes, dogs are welcome.",
  "faq.4.q": "Is it wheelchair accessible?", "faq.4.a": "Yes, the entrance and the tables are wheelchair accessible.",
  "faq.5.q": "Do you have high chairs?", "faq.5.a": "Yes, we have high chairs.",
  "faq.6.q": "How can I pay?", "faq.6.a": "By credit and debit card, contactless (NFC) too. Visa and Mastercard are accepted.",
  "faq.7.q": "When are you closed?", "faq.7.a": "On Mondays. From Tuesday to Sunday we're open for lunch (12:30–3:00 pm) and dinner (7:30–11:00 pm). [DA CONFERMARE: chiusura serale alle 23:00 o alle 23:30] [DA INSERIRE: chiusure per ferie e festività]",
  "faq.8.q": "Do you deliver?", "faq.8.a": "No, we don't deliver. You can order and pick up at the osteria from the <a href=\"asporto.html\">Takeaway</a> page. [DA CONFERMARE: oggi l'osteria fa asporto?]",
  "faq.9.q": "Where can I park?", "faq.9.a": "Parking nearby is difficult: there's only paid street parking.",
  "faq.10.q": "How much does it cost?", "faq.10.a": "On average €20–30 per person (as reported by 173 people on Google).",
  "home.where.eyebrow": "Find us",
  "home.where.title": "In the square, in Trastevere",
  "home.where.side": "The church of San Giovanni della Malva stands in the square, which is on the Trastevere side of Ponte Sisto.",
  "home.where.plus": "Plus Code: VFR9+RH Roma",
  "home.where.parking.t": "Parking",
  "home.where.parking": "Parking nearby is difficult: there's only paid street parking.",
  "home.where.contacts": "Contact",
  "home.where.dir": "Get directions",
  "home.map.text": "The map only loads if you want it to.",
  "home.map.btn": "Load the map",
  "home.map.privacy": "When it loads, Google receives browsing data (see the Cookies page)."
});

/* ---------------------------------- MENÙ ---------------------------------- */
I18N.add("it", {
  "meta.menu.title": "Menù – Osteria da Zi' Umberto, cucina romana a Trastevere",
  "meta.menu.desc": "Il menù dell'Osteria da Zi' Umberto (Osteria da Zi Umberto): antipasti, primi romani, secondi, contorni e dolci, con allergeni e filtri vegetariano, vegano, senza glutine.",
  "menu.eyebrow": "La carta",
  "menu.title": "Menù",
  "menu.banner": "[DA CONFERMARE: piatti e prezzi ricostruiti dalle foto del menù di maggio e ottobre 2026]",
  "menu.filters": "Mostra solo",
  "menu.f.veg": "Vegetariano", "menu.f.vegan": "Vegano", "menu.f.gf": "Senza glutine",
  "menu.filter.hint": "I filtri mostrano solo i piatti per cui gli ingredienti scritti sulla carta rendono la scelta certa.",
  "menu.celiac": "Celiachia: chiedi sempre al personale.",
  "menu.shown": "{n} piatti.",
  "menu.legend": "Allergeni (tocca l'icona per il nome)",
  "menu.legend.ph": "[DA CONFERMARE CON LA CUCINA: allergeni ricavati dagli ingredienti della carta, non sono la dichiarazione ufficiale]",
  "menu.catnav": "Categorie del menù",
  "menu.allergen": "Allergene",
  "menu.house": "Piatto della casa",
  "menu.tag.veg": "Vegetariano", "menu.tag.vegan": "Vegano", "menu.tag.gf": "Senza glutine",
  "menu.perperson": "a persona",
  "menu.each5": "5 € ciascuno",
  "menu.wines": "Vini",
  "menu.wine.ph": "[DA INSERIRE: carta dei vini]",
  "menu.wine.row": "DA INSERIRE: vino, produttore, prezzo",
  "menu.off": "Fuori menù di stagione",
  "menu.off.lead": "Piatti di stagione, senza prezzo.",
  "menu.off.ph": "[DA CONFERMARE: piatti citati nelle recensioni ma assenti dalle foto della carta — carciofi, puntarelle, zuppa di funghi e castagne, spaghetti alle vongole, polipetti alla luciana]",
  "menu.frozen": "* Per mancanza del prodotto sul mercato, può essere surgelato.",
  "menu.legal": "Informazioni sugli allergeni (Reg. UE 1169/2011): le indicazioni su questa pagina sono orientative. Chi ha allergie o intolleranze deve avvisare il personale prima di ordinare; non si possono escludere tracce o contaminazioni crociate.",
  "menu.cta.book": "Prenota un tavolo",
  "menu.cta.take": "Ordina d'asporto"
});
I18N.add("en", {
  "meta.menu.title": "Menu – Osteria da Zi' Umberto, Roman cooking in Trastevere",
  "meta.menu.desc": "The menu at Osteria da Zi' Umberto (Osteria da Zi Umberto): starters, Roman pasta, main courses, sides and desserts, with allergens and vegetarian, vegan and gluten-free filters.",
  "menu.eyebrow": "The menu",
  "menu.title": "Menu",
  "menu.banner": "[DA CONFERMARE: piatti e prezzi ricostruiti dalle foto del menù di maggio e ottobre 2026]",
  "menu.filters": "Show only",
  "menu.f.veg": "Vegetarian", "menu.f.vegan": "Vegan", "menu.f.gf": "Gluten-free",
  "menu.filter.hint": "Filters only show dishes where the ingredients written on the menu make the choice certain.",
  "menu.celiac": "Coeliac disease: always ask the staff.",
  "menu.shown": "{n} dishes.",
  "menu.legend": "Allergens (tap an icon to see its name)",
  "menu.legend.ph": "[DA CONFERMARE CON LA CUCINA: allergeni ricavati dagli ingredienti della carta, non sono la dichiarazione ufficiale]",
  "menu.catnav": "Menu categories",
  "menu.allergen": "Allergen",
  "menu.house": "House dish",
  "menu.tag.veg": "Vegetarian", "menu.tag.vegan": "Vegan", "menu.tag.gf": "Gluten-free",
  "menu.perperson": "per person",
  "menu.each5": "€5 each",
  "menu.wines": "Wines",
  "menu.wine.ph": "[DA INSERIRE: carta dei vini]",
  "menu.wine.row": "DA INSERIRE: vino, produttore, prezzo",
  "menu.off": "Seasonal specials",
  "menu.off.lead": "Seasonal dishes, no prices listed.",
  "menu.off.ph": "[DA CONFERMARE: piatti citati nelle recensioni ma assenti dalle foto della carta — carciofi, puntarelle, zuppa di funghi e castagne, spaghetti alle vongole, polipetti alla luciana]",
  "menu.frozen": "* If the product is not available on the market, it may be frozen.",
  "menu.legal": "Allergen information (EU Reg. 1169/2011): the details on this page are indicative. If you have allergies or intolerances, please tell the staff before ordering; traces and cross-contamination cannot be ruled out.",
  "menu.cta.book": "Book a table",
  "menu.cta.take": "Order takeaway"
});

/* ------------------------------ PRENOTAZIONE ------------------------------ */
I18N.add("it", {
  "meta.book.title": "Prenota un tavolo – Osteria da Zi' Umberto, Trastevere",
  "meta.book.desc": "Prenota un tavolo all'Osteria da Zi' Umberto (Osteria da Zi Umberto), a Trastevere: scegli data, ora, sala o piazza. Prenotazione consigliata a pranzo e a cena.",
  "common.optional": "(facoltativo)",
  "f.name": "Nome e cognome", "f.phone": "Telefono", "f.email": "Email",
  "book.eyebrow": "Prenotazioni",
  "book.title": "Prenota un tavolo",
  "book.lead": "La prenotazione è consigliata sia a pranzo sia a cena. Scegli quando, e se preferisci la sala o la piazza.",
  "book.direct": "Prenotando qui prenoti direttamente con l'osteria.",
  "book.demo": "Anteprima dimostrativa: la prenotazione non viene inviata e nessun dato esce da questa pagina. Per prenotare davvero, chiama il 06 581 6646.",
  "book.step": "Passo {n} di {total}",
  "book.when.legend": "Quando venite?",
  "book.date": "Data", "book.people": "Persone",
  "book.people.less": "Una persona in meno", "book.people.more": "Una persona in più",
  "book.people.hint": "Bambini compresi.",
  "book.people.max": "Per più di {n} persone usa il modulo", "book.people.events": "Eventi e gruppi",
  "book.people.n": "{n} persone",
  "book.meal": "Pranzo o cena",
  "book.lunch": "Pranzo", "book.dinner": "Cena",
  "book.time.legend": "A che ora?",
  "book.lastentry": "[DA CONFERMARE: ultimo ingresso a pranzo e a cena]",
  "book.table": "Dove preferisci sederti?",
  "book.table.room": "In sala", "book.table.square": "In piazza", "book.table.any": "Indifferente",
  "book.table.hint": "La preferenza è una richiesta: dipende dalla disponibilità.",
  "book.details.legend": "I tuoi dati",
  "book.allergies": "Allergie e intolleranze", "book.allergies.ph": "Es. glutine, lattosio…",
  "book.notes": "Note",
  "book.remind.legend": "Promemoria",
  "book.remind.lead": "Ti scriviamo per confermare e, {hours} ore prima, per ricordarti la prenotazione. Scegli dove ricevere i messaggi.",
  "book.remind.channels": "Canali (anche più di uno)",
  "ch.sms": "SMS", "ch.email": "Email", "ch.wa": "WhatsApp",
  "book.ch.sms.sub": "Al numero di telefono indicato",
  "book.ch.email.sub": "All'indirizzo email indicato",
  "book.ch.wa.sub": "Al numero di telefono indicato",
  "book.consent.legend": "Consensi",
  "book.consent.privacy": "Ho letto l'<a href=\"privacy.html\" target=\"_blank\" rel=\"noopener\">informativa privacy</a> e acconsento al trattamento dei dati per gestire la prenotazione. (obbligatorio)",
  "book.consent.review": "Voglio ricevere, il giorno dopo, un messaggio con la richiesta di recensione.",
  "book.consent.review.sub": "Facoltativo. Non cambia nulla per la tua prenotazione.",
  "dep.legend": "Una garanzia per la prenotazione",
  "dep.why": "Per questa prenotazione chiediamo una garanzia, perché:",
  "dep.reason.group": "è un gruppo da {n} persone o più.",
  "dep.reason.date": "è una data speciale (14 febbraio o 31 dicembre).",
  "dep.reason.saturday": "è un sabato a cena.",
  "dep.choose": "Scegli come garantire il tavolo",
  "dep.deposit": "Caparra", "dep.deposit.sub": "Una somma a persona, che viene scalata dal conto.",
  "dep.card": "Carta a garanzia", "dep.card.sub": "Nessun addebito: la carta serve solo a garantire il tavolo.",
  "dep.amount": "Importo della caparra", "dep.policy": "Cancellazione",
  "dep.perperson": "a persona", "dep.total": "in totale",
  "dep.amount.ph": "DA INSERIRE: importo caparra a persona (€)",
  "dep.policy.ph": "DA INSERIRE: policy di cancellazione",
  "dep.summary.deposit": "Garanzia scelta: caparra.",
  "dep.summary.card": "Garanzia scelta: carta a garanzia, senza addebito.",
  "pay.demo": "Pagamento dimostrativo – nessun addebito",
  "pay.number": "Numero della carta", "pay.expiry": "Scadenza",
  "pay.demo.note": "I campi sono finti e non si possono compilare: in questa anteprima nessun pagamento è reale.",
  "book.summary.legend": "Controlla e conferma",
  "book.summary.fine": "Confermando accetti che l'osteria usi i tuoi dati per gestire la prenotazione.",
  "book.confirm.btn": "Conferma la prenotazione",
  "sum.code": "Codice", "sum.date": "Data", "sum.time": "Ora", "sum.people": "Persone", "sum.table": "Tavolo", "sum.name": "Nome", "sum.phone": "Telefono",
  "sum.email": "Email", "sum.allergies": "Allergie e intolleranze", "sum.notes": "Note", "sum.remind": "Promemoria via",
  "book.done.eyebrow": "Prenotazione confermata",
  "book.done.title": "Grazie {name}, ti aspettiamo!",
  "book.done.code": "Il tuo codice prenotazione:",
  "book.done.home": "Torna alla home",
  "book.done.demo": "Questa è un'anteprima dimostrativa: la prenotazione non è stata inviata e i messaggi qui sotto sono esempi di ciò che riceveresti.",
  "book.ics": "Aggiungi al calendario", "book.again": "Nuova prenotazione",
  "ics.summary": "Cena/pranzo all'Osteria da Zi' Umberto",
  "ics.desc": "Prenotazione {code} per {people} persone. Telefono: 06 581 6646.",
  "book.preview.title": "I messaggi che riceverai",
  "book.preview.lead": "Ecco come appaiono, nella tua lingua e sui canali che hai scelto.",
  "msg.kind.confirm": "Conferma immediata", "msg.kind.remind": "Promemoria", "msg.kind.review": "Il giorno dopo",
  "msg.when.confirm": "Subito dopo la prenotazione",
  "msg.when.remind": "{hours} ore prima · {at}",
  "msg.when.review": "Il giorno dopo · {at}",
  "msg.off": "Non verrà inviato (consenso non dato)",
  "msg.from": "Da: Osteria da Zi' Umberto",
  "msg.private": "Preferisci scrivere all'osteria in privato?",
  "msg.sms.confirm": "Osteria da Zi' Umberto: prenotazione {code} confermata per {people} persone, {date} alle {time}. Piazza di San Giovanni della Malva 14, Roma. Per modifiche: 06 581 6646.",
  "msg.sms.remind": "Osteria da Zi' Umberto: ti ricordiamo la prenotazione {code}, {date} alle {time}, {people} persone. Non puoi venire? Chiama il 06 581 6646.",
  "msg.sms.review": "Grazie di essere stato da noi, {name}! Ti va di raccontare com'è andata? {link}. Per scriverci in privato rispondi a questo messaggio.",
  "msg.wa.confirm": "Ciao {name}! 👋 La tua prenotazione all'Osteria da Zi' Umberto è confermata.\n{date}, ore {time} · {people} persone\nCodice: {code}\nPiazza di San Giovanni della Malva 14, Roma.",
  "msg.wa.remind": "Ciao {name}, ti ricordiamo la prenotazione di {date} alle {time} ({people} persone, codice {code}). Se cambia qualcosa, scrivici qui.",
  "msg.wa.review": "Ciao {name}, grazie di essere venuto all'osteria! Se ti va, raccontaci com'è andata: {link}\nSe preferisci scriverci in privato, rispondi pure qui.",
  "msg.mail.confirm.subj": "Prenotazione confermata ({code})",
  "msg.mail.confirm.body": "Ciao {name},\nla tua prenotazione è confermata.\n\n{date}, ore {time}\n{people} persone\nCodice: {code}\n\nTi aspettiamo in Piazza di San Giovanni della Malva 14, Roma.\nPer modifiche: 06 581 6646.\n\nOsteria da Zi' Umberto",
  "msg.mail.remind.subj": "Ti aspettiamo: {date} alle {time}",
  "msg.mail.remind.body": "Ciao {name},\nun promemoria: ti aspettiamo {date} alle {time}, per {people} persone (codice {code}).\n\nSe non puoi venire, avvisaci al 06 581 6646.\n\nOsteria da Zi' Umberto",
  "msg.mail.review.subj": "Com'è andata da Zi' Umberto?",
  "msg.mail.review.body": "Ciao {name},\ngrazie di essere stato da noi. Ci aiuta molto sapere com'è andata: se ti va, lascia una recensione su Google.\n\n{link}\n\nOsteria da Zi' Umberto",
  "err.date": "Scegli una data.",
  "err.noslots": "Per questa data e questo pasto non ci sono più orari: prova un altro giorno o l'altro servizio.",
  "err.time": "Scegli un orario.",
  "err.name": "Inserisci il tuo nome.",
  "err.phone": "Inserisci un numero di telefono valido.",
  "err.email": "L'indirizzo email non sembra corretto.",
  "err.channel": "Scegli almeno un canale per i messaggi.",
  "err.channel.email": "Per ricevere i messaggi via email, torna indietro e inserisci il tuo indirizzo.",
  "err.consent": "Il consenso al trattamento dei dati è necessario per prenotare.",
  "err.guarantee": "Scegli come garantire il tavolo."
});
I18N.add("en", {
  "meta.book.title": "Book a table – Osteria da Zi' Umberto, Trastevere",
  "meta.book.desc": "Book a table at Osteria da Zi' Umberto (Osteria da Zi Umberto) in Trastevere: choose the date, time, and indoors or in the square. Booking is recommended for lunch and dinner.",
  "common.optional": "(optional)",
  "f.name": "Full name", "f.phone": "Phone", "f.email": "Email",
  "book.eyebrow": "Reservations",
  "book.title": "Book a table",
  "book.lead": "Booking is recommended for both lunch and dinner. Pick when you're coming, and whether you'd like to sit inside or out in the square.",
  "book.direct": "By booking here you book directly with the osteria.",
  "book.demo": "Preview only: the booking is not sent and no data leaves this page. To book for real, call 06 581 6646.",
  "book.step": "Step {n} of {total}",
  "book.when.legend": "When are you coming?",
  "book.date": "Date", "book.people": "Guests",
  "book.people.less": "One guest fewer", "book.people.more": "One guest more",
  "book.people.hint": "Children included.",
  "book.people.max": "For more than {n} guests please use the form", "book.people.events": "Events and groups",
  "book.people.n": "{n} guests",
  "book.meal": "Lunch or dinner",
  "book.lunch": "Lunch", "book.dinner": "Dinner",
  "book.time.legend": "What time?",
  "book.lastentry": "[DA CONFERMARE: ultimo ingresso a pranzo e a cena]",
  "book.table": "Where would you like to sit?",
  "book.table.room": "Indoors", "book.table.square": "In the square", "book.table.any": "No preference",
  "book.table.hint": "This is a request: it depends on availability.",
  "book.details.legend": "Your details",
  "book.allergies": "Allergies and intolerances", "book.allergies.ph": "E.g. gluten, lactose…",
  "book.notes": "Notes",
  "book.remind.legend": "Reminders",
  "book.remind.lead": "We'll message you to confirm, and again {hours} hours before to remind you. Choose where you'd like to receive them.",
  "book.remind.channels": "Channels (pick one or more)",
  "ch.sms": "SMS", "ch.email": "Email", "ch.wa": "WhatsApp",
  "book.ch.sms.sub": "To the phone number you gave",
  "book.ch.email.sub": "To the email address you gave",
  "book.ch.wa.sub": "To the phone number you gave",
  "book.consent.legend": "Consent",
  "book.consent.privacy": "I have read the <a href=\"privacy.html\" target=\"_blank\" rel=\"noopener\">privacy notice</a> and agree to my data being used to manage my booking. (required)",
  "book.consent.review": "I'd like a message the next day asking for a review.",
  "book.consent.review.sub": "Optional. It makes no difference to your booking.",
  "dep.legend": "A guarantee for your booking",
  "dep.why": "We ask for a guarantee on this booking because:",
  "dep.reason.group": "it's a group of {n} guests or more.",
  "dep.reason.date": "it's a special date (14 February or 31 December).",
  "dep.reason.saturday": "it's a Saturday dinner.",
  "dep.choose": "Choose how to guarantee your table",
  "dep.deposit": "Deposit", "dep.deposit.sub": "An amount per person, deducted from your bill.",
  "dep.card": "Card guarantee", "dep.card.sub": "Nothing is charged: the card only guarantees the table.",
  "dep.amount": "Deposit amount", "dep.policy": "Cancellation",
  "dep.perperson": "per person", "dep.total": "in total",
  "dep.amount.ph": "DA INSERIRE: importo caparra a persona (€)",
  "dep.policy.ph": "DA INSERIRE: policy di cancellazione",
  "dep.summary.deposit": "Guarantee chosen: deposit.",
  "dep.summary.card": "Guarantee chosen: card guarantee, no charge.",
  "pay.demo": "Demo payment – no charge",
  "pay.number": "Card number", "pay.expiry": "Expiry",
  "pay.demo.note": "These fields are fake and can't be filled in: no payment is real in this preview.",
  "book.summary.legend": "Check and confirm",
  "book.summary.fine": "By confirming you agree that the osteria uses your details to manage your booking.",
  "book.confirm.btn": "Confirm booking",
  "sum.code": "Code", "sum.date": "Date", "sum.time": "Time", "sum.people": "Guests", "sum.table": "Table", "sum.name": "Name", "sum.phone": "Phone",
  "sum.email": "Email", "sum.allergies": "Allergies and intolerances", "sum.notes": "Notes", "sum.remind": "Reminders by",
  "book.done.eyebrow": "Booking confirmed",
  "book.done.title": "Thank you {name}, see you soon!",
  "book.done.code": "Your booking code:",
  "book.done.home": "Back to the home page",
  "book.done.demo": "This is a preview: the booking has not been sent, and the messages below are examples of what you would receive.",
  "book.ics": "Add to calendar", "book.again": "New booking",
  "ics.summary": "Meal at Osteria da Zi' Umberto",
  "ics.desc": "Booking {code} for {people} guests. Phone: 06 581 6646.",
  "book.preview.title": "The messages you'll receive",
  "book.preview.lead": "Here's how they look, in your language and on the channels you chose.",
  "msg.kind.confirm": "Instant confirmation", "msg.kind.remind": "Reminder", "msg.kind.review": "The next day",
  "msg.when.confirm": "Right after booking",
  "msg.when.remind": "{hours} hours before · {at}",
  "msg.when.review": "The next day · {at}",
  "msg.off": "Won't be sent (no consent given)",
  "msg.from": "From: Osteria da Zi' Umberto",
  "msg.private": "Prefer to write to the osteria privately?",
  "msg.sms.confirm": "Osteria da Zi' Umberto: booking {code} confirmed for {people} guests, {date} at {time}. Piazza di San Giovanni della Malva 14, Rome. To change it: 06 581 6646.",
  "msg.sms.remind": "Osteria da Zi' Umberto: a reminder of booking {code}, {date} at {time}, {people} guests. Can't make it? Call 06 581 6646.",
  "msg.sms.review": "Thanks for dining with us, {name}! Would you tell us how it went? {link}. To write to us privately, just reply to this message.",
  "msg.wa.confirm": "Hi {name}! 👋 Your booking at Osteria da Zi' Umberto is confirmed.\n{date}, {time} · {people} guests\nCode: {code}\nPiazza di San Giovanni della Malva 14, Rome.",
  "msg.wa.remind": "Hi {name}, a reminder of your booking on {date} at {time} ({people} guests, code {code}). If anything changes, message us here.",
  "msg.wa.review": "Hi {name}, thanks for coming to the osteria! If you like, tell us how it went: {link}\nIf you'd rather write to us privately, just reply here.",
  "msg.mail.confirm.subj": "Booking confirmed ({code})",
  "msg.mail.confirm.body": "Hi {name},\nyour booking is confirmed.\n\n{date}, {time}\n{people} guests\nCode: {code}\n\nSee you at Piazza di San Giovanni della Malva 14, Rome.\nTo change it: 06 581 6646.\n\nOsteria da Zi' Umberto",
  "msg.mail.remind.subj": "See you on {date} at {time}",
  "msg.mail.remind.body": "Hi {name},\na reminder: we're expecting you on {date} at {time}, for {people} guests (code {code}).\n\nIf you can't make it, let us know on 06 581 6646.\n\nOsteria da Zi' Umberto",
  "msg.mail.review.subj": "How was your meal at Zi' Umberto?",
  "msg.mail.review.body": "Hi {name},\nthank you for dining with us. It helps us a lot to hear how it went: if you like, leave a review on Google.\n\n{link}\n\nOsteria da Zi' Umberto",
  "err.date": "Please choose a date.",
  "err.noslots": "No times are left for this date and meal: try another day or the other service.",
  "err.time": "Please choose a time.",
  "err.name": "Please enter your name.",
  "err.phone": "Please enter a valid phone number.",
  "err.email": "That email address doesn't look right.",
  "err.channel": "Choose at least one channel for the messages.",
  "err.channel.email": "To get messages by email, go back and enter your email address.",
  "err.consent": "Consent to data processing is needed to book.",
  "err.guarantee": "Please choose how to guarantee the table."
});

/* -------------------------------- ASPORTO --------------------------------- */
I18N.add("it", {
  "meta.takeaway.title": "Asporto – Osteria da Zi' Umberto, Trastevere",
  "meta.takeaway.desc": "Ordina i piatti dell'Osteria da Zi' Umberto (Osteria da Zi Umberto) e ritirali in Piazza di San Giovanni della Malva 14, a Trastevere. Nessuna consegna a domicilio.",
  "take.eyebrow": "Da portare via",
  "take.title": "Asporto",
  "take.lead": "Scegli i piatti, scegli l'orario e ritira in osteria, in Piazza di San Giovanni della Malva 14. Non c'è consegna a domicilio.",
  "take.ph": "[DA CONFERMARE: oggi l'osteria fa asporto?] [DA CONFERMARE: prezzi dell'asporto, qui uguali a quelli del menù]",
  "take.demo": "Anteprima dimostrativa: l'ordine non viene inviato e nessun pagamento è reale.",
  "take.cart": "Il tuo ordine",
  "take.variant": "Scegli la variante",
  "take.add": "Aggiungi",
  "take.empty": "Il carrello è vuoto. Aggiungi qualche piatto dal menù.",
  "take.qty": "Quantità", "take.less": "Una in meno", "take.more": "Una in più", "take.remove": "Togli",
  "take.note": "Note per questo piatto (facoltativo)",
  "take.total": "Totale",
  "take.checkout": "Vai al ritiro",
  "take.pickup.where": "Ritiro in Piazza di San Giovanni della Malva 14, 00153 Roma.",
  "take.backcart": "Torna al carrello",
  "take.pickup.date": "Giorno del ritiro",
  "take.pickup.time": "Orario del ritiro",
  "take.lastpickup": "[DA CONFERMARE: ultimo orario di ritiro]",
  "take.pay": "Pagamento",
  "take.pay.pickup": "Al ritiro", "take.pay.online": "Online (dimostrativo)",
  "take.consent": "Ho letto l'<a href=\"privacy.html\" target=\"_blank\" rel=\"noopener\">informativa privacy</a> e acconsento al trattamento dei dati per questo ordine. (obbligatorio)",
  "take.confirm.pickup": "Conferma l'ordine",
  "take.confirm.online": "Conferma e paga (dimostrativo)",
  "take.done.eyebrow": "Ordine ricevuto",
  "take.done.title": "Grazie, a presto!",
  "take.done.pickup": "Ritiro",
  "take.done.demo": "Questa è un'anteprima dimostrativa: l'ordine non è stato inviato e nulla è stato addebitato.",
  "take.new": "Nuovo ordine",
  "take.close": "Chiudi",
  "take.fab": "Carrello · {n} · {total}",
  "take.added": "{name}: aggiunto al carrello.",
  "err.ptime": "Scegli un orario di ritiro."
});
I18N.add("en", {
  "meta.takeaway.title": "Takeaway – Osteria da Zi' Umberto, Trastevere",
  "meta.takeaway.desc": "Order dishes from Osteria da Zi' Umberto (Osteria da Zi Umberto) and pick them up at Piazza di San Giovanni della Malva 14, Trastevere. We don't deliver.",
  "take.eyebrow": "To take away",
  "take.title": "Takeaway",
  "take.lead": "Choose your dishes, pick a time and collect at the osteria, Piazza di San Giovanni della Malva 14. We don't deliver.",
  "take.ph": "[DA CONFERMARE: oggi l'osteria fa asporto?] [DA CONFERMARE: prezzi dell'asporto, qui uguali a quelli del menù]",
  "take.demo": "Preview only: the order isn't sent and no payment is real.",
  "take.cart": "Your order",
  "take.variant": "Choose the version",
  "take.add": "Add",
  "take.empty": "Your cart is empty. Add a few dishes from the menu.",
  "take.qty": "Quantity", "take.less": "One less", "take.more": "One more", "take.remove": "Remove",
  "take.note": "Notes for this dish (optional)",
  "take.total": "Total",
  "take.checkout": "Choose pickup",
  "take.pickup.where": "Pickup at Piazza di San Giovanni della Malva 14, 00153 Rome.",
  "take.backcart": "Back to cart",
  "take.pickup.date": "Pickup day",
  "take.pickup.time": "Pickup time",
  "take.lastpickup": "[DA CONFERMARE: ultimo orario di ritiro]",
  "take.pay": "Payment",
  "take.pay.pickup": "At pickup", "take.pay.online": "Online (demo)",
  "take.consent": "I have read the <a href=\"privacy.html\" target=\"_blank\" rel=\"noopener\">privacy notice</a> and agree to my data being used for this order. (required)",
  "take.confirm.pickup": "Confirm order",
  "take.confirm.online": "Confirm and pay (demo)",
  "take.done.eyebrow": "Order received",
  "take.done.title": "Thank you, see you soon!",
  "take.done.pickup": "Pickup",
  "take.done.demo": "This is a preview: the order hasn't been sent and nothing has been charged.",
  "take.new": "New order",
  "take.close": "Close",
  "take.fab": "Cart · {n} · {total}",
  "take.added": "{name}: added to your cart.",
  "err.ptime": "Please choose a pickup time."
});

/* ------------------------------ BUONI REGALO ------------------------------ */
I18N.add("it", {
  "meta.vouchers.title": "Buoni regalo – Osteria da Zi' Umberto, Trastevere",
  "meta.vouchers.desc": "Regala una cena all'Osteria da Zi' Umberto (Osteria da Zi Umberto), a Trastevere: scegli l'importo, scrivi un messaggio, invia il buono per email o stampalo.",
  "gift.eyebrow": "Un regalo a tavola",
  "gift.title": "Buoni regalo",
  "gift.lead": "Scegli l'importo, scrivi un messaggio e guarda il buono prendere forma. Lo inviamo per email nel giorno che scegli, oppure lo stampi tu.",
  "gift.demo": "Anteprima dimostrativa: il buono non viene emesso, nessuna email parte e nessun pagamento è reale.",
  "gift.preview": "Anteprima del buono",
  "gift.v.label": "Buono regalo",
  "gift.v.fine": "Da spendere all'Osteria da Zi' Umberto. [DA CONFERMARE: validità e condizioni]",
  "gift.v.to": "Per", "gift.v.from": "Da",
  "gift.v.names": "Per chi, da parte di chi",
  "gift.v.msg": "Il tuo messaggio comparirà qui.",
  "gift.f.what": "Cosa regali?",
  "gift.f.custom": "Altro importo",
  "gift.f.custom.label": "Importo in euro",
  "gift.f.amounts.ph": "[DA CONFERMARE: importi 30 / 60 / 100 €]",
  "gift.f.exp.ph": "[DA INSERIRE: cosa comprende e prezzo]",
  "gift.f.exp.price": "DA INSERIRE: prezzo",
  "gift.f.who": "Chi regala, chi riceve",
  "gift.f.from": "Da parte di", "gift.f.to": "Per",
  "gift.f.msg": "Messaggio", "gift.f.msg.hint": "Al massimo 200 caratteri.",
  "gift.f.delivery": "Come lo consegni?",
  "gift.f.d.email": "Via email, in una data a scelta", "gift.f.d.print": "Lo stampo io",
  "gift.f.toemail": "Email di chi riceve", "gift.f.senddate": "Invia il giorno",
  "gift.f.youremail": "La tua email (per la ricevuta)",
  "gift.f.pay": "Pagamento",
  "gift.f.consent": "Ho letto l'<a href=\"privacy.html\" target=\"_blank\" rel=\"noopener\">informativa privacy</a> e acconsento al trattamento dei dati per emettere il buono. (obbligatorio)",
  "gift.f.buy": "Acquista il buono (dimostrativo)",
  "gift.err.amount": "Inserisci un importo valido.",
  "gift.err.from": "Scrivi chi regala.", "gift.err.to": "Scrivi chi riceve.",
  "gift.err.date": "Scegli una data di invio da oggi in poi.",
  "gift.done.eyebrow": "Buono creato",
  "gift.done.title": "Il tuo buono è pronto",
  "gift.done.code": "Codice del buono:",
  "gift.done.email": "Lo invieremo a {to} il {date}.",
  "gift.done.print": "Stampalo o salvalo in PDF con il pulsante qui sotto.",
  "gift.done.demo": "Questa è un'anteprima dimostrativa: il codice non è valido e nessuna email viene inviata.",
  "gift.again": "Crea un altro buono",
  "gift.xmas.title": "Un regalo per Natale",
  "gift.xmas.p": "Un buono è un regalo che si apre a tavola: due righe scritte da te, e un posto in osteria che aspetta chi lo riceve. Scegli l'importo e scrivi il messaggio qui sopra."
});
I18N.add("en", {
  "meta.vouchers.title": "Gift vouchers – Osteria da Zi' Umberto, Trastevere",
  "meta.vouchers.desc": "Give dinner at Osteria da Zi' Umberto (Osteria da Zi Umberto) in Trastevere: choose an amount, write a message, send the voucher by email or print it.",
  "gift.eyebrow": "A gift at the table",
  "gift.title": "Gift vouchers",
  "gift.lead": "Choose an amount, write a message and watch the voucher take shape. We email it on the day you pick, or you print it yourself.",
  "gift.demo": "Preview only: no voucher is issued, no email is sent and no payment is real.",
  "gift.preview": "Voucher preview",
  "gift.v.label": "Gift voucher",
  "gift.v.fine": "To spend at Osteria da Zi' Umberto. [DA CONFERMARE: validità e condizioni]",
  "gift.v.to": "To", "gift.v.from": "From",
  "gift.v.names": "Who it's for, and from whom",
  "gift.v.msg": "Your message will appear here.",
  "gift.f.what": "What are you giving?",
  "gift.f.custom": "Other amount",
  "gift.f.custom.label": "Amount in euro",
  "gift.f.amounts.ph": "[DA CONFERMARE: importi 30 / 60 / 100 €]",
  "gift.f.exp.ph": "[DA INSERIRE: cosa comprende e prezzo]",
  "gift.f.exp.price": "DA INSERIRE: prezzo",
  "gift.f.who": "From whom, to whom",
  "gift.f.from": "From", "gift.f.to": "To",
  "gift.f.msg": "Message", "gift.f.msg.hint": "200 characters at most.",
  "gift.f.delivery": "How should it arrive?",
  "gift.f.d.email": "By email, on a day you choose", "gift.f.d.print": "I'll print it myself",
  "gift.f.toemail": "Recipient's email", "gift.f.senddate": "Send on",
  "gift.f.youremail": "Your email (for the receipt)",
  "gift.f.pay": "Payment",
  "gift.f.consent": "I have read the <a href=\"privacy.html\" target=\"_blank\" rel=\"noopener\">privacy notice</a> and agree to my data being used to issue the voucher. (required)",
  "gift.f.buy": "Buy the voucher (demo)",
  "gift.err.amount": "Please enter a valid amount.",
  "gift.err.from": "Please say who it's from.", "gift.err.to": "Please say who it's for.",
  "gift.err.date": "Choose a sending date from today onwards.",
  "gift.done.eyebrow": "Voucher created",
  "gift.done.title": "Your voucher is ready",
  "gift.done.code": "Voucher code:",
  "gift.done.email": "We'll send it to {to} on {date}.",
  "gift.done.print": "Print it or save it as a PDF with the button below.",
  "gift.done.demo": "This is a preview: the code isn't valid and no email is sent.",
  "gift.again": "Create another voucher",
  "gift.xmas.title": "A gift for Christmas",
  "gift.xmas.p": "A voucher is a gift that opens at the table: a few lines written by you, and a seat at the osteria waiting for whoever receives it. Choose the amount and write your message above."
});

/* --------------------------------- EVENTI --------------------------------- */
I18N.add("it", {
  "meta.events.title": "Eventi privati e gruppi – Osteria da Zi' Umberto, Trastevere",
  "meta.events.desc": "Compleanni, cene aziendali, comunioni, lauree: organizza il tuo evento all'Osteria da Zi' Umberto (Osteria da Zi Umberto), a Trastevere. Racconta cosa festeggi e ti ricontattiamo.",
  "ev.eyebrow": "Insieme, in tanti",
  "ev.title": "Eventi privati e gruppi",
  "ev.lead": "Compleanni, cene aziendali, comunioni, battesimi, lauree: raccontaci cosa festeggi e come lo immagini, e ti ricontattiamo per costruirlo insieme.",
  "ev.capacity": "[DA INSERIRE: coperti in sala e in piazza]",
  "ev.demo": "Anteprima dimostrativa: la richiesta non viene inviata e nessun dato esce da questa pagina.",
  "ev.f.event": "L'evento",
  "ev.f.type": "Tipo di evento",
  "ev.type.birthday": "Compleanno", "ev.type.corporate": "Cena aziendale", "ev.type.communion": "Comunione / cresima", "ev.type.baptism": "Battesimo", "ev.type.graduation": "Laurea", "ev.type.other": "Altro",
  "ev.f.date": "Data", "ev.f.people": "Numero di persone", "ev.f.meal": "Pranzo o cena",
  "ev.f.budget": "Budget a persona",
  "ev.budget.b25": "Fino a 25 €", "ev.budget.b35": "25–35 €", "ev.budget.b50": "35–50 €", "ev.budget.b50p": "Oltre 50 €",
  "ev.f.menu": "Formula", "ev.menu.fixed": "Menù fisso", "ev.menu.carte": "Alla carta",
  "ev.f.space": "Spazio preferito",
  "ev.f.exclusive": "Uso esclusivo del locale", "ev.ex.yes": "Sì", "ev.ex.no": "No",
  "ev.f.more": "Altri dettagli",
  "ev.f.diet": "Esigenze alimentari e allergie", "ev.f.requests": "Richieste particolari (torta, allestimento…)",
  "ev.f.corp": "Dati per la fattura",
  "ev.f.company": "Nome dell'azienda", "ev.f.invoice": "Dati per la fattura (P.IVA, codice SDI/PEC, indirizzo)",
  "ev.f.contact": "Come ti contattiamo",
  "ev.f.channel": "Canale preferito per la risposta",
  "ev.ch.phone": "Telefono", "ev.ch.email": "Email", "ev.ch.wa": "WhatsApp",
  "ev.f.consent": "Ho letto l'<a href=\"privacy.html\" target=\"_blank\" rel=\"noopener\">informativa privacy</a> e acconsento al trattamento dei dati per rispondere alla richiesta. (obbligatorio)",
  "ev.f.send": "Invia la richiesta",
  "ev.err.date": "Scegli una data da oggi in poi.", "ev.err.people": "Indica il numero di persone.", "ev.err.company": "Inserisci il nome dell'azienda.",
  "ev.done.eyebrow": "Richiesta ricevuta",
  "ev.done.title": "Grazie, abbiamo la tua richiesta",
  "ev.done.reply": "Ti ricontattiamo entro {hours} ore.",
  "ev.done.code": "Il tuo riferimento:",
  "ev.done.demo": "Questa è un'anteprima dimostrativa: la richiesta non è stata inviata a nessuno.",
  "ev.again": "Nuova richiesta"
});
I18N.add("en", {
  "meta.events.title": "Private events and groups – Osteria da Zi' Umberto, Trastevere",
  "meta.events.desc": "Birthdays, company dinners, communions, graduations: plan your event at Osteria da Zi' Umberto (Osteria da Zi Umberto) in Trastevere. Tell us what you're celebrating and we'll get back to you.",
  "ev.eyebrow": "Together, in numbers",
  "ev.title": "Private events and groups",
  "ev.lead": "Birthdays, company dinners, communions, christenings, graduations: tell us what you're celebrating and how you picture it, and we'll get back to you to plan it together.",
  "ev.capacity": "[DA INSERIRE: coperti in sala e in piazza]",
  "ev.demo": "Preview only: the request isn't sent and no data leaves this page.",
  "ev.f.event": "The event",
  "ev.f.type": "Type of event",
  "ev.type.birthday": "Birthday", "ev.type.corporate": "Company dinner", "ev.type.communion": "Communion / confirmation", "ev.type.baptism": "Christening", "ev.type.graduation": "Graduation", "ev.type.other": "Other",
  "ev.f.date": "Date", "ev.f.people": "Number of guests", "ev.f.meal": "Lunch or dinner",
  "ev.f.budget": "Budget per person",
  "ev.budget.b25": "Up to €25", "ev.budget.b35": "€25–35", "ev.budget.b50": "€35–50", "ev.budget.b50p": "Over €50",
  "ev.f.menu": "Format", "ev.menu.fixed": "Set menu", "ev.menu.carte": "À la carte",
  "ev.f.space": "Preferred space",
  "ev.f.exclusive": "Exclusive use of the restaurant", "ev.ex.yes": "Yes", "ev.ex.no": "No",
  "ev.f.more": "More details",
  "ev.f.diet": "Dietary needs and allergies", "ev.f.requests": "Special requests (cake, decorations…)",
  "ev.f.corp": "Invoice details",
  "ev.f.company": "Company name", "ev.f.invoice": "Invoice details (VAT number, SDI code/PEC, address)",
  "ev.f.contact": "How we reach you",
  "ev.f.channel": "Preferred channel for our reply",
  "ev.ch.phone": "Phone", "ev.ch.email": "Email", "ev.ch.wa": "WhatsApp",
  "ev.f.consent": "I have read the <a href=\"privacy.html\" target=\"_blank\" rel=\"noopener\">privacy notice</a> and agree to my data being used to reply to this request. (required)",
  "ev.f.send": "Send the request",
  "ev.err.date": "Choose a date from today onwards.", "ev.err.people": "Please enter the number of guests.", "ev.err.company": "Please enter the company name.",
  "ev.done.eyebrow": "Request received",
  "ev.done.title": "Thank you, we have your request",
  "ev.done.reply": "We'll get back to you within {hours} hours.",
  "ev.done.code": "Your reference:",
  "ev.done.demo": "This is a preview: the request hasn't been sent to anyone.",
  "ev.again": "New request"
});

/* ------------------------ PRIVACY, COOKIE, 404 ---------------------------- */
I18N.add("it", {
  "meta.privacy.title": "Privacy – Osteria da Zi' Umberto",
  "meta.privacy.desc": "Informativa sulla privacy dell'Osteria da Zi' Umberto: quali dati usiamo per prenotazioni, asporto, buoni regalo ed eventi, e quali sono i tuoi diritti.",
  "meta.cookie.title": "Cookie – Osteria da Zi' Umberto",
  "meta.cookie.desc": "Cookie e tecnologie simili usate dal sito dell'Osteria da Zi' Umberto: solo ciò che serve a farlo funzionare, più la mappa di Google se decidi di caricarla.",
  "meta.notfound.title": "Pagina non trovata – Osteria da Zi' Umberto",
  "meta.notfound.desc": "La pagina che cerchi non esiste. Torna alla home dell'Osteria da Zi' Umberto.",
  "privacy.title": "Informativa sulla privacy",
  "privacy.body": "<p class=\"notice\">Testo standard da far verificare dal titolare o da un consulente prima della messa online.</p>" +
    "<h2>1. Titolare del trattamento</h2><p>[ragione sociale], P.IVA [P.IVA], Piazza di San Giovanni della Malva 14, 00153 Roma. Contatto privacy: [email titolare].</p>" +
    "<h2>2. Quali dati trattiamo</h2><p>Solo quelli che inserisci tu nei moduli: nome, telefono, email, data e numero di persone della prenotazione, preferenze di tavolo, note, allergie e intolleranze, dati dell'ordine d'asporto, dati del buono regalo (chi regala, chi riceve, messaggio), dati della richiesta di evento (e, per le aziende, i dati per la fattura).</p>" +
    "<h2>3. Perché e su quale base</h2><ul><li>Gestire prenotazioni, ordini, buoni ed eventi che richiedi: esecuzione di una tua richiesta.</li><li>Inviarti la conferma e il promemoria della prenotazione: parte della prenotazione stessa, sui canali che scegli (SMS, email, WhatsApp).</li><li>Inviarti, il giorno dopo, la richiesta di recensione: solo se dai il consenso, che è facoltativo e separato. La richiesta è identica per tutti i clienti.</li><li>Obblighi fiscali e di legge.</li></ul>" +
    "<h2>4. Allergie e intolleranze</h2><p>Se ce le comunichi, le usiamo solo per servirti in sicurezza. Possono rivelare informazioni sulla salute: le trattiamo solo con il tuo consenso, dato nel modulo.</p>" +
    "<h2>5. Per quanto tempo</h2><p>[DA INSERIRE: tempi di conservazione per prenotazioni, ordini, buoni ed eventi]</p>" +
    "<h2>6. A chi li comunichiamo</h2><p>Solo ai fornitori che ci servono per erogare il servizio (invio di SMS, WhatsApp ed email, pagamenti, gestione prenotazioni): [DA INSERIRE: elenco fornitori]. Non vendiamo i tuoi dati.</p>" +
    "<h2>7. I tuoi diritti</h2><p>Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità e opporti al trattamento, scrivendo a [email titolare]. Puoi revocare in ogni momento il consenso al messaggio del giorno dopo. Hai diritto di rivolgerti al Garante per la protezione dei dati personali.</p>" +
    "<h2>8. Questa anteprima</h2><p>Nella versione dimostrativa del sito i moduli non inviano alcun dato: tutto resta nel tuo browser.</p>",
  "cookie.title": "Cookie",
  "cookie.body": "<p class=\"notice\">Testo standard da far verificare dal titolare o da un consulente prima della messa online.</p>" +
    "<h2>Cosa usa questo sito</h2><ul><li><strong>Nessun cookie di profilazione o di marketing.</strong> Nessuno strumento di statistica.</li><li><strong>Archiviazione locale del browser</strong> (localStorage), solo per due cose: la lingua che scegli (<em>zu_lang</em>) e il carrello dell'asporto (<em>zu_cart</em>). Restano sul tuo dispositivo e non servono a identificarti.</li></ul>" +
    "<h2>Servizi di terze parti</h2><ul><li><strong>Google Fonts</strong>: i caratteri del sito sono caricati dai server di Google, che quindi riceve il tuo indirizzo IP. Per evitarlo, i caratteri possono essere ospitati sul sito stesso.</li><li><strong>Google Maps</strong>: la mappa non si carica finché non premi «Carica la mappa». Solo allora Google può usare cookie e raccogliere dati secondo la propria informativa.</li><li><strong>Link esterni</strong> (Google, Tripadvisor, Facebook): quando li apri, vale l'informativa di quei siti.</li></ul>" +
    "<h2>Come cancellare i dati locali</h2><p>Dalle impostazioni del tuo browser puoi eliminare i dati del sito in qualsiasi momento.</p>" +
    "<h2>Titolare</h2><p>[ragione sociale], P.IVA [P.IVA], contatto: [email titolare].</p>",
  "nf.title": "Questa strada non porta a tavola",
  "nf.p": "La pagina che cerchi non c'è, o ha cambiato posto. Il menù, invece, è sempre dove l'hai lasciato.",
  "nf.home": "Torna alla home", "nf.menu": "Guarda il menù"
});
I18N.add("en", {
  "meta.privacy.title": "Privacy – Osteria da Zi' Umberto",
  "meta.privacy.desc": "Privacy notice for Osteria da Zi' Umberto: what data we use for bookings, takeaway, gift vouchers and events, and what your rights are.",
  "meta.cookie.title": "Cookies – Osteria da Zi' Umberto",
  "meta.cookie.desc": "Cookies and similar technologies used by the Osteria da Zi' Umberto website: only what's needed to make it work, plus Google Maps if you choose to load it.",
  "meta.notfound.title": "Page not found – Osteria da Zi' Umberto",
  "meta.notfound.desc": "The page you're looking for doesn't exist. Go back to the Osteria da Zi' Umberto home page.",
  "privacy.title": "Privacy notice",
  "privacy.body": "<p class=\"notice\">Standard text: the owner or an advisor should check it before the site goes live.</p>" +
    "<h2>1. Data controller</h2><p>[ragione sociale], VAT no. [P.IVA], Piazza di San Giovanni della Malva 14, 00153 Rome. Privacy contact: [email titolare].</p>" +
    "<h2>2. What data we process</h2><p>Only what you enter in our forms: name, phone, email, booking date and number of guests, table preferences, notes, allergies and intolerances, takeaway order details, gift voucher details (giver, recipient, message), event request details (and, for companies, invoice details).</p>" +
    "<h2>3. Why, and on what legal basis</h2><ul><li>To handle the bookings, orders, vouchers and events you ask for: performing your request.</li><li>To send you the booking confirmation and reminder: part of the booking itself, on the channels you choose (SMS, email, WhatsApp).</li><li>To send you, the next day, a review request: only if you give your consent, which is optional and separate. The request is the same for every customer.</li><li>Tax and legal obligations.</li></ul>" +
    "<h2>4. Allergies and intolerances</h2><p>If you tell us about them, we use them only to serve you safely. They may reveal health information: we process them only with the consent you give in the form.</p>" +
    "<h2>5. How long we keep it</h2><p>[DA INSERIRE: tempi di conservazione per prenotazioni, ordini, buoni ed eventi]</p>" +
    "<h2>6. Who we share it with</h2><p>Only providers that help us deliver the service (sending SMS, WhatsApp and email, payments, booking management): [DA INSERIRE: elenco fornitori]. We do not sell your data.</p>" +
    "<h2>7. Your rights</h2><p>You can ask for access, correction, deletion, restriction, portability, and object to processing, by writing to [email titolare]. You can withdraw your consent to the next-day message at any time. You have the right to complain to the Italian data protection authority (Garante per la protezione dei dati personali).</p>" +
    "<h2>8. This preview</h2><p>In the demo version of the site the forms send no data: everything stays in your browser.</p>",
  "cookie.title": "Cookies",
  "cookie.body": "<p class=\"notice\">Standard text: the owner or an advisor should check it before the site goes live.</p>" +
    "<h2>What this site uses</h2><ul><li><strong>No profiling or marketing cookies.</strong> No analytics tools.</li><li><strong>Browser local storage</strong> (localStorage), for just two things: the language you choose (<em>zu_lang</em>) and your takeaway cart (<em>zu_cart</em>). They stay on your device and aren't used to identify you.</li></ul>" +
    "<h2>Third-party services</h2><ul><li><strong>Google Fonts</strong>: the site's fonts are loaded from Google's servers, which therefore receive your IP address. To avoid this, the fonts can be hosted on the site itself.</li><li><strong>Google Maps</strong>: the map doesn't load until you press “Load the map”. Only then can Google use cookies and collect data under its own policy.</li><li><strong>External links</strong> (Google, Tripadvisor, Facebook): when you open them, those sites' policies apply.</li></ul>" +
    "<h2>How to clear local data</h2><p>You can delete this site's data at any time from your browser settings.</p>" +
    "<h2>Controller</h2><p>[ragione sociale], VAT no. [P.IVA], contact: [email titolare].</p>",
  "nf.title": "This road doesn't lead to the table",
  "nf.p": "The page you're looking for isn't here, or it has moved. The menu, though, is right where you left it.",
  "nf.home": "Back to the home page", "nf.menu": "See the menu"
});

/* ------------------------------- GESTIONE --------------------------------- */
I18N.add("it", {
  "meta.admin.title": "Area ristoratore (demo) – Osteria da Zi' Umberto",
  "meta.admin.desc": "Dimostrazione dell'area riservata al ristoratore: prenotazioni del giorno, messaggi automatici, ordini, buoni e modifica del menù.",
  "admin.banner": "DIMOSTRAZIONE – dati di esempio, nessun accesso reale, nulla viene salvato.",
  "admin.title": "Area ristoratore (demo)",
  "admin.lead": "Ecco cosa avrebbe il titolare a disposizione ogni giorno. Tutti i nomi e i numeri qui sotto sono inventati.",
  "admin.res.title": "Prenotazioni di oggi",
  "admin.res.sub": "{date} · dati fittizi",
  "admin.col.status": "Stato", "admin.col.deposit": "Caparra / garanzia",
  "admin.st.confirmed": "Confermata", "admin.st.arrived": "Arrivati", "admin.st.pending": "In attesa di caparra",
  "admin.st.ready": "Pronto", "admin.st.preparing": "In preparazione",
  "admin.st.sent": "Inviato", "admin.st.scheduled": "Programmato", "admin.st.redeemed": "Usato",
  "admin.dep.deposit": "Caparra", "admin.dep.card": "Carta a garanzia",
  "admin.auto.title": "Messaggi automatici",
  "admin.auto.lead": "Accendi o spegni ogni messaggio e modifica il testo: l'anteprima si aggiorna subito.",
  "admin.auto.confirm": "Conferma immediata", "admin.auto.confirm.sub": "Appena il cliente prenota",
  "admin.auto.remind": "Promemoria", "admin.auto.remind.sub": "Prima della prenotazione",
  "admin.auto.review": "Richiesta di recensione", "admin.auto.review.sub": "Il giorno dopo, solo a chi ha dato il consenso",
  "admin.auto.text": "Testo (SMS)", "admin.auto.preview": "Anteprima con dati di esempio:",
  "admin.menu.title": "Modifica un piatto",
  "admin.menu.lead": "Cambia prezzo, descrizione o disponibilità: il menù del sito si aggiornerebbe da qui.",
  "admin.menu.dish": "Piatto", "admin.menu.price": "Prezzo (€)", "admin.menu.avail": "Disponibilità", "admin.menu.yes": "Disponibile", "admin.menu.no": "Esaurito",
  "admin.menu.desc": "Descrizione", "admin.menu.preview": "Come appare sul menù", "admin.menu.soldout": "esaurito",
  "admin.orders.title": "Ordini d'asporto", "admin.gifts.title": "Buoni venduti",
  "admin.online.title": "Per andare online",
  "admin.online.lead": "Il sito è pronto: ecco i passi che lo rendono operativo, e che aprono nuove possibilità.",
  "admin.online.1": "Rivendica la scheda Google. Oggi risulta non rivendicata: una volta tua potrai aggiornare orari e foto, rispondere alle recensioni e avere il link diretto per chiederne di nuove.",
  "admin.online.2": "Rivendica il profilo Tripadvisor, per curare anche lì descrizione, foto e risposte.",
  "admin.online.3": "Attiva un numero WhatsApp dedicato all'osteria, per messaggi e prenotazioni.",
  "admin.online.4": "Collega l'invio di SMS ed email, così conferme e promemoria partono da soli."
});
I18N.add("en", {
  "meta.admin.title": "Restaurant area (demo) – Osteria da Zi' Umberto",
  "meta.admin.desc": "A demonstration of the restaurant owner's area: today's bookings, automatic messages, orders, vouchers and menu editing.",
  "admin.banner": "DEMONSTRATION – sample data, no real access, nothing is saved.",
  "admin.title": "Restaurant area (demo)",
  "admin.lead": "Here's what the owner would have at hand every day. All the names and numbers below are made up.",
  "admin.res.title": "Today's bookings",
  "admin.res.sub": "{date} · sample data",
  "admin.col.status": "Status", "admin.col.deposit": "Deposit / guarantee",
  "admin.st.confirmed": "Confirmed", "admin.st.arrived": "Arrived", "admin.st.pending": "Awaiting deposit",
  "admin.st.ready": "Ready", "admin.st.preparing": "Being prepared",
  "admin.st.sent": "Sent", "admin.st.scheduled": "Scheduled", "admin.st.redeemed": "Redeemed",
  "admin.dep.deposit": "Deposit", "admin.dep.card": "Card guarantee",
  "admin.auto.title": "Automatic messages",
  "admin.auto.lead": "Switch each message on or off and edit its text: the preview updates straight away.",
  "admin.auto.confirm": "Instant confirmation", "admin.auto.confirm.sub": "As soon as the guest books",
  "admin.auto.remind": "Reminder", "admin.auto.remind.sub": "Before the booking",
  "admin.auto.review": "Review request", "admin.auto.review.sub": "The next day, only to guests who gave consent",
  "admin.auto.text": "Text (SMS)", "admin.auto.preview": "Preview with sample data:",
  "admin.menu.title": "Edit a dish",
  "admin.menu.lead": "Change price, description or availability: the site's menu would update from here.",
  "admin.menu.dish": "Dish", "admin.menu.price": "Price (€)", "admin.menu.avail": "Availability", "admin.menu.yes": "Available", "admin.menu.no": "Sold out",
  "admin.menu.desc": "Description", "admin.menu.preview": "How it looks on the menu", "admin.menu.soldout": "sold out",
  "admin.orders.title": "Takeaway orders", "admin.gifts.title": "Vouchers sold",
  "admin.online.title": "Going live",
  "admin.online.lead": "The site is ready: here are the steps that make it operational, and open up new possibilities.",
  "admin.online.1": "Claim the Google listing. Right now it shows as unclaimed: once it's yours you can update opening hours and photos, reply to reviews and get the direct link to ask for new ones.",
  "admin.online.2": "Claim the Tripadvisor profile, to look after the description, photos and replies there too.",
  "admin.online.3": "Set up a dedicated WhatsApp number for the osteria, for messages and bookings.",
  "admin.online.4": "Connect SMS and email sending, so confirmations and reminders go out on their own."
});
