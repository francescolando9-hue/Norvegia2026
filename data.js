/* ============================================================
   Norvegia Artica · 12–22 agosto 2026 · 2 persone
   Contenuto canonico. Le modifiche dell'utente vivono in
   store.js come overlay, così questo file resta aggiornabile.

   Fonti: ItinerarioVacanzaNorvegia20260811v6.xlsx
          Booking 5814498621 (Thon Hotel Andrikken)
          Ricevuta rif. 2682 (Dry Suit Course)
   ============================================================ */

const TRIP = {
  meta: {
    title: "Norvegia Artica",
    subtitle: "Tromsø · Senja · Vesterålen · Lofoten · Bodø",
    from: "2026-08-12",
    to: "2026-08-22",
    people: 2,
    version: "v11.0",
    source: "ItinerarioVacanzaNorvegia20260811v6.xlsx",
    fxDefault: 10.95,
    fxNote: "Cambio EUR/NOK indicativo all'11 agosto 2026 (~10,95). Cambialo e tutti gli importi in corone si riconvertono."
  },

  /* ---------------------------------------------------------- */
  days: [
    {
      id: "G1", dow: "mer", date: "2026-08-12", dateLabel: "12 agosto",
      arc: "Milano → Oslo", region: "Oslo",
      lat: 59.9139, lon: 10.7522, wxPlace: "Oslo",
      drive: null, km: null,
      headline: "Volo, mezza giornata in città, cena con tuo padre. Zero auto.",
      fixed: [
        { t: "08:20", title: "Malpensa T1 · imbarchi A", kind: "flight", status: "info", at: "mxp",
          meta: ["In aeroporto 2h30 prima", "Bag drop chiude 45 min prima del volo", "Schengen: nessun controllo passaporti"] },
        { t: "10:50", title: "Volo MXP → OSL · Norwegian DY1877", kind: "flight", status: "booked", cat: "viaggio", costo: 566.72,
          meta: ["Arrivo 13:30", "Tariffa Flex"] },
        { t: "13:55", title: "Flytoget aeroporto → centro", kind: "transport", status: "info",
          meta: ["~25 min", "Biglietto sul posto, niente prenotazione"] },
        { t: "20:00", title: "Cena a Oslo con tuo padre", kind: "meal", status: "booked", cat: "mangiare",
          meta: ["Annota indirizzo e orario esatti: non sono sul file"] }
      ],
      flex: [
        { title: "Opera di Oslo — tetto calpestabile", meta: "gratis, 20 minuti" },
        { title: "Aker Brygge e Tjuvholmen", meta: "passeggiata sul lungomare" },
        { title: "Parco Vigeland oppure museo Munch", meta: "scegli uno dei due" }
      ],
      stay: { t: "15:00", cat: "dormire", costo: 180, name: "Oslo — struttura prenotata", status: "booked", place: "Oslo",
        meta: ["Nome struttura da inserire: non è sul file"] },
      notes: ["Atterri alle 13:30 e il Flytoget mette 25 minuti: il pomeriggio in città regge senza fretta."]
    },

    {
      id: "G2", dow: "gio", date: "2026-08-13", dateLabel: "13 agosto",
      arc: "Oslo → Tromsø → Senja", region: "Senja",
      lat: 69.5347, lon: 17.4936, wxPlace: "Husøy, Senja",
      drive: "3h30", km: "~230 km",
      headline: "Trasferimento lungo e trekking in andata. La spesa la fai per strada.",
      fixed: [
        { t: "10:00", title: "Volo OSL → TOS · Norwegian DY370", kind: "flight", status: "booked", cat: "viaggio", costo: 136.6,
          meta: ["Arrivo 11:55", "Tariffa LowFare+"] },
        { t: "13:00", title: "Ritiro auto Sixt · aeroporto Tromsø", kind: "car", status: "booked", at: "sixtTos", cat: "auto", costo: 1914,
          meta: [
            "Serve carta di CREDITO intestata al conducente + PIN, esibita fisicamente",
            "Prepagate e debito non accettate; preautorizzazione 2.000–2.500 €",
            "Verifica gilet alta visibilità e triangolo a bordo",
            "Chiedi come vengono addebitati pedaggi e AutoPASS e con quali commissioni",
            "One-way: riconsegna a Bodø il 21"
          ] },
        { t: "14:30", title: "Spesa e pieno · Finnsnes o Silsand", kind: "stop", status: "free", at: "finnsnes", cat: "auto",
          meta: ["A Husøy non c'è quasi nulla: né negozi né ristoranti affidabili", "Cena e colazione del 14 vanno risolte in casa"] },
        { t: "17:00", title: "Trekking HESTEN da Fjordgård", kind: "trek", status: "free",
          meta: [
            "Hesten 2–3h · 3,6 km a/r · +556 m — è la vista frontale sul Segla, LA fotografia",
            "Alternativa Segla 3–4h, più ripido, ultimo tratto esposto",
            "Arrivando alle 17:00 dopo 3h30 di guida, Hesten è la scelta ragionevole",
            "Al trailhead NON si parcheggia più: parcheggio a pagamento vicino alla scuola, oppure gratis al porto in fondo al paese"
          ],
          at: "hesten" },
        { t: "20:00", title: "Fjordgård → Husøy", kind: "drive", status: "info",
          meta: ["45–60 min, si gira intorno all'Øyfjorden", "Arrivo a casa ~21:00"] }
      ],
      flex: [
        { title: "Bergsbotn — piattaforma panoramica", meta: "sulla Strada Turistica di Senja" },
        { title: "Tungeneset e gli Okshornan", meta: "passerella sulla roccia" },
        { title: "Ersfjord — spiaggia", meta: "una delle due 'da tuffo' del viaggio" }
      ],
      stay: { t: "21:00", cat: "dormire", costo: 220, name: "Casa a Husøy, Senja", status: "booked", place: "Husøy",
        meta: ["Prenotata via Booking (13–14 ago)", "DA VERIFICARE: orario check-in e come si ritirano le chiavi — arrivi tardi, ~21:00"],
        at: "husoy" },
      notes: [
        "Percorso tutto via terra: E8 → Nordkjosbotn → E6 → Finnsnes → ponte di Gisund → Fv862 panoramica. I traghetti Brensholmen e Gryllefjord sono esclusi: code fino a 2–3h e non prenotabili.",
        "Il bivio per Fjordgård si incontra PRIMA di Husøy arrivando da Finnsnes: il trekking va fatto in andata. Farlo il 14 mattina costerebbe 45–60 min di ritorno a vuoto."
      ]
    },

    {
      id: "G3", dow: "ven", date: "2026-08-14", dateLabel: "14 agosto",
      arc: "Senja → Sortland", region: "Vesterålen",
      lat: 68.6961, lon: 15.4133, wxPlace: "Sortland",
      drive: "4h20–4h45", km: "~330 km",
      headline: "La giornata più lunga di guida, con un appuntamento fisso alle 18:45.",
      fixed: [
        { t: "08:00", title: "Husøy fyr e giro del villaggio", kind: "trek", status: "free",
          meta: ["Sentiero al faro: 5–10 min di salita, vista a 360° sul fjord", "~250 abitanti, il villaggio-isola sul molo"] },
        { t: "12:00", title: "Partenza da Husøy — limite", kind: "drive", status: "info",
          meta: ["Mefjordvær → Finnsnes (PIENO) → E6 → Fossbakken → E10 → Gullesfjordbotn → Sortland"] },
        { t: "17:15", title: "Arrivo a Sortland · check-in e cena veloce", kind: "stop", status: "info",
          meta: [
            "Mangia PRIMA del safari: finisce alle 21:45",
            "Sortland ospita la partenza della tappa 4 del 16: in paese ci sono squadre, staff e pubblico",
            "Ristoranti pieni: se non hai un tavolo, risolvi al supermercato invece di rischiare"
          ] },
        { t: "18:45", title: "Safari alci · Vesterålen Tours", kind: "activity", status: "booked", cat: "esperienze", costo: 250,
          code: "GYG7VKQ52NV4", hasPin: true,
          at: "marina",
          meta: [
            "Prelievo sotto il tuo hotel: Strandgata 34. Non devi spostarti",
            "Sul voucher l'indirizzo è indicato come True Vesterålen Hotel: stesso civico, stesso edificio",
            "Cerca l'auto con il logo Vesterålen Tours e la targa 'Mooose' oppure 'Whale'",
            "3h, fine ~21:45 · 2 adulti",
            "Tieni il telefono a portata: avvisano loro di eventuali cambi dell'ultimo minuto"
          ] }
      ],
      flex: [
        { title: "Finestra di riserva per Hesten/Segla", meta: "se ieri il meteo l'ha fatto saltare: partenza 6:30, in auto entro le 11:15. Giornata dura ma ci sta." }
      ],
      stay: { t: "17:15", cat: "dormire", costo: 180, name: "Marina Hotel Sortland", status: "booked", place: "Sortland",
        at: "marina",
        meta: [
          "Strandgata 34, 8400 Sortland · +47 41 51 83 00",
          "Il safari alci preleva proprio qui alle 18:45: scendi e sei a posto",
          "In centro e vicino alla stazione dei bus",
          "Dormi dove finisce il safari: eviti 1h30 verso Andenes a mezzanotte"
        ] },
      notes: [
        "Husøy non è più una tappa da incastrare: ci dormi dentro. Il 14 mattina restano solo il faro e la partenza.",
        "Se fai il Segla di riserva, la partenza va data entro le 11:45 — e in quel caso Husøy salta."
      ]
    },

    {
      id: "G4", dow: "sab", date: "2026-08-15", dateLabel: "15 agosto",
      arc: "Sortland → Andenes", region: "Andøya",
      lat: 69.3167, lon: 16.1197, wxPlace: "Andenes",
      drive: "1h30", km: "103 km",
      headline: "Strada Turistica di Andøya al mattino, capodogli al pomeriggio.",
      fixed: [
        { t: "09:30", title: "Sortland → Andenes", kind: "drive", status: "info",
          meta: ["Strada Turistica Nazionale di Andøya", "Arrivo ~11:00"] },
        { t: "15:30", title: "Check-in safari balene", kind: "activity", status: "info",
          at: "awt",
          meta: [
            "Arrivo entro le 15:30 per non perdere il posto: 30 min prima della partenza",
            "Container nero di accoglienza accanto ai grandi edifici rossi del porto",
            "Vicino all'attracco del traghetto Andenes–Gryllefjord, cartello Arctic Whale Tours sull'edificio rosso",
            "Parcheggio a pochi metri dalla reception, in ordine di arrivo"
          ] },
        { t: "16:00", title: "Safari balene · capodogli", kind: "activity", status: "booked", cat: "esperienze", costo: 260,
          code: "GYGKBF7HWQ3Z", hasPin: true, sea: true,
          at: "awt",
          meta: [
            "Arctic Whale Tours · Hamnegata 75, 8480 Andenes · +47 48 15 10 97",
            "Catamarano classico, 4h, rientro ~20:00 · 2 adulti (18–64)",
            "Dal Thon Andrikken (Storgata 53) al porto sono pochi minuti",
            "Vestiti a strati: è mare aperto"
          ] },
        { t: "20:30", title: "Cena tardi ad Andenes", kind: "meal", status: "free", cat: "mangiare", meta: [] }
      ],
      flex: [
        { title: "Trekking al Måtind sopra Bleik", meta: "~2h a/r, passerella, vista dall'alto su Bleiksøya. Verifica stato sentiero." },
        { title: "Safari fauna a Bleiksøya in barca", cat: "esperienze", costo: 100, meta: "1,5h, finestra 12:00–13:30. Valore calato: puffin già partiti (~10 ago), aquile coperte dal Trollfjord, foche dallo snorkeling del 20.", optional: true }
      ],
      stay: { t: "11:00", cat: "dormire", costo: 180, name: "Thon Hotel Andrikken", status: "booked", place: "Andenes",
        checkin: "Check-in dalle 11:00",
        paid: { nok: 3245 },
        meta: ["Storgata 53, 8480 Andenes, Norvegia", "Prenotazione Booking 5814498621", "Pagato l'11 ago 2026 · NOK 3.245", "Una notte sola: il 16 si scende verso le Lofoten"],
        at: "andrikken" },
      notes: [
        "Arctic Race: oggi la tappa 3 passa da Sortland alle 15:01 e gira a nord-ovest fino alle 16:10. Tu parti verso nord alle 09:30, cinque ore prima e in direzione opposta: nessuna interferenza.",
        "Il buco della notte del 15 è chiuso: era il primo rimasto nel viaggio.",
        "Le due opzioni di mezzogiorno sono entrambe facoltative. Con check-in balene alle 15:15 la finestra è stretta."
      ]
    },

    {
      id: "G5", dow: "dom", date: "2026-08-16", dateLabel: "16 agosto",
      arc: "Andenes → Svolvær", region: "Lofoten est",
      lat: 68.2342, lon: 14.5681, wxPlace: "Svolvær",
      drive: "3h", km: "~200 km + traghetto",
      headline: "Traghetto al mattino, poi il Trollfjord in silenzio alle 18:00.",
      fixed: [
        { t: "09:00", title: "Partenza da Andenes — non più tardi", kind: "drive", status: "info",
          meta: [
            "Andenes → Sortland → Melbu, ~2h15",
            "ARCTIC RACE: oggi la tappa 4 parte da Sortland e il Sortlandbrua chiude verso le 13:00",
            "Passando da Sortland entro le 11:30 sei fuori dalla finestra di chiusura",
            "Non ci sono alternative al ponte: è l'unico collegamento fra Hinnøya e Langøya"
          ] },
        { t: "12:00", title: "Traghetto Melbu → Fiskebøl", kind: "ferry", status: "verify", cat: "viaggio", costo: 30,
          meta: [
            "25 min, corse frequenti, ~30 min di anticipo bastano",
            "NON si prenota: si paga con AutoPASS (lettura targa)",
            "DA VERIFICARE: orari della domenica 16/8",
            "Se la corsa ti ha rallentato a Sortland, qui recuperi: le corse sono ravvicinate e la crociera è alle 18:00"
          ],
          at: "melbu" },
        { t: "13:45", title: "Arrivo a Svolvær", kind: "stop", status: "info",
          meta: ["Pomeriggio libero: check-in, porto, Svolværgeita dal basso"] },
        { t: "18:00", title: "Crociera silenziosa Trollfjord + aquile", kind: "activity", status: "booked",
          at: "svolvaer", cat: "esperienze", costo: 280, sea: true,
          code: "GYG2Q9FAYL2B",
          meta: [
            "Brim Explorer · catamarano ibrido-elettrico, senza esche · in inglese",
            "3,5 ore: rientro verso le 21:30 · 2 adulti",
            "Partenza dal porto di Svolvær: il pontile esatto è sul biglietto GetYourGuide",
            "Dal Svinøya Rorbuer al porto sono pochi minuti"
          ] }
      ],
      flex: [
        { title: "Hurtigrutemuseet, Stokmarknes", cat: "esperienze", costo: 32, meta: "MS Finnmarken del 1956 dentro un edificio di vetro e acciaio. 10:00–17:00, ~190 NOK, 1h30, a 5 min dalla strada. Miglior piano B se piove.", optional: true }
      ],
      stay: { t: "14:00", cat: "dormire", costo: 250, name: "Svinøya Rorbuer", status: "booked", place: "Svolvær",
        at: "svinoya",
        meta: [
          "Gunnar Bergs vei 2, 8300 Svolvær · valutazione 9,1",
          "273 € · check-in dom 16, check-out lun 17",
          "Parcheggio gratuito, ristorante e spa in struttura",
          "Sull'isolotto di Svinøya, a pochi minuti dal porto da cui parte il Trollfjord"
        ] },
      notes: [
        "Arctic Race, tappa 4: partenza da Sortland alle 13:25, Sortlandbrua alle 13:31, poi Fv85 verso Sigerfjord. Il centro di Sortland è occupato dal villaggio di partenza già dalla mattina. Passando entro le 11:30 non incroci nulla.",
        "La zona fra Andenes e le Lofoten è povera: l'Hurtigrutemuseet è l'unica sosta programmabile. Nyksund e Stø sono splendidi ma a 1h15 di deviazione da Sortland: non entrano in una giornata che finisce col Trollfjord alle 20:00.",
        "Giornata leggera per scelta, dopo due sere lunghe di fila."
      ]
    },

    {
      id: "G6", dow: "lun", date: "2026-08-17", dateLabel: "17 agosto",
      arc: "Svolvær → Gimsøy → Haukland → Moskenes", region: "Lofoten",
      lat: 67.8917, lon: 13.0056, wxPlace: "Moskenes",
      drive: "3h", km: "~150 km",
      headline: "La giornata più carica delle Lofoten. Cavalli, spiagge, poi giù a Moskenes.",
      fixed: [
        { t: "09:00", title: "Svolvær → Hov Gård, Gimsøy", kind: "drive", status: "info",
          meta: ["~50 min sulla E10: Gimsøy è sulla strada, non è una deviazione"] },
        { t: "10:00", title: "Tour a cavallo Hov e Hovsund", kind: "activity", status: "todo", cat: "esperienze", costo: 278,
          meta: [
            "Cavalli islandesi lungo la spiaggia artica e verso il villaggio di pescatori, fra rastrelliere del pesce e tumuli vichinghi",
            "1,5h, passo lento, nessuna esperienza richiesta",
            "LIMITE DI PESO 95 kg su tutti i tour",
            "Alla prenotazione servono nome, peso, altezza, età e livello IN INGLESE",
            "139 €/pers su GetYourGuide · sul sito diretto la mezza giornata 4h con pranzo costa 1.490 NOK/pers"
          ],
          at: "hov" },
        { t: "12:30", title: "Pranzo al ristorante Låven", kind: "meal", status: "free", at: "hov", cat: "mangiare",
          meta: ["In fattoria, a Hov Gård"] },
        { t: "14:00", title: "Haukland e Uttakleiv", kind: "stop", status: "free",
          meta: ["~45 min da Hov", "Sentiero costiero ~45 min tra le due spiagge", "Bagno se c'è sole: 15–17°C, nessun bagnino, entra gradualmente"],
          at: "haukland" },
        { t: "17:00", title: "Haukland → Moskenes", kind: "drive", status: "info", meta: ["~1h20"] },
        { t: "19:30", title: "Kayak dal Cozy Tipi", kind: "activity", status: "free", cat: "esperienze", costo: 0, sea: true,
          at: "moskenes",
          meta: [
            "Messo a disposizione dalla struttura: niente da prenotare e niente da pagare",
            "Ad agosto alle 19:30 c'è ancora luce piena: la finestra regge",
            "Dipende da vento e mare: è la prima cosa che salta se la giornata è andata lunga",
            "Sostituisce il kayak guidato a Reine che era previsto il 18"
          ] }
      ],
      flex: [],
      stay: { t: "18:30", cat: "dormire", costo: 230, name: "Cozy Tipi — The LOWFO House Lofoten", status: "booked", place: "Moskenes",
        meta: ["Check-in 15:00–22:00 · check-out 10:00–11:00", "Il margine c'è: il check-in arriva fino alle 22:00", "Domattina il Reinebringen è a 10 minuti"],
        at: "moskenes" },
      notes: [
        "Henningsvær è stato tolto da oggi e spostato al 20: la giornata era ingestibile, ed è ridondante visto che il 20 ci passi comunque.",
        "Il cavallo è l'unica cosa del viaggio che non è né una barca né un trekking: il resto è sbilanciato sull'acqua."
      ]
    },

    {
      id: "G7", dow: "mar", date: "2026-08-18", dateLabel: "18 agosto",
      arc: "Moskenes → Reine → Ballstad", region: "Lofoten ovest",
      lat: 68.0736, lon: 13.5344, wxPlace: "Ballstad",
      drive: "1h30", km: "~70 km",
      headline: "Reinebringen all'alba e check-out secco alle 11:00. Pomeriggio sui villaggi.",
      fixed: [
        { t: "06:30", title: "Reinebringen", kind: "trek", status: "free",
          meta: [
            "~2.000 scalini 'Sherpa', 1,5–2h a/r, sentiero a 10 min dal tipi",
            "Rientro entro le 9:30 per rispettare il check-out",
            "Verifica lo stato del sentiero: possibili chiusure per manutenzione. Evita con pioggia."
          ],
          at: "reinebringen" },
        { t: "11:00", title: "Check-out dal tipi — vincolo secco", kind: "stay", status: "info", meta: [] },
        { t: "11:30", title: "Hamnøy · Sakrisøy · Reine · Å", kind: "stop", status: "free",
          meta: ["5–15 min tra i villaggi", "Å è la fine della E10"] },
        { t: "18:00", title: "Reine → Ballstad", kind: "drive", status: "info", meta: ["~45 min"] }
      ],
      flex: [],
      stay: { t: "18:45", cat: "dormire", costo: 320, name: "Kræmmervika Havn", status: "booked", place: "Ballstad",
        meta: [
          "Kræmmervikveien 36, 8373 Ballstad",
          "Check-in 16:00–22:00 · check-out 06:00–11:00",
          "Pagato il 26 luglio · 169,33 €",
          "Biancheria da letto a parte, ~100 NOK a testa: non è chiaro in fase di prenotazione",
          "Domattina l'immersione è a 5 minuti",
          "Sostituisce Eliassen Rorbuer (Hamnøy)"
        ],
        at: "kraem" },
      notes: [
        "Il vincolo della giornata è il check-out entro le 11:00: Reinebringen 6:30–9:30, bagagli, poi i villaggi con calma.",
        "Il kayak è passato al 17, offerto dal Cozy Tipi: qui si è liberato il pomeriggio."
      ]
    },

    {
      id: "G8", dow: "mer", date: "2026-08-19", dateLabel: "19 agosto",
      arc: "Ballstad", region: "Lofoten ovest",
      lat: 68.0736, lon: 13.5344, wxPlace: "Ballstad",
      drive: "0–1h", km: "~50 km",
      headline: "Corso muta stagna al mattino. Pomeriggio leggero per scelta.",
      fixed: [
        { t: "09:00", title: "Corso muta stagna · Dry Suit Course", kind: "dive", status: "booked", cat: "esperienze", costo: 330,
          code: "2682", sea: true,
          meta: [
            "2 adulti · NOK 3.290 a testa · NOK 6.580 totali",
            "Il diving è a 5 min da Kræmmervika e il check-out apre alle 06:00: lo slot funziona",
            "PORTA brevetti OWD + logbook",
            "DA VERIFICARE: durata effettiva e cosa include (teoria, attrezzatura, quante immersioni). Un corso muta stagna è di norma mezza o intera giornata: se sfora, Nusfjord salta.",
            "Nota: in piano c'era un'immersione guidata in muta umida 7 mm. Il corso è un'altra cosa — più formazione, meno turismo subacqueo."
          ],
          at: "diving" },
        { t: "14:00", title: "Nusfjord oppure relax e sauna", kind: "stop", status: "free", at: "nusfjord", cat: "altro",
          meta: ["Villaggio storico, ~35 min", "Biglietto d'ingresso al villaggio sul posto", "Dipende da quando finisce il corso"] }
      ],
      flex: [],
      stay: { t: "17:00", cat: "dormire", costo: 300, name: "Hattvika Lodge", status: "todo", place: "Ballstad",
        meta: [
          "DA PRENOTARE — lodge di design",
          "Sauna e vasca idromassaggio NON sempre incluse: conferma il supplemento",
          "ALTERNATIVA: estendi Kræmmervika Havn ed eviti il trasloco di una notte sola"
        ],
        at: "hattvika" },
      notes: [
        "Ultima immersione a 3 giorni dal volo: nessun vincolo di risalita.",
        "Se il corso occupa tutta la giornata, la sera resta solo la sauna. Valuta di non spostarti da Kræmmervika."
      ]
    },

    {
      id: "G9", dow: "gio", date: "2026-08-20", dateLabel: "20 agosto",
      arc: "Ballstad → Henningsvær → Ballstad", region: "Lofoten est",
      lat: 68.1553, lon: 14.2036, wxPlace: "Henningsvær",
      drive: "1h40", km: "~100 km",
      headline: "Foche grigie al mattino, Henningsvær con calma. Pomeriggio jolly del viaggio.",
      fixed: [
        { t: "08:45", title: "Partenza da Ballstad — limite", kind: "drive", status: "info",
          meta: ["~50 km / 50 min fino a Henningsvær"] },
        { t: "10:00", title: "Snorkeling con le foche grigie", kind: "activity", status: "verify", cat: "esperienze", costo: 320,
          code: "GYGMX4A9RMRF", hasPin: true, sea: true,
          meta: [
            "Lofoten Opplevelser, Dreyers gate 15, edificio giallo, Henningsvær",
            "2,5h · 2 adulti · muta STAGNA + cappuccio e guanti forniti",
            "Acqua 10–16°C, visibilità oltre 20 m",
            "⚠ BIGLIETTO NON ANCORA EMESSO e la stagione pubblicata è 10/6–15/8: il 20/8 è FUORI FINESTRA",
            "CHIAMA +47 905 81 475 oppure post@lofoten-opplevelser.no"
          ],
          at: "opplevelser" },
        { t: "13:00", title: "Henningsvær", kind: "stop", status: "free",
          meta: ["Il villaggio sugli isolotti, le gallerie d'arte, il celebre campo da calcio", "Pranzo al porto"],
          at: "henningsvaer" }
      ],
      flex: [
        { title: "Slot jolly del viaggio", meta: "Se un'uscita in mare è saltata per meteo, si recupera qui: 2ª immersione o kayak." },
        { title: "Seconda immersione con Lofoten Diving", cat: "esperienze", costo: 330, meta: "Opzionale, da prenotare. Ripete il 19: primo taglio se serve recuperare budget.", optional: true }
      ],
      stay: { t: "17:00", cat: "dormire", costo: 230, name: "Lofoten ovest / Ballstad", status: "todo", place: "Lofoten ovest",
        meta: ["DA PRENOTARE", "Resta a ovest: domani il traghetto parte da Moskenes"] },
      notes: [
        "Attenzione geografica: lo snorkeling è a HENNINGSVÆR, non a Ballstad. Da Ballstad sono ~50 km.",
        "Le tre attività prenotate hanno politiche di riprogrammazione: verificale sui voucher."
      ]
    },

    {
      id: "G10", dow: "ven", date: "2026-08-21", dateLabel: "21 agosto",
      arc: "Ballstad → Moskenes → Bodø", region: "Bodø",
      lat: 67.2804, lon: 14.4050, wxPlace: "Bodø",
      drive: "2h + traghetto 3h15", km: "~120 km",
      headline: "Traghetto al mattino, Saltstraumen se la marea collabora, auto riconsegnata in serata.",
      fixed: [
        { t: "07:00", title: "Ballstad → Moskenes", kind: "drive", status: "info",
          meta: ["~1h20, 80 km", "PIENO prima del traghetto: distributori radi"] },
        { t: "08:30", title: "Fila 'Reservert' al porto di Moskenes", kind: "ferry", status: "info",
          meta: ["45 min prima della partenza", "Registrazione passeggeri via QR"],
          at: "moskenesKai" },
        { t: "09:15", title: "Traghetto Moskenes → Bodø", kind: "ferry", status: "todo", cat: "viaggio", costo: 75, sea: true,
          meta: ["~3h15", "POSTO AUTO DA PRENOTARE online: +250 NOK, solo 50% della capienza è prenotabile e va esaurito", "Torghatten linea 18-782"] },
        { t: "14:00", title: "Saltstraumen al picco di marea", kind: "stop", status: "verify",
          meta: ["~35 min da Bodø", "CONTROLLA L'ORARIO DEL PICCO: cambia ogni giorno"],
          at: "saltstraumen" },
        { t: "19:00", title: "Riconsegna auto · aeroporto Bodø", kind: "car", status: "booked", at: "boo",
          meta: ["Di persona, in serata: niente key-drop notturno",
            "Riconsegna entro le 21: dopo le 22 i taxi all'aeroporto si diradano e il centro è a 20 min a piedi", "Incluso nel noleggio one-way Sixt"] }
      ],
      flex: [],
      stay: { t: "16:30", cat: "dormire", costo: 180, name: "Radisson Blu Hotel Bodø", status: "booked", place: "Bodø",
        at: "radisson",
        meta: [
          "Storgata 2, 8006 Bodø · +47 75 51 90 00",
          "Check-in 15:00–23:00 · check-out 00:00–12:00: nessun vincolo per il volo delle 08:00",
          "In centro, non all'aeroporto: ma il terminal è a ~2,5 km, cinque minuti di taxi",
          "Pagato 198 €",
          "L'hotel NON ha parcheggio proprio e la zona è a pagamento con APCOA, non con EasyPark: segnalate multe anche solo per scaricare i bagagli"
        ] },
      notes: [
        "Sequenza consigliata per la sera del 21: Saltstraumen, poi riconsegna dell'auto all'aeroporto, poi taxi in centro all'hotel. Così il parcheggio non è un tuo problema. Se invece tieni l'auto per la notte, devi risolvere dove metterla.",
        "Il mattino del 22 sono ~2,5 km fino al terminal: prenota il taxi la sera prima alla reception, alle 6 di sabato in strada non ne trovi."
      ]
    },

    {
      id: "G11", dow: "sab", date: "2026-08-22", dateLabel: "22 agosto",
      arc: "Bodø → Oslo → Milano", region: "Rientro",
      lat: 67.2804, lon: 14.4050, wxPlace: "Bodø",
      drive: null, km: null,
      headline: "Sveglia presto, due voli, a casa per pranzo.",
      fixed: [
        { t: "05:45", title: "Sveglia", kind: "info", status: "info", meta: [] },
        { t: "08:00", title: "Volo BOO → OSL · Norwegian DY341", kind: "flight", status: "booked", cat: "viaggio", costo: 400,
          meta: ["Arrivo 09:30"] },
        { t: "10:40", title: "Volo OSL → MXP · Norwegian DY1878", kind: "flight", status: "booked",
          meta: ["Arrivo 13:20", "Biglietto unico con il precedente: scalo 1h10 protetto", "Acquistato · 586 € per due"] }
      ],
      flex: [],
      stay: null,
      notes: ["Rientro a Malpensa alle 13:20, con margine prima del lavoro."]
    }
  ],

  /* ---------------------------------------------------------- */
  todo: [
    { id: "t-foche", pri: 1, label: "Chiama Lofoten Opplevelser per le foche del 20/8",
      why: "Biglietto non emesso e data fuori dalla stagione pubblicata (10/6–15/8). È la prenotazione più fragile del viaggio.",
      how: "+47 905 81 475 · post@lofoten-opplevelser.no", when: "subito", tel: "+4790581475" },
    { id: "t-carta", pri: 1, label: "Verifica la carta di credito per Sixt",
      why: "Sixt Norvegia accetta solo carte di credito internazionali intestate al conducente, esibite fisicamente, con PIN. Prepagate e debito no.",
      how: "Quale carta è davvero di credito, plafond libero per una preautorizzazione da 2.000–2.500 €, PIN attivo", when: "entro 13/8" },
    { id: "t-oslo", pri: 1, label: "Nome e indirizzo di alloggio e cena a Oslo",
      why: "Prenotati ma non annotati da nessuna parte. Ti servono stasera.",
      how: "Cerca le conferme Booking e il messaggio di tuo padre", when: "oggi" },
    { id: "t-cavallo", pri: 2, label: "Tour a cavallo Hov Gård del 17/8",
      why: "Servono nome, peso, altezza, età e livello in inglese. Limite 95 kg.",
      how: "hovgard.no · +47 97 55 95 01 · confronta col prezzo GetYourGuide", when: "entro 15/8",
      tel: "+4797559501", url: "https://hovgard.no" },
    { id: "t-traghetto", pri: 2, label: "Posto auto traghetto Moskenes → Bodø del 21/8",
      why: "Solo il 50% della capienza è prenotabile e in alta stagione va esaurito.",
      how: "torghatten.no linea 18-782 · +250 NOK", when: "entro 16/8",
      url: "https://www.torghatten.no/en/our-routes/18-782" },
    { id: "t-notti", pri: 3, label: "Notti 19, 20 e 21 agosto",
      why: "Hattvika Lodge (o estendi Kræmmervika), Lofoten ovest, Bodø vicino aeroporto.",
      how: "~710 € stimati in totale", when: "entro 17/8" },
    { id: "t-corso", pri: 3, label: "Durata reale del corso muta stagna del 19/8",
      why: "Se occupa tutta la giornata, Nusfjord e l'eventuale trasloco a Hattvika saltano.",
      how: "Scrivi a Lofoten Diving citando il rif. 2682", when: "entro 17/8",
      url: "https://lofoten-diving.no" },
    { id: "t-melbu", pri: 3, label: "Orari del traghetto Melbu–Fiskebøl di domenica 16/8",
      why: "Non si prenota, ma la domenica le corse si diradano e alle 20:00 hai il Trollfjord.",
      how: "App Vegvesen trafikk oppure Entur", when: "entro 16/8" },
    { id: "t-voucher", pri: 3, label: "Allega i voucher qui dentro",
      why: "Copertura dati incerta su Senja e alle Lofoten. Nella sezione Prenota ogni prenotazione accetta PDF e foto, che restano sul telefono anche offline.",
      how: "GetYourGuide, Booking, Norwegian, Sixt", when: "oggi" },
    { id: "t-alci", pri: 3, label: "Punto d'incontro esatto del safari alci a Sortland",
      why: "Il voucher lo indica ma non l'hai annotato.",
      how: "GetYourGuide → 'Vedi il riepilogo' del cod. GYG7VKQ52NV4", when: "entro 14/8" }
  ],

  /* ---------------------------------------------------------- */
  bookings: [
    { group: "Voli", items: [
      { id: "b-dy1877", title: "MXP → OSL · Norwegian DY1877", when: "mer 12 ago · 10:50–13:30", status: "booked", meta: ["Tariffa Flex", "2 persone"] },
      { id: "b-dy370", title: "OSL → TOS · Norwegian DY370", when: "gio 13 ago · 10:00–11:55", status: "booked", meta: ["Tariffa LowFare+", "2 persone"] },
      { id: "b-ritorno", title: "BOO → OSL → MXP · DY341 + DY1878", when: "sab 22 ago · 08:00–13:20", status: "verify", meta: ["Biglietto unico, scalo 1h10 protetto", "Acquistato · 586 € per due"] }
    ]},
    { group: "Auto", items: [
      { id: "b-sixt", title: "Sixt · Tromsø → Bodø, one-way", when: "13 ago 13:00 → 21 ago sera", status: "booked",
        meta: ["~9 giorni · preventivo 1.914 €", "Al ritiro: carta di CREDITO intestata al conducente, fisica, + PIN", "Preautorizzazione possibile 2.000–2.500 €", "Riconsegna di persona all'aeroporto di Bodø"] }
    ]},
    { group: "Notti prenotate", items: [
      { id: "b-oslo", title: "Oslo", when: "12 → 13 ago", status: "booked", meta: ["Nome struttura da inserire"] },
      { id: "b-husoy", title: "Casa a Husøy, Senja", when: "13 → 14 ago", status: "booked", meta: ["Via Booking", "Verifica check-in e ritiro chiavi: arrivi ~21:00"] },
      { id: "b-sortland", title: "Marina Hotel Sortland", when: "14 → 15 ago", status: "booked",
        meta: ["Strandgata 34, 8400 Sortland · +47 41 51 83 00",
               "Stesso indirizzo del prelievo del safari alci"] },
      { id: "b-andrikken", title: "Thon Hotel Andrikken, Andenes", when: "15 → 16 ago", status: "booked",
        meta: ["Storgata 53, 8480 Andenes", "Prenotazione Booking 5814498621", "NOK 3.245 pagati l'11 ago 2026", "La ricevuta Booking non è fattura: per la fattura chiedi alla struttura"] },
      { id: "b-tipi", title: "Cozy Tipi — The LOWFO House, Moskenes", when: "17 → 18 ago", status: "booked", meta: ["Check-in 15:00–22:00", "Check-out 10:00–11:00"] },
      { id: "b-kraem", title: "Kræmmervika Havn, Ballstad", when: "18 → 19 ago", status: "booked",
        meta: ["Kræmmervikveien 36, 8373 Ballstad", "Check-in 16:00–22:00 · check-out 06:00–11:00",
               "169,33 € pagati il 26 luglio"] },
      { id: "b-radisson", title: "Radisson Blu Hotel Bodø", when: "21 → 22 ago", status: "booked",
        meta: ["Storgata 2, 8006 Bodø · +47 75 51 90 00", "Check-in 15:00–23:00 · check-out 00:00–12:00",
               "198 € pagati", "Nessun parcheggio dell'hotel: zona APCOA, non EasyPark"] }
    ]},
    { group: "Esperienze prenotate", items: [
      { id: "b-alci", title: "Safari alci · Vesterålen Tours", when: "ven 14 ago · 18:45 · Sortland", status: "booked",
        code: "GYG7VKQ52NV4", hasPin: true,
        meta: ["3h · 2 adulti · GetYourGuide",
               "Prelievo sotto l'hotel, Strandgata 34: sul voucher è scritto True Vesterålen, stesso edificio",
               "Auto con logo Vesterålen Tours, targa 'Mooose' o 'Whale'"] },
      { id: "b-balene", title: "Safari balene · capodogli", when: "sab 15 ago · 16:00 · Andenes", status: "booked",
        code: "GYGKBF7HWQ3Z", hasPin: true,
        meta: ["4h · 2 adulti · GetYourGuide · catamarano classico",
               "Arctic Whale Tours · Hamnegata 75, 8480 Andenes · +47 48 15 10 97",
               "Arrivo entro le 15:30: container nero al porto, cartello sull'edificio rosso"] },
      { id: "b-corso", title: "Corso muta stagna · Dry Suit Course", when: "mer 19 ago · 09:00 · Ballstad", status: "booked",
        code: "2682", meta: ["2 adulti · NOK 3.290/pers · NOK 6.580 totali", "Porta brevetti OWD + logbook", "Verifica durata e contenuto del corso"] },
      { id: "b-foche", title: "Snorkeling con le foche grigie", when: "gio 20 ago · 10:00 · Henningsvær", status: "verify",
        code: "GYGMX4A9RMRF", hasPin: true,
        meta: ["2,5h · 2 adulti · GetYourGuide", "Lofoten Opplevelser, Dreyers gate 15, edificio giallo", "BIGLIETTO NON EMESSO · data fuori stagione pubblicata", "Chiama +47 905 81 475"] }
    ]},
    { group: "Altro", items: [
      { id: "b-cena", title: "Cena a Oslo con tuo padre", when: "mer 12 ago · sera", status: "booked", meta: ["Annota indirizzo e orario"] }
    ]}
  ],

  /* ---------------------------------------------------------- */
  /* plan = preventivo dal file. seed = importo reale già noto,
     caricato una volta sola nel registro spese.                */
  /* ------------------------------------------------------------
     Sei categorie, non trenta voci. Il preventivo sta qui, il
     costo della singola attività sta sulla tappa. Puoi cambiare
     entrambi dall'app: questi sono solo i valori di partenza.
     ------------------------------------------------------------ */
  cats: [
    { id: "dormire",    label: "Dormire",     plan: 2270,    icon: "bed" },
    { id: "viaggio",    label: "Viaggio",     plan: 1208.32, icon: "plane" },
    { id: "auto",       label: "Auto",        plan: 2562.50, icon: "car" },
    { id: "esperienze", label: "Esperienze",  plan: 2180,    icon: "star" },
    { id: "mangiare",   label: "Mangiare",    plan: 1200,    icon: "fork" },
    { id: "altro",      label: "Altro",       plan: 300,     icon: "dots" }
  ],

  budgetNotes: [
    "Il preventivo del file era 9.722,32 €. Le due prenotazioni nuove lo spostano: hotel Andenes 180 → ~296 € e immersione 330 → ~601 €, perché il corso muta stagna costa più dell'immersione guidata che era in piano.",
    "Dove recuperare, se serve: seconda immersione 330 € (ripete il 19) · Bleiksøya 100 € (valore ormai basso) · Hurtigrutemuseet 32 €. Sono i tre tagli indolori.",
    "Gli importi di Oslo, Senja, Sortland, Moskenes e Ballstad sono ancora stime: registra la spesa reale appena hai le conferme Booking.",
    "Ogni spesa che registri si somma alla voce di piano che le assegni. Quelle senza voce compaiono in fondo alla sezione, come fuori piano."
  ],

  /* ---------------------------------------------------------- */
  packing: [
    { group: "Documenti", items: [
      "Carta d'identità o passaporto",
      "Patente — serve da almeno 1 anno per il noleggio",
      "Carta di CREDITO fisica intestata al conducente, con PIN",
      "Tessera sanitaria europea",
      "Brevetti Open Water + logbook",
      "Voucher scaricati offline"
    ]},
    { group: "Mare e immersioni", items: [
      "Costume e asciugamano in microfibra",
      "Calzari o scarpette da scoglio",
      "Maschera personale, se la preferisci alla loro",
      "Computer subacqueo",
      "Sacca stagna per il telefono"
    ]},
    { group: "Trekking", items: [
      "Scarponcini con suola vera — Hesten e Reinebringen non sono passeggiate",
      "Bastoncini, utili sui 2.000 scalini del Reinebringen",
      "Zaino piccolo da giornata",
      "Borraccia"
    ]},
    { group: "Vestiario a strati", items: [
      "Giacca antivento e impermeabile",
      "Pile o piumino leggero",
      "Intimo tecnico a manica lunga",
      "Berretto e guanti sottili — sul mare aperto servono anche ad agosto",
      "Cambio completo per le uscite in barca"
    ]},
    { group: "Tecnica", items: [
      "Powerbank",
      "Supporto telefono per l'auto",
      "Cavo di ricarica lungo",
      "Mappe offline scaricate: Nordland e Troms",
      "Niente adattatore: la Norvegia usa la presa europea"
    ]},
    { group: "Varie", items: [
      "Mascherina per dormire — ad agosto la luce non se ne va mai del tutto",
      "Occhiali da sole",
      "Crema solare: sul mare il riverbero è forte",
      "Antizanzare",
      "Scorta di cibo per Husøy, dove non c'è nulla"
    ]}
  ],

  /* ---------------------------------------------------------- */
  practical: [
    { title: "Guida", items: [
      "Limite generale 80 km/h · 50 nei centri abitati · fino a 110 in superstrada.",
      "Fari anabbaglianti SEMPRE accesi, anche di giorno.",
      "Tasso alcolemico massimo 0,02%: praticamente zero.",
      "Cellulare alla guida vietato, multe severe.",
      "Precedenza culturale a pedoni e ciclisti.",
      "Per noleggiare serve la patente da almeno 1 anno.",
      "~21h di guida totali in 11 giorni. Le giornate pesanti sono il 13 (3h30), il 14 (4h30) e il 17 (3h). Nessun giorno ha più di una attività grossa."
    ]},
    { title: "Pedaggi e traghetti", items: [
      "Caselli quasi tutti automatici con lettura targa: li addebita Sixt. Chiedi come e con quali commissioni.",
      "Molti traghetti funzionano allo stesso modo (AutoPASS ferje): a Melbu non serve biglietto.",
      "Moskenes–Bodø è l'eccezione: posto auto prenotabile online, +250 NOK, fila 'Reservert' 45 min prima, registrazione passeggeri via QR."
    ]},
    { title: "Carburante", items: [
      "Caro e distributori radi. Fai il pieno a Finnsnes (13), Sortland (14), Leknes o Ballstad (21, prima di Moskenes)."
    ]},
    { title: "Dotazioni obbligatorie e soccorso", items: [
      "In auto: gilet alta visibilità + triangolo. Verificali al ritiro.",
      "NAF +47 23 21 31 00 · Falck +47 02 222 · Viking +47 06 000.",
      "Emergenze: 112 polizia · 113 ambulanza · 110 vigili del fuoco."
    ]},
    { title: "App utili", items: [
      "Vegvesen trafikk — traffico, stato strade e orari traghetti in tempo reale.",
      "Entur — trasporti pubblici e orari.",
      "EasyPark — parcheggi, incluso il trailhead di Fjordgård.",
      "Yr.no — il meteo norvegese, il più affidabile lì."
    ]},
    { title: "Luce e meteo", items: [
      "Ad agosto giornate lunghissime ma niente aurora e niente sole di mezzanotte: è finito verso il 24 luglio. Serate lunghe e crepuscolo prolungato.",
      "Lo slot jolly per recuperare un'uscita in mare saltata è il pomeriggio del 20 agosto.",
      "Le tre attività GetYourGuide hanno politiche di riprogrammazione: verificale sui voucher.",
      "Il meteo dell'app arriva da Open-Meteo e resta in cache: offline vedi l'ultimo aggiornamento riuscito."
    ]},
    { title: "Acqua e bagni", items: [
      "Haukland ed Ersfjord sono le spiagge 'da tuffo': riparate, 15–17°C col sole.",
      "Unstad e Kvalvika no: surf e correnti.",
      "Nessun bagnino da nessuna parte. Entra gradualmente.",
      "Immersioni: acqua 12–15°C. Snorkeling foche: 10–16°C, visibilità oltre 20 m."
    ]},
    { title: "Trekking", items: [
      "Hesten: 3,6 km a/r, 2–3h, +556 m. È il punto da cui vedi il Segla per intero — non lo sali, lo guardi.",
      "Segla: 4,6 km a/r, 3–4h, ripido, ultimo tratto esposto.",
      "Reinebringen: ~2.000 scalini di pietra, 1,5–2h a/r, possibili chiusure per manutenzione. Evita con maltempo.",
      "Måtind sopra Bleik: ~2h a/r su passerella. Verifica lo stato del sentiero.",
      "Husøy fyr: 5–10 min di salita, vista a 360°."
    ]}
  ],

  links: [
    { label: "Arctic Race of Norway · chiusure stradali", url: "https://www.arctic-race-of-norway.com/en/stage-4" },
    { label: "Vegvesen · traffico in tempo reale", url: "https://www.vegvesen.no/trafikk/" },
    { label: "Norwegian · voli", url: "https://www.norwegian.com" },
    { label: "Vesterålen Tours · alci", url: "https://www.vtours.no" },
    { label: "Arctic Whale Tours · balene Andenes", url: "https://www.arcticwhaletours.com/whale-safari-andenes" },
    { label: "Whalesafari Andenes · MS Reine", url: "https://whalesafari.no/trips-andenes" },
    { label: "Lofoten Opplevelser · foche", url: "https://lofoten-opplevelser.no" },
    { label: "Hov Gård · cavalli islandesi", url: "https://hovgard.no" },
    { label: "Birds & Wildlife Andøy · Bleiksøya", url: "https://www.birdsandwildlifeandoy.no/birds/puffin-safari-to-bleiksoeya" },
    { label: "Brim Explorer · Trollfjord", url: "https://brimexplorer.com/tours/silent-trollfjord-cruise" },
    { label: "Lofoten Diving · Ballstad", url: "https://lofoten-diving.no" },
    { label: "Reine Paddling · kayak", url: "https://reinepaddling.trekksoft.com/en" },
    { label: "Hurtigrutemuseet · Stokmarknes", url: "https://www.museumnord.no/hurtigrutemuseet/" },
    { label: "Kræmmervika Havn · Ballstad", url: "https://www.kraemmervika.no" },
    { label: "Hattvika Lodge · Ballstad", url: "https://www.hattvika.no" },
    { label: "Torghatten · traghetto Moskenes–Bodø", url: "https://www.torghatten.no/en/our-routes/18-782" },
    { label: "Sixt Norvegia", url: "https://www.sixt.no" }
  ],

  phones: [
    { label: "Lofoten Opplevelser", value: "+47 905 81 475" },
    { label: "Arctic Whale Tours", value: "+47 48 15 10 97" },
    { label: "Radisson Blu Bodø", value: "+47 75 51 90 00" },
    { label: "Marina Hotel Sortland", value: "+47 41 51 83 00" },
    { label: "Hov Gård", value: "+47 97 55 95 01" },
    { label: "NAF soccorso stradale", value: "+47 23 21 31 00" },
    { label: "Falck", value: "+47 02 222" },
    { label: "Viking", value: "+47 06 000" },
    { label: "Emergenze · polizia", value: "112" },
    { label: "Emergenze · ambulanza", value: "113" },
    { label: "Vigili del fuoco", value: "110" }
  ]
};

