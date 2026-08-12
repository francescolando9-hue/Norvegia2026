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
    version: "v8.1",
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
        { t: "08:20", title: "Malpensa T1 · imbarchi A", kind: "flight", status: "info",
          meta: ["In aeroporto 2h30 prima", "Bag drop chiude 45 min prima del volo", "Schengen: nessun controllo passaporti"] },
        { t: "10:50", title: "Volo MXP → OSL · Norwegian DY1877", kind: "flight", status: "booked",
          meta: ["Arrivo 13:30", "Tariffa Flex"] },
        { t: "13:55", title: "Flytoget aeroporto → centro", kind: "transport", status: "info",
          meta: ["~25 min", "Biglietto sul posto, niente prenotazione"] },
        { t: "20:00", title: "Cena a Oslo con tuo padre", kind: "meal", status: "booked",
          meta: ["Annota indirizzo e orario esatti: non sono sul file"] }
      ],
      flex: [
        { title: "Opera di Oslo — tetto calpestabile", meta: "gratis, 20 minuti" },
        { title: "Aker Brygge e Tjuvholmen", meta: "passeggiata sul lungomare" },
        { title: "Parco Vigeland oppure museo Munch", meta: "scegli uno dei due" }
      ],
      stay: { name: "Oslo — struttura prenotata", status: "booked", place: "Oslo",
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
        { t: "10:00", title: "Volo OSL → TOS · Norwegian DY370", kind: "flight", status: "booked",
          meta: ["Arrivo 11:55", "Tariffa LowFare+"] },
        { t: "13:00", title: "Ritiro auto Sixt · aeroporto Tromsø", kind: "car", status: "booked",
          meta: [
            "Serve carta di CREDITO intestata al conducente + PIN, esibita fisicamente",
            "Prepagate e debito non accettate; preautorizzazione 2.000–2.500 €",
            "Verifica gilet alta visibilità e triangolo a bordo",
            "Chiedi come vengono addebitati pedaggi e AutoPASS e con quali commissioni",
            "One-way: riconsegna a Bodø il 21"
          ] },
        { t: "14:30", title: "Spesa e pieno · Finnsnes o Silsand", kind: "stop", status: "free",
          meta: ["A Husøy non c'è quasi nulla: né negozi né ristoranti affidabili", "Cena e colazione del 14 vanno risolte in casa"] },
        { t: "17:00", title: "Trekking HESTEN da Fjordgård", kind: "trek", status: "free",
          meta: [
            "Hesten 2–3h · 3,6 km a/r · +556 m — è la vista frontale sul Segla, LA fotografia",
            "Alternativa Segla 3–4h, più ripido, ultimo tratto esposto",
            "Arrivando alle 17:00 dopo 3h30 di guida, Hesten è la scelta ragionevole",
            "Parcheggio trailhead 250 NOK/24h con EasyPark · gratuito al porto in fondo al paese"
          ],
          map: "Segla Trail Head Fjordgård" },
        { t: "20:00", title: "Fjordgård → Husøy", kind: "drive", status: "info",
          meta: ["45–60 min, si gira intorno all'Øyfjorden", "Arrivo a casa ~21:00"] }
      ],
      flex: [
        { title: "Bergsbotn — piattaforma panoramica", meta: "sulla Strada Turistica di Senja" },
        { title: "Tungeneset e gli Okshornan", meta: "passerella sulla roccia" },
        { title: "Ersfjord — spiaggia", meta: "una delle due 'da tuffo' del viaggio" }
      ],
      stay: { name: "Casa a Husøy, Senja", status: "booked", place: "Husøy",
        meta: ["Prenotata via Booking (13–14 ago)", "DA VERIFICARE: orario check-in e come si ritirano le chiavi — arrivi tardi, ~21:00"],
        map: "Husøy Senja" },
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
          meta: ["Mangia PRIMA del safari: finisce alle 21:45"] },
        { t: "18:45", title: "Safari alci · Vesterålen Tours", kind: "activity", status: "booked",
          code: "GYG7VKQ52NV4", hasPin: true,
          meta: ["3h, fine ~21:45", "2 adulti", "Ritrovo a SORTLAND — verifica l'indirizzo esatto sul voucher GetYourGuide"] }
      ],
      flex: [
        { title: "Finestra di riserva per Hesten/Segla", meta: "se ieri il meteo l'ha fatto saltare: partenza 6:30, in auto entro le 11:15. Giornata dura ma ci sta." }
      ],
      stay: { name: "Hotel a Sortland", status: "booked", place: "Sortland",
        meta: ["Prenotato via Booking (14–15 ago)", "Nome struttura da inserire", "Dormi dove finisce il safari: eviti 1h30 verso Andenes a mezzanotte"] },
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
        { t: "11:00", title: "Check-in Thon Hotel Andrikken", kind: "stay", status: "booked",
          meta: ["Storgata 53, 8480 Andenes", "Booking 5814498621 · NOK 3.245 già pagati l'11 ago"],
          map: "Thon Hotel Andrikken Storgata 53 Andenes" },
        { t: "15:15", title: "Check-in safari balene", kind: "activity", status: "info",
          meta: ["45 min prima della partenza — da confermare con l'operatore"] },
        { t: "16:00", title: "Safari balene · capodogli", kind: "activity", status: "booked",
          code: "GYGKBF7HWQ3Z", hasPin: true, sea: true,
          meta: ["Catamarano classico, 4h, rientro ~20:00", "2 adulti (18–64)", "Verosimilmente Arctic Whale Tours / MS Alba — conferma operatore", "Vestiti a strati: è mare aperto"] },
        { t: "20:30", title: "Cena tardi ad Andenes", kind: "meal", status: "free", meta: [] }
      ],
      flex: [
        { title: "Trekking al Måtind sopra Bleik", meta: "~2h a/r, passerella, vista dall'alto su Bleiksøya. Verifica stato sentiero." },
        { title: "Safari fauna a Bleiksøya in barca", meta: "1,5h, finestra 12:00–13:30. Valore calato: puffin già partiti (~10 ago), aquile coperte dal Trollfjord, foche dallo snorkeling del 20.", optional: true }
      ],
      stay: { name: "Thon Hotel Andrikken", status: "booked", place: "Andenes",
        paid: { nok: 3245 },
        meta: ["Storgata 53, 8480 Andenes, Norvegia", "Prenotazione Booking 5814498621", "Pagato l'11 ago 2026 · NOK 3.245", "Una notte sola: il 16 si scende verso le Lofoten"],
        map: "Thon Hotel Andrikken Storgata 53 Andenes" },
      notes: [
        "Il buco della notte del 15 è chiuso: era il primo rimasto nel viaggio.",
        "Le due opzioni di mezzogiorno sono entrambe facoltative. Con check-in balene alle 15:15 la finestra è stretta."
      ]
    },

    {
      id: "G5", dow: "dom", date: "2026-08-16", dateLabel: "16 agosto",
      arc: "Andenes → Svolvær", region: "Lofoten est",
      lat: 68.2342, lon: 14.5681, wxPlace: "Svolvær",
      drive: "3h", km: "~200 km + traghetto",
      headline: "Giornata volutamente leggera. Traghetto e Trollfjord in silenzio.",
      fixed: [
        { t: "09:30", title: "Partenza da Andenes", kind: "drive", status: "info",
          meta: ["Andenes → Sortland → Melbu, ~2h15"] },
        { t: "12:00", title: "Traghetto Melbu → Fiskebøl", kind: "ferry", status: "verify",
          meta: ["25 min, corse frequenti, ~30 min di anticipo bastano", "NON si prenota: si paga con AutoPASS (lettura targa)", "DA VERIFICARE: orari della domenica 16/8"],
          map: "Melbu ferjekai" },
        { t: "13:45", title: "Arrivo a Svolvær", kind: "stop", status: "info",
          meta: ["Pomeriggio libero: check-in, porto, Svolværgeita dal basso"] },
        { t: "20:00", title: "Crociera silenziosa Trollfjord + aquile", kind: "activity", status: "todo", sea: true,
          meta: [
            "Brim Explorer, catamarano ibrido-elettrico, senza esche",
            "Il 16/8 è l'ultimo giorno con 3 corse: dal 17 sono 2/giorno",
            "VERIFICA che la partenza serale operi il 16/8/2026",
            "Piano B: mattina del 17, ma quel giorno è pieno → meglio spostare il cavallo che il Trollfjord"
          ] }
      ],
      flex: [
        { title: "Hurtigrutemuseet, Stokmarknes", meta: "MS Finnmarken del 1956 dentro un edificio di vetro e acciaio. 10:00–17:00, ~190 NOK, 1h30, a 5 min dalla strada. Miglior piano B se piove.", optional: true }
      ],
      stay: { name: "Rorbu a Svolvær o Henningsvær", status: "todo", place: "Lofoten est",
        meta: ["DA PRENOTARE — alta stagione"] },
      notes: [
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
        { t: "10:00", title: "Tour a cavallo Hov e Hovsund", kind: "activity", status: "todo",
          meta: [
            "Cavalli islandesi lungo la spiaggia artica e verso il villaggio di pescatori, fra rastrelliere del pesce e tumuli vichinghi",
            "1,5h, passo lento, nessuna esperienza richiesta",
            "LIMITE DI PESO 95 kg su tutti i tour",
            "Alla prenotazione servono nome, peso, altezza, età e livello IN INGLESE",
            "139 €/pers su GetYourGuide · sul sito diretto la mezza giornata 4h con pranzo costa 1.490 NOK/pers"
          ],
          map: "Hov Gård Gimsøy Lofoten" },
        { t: "12:30", title: "Pranzo al ristorante Låven", kind: "meal", status: "free",
          meta: ["In fattoria, a Hov Gård"] },
        { t: "14:00", title: "Haukland e Uttakleiv", kind: "stop", status: "free",
          meta: ["~45 min da Hov", "Sentiero costiero ~45 min tra le due spiagge", "Bagno se c'è sole: 15–17°C, nessun bagnino, entra gradualmente"],
          map: "Haukland Beach Lofoten" },
        { t: "17:00", title: "Haukland → Moskenes", kind: "drive", status: "info", meta: ["~1h20"] }
      ],
      flex: [],
      stay: { name: "Cozy Tipi — The LOWFO House Lofoten", status: "booked", place: "Moskenes",
        meta: ["Check-in 15:00–22:00 · check-out 10:00–11:00", "Il margine c'è: il check-in arriva fino alle 22:00", "Domattina il Reinebringen è a 10 minuti"],
        map: "Moskenes Lofoten" },
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
      headline: "Reinebringen all'alba, check-out secco alle 11:00, kayak al pomeriggio.",
      fixed: [
        { t: "06:30", title: "Reinebringen", kind: "trek", status: "free",
          meta: [
            "~2.000 scalini 'Sherpa', 1,5–2h a/r, sentiero a 10 min dal tipi",
            "Rientro entro le 9:30 per rispettare il check-out",
            "Verifica lo stato del sentiero: possibili chiusure per manutenzione. Evita con pioggia."
          ],
          map: "Reinebringen trailhead" },
        { t: "11:00", title: "Check-out dal tipi — vincolo secco", kind: "stay", status: "info", meta: [] },
        { t: "11:30", title: "Hamnøy · Sakrisøy · Reine · Å", kind: "stop", status: "free",
          meta: ["5–15 min tra i villaggi", "Å è la fine della E10"] },
        { t: "14:30", title: "Kayak guidato nel Reinefjorden", kind: "activity", status: "todo", sea: true,
          meta: [
            "Reine Paddling (Eco-Lighthouse), piccoli gruppi, kayak doppi, ~3h",
            "CHIEDI LO SLOT DEL POMERIGGIO: la mattina è del Reinebringen",
            "Scelto Reine perché il fjord è chiuso fra montagne alte: è l'opzione col meteo più affidabile"
          ] },
        { t: "18:00", title: "Reine → Ballstad", kind: "drive", status: "info", meta: ["~45 min"] }
      ],
      flex: [],
      stay: { name: "Kræmmervika Havn", status: "booked", place: "Ballstad",
        meta: ["Check-in 16:00–22:00 · check-out 06:00–11:00", "Domattina l'immersione è a 5 minuti", "Sostituisce Eliassen Rorbuer (Hamnøy)"],
        map: "Kræmmervika Havn Ballstad" },
      notes: ["Il vincolo della giornata è il check-out entro le 11:00: Reinebringen 6:30–9:30, bagagli, poi villaggi e kayak."]
    },

    {
      id: "G8", dow: "mer", date: "2026-08-19", dateLabel: "19 agosto",
      arc: "Ballstad", region: "Lofoten ovest",
      lat: 68.0736, lon: 13.5344, wxPlace: "Ballstad",
      drive: "0–1h", km: "~50 km",
      headline: "Corso muta stagna al mattino. Pomeriggio leggero per scelta.",
      fixed: [
        { t: "09:00", title: "Corso muta stagna · Dry Suit Course", kind: "dive", status: "booked",
          code: "2682", sea: true,
          meta: [
            "2 adulti · NOK 3.290 a testa · NOK 6.580 totali",
            "Il diving è a 5 min da Kræmmervika e il check-out apre alle 06:00: lo slot funziona",
            "PORTA brevetti OWD + logbook",
            "DA VERIFICARE: durata effettiva e cosa include (teoria, attrezzatura, quante immersioni). Un corso muta stagna è di norma mezza o intera giornata: se sfora, Nusfjord salta.",
            "Nota: in piano c'era un'immersione guidata in muta umida 7 mm. Il corso è un'altra cosa — più formazione, meno turismo subacqueo."
          ],
          map: "Lofoten Diving Ballstad" },
        { t: "14:00", title: "Nusfjord oppure relax e sauna", kind: "stop", status: "free",
          meta: ["Villaggio storico, ~35 min", "Biglietto d'ingresso al villaggio sul posto", "Dipende da quando finisce il corso"] }
      ],
      flex: [],
      stay: { name: "Hattvika Lodge", status: "todo", place: "Ballstad",
        meta: [
          "DA PRENOTARE — lodge di design",
          "Sauna e vasca idromassaggio NON sempre incluse: conferma il supplemento",
          "ALTERNATIVA: estendi Kræmmervika Havn ed eviti il trasloco di una notte sola"
        ],
        map: "Hattvika Lodge Ballstad" },
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
        { t: "10:00", title: "Snorkeling con le foche grigie", kind: "activity", status: "verify",
          code: "GYGMX4A9RMRF", hasPin: true, sea: true,
          meta: [
            "Lofoten Opplevelser, Dreyers gate 15, edificio giallo, Henningsvær",
            "2,5h · 2 adulti · muta STAGNA + cappuccio e guanti forniti",
            "Acqua 10–16°C, visibilità oltre 20 m",
            "⚠ BIGLIETTO NON ANCORA EMESSO e la stagione pubblicata è 10/6–15/8: il 20/8 è FUORI FINESTRA",
            "CHIAMA +47 905 81 475 oppure post@lofoten-opplevelser.no"
          ],
          map: "Lofoten Opplevelser Dreyers gate 15 Henningsvær" },
        { t: "13:00", title: "Henningsvær", kind: "stop", status: "free",
          meta: ["Il villaggio sugli isolotti, le gallerie d'arte, il celebre campo da calcio", "Pranzo al porto"],
          map: "Henningsvær Lofoten" }
      ],
      flex: [
        { title: "Slot jolly del viaggio", meta: "Se un'uscita in mare è saltata per meteo, si recupera qui: 2ª immersione o kayak." },
        { title: "Seconda immersione con Lofoten Diving", meta: "Opzionale, da prenotare. Ripete il 19: primo taglio se serve recuperare budget.", optional: true }
      ],
      stay: { name: "Lofoten ovest / Ballstad", status: "todo", place: "Lofoten ovest",
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
          map: "Moskenes ferjekai" },
        { t: "09:15", title: "Traghetto Moskenes → Bodø", kind: "ferry", status: "todo", sea: true,
          meta: ["~3h15", "POSTO AUTO DA PRENOTARE online: +250 NOK, solo 50% della capienza è prenotabile e va esaurito", "Torghatten linea 18-782"] },
        { t: "14:00", title: "Saltstraumen al picco di marea", kind: "stop", status: "verify",
          meta: ["~35 min da Bodø", "CONTROLLA L'ORARIO DEL PICCO: cambia ogni giorno"],
          map: "Saltstraumen" },
        { t: "19:00", title: "Riconsegna auto · aeroporto Bodø", kind: "car", status: "booked",
          meta: ["Di persona, in serata: niente key-drop notturno", "Incluso nel noleggio one-way Sixt"] }
      ],
      flex: [],
      stay: { name: "Bodø, vicino all'aeroporto", status: "todo", place: "Bodø",
        meta: ["DA PRENOTARE", "Il volo è alle 08:00: dormi vicino al terminal"] },
      notes: []
    },

    {
      id: "G11", dow: "sab", date: "2026-08-22", dateLabel: "22 agosto",
      arc: "Bodø → Oslo → Milano", region: "Rientro",
      lat: 67.2804, lon: 14.4050, wxPlace: "Bodø",
      drive: null, km: null,
      headline: "Sveglia presto, due voli, a casa per pranzo.",
      fixed: [
        { t: "05:45", title: "Sveglia", kind: "info", status: "info", meta: [] },
        { t: "08:00", title: "Volo BOO → OSL · Norwegian DY341", kind: "flight", status: "verify",
          meta: ["Arrivo 09:30"] },
        { t: "10:40", title: "Volo OSL → MXP · Norwegian DY1878", kind: "flight", status: "verify",
          meta: ["Arrivo 13:20", "Biglietto unico con il precedente: scalo 1h10 protetto", "PREZZO NON ANCORA CHIUSO: in budget a 400 € stimati"] }
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
    { id: "t-notte16", pri: 2, label: "Notte 16/8 — Svolvær o Henningsvær",
      why: "Rorbu in alta stagione: sparisce.", how: "Booking · ~250 € stimati", when: "entro 14/8" },
    { id: "t-trollfjord", pri: 2, label: "Crociera Trollfjord del 16/8 sera",
      why: "Il 16 è l'ultimo giorno con 3 corse. Verifica che la serale operi, poi prenota.",
      how: "brimexplorer.com · ~280 €", when: "entro 14/8",
      url: "https://brimexplorer.com/tours/silent-trollfjord-cruise" },
    { id: "t-cavallo", pri: 2, label: "Tour a cavallo Hov Gård del 17/8",
      why: "Servono nome, peso, altezza, età e livello in inglese. Limite 95 kg.",
      how: "hovgard.no · +47 97 55 95 01 · confronta col prezzo GetYourGuide", when: "entro 15/8",
      tel: "+4797559501", url: "https://hovgard.no" },
    { id: "t-kayak", pri: 2, label: "Kayak Reine Paddling del 18/8 — slot pomeriggio",
      why: "La mattina è del Reinebringen.", how: "reinepaddling.trekksoft.com · ~240 €", when: "entro 16/8",
      url: "https://reinepaddling.trekksoft.com/en" },
    { id: "t-traghetto", pri: 2, label: "Posto auto traghetto Moskenes → Bodø del 21/8",
      why: "Solo il 50% della capienza è prenotabile e in alta stagione va esaurito.",
      how: "torghatten.no linea 18-782 · +250 NOK", when: "entro 16/8",
      url: "https://www.torghatten.no/en/our-routes/18-782" },
    { id: "t-notti", pri: 3, label: "Notti 19, 20 e 21 agosto",
      why: "Hattvika Lodge (o estendi Kræmmervika), Lofoten ovest, Bodø vicino aeroporto.",
      how: "~710 € stimati in totale", when: "entro 17/8" },
    { id: "t-ritorno", pri: 3, label: "Chiudi il prezzo dei voli di ritorno",
      why: "BOO→OSL→MXP del 22/8 non è ancora acquistato: 400 € sono una stima.",
      how: "norwegian.com · LowFare+, non rimborsabile, 1 bagaglio", when: "entro 17/8",
      url: "https://www.norwegian.com" },
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
      { id: "b-ritorno", title: "BOO → OSL → MXP · DY341 + DY1878", when: "sab 22 ago · 08:00–13:20", status: "verify", meta: ["Biglietto unico, scalo 1h10 protetto", "PREZZO NON CHIUSO: da acquistare"] }
    ]},
    { group: "Auto", items: [
      { id: "b-sixt", title: "Sixt · Tromsø → Bodø, one-way", when: "13 ago 13:00 → 21 ago sera", status: "booked",
        meta: ["~9 giorni · preventivo 1.914 €", "Al ritiro: carta di CREDITO intestata al conducente, fisica, + PIN", "Preautorizzazione possibile 2.000–2.500 €", "Riconsegna di persona all'aeroporto di Bodø"] }
    ]},
    { group: "Notti prenotate", items: [
      { id: "b-oslo", title: "Oslo", when: "12 → 13 ago", status: "booked", meta: ["Nome struttura da inserire"] },
      { id: "b-husoy", title: "Casa a Husøy, Senja", when: "13 → 14 ago", status: "booked", meta: ["Via Booking", "Verifica check-in e ritiro chiavi: arrivi ~21:00"] },
      { id: "b-sortland", title: "Hotel a Sortland", when: "14 → 15 ago", status: "booked", meta: ["Via Booking", "Nome struttura da inserire"] },
      { id: "b-andrikken", title: "Thon Hotel Andrikken, Andenes", when: "15 → 16 ago", status: "booked",
        meta: ["Storgata 53, 8480 Andenes", "Prenotazione Booking 5814498621", "NOK 3.245 pagati l'11 ago 2026", "La ricevuta Booking non è fattura: per la fattura chiedi alla struttura"] },
      { id: "b-tipi", title: "Cozy Tipi — The LOWFO House, Moskenes", when: "17 → 18 ago", status: "booked", meta: ["Check-in 15:00–22:00", "Check-out 10:00–11:00"] },
      { id: "b-kraem", title: "Kræmmervika Havn, Ballstad", when: "18 → 19 ago", status: "booked", meta: ["Check-in 16:00–22:00", "Check-out 06:00–11:00"] }
    ]},
    { group: "Esperienze prenotate", items: [
      { id: "b-alci", title: "Safari alci · Vesterålen Tours", when: "ven 14 ago · 18:45 · Sortland", status: "booked",
        code: "GYG7VKQ52NV4", hasPin: true, meta: ["3h · 2 adulti · GetYourGuide", "Annota il punto d'incontro esatto"] },
      { id: "b-balene", title: "Safari balene · capodogli", when: "sab 15 ago · 16:00 · Andenes", status: "booked",
        code: "GYGKBF7HWQ3Z", hasPin: true, meta: ["4h · 2 adulti · GetYourGuide", "Catamarano classico", "Check-in ~15:15"] },
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
  budget: [
    { id: "voli", section: "Voli", lines: [
      { id: "v-mxp", label: "Milano → Oslo · DY1877 Flex", day: "12 ago", plan: 566.72, booked: true, seed: { eur: 566.72, date: "2026-07-01" } },
      { id: "v-tos", label: "Oslo → Tromsø · DY370 LowFare+", day: "13 ago", plan: 136.60, booked: true, seed: { eur: 136.60, date: "2026-07-01" } },
      { id: "v-ret", label: "Bodø → Oslo → Milano · DY341/1878", day: "22 ago", plan: 400.00, booked: false, note: "Stima: prezzo da confermare" }
    ]},
    { id: "alloggi", section: "Alloggi · 10 notti", lines: [
      { id: "a-oslo", label: "Oslo", day: "12 ago", plan: 180, booked: true },
      { id: "a-husoy", label: "Casa a Husøy, Senja", day: "13 ago", plan: 220, booked: true },
      { id: "a-sortland", label: "Hotel a Sortland", day: "14 ago", plan: 180, booked: true },
      { id: "a-andrikken", label: "Thon Hotel Andrikken, Andenes", day: "15 ago", plan: 180, booked: true,
        seed: { nok: 3245, date: "2026-08-11" }, note: "Pagato l'11 ago · Booking 5814498621" },
      { id: "a-svolvaer", label: "Rorbu a Svolvær / Henningsvær", day: "16 ago", plan: 250, booked: false },
      { id: "a-tipi", label: "Cozy Tipi, Moskenes", day: "17 ago", plan: 230, booked: true },
      { id: "a-kraem", label: "Kræmmervika Havn, Ballstad", day: "18 ago", plan: 320, booked: true },
      { id: "a-hattvika", label: "Hattvika Lodge, Ballstad", day: "19 ago", plan: 300, booked: false, note: "Oppure estendi Kræmmervika" },
      { id: "a-ovest", label: "Lofoten ovest / Ballstad", day: "20 ago", plan: 230, booked: false },
      { id: "a-bodo", label: "Bodø, vicino aeroporto", day: "21 ago", plan: 180, booked: false }
    ]},
    { id: "esperienze", section: "Esperienze", lines: [
      { id: "e-alci", label: "Safari alci · Sortland", day: "14 ago", plan: 250, booked: true },
      { id: "e-balene", label: "Safari balene · Andenes", day: "15 ago", plan: 260, booked: true },
      { id: "e-trollfjord", label: "Crociera Trollfjord · Brim Explorer", day: "16 ago", plan: 280, booked: false },
      { id: "e-cavallo", label: "Tour a cavallo · Hov Gård", day: "17 ago", plan: 278, booked: false, note: "139 €/pers su GYG; sul sito diretto 1.490 NOK/pers per 4h con pranzo" },
      { id: "e-kayak", label: "Kayak · Reine Paddling", day: "18 ago", plan: 240, booked: false },
      { id: "e-foche", label: "Snorkeling foche · Henningsvær", day: "20 ago", plan: 320, booked: true, note: "Biglietto non ancora emesso" },
      { id: "e-bleiksoya", label: "Safari fauna Bleiksøya", day: "15 ago", plan: 100, booked: false, optional: true },
      { id: "e-museo", label: "Hurtigrutemuseet, Stokmarknes", day: "16 ago", plan: 32, booked: false, optional: true }
    ]},
    { id: "immersioni", section: "Immersioni", lines: [
      { id: "i-corso", label: "Corso muta stagna · Lofoten Diving", day: "19 ago", plan: 330, booked: true,
        seed: { nok: 6580, date: "2026-08-11" }, note: "Era un'immersione guidata da 330 €: il corso costa di più" },
      { id: "i-seconda", label: "Seconda immersione", day: "20 ago", plan: 330, booked: false, optional: true }
    ]},
    { id: "trasporti", section: "Trasporti locali", lines: [
      { id: "tr-sixt", label: "Noleggio Sixt Tromsø → Bodø", day: "13–21 ago", plan: 1914, booked: true, seed: { eur: 1914, date: "2026-08-01" } },
      { id: "tr-carburante", label: "Carburante · ~1.500 km", day: "—", plan: 350, booked: false },
      { id: "tr-melbu", label: "Traghetto Melbu–Fiskebøl", day: "16 ago", plan: 30, booked: false },
      { id: "tr-moskenes", label: "Traghetto Moskenes–Bodø + posto auto", day: "21 ago", plan: 75, booked: false },
      { id: "tr-pedaggi", label: "Pedaggi e parcheggi", day: "—", plan: 60, booked: false }
    ]},
    { id: "extra", section: "Extra", lines: [
      { id: "x-cibo", label: "Cibo e ristoranti · ~10 giorni", day: "—", plan: 1200, booked: false, note: "Include la cena a Oslo, già prenotata" },
      { id: "x-varie", label: "Varie e imprevisti", day: "—", plan: 300, booked: false }
    ]}
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
  { id: "foche-stagione", day: "G9", level: "alto",
    title: "Snorkeling foche fuori dalla stagione pubblicata",
    body: "Il biglietto non è stato emesso e la stagione dichiarata dall'operatore è 10/6–15/8. Il 20/8 è fuori finestra.",
    action: "Chiama +47 905 81 475", tel: "+47 905 81 475" },

  { id: "checkout-reinebringen", day: "G7", level: "medio",
    title: "Reinebringen contro il check-out delle 11:00",
    body: "Salita e discesa sono 1h30–2h. Partendo alle 6:30 rientri verso le 9:30: restano 90 minuti per bagagli e colazione. Se parti più tardi, il margine si mangia.",
    action: null },

  { id: "trollfjord-corse", day: "G5", level: "medio",
    title: "Trollfjord: il 16 è l'ultimo giorno con tre corse",
    body: "Dal 17 agosto le partenze scendono a due al giorno. Se la serale del 16 non opera, l'alternativa cade in una giornata già piena.",
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

  { id: "corso-durata", day: "G8", level: "medio",
    title: "Durata del corso muta stagna da confermare",
    body: "Un corso muta stagna occupa di norma mezza o intera giornata. Se sfora, Nusfjord e l'eventuale trasloco a Hattvika saltano.",
    action: null }
];
