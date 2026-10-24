/* ==========================================================================
   Osteria da "Zi' Umberto" – DATI DEL LOCALE
   --------------------------------------------------------------------------
   Questo è l'UNICO file da toccare per cambiare contatti, orari, fasce di
   prenotazione e regole della caparra. Tutto il sito legge da qui.

   Regole veloci:
   - null  = dato mancante: il sito mostra un segnaposto [DA INSERIRE: …].
   - Gli orari sono in formato "HH:MM", sempre nel fuso Europe/Rome.
   - I giorni della settimana seguono JavaScript: 0 = domenica, 1 = lunedì,
     2 = martedì … 6 = sabato.
   ========================================================================== */
window.OSTERIA = {

  /* ---------- Identità ---------- */
  name: "Osteria da Zi' Umberto",
  nameSearch: "Osteria da Zi Umberto",      // come è registrato su Google (senza apostrofo)
  signText: "OSTERIA DA “ZI’ UMBERTO”",      // la scritta dell'insegna

  /* ---------- Indirizzo ---------- */
  address: {
    street: "Piazza di San Giovanni della Malva",
    number: "14",                            // [DA CONFERMARE: 14 o 14/B] – Tripadvisor scrive 14B
    cap: "00153",
    city: "Roma",
    area: "Trastevere"
  },
  geo: { lat: 41.8920839, lng: 12.4689164 },
  plusCode: "VFR9+RH Roma",

  /* ---------- Contatti ---------- */
  phoneDisplay: "06 581 6646",
  phoneTel: "+39065816646",
  whatsapp: null,        // solo cifre con prefisso, es. "39333xxxxxxx"  → [DA INSERIRE]
  email: null,           // es. "info@…"                                  → [DA INSERIRE]
  instagram: null,       // URL del profilo                               → [DA INSERIRE]
  facebook: "https://www.facebook.com/pages/Osteria-Da-Zi-Umberto/145281948875249", // [DA VERIFICARE]
  googleListing: "https://maps.google.com/?cid=3973366728482380407",
  tripadvisor: "https://www.tripadvisor.it/Restaurant_Review-g187791-d4601411-Reviews-Osteria_Da_Zi_Umberto-Rome_Lazio.html",
  googleReviewLink: null, // link diretto "scrivi una recensione" (serve il Place ID) → [LINK RECENSIONE GOOGLE]
  mapEmbed: "https://www.google.com/maps?q=Osteria+da+Zi+Umberto,+Piazza+di+San+Giovanni+della+Malva+14,+Roma&output=embed",
  directions: "https://www.google.com/maps/dir/?api=1&destination=41.8920839,12.4689164",

  /* ---------- Dati legali (per privacy e footer) ---------- */
  legal: {
    companyName: null,   // ragione sociale → [DA INSERIRE]
    vat: null            // P.IVA           → [DA INSERIRE]
  },

  /* ---------- Orari di apertura (Google, rilevati il 24/10/2026) ----------
     Ogni giorno è una lista di fasce [apre, chiude]. Lista vuota = chiuso.
     [DA CONFERMARE: chiusura serale alle 23:00 (Google) o alle 23:30 (Tripadvisor)] */
  timezone: "Europe/Rome",
  hours: {
    0: [["12:30", "15:00"], ["19:30", "23:00"]],   // domenica
    1: [],                                          // lunedì: chiuso
    2: [["12:30", "15:00"], ["19:30", "23:00"]],   // martedì
    3: [["12:30", "15:00"], ["19:30", "23:00"]],   // mercoledì
    4: [["12:30", "15:00"], ["19:30", "23:00"]],   // giovedì
    5: [["12:30", "15:00"], ["19:30", "23:00"]],   // venerdì
    6: [["12:30", "15:00"], ["19:30", "23:00"]]    // sabato
  },
  eveningCloseDoubt: true,   // true = mostra [DA CONFERMARE] accanto all'orario serale

  /* ---------- Prenotazione ---------- */
  booking: {
    slotMinutes: 15,                      // passo degli orari proposti
    closedWeekdays: [1],                  // giorni senza prenotazioni (lunedì)
    maxDaysAhead: 120,                    // quanto in avanti si può prenotare
    maxPeople: 20,                        // oltre, si rimanda al modulo "Eventi e gruppi"
    // Prima e ultima prenotazione per fascia.
    // [DA CONFERMARE: ultimo ingresso a pranzo e a cena]
    lunch:  { first: "12:30", last: "14:30" },
    dinner: { first: "19:30", last: "22:30" },
    lastEntryConfirmed: false,            // true = nasconde il [DA CONFERMARE]
    reminderHoursBefore: 24,              // [24 ore] prima – da confermare con il titolare
    holidayClosures: null,                // chiusure per ferie/festività → [DA INSERIRE]
    soldOutShare: 0.18                    // solo demo: quota di orari finti "esauriti"
  },

  /* ---------- Caparra / carta a garanzia ----------
     Il passo extra compare SOLO se almeno una di queste regole è vera. */
  deposit: {
    groupSize: 8,                         // da quante persone in su
    dates: ["02-14", "12-31"],            // giorni speciali, formato "MM-GG"
    saturdayDinner: true,                 // sabato a cena
    perPerson: null,                      // importo caparra a persona in € → [DA INSERIRE]
    cancellationPolicy: null              // policy di cancellazione        → [DA INSERIRE]
  },

  /* ---------- Capienza (per eventi) ---------- */
  seats: { room: null, square: null },    // coperti in sala e in piazza → [DA INSERIRE]

  /* ---------- Asporto ---------- */
  takeaway: {
    active: true,                         // [DA CONFERMARE: oggi l'osteria fa asporto?]
    leadMinutes: 30,                      // preavviso minimo per il ritiro
    slotMinutes: 15,
    lunch:  { first: "12:30", last: "14:30" },   // [DA CONFERMARE: ultimo ritiro]
    dinner: { first: "19:30", last: "22:30" },
    maxDaysAhead: 7
  },

  /* ---------- Buoni regalo ---------- */
  voucher: {
    amounts: [30, 60, 100],               // [da confermare]
    customMin: 1,
    customMax: 1000,
    experience: { name: "Cena per due in osteria", price: null, includes: null } // prezzo e contenuto → [DA INSERIRE]
  },

  /* ---------- Eventi ---------- */
  events: { replyHours: 24 }              // "Ti ricontattiamo entro [24 ore]"
};

/* Contatto "privato" per chi vuole scrivere all'osteria: email se c'è, poi WhatsApp, poi telefono. */
window.OSTERIA.privateContactHref = function () {
  var o = window.OSTERIA;
  if (o.email) return "mailto:" + o.email;
  if (o.whatsapp) return "https://wa.me/" + o.whatsapp;
  return "tel:" + o.phoneTel;
};
