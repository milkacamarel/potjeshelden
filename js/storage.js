/*
 * storage.js — opslag van voortgang in localStorage.
 * Alles staat onder één sleutel, zodat exporteren/importeren simpel is.
 * Sterren gaan alleen omhoog: er is geen functie die sterren afpakt.
 */
(function () {
  const KEY = "potjeshelden-v1";
  const cfg = window.APP_CONFIG;

  function freshState() {
    return {
      version: 1,
      totalStars: 0,
      log: [],          // { id, ts, actions: [actionId], points, note, source: "kind" | "ouder" | "bonus" }
      seenUnlocks: [],  // item-id's die al gevierd zijn
      lastKidTap: {},   // actionId -> timestamp (voor de afkoeltijd in Kindermodus)
      settings: { ...cfg.DEFAULT_SETTINGS },
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return freshState();
      const s = JSON.parse(raw);
      const base = freshState();
      const merged = { ...base, ...s, settings: { ...base.settings, ...(s.settings || {}) } };
      // Versie zonder eigen stem: neem de standaardnaam over als er nog geen naam was.
      if (s.settings && !("voice" in s.settings) && !s.settings.childName) merged.settings.childName = base.settings.childName;
      delete merged.settings.speech;
      return merged;
    } catch (e) {
      return freshState();
    }
  }

  let state = load();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* privé-venster: werkt dan alleen deze sessie */ }
  }

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const Store = {
    get state() { return state; },

    /** Voeg een registratie toe en tel de punten op. Geeft de nieuwe entry terug. */
    addEntry({ actions = [], points = 0, note = "", ts = Date.now(), source = "ouder" }) {
      const entry = { id: uid(), ts, actions, points: Math.max(0, Math.round(points)), note, source };
      state.log.push(entry);
      state.log.sort((a, b) => a.ts - b.ts);
      state.totalStars += entry.points;
      save();
      return entry;
    },

    /** Verwijder een verkeerde registratie uit het logboek. Verdiende sterren blijven staan. */
    removeEntry(id) {
      state.log = state.log.filter(e => e.id !== id);
      save();
    },

    markKidTap(actionId) { state.lastKidTap[actionId] = Date.now(); save(); },

    markSeen(ids) {
      ids.forEach(id => { if (!state.seenUnlocks.includes(id)) state.seenUnlocks.push(id); });
      save();
    },

    updateSettings(patch) { state.settings = { ...state.settings, ...patch }; save(); },

    exportJSON() { return JSON.stringify(state, null, 2); },

    importJSON(text) {
      const s = JSON.parse(text);
      if (typeof s.totalStars !== "number" || !Array.isArray(s.log)) throw new Error("Geen geldig bestand");
      const base = freshState();
      state = { ...base, ...s, settings: { ...base.settings, ...(s.settings || {}) } };
      save();
    },

    resetAll() { state = freshState(); save(); },
  };

  window.Store = Store;
})();
