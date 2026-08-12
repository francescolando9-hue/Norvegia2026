/* ============================================================
   extra.js — quello che mancava rispetto alle app di categoria.

   - Mappa: schematica, disegnata dalle coordinate, nessuna tile
     da scaricare. Funziona in modalità aereo, che è il punto.
   - Documenti: la cassetta. File in IndexedDB, numeri in locale.
   - Avvisi: i controlli calcolati, in cima a tutto.
   - Giorno: scheda a schermo pieno, si scorre con il pollice.
   ============================================================ */

const Extra = (() => {
  "use strict";

  const { $, $$, el, esc, ICON, toast, copy, buzz, sheet, field, actions,
          mapUrl, navUrl, download } = UI;
  const S = Store.S;

  let rerender = () => {};
  function bind(fn) { rerender = fn; }

  const ICON2 = {
    id:     '<svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M5 16c.8-1.4 2-2 3.5-2s2.7.6 3.5 2M15 10h4M15 13.5h4"/></svg>',
    car:    '<svg viewBox="0 0 24 24"><path d="M3 13l2-5.5A2 2 0 0 1 6.9 6h10.2a2 2 0 0 1 1.9 1.5L21 13v4h-2M3 17v-4m0 4h2m14 0H5"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/></svg>',
    cross:  '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M9 6V4h6v2M12 10v5M9.5 12.5h5"/></svg>',
    wave:   '<svg viewBox="0 0 24 24"><path d="M2 9c2.5-2 4.5 2 7 0s4.5-2 7 0 4.5 2 6 .5M2 15c2.5-2 4.5 2 7 0s4.5-2 7 0 4.5 2 6 .5"/></svg>',
    ticket: '<svg viewBox="0 0 24 24"><path d="M3 9V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a2.5 2.5 0 0 0 0 5v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2.5 2.5 0 0 0 0-5z"/><path d="M12 7v10" stroke-dasharray="2 2"/></svg>',
    clip:   ICON.clip,
    map:    '<svg viewBox="0 0 24 24"><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2V6z"/><path d="M9 4v14M15 6v14"/></svg>',
    list:   '<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>',
    alert:  '<svg viewBox="0 0 24 24"><path d="M12 4 3 19h18L12 4z"/><path d="M12 10v4M12 16.5h.01"/></svg>',
    share:  '<svg viewBox="0 0 24 24"><path d="M12 3v11m0-11 4 4m-4-4L8 7"/><path d="M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"/></svg>',
    back:   '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    print:  '<svg viewBox="0 0 24 24"><path d="M7 8V4h10v4M7 18H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2"/><rect x="7" y="14" width="10" height="6" rx="1"/></svg>'
  };

  /* ========================================================
     MAPPA — proiezione delle coordinate su un piano.
     Alla latitudine delle Lofoten un grado di longitudine vale
     poco più di un terzo di un grado di latitudine: senza
     correggere, la rotta risulterebbe schiacciata.
     ======================================================== */

  function project(days, w, h, pad) {
    const lat = days.map(d => d.lat), lon = days.map(d => d.lon);
    const latMid = (Math.min(...lat) + Math.max(...lat)) / 2;
    const k = Math.cos(latMid * Math.PI / 180);      // compressione dei meridiani

    const xs = lon.map(v => v * k), ys = lat.map(v => -v);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    const y0 = Math.min(...ys), y1 = Math.max(...ys);

    const sx = (x1 - x0) || 1, sy = (y1 - y0) || 1;
    const s = Math.min((w - pad * 2) / sx, (h - pad * 2) / sy);
    const ox = (w - sx * s) / 2, oy = (h - sy * s) / 2;

    return days.map((d, i) => ({
      d,
      x: ox + (xs[i] - x0) * s,
      y: oy + (ys[i] - y0) * s
    }));
  }

  function mappa() {
    const wrap = el("div");
    const all = Store.days();

    // Oslo sta a 59,9°N: tenerla nel riquadro schiaccerebbe tutto
    // l'artico in un grumo illeggibile. Il viaggio in auto è da
    // Tromsø a Bodø, e quello è ciò che la mappa deve mostrare.
    const days = all.filter(d => d.lat > 65);
    const fuori = all.filter(d => d.lat <= 65);

    const W = 340, H = 430, PAD = 46;
    const pts = project(days, W, H, PAD);

    // tappe quasi coincidenti (Ballstad, Bodø) raggruppate in un pallino
    const groups = [];
    pts.forEach(p => {
      const near = groups.find(g => Math.hypot(g.x - p.x, g.y - p.y) < 17);
      if (near) { near.items.push(p.d); return; }
      groups.push({ x: p.x, y: p.y, items: [p.d] });
    });

    // etichette a destra o a sinistra secondo il lato, e scalate in
    // verticale quando due gruppi si pestano i piedi
    groups.forEach((g, i) => {
      g.flip = g.x > W * 0.55;
      g.dy = 0;
      for (let j = 0; j < i; j++) {
        const o = groups[j];
        if (o.flip === g.flip && Math.abs((o.y + o.dy) - (g.y + g.dy)) < 15) {
          g.dy += ((o.y + o.dy) < g.y ? 15 : -15);
        }
      }
    });

    const today = UI.todayISO();
    const path = pts.map((p, i) =>
      (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ");

    const svg = `
      <svg viewBox="0 0 ${W} ${H}" class="tmap" role="img"
           aria-label="Mappa schematica delle tappe da Tromsø a Bodø">
        <g class="tmap__grid">
          ${[1, 2, 3].map(i => `<line x1="12" y1="${(H / 4 * i).toFixed(0)}" x2="${W - 12}" y2="${(H / 4 * i).toFixed(0)}"/>`).join("")}
          ${[1, 2].map(i => `<line x1="${(W / 3 * i).toFixed(0)}" y1="12" x2="${(W / 3 * i).toFixed(0)}" y2="${H - 12}"/>`).join("")}
        </g>
        <path class="tmap__route" d="${path}"/>
        ${groups.map(g => {
          const st = g.items.some(d => Views.dayStatus(d) === "open") ? "open"
                   : g.items.some(d => Views.dayStatus(d) === "verify") ? "verify" : "ok";
          const isToday = g.items.some(d => d.date === today);
          const ids = g.items.length > 1
            ? g.items[0].id + "–" + g.items[g.items.length - 1].id
            : g.items[0].id;
          const lx = g.x + (g.flip ? -12 : 12);
          const ly = g.y + g.dy + 3.5;
          return `<g class="tmap__stop tmap__stop--${st}${isToday ? " is-today" : ""}"
                     data-days="${g.items.map(d => d.id).join(" ")}" tabindex="0" role="button"
                     aria-label="${esc(ids + " " + g.items[0].wxPlace)}">
            <circle class="tmap__hit" cx="${g.x.toFixed(1)}" cy="${g.y.toFixed(1)}" r="18"/>
            ${g.dy ? `<line class="tmap__tick" x1="${g.x.toFixed(1)}" y1="${g.y.toFixed(1)}"
                        x2="${lx.toFixed(1)}" y2="${(ly - 3.5).toFixed(1)}"/>` : ""}
            <circle class="tmap__dot" cx="${g.x.toFixed(1)}" cy="${g.y.toFixed(1)}" r="5"/>
            <text class="tmap__lbl" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}"
                  text-anchor="${g.flip ? "end" : "start"}">
              <tspan class="tmap__id">${ids}</tspan><tspan dx="5">${esc(g.items[0].wxPlace)}</tspan>
            </text>
          </g>`;
        }).join("")}
      </svg>`;

    const card = el("div", "card mapcard");
    card.innerHTML = `
      <div class="mapcard__head">
        <span class="eyebrow">Rotta in auto</span>
        <span class="mapcard__n">Tromsø → Bodø · ~1.500 km</span>
      </div>
      ${svg}
      <p class="mapcard__foot">Disegnata dalle coordinate, senza tessere da scaricare:
      funziona in modalità aereo.${fuori.length
        ? " " + fuori.map(d => d.id).join(" e ") + (fuori.length === 1 ? " resta" : " restano")
          + " fuori dal riquadro: Oslo è 900 km più a sud."
        : ""} Tocca una tappa per aprire la giornata.</p>`;
    wrap.appendChild(card);

    $$(".tmap__stop", card).forEach(g => {
      const open = () => { buzz(); Extra.openDay(g.dataset.days.split(" ")[0]); };
      g.addEventListener("click", open);
      g.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    });

    const h = el("div", "sect-head");
    h.innerHTML = `<span class="eyebrow">Tratte</span><i class="rule"></i>
      <span class="eyebrow">~21h al volante</span>`;
    wrap.appendChild(h);

    all.forEach(d => {
      const row = el("button", "legrow");
      const st = Views.dayStatus(d);
      row.innerHTML = `
        <span class="legrow__id legrow__id--${st}">${d.id}</span>
        <span class="legrow__b">
          <b>${esc(d.arc)}</b>
          <small>${[d.km, d.drive].filter(Boolean).join(" · ") || "nessun trasferimento"}</small>
        </span>
        <span class="legrow__go">${ICON.caret}</span>`;
      row.onclick = () => { buzz(); Extra.openDay(d.id); };
      wrap.appendChild(row);
    });

    return wrap;
  }

  /* ========================================================
     AVVISI — in cima a Giorni, sopra tutto il resto.
     ======================================================== */

  function avvisiCard(compact) {
    const list = Store.checks();
    if (!list.length) return null;
    const alti = list.filter(c => c.level === "alto").length;

    const card = el("div", "alerts" + (compact ? " alerts--compact" : ""));
    const head = el("button", "alerts__head");
    head.innerHTML = `
      <span class="alerts__ic">${ICON2.alert}</span>
      <span class="alerts__t">
        <b>${list.length} cose da sistemare</b>
        <small>${alti ? alti + " urgenti" : "nessuna urgente"} · ricalcolate dai tuoi dati</small>
      </span>
      <span class="alerts__caret">${ICON.caret}</span>`;
    card.appendChild(head);

    const body = el("div", "alerts__body");
    body.hidden = compact;
    list.forEach(c => {
      const row = el("div", "alert alert--" + c.level);
      row.innerHTML = `
        <span class="alert__day">${c.day}</span>
        <span class="alert__b">
          <b>${esc(c.title)}</b>
          <small>${esc(c.body)}</small>
        </span>`;
      const acts = el("div", "alert__acts");
      const go = el("button", "minibtn");
      go.innerHTML = `${ICON.cal}<span>Apri ${c.day}</span>`;
      go.onclick = () => { buzz(); Extra.openDay(c.day); };
      acts.appendChild(go);
      if (c.tel) {
        const t = el("a", "minibtn minibtn--go");
        t.href = "tel:" + c.tel.replace(/\s/g, "");
        t.innerHTML = `${ICON.phone}<span>${esc(c.action || "Chiama")}</span>`;
        acts.appendChild(t);
      }
      if (c.kind === "fisso") {
        const m = el("button", "minibtn");
        m.innerHTML = `${ICON.check}<span>Sistemato</span>`;
        m.onclick = () => { Store.muteCheck(c.id); buzz(); rerender(); toast("Avviso archiviato"); };
        acts.appendChild(m);
      }
      $(".alert__b", row).appendChild(acts);
      body.appendChild(row);
    });
    card.appendChild(body);

    head.onclick = () => {
      body.hidden = !body.hidden;
      card.classList.toggle("alerts--open", !body.hidden);
      buzz();
    };
    if (!compact) card.classList.add("alerts--open");
    return card;
  }

  /* ========================================================
     DOCUMENTI — la cassetta. Categorie, file, numeri.
     ======================================================== */

  function documenti() {
    const wrap = el("div");

    const intro = el("div", "card");
    intro.innerHTML = `
      <span class="eyebrow">Come funziona</span>
      <ul class="ev__meta" style="margin-top:9px">
        <li>File e numeri restano su questo telefono e si aprono senza rete.</li>
        <li>Non finiscono nel repository su GitHub e non vengono caricati da nessuna parte.</li>
        <li>Non sono cifrati: la protezione è il blocco schermo del telefono. Trattali come le carte nel portafoglio.</li>
      </ul>`;
    wrap.appendChild(intro);

    let counts = {};
    const paintCounts = () => {
      $$("[data-doccount]", wrap).forEach(n => {
        const c = counts[n.dataset.doccount] || 0;
        n.textContent = c ? c + (c === 1 ? " file" : " file") : "vuoto";
        n.classList.toggle("docrow__n--on", !!c);
      });
    };

    TRIP.docs.forEach(cat => {
      const owner = "doc:" + cat.id;
      const c = el("div", "card doccard");
      c.innerHTML = `
        <div class="doccard__head">
          <span class="doccard__ic">${ICON2[cat.icon] || ICON2.clip}</span>
          <span class="doccard__t">
            <b>${esc(cat.label)}</b>
            <small data-doccount="${esc(owner)}">…</small>
          </span>
        </div>
        <p class="doccard__hint">${esc(cat.hint)}</p>`;

      if (cat.items.length) {
        const ul = el("ul", "ev__meta");
        ul.style.margin = "0 0 10px";
        cat.items.forEach(i => ul.appendChild(el("li", null, esc(i))));
        c.appendChild(ul);
      }

      cat.fields.forEach(f => {
        const val = Store.docNum(f.id);
        const row = el("button", "numrow" + (val ? " numrow--on" : ""));
        row.innerHTML = `
          <span class="numrow__k">${esc(f.label)}</span>
          <span class="numrow__v">${val ? esc(val) : "da inserire"}</span>
          <span class="numrow__ic">${val ? ICON.pencil : ICON.plus}</span>`;
        row.onclick = () => {
          sheet(f.label, (body, done) => {
            body.innerHTML = `
              ${field(f.label, `<input class="in" id="dn" type="text" autocomplete="off"
                       spellcheck="false" value="${esc(val)}" placeholder="Solo il numero">`,
                       "Svuota il campo per cancellarlo. Resta su questo telefono.")}
              ${actions("Salva", "Annulla")}`;
            $('[data-act="ok"]', body).onclick = () => {
              Store.setDocNum(f.id, $("#dn", body).value);
              buzz(); done(); rerender();
            };
            $('[data-act="cancel"]', body).onclick = done;
          });
        };
        c.appendChild(row);
      });

      const btn = el("button", "btn btn--ghost btn--full");
      btn.innerHTML = `${ICON.clip}<span>Foto e PDF</span>`;
      btn.onclick = () => Views.filesSheet(owner, cat.label);
      c.appendChild(btn);

      wrap.appendChild(c);
    });

    Store.Files.counts().then(m => {
      const sig = JSON.stringify(m);
      if (sig === documenti._sig) return;
      documenti._sig = sig;
      counts = m; paintCounts();
    }).catch(() => { counts = {}; paintCounts(); });

    return wrap;
  }

  /* ========================================================
     GIORNO A SCHERMO PIENO
     Una giornata per volta, si passa alla successiva con il
     pollice. È la differenza tra scorrere una pagina e usare
     un'app.
     ======================================================== */

  let openId = null;

  function openDay(id) {
    openId = id;
    history.pushState({ day: id }, "", "#" + id);
    paintDay();
  }
  function closeDay(fromPop) {
    openId = null;
    if (!fromPop && location.hash) history.back();
    const l = $("#dayl");
    if (l) { l.classList.remove("on"); setTimeout(() => l.remove(), 220); }
    document.body.classList.remove("day-open");
  }

  function paintDay() {
    const days = Store.days();
    const i = days.findIndex(d => d.id === openId);
    if (i < 0) return;
    const d = days[i];

    let layer = $("#dayl");
    if (!layer) {
      layer = el("div", "daylayer");
      layer.id = "dayl";
      document.body.appendChild(layer);
      requestAnimationFrame(() => layer.classList.add("on"));
    }
    document.body.classList.add("day-open");

    const prev = days[i - 1], next = days[i + 1];
    layer.innerHTML = "";

    const bar = el("header", "daybar");
    bar.innerHTML = `
      <button class="iconbtn" data-a="close" aria-label="Chiudi">${ICON2.back}</button>
      <span class="daybar__t"><b>${d.id}</b><small>${esc(d.dow)} ${esc(d.dateLabel)}</small></span>
      <button class="iconbtn" data-a="share" aria-label="Condividi">${ICON2.share}</button>`;
    layer.appendChild(bar);

    const scroll = el("div", "dayscroll");
    scroll.appendChild(Views.dayCard(d, { full: true }));

    const pager = el("div", "daypager");
    pager.innerHTML = `
      <button class="daypager__b" data-go="${prev ? prev.id : ""}" ${prev ? "" : "disabled"}>
        ${ICON2.back}<span>${prev ? prev.id + " · " + prev.dateLabel.split(" ")[0] + " ago" : "inizio"}</span>
      </button>
      <button class="daypager__b daypager__b--r" data-go="${next ? next.id : ""}" ${next ? "" : "disabled"}>
        <span>${next ? next.id + " · " + next.dateLabel.split(" ")[0] + " ago" : "fine"}</span>${ICON.caret}
      </button>`;
    scroll.appendChild(pager);
    layer.appendChild(scroll);

    $('[data-a="close"]', bar).onclick = () => { buzz(); closeDay(); };
    $('[data-a="share"]', bar).onclick = () => shareDay(d);
    $$(".daypager__b", pager).forEach(b => b.onclick = () => {
      if (!b.dataset.go) return;
      buzz(); openId = b.dataset.go;
      history.replaceState({ day: openId }, "", "#" + openId);
      swap(b.classList.contains("daypager__b--r") ? 1 : -1);
    });

    // trascinamento orizzontale per cambiare giornata
    let x0 = null, y0 = null, lock = null;
    scroll.addEventListener("touchstart", e => {
      if (e.touches.length !== 1) return;
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; lock = null;
    }, { passive: true });
    scroll.addEventListener("touchmove", e => {
      if (x0 == null) return;
      const dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
      if (lock === null && (Math.abs(dx) > 12 || Math.abs(dy) > 12)) {
        lock = Math.abs(dx) > Math.abs(dy) * 1.6 ? "x" : "y";
      }
      if (lock === "x") layer.style.transform = `translateX(${dx * 0.35}px)`;
    }, { passive: true });
    scroll.addEventListener("touchend", e => {
      if (x0 == null) return;
      const dx = (e.changedTouches[0].clientX - x0);
      layer.style.transform = "";
      if (lock === "x" && Math.abs(dx) > 70) {
        const target = dx < 0 ? next : prev;
        if (target) {
          buzz(); openId = target.id;
          history.replaceState({ day: openId }, "", "#" + openId);
          swap(dx < 0 ? 1 : -1);
        }
      }
      x0 = null; lock = null;
    }, { passive: true });
  }

  function swap(dir) {
    const layer = $("#dayl");
    if (!layer || !document.startViewTransition) { paintDay(); return; }
    layer.dataset.dir = dir > 0 ? "next" : "prev";
    document.startViewTransition(() => paintDay());
  }

  /* ---------- condivisione ------------------------------- */

  function dayText(d) {
    const L = [`${d.id} · ${d.dow} ${d.dateLabel} — ${d.arc}`];
    if (d.km || d.drive) L.push([d.km, d.drive].filter(Boolean).join(" · "));
    L.push("");
    d.fixed.forEach(f => L.push(`${f.t}  ${f.title}` +
      (f.status === "todo" ? "  [da prenotare]" : "")));
    if (d.stay) L.push("", "Notte: " + d.stay.name + " (" + d.stay.place + ")");
    if (d.flex && d.flex.length) {
      L.push("", "Senza orario:");
      d.flex.forEach(f => L.push("· " + f.title));
    }
    return L.join("\n");
  }

  async function shareDay(d) {
    const text = dayText(d);
    const data = { title: `Norvegia · ${d.id} ${d.dateLabel}`, text };
    if (navigator.share) {
      try { await navigator.share(data); buzz(); return; } catch { /* annullato */ }
    }
    copy(text, "Giornata");
  }

  async function shareTrip() {
    const text = Store.days().map(dayText).join("\n\n———\n\n");
    if (navigator.share) {
      try { await navigator.share({ title: "Norvegia Artica · 12–22 agosto 2026", text }); buzz(); return; }
      catch { /* annullato */ }
    }
    download("NorvegiaArtica-itinerario.txt", text, "text/plain;charset=utf-8");
    toast("Itinerario scaricato");
  }

  /* ---------- storia del browser: il gesto indietro ------- */
  window.addEventListener("popstate", () => {
    if (openId) closeDay(true);
  });

  return { bind, mappa, documenti, avvisiCard, openDay, closeDay, shareDay, shareTrip, ICON2,
           get openId() { return openId; } };
})();
