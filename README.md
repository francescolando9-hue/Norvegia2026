# Norvegia Artica · 12–22 agosto 2026

App per gestire il viaggio dal telefono: itinerario giorno per giorno, prenotazioni,
registro spese in corone, meteo per tappa, valigia. Funziona offline, si installa
sulla schermata Home, e tutto quello che scrivi resta sul dispositivo.

Vanilla JS, nessuna dipendenza, nessun passaggio di build per il deploy.

---

## Le quattro sezioni

| | |
|---|---|
| **Giorni** | Card di apertura con prossimo appuntamento e letto di stanotte, poi gli avvisi, poi due modi di guardare il viaggio: **Lista** (gli 11 giorni, con barra temporale e riga rossa sull'ora corrente) e **Mappa** (rotta schematica disegnata dalle coordinate, funziona in modalità aereo). Tocca l'intestazione di un giorno e si apre a schermo pieno: da lì scorri alla giornata successiva con il pollice. |
| **Prenota** | Le cose da chiudere in ordine di scadenza, con pulsante *Chiama* dove serve. Sotto, tutte le prenotazioni con codici e PIN copiabili, e gli allegati dei voucher. |
| **Budget** | *Piano*: preventivo, proiezione, notti aperte, cambio modificabile. *Spese*: registro reale in NOK o EUR con conversione live, avanzamento per categoria, cronologia per giorno. |
| **Pratico** | *Info*: telefoni, guida, pedaggi, trekking, link, backup, calendario, condivisione, stampa. *Valigia*: 35 voci tarate sul viaggio. *Documenti*: la cassetta — identità, guida e auto, salute, immersioni, voucher, con file e numeri. |

In alto: ricerca globale (cerca anche dentro i codici) e tema chiaro / scuro / automatico.

## Le cose che valgono davvero in viaggio

**Aggiungi al calendario.** Un `.ics` con 55 eventi e promemoria automatici un'ora prima
di ogni attività prenotata. È l'unico modo per avere notifiche vere: un'app web da sola
non può svegliarti.

**Avvisi ricalcolati.** Non è una lista scritta a mano: notti senza prenotazione e
attività ancora aperte vengono ricavate dai dati correnti. Prenoti una notte e l'avviso
sparisce da solo. Quelli di merito — la carta Sixt, la stagione delle foche, il check-out
contro il Reinebringen — li archivi a mano quando li hai sistemati.

**Documenti.** Identità, patente e noleggio, tessera sanitaria e polizza, brevetto e
logbook, voucher. File in IndexedDB, numeri nel deposito locale: si aprono senza rete e
non escono dal telefono. Non sono cifrati — la protezione è il blocco schermo.

**Mappa offline.** Nessuna tessera da scaricare: le tappe sono proiettate dalle
coordinate, con la compressione dei meridiani corretta per la latitudine (a 68°N un grado
di longitudine vale poco più di un terzo di uno di latitudine). Oslo resta fuori dal
riquadro di proposito: a 59,9°N schiacciava tutto l'artico in un grumo illeggibile.

**Registro spese in corone.** Paghi in NOK, scrivi in NOK, l'app converte. Le cose già
pagate sono precaricate.

**Stampa.** Un foglio di stile dedicato produce 14 pagine A4 pulite. Una copia stampata è
l'unica che sopravvive a un telefono scarico o perso.

**Condividi.** Passa l'itinerario, o una singola giornata, con il foglio di condivisione
del telefono.

**Offline.** Dopo la prima apertura l'app parte senza rete: giorni, mappa, documenti,
spese, tutto. Il meteo mostra l'ora dell'ultimo aggiornamento riuscito, così sai quanto
fidarti. Trascina giù dall'alto per riprovare.

## Metterla su GitHub

### Una volta sola

```bash
# 1. crea il repo su GitHub (PRIVATO, vedi nota sotto), poi qui dentro:
git init -b main
git remote add origin git@github.com:<utente>/norvegia2026.git
.\push.ps1 "Prima versione"      # su Windows; su Mac/Linux: ./push.sh
```

Poi su GitHub: **Settings → Pages → Source: GitHub Actions**. Il workflow in
`.github/workflows/pages.yml` controlla la sintassi dei moduli, verifica che la cache del
service worker sia allineata e pubblica. Dopo un minuto l'app è su
`https://<utente>.github.io/norvegia2026/`.

Sul telefono apri quell'indirizzo e fai **Aggiungi alla schermata Home**: parte a schermo
pieno, senza barra del browser, e da lì funziona anche senza rete.

### Ogni volta che cambi qualcosa

```bash
.\push.ps1 "Prenotata la notte del 16 a Svolvær"
```

Lo script (`push.ps1` su Windows, `push.sh` su Mac e Linux) allinea la cache, rigenera il file singolo, controlla la sintassi, committa e
pubblica.

### Il problema della cache, risolto

Un'app installata continua a servire la versione in cache finché il nome della cache non
cambia: è il modo classico di pubblicare un aggiornamento che nessuno vede.
`build.py` calcola quel nome da un hash del contenuto dei file, quindi cambia da solo
quando cambiano i file. Non c'è niente da ricordarsi. La GitHub Action lo verifica con
`build.py --check` e fallisce il deploy se `sw.js` è stato committato disallineato.

Quando arriva una versione nuova, l'app mostra una barra **Nuova versione disponibile**
invece di ricaricarsi sotto le mani.

### Repo privato o pubblico

Il repo è pensato per essere **pubblico senza esporre i PIN**.

I PIN dei voucher non stanno in `data.js`. Vivono in `secrets.js`, che è in `.gitignore` e
non viene mai committato. L'app li cerca in tre posti, in ordine: quello che hai scritto
sul telefono, `secrets.js` in locale, altrimenti mostra un riquadro tratteggiato **PIN da
inserire** e te lo fa scrivere una volta. Quello che scrivi resta sul dispositivo.

Restano pubblici i **codici prenotazione** (GetYourGuide e Booking) e l'itinerario. Da soli
non aprono niente — su GetYourGuide serve il PIN — ma sono comunque dati tuoi: `robots.txt`
e il `noindex` in `index.html` tengono il sito fuori dai motori di ricerca. Se questo non
ti basta, fai il repo privato: Pages su repo privati richiede il piano Pro.

### File di contorno

| File | A cosa serve |
|---|---|
| `.nojekyll` | Impedisce a Pages di passare i file per Jekyll, che altrimenti li rielabora |
| `robots.txt` | Blocca l'indicizzazione |
| `.gitignore` | Tiene fuori la build, i backup esportati e i file di sistema |
| `.github/workflows/pages.yml` | Verifica e pubblica a ogni push |
| `push.ps1` / `push.sh` | Build, controlli, commit e push in un comando |
| `secrets.example.js` | Modello per i PIN. Il vero `secrets.js` è in `.gitignore` |
| `build.py` | Allinea la cache e genera il file singolo |

### Versione a file singolo

```bash
python3 build.py
```

Produce `ViaggioNorvegia2026.html`: 160 KB con tutto dentro, da aprire direttamente dal
telefono o mandarsi via mail, senza pubblicare nulla da nessuna parte. Non ha il service
worker (richiede HTTPS) ma è autosufficiente. Senza rete i font passano ai fallback di
sistema e il meteo resta all'ultimo dato in cache.

---

## Struttura

| File | Ruolo |
|---|---|
| `data.js` | L'itinerario canonico. È l'unico file da toccare per aggiornare i contenuti. |
| `store.js` | Stato, overlay sui dati, spese, backup, allegati in IndexedDB. |
| `ui.js` | Bottom sheet, toast, campi, icone, formattazione, vibrazione. |
| `weather.js` | Open-Meteo, una richiesta per tutte le tappe, risultato in cache. |
| `views.js` | Le quattro viste, gli sheet di modifica, ricerca, generatore `.ics`. |
| `extra.js` | Mappa, documenti, avvisi calcolati, giornata a schermo pieno, condivisione. |
| `app.js` | Guscio, navigazione, tema, service worker, stato connessione. |

**I tuoi dati non vengono sovrascritti dagli aggiornamenti.** Spunte, spese, note e nomi
vivono in un overlay applicato sopra `data.js` a ogni lettura: se cambio l'itinerario,
quello che hai scritto sul telefono resta.

## Aggiornare i contenuti

Tutto in `data.js`. Un giorno:

```js
{ id:"G4", dow:"sab", date:"2026-08-15", dateLabel:"15 agosto",
  lat:69.3167, lon:16.1197, wxPlace:"Andenes",
  arc:"Sortland → Andenes", drive:"1h30", km:"103 km",
  headline:"...",
  fixed:[ { t:"16:00", title:"...", kind:"activity", status:"booked",
            code:"...", pin:"...", meta:["..."], map:"query per le mappe" } ],
  flex:[ { title:"...", meta:"...", optional:true } ],
  stay:{ name:"...", place:"...", status:"booked", meta:["..."], map:"..." },
  notes:["perché la giornata è impostata così"] }
```

`status`, sugli eventi e sui pernotti:

| valore | significato | effetto |
|---|---|---|
| `booked` | confermato | pallino pieno, promemoria nel `.ics` |
| `todo` | va prenotato | pallino vuoto rosso, il giorno risulta **aperto** |
| `verify` | prenotato ma fragile | pallino ambra, il giorno risulta **verifica** |
| `free` | attività autonoma, niente da prenotare | pallino grigio, non conta come aperto |
| `info` | riferimento temporale, non un impegno | testo attenuato |

Il badge del giorno e i pallini dello strip si calcolano da soli: *aperto* vince su
*verifica*, che vince su *chiuso*.

Nel budget ogni voce ha un `id` stabile: le spese si collegano a quello, quindi puoi
cambiare etichette e preventivi senza perdere lo storico. Una voce con `seed` viene
precaricata nel registro come già pagata.

Dopo aver modificato i dati lancia `./push.sh`: la cache del service worker si allinea
da sola, non c'è nessun numero da alzare a mano.

---

## Fonti

- `ItinerarioVacanzaNorvegia20260811v6.xlsx` — fogli Itinerario, Budget & Prenotazioni, Verifica & Alternative
- Ricevuta Booking 5814498621 — Thon Hotel Andrikken, Andenes, 15–16 ago, NOK 3.245
- Ricevuta rif. 2682 — Dry Suit Course, 19 ago 09:00, 2 adulti, NOK 6.580
- Cambio EUR/NOK ≈ 10,95 (11 ago 2026), modificabile nell'app
- Meteo: Open-Meteo, nessuna chiave necessaria
