/* ============================================================
   Meteo — Open-Meteo, una sola richiesta per tutte le tappe.
   Nessuna chiave, CORS aperto. Il risultato resta in cache:
   offline si mostra l'ultimo aggiornamento riuscito.
   ============================================================ */

const Weather = (() => {
  "use strict";

  const MAX_AGE = 3 * 3600 * 1000; // 3 ore
  const listeners = [];
  let loading = false;

  const onChange = fn => listeners.push(fn);
  const emit = () => listeners.forEach(fn => { try { fn(); } catch {} });

  /** Coordinate univoche, con la lista dei giorni che le usano. */
  function spots() {
    const map = new Map();
    TRIP.days.forEach(d => {
      const k = d.lat.toFixed(3) + "," + d.lon.toFixed(3);
      if (!map.has(k)) map.set(k, { lat: d.lat, lon: d.lon, days: [] });
      map.get(k).days.push(d.id);
    });
    return [...map.values()];
  }

  function url() {
    const s = spots();
    const p = new URLSearchParams({
      latitude: s.map(x => x.lat).join(","),
      longitude: s.map(x => x.lon).join(","),
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset",
      timezone: "Europe/Oslo",
      wind_speed_unit: "ms",
      start_date: TRIP.meta.from,
      end_date: TRIP.meta.to
    });
    return "https://api.open-meteo.com/v1/forecast?" + p.toString();
  }

  /** Risposta Open-Meteo → { G1: {...}, G2: {...} } */
  function shape(payload) {
    const arr = Array.isArray(payload) ? payload : [payload];
    const s = spots();
    const out = {};
    arr.forEach((block, i) => {
      const spot = s[i];
      const dy = block && block.daily;
      if (!spot || !dy || !dy.time) return;
      spot.days.forEach(dayId => {
        const day = TRIP.days.find(d => d.id === dayId);
        const j = dy.time.indexOf(day.date);
        if (j < 0) return;
        out[dayId] = {
          code: dy.weather_code[j],
          tmax: dy.temperature_2m_max[j],
          tmin: dy.temperature_2m_min[j],
          rain: dy.precipitation_sum[j],
          rainP: dy.precipitation_probability_max ? dy.precipitation_probability_max[j] : null,
          wind: dy.wind_speed_10m_max[j],
          gust: dy.wind_gusts_10m_max ? dy.wind_gusts_10m_max[j] : null,
          sunrise: dy.sunrise ? dy.sunrise[j].slice(11, 16) : null,
          sunset: dy.sunset ? dy.sunset[j].slice(11, 16) : null
        };
      });
    });
    return out;
  }

  const cached = () => Store.S.wx;
  const stale = () => {
    const c = cached();
    return !c || !c.at || (Date.now() - c.at) > MAX_AGE;
  };
  const forDay = id => (cached() && cached().days ? cached().days[id] : null) || null;

  async function refresh(force) {
    if (loading) return;
    if (!force && !stale()) return;
    if (!navigator.onLine) { emit(); return; }
    loading = true; emit();
    try {
      const r = await fetch(url(), { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const days = shape(await r.json());
      if (Object.keys(days).length) {
        Store.S.wx = { at: Date.now(), days };
        Store.save();
      }
    } catch (e) {
      // silenzioso: offline o API non raggiungibile, resta la cache
    } finally {
      loading = false; emit();
    }
  }

  function ageLabel() {
    const c = cached();
    if (!c || !c.at) return "mai aggiornato";
    const m = Math.round((Date.now() - c.at) / 60000);
    if (m < 2) return "aggiornato ora";
    if (m < 60) return `aggiornato ${m} min fa`;
    const h = Math.round(m / 60);
    if (h < 24) return `aggiornato ${h}h fa`;
    return `aggiornato ${Math.round(h / 24)} g fa`;
  }

  return { refresh, forDay, ageLabel, onChange, get loading() { return loading; }, stale };
})();
