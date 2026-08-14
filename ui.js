/* ============================================================
   UI — helper DOM, icone, formattatori, bottom sheet, toast.
   ============================================================ */

const UI = (() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  const esc = s => String(s == null ? "" : s)
    .replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const eur  = n => "€ " + Math.round(n).toLocaleString("it-IT");
  const eur2 = n => "€ " + n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const nok  = n => "NOK " + Math.round(n).toLocaleString("it-IT");
  const num  = n => n.toLocaleString("it-IT", { maximumFractionDigits: 0 });

  const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  const dateShort = iso => {
    const [y, m, d] = iso.split("-").map(Number);
    return d + " " + MONTHS[m - 1];
  };

  const todayISO = () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  };

  const nowMinutes = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };

  /** Orario "HH:MM" → minuti. Le etichette testuali cadono su un'ora sensata. */
  function mins(t) {
    if (/^\d{1,2}:\d{2}$/.test(t)) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
    if (/sera|notte/i.test(t)) return 20 * 60;
    if (/mattin/i.test(t)) return 9 * 60;
    return 12 * 60;
  }

  const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

  function dur(m) {
    if (m < 60) return m + " min";
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${h}h ${r}m` : `${h}h`;
  }

  const ICON = {
    cal:   '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>',
    coin:  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M15 9.5a2.5 2.5 0 0 0-3-1.5c-1.4 0-2.5.9-2.5 2s1.1 2 2.5 2 2.5.9 2.5 2-1.1 2-2.5 2a2.5 2.5 0 0 1-3-1.5"/></svg>',
    info:  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    bed:   '<svg viewBox="0 0 24 24"><path d="M2 18v-5h20v5M2 18v2M22 18v2M4 13V8h6v5M14 11h6a2 2 0 0 1 2 2"/></svg>',
    caret: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
    ext:   '<svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg>',
    refresh:'<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/></svg>',
    search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4.5-4.5"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    plus:  '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    pin:   '<svg viewBox="0 0 24 24"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    pencil:'<svg viewBox="0 0 24 24"><path d="M4 20h4l10-10-4-4L4 16v4zM14.5 5.5l4 4"/></svg>',
    clip:  '<svg viewBox="0 0 24 24"><path d="M9 13.5V7a3 3 0 0 1 6 0v9a5 5 0 0 1-10 0V8"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v4a2 2 0 0 1-2.2 2A16 16 0 0 1 3 5.2 2 2 0 0 1 5 3z"/></svg>',
    down:  '<svg viewBox="0 0 24 24"><path d="M12 4v12m0 0 4.5-4.5M12 16l-4.5-4.5M4 20h16"/></svg>',
    up:    '<svg viewBox="0 0 24 24"><path d="M12 20V8m0 0 4.5 4.5M12 8 7.5 12.5M4 4h16"/></svg>',
    sun:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></svg>',
    moon:  '<svg viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>',
    nav:   '<svg viewBox="0 0 24 24"><path d="M3 11 21 4l-7 17-2.5-7.5L3 11z"/></svg>'
  };

  /* codici meteo WMO → glifo + parola */
  const WX = {
    0:  ["☀", "sereno"],      1: ["🌤", "poco nuvoloso"], 2: ["⛅", "nuvoloso"],  3: ["☁", "coperto"],
    45: ["🌫", "nebbia"],     48: ["🌫", "nebbia"],
    51: ["🌦", "pioviggine"], 53: ["🌦", "pioviggine"],   55: ["🌦", "pioviggine"],
    56: ["🌧", "gelicidio"],  57: ["🌧", "gelicidio"],
    61: ["🌧", "pioggia"],    63: ["🌧", "pioggia"],      65: ["🌧", "pioggia forte"],
    66: ["🌧", "pioggia gelata"], 67: ["🌧", "pioggia gelata"],
    71: ["🌨", "neve"],       73: ["🌨", "neve"],         75: ["🌨", "neve forte"], 77: ["🌨", "nevischio"],
    80: ["🌦", "rovesci"],    81: ["🌦", "rovesci"],      82: ["⛈", "rovesci forti"],
    85: ["🌨", "rovesci di neve"], 86: ["🌨", "rovesci di neve"],
    95: ["⛈", "temporale"],   96: ["⛈", "temporale"],     99: ["⛈", "temporale"]
  };
  const wxOf = code => WX[code] || ["·", "—"];

  /** Vento in m/s → giudizio per le uscite in mare. */
  function seaState(ms) {
    if (ms == null) return null;
    if (ms < 5) return { k: "ok", t: "mare calmo" };
    if (ms < 8) return { k: "ok", t: "mare mosso" };
    if (ms < 11) return { k: "warn", t: "mare agitato" };
    return { k: "open", t: "possibile annullamento" };
  }

  /* ---------- toast --------------------------------------- */
  let tTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(tTimer);
    tTimer = setTimeout(() => t.classList.remove("on"), 1900);
  }

  async function copy(text, label) {
    try { await navigator.clipboard.writeText(text); toast(label + " copiato"); }
    catch { toast(text); }
  }

  function buzz(ms = 8) { try { navigator.vibrate && navigator.vibrate(ms); } catch {} }

  /* ---------- bottom sheet -------------------------------- */
  let sheetClose = null;

  function sheet(title, buildBody, opts = {}) {
    closeSheet();
    const back = el("div", "sheet-back");
    const box = el("div", "sheet");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML = `
      <div class="sheet__grab"></div>
      <div class="sheet__head">
        <h2 class="sheet__title">${esc(title)}</h2>
        <button class="sheet__x" aria-label="Chiudi">${ICON.close}</button>
      </div>
      <div class="sheet__body"></div>`;
    const body = $(".sheet__body", box);
    buildBody(body, closeSheet);
    back.appendChild(box);
    document.body.appendChild(back);
    document.body.classList.add("locked");
    requestAnimationFrame(() => back.classList.add("on"));

    $(".sheet__x", box).onclick = closeSheet;
    back.addEventListener("click", e => { if (e.target === back) closeSheet(); });
    const onKey = e => { if (e.key === "Escape") closeSheet(); };
    document.addEventListener("keydown", onKey);

    // trascinamento verso il basso per chiudere
    let y0 = null;
    $(".sheet__grab", box).addEventListener("touchstart", e => { y0 = e.touches[0].clientY; }, { passive: true });
    box.addEventListener("touchmove", e => {
      if (y0 == null) return;
      const dy = e.touches[0].clientY - y0;
      if (dy > 0) box.style.transform = `translateY(${dy}px)`;
    }, { passive: true });
    box.addEventListener("touchend", () => {
      const m = /translateY\((\d+(?:\.\d+)?)px\)/.exec(box.style.transform);
      if (m && parseFloat(m[1]) > 90) closeSheet(); else box.style.transform = "";
      y0 = null;
    });

    sheetClose = () => {
      document.removeEventListener("keydown", onKey);
      back.classList.remove("on");
      document.body.classList.remove("locked");
      setTimeout(() => back.remove(), 240);
      sheetClose = null;
      opts.onClose && opts.onClose();
    };
    const first = box.querySelector("input,textarea,select,button:not(.sheet__x)");
    if (first && opts.focus !== false) setTimeout(() => first.focus(), 260);
    return closeSheet;
  }

  function closeSheet() { if (sheetClose) sheetClose(); }

  /* ---------- form helper --------------------------------- */
  function field(label, inputHtml, hint) {
    return `<label class="fld"><span class="fld__k">${esc(label)}</span>${inputHtml}${
      hint ? `<span class="fld__h">${esc(hint)}</span>` : ""}</label>`;
  }

  function actions(primaryLabel, secondaryLabel) {
    return `<div class="sheet__act">
      ${secondaryLabel ? `<button class="btn btn--ghost" data-act="cancel">${esc(secondaryLabel)}</button>` : ""}
      <button class="btn btn--go" data-act="ok">${esc(primaryLabel)}</button>
    </div>`;
  }

  const mapUrl = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  const navUrl = q => "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q);

  function download(name, text, type = "application/json") {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = el("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  return {
    $, $$, el, esc, eur, eur2, nok, num, dateShort, todayISO, nowMinutes, mins, hhmm, dur,
    ICON, wxOf, seaState, toast, copy, buzz, sheet, closeSheet, field, actions,
    mapUrl, navUrl, download
  };
})();
