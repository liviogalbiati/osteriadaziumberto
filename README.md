# Osteria da "Zi' Umberto" – sito (anteprima dimostrativa)

Sito statico in HTML, CSS e JavaScript vanilla: niente framework, niente build, niente da installare.
Funziona aprendo `index.html` con doppio clic e su GitHub Pages in sottocartella (tutti i percorsi sono relativi).
Prenotazione, caparra, asporto, buoni regalo ed eventi sono **flussi dimostrativi**: nessun dato parte, nessun pagamento è reale.

## Struttura dei file

```
index.html          Home (hero, osteria, piatti, sala, servizi, recensioni, FAQ, dove siamo)
menu.html           Menù in HTML, filtri dieta, allergeni, barra categorie
prenota.html        Prenotazione a passi (+ caparra / carta a garanzia quando serve)
asporto.html        Ordine con ritiro in osteria, carrello
buoni-regalo.html   Buoni regalo con anteprima dal vivo e stampa
eventi.html         Richiesta eventi privati e gruppi
privacy.html        Informativa privacy (testo standard con segnaposto)
cookie.html         Informativa cookie
gestione.html       "Area ristoratore (demo)": solo un link nel footer
404.html            Pagina non trovata
favicon.svg         "ZU" verde su tondo crema
css/style.css       Stile (palette come variabili su :root, stampa del buono)
js/config.js        TUTTI i dati del locale: contatti, orari, fasce, caparra, asporto, buoni
js/menu-data.js     Tutti i piatti (id, categoria, descrizioni IT/EN, prezzi, allergeni, tag, asporto)
js/i18n.js          Tutti i testi in italiano e inglese (data-i18n) + motore della lingua
js/app.js           Parti comuni: header, footer, barra azioni, orari/stato in Europe/Rome, lucine, calendario
js/home.js, menu.js, booking.js, takeaway.js, voucher.js, events.js, admin.js   Una pagina, un file
```

localStorage è usato solo per la lingua (`zu_lang`) e il carrello (`zu_cart`), sempre dentro try/catch.

## Come cambiare le cose

**Orari e stato "aperto/chiuso"** – `js/config.js`, blocco `hours`: per ogni giorno (0 = domenica … 6 = sabato) una lista di fasce `["12:30", "15:00"]`; lista vuota = chiuso. Il calcolo è sempre nel fuso Europe/Rome. Orari mostrati in footer e in "Dove siamo" si aggiornano da soli. Se gli orari cambiano, aggiorna anche il JSON-LD in `index.html` (`openingHoursSpecification`).

**Fasce di prenotazione** – `config.js`, `booking.lunch` / `booking.dinner` (`first`, `last`) e `slotMinutes`. I lunedì sono esclusi da `closedWeekdays`.

**Regole della caparra** – `config.js`, blocco `deposit`: `groupSize` (da quante persone), `dates` (giorni speciali `"MM-GG"`), `saturdayDinner`, `perPerson` (importo, oggi `null`), `cancellationPolicy`. Il passo compare solo se almeno una regola è vera.

**Un piatto** – `js/menu-data.js`: cerca il nome (Ctrl+F) e cambia `price`, `desc`, `allergens`, `diet`, `takeaway`. Il file spiega ogni campo in testa. L'ordine nel file è l'ordine della carta.

**Un testo** – `js/i18n.js`: cerca la chiave (la trovi nell'attributo `data-i18n` dell'HTML). Per aggiungere una lingua: aggiungila in `I18N.langs` e aggiungi un blocco `I18N.add("fr", {...})`.

**Foto** – i riquadri tratteggiati sono segnaposto con aspect-ratio fisso (`data-photo="..."`, didascalie in `i18n.js`, chiavi `photo.*`). Per sostituire un riquadro metti un `<img>` con `alt` dentro la stessa cornice: il layout non cambia.

## Segnaposto rimasti (domande da fare al titolare)

I segnaposto sono in corsivo e colore attenuato nel sito. Due formati: `[DA INSERIRE: …]` per ciò che manca, `[DA CONFERMARE: …]` per i dubbi.

**Contatti e profili**
- Email dell'osteria → `config.js` (`email`), footer, home, privacy/cookie (`[email titolare]`).
- Numero WhatsApp → `config.js` (`whatsapp`, solo cifre con prefisso); finché manca, il pulsante WhatsApp mostra un avviso.
- Profilo Instagram → `config.js` (`instagram`), footer.
- La pagina Facebook è quella giusta? `[DA VERIFICARE]` (link da un vecchio articolo) → `config.js`, footer.
- Il civico è 14 o 14/B? → `[DA CONFERMARE: 14 o 14/B]` in `config.js`, footer, home. Aggiorna anche JSON-LD.

