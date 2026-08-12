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
    tab: { budget: "piano", pratico: "info" },
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
        tab: Object.assign({}, DEFAULT.tab, s.tab || {})
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
    getEdit, setEdit, pinFor, setPin, day, days,
    addExpense, updateExpense, removeExpense, toEur,
    expensesFor, spentOn, looseIn, lineOf, totals, sectionTotals,
    Files, exportJson, importJson, reset,
    get memoryOnly() { return memoryOnly; }
  };
})();