/* ============================================================
   Cassetta dei documenti — le categorie che servono a questo
   viaggio. I file restano sul telefono (IndexedDB), i numeri
   nel deposito locale. Niente di tutto questo va nel repo.
   ============================================================ */
TRIP.docs = [
  { id: "identita", label: "Identità", icon: "id",
    hint: "Ti servono al gate e al banco Sixt.",
    items: ["Carta d'identità o passaporto — Francesco", "Carta d'identità o passaporto — Mari"],
    fields: [
      { id: "ci-fra", label: "Documento Francesco, numero" },
      { id: "ci-mari", label: "Documento Mari, numero" }
    ]},

  { id: "guida", label: "Guida e auto", icon: "car",
    hint: "Il momento critico è il ritiro all'aeroporto di Tromsø, il 13.",
    items: ["Patente", "Conferma noleggio Sixt", "Foto della carta di credito usata per la cauzione"],
    fields: [
      { id: "sixt-ref", label: "Riferimento prenotazione Sixt" },
      { id: "patente", label: "Patente, numero" }
    ]},

  { id: "salute", label: "Salute e assicurazione", icon: "cross",
    hint: "Acqua a 10–16 °C, due immersioni e cinque uscite in mare: tienila a portata.",
    items: ["Tessera sanitaria / EHIC", "Polizza di viaggio", "Ricette o farmaci ricorrenti"],
    fields: [
      { id: "polizza", label: "Polizza, numero" },
      { id: "polizza-tel", label: "Centrale operativa, telefono" }
    ]},

  { id: "immersioni", label: "Immersioni", icon: "wave",
    hint: "Il 19 hai un corso muta stagna: brevetto e logbook non sono opzionali.",
    items: ["Brevetto Open Water", "Logbook", "Certificato medico, se richiesto"],
    fields: [{ id: "owd", label: "Brevetto, numero" }]},

  { id: "voucher", label: "Voucher e biglietti", icon: "ticket",
    hint: "Scaricali prima di partire: su Senja e alle Lofoten il segnale non è garantito.",
    items: ["Carte d'imbarco Norwegian", "Voucher GetYourGuide", "Conferme Booking", "Traghetto Moskenes–Bodø"],
    fields: []},

  { id: "altro", label: "Altro", icon: "clip",
    hint: "Quello che non sta nelle altre caselle.",
    items: [], fields: [] }
];