**Storia e persone**
- Chi è Zi' Umberto e la storia del locale → `[DA INSERIRE: la storia di Zi' Umberto]` (`i18n.js`, `home.about.story`).
- Anno di apertura, titolari e cucina: non ancora usati nel sito, da inserire in "L'osteria".
- Foto: tutte quelle elencate nei riquadri segnaposto (piazza di sera, insegna, sala, banco antipasti, piatti, tiramisù, caraffa, tavolata, staff con consenso).

**Orari e prenotazioni**
- Chiusura serale alle 23:00 (Google) o alle 23:30 (Tripadvisor)? → `config.js` (`hours`, `eveningCloseDoubt`).
- Ultimo ingresso a pranzo e a cena → `config.js` (`booking.lunch.last`, `dinner.last`, `lastEntryConfirmed`); stessa domanda per l'ultimo ritiro dell'asporto.
- Chiusure per ferie e festività → `config.js` (`holidayClosures`) e FAQ "Quando siete chiusi?".
- Il promemoria parte davvero 24 ore prima? → `config.js` (`reminderHoursBefore`).
- Coperti in sala e in piazza → `config.js` (`seats`), `eventi.html`.
- La risposta agli eventi è davvero entro 24 ore? → `config.js` (`events.replyHours`).

**Caparra**
- Importo della caparra a persona → `config.js` (`deposit.perPerson`).
- Policy di cancellazione → `config.js` (`deposit.cancellationPolicy`).
- Le regole (8 persone, 14 febbraio, 31 dicembre, sabato a cena) sono giuste? → `config.js` (`deposit`).

**Menù**
- I piatti e i prezzi ricostruiti dalle foto di maggio e ottobre 2026 sono ancora giusti? (banner in cima al menù, `i18n.js` `menu.banner`).
- Com'è fatto il sugo delle fregnacce Zi' Mberto? → `menu-data.js` (`pending`).
- La voce "olio extravergine, aceto e sale, a persona 2 €" è davvero sul menù? → `menu-data.js`.
- Carta dei vini → `i18n.js` (`menu.wine.*`), `menu-data.js` (`WINE_PLACEHOLDERS`).
- Fuori menù di stagione (carciofi, puntarelle, zuppa di funghi e castagne, spaghetti alle vongole, polipetti alla luciana) → `menu-data.js` (`OFF_MENU`), `i18n.js` (`menu.off.ph`).
- Allergeni ufficiali: quelli del sito sono ricavati dagli ingredienti della carta e vanno confermati con la cucina → `menu-data.js`, `i18n.js` (`menu.legend.ph`).
- Quali piatti si possono dare d'asporto, e a che prezzo? I prezzi dell'asporto qui sono uguali al menù → `menu-data.js` (`takeaway`), `i18n.js` (`take.ph`).

**Asporto, buoni, eventi**
- Oggi l'osteria fa asporto? → `i18n.js` (`take.ph`, FAQ), `config.js` (`takeaway.active`).
- Importi dei buoni (30 / 60 / 100 €) → `config.js` (`voucher.amounts`), `i18n.js` (`gift.f.amounts.ph`).
- "Cena per due in osteria": cosa comprende e quanto costa → `config.js` (`voucher.experience`), `i18n.js` (`gift.f.exp.ph`).
- Validità e condizioni del buono → `i18n.js` (`gift.v.fine`).

**Dati legali**
- Ragione sociale e P.IVA → `config.js` (`legal`), `privacy.html` e `cookie.html` (testi in `i18n.js`).
- Tempi di conservazione dei dati ed elenco dei fornitori → `i18n.js` (`privacy.body`). I testi di privacy e cookie sono standard: vanno fatti verificare.
- Link diretto "scrivi una recensione" → `[LINK RECENSIONE GOOGLE]` (`config.js` `googleReviewLink`, messaggi in `i18n.js`); serve il Place ID della scheda Google.
- Ottimizzazione SEO: indirizzo definitivo del sito (per `hasMenu` e Open Graph) e una foto per `og:image`.

## Cosa serve in produzione per rendere vere le funzioni dimostrative

- **Invio di SMS, WhatsApp ed email**: un servizio di invio (SMS gateway, WhatsApp Business API con template approvati, provider email transazionale), un piccolo backend che li comandi e la pianificazione di promemoria e messaggio del giorno dopo. Il messaggio di richiesta recensione resta soggetto al consenso facoltativo e invita tutti allo stesso modo.
- **Pagamenti**: un fornitore (es. Stripe, Nexi) per caparra, carta a garanzia (pre-autorizzazione), asporto online e buoni regalo; i campi carta finti vanno sostituiti dai campi ospitati dal fornitore (mai gestire numeri di carta in proprio).
- **Gestione delle prenotazioni**: un backend con database (disponibilità reale dei tavoli, orari esauriti, coperti sala/piazza, caparre, stati), e un'area ristoratore con accesso protetto al posto di `gestione.html` (che è solo una demo, senza login). Buoni regalo: emissione e verifica dei codici lato server.
- **Place ID della scheda Google** per il link diretto alle recensioni; per ottenerlo conviene prima rivendicare la scheda (e il profilo Tripadvisor).
- **Font ospitati in locale**: oggi Libre Caslon Text e Source Sans 3 arrivano da Google Fonts (Google riceve l'IP dei visitatori). In produzione scaricarli e servirli dal sito, poi aggiornare `cookie.html`.
- **Dominio e HTTPS**, aggiornamento degli URL nel JSON-LD e nei meta Open Graph, e revisione legale di privacy e cookie.

## Pubblicazione su GitHub Pages

Impostazioni del repository → Pages → ramo `main`, cartella radice. Il sito sarà su `https://<utente>.github.io/<nome-repository>/`. Nota: `404.html` usa percorsi relativi, quindi la 404 mostra gli stili solo per indirizzi alla radice del sito.
