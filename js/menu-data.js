/* ==========================================================================
   MENÙ – tutti i piatti in un file
   --------------------------------------------------------------------------
   Per cambiare un piatto in un minuto: trova la riga con il suo nome (Ctrl+F)
   e modifica il campo che serve. Ogni piatto è un blocco { … } con:

     id        sigla unica, minuscola, senza spazi (non cambiarla se il piatto resta)
     cat       antipasti | primi | secondi | contorni | dolci | bevande
     name      nome del piatto (resta sempre in italiano)
     desc      { it: "…", en: "…" }  descrizione breve nelle due lingue
     note      { en: "…" }  (facoltativa) due righe in inglese per i piatti romani:
               cos'è nella tradizione. Non descrive la ricetta di questa cucina.
     price     prezzo in euro (numero, es. 12). Oppure…
     variants  [ { id, label:{it,en}, price, allergens:[…] } ]  quando il piatto ha
               più scelte (gnocchi, vino della casa)
     per       (facoltativo) "persona" se il prezzo è "a persona"
     allergens elenco tra: gluten, crustaceans, eggs, fish, peanuts, soy, milk,
               nuts, celery, mustard, sesame, sulphites, lupin, molluscs
               REGOLA: solo ciò che discende con certezza dagli ingredienti scritti
               sulla carta o dal piatto per definizione. Nel dubbio NON si indovina.
     diet      elenco tra: vegetarian, vegan, glutenfree. Solo se gli ingredienti
               scritti lo rendono certo. Nel dubbio, lascia vuoto [].
     frozen    true se sulla carta c'è l'asterisco (può essere surgelato)
     takeaway  true se si può ordinare d'asporto, false altrimenti
     house     true = piatto della casa (viene messo in evidenza)
     pending   (facoltativo) testo [DA CONFERMARE …] mostrato accanto al piatto

   Per togliere un piatto: cancella il suo blocco. Per aggiungerne uno: copia un
   blocco, cambia id e campi, e mettilo nella posizione giusta (l'ordine qui è
   l'ordine della carta).

   Fonte: foto della carta pubblicate dai clienti su Google (antipasti, primi,
   dolci e bevande: maggio 2026; secondi e contorni: ottobre 2026).
   ========================================================================== */
window.MENU_CATEGORIES = [
  { id: "antipasti", it: "Antipasti",       en: "Starters" },
  { id: "primi",     it: "Primi",           en: "Pasta & first courses" },
  { id: "secondi",   it: "Secondi",         en: "Main courses" },
  { id: "contorni",  it: "Contorni",        en: "Sides" },
  { id: "dolci",     it: "Dolci",           en: "Desserts" },
  { id: "bevande",   it: "Pane e bevande",  en: "Bread & drinks" }
];

/* I 14 allergeni UE: icona e nome nelle due lingue. Non modificare. */
window.ALLERGENS = {
  gluten:      { icon: "🌾", it: "Glutine",              en: "Gluten" },
  crustaceans: { icon: "🦀", it: "Crostacei",            en: "Crustaceans" },
  eggs:        { icon: "🥚", it: "Uova",                 en: "Eggs" },
  fish:        { icon: "🐟", it: "Pesce",                en: "Fish" },
  peanuts:     { icon: "🥜", it: "Arachidi",             en: "Peanuts" },
  soy:         { icon: "🌱", it: "Soia",                 en: "Soy" },
  milk:        { icon: "🥛", it: "Latte",                en: "Milk" },
  nuts:        { icon: "🌰", it: "Frutta a guscio",      en: "Tree nuts" },
  celery:      { icon: "🥬", it: "Sedano",               en: "Celery" },
  mustard:     { icon: "🟡", it: "Senape",               en: "Mustard" },
  sesame:      { icon: "⚪", it: "Semi di sesamo",       en: "Sesame" },
  sulphites:   { icon: "🍷", it: "Solfiti",              en: "Sulphites" },
  lupin:       { icon: "🌼", it: "Lupini",               en: "Lupin" },
  molluscs:    { icon: "🐚", it: "Molluschi",            en: "Molluscs" }
};