/* ============================================================
   Controlli automatici sul piano. Ogni voce viene ricalcolata
   dall'app sui dati correnti: se prenoti una notte o sposti
   un'attività, l'avviso sparisce da solo.
   ============================================================ */
TRIP.checks = [
  { id: "arn-sortland", day: "G5", level: "alto",
    title: "Arctic Race: il 16 chiudono il ponte di Sortland",
    body: "La tappa 4 parte da Sortland e attraversa il Sortlandbrua alle 13:31. È l'unico collegamento fra Hinnøya e Langøya: il tuo percorso ci passa per forza. Parti da Andenes entro le 09:00 e sei oltre Sortland verso le 11:00, prima delle chiusure. Se resti bloccato riparti verso le 14:00: il Trollfjord delle 18:00 si salva comunque.",
    action: null },

  { id: "foche-stagione", day: "G9", level: "alto",
    title: "Snorkeling foche fuori dalla stagione pubblicata",
    body: "Il biglietto non è stato emesso e la stagione dichiarata dall'operatore è 10/6–15/8. Il 20/8 è fuori finestra.",
    action: "Chiama +47 905 81 475", tel: "+47 905 81 475" },

  { id: "checkout-reinebringen", day: "G7", level: "medio",
    title: "Reinebringen contro il check-out delle 11:00",
    body: "Salita e discesa sono 1h30–2h. Partendo alle 6:30 rientri verso le 9:30: restano 90 minuti per bagagli e colazione. Se parti più tardi, il margine si mangia.",
    action: null },

  { id: "sixt-carta", day: "G2", level: "alto",
    title: "Sixt: carta di credito fisica con PIN",
    body: "Al ritiro serve una carta di credito internazionale intestata al conducente, esibita fisicamente. Prepagate e debito non sono accettate e la preautorizzazione può arrivare a 2.500 €.",
    action: null },

  { id: "husoy-spesa", day: "G2", level: "medio",
    title: "A Husøy non trovi niente da mangiare",
    body: "Cena del 13 e colazione del 14 vanno comprate a Finnsnes o Silsand mentre sei in strada. Dopo il ponte di Gisund non c'è più nulla di affidabile.",
    action: null },

  { id: "traghetto-posto", day: "G10", level: "alto",
    title: "Moskenes–Bodø: il posto auto va prenotato",
    body: "Solo metà della capienza è prenotabile online e in alta stagione si esaurisce. Senza posto rischi di restare a terra con il volo la mattina dopo.",
    action: null },

  { id: "bodo-parcheggio", day: "G10", level: "medio",
    title: "Radisson Bodø: nessun parcheggio dell'hotel",
    body: "La zona è gestita da APCOA e EasyPark non la copre. Riconsegna l'auto all'aeroporto la sera del 21 e rientra in taxi: così il problema non ti riguarda.",
    action: null },

  { id: "taxi-bodo", day: "G11", level: "medio",
    title: "Taxi per l'aeroporto la mattina del 22",
    body: "Volo alle 08:00 e 2,5 km da coprire. Alle 6 di sabato mattina in strada non ne trovi: prenotalo la sera prima alla reception.",
    action: null },

  { id: "corso-durata", day: "G8", level: "medio",
    title: "Durata del corso muta stagna da confermare",
    body: "Un corso muta stagna occupa di norma mezza o intera giornata. Se sfora, Nusfjord e l'eventuale trasloco a Hattvika saltano.",
    action: null }
];

