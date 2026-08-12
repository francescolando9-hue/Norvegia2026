/* ============================================================
   App — shell, navigazione, tema, service worker.
   ============================================================ */

const App = (() => {
  "use strict";

  const { $, $$, el, esc, ICON, toast } = UI;
  const S = Store.S;

  const VIEWS = {
    giorni:  { label: "Giorni",  icon: ICON.cal,   build: () => Views.giorni() },
    prenota: { label: "Prenota", icon: ICON.check, build: () => Views.prenota() },
    budget:  { label: "Budget",  icon: ICON.coin,  build: () => Views.budget() },
    pratico: { label: "Pratico", icon: ICON.info,  build: () => Views.pratico() }
  };

  let scrolledToToday = false;

  /* ---------- tema ---------------------------------------- */
  function applyTheme() {
    const t = S.theme === "auto"
      ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
      : S.theme;
    document.documentElement.dataset.theme = t;
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#E9E5DA" : "#05131A");
    const btn = $("#themebtn");
    if (btn) btn.innerHTML = t === "light" ? ICON.moon : ICON.sun;
  }

  function cycleTheme() {
    const order = ["auto", "dark", "light"];
    S.theme = order[(order.indexOf(S.theme) + 1) % order.length];
    Store.save();
    applyTheme();
    toast(S.theme === "auto" ? "Tema automatico" : S.theme === "dark" ? "Tema scuro" : "Tema chiaro");
  }

  /* ---------- strip dei giorni ---------------------------- */
  function renderStrip() {
    const wrap = $("#strip");
    wrap.innerHTML = "";
    const t = UI.todayISO();
    Store.days().forEach(d => {
      const st = Views.dayStatus(d);
      const b = el("button", `chip chip--${st}` +
        (d.date === t ? " chip--on" : "") + (d.date < t ? " chip--past" : ""));
      b.innerHTML = `<i class="chip__dot"></i>${d.id} <span>${d.dateLabel.split(" ")[0]}</span>`;
      b.onclick = () => Views.jump(d.id);
      wrap.appendChild(b);
    });
    if (!scrolledToToday) {
      const on = wrap.querySelector(".chip--on") || wrap.querySelector(".chip");
      if (on) on.scrollIntoView({ inline: "center", block: "nearest" });
    }
  }

  /* ---------- nav ---------------------------------------- */
  function renderNav() {
    const openN = TRIP.todo.filter(t => !S.done[t.id]).length;
    const nav = $("#nav");
    nav.innerHTML = "";
    Object.entries(VIEWS).forEach(([k, v]) => {
      const b = el("button", S.view === k ? "on" : "");
      b.setAttribute("aria-current", S.view === k ? "page" : "false");
      b.innerHTML = `${v.icon}<b>${v.label}</b>${k === "prenota" && openN ? `<span class="pip">${openN}</span>` : ""}`;
      b.onclick = () => go(k);
      nav.appendChild(b);
    });
  }

  function go(k) {
    if (S.view === k) { render(); return; }
    S.view = k; Store.save();
    UI.buzz();
    const paint = () => { render(); window.scrollTo({ top: 0 }); };
    if (document.startViewTransition &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.startViewTransition(paint);
    } else {
      paint();
    }
  }

  function render() {
    const main = $("#main");
    const keep = window.scrollY;
    main.innerHTML = "";
    main.appendChild(VIEWS[S.view].build());
    renderNav();
    renderStrip();
    $("#strip").parentElement.hidden = S.view !== "giorni";
    if (main.dataset.view === S.view) window.scrollTo({ top: keep });
    main.dataset.view = S.view;
  }

  /* ---------- avvio -------------------------------------- */
  function boot() {
    applyTheme();
    window.matchMedia("(prefers-color-scheme: light)")
      .addEventListener("change", () => { if (S.theme === "auto") applyTheme(); });

    Store.seedOnce();
    Views.bind(render);
    Extra.bind(render);
    Weather.onChange(() => { if (S.view === "giorni") render(); });

    const sb = $("#searchbtn");
    sb.innerHTML = ICON.search;
    sb.onclick = () => Views.search();
    $("#themebtn").onclick = cycleTheme;

    render();

    // porta il primo sguardo sul giorno di oggi
    const i = Views.currentIndex();
    if (i >= 0 && S.view === "giorni") {
      setTimeout(() => {
        const n = document.getElementById("d-" + TRIP.days[i].id);
        if (n) n.scrollIntoView({ behavior: "smooth", block: "start" });
        scrolledToToday = true;
      }, 420);
    } else {
      scrolledToToday = true;
    }

    Weather.refresh();
    window.addEventListener("online", () => Weather.refresh());

    // la card ORA vive: si riscrive ogni minuto
    setInterval(() => {
      if (S.view !== "giorni" || document.querySelector(".sheet-back, .srch")) return;
      const v = $("#main .view");
      if (v && v.firstElementChild) v.replaceChild(Views.giorni().firstElementChild, v.firstElementChild);
    }, 60000);

    if (document.visibilityState) {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") Weather.refresh();
      });
    }

    // se apri un link con #G4 ci vai diretto
    if (/^#G\d+$/.test(location.hash)) {
      const id = location.hash.slice(1);
      if (TRIP.days.some(d => d.id === id)) setTimeout(() => Extra.openDay(id), 260);
    }

    pullToRefresh();
    watchConnection();
    registerSW();
  }

  /* ---------- trascina giù per aggiornare il meteo --------
     Solo quando sei già in cima e solo verso il basso, così non
     litiga con lo scorrimento normale.
     -------------------------------------------------------- */
  function pullToRefresh() {
    let y0 = null, armed = false;
    const ind = el("div", "ptr");
    ind.innerHTML = `<span></span>`;
    document.body.appendChild(ind);

    window.addEventListener("touchstart", e => {
      if (e.touches.length !== 1 || window.scrollY > 2 || document.body.classList.contains("day-open")) {
        y0 = null; return;
      }
      y0 = e.touches[0].clientY; armed = false;
    }, { passive: true });

    window.addEventListener("touchmove", e => {
      if (y0 == null) return;
      const dy = e.touches[0].clientY - y0;
      if (dy <= 0) { ind.style.transform = ""; return; }
      const pull = Math.min(dy * 0.4, 62);
      ind.style.transform = `translateY(${pull}px)`;
      ind.classList.toggle("ptr--armed", pull > 46);
      armed = pull > 46;
    }, { passive: true });

    window.addEventListener("touchend", () => {
      if (y0 == null) return;
      ind.style.transform = "";
      ind.classList.remove("ptr--armed");
      if (armed) {
        UI.buzz(12);
        ind.classList.add("ptr--go");
        Weather.refresh(true).finally(() => {
          setTimeout(() => ind.classList.remove("ptr--go"), 300);
          toast(navigator.onLine ? "Meteo aggiornato" : "Nessuna rete: resta l'ultimo dato");
        });
      }
      y0 = null; armed = false;
    }, { passive: true });
  }

  /* ---------- stato della connessione --------------------- */
  function watchConnection() {
    const paint = () => document.body.classList.toggle("is-offline", !navigator.onLine);
    window.addEventListener("online", paint);
    window.addEventListener("offline", paint);
    paint();
  }

  /* ---------- service worker + aggiornamenti -------------- */
  function registerSW() {
    if (!("serviceWorker" in navigator) || !location.protocol.startsWith("http")) return;
    navigator.serviceWorker.register("sw.js").then(reg => {
      if (reg.waiting) showUpdate(reg);
      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener("statechange", () => {
          if (sw.state === "installed" && navigator.serviceWorker.controller) showUpdate(reg);
        });
      });
    }).catch(() => {});
  }

  function showUpdate(reg) {
    if ($("#upd")) return;
    const bar = el("div", "updbar");
    bar.id = "upd";
    bar.innerHTML = `<span>Nuova versione disponibile</span><button>Aggiorna</button>`;
    bar.querySelector("button").onclick = () => {
      if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
      setTimeout(() => location.reload(), 300);
    };
    document.body.appendChild(bar);
    requestAnimationFrame(() => bar.classList.add("on"));
  }

  return { go, render, boot, VIEWS };
})();

document.addEventListener("DOMContentLoaded", App.boot);