window.MENU_ITEMS = [

  /* ----------------------------- ANTIPASTI ----------------------------- */
  { id: "fiori-zucca", cat: "antipasti", name: "Fiori di zucca fritti o filetti di baccalà fritti (2 pezzi)", short: "Fiori di zucca fritti",
    desc: { it: "Due pezzi, a scelta fiori di zucca o filetti di baccalà", en: "Two pieces: fried zucchini flowers or fried salt-cod fillets" },
    note: { en: "In Rome, fried zucchini flowers are a classic starter.\nEat them hot, straight from the fryer." },
    price: 6, allergens: ["fish"], diet: [], frozen: false, takeaway: true,
    /* allergeni: solo «pesce» (opzione baccalà). La pastella non è scritta sulla carta: non si indovina. */ },
  { id: "tagliere", cat: "antipasti", name: "Tagliere di salumi e formaggi al coltello, per due",
    desc: { it: "Salumi e formaggi tagliati al coltello, per due persone", en: "Cured meats and cheeses, hand-sliced, for two" },
    price: 22, allergens: ["milk"], diet: [], frozen: false, takeaway: true },
  { id: "misto-vegetale", cat: "antipasti", name: "Gran misto vegetale",
    desc: { it: "Verdure grigliate miste", en: "Mixed grilled vegetables" },
    price: 9, allergens: [], diet: ["vegetarian", "vegan", "glutenfree"], frozen: false, takeaway: true },
  { id: "prosciutto-bufala", cat: "antipasti", name: "Prosciutto e bufala",
    desc: { it: "Prosciutto e mozzarella di bufala", en: "Prosciutto and buffalo mozzarella" },
    price: 12, allergens: ["milk"], diet: ["glutenfree"], frozen: false, takeaway: true },
  { id: "bresaola", cat: "antipasti", name: "Bresaola, rucola e parmigiano",
    desc: { it: "Bresaola con rucola e scaglie di parmigiano", en: "Bresaola (air-dried beef) with rocket and Parmesan" },
    price: 10, allergens: ["milk"], diet: ["glutenfree"], frozen: false, takeaway: true },
  { id: "caprese", cat: "antipasti", name: "Caprese con mozzarella di bufala",
    desc: { it: "Pomodoro e mozzarella di bufala", en: "Tomato and buffalo mozzarella" },
    price: 10, allergens: ["milk"], diet: ["vegetarian", "glutenfree"], frozen: false, takeaway: true },

  /* ------------------------------- PRIMI -------------------------------- */
  { id: "fregnacce", cat: "primi", name: "Fregnacce Zi' Mberto", house: true,
    desc: { it: "La pasta della casa, con sugo vegetariano", en: "The house pasta, with a vegetarian sauce" },
    pending: "[DA CONFERMARE: com'è fatto il sugo]",
    price: 12, allergens: ["gluten"], diet: ["vegetarian"], frozen: false, takeaway: true },
  { id: "amatriciana", cat: "primi", name: "Bucatini amatriciana",
    desc: { it: "Guanciale e pomodoro", en: "Guanciale (cured pork cheek) and tomato" },
    note: { en: "In Rome, a classic from Amatrice: guanciale, tomato and pecorino.\nTraditionally served with bucatini, the long hollow pasta." },
    price: 12, allergens: ["gluten"], diet: [], frozen: false, takeaway: true },
  { id: "gricia", cat: "primi", name: "Mezze maniche alla gricia",
    desc: { it: "Pecorino, guanciale e pepe nero", en: "Pecorino, guanciale and black pepper" },
    note: { en: "In Rome, gricia is the “white” amatriciana: no tomato at all.\nJust guanciale, pecorino and plenty of black pepper." },
    price: 12, allergens: ["gluten", "milk"], diet: [], frozen: false, takeaway: true },
  { id: "cacio-pepe", cat: "primi", name: "Tonnarelli cacio e pepe",
    desc: { it: "Pecorino e pepe macinato", en: "Pecorino and ground black pepper" },
    note: { en: "In Rome, cacio e pepe is made with cheese, pepper and pasta water, never cream.\nToss it well: the pecorino turns into a silky sauce." },
    price: 12, allergens: ["gluten", "milk"], diet: [], frozen: false, takeaway: true },
  { id: "orecchiette", cat: "primi", name: "Orecchiette con broccoli e salsiccia",
    desc: { it: "Broccoli e salsiccia", en: "Broccoli and sausage" },
    price: 12, allergens: ["gluten"], diet: [], frozen: false, takeaway: true },
  { id: "ortolana", cat: "primi", name: "Spaghetti ortolana",
    desc: { it: "Verdure fresche", en: "Fresh vegetables" },
    price: 10, allergens: ["gluten"], diet: ["vegetarian"], frozen: false, takeaway: true },
  { id: "gnocchi", cat: "primi", name: "Gnocchi con le spuntature o alla sorrentina",
    desc: { it: "Due varianti allo stesso prezzo", en: "Two versions, same price" },
    variants: [
      { id: "spuntature", label: { it: "Con le spuntature (spuntature di maiale e salsiccia)", en: "With pork ribs and sausage" }, price: 14, allergens: [] },
      { id: "sorrentina", label: { it: "Alla sorrentina (pomodoro, mozzarella e basilico)", en: "Sorrentina style (tomato, mozzarella and basil)" }, price: 14, allergens: ["milk"] }
    ],
    allergens: ["gluten"], diet: [], frozen: false, takeaway: true },
  { id: "carbonara", cat: "primi", name: "Spaghetti alla carbonara",
    desc: { it: "Uova, guanciale e pecorino", en: "Egg, guanciale and pecorino" },
    note: { en: "In Rome, carbonara means egg, guanciale, pecorino and pepper, never cream.\nEat it right away, while the sauce is still silky." },
    price: 12, allergens: ["gluten", "eggs", "milk"], diet: [], frozen: false, takeaway: true },
  { id: "casareccia", cat: "primi", name: "Casareccia cicoria e pecorino",
    desc: { it: "Pasta fatta in casa con cicoria e pecorino", en: "Homemade pasta with chicory and pecorino" },
    price: 12, allergens: ["gluten", "milk"], diet: [], frozen: false, takeaway: true },

  /* ------------------------------ SECONDI ------------------------------- */
  { id: "saltimbocca", cat: "secondi", name: "Saltimbocca alla romana",
    desc: { it: "Vitello con prosciutto e salvia", en: "Veal with prosciutto and sage" },
    note: { en: "In Rome, “saltimbocca” means “jumps in the mouth”.\nA thin veal slice topped with prosciutto and sage, cooked quickly in a pan." },
    price: 14, allergens: [], diet: [], frozen: false, takeaway: true },
  { id: "coda", cat: "secondi", name: "Coda alla vaccinara",
    desc: { it: "Coda di bue alla romana", en: "Roman-style oxtail" },
    note: { en: "In Rome, this is the classic slow-cooked oxtail stew of the old slaughterhouse district.\nKeep some bread for the sauce." },
    price: 12, allergens: [], diet: [], frozen: false, takeaway: true },
  { id: "trippa", cat: "secondi", name: "Trippa alla romana",
    desc: { it: "Trippa alla romana", en: "Roman-style tripe" },
    note: { en: "In Rome, tripe is a long-loved trattoria dish, simmered in a tomato sauce.\nBest with bread and a glass of red." },
    price: 12, allergens: [], diet: [], frozen: false, takeaway: true },
  { id: "straccetti", cat: "secondi", name: "Straccetti rucola e parmigiano",
    desc: { it: "Manzo con rucola e parmigiano", en: "Beef strips with rocket and Parmesan" },
    note: { en: "In Rome, “straccetti” (little rags) are thin strips of beef, seared quickly,\nthen served over fresh rocket." },
    price: 14, allergens: ["milk"], diet: [], frozen: false, takeaway: true },
  { id: "scaloppine", cat: "secondi", name: "Scaloppine al limone",
    desc: { it: "Vitello al limone", en: "Veal escalopes with lemon" },
    price: 12, allergens: [], diet: [], frozen: false, takeaway: true },
  { id: "bistecca", cat: "secondi", name: "Bistecca alla griglia",
    desc: { it: "Bistecca alla griglia", en: "Grilled beefsteak" },
    price: 18, allergens: [], diet: [], frozen: false, takeaway: true },
  { id: "baccala-ceci", cat: "secondi", name: "Baccalà con ceci*",
    desc: { it: "Baccalà con ceci", en: "Salt cod with chickpeas" },
    price: 14, allergens: ["fish"], diet: [], frozen: true, takeaway: true },
  { id: "involtini", cat: "secondi", name: "Involtini di nonna",
    desc: { it: "Involtini di manzo con mortadella, pomodoro e pangrattato", en: "Beef rolls with mortadella, tomato and breadcrumbs" },
    price: 12, allergens: ["gluten"], diet: [], frozen: false, takeaway: true },
  { id: "abbacchio", cat: "secondi", name: "Abbacchio allo scottadito",
    desc: { it: "Agnello alla griglia", en: "Grilled lamb chops" },
    note: { en: "In Rome, “scottadito” means “finger-burner”: lamb chops eaten hot off the grill,\nwith your fingers." },
    price: 16, allergens: [], diet: [], frozen: false, takeaway: true },
  { id: "polpette", cat: "secondi", name: "Polpette al sugo",
    desc: { it: "Polpette al sugo", en: "Meatballs in tomato sauce" },
    price: 12, allergens: [], diet: [], frozen: false, takeaway: true },

  /* ------------------------------ CONTORNI (5 €) ------------------------ */
  { id: "cicoria", cat: "contorni", name: "Cicoria ripassata",
    desc: { it: "Cicoria ripassata", en: "Sautéed chicory" },
    note: { en: "In Rome, “ripassata” means boiled first, then sautéed in a pan." },
    price: 5, allergens: [], diet: [], frozen: false, takeaway: true },
  { id: "insalata", cat: "contorni", name: "Insalata mista",
    desc: { it: "Insalata mista", en: "Mixed salad" },
    price: 5, allergens: [], diet: ["vegetarian", "vegan", "glutenfree"], frozen: false, takeaway: true },
  { id: "patate", cat: "contorni", name: "Patate al forno",
    desc: { it: "Patate al forno", en: "Roast potatoes" },
    price: 5, allergens: [], diet: [], frozen: false, takeaway: true },
  { id: "broccoletti", cat: "contorni", name: "Broccoletti ripassati",
    desc: { it: "Broccoletti ripassati", en: "Sautéed Roman broccoli" },
    note: { en: "In Rome, “ripassati” means boiled first, then sautéed in a pan." },
    price: 5, allergens: [], diet: [], frozen: false, takeaway: true },

  /* -------------------------------- DOLCI ------------------------------- */
  { id: "torta-ricotta", cat: "dolci", name: "Torta di ricotta e cioccolato",
    desc: { it: "Torta di ricotta e cioccolato", en: "Ricotta and chocolate cake" },
    price: 5, allergens: ["milk"], diet: ["vegetarian"], frozen: false, takeaway: true },
  { id: "crostata", cat: "dolci", name: "Crostata di visciole",
    desc: { it: "Crostata di visciole", en: "Sour-cherry tart" },
    note: { en: "In Rome, visciole are sour cherries, a favourite filling for a classic tart." },
    price: 5, allergens: ["gluten"], diet: ["vegetarian"], frozen: false, takeaway: true },
  { id: "tiramisu", cat: "dolci", name: "Tiramisù",
    desc: { it: "Tiramisù", en: "Tiramisù" },
    price: 5, allergens: ["gluten", "eggs", "milk"], diet: ["vegetarian"], frozen: false, takeaway: true },
  { id: "panna-cotta", cat: "dolci", name: "Panna cotta",
    desc: { it: "Panna cotta", en: "Panna cotta" },
    price: 5, allergens: ["milk"], diet: [], frozen: false, takeaway: true },
  { id: "ananas", cat: "dolci", name: "Ananas",
    desc: { it: "Ananas", en: "Pineapple" },
    price: 6, allergens: [], diet: ["vegetarian", "vegan", "glutenfree"], frozen: false, takeaway: true },

  /* --------------------------- PANE E BEVANDE --------------------------- */
  { id: "pane", cat: "bevande", name: "Pane", per: "persona",
    desc: { it: "A persona", en: "Per person" },
    price: 1, allergens: ["gluten"], diet: [], frozen: false, takeaway: false },
  { id: "vino-casa", cat: "bevande", name: "Vino della casa",
    desc: { it: "Il vino della casa", en: "The house wine" },
    variants: [
      { id: "calice", label: { it: "Calice", en: "Glass" }, price: 5, allergens: [] },
      { id: "mezzo", label: { it: "½ litro", en: "½ litre" }, price: 7, allergens: [] },
      { id: "litro", label: { it: "1 litro", en: "1 litre" }, price: 12, allergens: [] }
    ],
    allergens: ["sulphites"], diet: [], frozen: false, takeaway: false },
  { id: "acqua", cat: "bevande", name: "Acqua minerale",
    desc: { it: "Acqua minerale", en: "Mineral water" },
    price: 3, allergens: [], diet: [], frozen: false, takeaway: false },
  { id: "bibite", cat: "bevande", name: "Bibite",
    desc: { it: "Bibite", en: "Soft drinks" },
    price: 4, allergens: [], diet: [], frozen: false, takeaway: false },
  { id: "birra", cat: "bevande", name: "Birra Peroni 66 cl",
    desc: { it: "Birra Peroni, bottiglia da 66 cl", en: "Peroni beer, 66 cl bottle" },
    price: 7, allergens: ["gluten"], diet: [], frozen: false, takeaway: false },
  { id: "amari", cat: "bevande", name: "Amari e grappe",
    desc: { it: "Amari e grappe", en: "Digestifs: amari and grappa" },
    price: 4, allergens: [], diet: [], frozen: false, takeaway: false },
  { id: "caffe", cat: "bevande", name: "Caffè",
    desc: { it: "Caffè", en: "Espresso" },
    price: 2, allergens: [], diet: [], frozen: false, takeaway: false },
  { id: "cappuccino", cat: "bevande", name: "Cappuccino",
    desc: { it: "Cappuccino", en: "Cappuccino" },
    price: 4, allergens: ["milk"], diet: [], frozen: false, takeaway: false },
  { id: "olio-aceto", cat: "bevande", name: "Olio extravergine, aceto e sale", per: "persona",
    desc: { it: "A persona", en: "Per person" },
    pending: "[DA CONFERMARE: voce presente sul menù]",
    price: 2, allergens: [], diet: [], frozen: false, takeaway: false }
];