/* ============================================================
   Registro dei luoghi.

   Prima ogni tappa portava una stringa di ricerca per le mappe e
   nient'altro. Così un luogo è un oggetto: indirizzo, telefono,
   coordinate. Le tappe lo referenziano con `at`, quindi lo stesso
   posto non va riscritto due volte e le coordinate permettono di
   numerarle sulla mappa anche offline.
   ============================================================ */
TRIP.places = {
  mxp:        { name: "Malpensa T1", addr: "Aeroporto di Milano Malpensa, Terminal 1", lat: 45.6301, lon: 8.7255 },
  osl:        { name: "Oslo Gardermoen", addr: "Oslo lufthavn, Gardermoen", lat: 60.1939, lon: 11.1004 },
  osloCentro: { name: "Oslo centro", addr: "Oslo, Norvegia", lat: 59.9139, lon: 10.7522 },
  tos:        { name: "Aeroporto di Tromsø", addr: "Tromsø lufthavn Langnes", lat: 69.6819, lon: 18.9189 },
  sixtTos:    { name: "Sixt · aeroporto di Tromsø", addr: "Flyplassvegen 31, 9016 Tromsø",
                tel: "+47 91 75 58 99", lat: 69.6805, lon: 18.9086,
                note: "Aperto fino a mezzanotte da lunedì a venerdì" },
  finnsnes:   { name: "Finnsnes", addr: "Finnsnes, Norvegia", lat: 69.2294, lon: 17.9836 },
  hesten:     { name: "Trailhead Hesten", addr: "Fjordgård, Senja", lat: 69.5085, lon: 17.6232,
                note: "Al trailhead non si parcheggia più: il parcheggio a pagamento è vicino alla scuola" },
  husoy:      { name: "Husøy", addr: "Husøy, Senja", lat: 69.5423, lon: 17.6626 },
  marina:     { name: "Marina Hotel Sortland", addr: "Strandgata 34, 8400 Sortland",
                tel: "+47 41 51 83 00", lat: 68.6924, lon: 15.4153 },
  andrikken:  { name: "Thon Hotel Andrikken", addr: "Storgata 53, 8480 Andenes",
                tel: "+47 76 14 90 90", lat: 69.3165, lon: 16.1207 },
  awt:        { name: "Arctic Whale Tours", addr: "Hamnegata 75, 8480 Andenes",
                tel: "+47 48 15 10 97", lat: 69.3241, lon: 16.1331,
                note: "Container nero al porto, accanto agli edifici rossi" },
  melbu:      { name: "Melbu ferjekai", addr: "Melbu, Norvegia", lat: 68.4987, lon: 14.8010 },
  svolvaer:   { name: "Svolvær", addr: "Svolvær, Lofoten", lat: 68.2340, lon: 14.5680 },
  svinoya:    { name: "Svinøya Rorbuer", addr: "Gunnar Bergs vei 2, 8300 Svolvær",
                lat: 68.2355, lon: 14.5745, note: "Parcheggio gratuito, ristorante, spa" },
  hov:        { name: "Hov Gård", addr: "Tore Hjortsvei 471, 8314 Gimsøysand",
                tel: "+47 97 55 95 01", lat: 68.3382, lon: 14.1104,
                note: "Il caffè della fattoria apre tardi rispetto alle uscite del mattino" },
  haukland:   { name: "Haukland", addr: "Uttakleivveien 200, 8370 Leknes", lat: 68.1986, lon: 13.5287 },
  moskenes:   { name: "Moskenes", addr: "Moskenes, Lofoten", lat: 67.8990, lon: 13.0450 },
  reinebringen:{ name: "Trailhead Reinebringen", addr: "Ramsviktunnelen, 8390 Reine", lat: 67.9223, lon: 13.0784 },
  reine:      { name: "Reine", addr: "Reine, Lofoten", lat: 67.9330, lon: 13.0900 },
  paddling:   { name: "Reine Paddling", addr: "Sverdrupsvei 9, 8390 Reine",
                tel: "+47 75 57 70 01", lat: 67.9348, lon: 13.0912, note: "Aperto 10:00–22:00" },
  kraem:      { name: "Kræmmervika Havn", addr: "Kræmmervikveien 36, 8373 Ballstad",
                tel: "+47 91 66 13 30", lat: 68.0665, lon: 13.5346,
                note: "1,5 km dal centro, sull'altro lato del porto" },
  diving:     { name: "Lofoten Diving", addr: "Øyaveien 31, 8373 Ballstad",
                tel: "+47 40 05 18 52", lat: 68.0782, lon: 13.5429,
                note: "1,5 km da Kræmmervika · scrivono su WhatsApp" },
  hattvika:   { name: "Hattvika Lodge", addr: "Hattvikveien 14, 8373 Ballstad",
                tel: "+47 90 79 98 55", lat: 68.0714, lon: 13.5479 },
  nusfjord:   { name: "Nusfjord", addr: "Nusfjord, 8380 Ramberg",
                tel: "+47 76 09 30 20", lat: 68.0353, lon: 13.3475,
                note: "Ingresso al villaggio a pagamento · bastano due ore" },
  opplevelser:{ name: "Lofoten Opplevelser", addr: "Dreyers gate 15, 8312 Henningsvær",
                tel: "+47 90 58 14 75", lat: 68.1542, lon: 14.2039, note: "Edificio giallo" },
  henningsvaer:{ name: "Henningsvær", addr: "Henningsvær, Lofoten", lat: 68.1510, lon: 14.2000 },
  ballstad:   { name: "Ballstad", addr: "Ballstad, Lofoten", lat: 68.0740, lon: 13.5340 },
  moskenesKai:{ name: "Moskenes ferjekai", addr: "Birger Eriksens vei 35, 8392 Moskenes",
                lat: 67.8999, lon: 13.0439,
                note: "Cancellazioni frequenti e traghetti pieni: il posto auto prenotato è l'unica garanzia" },
  saltstraumen:{ name: "Saltstraumen", addr: "8056 Saltstraumen", lat: 67.2313, lon: 14.6139,
                note: "Si scende a livello dell'acqua · il picco è la cosa da azzeccare" },
  boo:        { name: "Aeroporto di Bodø", addr: "Olav V gate 56, 8004 Bodø", lat: 67.2666, lon: 14.3609,
                note: "20 minuti a piedi dal centro · dopo le 22 i taxi si diradano" },
  radisson:   { name: "Radisson Blu Hotel Bodø", addr: "Storgata 2, 8006 Bodø",
                tel: "+47 75 51 90 00", lat: 67.2822, lon: 14.3751 }
};

