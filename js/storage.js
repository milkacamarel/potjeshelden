/*
 * storage.js — opslag van voortgang in localStorage.
 * Alles staat onder één sleutel, zodat exporteren/importeren simpel is.
 * Sterren gaan alleen omhoog: er is geen functie die sterren afpakt.
 *
 * De opslag is zo opgezet dat twee apparaten samengevoegd kunnen worden (zie sync.js):
 * - het totaal aantal sterren wordt berekend uit het logboek;
 * - een weggehaalde registratie blijft bestaan met removed: true (de sterren blijven tellen);
 * - instellingen hebben een tijdstempel: de nieuwste wint.
 */
(function () {
  const KEY = "potjeshelden-v1";
  const cfg = window.APP_CONFIG;
  const listeners = [];

  function freshState() {
    return {
      version: 2,
      totalStars: 0,    // berekend uit het logboek
      log: [],          // { id, ts, created, actions: [actionId], points, note, source: "kind" | "ouder" | "bonus", removed? }
      seenUnlocks: [],  // item-id's die al gevierd zijn
      lastKidTap: {},   // actionId -> timestamp (voor de afkoeltijd in Kindermodus)
      settings: { ...cfg.DEFAULT_SETTINGS },
      settingsUpdatedAt: 0,
      voiceMeta: {},    // zin-id -> { ts, path?, sha?, deleted? } (voor het synchroniseren van opnames)
      resetAt: 0,       // moment van "alles wissen"
    };
  }

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const sumPoints = log => log.reduce((s, e) => s + (e.points || 0), 0);

  function normalize(s) {
    const base = freshState();
    const merged = { ...base, ...s, settings: { ...base.settings, ...(s.settings || {}) } };
    // Versie zonder eigen stem: neem de standaardnaam over als er nog geen naam was.
    if (s.settings && !("voice" in s.settings) && !s.settings.childName) merged.settings.childName = base.settings.childName;
    delete merged.settings.speech;
    merged.log = (merged.log || []).map(e => ({ ...e, created: e.created || e.ts }));
    // Oude versie: sterren die niet (meer) in het logboek staan, als één registratie bewaren.
    if ((s.version || 1) < 2) {
      const missing = (s.totalStars || 0) - sumPoints(merged.log);
      if (missing > 0) merged.log.unshift({ id: uid(), ts: Date.now(), created: Date.now(), actions: [], points: missing, note: "Eerder verdiende sterren", source: "bonus", removed: true });
      merged.version = 2;
    }
    merged.totalStars = sumPoints(merged.log);
    return merged;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? normalize(JSON.parse(raw)) : freshState();
    } catch (e) {
      return freshState();
    }
  }

  let state = load();

  function save(notify = true) {
    state.totalStars = sumPoints(state.log);
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* privé-venster: werkt dan alleen deze sessie */ }
    if (notify) listeners.forEach(fn => fn());
  }

  const Store = {
    get state() { return state; },

    /** Registraties die in het logboek getoond worden (zonder weggehaalde). */
    entries() { return state.log.filter(e => !e.removed); },

    /** Wordt aangeroepen na elke lokale wijziging (gebruikt door sync.js). */
    onChange(fn) { listeners.push(fn); },

    /** Voeg een registratie toe en tel de punten op. Geeft de nieuwe entry terug. */
    addEntry({ actions = [], points = 0, note = "", ts = Date.now(), source = "ouder" }) {
      const entry = { id: uid(), ts, created: Date.now(), actions, points: Math.max(0, Math.round(points)), note, source };
      state.log.push(entry);
      state.log.sort((a, b) => a.ts - b.ts);
      save();
      return entry;
    },

    /** Haal een verkeerde registratie uit het logboek. Verdiende sterren blijven staan. */
    removeEntry(id) {
      const e = state.log.find(x => x.id === id);
      if (e) { e.removed = true; save(); }
    },

    markKidTap(actionId) { state.lastKidTap[actionId] = Date.now(); save(); },

    markSeen(ids) {
      ids.forEach(id => { if (!state.seenUnlocks.includes(id)) state.seenUnlocks.push(id); });
      save();
    },

    updateSettings(patch) { state.settings = { ...state.settings, ...patch }; state.settingsUpdatedAt = Date.now(); save(); },

    setVoiceMeta(id, meta) { state.voiceMeta[id] = meta; save(); },

    exportJSON() { return JSON.stringify(state, null, 2); },

    importJSON(text) {
      const s = JSON.parse(text);
      if (!Array.isArray(s.log)) throw new Error("Geen geldig bestand");
      state = normalize(s);
      state.settingsUpdatedAt = Date.now();
      save();
    },

    /** Vervang de hele toestand (na het samenvoegen met een ander apparaat). Start geen nieuwe sync. */
    replace(next) { state = normalize(next); save(false); },

    resetAll() { const voiceMeta = state.voiceMeta; state = freshState(); state.voiceMeta = voiceMeta; state.resetAt = Date.now(); state.settingsUpdatedAt = Date.now(); save(); },
  };

  window.Store = Store;
})();
