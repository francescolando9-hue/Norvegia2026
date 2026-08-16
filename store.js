/* ============================================================
   Store — stato dell'app.
   Testo e numeri in localStorage, allegati in IndexedDB.
   Se lo storage non è disponibile si lavora in memoria e
   l'app resta comunque usabile per la sessione corrente.
   ============================================================ */

const Store = (() => {
  "use strict";

  const KEY = "vn2026:state";
  const OLD = "vn2026:v1";
  let memoryOnly = false;
  let mem = null;

  const DEFAULT = {
    v: 2,
    view: "giorni",
    tab: { budget: "piano", pratico: "info", giorni: "lista" },
    docNum: {},          // numeri di documento, solo su questo dispositivo
    checkOff: {},        // avvisi archiviati a mano
    theme: "auto",
    fx: 10.95,
    optional: true,
    done: {},        // id todo → true
    expenses: [],    // { id, date, lineId, cat, amount, cur, note, seed }
    seeded: false,
    notes: {},       // idGiorno → testo
    edits: {},       // "G1.stay.name" → valore
    extra: {},       // idGiorno → [ { id, t, title, meta } ]
    hidden: {},      // "G4.fixed.2" → true (tappe nascoste)
    stopEdit: {},    // "G4.fixed.2" → { t, title, kind, status, costo, note }
    catPlan: {},     // "dormire" → preventivo tuo, sovrascrive quello di partenza
    paid: false,     // pagamenti iniziali già caricati nel registro
    packing: {},     // chiave voce → true
    packAdd: [],     // voci aggiunte alla valigia
    wx: null         // cache meteo { at, days: {...} }
  };

  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch { memoryOnly = true; }
    if (!raw) {
      // migrazione dalla v1: cambio, spunte, importi manuali
      try {
        const old = JSON.parse(localStorage.getItem(OLD) || "null");
        if (old) {
          const s = structuredClone(DEFAULT);
          if (old.fx) s.fx = old.fx;
          if (typeof old.optional === "boolean") s.optional = old.optional;
          if (old.actual) {
            Object.entries(old.actual).forEach(([k, v]) => {
              s.expenses.push({
                id: uid(), date: TRIP.meta.from, lineId: null, cat: "extra",
                amount: v, cur: "EUR", note: "Importo dalla versione precedente · " + k
              });
            });
          }
          return s;
        }
      } catch { /* nessuna migrazione */ }
      return structuredClone(DEFAULT);
    }
    try {
      const s = JSON.parse(raw);
      return Object.assign(structuredClone(DEFAULT), s, {
        tab: Object.assign({}, DEFAULT.tab, s.tab || {}),
        docNum: s.docNum || {},
        checkOff: s.checkOff || {}
      });
    } catch {
      return structuredClone(DEFAULT);
    }
  }

  const S = mem = load();

  function save() {
    if (memoryOnly) return;
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { memoryOnly = true; }
  }

  /* data di oggi in formato ISO, calcolata sul fuso locale.
     Serve qui dentro: store.js viene caricato prima di ui.js. */
  function todayISO() {
    const n = new Date();
    return n.getFullYear() + "-" +
      String(n.getMonth() + 1).padStart(2, "0") + "-" +
      String(n.getDate()).padStart(2, "0");
  }

  const slug = t => String(t).toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28);

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------- pagamenti già fatti --------------------------
     Entrano una sola volta e poi sono spese come tutte le altre:
     modificabili ed eliminabili.
     -------------------------------------------------------- */
  function seedOnce() {
    if (S.paid) {
      migraSpese();
      return;
    }
    (TRIP.paid || []).forEach(x => {
      S.expenses.push({
        id: x.id, date: x.date, amount: x.amount, cur: x.cur,
        cat: x.cat, stop: x.stop || null, note: x.note || ""
      });
    });
    S.paid = true;
    save();
  }

  /* Le spese salvate con il modello vecchio (lineId + sezione)
     vengono ricondotte alle sei categorie. Una volta sola. */
  const CAT_VECCHIE = {
    voli: "viaggio", alloggi: "dormire", esperienze: "esperienze",
    immersioni: "esperienze", trasporti: "auto", extra: "altro",
    "x-cibo": "mangiare", "tr-melbu": "viaggio", "tr-moskenes": "viaggio"
  };
  function migraSpese() {
    let tocco = false;
    S.expenses.forEach(e => {
      if (e.lineId !== undefined || e.stopId !== undefined || e.seed !== undefined) {
        const c = CAT_VECCHIE[e.lineId] || CAT_VECCHIE[e.cat] || "altro";
        e.cat = TRIP.cats.some(x => x.id === e.cat) ? e.cat : c;
        if (e.stopId && !e.stop) e.stop = e.stopId;
        delete e.lineId; delete e.stopId; delete e.seed;
        tocco = true;
      }
      if (!TRIP.cats.some(x => x.id === e.cat)) { e.cat = "altro"; tocco = true; }
    });
    if (tocco) save();
  }

  /* ---------- numeri di documento --------------------------
     Restano su questo dispositivo. Entrano nel backup JSON:
     è comodo per cambiare telefono, ma vuol dire che quel file
     va trattato come un documento, non come un promemoria.
     -------------------------------------------------------- */
  function docNum(id) { return S.docNum[id] || ""; }
  function setDocNum(id, v) {
    const t = String(v || "").trim();
    if (t) S.docNum[id] = t; else delete S.docNum[id];
    save();
  }

  /* ---------- avvisi automatici ---------------------------
     Un avviso vive finché la condizione che lo genera è vera.
     Prenota la notte o segna il todo e sparisce da solo;
     "checkOff" serve solo per zittire quelli senza condizione.
     -------------------------------------------------------- */
  function checks() {
    const out = [];
    /* Gli avvisi dei giorni già passati non servono più: a metà
       viaggio la carta di credito per Sixt è storia, non un
       promemoria. Restano solo oggi e i giorni a venire. */
    const oggi = todayISO();
    const passato = id => {
      const d = TRIP.days.find(x => x.id === id);
      return d && d.date < oggi;
    };

    // avvisi dichiarati nei dati, ancora pertinenti
    TRIP.checks.forEach(c => {
      if (S.checkOff[c.id] || passato(c.day)) return;
      out.push(Object.assign({ kind: "fisso" }, c));
    });

    // notti ancora aperte: calcolato, non dichiarato
    const aperte = days().filter(d => d.stay && d.stay.status === "todo" && d.date >= oggi);
    aperte.forEach(d => out.push({
      id: "notte-" + d.id, kind: "calcolato", day: d.id,
      level: aperte.length > 2 ? "alto" : "medio",
      title: "Notte del " + d.dateLabel + " senza prenotazione",
      body: d.stay.name + " · " + d.stay.place + ". In alta stagione le sistemazioni alle Lofoten si esauriscono.",
      action: null
    }));

    // attività da prenotare con una data ravvicinata
    days().filter(d => d.date >= oggi).forEach(d => d.fixed.filter(f => f.status === "todo").forEach(f => out.push({
      id: "att-" + d.id + "-" + slug(f.title), kind: "calcolato", day: d.id,
      level: "medio",
      title: f.title + " non è prenotata",
      body: d.dow + " " + d.dateLabel + (f.t ? ", ore " + f.t : "") + ".",
      action: null
    })));

    const rank = { alto: 0, medio: 1, basso: 2 };
    const ordine = TRIP.days.map(d => d.id);
    return out.sort((a, b) =>
      (rank[a.level] - rank[b.level]) || (ordine.indexOf(a.day) - ordine.indexOf(b.day)));
  }
  function muteCheck(id) { S.checkOff[id] = true; save(); }

  /* ---------- PIN dei voucher -----------------------------
     Non stanno nei dati pubblici. L'app li cerca in tre posti,
     in ordine: quello che hai scritto sul telefono, il file
     secrets.js locale, altrimenti niente e te lo chiede.
     -------------------------------------------------------- */
  function pinFor(code) {
    if (!code) return null;
    const mine = S.edits["pin." + code];
    if (mine) return mine;
    if (typeof SECRETS !== "undefined" && SECRETS.pins && SECRETS.pins[code]) return SECRETS.pins[code];
    return null;
  }
  function setPin(code, value) { setEdit("pin." + code, value); }

  /* ---------- overlay sui dati canonici ------------------- */
  const getEdit = (path, fallback) => (path in S.edits ? S.edits[path] : fallback);

  function setEdit(path, value) {
    const v = typeof value === "string" ? value.trim() : value;
    if (v === "" || v == null) delete S.edits[path];
    else S.edits[path] = v;
    save();
  }

  /** Giorno con le modifiche dell'utente applicate. */
  function day(d) {
    const o = Object.assign({}, d);
    o.headline = getEdit(`${d.id}.headline`, d.headline);
    o.fixed = d.fixed
      .map((f, i) => {
        const ref = `${d.id}.fixed.${i}`;
        return Object.assign({}, f, S.stopEdit[ref] || {}, { _ref: ref });
      })
      .filter(f => !S.hidden[f._ref])
      .concat((S.extra[d.id] || []).map(e => Object.assign({
        kind: "custom", status: "free"
      }, e, {
        meta: Array.isArray(e.meta) ? e.meta : (e.meta ? [e.meta] : []),
        _custom: true, _ref: `${d.id}.extra.${e.id}`
      })));
    if (d.stay) {
      o.stay = Object.assign({}, d.stay, {
        name: getEdit(`${d.id}.stay.name`, d.stay.name),
        status: getEdit(`${d.id}.stay.status`, d.stay.status),
        costo: getEdit(`${d.id}.stay.costo`, d.stay.costo),
        _ref: `${d.id}.stay`
      });
      if (S.hidden[`${d.id}.stay`]) o.stay = null;
    }
    o.flex = (d.flex || [])
      .map((f, i) => Object.assign({}, f, { _ref: `${d.id}.flex.${i}` }))
      .filter(f => !S.hidden[f._ref]);
    o.userNote = S.notes[d.id] || "";
    return o;
  }

  const days = () => TRIP.days.map(day);

  /* ---------- modifica delle tappe ------------------------
     Le tappe che arrivano dai dati non si cancellano davvero:
     si nascondono, così un aggiornamento dei dati non ti
     restituisce roba che avevi tolto, e puoi sempre ripristinare.
     Quelle che aggiungi tu vivono in S.extra e si eliminano.
     -------------------------------------------------------- */
  function patchStop(ref, patch) {
    if (!ref) return;
    if (ref.includes(".extra.")) {
      const [dayId, , id] = ref.split(".");
      const arr = S.extra[dayId] || [];
      const e = arr.find(x => x.id === id);
      if (e) Object.assign(e, patch);
    } else if (ref.endsWith(".stay")) {
      const dayId = ref.split(".")[0];
      Object.entries(patch).forEach(([k, v]) => setEdit(`${dayId}.stay.${k}`, v));
      return;
    } else {
      S.stopEdit[ref] = Object.assign({}, S.stopEdit[ref] || {}, patch);
    }
    save();
  }

  function hideStop(ref) {
    if (ref && ref.includes(".extra.")) {
      const [dayId, , id] = ref.split(".");
      S.extra[dayId] = (S.extra[dayId] || []).filter(x => x.id !== id);
    } else {
      S.hidden[ref] = true;
      delete S.stopEdit[ref];
    }
    save();
  }

  function addStop(dayId, obj) {
    S.extra[dayId] = S.extra[dayId] || [];
    S.extra[dayId].push(Object.assign({ id: uid(), t: "12:00", status: "free", kind: "stop" }, obj));
    save();
  }

  /** Quante tappe hai nascosto in una giornata (per il ripristino). */
  function hiddenIn(dayId) {
    return Object.keys(S.hidden).filter(k => k.startsWith(dayId + ".") && S.hidden[k]).length;
  }
  function restoreDay(dayId) {
    Object.keys(S.hidden).forEach(k => { if (k.startsWith(dayId + ".")) delete S.hidden[k]; });
    Object.keys(S.stopEdit).forEach(k => { if (k.startsWith(dayId + ".")) delete S.stopEdit[k]; });
    save();
  }

  /* ---------- categorie ------------------------------------
     Sei, fisse, con un preventivo che puoi cambiare.
     -------------------------------------------------------- */
  function cats() {
    return TRIP.cats.map(c => Object.assign({}, c, {
      plan: S.catPlan[c.id] != null ? S.catPlan[c.id] : c.plan
    }));
  }
  function catOf(id) { return cats().find(c => c.id === id) || cats()[cats().length - 1]; }
  function setCatPlan(id, v) {
    const n = Number(v);
    if (isNaN(n) || n < 0) return;
    S.catPlan[id] = n;
    save();
  }

  /* ---------- spese --------------------------------------- */
  function addExpense(e) {
    S.expenses.push(Object.assign({ id: uid(), cur: "EUR", cat: "altro", note: "", stop: null }, e));
    save();
  }
  function updateExpense(id, patch) {
    const e = S.expenses.find(x => x.id === id);
    if (e) { Object.assign(e, patch); save(); }
  }
  function removeExpense(id) {
    S.expenses = S.expenses.filter(x => x.id !== id);
    save();
  }
  const toEur = e => (e.cur === "NOK" ? e.amount / S.fx : e.amount);

  const expensesOnStop = key => S.expenses.filter(e => e.stop === key);
  const spentOnStop = key => expensesOnStop(key).reduce((a, e) => a + toEur(e), 0);
  const expensesInCat = id => S.expenses.filter(e => e.cat === id);
  const spentInCat = id => expensesInCat(id).reduce((a, e) => a + toEur(e), 0);

  /** Chiave stabile di una tappa: "G4/titolo" oppure "G4/stay". */
  function stopKey(dayId, f) {
    if (!f) return null;
    if (f.isStay || f._ref === dayId + ".stay") return dayId + "/stay";
    return dayId + "/" + (f.id || f.title);
  }

  /* Tutte le tappe del viaggio che hanno un costo previsto,
     con quanto ci hai già speso sopra. */
  function stopsWithCost() {
    const out = [];
    days().forEach(d => {
      d.fixed.forEach(f => {
        if (f.costo == null) return;
        const key = stopKey(d.id, f);
        out.push({ day: d, f, key, cat: f.cat || "altro", costo: f.costo, spent: spentOnStop(key) });
      });
      if (d.stay && d.stay.costo != null) {
        const key = d.id + "/stay";
        out.push({ day: d, f: d.stay, key, cat: "dormire", costo: d.stay.costo, spent: spentOnStop(key) });
      }
    });
    return out;
  }

  /* Proiezione per categoria:
     quello che hai già speso, più i costi previsti delle tappe
     non ancora pagate. Se il totale resta sotto il preventivo,
     vale il preventivo: significa che qualcosa deve ancora uscire. */
  function catTotals(id) {
    const c = catOf(id);
    const spent = spentInCat(id);
    const daPagare = stopsWithCost()
      .filter(x => x.cat === id && x.spent === 0)
      .reduce((a, x) => a + x.costo, 0);
    const proj = Math.max(spent + daPagare, c.plan);
    return { cat: c, plan: c.plan, spent, daPagare, proj };
  }

  function totals() {
    let plan = 0, spent = 0, proj = 0;
    cats().forEach(c => {
      const t = catTotals(c.id);
      plan += t.plan; spent += t.spent; proj += t.proj;
    });
    return { plan, spent, proj, delta: proj - plan, residuo: Math.max(0, proj - spent) };
  }

  /* ---------- extra di una giornata ------------------------
     Extra = speso quel giorno e non appartenente a nessuna
     tappa in programma di quella giornata.
     -------------------------------------------------------- */
  function dayStopKeys(dayId) {
    const d = days().find(x => x.id === dayId);
    if (!d) return [];
    const keys = d.fixed.map(f => stopKey(dayId, f));
    if (d.stay) keys.push(dayId + "/stay");
    return keys;
  }

  function extrasOn(date) {
    const d = TRIP.days.find(x => x.date === date);
    if (!d) return S.expenses.filter(e => e.date === date && !e.stop);
    const keys = dayStopKeys(d.id);
    return S.expenses.filter(e => e.date === date && (!e.stop || !keys.includes(e.stop)));
  }
  const extraTotal = date => extrasOn(date).reduce((a, e) => a + toEur(e), 0);

  function extrasByDay() {
    return TRIP.days.map(d => {
      const voci = extrasOn(d.date);
      return { day: d, voci, tot: voci.reduce((a, e) => a + toEur(e), 0) };
    }).filter(x => x.voci.length);
  }
  const extrasTotalAll = () => extrasByDay().reduce((a, x) => a + x.tot, 0);

  /* ---------- allegati (IndexedDB) ------------------------ */
  const DB = "vn2026", TABLE = "files";
  let dbp = null;

  function db() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      if (!("indexedDB" in window)) return rej(new Error("IndexedDB non disponibile"));
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains(TABLE)) {
          const st = d.createObjectStore(TABLE, { keyPath: "id" });
          st.createIndex("owner", "owner");
        }
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }

  async function tx(mode, fn) {
    const d = await db();
    return new Promise((res, rej) => {
      const t = d.transaction(TABLE, mode);
      const out = fn(t.objectStore(TABLE));
      t.oncomplete = () => res(out && out.result !== undefined ? out.result : out);
      t.onerror = () => rej(t.error);
    });
  }

  const Files = {
    async add(owner, file) {
      const rec = { id: uid(), owner, name: file.name, type: file.type, size: file.size, ts: Date.now(), blob: file };
      await tx("readwrite", st => st.put(rec));
      return rec;
    },
    async list(owner) {
      const d = await db();
      return new Promise((res, rej) => {
        const out = [];
        const t = d.transaction(TABLE, "readonly");
        const rq = t.objectStore(TABLE).index("owner").openCursor(IDBKeyRange.only(owner));
        rq.onsuccess = () => {
          const c = rq.result;
          if (c) { out.push(c.value); c.continue(); } else res(out);
        };
        rq.onerror = () => rej(rq.error);
      });
    },
    async counts() {
      const d = await db();
      return new Promise((res, rej) => {
        const map = {};
        const t = d.transaction(TABLE, "readonly");
        const rq = t.objectStore(TABLE).openCursor();
        rq.onsuccess = () => {
          const c = rq.result;
          if (c) { map[c.value.owner] = (map[c.value.owner] || 0) + 1; c.continue(); } else res(map);
        };
        rq.onerror = () => rej(rq.error);
      });
    },
    remove(id) { return tx("readwrite", st => st.delete(id)); },
    async quota() {
      if (!navigator.storage || !navigator.storage.estimate) return null;
      try { return await navigator.storage.estimate(); } catch { return null; }
    }
  };

  /* ---------- backup -------------------------------------- */
  function exportJson() {
    return JSON.stringify({
      app: "NorvegiaArtica",
      version: TRIP.meta.version,
      exportedAt: new Date().toISOString(),
      state: S
    }, null, 2);
  }

  function importJson(text) {
    const obj = JSON.parse(text);
    const incoming = obj.state || obj;
    if (!incoming || typeof incoming !== "object") throw new Error("File non riconosciuto");
    Object.keys(S).forEach(k => { delete S[k]; });
    Object.assign(S, structuredClone(DEFAULT), incoming);
    S.tab = Object.assign({}, DEFAULT.tab, incoming.tab || {});
    save();
  }

  function reset() {
    Object.keys(S).forEach(k => { delete S[k]; });
    Object.assign(S, structuredClone(DEFAULT));
    save();
  }

  return {
    S, save, uid, seedOnce,
    getEdit, setEdit, pinFor, setPin, docNum, setDocNum, checks, muteCheck, day, days,
    addExpense, updateExpense, removeExpense, toEur,
    expensesOnStop, spentOnStop, expensesInCat, spentInCat, stopKey, stopsWithCost,
    cats, catOf, setCatPlan, catTotals, totals,
    extrasOn, extraTotal, extrasByDay, extrasTotalAll,
    patchStop, hideStop, addStop, hiddenIn, restoreDay,
    Files, exportJson, importJson, reset,
    get memoryOnly() { return memoryOnly; }
  };
})();