/* ============================================================
   Pagamenti già effettuati. Entrano nel registro come spese
   normali: modificabili ed eliminabili come tutte le altre.
   `stop` è la tappa a cui appartengono, nel formato giorno/titolo.
   ============================================================ */
TRIP.paid = [
  { id: "p-mxp",    date: "2026-07-01", amount: 567,    cur: "EUR", cat: "viaggio",
    stop: "G1/Volo MXP → OSL · Norwegian DY1877", note: "Volo Milano → Oslo" },
  { id: "p-tos",    date: "2026-07-01", amount: 164,    cur: "EUR", cat: "viaggio",
    stop: "G2/Volo OSL → TOS · Norwegian DY370", note: "Volo Oslo → Tromsø" },
  { id: "p-ret",    date: "2026-08-12", amount: 586,    cur: "EUR", cat: "viaggio",
    stop: "G11/Volo BOO → OSL · Norwegian DY341", note: "Voli di ritorno" },
  { id: "p-sixt",   date: "2026-08-01", amount: 1914,   cur: "EUR", cat: "auto",
    stop: "G2/Ritiro auto Sixt · aeroporto Tromsø", note: "Noleggio Sixt, 9 giorni" },
  { id: "p-park",   date: "2026-08-12", amount: 238.50, cur: "EUR", cat: "auto",
    stop: null, note: "Parcheggio a Malpensa" },
  { id: "p-andrik", date: "2026-08-11", amount: 3245,   cur: "NOK", cat: "dormire",
    stop: "G4/stay", note: "Thon Hotel Andrikken" },
  { id: "p-svinoya",date: "2026-08-13", amount: 273,    cur: "EUR", cat: "dormire",
    stop: "G5/stay", note: "Svinøya Rorbuer" },
  { id: "p-kraem",  date: "2026-07-26", amount: 169.33, cur: "EUR", cat: "dormire",
    stop: "G7/stay", note: "Kræmmervika Havn" },
  { id: "p-bodo",   date: "2026-08-12", amount: 198,    cur: "EUR", cat: "dormire",
    stop: "G10/stay", note: "Radisson Blu Bodø" },
  { id: "p-troll",  date: "2026-08-13", amount: 245,    cur: "EUR", cat: "esperienze",
    stop: "G5/Crociera silenziosa Trollfjord + aquile", note: "Crociera Trollfjord" },
  { id: "p-corso",  date: "2026-08-11", amount: 6580,   cur: "NOK", cat: "esperienze",
    stop: "G8/Corso muta stagna · Dry Suit Course", note: "Corso muta stagna, 2 adulti" }
];
