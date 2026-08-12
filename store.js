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
    hidden: {},      // "G4.fixed.2" → true (eventi nascosti)
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

  const slug = t => String(t).toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28);

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------- seed degli importi già pagati ---------------- */
  function seedOnce() {
    if (S.seeded) return;
    TRIP.budget.forEach(sec => sec.lines.forEach(line => {
      if (!line.seed) return;
      S.expenses.push({
        id: uid(),
        date: line.seed.date || TRIP.meta.from,
        lineId: line.id,
        cat: sec.id,
        amount: line.seed.nok != null ? line.seed.nok : line.seed.eur,
        cur: line.seed.nok != null ? "NOK" : "EUR",
        note: "Già pagato",
        seed: true
      });
    }));
    S.seeded = true;
    save();
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

    // avvisi dichiarati nei dati, ancora pertinenti
    TRIP.checks.forEach(c => {
      if (S.checkOff[c.id]) return;
      out.push(Object.assign({ kind: "fisso" }, c));
    });

    // notti ancora aperte: calcolato, non dichiarato
    const aperte = days().filter(d => d.stay && d.stay.status === "todo");
    aperte.forEach(d => out.push({
      id: "notte-" + d.id, kind: "calcolato", day: d.id,
      level: aperte.length > 2 ? "alto" : "medio",
      title: "Notte del " + d.dateLabel + " senza prenotazione",
      body: d.stay.name + " · " + d.stay.place + ". In alta stagione le sistemazioni alle Lofoten si esauriscono.",
      action: null
    }));

    // attività da prenotare con una data ravvicinata
    days().forEach(d => d.fixed.filter(f => f.status === "todo").forEach(f => out.push({
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
      .map((f, i) => Object.assign({}, f, { _ref: `${d.id}.fixed.${i}` }))
      .filter(f => !S.hidden[f._ref])
      .concat((S.extra[d.id] || []).map(e => Object.assign({}, e, {
        kind: "custom", status: e.status || "free", meta: e.meta ? [e.meta] : [], _custom: true
      })));
    if (d.stay) {
      o.stay = Object.assign({}, d.stay, {
        name: getEdit(`${d.id}.stay.name`, d.stay.name),
        status: getEdit(`${d.id}.stay.status`, d.stay.status)
      });
    }
    o.userNote = S.notes[d.id] || "";
    return o;
  }

  const days = () => TRIP.days.map(day);

  /* ---------- spese --------------------------------------- */
  function addExpense(e) {
    S.expenses.push(Object.assign({ id: uid(), cur: "NOK", cat: "extra", note: "" }, e));
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
  /** Importo di una spesa convertito in euro col cambio corrente. */
  const toEur = e => (e.cur === "NOK" ? e.amount / S.fx : e.amount);

  const expensesFor = lineId => S.expenses.filter(e => e.lineId === lineId);
  const spentOn = lineId => expensesFor(lineId).reduce((s, e) => s + toEur(e), 0);
  const looseIn = catId => S.expenses.filter(e => !e.lineId && e.cat === catId);

  /* Spese "extra" di una giornata.

     Extra = quello che hai speso quel giorno e che NON è una delle
     tappe segnate in quella giornata. Se il giorno ha volo, hotel e
     cena, tutto ciò che registri e non è una di quelle tre è extra.

     Serve sapere da quale tappa arriva una spesa: per questo ogni
     spesa porta uno `stopId`. Le voci con un prezzo proprio (voli,
     alloggi, esperienze, immersioni) restano sempre fuori dagli
     extra, perché sono per definizione il costo di una tappa. */

  function dayStopKeys(dayId) {
    const d = TRIP.days.find(x => x.id === dayId);
    if (!d) return [];
    const keys = d.fixed.map(f => dayId + "/" + (f.id || f.title));
    (S.extra[dayId] || []).forEach(f => keys.push(dayId + "/" + (f.id || f.title)));
    if (d.stay) keys.push(dayId + "/stay");
    return keys;
  }

  function isExtraOn(e, day) {
    if (e.date !== day.date) return false;
    // registrata da una tappa di questa giornata: è il costo di quella tappa
    if (e.stopId && dayStopKeys(day.id).includes(e.stopId)) return false;
    // voce con un preventivo proprio: appartiene a una tappa, non è un extra
    if (e.lineId) {
      const lo = lineOf(e.lineId);
      if (lo && !lo.line.pool) return false;
    }
    return true;
  }

  function extrasOn(date) {
    const day = TRIP.days.find(d => d.date === date);
    if (!day) return S.expenses.filter(e => e.date === date && !e.lineId);
    return S.expenses.filter(e => isExtraOn(e, day));
  }
  const extraTotal = date => extrasOn(date).reduce((a, e) => a + toEur(e), 0);

  /* tutti gli extra del viaggio, raggruppati per giornata */
  function extrasByDay() {
    return TRIP.days.map(d => {
      const voci = extrasOn(d.date);
      return { day: d, voci, tot: voci.reduce((a, e) => a + toEur(e), 0) };
    }).filter(x => x.voci.length);
  }
  const extrasTotalAll = () => extrasByDay().reduce((a, x) => a + x.tot, 0);

  function lineOf(lineId) {
    for (const sec of TRIP.budget) {
      const l = sec.lines.find(x => x.id === lineId);
      if (l) return { line: l, sec };
    }
    return null;
  }

  function totals() {
    let plan = 0;
    TRIP.budget.forEach(sec => sec.lines.forEach(l => {
      if (l.optional && !S.optional) return;
      plan += l.plan;
    }));
    const spent = S.expenses.reduce((s, e) => s + toEur(e), 0);
    // proiezione: speso reale dove c'è, preventivo dove non c'è ancora nulla
    let proj = 0;
    TRIP.budget.forEach(sec => sec.lines.forEach(l => {
      if (l.optional && !S.optional) return;
      const sp = spentOn(l.id);
      proj += sp > 0 ? sp : l.plan;
    }));
    proj += TRIP.budget.reduce((s, sec) => s + looseIn(sec.id).reduce((a, e) => a + toEur(e), 0), 0);
    return { plan, spent, proj, delta: proj - plan };
  }

  function sectionTotals(sec) {
    let plan = 0, spent = 0, proj = 0;
    sec.lines.forEach(l => {
      if (l.optional && !S.optional) return;
      const sp = spentOn(l.id);
      plan += l.plan; spent += sp; proj += sp > 0 ? sp : l.plan;
    });
    const loose = looseIn(sec.id).reduce((a, e) => a + toEur(e), 0);
    return { plan, spent: spent + loose, proj: proj + loose, loose };
  }

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
    expensesFor, spentOn, looseIn, lineOf, extrasOn, extraTotal, extrasByDay, extrasTotalAll,
    totals, sectionTotals,
    Files, exportJson, importJson, reset,
    get memoryOnly() { return memoryOnly; }
  };
})();
