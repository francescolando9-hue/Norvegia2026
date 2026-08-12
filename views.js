/* ============================================================
   Views — tutto ciò che si vede.
   ============================================================ */

const Views = (() => {
  "use strict";

  const { $, $$, el, esc, eur, eur2, nok, num, dateShort, todayISO, nowMinutes,
          mins, hhmm, dur, ICON, wxOf, seaState, toast, copy, buzz, sheet,
          closeSheet, field, actions, mapUrl, navUrl, download } = UI;

  const S = Store.S;
  const STATUS = { booked: "prenotato", todo: "da prenotare", verify: "da verificare" };
  const HOT = /^⚠|DA VERIFICARE|VERIFICA |CHIAMA|NON ANCORA|NON EMESSO|NON CHIUSO|— limite|PIENO|LIMITE/;

  let rerender = () => {};
  const bind = fn => { rerender = fn; };

  /* ========================================================
     stato di un giorno
     ======================================================== */
  function dayStatus(d) {
    const all = [...d.fixed.map(f => f.status), d.stay ? d.stay.status : "info"];
    if (all.includes("todo")) return "open";
    if (all.includes("verify")) return "verify";
    return "ok";
  }

  function currentIndex() {
    const t = todayISO();
    const i = TRIP.days.findIndex(d => d.date === t);
    if (i >= 0) return i;
    if (t < TRIP.days[0].date) return -1;
    if (t > TRIP.days[TRIP.days.length - 1].date) return -2;
    return 0;
  }


  /* chip del PIN: se il PIN c'è lo copia, se manca lo fa scrivere.
     I PIN non stanno nei dati pubblici, quindi questa è la via
     normale per averli su un telefono nuovo. */
  function pinChip(code, row) {
    const val = Store.pinFor(code);
    const b = el("button", val ? null : "codebtn--empty");
    b.innerHTML = val
      ? `<span class="k">pin</span>${esc(val)}`
      : `<span class="k">pin</span>da inserire`;
    b.onclick = () => {
      if (val) return copy(val, "PIN");
      textSheet("PIN del voucher " + code, "", v => Store.setPin(code, v), {
        label: "PIN", ph: "Come sul voucher GetYourGuide",
        hint: "Resta salvato su questo telefono e non finisce nel repository."
      });
    };
    row.appendChild(b);
    return b;
  }

  /* ========================================================
     sheet: spesa
     ======================================================== */
  function lineOptions(selected) {
    let html = `<option value="">— scegli —</option>`
      + `<option value="loose:extra"${selected === "loose:extra" ? " selected" : ""}>Fuori piano · nessuna voce</option>`;
    TRIP.budget.forEach(sec => {
      html += `<optgroup label="${esc(sec.section)}">`;
      sec.lines.forEach(l => {
        html += `<option value="line:${l.id}"${selected === "line:" + l.id ? " selected" : ""}>${esc(l.label)}</option>`;
      });
      html += `<option value="loose:${sec.id}"${selected === "loose:" + sec.id ? " selected" : ""}>Fuori piano · ${esc(sec.section)}</option>`;
      html += `</optgroup>`;
    });
    return html;
  }

  function dayOptions(selected) {
    const t = todayISO();
    return TRIP.days.map(d =>
      `<option value="${d.date}"${d.date === (selected || t) ? " selected" : ""}>${d.id} · ${esc(d.dow)} ${esc(d.dateLabel)}</option>`
    ).join("");
  }

  function expenseSheet(existing, prefill = {}) {
    const e = existing || {};
    const sel = e.lineId ? "line:" + e.lineId
      : (e.cat && !e.lineId ? "loose:" + e.cat
      : (prefill.lineId ? "line:" + prefill.lineId
      : (prefill.extra ? "loose:extra" : "")));
    const cur = e.cur || prefill.cur || "NOK";

    sheet(existing ? "Modifica spesa" : "Registra una spesa", (body, done) => {
      body.innerHTML = `
        ${field("Importo", `<div class="cur">
            <input class="in in--big" id="ex-amt" type="number" inputmode="decimal" step="0.01" min="0"
                   value="${e.amount != null ? e.amount : ""}" placeholder="0">
            <div class="seg seg--cur" id="ex-cur">
              <button data-v="NOK" class="${cur === "NOK" ? "on" : ""}">NOK</button>
              <button data-v="EUR" class="${cur === "EUR" ? "on" : ""}">EUR</button>
            </div>
          </div>`, `Cambio in uso: 1 € = ${num(S.fx)} NOK`)}
        ${field("Voce di budget", `<select class="in" id="ex-line">${lineOptions(sel)}</select>`,
                "Per un caff\u00e8 o un parcheggio va bene \u201cFuori piano\u201d: sceglierne una serve solo a far comparire la spesa nella sezione giusta del budget.")}
        ${field("Giorno", `<select class="in" id="ex-day">${dayOptions(e.date || prefill.date)}</select>`)}
        ${field("Nota", `<input class="in" id="ex-note" type="text" maxlength="80"
                 value="${esc(e.note || "")}" placeholder="Benzina a Finnsnes">`)}
        <div class="conv" id="ex-conv"></div>
        ${actions(existing ? "Salva" : "Aggiungi", existing ? "Elimina" : "Annulla")}`;

      const amt = $("#ex-amt", body);
      const conv = $("#ex-conv", body);
      let curr = cur;

      const paint = () => {
        const v = parseFloat(String(amt.value).replace(",", "."));
        if (!v || v <= 0) { conv.textContent = ""; return; }
        conv.textContent = curr === "NOK"
          ? `${nok(v)} = ${eur2(v / S.fx)}`
          : `${eur2(v)} = ${nok(v * S.fx)}`;
      };
      amt.addEventListener("input", paint); paint();

      $$("#ex-cur button", body).forEach(b => b.onclick = () => {
        curr = b.dataset.v;
        $$("#ex-cur button", body).forEach(x => x.classList.toggle("on", x === b));
        paint();
      });

      $('[data-act="ok"]', body).onclick = () => {
        const v = parseFloat(String(amt.value).replace(",", "."));
        if (!v || v <= 0) { amt.focus(); toast("Serve un importo"); return; }
        const raw = $("#ex-line", body).value;
        if (!raw) { toast("Scegli una voce"); return; }
        const [kind, id] = raw.split(":");
        const lo = kind === "line" ? Store.lineOf(id) : null;
        const rec = {
          amount: v, cur: curr,
          date: $("#ex-day", body).value,
          note: $("#ex-note", body).value.trim(),
          lineId: kind === "line" ? id : null,
          cat: kind === "line" ? (lo && lo.sec ? lo.sec.id : "extra") : id,
          // la tappa da cui è stata registrata: serve alle voci cumulative,
          // dove il totale della voce non è il costo di una singola tappa
          stopId: existing ? existing.stopId : (prefill.stopId || null)
        };
        if (existing) Store.updateExpense(existing.id, rec);
        else Store.addExpense(rec);
        buzz(); done(); rerender();
        toast(existing ? "Spesa aggiornata" : "Spesa registrata");
      };

      $('[data-act="cancel"]', body).onclick = () => {
        if (!existing) return done();
        Store.removeExpense(existing.id);
        done(); rerender(); toast("Spesa eliminata");
      };
    });
  }

  /* ========================================================
     sheet: testo libero
     ======================================================== */
  function textSheet(title, value, onSave, opts = {}) {
    sheet(title, (body, done) => {
      body.innerHTML = `
        ${field(opts.label || "Testo", opts.multi
          ? `<textarea class="in in--area" id="tx" rows="5" placeholder="${esc(opts.ph || "")}">${esc(value || "")}</textarea>`
          : `<input class="in" id="tx" type="text" value="${esc(value || "")}" placeholder="${esc(opts.ph || "")}">`,
          opts.hint)}
        ${actions("Salva", "Annulla")}`;
      $('[data-act="ok"]', body).onclick = () => { onSave($("#tx", body).value); done(); rerender(); };
      $('[data-act="cancel"]', body).onclick = done;
    });
  }

  /* ========================================================
     sheet: tappa aggiunta
     ======================================================== */
  function eventSheet(dayId) {
    sheet("Aggiungi una tappa", (body, done) => {
      body.innerHTML = `
        ${field("Orario", `<input class="in" id="ev-t" type="time" value="12:00">`)}
        ${field("Cosa", `<input class="in" id="ev-title" type="text" placeholder="Sosta a Nusfjord">`)}
        ${field("Dettaglio", `<input class="in" id="ev-meta" type="text" placeholder="Biglietto sul posto">`)}
        ${actions("Aggiungi", "Annulla")}`;
      $('[data-act="ok"]', body).onclick = () => {
        const title = $("#ev-title", body).value.trim();
        if (!title) { toast("Serve un titolo"); return; }
        (S.extra[dayId] = S.extra[dayId] || []).push({
          id: Store.uid(), t: $("#ev-t", body).value || "12:00",
          title, meta: $("#ev-meta", body).value.trim()
        });
        Store.save(); buzz(); done(); rerender(); toast("Tappa aggiunta");
      };
      $('[data-act="cancel"]', body).onclick = done;
    });
  }

  /* ========================================================
     sheet: meteo del giorno
     ======================================================== */
  function weatherSheet(d) {
    const w = Weather.forDay(d.id);
    sheet(`Meteo · ${d.wxPlace}`, (body) => {
      if (!w) {
        body.innerHTML = `<p class="empty">Nessun dato meteo in memoria. Serve una connessione per il primo scaricamento.</p>
          <div class="sheet__act"><button class="btn btn--go" id="wx-go">Riprova</button></div>`;
        $("#wx-go", body).onclick = async () => { await Weather.refresh(true); closeSheet(); rerender(); };
        return;
      }
      const [glyph, label] = wxOf(w.code);
      const sea = seaState(w.gust != null ? w.gust : w.wind);
      body.innerHTML = `
        <div class="wxbig">
          <span class="wxbig__g">${glyph}</span>
          <div>
            <div class="wxbig__t">${Math.round(w.tmax)}° <span>/ ${Math.round(w.tmin)}°</span></div>
            <div class="wxbig__l">${esc(label)} · ${esc(d.dow)} ${esc(d.dateLabel)}</div>
          </div>
        </div>
        <div class="wxgrid">
          <div><span>Vento max</span><b>${w.wind != null ? w.wind.toFixed(1) + " m/s" : "—"}</b></div>
          <div><span>Raffiche</span><b>${w.gust != null ? w.gust.toFixed(1) + " m/s" : "—"}</b></div>
          <div><span>Pioggia</span><b>${w.rain != null ? w.rain.toFixed(1) + " mm" : "—"}${w.rainP != null ? ` · ${w.rainP}%` : ""}</b></div>
          <div><span>Luce</span><b>${w.sunrise || "—"} → ${w.sunset || "—"}</b></div>
        </div>
        ${sea ? `<p class="seastate seastate--${sea.k}">Uscite in mare: ${esc(sea.t)} (dato da raffiche di ${(w.gust != null ? w.gust : w.wind).toFixed(1)} m/s).</p>` : ""}
        <p class="fld__h" style="margin-top:12px">Open-Meteo · ${esc(Weather.ageLabel())}. Le previsioni oltre 5–6 giorni sono indicative.</p>`;
    }, { focus: false });
  }

  /* ========================================================
     sheet: allegati
     ======================================================== */
  function filesSheet(owner, title) {
    sheet("Allegati · " + title, (body) => {
      body.innerHTML = `
        <p class="fld__h">PDF e foto restano sul telefono e si aprono anche senza rete. Non finiscono nel backup JSON.</p>
        <div class="filelist" id="fl"><p class="empty">Carico…</p></div>
        <label class="btn btn--go btn--file">
          ${ICON.clip}<span>Allega file</span>
          <input type="file" id="fl-in" multiple accept="image/*,application/pdf" hidden>
        </label>`;

      const list = $("#fl", body);

      async function paint() {
        let files = [];
        try { files = await Store.Files.list(owner); }
        catch { list.innerHTML = `<p class="empty">Questo browser non consente di salvare allegati.</p>`; return; }
        if (!files.length) { list.innerHTML = `<p class="empty">Nessun allegato.</p>`; return; }
        list.innerHTML = "";
        files.sort((a, b) => a.ts - b.ts).forEach(f => {
          const row = el("div", "filerow");
          row.innerHTML = `
            <button class="filerow__b">
              <b>${esc(f.name)}</b>
              <span>${(f.size / 1024).toFixed(0)} KB · ${f.type.includes("pdf") ? "PDF" : "immagine"}</span>
            </button>
            <button class="filerow__x" aria-label="Elimina">${ICON.trash}</button>`;
          $(".filerow__b", row).onclick = () => {
            const url = URL.createObjectURL(f.blob);
            window.open(url, "_blank");
            setTimeout(() => URL.revokeObjectURL(url), 60000);
          };
          $(".filerow__x", row).onclick = async () => {
            await Store.Files.remove(f.id); paint(); rerender(); toast("Allegato eliminato");
          };
          list.appendChild(row);
        });
      }
      paint();

      $("#fl-in", body).onchange = async e => {
        const files = [...e.target.files];
        for (const f of files) {
          if (f.size > 12 * 1024 * 1024) { toast(f.name + ": troppo grande (max 12 MB)"); continue; }
          try { await Store.Files.add(owner, f); } catch { toast("Salvataggio non riuscito"); }
        }
        e.target.value = "";
        paint(); rerender(); toast(files.length > 1 ? "Allegati salvati" : "Allegato salvato");
      };
    }, { focus: false });
  }

  /* ========================================================
     VISTA · GIORNI
     ======================================================== */

  function nowCard() {
    const idx = currentIndex();
    const openTodos = TRIP.todo.filter(t => !S.done[t.id]);
    const n = new Date();
    const clock = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
    const rows = [];
    let tag, head, sub;

    if (idx === -1) {
      const d0 = new Date(TRIP.days[0].date + "T00:00");
      const gg = Math.max(0, Math.round((d0 - new Date(n.toDateString())) / 864e5));
      tag = gg === 0 ? "si parte" : "conto alla rovescia";
      head = gg === 0 ? "Oggi si parte" : `Fra ${gg} giorn${gg === 1 ? "o" : "i"}`;
      sub = "Volo MXP → OSL alle 10:50 · Norwegian DY1877";
      rows.push(["Primo", "<b>G1 · mer 12 agosto</b><small>Oslo, mezza giornata in città e cena con tuo padre</small>"]);
    } else if (idx === -2) {
      tag = "archivio"; head = "Viaggio concluso";
      sub = "11 giorni, ~21 ore di guida, 5 uscite in mare.";
      const t = Store.totals();
      rows.push(["Speso", `<b>${eur(t.spent)}</b><small>contro ${eur(t.plan)} di preventivo</small>`]);
    } else {
      const d = Store.day(TRIP.days[idx]);
      const nowM = nowMinutes();
      // il pernotto entra nella sequenza al suo orario: la giornata
      // resta cronologica dall'inizio alla fine
      const seqItems = [...d.fixed];
      if (d.stay) seqItems.push({
        id: "stay", t: d.stay.t || "20:00", title: d.stay.name,
        kind: "stay", status: d.stay.status, at: d.stay.at,
        bill: stayLineId(d.id),
        meta: (d.stay.checkin ? [d.stay.checkin] : []).concat(d.stay.meta || []),
        isStay: true
      });
      const sorted = seqItems.sort((a, b) => mins(a.t) - mins(b.t));
      let next = sorted.find(f => mins(f.t) >= nowM);
      let sameDay = true;
      if (!next && TRIP.days[idx + 1]) {
        const nd = Store.day(TRIP.days[idx + 1]);
        next = [...nd.fixed].sort((a, b) => mins(a.t) - mins(b.t))[0];
        sameDay = false;
      }
      tag = "oggi";
      head = `${d.id} · ${d.dow} ${d.dateLabel}`;
      sub = d.arc + (d.drive ? ` · ${d.drive} di guida` : "");

      if (next) {
        const delta = mins(next.t) - nowM;
        const when = sameDay
          ? (delta > 0 ? `${next.t} · fra ${dur(delta)}` : next.t)
          : `domani ${next.t}`;
        rows.push(["Prossimo", `<b>${esc(next.title)}</b><small>${esc(when)}</small>`]);
      }
      if (d.stay) {
        rows.push(["Stanotte", `<b class="${d.stay.status === "todo" ? "now__alert" : ""}">${esc(d.stay.name)}</b><small>${esc(d.stay.place)}${d.stay.status === "todo" ? " · ancora da prenotare" : ""}</small>`]);
      }
      const w = Weather.forDay(d.id);
      if (w) {
        const [g, l] = wxOf(w.code);
        rows.push(["Meteo", `<b>${g} ${Math.round(w.tmax)}° / ${Math.round(w.tmin)}°</b><small>${esc(l)} · vento ${w.wind != null ? w.wind.toFixed(0) : "—"} m/s${w.sunset ? ` · luce fino alle ${w.sunset}` : ""}</small>`]);
      }
    }

    if (openTodos.length) {
      rows.push(["Aperti", `<b class="now__alert">${openTodos.length} da chiudere</b><small>${esc(openTodos[0].label)}</small>`]);
    }

    const c = el("div", "now");
    c.innerHTML = `
      <div class="now__top">
        <span class="now__tag">${esc(tag)}</span>
        <span class="now__clock">${clock}</span>
      </div>
      <h1 class="now__h">${esc(head)}</h1>
      <p class="now__sub">${esc(sub)}</p>
      <div class="now__rows">
        ${rows.map(([k, v]) => `<div class="now__row"><span class="now__k">${esc(k)}</span><span class="now__v">${v}</span></div>`).join("")}
      </div>`;
    if (idx >= 0) {
      c.querySelectorAll(".now__row").forEach(r => {
        if (r.querySelector(".now__k").textContent === "Aperti") r.style.cursor = "pointer";
      });
      c.onclick = e => {
        const k = e.target.closest(".now__row");
        if (k && k.querySelector(".now__k").textContent === "Aperti") App.go("prenota");
      };
    }
    return c;
  }

  function wxChip(d) {
    const w = Weather.forDay(d.id);
    const b = el("button", "wxchip" + (w ? "" : " wxchip--empty"));
    if (!w) {
      b.innerHTML = `<span class="wxchip__g">·</span><span class="wxchip__t">meteo</span>`;
    } else {
      const [g] = wxOf(w.code);
      const sea = seaState(w.gust != null ? w.gust : w.wind);
      const seaBad = d.fixed.some(f => f.sea) && sea && sea.k !== "ok";
      b.className += seaBad ? " wxchip--warn" : "";
      b.innerHTML = `<span class="wxchip__g">${g}</span><span class="wxchip__t">${Math.round(w.tmax)}°</span>
        <span class="wxchip__w">${w.wind != null ? w.wind.toFixed(0) : "—"} m/s</span>`;
    }
    b.onclick = () => weatherSheet(d);
    return b;
  }

  function eventNode(f, d, state) {
    const cls = ["booked", "todo", "verify", "free"].includes(f.status) ? f.status : "info";
    const n = el("div", `ev ev--${cls}` + (state === "live" ? " ev--live" : state === "past" ? " ev--past" : ""));
    n.innerHTML = `
      <div class="ev__t">${esc(f.t)}</div>
      <i class="ev__node"></i>
      <div class="ev__b">
        <p class="ev__title">${esc(f.title)}${f._custom ? '<span class="opt">tua</span>' : ""}</p>
        ${STATUS[f.status] && f.status !== "booked"
          ? `<div class="ev__tags"><span class="tag tag--${f.status === "todo" ? "open" : "verify"}">${STATUS[f.status]}</span></div>`
          : ""}
        ${(f.meta && f.meta.length) ? `<ul class="ev__meta">${f.meta.filter(Boolean).map(m => `<li${HOT.test(m) ? ' class="hot"' : ""}>${esc(m)}</li>`).join("")}</ul>` : ""}
      </div>`;
    const b = $(".ev__b", n);

    if (f.code || f.pin) {
      const row = el("div", "codes");
      if (f.code) { const x = el("button", null, `<span class="k">cod</span>${esc(f.code)}`); x.onclick = () => copy(f.code, "Codice"); row.appendChild(x); }
      if (f.hasPin) pinChip(f.code, row);
      b.appendChild(row);
    }
    if (f.map) {
      const a = el("a", "maplink");
      a.href = navUrl(f.map); a.target = "_blank"; a.rel = "noopener";
      a.innerHTML = `${ICON.nav}<span>Portami qui</span>`;
      b.appendChild(a);
    }
    if (f._custom) {
      const x = el("button", "ev__del", ICON.trash);
      x.title = "Rimuovi";
      x.onclick = () => {
        S.extra[d.id] = (S.extra[d.id] || []).filter(e => e.id !== f.id);
        Store.save(); rerender(); toast("Tappa rimossa");
      };
      n.appendChild(x);
    }
    return n;
  }
  /* ========================================================
     SCHEDA GIORNATA — riscritta

     Il modello è quello che usano Wanderlog, Tripsy e TripIt:
     una giornata è una sequenza ordinata di TAPPE numerate,
     con i TRASFERIMENTI come collegamenti tra una e l'altra.

     Prima ogni tappa mostrava tutto sempre: 25 righe per un
     giorno. Ora ogni tappa è una riga sola — icona, numero,
     ora, nome, un dettaglio — e si apre al tocco.
     ======================================================== */

  /* trasferimenti: non sono tappe, sono ciò che sta in mezzo */
  const LEG_KINDS = ["drive", "transport", "ferry"];
  const isLeg = f => LEG_KINDS.includes(f.kind);

  /* icona per tipo: riconosci l'oggetto prima di leggerlo */
  const KIND_ICON = {
    flight:   '<svg viewBox="0 0 24 24"><path d="M3 15l18-6-3.5 8-3-3.5-4 2.5L3 15z"/><path d="M11 12.5 8 9"/></svg>',
    car:      '<svg viewBox="0 0 24 24"><path d="M4 13l1.6-4.4A2 2 0 0 1 7.5 7h9a2 2 0 0 1 1.9 1.6L20 13v4h-1.5M4 17v-4m0 4h1.5m13 0H5.5"/><circle cx="7.5" cy="17" r="1.4"/><circle cx="16.5" cy="17" r="1.4"/></svg>',
    ferry:    '<svg viewBox="0 0 24 24"><path d="M4 13h16l-2 6H6l-2-6z"/><path d="M6.5 13V8h11v5M12 8V5"/><path d="M2 21c2-1.4 3.5 1 5.5-.4"/></svg>',
    drive:    '<svg viewBox="0 0 24 24"><path d="M5 20V9l7-5 7 5v11"/><path d="M12 20v-6"/></svg>',
    stay:     '<svg viewBox="0 0 24 24"><path d="M2 18v-5h20v5M2 18v2M22 18v2M4 13V8h6v5M14 11h6a2 2 0 0 1 2 2"/></svg>',
    activity: '<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6.1.8-4.4 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.3 9.4l6.1-.8z"/></svg>',
    dive:     '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.2"/><path d="M2 15c2.2-1.8 4-.2 6 0s3.8-1.8 6 0 3.8-.2 6-1M2 19c2.2-1.8 4-.2 6 0s3.8-1.8 6 0 3.8-.2 6-1"/></svg>',
    trek:     '<svg viewBox="0 0 24 24"><path d="M3 20h18L14 6l-3 5-2-2-6 11z"/></svg>',
    meal:     '<svg viewBox="0 0 24 24"><path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10"/><path d="M16 3c-1.5 1-2 2.5-2 4.5S15 11 16 11s2-1.5 2-3.5S17.5 4 16 3zM16 11v10"/></svg>',
    stop:     '<svg viewBox="0 0 24 24"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    info:     '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>'
  };
  const kindIcon = k => KIND_ICON[k] || KIND_ICON.info;

  const KIND_LABEL = {
    flight: "volo", car: "auto", ferry: "traghetto", drive: "in strada",
    stay: "alloggio", activity: "attività", dive: "immersione",
    trek: "trekking", meal: "pasto", stop: "sosta", info: "riferimento"
  };

  /* quali tappe sono aperte: transitorio, si riparte compatti */
  const openStops = new Set();

  /* il dettaglio da mostrare nella riga compatta */
  function subLine(f) {
    if (f.sub) return f.sub;
    const pl = f.at && TRIP.places[f.at];
    if (pl && pl.addr) return pl.addr;
    if (f.meta && f.meta.length) return f.meta[0];
    return "";
  }

  function placeOf(x) { return x && x.at ? TRIP.places[x.at] : null; }
  function addrOf(x) {
    const pl = placeOf(x);
    return pl ? (pl.addr || pl.name) : (x && x.map) || null;
  }

  /* ---------- collegamento fra due tappe ------------------- */
  function legRow(f, d) {
    const row = el("div", "leg" + (f.status === "todo" ? " leg--todo" : f.status === "verify" ? " leg--verify" : ""));
    let dur = (f.meta || []).map(m => (m.match(/~?\d+\s*h\s*\d*\d*|\d+\s*min/) || [])[0]).find(Boolean);
    // se la tratta non dichiara una durata e il giorno ne ha una sola, uso quella
    if (!dur && d.fixed.filter(isLeg).length === 1) dur = [d.km, d.drive].filter(Boolean).join(" · ");
    row.innerHTML = `
      <span class="leg__rail"><i></i></span>
      <span class="leg__b">
        <span class="leg__t">${esc(f.title)}</span>
        <span class="leg__d">${esc([f.t, dur].filter(Boolean).join(" · "))}</span>
      </span>
      <span class="leg__go">${ICON.caret}</span>`;

    const det = el("div", "leg__det");
    det.hidden = true;
    det.innerHTML = (f.meta && f.meta.length)
      ? `<ul class="ev__meta">${f.meta.map(m => `<li${HOT.test(m) ? ' class="hot"' : ""}>${esc(m)}</li>`).join("")}</ul>` : "";
    const a = addrOf(f);
    if (a) {
      const nav = el("a", "maplink");
      nav.href = navUrl(a); nav.target = "_blank"; nav.rel = "noopener";
      nav.innerHTML = `${ICON.nav}<span>Indicazioni</span>`;
      det.appendChild(nav);
    }
    row.appendChild(det);

    $(".leg__b", row).parentElement.addEventListener("click", e => {
      if (e.target.closest("a")) return;
      det.hidden = !det.hidden;
      row.classList.toggle("leg--open", !det.hidden);
      buzz();
    });
    return row;
  }

  /* ========================================================
     sheet: gli extra di una giornata
     Il caffè, il parcheggio, il panino. Tutto ciò che non era
     preventivato come attività. Qui li vedi, li correggi e li
     cancelli, senza passare dal registro generale.
     ======================================================== */
  function extraSheet(d) {
    sheet("Extra · " + d.dow + " " + d.dateLabel, (body, done) => {
      body.innerHTML = `<div id="ex-list"></div>
        <button class="btn btn--go btn--full" id="ex-add">${ICON.plus}<span>Aggiungi una spesa</span></button>
        <p class="fld__h">Extra sono le spese senza un preventivo proprio: cibo, carburante,
        pedaggi, imprevisti. Il costo delle attività già in programma si registra dalla tappa.</p>`;

      function paint() {
        const list = $("#ex-list", body);
        const voci = Store.extrasOn(d.date);
        if (!voci.length) {
          list.innerHTML = `<p class="empty">Nessun extra per questa giornata.</p>`;
          return;
        }
        const tot = voci.reduce((a, e) => a + Store.toEur(e), 0);
        list.innerHTML = `<div class="exsum"><span>Totale del giorno</span><b>${eur2(tot)}</b></div>`;
        voci.forEach(e => {
          const lo = e.lineId ? Store.lineOf(e.lineId) : null;
          const row = el("div", "exrow");
          row.innerHTML = `
            <button class="exrow__b">
              <b>${esc(e.note || (lo ? lo.line.label : "Spesa"))}</b>
              <span>${esc(lo ? lo.line.label : "fuori piano")}</span>
            </button>
            <span class="exrow__v">${e.cur === "NOK" ? nok(e.amount) : eur2(e.amount)}
              ${e.cur === "NOK" ? `<em>${eur2(Store.toEur(e))}</em>` : ""}</span>
            <button class="exrow__x" aria-label="Elimina">${ICON.trash}</button>`;
          $(".exrow__b", row).onclick = () => { closeSheet(); expenseSheet(e); };
          $(".exrow__x", row).onclick = () => {
            Store.removeExpense(e.id); buzz(); paint(); rerender(); toast("Spesa eliminata");
          };
          list.appendChild(row);
        });
      }
      paint();

      $("#ex-add", body).onclick = () => {
        closeSheet();
        expenseSheet(null, { date: d.date, extra: true });
      };
    }, { focus: false });
  }

  /* ---------- il costo di questa tappa ----------------------
     Prima l'unico modo era il pulsante "Spesa" del giorno, che
     accumulava un totale indistinto. Ora ogni tappa collegata a
     una voce di budget mostra quanto è preventivato, quanto hai
     speso davvero, e permette di registrarlo da lì.
     -------------------------------------------------------- */
  function costBlock(f, key) {
    if (!f.bill) return null;
    const lo = Store.lineOf(f.bill);
    if (!lo) return null;
    const pool0 = !!lo.line.pool;
    // Una voce cumulativa è condivisa da tutto il viaggio: il suo totale
    // non è il costo di questa tappa. Quindi qui conto solo le spese
    // registrate DA questa tappa.
    const spese = pool0
      ? Store.expensesFor(f.bill).filter(e => e.stopId === key)
      : Store.expensesFor(f.bill);
    const speso = spese.reduce((a, e) => a + Store.toEur(e), 0);
    const box = el("div", "cost" + (speso > 0 ? " cost--paid" : ""));

    // una voce cumulativa (cibo, carburante, varie) copre tutto il viaggio:
    // mostrarne il preventivo accanto a una singola tappa sarebbe fuorviante
    const pool = pool0;
    if (pool && speso === 0) {
      box.classList.add("cost--pool");
      box.innerHTML = `<div class="cost__row">
        <span class="cost__k">Su “${esc(lo.line.label)}”</span>
        <span class="cost__d">nulla registrato</span>
      </div>`;
    } else box.innerHTML = `
      <div class="cost__row">
        <span class="cost__k">${speso > 0 ? "Speso" : "Preventivo"}</span>
        <span class="cost__v">${eur2(speso > 0 ? speso : lo.line.plan)}</span>
      </div>
      ${!pool && speso > 0 && Math.abs(speso - lo.line.plan) >= 1
        ? `<div class="cost__row cost__row--sub">
             <span class="cost__k">Preventivo</span>
             <span class="cost__d">${eur2(lo.line.plan)}
               <em class="${speso > lo.line.plan ? "up" : "down"}">${speso > lo.line.plan ? "+" : "−"}${
                 eur2(Math.abs(speso - lo.line.plan)).replace("€ ", "")}</em></span>
           </div>` : ""}
      ${spese.length > 1 ? `<div class="cost__n">${spese.length} registrazioni</div>` : ""}`;

    const acts = el("div", "cost__acts");
    const add = el("button", "minibtn minibtn--go");
    add.innerHTML = `${ICON.coin}<span>${speso > 0 ? "Aggiungi" : "Registra la spesa"}</span>`;
    add.onclick = e => {
      e.stopPropagation();
      expenseSheet(null, { lineId: f.bill, date: f.date || null, stopId: key });
    };
    acts.appendChild(add);

    if (spese.length === 1) {
      const mod = el("button", "minibtn");
      mod.innerHTML = `${ICON.pencil}<span>Correggi</span>`;
      mod.onclick = e => { e.stopPropagation(); expenseSheet(spese[0]); };
      acts.appendChild(mod);
    } else if (spese.length > 1) {
      const vedi = el("button", "minibtn");
      vedi.innerHTML = `${ICON.coin}<span>Vedi tutte</span>`;
      vedi.onclick = e => {
        e.stopPropagation();
        S.view = "budget"; S.tab.budget = "spese"; Store.save(); App.render();
      };
      acts.appendChild(vedi);
    }
    box.appendChild(acts);
    return box;
  }

  /* ---------- tappa ---------------------------------------- */
  function stopKey(d, f) { return d.id + "/" + (f.id || f.title); }

  function stopRow(f, d, n, state) {
    const key = stopKey(d, f);
    const opened = openStops.has(key);
    const cls = f.status === "booked" ? "booked"
              : f.status === "todo" ? "todo"
              : f.status === "verify" ? "verify"
              : f.status === "free" ? "free" : "info";

    const row = el("div", `stop stop--${cls}` + (f.isStay ? " stop--stay" : "") +
      (state ? " stop--" + state : "") + (opened ? " stop--open" : ""));
    const sub = subLine(f);

    row.innerHTML = `
      <button class="stop__hd">
        <span class="stop__n">${n || ""}</span>
        <span class="stop__ic">${kindIcon(f.kind)}</span>
        <span class="stop__b">
          <span class="stop__top">
            <span class="stop__t">${esc(f.t)}</span>
            ${STATUS[f.status] && f.status !== "booked"
              ? `<span class="tag tag--${f.status === "todo" ? "open" : "verify"}">${STATUS[f.status]}</span>` : ""}
          </span>
          <span class="stop__title">${esc(f.title)}</span>
          ${sub ? `<span class="stop__sub">${esc(sub)}</span>` : ""}
        </span>
        <span class="stop__caret">${ICON.caret}</span>
      </button>
      ${f.isStay ? `<button class="stop__edit" aria-label="Modifica il pernotto">${ICON.pencil}</button>` : ""}`;

    const det = el("div", "stop__det");
    det.hidden = !opened;

    const pl = placeOf(f);
    let html = "";
    if (pl) {
      html += `<div class="stop__place">
        <b>${esc(pl.name)}</b>
        ${pl.addr ? `<span>${esc(pl.addr)}</span>` : ""}
        ${pl.note ? `<em>${esc(pl.note)}</em>` : ""}
      </div>`;
    }
    // il sottotitolo della riga compatta non va ristampato qui sotto
    const resto = (f.meta || []).filter(m => m && m !== sub);
    if (resto.length) {
      html += `<ul class="ev__meta">${resto.map(m => `<li${HOT.test(m) ? ' class="hot"' : ""}>${esc(m)}</li>`).join("")}</ul>`;
    }
    det.innerHTML = html;

    const cost = costBlock(Object.assign({ date: d.date }, f), key);
    if (cost) det.appendChild(cost);

    if (f.code || f.hasPin) {
      const codes = el("div", "codes");
      if (f.code) {
        const b = el("button", null, `<span class="k">cod</span>${esc(f.code)}`);
        b.onclick = () => copy(f.code, "Codice");
        codes.appendChild(b);
      }
      if (f.hasPin) pinChip(f.code, codes);
      det.appendChild(codes);
    }

    const acts = el("div", "stop__acts");
    const a = addrOf(f);
    if (a) {
      const nav = el("a", "minibtn minibtn--go");
      nav.href = navUrl(a); nav.target = "_blank"; nav.rel = "noopener";
      nav.innerHTML = `${ICON.nav}<span>Portami qui</span>`;
      acts.appendChild(nav);
    }
    if (pl && pl.tel) {
      const tel = el("a", "minibtn");
      tel.href = "tel:" + pl.tel.replace(/\s/g, "");
      tel.innerHTML = `${ICON.phone}<span>${esc(pl.tel)}</span>`;
      acts.appendChild(tel);
    }
    if (acts.children.length) det.appendChild(acts);

    row.appendChild(det);

    if (f.isStay) $(".stop__edit", row).onclick = e => { e.stopPropagation(); staySheet(d); };
    $(".stop__hd", row).onclick = () => {
      if (openStops.has(key)) openStops.delete(key); else openStops.add(key);
      det.hidden = !openStops.has(key);
      row.classList.toggle("stop--open", openStops.has(key));
      buzz();
    };
    return row;
  }

  /* ---------- la scheda ----------------------------------- */
  function dayCard(d, opt = {}) {
    const full = !!opt.full;
    const t = todayISO();
    const isToday = d.date === t, isPast = d.date < t;
    const st = dayStatus(d);
    const zona = /Lofoten/.test(d.region) ? "lofoten"
               : /Senja/.test(d.region) ? "senja"
               : /Vester|Andøya/.test(d.region) ? "vesteralen"
               : /Bod/.test(d.region) ? "bodo" : "citta";
    const card = el("article", `day day--z-${zona}` +
      (isToday ? " day--on" : "") + (isPast ? " day--past" : ""));
    card.id = "d-" + d.id;

    /* --- intestazione --- */
    const w = Weather.forDay(d);
    const head = el("div", "day__head" + (full ? " day__head--full" : ""));
    head.innerHTML = `
      <div class="day__id">
        ${full ? "" : `<span class="day__n">${esc(d.id)}</span>
        <span class="day__date">${esc(d.dow)} ${esc(d.dateLabel)}</span>`}
      </div>
      <h2 class="day__place">${esc(d.wxPlace)}</h2>
      <div class="day__arc">${esc(d.arc)}${d.km ? `<span class="sep">·</span>${esc(d.km)}` : ""}${d.drive ? `<span class="sep">·</span>${esc(d.drive)}` : ""}</div>
      <p class="day__line">${esc(d.headline)}</p>
      <div class="day__facts"></div>`;
    const badges = el("div", "day__meta");
    badges.appendChild(wxChip(d));
    badges.appendChild(el("span", `day__badge day__badge--${st}`,
      st === "ok" ? "chiuso" : st === "verify" ? "verifica" : "aperto"));
    $(".day__id", head).appendChild(badges);

    /* riga dei fatti del giorno: dove dormi e quanta luce hai */
    const facts = $(".day__facts", head);
    if (d.stay) {
      const bed = el("button", "bedchip" + (d.stay.status === "todo" ? " bedchip--todo" : ""));
      const corto = d.stay.name.split(/[—·,]/)[0].trim();
      bed.innerHTML = `${ICON.bed}<span>${esc(corto)}</span>`;
      bed.title = "Dormi qui: " + d.stay.name;
      bed.onclick = e => { e.stopPropagation(); staySheet(d); };
      facts.appendChild(bed);
    }
    if (w && w.sunrise && w.sunset) {
      const a = w.sunrise.split(":"), b = w.sunset.split(":");
      const ore = Math.round(((+b[0] * 60 + +b[1]) - (+a[0] * 60 + +a[1])) / 60);
      facts.appendChild(el("span", "sunchip",
        `${ICON.sun}<span>${esc(w.sunrise)}–${esc(w.sunset)}</span><em>${ore}h di luce</em>`));
    }
    if (!facts.children.length) facts.remove();

    if (!full) {
      head.classList.add("day__head--tap");
      head.setAttribute("role", "button");
      head.setAttribute("tabindex", "0");
      head.setAttribute("aria-label", "Apri " + d.id);
      const open = e => {
        if (e.target.closest(".wxchip")) return;
        buzz(); Extra.openDay(d.id);
      };
      head.addEventListener("click", open);
      head.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(e); }
      });
      $(".day__meta", head).appendChild(el("span", "day__open", ICON.caret));
    }
    card.appendChild(head);

    const body = el("div", "day__body");

    /* --- mappa del giorno con le tappe numerate --- */
    if (full) {
      const m = Extra.dayMap(d);
      if (m) body.appendChild(m);
    }

    /* --- sequenza: tappe numerate e trasferimenti in mezzo --- */
    if (d.fixed.length || d.stay) {
      const seq = el("div", "seq");
      // il pernotto entra nella sequenza al suo orario: la giornata
      // resta cronologica dall'inizio alla fine
      const seqItems = [...d.fixed];
      if (d.stay) seqItems.push({
        id: "stay", t: d.stay.t || "20:00", title: d.stay.name,
        kind: "stay", status: d.stay.status, at: d.stay.at,
        bill: stayLineId(d.id),
        meta: (d.stay.checkin ? [d.stay.checkin] : []).concat(d.stay.meta || []),
        isStay: true
      });
      const sorted = seqItems.sort((a, b) => mins(a.t) - mins(b.t));
      const nowM = nowMinutes();
      let liveIdx = -1;
      if (isToday) for (let i = 0; i < sorted.length; i++) if (mins(sorted[i].t) <= nowM) liveIdx = i;

      let n = 0, lineDone = !isToday;
      sorted.forEach((f, i) => {
        if (!lineDone && mins(f.t) > nowM) {
          seq.appendChild(el("div", "nowline", `<i></i><span>adesso ${hhmm(nowM)}</span>`));
          lineDone = true;
        }
        const state = isToday ? (i === liveIdx ? "live" : i < liveIdx ? "past" : "") : "";
        if (isLeg(f)) seq.appendChild(legRow(f, d));
        else seq.appendChild(stopRow(f, d, ++n, state));
      });
      if (!lineDone) seq.appendChild(el("div", "nowline nowline--end", `<i></i><span>adesso ${hhmm(nowM)}</span>`));
      body.appendChild(seq);
    }

    /* --- senza orario --- */
    if (d.flex.length) {
      const fb = el("div", "flexband");
      fb.innerHTML = `<span class="eyebrow">Senza orario</span>
        <ul>${d.flex.map(f => `<li><b>${esc(f.title)}${f.optional ? '<span class="opt">opzionale</span>' : ""}</b><small>${esc(f.meta)}</small></li>`).join("")}</ul>`;
      body.appendChild(fb);
    }

    /* --- nota personale --- */
    if (d.userNote) {
      const noteWrap = el("div", "unote");
      noteWrap.innerHTML = `<span class="eyebrow">La tua nota</span><p>${esc(d.userNote)}</p>`;
      noteWrap.onclick = () => textSheet("Nota · " + d.dateLabel, d.userNote,
        v => { if (v.trim()) S.notes[d.id] = v.trim(); else delete S.notes[d.id]; Store.save(); },
        { multi: true, label: "Nota", ph: "Numero di casa, dove ho parcheggiato, cosa dice il gestore…" });
      body.appendChild(noteWrap);
    }

    /* --- azioni --- */
    const acts = el("div", "dayacts");
    const mk = (icon, label, fn) => { const b = el("button", null, `${icon}<span>${label}</span>`); b.onclick = fn; return b; };
    // il contatore riguarda solo gli extra: se non ne hai aggiunti,
    // il pulsante resta senza cifra
    const extra = Store.extraTotal(d.date);
    acts.appendChild(mk(ICON.coin, extra ? "Extra " + eur(extra) : "Altra spesa",
      () => extra ? extraSheet(d) : expenseSheet(null, { date: d.date, extra: true })));
    acts.appendChild(mk(ICON.pencil, "Nota", () => textSheet(
      "Nota · " + d.dateLabel, d.userNote,
      v => { if (v.trim()) S.notes[d.id] = v.trim(); else delete S.notes[d.id]; Store.save(); },
      { multi: true, label: "Nota", ph: "Numero di casa, dove ho parcheggiato, cosa dice il gestore…" })));
    acts.appendChild(mk(ICON.plus, "Tappa", () => eventSheet(d.id)));
    body.appendChild(acts);

    if (d.notes.length) {
      const det = el("details", "notes");
      det.innerHTML = `<summary class="notes__btn">Perché è così<span class="caret">${ICON.caret}</span></summary>
        <div class="notes__body">${d.notes.map(p => `<p>${esc(p)}</p>`).join("")}</div>`;
      body.appendChild(det);
    }

    card.appendChild(body);
    return card;
  }

  function giorni() {
    const v = el("div", "view");
    v.appendChild(nowCard());

    const al = Extra.avvisiCard(true);
    if (al) v.appendChild(al);

    const seg = el("div", "seg seg--top");
    seg.innerHTML = `
      <button data-v="lista" class="${S.tab.giorni === "lista" ? "on" : ""}">Lista</button>
      <button data-v="mappa" class="${S.tab.giorni === "mappa" ? "on" : ""}">Mappa</button>`;
    $$("button", seg).forEach(b => b.onclick = () => {
      S.tab.giorni = b.dataset.v; Store.save(); buzz(); rerender();
    });
    v.appendChild(seg);

    if (S.tab.giorni === "mappa") { v.appendChild(Extra.mappa()); return v; }

    const h = el("div", "sect-head");
    h.innerHTML = `<span class="eyebrow">11 giorni</span><i class="rule"></i>
      <span class="eyebrow">${esc(Weather.loading ? "meteo in aggiornamento" : Weather.ageLabel())}</span>`;
    v.appendChild(h);
    Store.days().forEach(d => v.appendChild(dayCard(d)));
    return v;
  }

  /* ========================================================
     VISTA · PRENOTA
     ======================================================== */

  let fileCounts = {};
  let fileCountsSig = null;   // evita il rerender a vuoto: si aggiorna solo se cambia

  function prenota() {
    const v = el("div", "view");
    const open = TRIP.todo.filter(t => !S.done[t.id]);

    const h1 = el("div", "sect-head");
    h1.innerHTML = `<span class="eyebrow">Da chiudere</span><i class="rule"></i><span class="eyebrow">${open.length} di ${TRIP.todo.length}</span>`;
    v.appendChild(h1);

    const list = el("div");
    [...TRIP.todo]
      .sort((a, b) => (!!S.done[a.id] - !!S.done[b.id]) || (a.pri - b.pri))
      .forEach(t => {
        const row = el("div", "todo" + (S.done[t.id] ? " todo--done" : ""));
        row.innerHTML = `
          <button class="todo__box" aria-label="Segna come fatto">${ICON.check}</button>
          <div class="todo__b">
            <p class="todo__label">${esc(t.label)}</p>
            <p class="todo__why">${esc(t.why)}</p>
            <div class="todo__foot">
              <span class="todo__how">${esc(t.how)}</span>
              <span class="todo__when pri${t.pri}">${esc(t.when)}</span>
            </div>
            <div class="todo__cta"></div>
          </div>`;
        const cta = $(".todo__cta", row);
        if (t.tel) {
          const a = el("a", "minibtn"); a.href = "tel:" + t.tel;
          a.innerHTML = `${ICON.phone}<span>Chiama</span>`; cta.appendChild(a);
        }
        if (t.url) {
          const a = el("a", "minibtn"); a.href = t.url; a.target = "_blank"; a.rel = "noopener";
          a.innerHTML = `${ICON.ext}<span>Apri il sito</span>`; cta.appendChild(a);
        }
        if (!cta.children.length) cta.remove();
        $(".todo__box", row).onclick = () => {
          S.done[t.id] = !S.done[t.id];
          if (!S.done[t.id]) delete S.done[t.id];
          Store.save(); buzz(); rerender();
        };
        list.appendChild(row);
      });
    v.appendChild(list);

    TRIP.bookings.forEach(g => {
      const h = el("div", "sect-head");
      h.innerHTML = `<span class="eyebrow">${esc(g.group)}</span><i class="rule"></i>`;
      v.appendChild(h);
      g.items.forEach(it => {
        const c = el("div", "card bk");
        const tc = it.status === "booked" ? "ok" : it.status === "verify" ? "verify" : "open";
        const n = fileCounts[it.id] || 0;
        c.innerHTML = `
          <div class="bk__top">
            <p class="ev__title">${esc(it.title)}</p>
            <span class="tag tag--${tc}">${STATUS[it.status] || it.status}</span>
          </div>
          <div class="day__arc bk__when">${esc(it.when)}</div>
          ${(it.meta && it.meta.length) ? `<ul class="ev__meta">${it.meta.map(m => `<li${HOT.test(m) ? ' class="hot"' : ""}>${esc(m)}</li>`).join("")}</ul>` : ""}`;
        if (it.code || it.pin) {
          const row = el("div", "codes");
          if (it.code) { const b = el("button", null, `<span class="k">cod</span>${esc(it.code)}`); b.onclick = () => copy(it.code, "Codice"); row.appendChild(b); }
          if (it.hasPin) pinChip(it.code, row);
          c.appendChild(row);
        }
        const clip = el("button", "minibtn minibtn--wide" + (n ? " minibtn--on" : ""));
        clip.innerHTML = `${ICON.clip}<span>${n ? `${n} allegat${n === 1 ? "o" : "i"}` : "Allega voucher"}</span>`;
        clip.onclick = () => filesSheet(it.id, it.title);
        c.appendChild(clip);
        v.appendChild(c);
      });
    });

    Store.Files.counts().then(m => {
      const sig = JSON.stringify(m);
      if (sig === fileCountsSig) return;
      fileCountsSig = sig;
      fileCounts = m;
      if (S.view === "prenota") rerender();
    }).catch(() => {});

    return v;
  }



  /* ========================================================
     sheet: pernotto — nome, stato e prezzo in un colpo solo.
     Segnare "prenotato" aggiorna il badge del giorno, il
     contatore delle notti aperte e la card di oggi. Il prezzo
     diventa una spesa collegata alla voce di budget del giorno.
     ======================================================== */
  function stayLineId(dayId) {
    const d = TRIP.days.find(x => x.id === dayId);
    if (!d) return null;
    const num = d.dateLabel.split(" ")[0];
    const sec = TRIP.budget.find(b => b.id === "alloggi");
    const line = sec && sec.lines.find(l => l.day.split(" ")[0] === num);
    return line ? line.id : null;
  }

  function staySheet(d) {
    const seed = TRIP.days.find(x => x.id === d.id).stay;
    const lineId = stayLineId(d.id);
    const already = lineId ? Store.expensesFor(lineId) : [];

    sheet("Pernotto · " + d.dateLabel, (body, done) => {
      body.innerHTML = `
        ${field("Struttura", `<input class="in" id="st-name" type="text" maxlength="70"
                 value="${esc(d.stay.name)}" placeholder="Nome della struttura">`,
                "Svuota il campo per tornare al nome originale.")}
        ${field("Stato", `<div class="seg seg--cur" id="st-status">
            <button data-v="todo" class="${d.stay.status === "todo" ? "on" : ""}">Da prenotare</button>
            <button data-v="verify" class="${d.stay.status === "verify" ? "on" : ""}">Da verificare</button>
            <button data-v="booked" class="${d.stay.status === "booked" ? "on" : ""}">Prenotato</button>
          </div>`)}
        ${already.length ? "" : field("Quanto hai pagato", `<div class="cur">
            <input class="in in--big" id="st-amt" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0">
            <div class="seg seg--cur" id="st-cur">
              <button data-v="NOK" class="on">NOK</button>
              <button data-v="EUR">EUR</button>
            </div>
          </div>`, "Facoltativo. Diventa una spesa registrata sulla voce di budget di questa notte.")}
        <div class="conv" id="st-conv"></div>
        ${already.length ? `<p class="fld__h">Già registrato per questa notte: ${
            eur2(already.reduce((a, e) => a + Store.toEur(e), 0))
          }. Per correggerlo vai in Budget → Spese.</p>` : ""}
        ${actions("Salva", "Annulla")}`;

      let cur = "NOK";
      const amt = $("#st-amt", body);
      const conv = $("#st-conv", body);
      const paint = () => {
        if (!amt) return;
        const v = parseFloat(String(amt.value).replace(",", "."));
        if (!v || v <= 0) { conv.textContent = ""; return; }
        conv.textContent = cur === "NOK" ? `${nok(v)} = ${eur2(v / S.fx)}` : `${eur2(v)} = ${nok(v * S.fx)}`;
      };
      if (amt) amt.addEventListener("input", paint);
      $$("#st-cur button", body).forEach(b => b.onclick = () => {
        cur = b.dataset.v;
        $$("#st-cur button", body).forEach(x => x.classList.toggle("on", x === b));
        paint();
      });

      let status = d.stay.status;
      $$("#st-status button", body).forEach(b => b.onclick = () => {
        status = b.dataset.v;
        $$("#st-status button", body).forEach(x => x.classList.toggle("on", x === b));
      });

      $('[data-act="ok"]', body).onclick = () => {
        const name = $("#st-name", body).value.trim();
        Store.setEdit(`${d.id}.stay.name`, name || seed.name);
        if (status !== seed.status) Store.setEdit(`${d.id}.stay.status`, status);
        else Store.setEdit(`${d.id}.stay.status`, null);

        if (amt) {
          const v = parseFloat(String(amt.value).replace(",", "."));
          if (v > 0) {
            Store.addExpense({
              amount: v, cur, date: d.date, lineId, cat: "alloggi",
              note: (name || seed.name) + " · notte " + d.dateLabel
            });
          }
        }
        buzz(); done(); rerender();
        toast(status === "booked" ? "Notte segnata come prenotata" : "Pernotto aggiornato");
      };
      $('[data-act="cancel"]', body).onclick = done;
    });
  }

  /* ========================================================
     esportazione su calendario (.ics)
     Tutto il viaggio è in fuso Europe/Oslo, che ad agosto è
     UTC+2 come l'Italia: gli orari si convertono sottraendo 2h.
     ======================================================== */
  function icsText() {
    const pad = n => String(n).padStart(2, "0");
    const esc7 = t => String(t).replace(/[\\;,]/g, m => "\\" + m).replace(/\n/g, "\\n");
    const stamp = (date, minutes) => {
      const d = new Date(date + "T00:00:00Z");
      d.setUTCMinutes(d.getUTCMinutes() + minutes - 120); // da CEST a UTC
      return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate())
           + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z";
    };
    const now = stamp(todayISO(), nowMinutes());
    const L = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Norvegia Artica 2026//IT",
      "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Norvegia Artica 2026",
      "X-WR-TIMEZONE:Europe/Oslo"
    ];
    let n = 0;

    Store.days().forEach(d => {
      d.fixed.forEach(f => {
        const m = mins(f.t);
        const long = /safari|crociera|corso|snorkeling|traghetto Moskenes|cavallo|kayak/i.test(f.title);
        const dur = long ? 180 : 60;
        const desc = (f.meta || []).join(" · ")
          + (f.code ? " · cod. " + f.code : "")
          + (Store.pinFor(f.code) ? " · PIN " + Store.pinFor(f.code) : "");
        L.push("BEGIN:VEVENT",
          "UID:" + d.id + "-" + n++ + "@norvegia2026",
          "DTSTAMP:" + now,
          "DTSTART:" + stamp(d.date, m),
          "DTEND:" + stamp(d.date, m + dur),
          "SUMMARY:" + esc7((f.status === "todo" ? "[da prenotare] " : "") + f.title),
          "LOCATION:" + esc7(f.map || d.wxPlace || ""),
          "DESCRIPTION:" + esc7(desc));
        if (f.status === "booked" || f.status === "verify") {
          L.push("BEGIN:VALARM", "TRIGGER:-PT60M", "ACTION:DISPLAY",
                 "DESCRIPTION:" + esc7(f.title), "END:VALARM");
        }
        L.push("END:VEVENT");
      });
      if (d.stay) {
        L.push("BEGIN:VEVENT",
          "UID:" + d.id + "-stay@norvegia2026",
          "DTSTAMP:" + now,
          "DTSTART;VALUE=DATE:" + d.date.replace(/-/g, ""),
          "SUMMARY:" + esc7("Notte · " + d.stay.name + (d.stay.status === "todo" ? " [da prenotare]" : "")),
          "LOCATION:" + esc7(d.stay.map || d.stay.place || ""),
          "DESCRIPTION:" + esc7((d.stay.meta || []).join(" · ")),
          "END:VEVENT");
      }
    });

    L.push("END:VCALENDAR");
    return L.join("\r\n");
  }

  /* ========================================================
     VISTA · BUDGET
     ======================================================== */

  function budget() {
    const v = el("div", "view");
    const seg = el("div", "seg seg--top");
    seg.innerHTML = `
      <button data-v="piano" class="${S.tab.budget === "piano" ? "on" : ""}">Piano</button>
      <button data-v="spese" class="${S.tab.budget === "spese" ? "on" : ""}">Spese</button>`;
    $$("button", seg).forEach(b => b.onclick = () => { S.tab.budget = b.dataset.v; Store.save(); rerender(); });
    v.appendChild(seg);
    v.appendChild(S.tab.budget === "piano" ? budgetPiano() : budgetSpese());
    return v;
  }

  function budgetPiano() {
    const wrap = el("div");
    const T = Store.totals();
    const openStays = TRIP.days.filter(d => {
      const dd = Store.day(d);
      return dd.stay && dd.stay.status === "todo";
    });

    const k = el("div", "kpis");
    k.innerHTML = `
      <div class="kpi kpi--head">
        <span class="kpi__k">Proiezione · 2 persone</span>
        <span class="kpi__v">${eur(T.proj)}</span>
        <span class="kpi__n">${T.delta >= 0 ? "+" : "−"}${num(Math.abs(Math.round(T.delta)))} € sul preventivo${S.optional ? "" : " · opzionali esclusi"}</span>
      </div>
      <div class="kpi"><span class="kpi__k">Preventivo</span><span class="kpi__v">${eur(T.plan)}</span><span class="kpi__n">dal file v6</span></div>
      <div class="kpi"><span class="kpi__k">Speso finora</span><span class="kpi__v down">${eur(T.spent)}</span><span class="kpi__n">${S.expenses.length} registrazion${S.expenses.length === 1 ? "e" : "i"}</span></div>
      <div class="kpi"><span class="kpi__k">Da spendere</span><span class="kpi__v">${eur(Math.max(0, T.proj - T.spent))}</span><span class="kpi__n">stima residua</span></div>
      <div class="kpi"><span class="kpi__k">Notti aperte</span><span class="kpi__v ${openStays.length ? "up" : "down"}">${openStays.length}</span><span class="kpi__n">${openStays.length ? openStays.map(d => d.dateLabel.split(" ")[0]).join(", ") + " ago" : "tutte chiuse"}</span></div>`;
    wrap.appendChild(k);

    const ctrl = el("div", "bctrl");
    ctrl.innerHTML = `
      <label class="bctrl__k" for="fx">NOK per €</label>
      <input id="fx" class="in in--fx" type="number" step="0.01" min="1" value="${S.fx}">
      <span class="sw ${S.optional ? "sw--on" : ""}" id="optsw" role="button" tabindex="0" aria-label="Includi opzionali">
        <i class="sw__t"></i><span class="bctrl__k">Opzionali</span>
      </span>`;
    $("#fx", ctrl).onchange = e => {
      const n = parseFloat(String(e.target.value).replace(",", "."));
      if (n > 0) { S.fx = n; Store.save(); rerender(); }
    };
    const tg = () => { S.optional = !S.optional; Store.save(); rerender(); };
    $("#optsw", ctrl).onclick = tg;
    $("#optsw", ctrl).onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tg(); } };
    wrap.appendChild(ctrl);

    TRIP.budget.forEach(sec => {
      const tot = Store.sectionTotals(sec);
      const box = el("div", "bsec");
      const head = el("div", "bsec__head");
      head.innerHTML = `<span class="eyebrow">${esc(sec.section)}</span>
        <span class="bsec__tot">${eur(tot.proj)}${tot.spent ? ` <i>di cui ${eur(tot.spent)} spesi</i>` : ""}</span>`;
      box.appendChild(head);
      const pct = Math.min(100, tot.plan ? (tot.spent / tot.plan * 100) : 0);
      box.appendChild(el("div", "bsec__bar", `<i style="width:${pct.toFixed(1)}%"></i>`));

      sec.lines.forEach(line => {
        if (line.optional && !S.optional) return;
        const sp = Store.spentOn(line.id);
        const nEx = Store.expensesFor(line.id).length;
        const row = el("button", "bline" + (line.optional ? " bline--opt" : "") + (sp > 0 ? " bline--paid" : ""));
        const over = sp > line.plan * 1.001;
        row.innerHTML = `
          <div class="bline__l">
            <div class="bline__t">${esc(line.label)}${line.optional ? '<span class="opt">opz</span>' : ""}</div>
            <div class="bline__d">${esc(line.day)} · ${line.booked ? "prenotato" : "aperto"}${nEx ? ` · ${nEx} spes${nEx === 1 ? "a" : "e"}` : ""}</div>
            ${line.note ? `<div class="bline__note">${esc(line.note)}</div>` : ""}
          </div>
          <div class="bline__r">
            <span class="bline__v ${over ? "up" : ""}">${sp > 0 ? eur(sp) : eur(line.plan)}</span>
            <span class="bline__tagv">${sp > 0 ? (over ? "oltre il preventivo" : "reale") : "preventivo"}</span>
          </div>`;
        row.onclick = () => lineSheet(line, sec);
        box.appendChild(row);
      });

      const loose = Store.looseIn(sec.id);
      if (loose.length) {
        const l = el("button", "bline bline--loose");
        const s = loose.reduce((a, e) => a + Store.toEur(e), 0);
        l.innerHTML = `
          <div class="bline__l"><div class="bline__t">Fuori piano</div>
            <div class="bline__d">${loose.length} voc${loose.length === 1 ? "e" : "i"} senza preventivo</div></div>
          <div class="bline__r"><span class="bline__v up">${eur(s)}</span><span class="bline__tagv">extra</span></div>`;
        l.onclick = () => { S.tab.budget = "spese"; Store.save(); rerender(); };
        box.appendChild(l);
      }
      wrap.appendChild(box);
    });

    const notes = el("div", "card");
    notes.innerHTML = `<span class="eyebrow">Letture del budget</span>
      <ul class="ev__meta" style="margin-top:9px">${TRIP.budgetNotes.map(n => `<li>${esc(n)}</li>`).join("")}</ul>
      <p class="bline__note" style="margin-top:10px">${esc(TRIP.meta.fxNote)}</p>`;
    wrap.appendChild(notes);
    return wrap;
  }

  function lineSheet(line, sec) {
    sheet(line.label, (body, done) => {
      const sp = Store.spentOn(line.id);
      const list = Store.expensesFor(line.id).sort((a, b) => a.date.localeCompare(b.date));
      body.innerHTML = `
        <div class="wxgrid wxgrid--2">
          <div><span>Preventivo</span><b>${eur(line.plan)}</b></div>
          <div><span>Speso</span><b class="${sp > line.plan * 1.001 ? "up" : "down"}">${eur(sp)}</b></div>
        </div>
        ${line.note ? `<p class="fld__h">${esc(line.note)}</p>` : ""}
        <div class="exlist" id="ls"></div>
        <div class="sheet__act"><button class="btn btn--go" data-act="add">${ICON.plus}<span>Registra una spesa</span></button></div>`;
      const ls = $("#ls", body);
      if (!list.length) ls.innerHTML = `<p class="empty">Nessuna spesa registrata su questa voce.</p>`;
      else list.forEach(e => ls.appendChild(expenseRow(e, done)));
      $('[data-act="add"]', body).onclick = () => { done(); expenseSheet(null, { lineId: line.id }); };
    }, { focus: false });
  }

  function expenseRow(e, afterEdit) {
    const line = e.lineId ? Store.lineOf(e.lineId) : null;
    const row = el("button", "exrow" + (e.seed ? " exrow--seed" : ""));
    row.innerHTML = `
      <span class="exrow__d">${esc(dateShort(e.date))}</span>
      <span class="exrow__b">
        <b>${esc(line ? line.line.label : (e.note || "Spesa fuori piano"))}</b>
        <small>${esc(e.note || (line ? line.sec.section : "Fuori piano"))}${e.seed ? " · anticipato" : ""}</small>
      </span>
      <span class="exrow__v">${e.cur === "NOK" ? nok(e.amount) : eur2(e.amount)}
        <i>${e.cur === "NOK" ? eur2(Store.toEur(e)) : ""}</i></span>`;
    row.onclick = () => { if (afterEdit) afterEdit(); expenseSheet(e); };
    return row;
  }

  function budgetSpese() {
    const wrap = el("div");
    const T = Store.totals();
    const byDay = {};
    S.expenses.forEach(e => (byDay[e.date] = byDay[e.date] || []).push(e));
    const dates = Object.keys(byDay).sort().reverse();

    const k = el("div", "kpis");
    // giorni di viaggio effettivamente trascorsi, per la media giornaliera
    const today = todayISO();
    const elapsed = TRIP.days.filter(d => d.date <= today).length;
    const anticipato = S.expenses
      .filter(e => e.date < TRIP.meta.from)
      .reduce((a, e) => a + Store.toEur(e), 0);
    const perDay = elapsed > 0
      ? `${eur(Math.max(0, T.spent - anticipato) / elapsed)} al giorno su ${elapsed} giorn${elapsed === 1 ? "o" : "i"} di viaggio`
      : `tutto anticipato prima della partenza`;
    k.innerHTML = `
      <div class="kpi kpi--head">
        <span class="kpi__k">Speso finora</span>
        <span class="kpi__v">${eur(T.spent)}</span>
        <span class="kpi__n">${nok(T.spent * S.fx)} · ${perDay}</span>
      </div>`;
    wrap.appendChild(k);

    const add = el("button", "btn btn--go btn--full");
    add.innerHTML = `${ICON.plus}<span>Registra una spesa</span>`;
    add.onclick = () => expenseSheet();
    wrap.appendChild(add);

    /* per categoria */
    const cats = el("div", "catbars");
    const rows = TRIP.budget.map(sec => ({ sec, t: Store.sectionTotals(sec) }))
      .filter(r => r.t.spent > 0)
      .sort((a, b) => b.t.spent - a.t.spent);
    if (rows.length) {
      const max = rows[0].t.spent;
      cats.innerHTML = `<span class="eyebrow">Per categoria</span>`;
      rows.forEach(r => {
        const line = el("div", "catbar");
        line.innerHTML = `
          <span class="catbar__l">${esc(r.sec.section)}</span>
          <span class="catbar__t">${eur(r.t.spent)} <i>/ ${eur(r.t.plan)}</i></span>
          <span class="catbar__bar"><i style="width:${(r.t.spent / max * 100).toFixed(1)}%" class="${r.t.spent > r.t.plan ? "over" : ""}"></i></span>`;
        cats.appendChild(line);
      });
      wrap.appendChild(cats);
    }

    /* --- extra: quello che hai speso fuori dalle tappe segnate --- */
    const gruppi = Store.extrasByDay();
    if (gruppi.length) {
      const h = el("div", "sect-head");
      h.innerHTML = `<span class="eyebrow">Extra</span><i class="rule"></i>
        <span class="eyebrow">${eur(Store.extrasTotalAll())}</span>`;
      wrap.appendChild(h);

      const box = el("div", "card");
      box.innerHTML = `<p class="bline__note" style="margin:0 0 10px">
        Spese che non appartengono a nessuna tappa in programma di quella giornata:
        caffè, panini, parcheggi, imprevisti.</p>`;
      gruppi.forEach(g => {
        const row = el("button", "exday");
        row.innerHTML = `
          <span class="exday__d">${esc(g.day.id)}</span>
          <span class="exday__b">
            <b>${esc(g.day.dow)} ${esc(g.day.dateLabel)}</b>
            <span>${g.voci.map(e => esc(e.note || "spesa")).join(" · ")}</span>
          </span>
          <span class="exday__v">${eur2(g.tot)}</span>`;
        row.onclick = () => { buzz(); extraSheet(g.day); };
        box.appendChild(row);
      });
      wrap.appendChild(box);
    }

    if (!dates.length) {
      wrap.appendChild(el("p", "empty", "Nessuna spesa registrata. Tocca “Registra una spesa” per iniziare: gli importi in corone si convertono col cambio che imposti nel Piano."));
      return wrap;
    }

    dates.forEach(dt => {
      const day = TRIP.days.find(d => d.date === dt);
      const items = byDay[dt].sort((a, b) => b.id.localeCompare(a.id));
      const tot = items.reduce((a, e) => a + Store.toEur(e), 0);
      const h = el("div", "sect-head");
      h.innerHTML = `<span class="eyebrow">${day ? day.id + " · " : ""}${esc(dateShort(dt))}</span><i class="rule"></i><span class="bsec__tot">${eur(tot)}</span>`;
      wrap.appendChild(h);
      const box = el("div", "exbox");
      items.forEach(e => box.appendChild(expenseRow(e)));
      wrap.appendChild(box);
    });

    return wrap;
  }

  /* ========================================================
     VISTA · PRATICO
     ======================================================== */

  function pratico() {
    const v = el("div", "view");
    const seg = el("div", "seg seg--top");
    seg.innerHTML = `
      <button data-v="info" class="${S.tab.pratico === "info" ? "on" : ""}">Info</button>
      <button data-v="valigia" class="${S.tab.pratico === "valigia" ? "on" : ""}">Valigia</button>
      <button data-v="documenti" class="${S.tab.pratico === "documenti" ? "on" : ""}">Documenti</button>`;
    $$("button", seg).forEach(b => b.onclick = () => { S.tab.pratico = b.dataset.v; Store.save(); rerender(); });
    v.appendChild(seg);
    v.appendChild(
      S.tab.pratico === "documenti" ? Extra.documenti()
      : S.tab.pratico === "valigia" ? praticoValigia()
      : praticoInfo());
    return v;
  }

  function praticoInfo() {
    const wrap = el("div");

    const h0 = el("div", "sect-head");
    h0.innerHTML = `<span class="eyebrow">Telefoni</span><i class="rule"></i>`;
    wrap.appendChild(h0);
    const g = el("div", "grid2");
    TRIP.phones.forEach(p => {
      const a = el("a", "tel");
      a.href = "tel:" + p.value.replace(/\s/g, "");
      a.innerHTML = `<span>${esc(p.label)}</span><b>${esc(p.value)}</b>`;
      g.appendChild(a);
    });
    wrap.appendChild(g);

    TRIP.practical.forEach(sec => {
      const c = el("div", "card pcard");
      c.innerHTML = `<h3>${esc(sec.title)}</h3><ul>${sec.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;
      wrap.appendChild(c);
    });

    const h = el("div", "sect-head");
    h.innerHTML = `<span class="eyebrow">Operatori e trasporti</span><i class="rule"></i>`;
    wrap.appendChild(h);
    TRIP.links.forEach(l => {
      const a = el("a", "linkrow");
      a.href = l.url; a.target = "_blank"; a.rel = "noopener";
      a.innerHTML = `${esc(l.label)}${ICON.ext}`;
      wrap.appendChild(a);
    });

    /* dati e backup */
    const h2 = el("div", "sect-head");
    h2.innerHTML = `<span class="eyebrow">I tuoi dati</span><i class="rule"></i>`;
    wrap.appendChild(h2);
    const dc = el("div", "card");
    dc.innerHTML = `<p class="bline__note" style="margin:0 0 11px">
      Spunte, spese, note e nomi che hai scritto restano su questo telefono. Il backup serve a spostarli
      su un altro dispositivo${Store.memoryOnly ? " — attenzione: qui lo spazio di archiviazione non è disponibile, quindi i dati non sopravvivono alla chiusura" : ""}.
      Gli allegati non entrano nel backup.</p>
      <div class="btnrow">
        <button class="btn btn--go" data-a="ics">${ICON.cal}<span>Aggiungi al calendario</span></button>
      </div>
      <div class="btnrow" style="margin-top:8px">
        <button class="btn btn--ghost" data-a="share">${Extra.ICON2.share}<span>Condividi</span></button>
        <button class="btn btn--ghost" data-a="print">${Extra.ICON2.print}<span>Stampa o PDF</span></button>
      </div>
      <p class="bline__note" style="margin:9px 0 11px">
        <b>Condividi</b> passa l'itinerario a Mari con il foglio di condivisione del telefono.
        <b>Stampa</b> apre la versione su carta: una copia stampata è l'unica che sopravvive
        a un telefono scarico o perso.</p>
      <p class="bline__note" style="margin:10px 0 11px">
        Scarica un file .ics con tutte le tappe e i pernotti: aprendolo, il telefono li importa nel
        calendario e le attività prenotate ti avvisano un'ora prima. Da rifare se cambi qualcosa.</p>
      <div class="btnrow">
        <button class="btn btn--ghost" data-a="exp">${ICON.down}<span>Esporta</span></button>
        <label class="btn btn--ghost">${ICON.up}<span>Importa</span><input type="file" accept="application/json" hidden data-a="imp"></label>
        <button class="btn btn--ghost btn--danger" data-a="res">${ICON.trash}<span>Azzera</span></button>
      </div>`;
    $('[data-a="share"]', dc).onclick = () => Extra.shareTrip();
    $('[data-a="print"]', dc).onclick = () => {
      document.body.classList.add("printing");
      setTimeout(() => { window.print(); setTimeout(() => document.body.classList.remove("printing"), 400); }, 60);
    };
    $('[data-a="ics"]', dc).onclick = () => {
      download("NorvegiaArtica2026.ics", icsText(), "text/calendar;charset=utf-8");
      toast("Calendario scaricato");
    };
    $('[data-a="exp"]', dc).onclick = () => {
      download(`NorvegiaArtica-backup-${todayISO().replace(/-/g, "")}.json`, Store.exportJson());
      toast("Backup esportato");
    };
    $('[data-a="imp"]', dc).onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { Store.importJson(await f.text()); toast("Backup importato"); rerender(); }
      catch { toast("File non valido"); }
      e.target.value = "";
    };
    $('[data-a="res"]', dc).onclick = () => {
      sheet("Azzerare tutto?", (b, done) => {
        b.innerHTML = `<p class="fld__h">Cancella spese, spunte, note e modifiche. L'itinerario resta com'è.
          Gli allegati non vengono toccati.</p>${actions("Azzera", "Annulla")}`;
        $('[data-act="ok"]', b).onclick = () => { Store.reset(); done(); rerender(); toast("Dati azzerati"); };
        $('[data-act="cancel"]', b).onclick = done;
      });
    };
    wrap.appendChild(dc);

    wrap.appendChild(el("div", "foot",
      `Dati da ${esc(TRIP.meta.source)}<br>Aggiornato con Booking 5814498621 e corso muta stagna rif. 2682<br>${esc(TRIP.meta.version)} · meteo Open-Meteo · funziona offline`));
    return wrap;
  }

  function praticoValigia() {
    const wrap = el("div");
    const groups = TRIP.packing.map(g => ({
      group: g.group,
      items: g.items.map(i => ({ key: g.group + "|" + i, text: i }))
    }));
    const custom = (S.packAdd || []).map(i => ({ key: "Tue aggiunte|" + i, text: i, custom: true }));
    if (custom.length) groups.push({ group: "Tue aggiunte", items: custom });

    const all = groups.flatMap(g => g.items);
    const done = all.filter(i => S.packing[i.key]).length;

    const k = el("div", "kpis");
    k.innerHTML = `<div class="kpi kpi--head">
      <span class="kpi__k">Valigia</span>
      <span class="kpi__v">${done} <span style="font-size:.55em;opacity:.6">/ ${all.length}</span></span>
      <span class="kpi__n">${done === all.length ? "tutto dentro" : `${all.length - done} cose ancora da mettere`}</span>
    </div>`;
    wrap.appendChild(k);

    const bar = el("div", "packbar", `<i style="width:${(done / all.length * 100).toFixed(1)}%"></i>`);
    wrap.appendChild(bar);

    groups.forEach(g => {
      const h = el("div", "sect-head");
      const gd = g.items.filter(i => S.packing[i.key]).length;
      h.innerHTML = `<span class="eyebrow">${esc(g.group)}</span><i class="rule"></i><span class="eyebrow">${gd}/${g.items.length}</span>`;
      wrap.appendChild(h);
      const box = el("div", "packbox");
      g.items.forEach(it => {
        const row = el("button", "packrow" + (S.packing[it.key] ? " packrow--on" : ""));
        row.innerHTML = `<span class="packrow__box">${ICON.check}</span><span class="packrow__t">${esc(it.text)}</span>${
          it.custom ? `<span class="packrow__x">${ICON.trash}</span>` : ""}`;
        row.onclick = ev => {
          if (it.custom && ev.target.closest(".packrow__x")) {
            S.packAdd = S.packAdd.filter(x => x !== it.text);
            delete S.packing[it.key]; Store.save(); rerender(); return;
          }
          if (S.packing[it.key]) delete S.packing[it.key]; else S.packing[it.key] = true;
          Store.save(); buzz(); rerender();
        };
        box.appendChild(row);
      });
      wrap.appendChild(box);
    });

    const add = el("button", "btn btn--ghost btn--full");
    add.innerHTML = `${ICON.plus}<span>Aggiungi una cosa</span>`;
    add.onclick = () => textSheet("Aggiungi alla valigia", "", v => {
      const t = v.trim();
      if (t && !S.packAdd.includes(t)) { S.packAdd.push(t); Store.save(); }
    }, { label: "Cosa", ph: "Caricabatterie della GoPro" });
    wrap.appendChild(add);
    return wrap;
  }

  /* ========================================================
     RICERCA
     ======================================================== */

  function searchIndex() {
    const ix = [];
    Store.days().forEach(d => {
      ix.push({ t: `${d.id} · ${d.dow} ${d.dateLabel}`, s: d.arc, k: "Giorno", go: () => jump(d.id) });
      d.fixed.forEach(f => ix.push({
        t: f.title, s: `${d.id} · ${f.t}${f.code ? " · " + f.code : ""}`, k: "Tappa",
        blob: [f.title, (f.meta || []).join(" "), f.code, Store.pinFor(f.code)].join(" "), go: () => jump(d.id)
      }));
      d.flex.forEach(f => ix.push({ t: f.title, s: `${d.id} · flessibile`, k: "Tappa", blob: f.title + " " + f.meta, go: () => jump(d.id) }));
      if (d.stay) ix.push({ t: d.stay.name, s: `${d.id} · pernotto a ${d.stay.place}`, k: "Alloggio", blob: d.stay.name + " " + (d.stay.meta || []).join(" "), go: () => jump(d.id) });
      if (d.userNote) ix.push({ t: d.userNote.slice(0, 60), s: `${d.id} · tua nota`, k: "Nota", go: () => jump(d.id) });
    });
    TRIP.todo.forEach(t => ix.push({ t: t.label, s: t.when, k: "Da fare", blob: t.label + " " + t.why + " " + t.how, go: () => App.go("prenota") }));
    TRIP.bookings.forEach(g => g.items.forEach(it => ix.push({
      t: it.title, s: it.when, k: "Prenotazione",
      blob: [it.title, it.when, (it.meta || []).join(" "), it.code, Store.pinFor(it.code)].join(" "), go: () => App.go("prenota")
    })));
    TRIP.budget.forEach(sec => sec.lines.forEach(l => ix.push({
      t: l.label, s: `${sec.section} · ${eur(l.plan)}`, k: "Budget", blob: l.label + " " + (l.note || ""),
      go: () => { S.tab.budget = "piano"; App.go("budget"); }
    })));
    TRIP.practical.forEach(sec => sec.items.forEach(i => ix.push({
      t: i.length > 70 ? i.slice(0, 70) + "…" : i, s: sec.title, k: "Pratico", blob: i,
      go: () => { S.tab.pratico = "info"; App.go("pratico"); }
    })));
    TRIP.phones.forEach(p => ix.push({ t: p.label, s: p.value, k: "Telefono", tel: p.value, go: () => { S.tab.pratico = "info"; App.go("pratico"); } }));
    return ix;
  }

  function jump(dayId) {
    if (S.tab.giorni !== "lista") { S.tab.giorni = "lista"; Store.save(); }
    App.go("giorni");
    App.markInView(dayId);
    requestAnimationFrame(() => {
      const n = document.getElementById("d-" + dayId);
      if (n) n.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function search() {
    const ix = searchIndex();
    const back = el("div", "srch");
    back.innerHTML = `
      <div class="srch__bar">
        <span class="srch__ic">${ICON.search}</span>
        <input class="srch__in" id="sq" type="search" placeholder="Cerca codici, tappe, alloggi, spese…" autocomplete="off">
        <button class="srch__x" aria-label="Chiudi">${ICON.close}</button>
      </div>
      <div class="srch__res" id="sr"></div>`;
    document.body.appendChild(back);
    document.body.classList.add("locked");
    requestAnimationFrame(() => back.classList.add("on"));

    const close = () => {
      back.classList.remove("on");
      document.body.classList.remove("locked");
      setTimeout(() => back.remove(), 200);
      document.removeEventListener("keydown", onKey);
    };
    const onKey = e => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    $(".srch__x", back).onclick = close;

    const res = $("#sr", back);
    const q = $("#sq", back);

    function paint() {
      const s = q.value.trim().toLowerCase();
      if (s.length < 2) {
        res.innerHTML = `<p class="empty">Scrivi almeno due lettere. Cerca anche nei codici prenotazione e nei PIN.</p>`;
        return;
      }
      const hits = ix.filter(x => ((x.blob || x.t + " " + x.s) + "").toLowerCase().includes(s)).slice(0, 40);
      if (!hits.length) { res.innerHTML = `<p class="empty">Nessun risultato per “${esc(q.value)}”.</p>`; return; }
      res.innerHTML = "";
      hits.forEach(h => {
        const r = el("button", "srchrow");
        r.innerHTML = `<span class="srchrow__k">${esc(h.k)}</span>
          <span class="srchrow__b"><b>${esc(h.t)}</b><small>${esc(h.s || "")}</small></span>`;
        r.onclick = () => { close(); h.go(); };
        res.appendChild(r);
      });
    }
    q.addEventListener("input", paint);
    paint();
    setTimeout(() => q.focus(), 120);
  }

  return { bind, giorni, prenota, budget, pratico, search, dayStatus, currentIndex, jump,
           dayCard, filesSheet, nowCard };
})();