/* Carta dei vini: ancora da inserire (3 righe segnaposto). */
window.WINE_PLACEHOLDERS = 3;

/* Fuori menù di stagione, senza prezzi: [DA CONFERMARE] */
window.OFF_MENU = ["carciofi", "puntarelle", "zuppa di funghi e castagne", "spaghetti alle vongole", "polipetti alla luciana"];

/* Utilità condivise dal sito (non servono modifiche). */
window.MenuUtil = {
  byId: function (id) { return window.MENU_ITEMS.filter(function (i) { return i.id === id; })[0]; },
  byCat: function (cat) { return window.MENU_ITEMS.filter(function (i) { return i.cat === cat; }); },
  /* prezzo "da": il minore tra prezzo singolo e varianti */
  priceOf: function (item, variantId) {
    if (item.variants) {
      var v = item.variants.filter(function (x) { return x.id === variantId; })[0] || item.variants[0];
      return v.price;
    }
    return item.price;
  },
  /* allergeni effettivi (base + variante) */
  allergensOf: function (item, variantId) {
    var base = item.allergens.slice();
    if (item.variants && variantId) {
      var v = item.variants.filter(function (x) { return x.id === variantId; })[0];
      if (v) v.allergens.forEach(function (a) { if (base.indexOf(a) < 0) base.push(a); });
    }
    return base;
  },
  euro: function (n) {
    return (Math.round(n * 100) % 100 === 0 ? String(Math.round(n)) : n.toFixed(2).replace(".", ",")) + " €";
  }
};
