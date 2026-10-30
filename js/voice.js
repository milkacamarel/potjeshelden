/*
 * voice.js — eigen stemopnames van papa/mama.
 * Opnames worden per zin bewaard in IndexedDB (in de browser, op dit apparaat).
 * Afspelen gaat via Web Audio, zodat het ook werkt na een korte pauze (bijv. na het sterrenfeestje).
 * Welke zinnen er zijn staat in config.js bij VOICE_LINES.
 */
(function () {
  const DB_NAME = "potjeshelden-audio";
  const STORE = "clips";
  let dbPromise;
  let ctx;
  const blobs = {};    // id -> Blob
  const buffers = {};  // id -> AudioBuffer (gedecodeerd, voor snel afspelen)
  let currentSource = null;

  function openDb() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }

  async function run(mode, fn) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req && req.result);
      tx.onerror = () => reject(tx.error);
    });
  }

  /** Gedeelde AudioContext voor geluidjes en stemopnames. */
  function audioCtx() {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  async function decode(id) {
    if (buffers[id]) return buffers[id];
    const data = await blobs[id].arrayBuffer();
    buffers[id] = await new Promise((res, rej) => audioCtx().decodeAudioData(data, res, rej));
    return buffers[id];
  }

  const Voice = {
    audioCtx,

    /** Laad alle bewaarde opnames. Mag mislukken (privé-venster): dan is er gewoon geen stem. */
    async init() {
      try {
        const keys = await run("readonly", s => s.getAllKeys());
        for (const k of keys || []) blobs[k] = await run("readonly", s => s.get(k));
      } catch (e) { /* geen opslag beschikbaar */ }
      // Opnames van vóór het synchroniseren krijgen alsnog een tijdstempel, zodat ze meegaan naar andere apparaten.
      const meta = Store.state.voiceMeta;
      Object.keys(blobs).forEach(id => { if (!meta[id]) Store.setVoiceMeta(id, { ts: 1 }); });
    },

    has: id => !!blobs[id],
    blob: id => blobs[id],

    /** Nieuwe opname door de ouder: bewaren en markeren om te synchroniseren. */
    async save(id, blob) {
      await Voice.putLocal(id, blob);
      Store.setVoiceMeta(id, { ts: Date.now() });
    },

    /** Opname gewist door de ouder: ook op andere apparaten wissen. */
    async remove(id) {
      await Voice.dropLocal(id);
      Store.setVoiceMeta(id, { ts: Date.now(), deleted: true });
    },

    /** Alleen op dit apparaat bewaren (gebruikt door sync.js voor opnames van een ander apparaat). */
    async putLocal(id, blob) {
      blobs[id] = blob; delete buffers[id];
      try { await run("readwrite", s => s.put(blob, id)); } catch (e) { /* alleen deze sessie */ }
    },

    async dropLocal(id) {
      delete blobs[id]; delete buffers[id];
      try { await run("readwrite", s => s.delete(id)); } catch (e) { /* niets */ }
    },

    /** Speel een opname af. Geeft false terug als er geen opname is. */
    async play(id, delay = 0) {
      if (!blobs[id]) return false;
      try {
        const c = audioCtx();
        const buf = await decode(id);
        if (currentSource) try { currentSource.stop(); } catch (e) { /* al gestopt */ }
        const src = c.createBufferSource();
        src.buffer = buf; src.connect(c.destination);
        src.start(c.currentTime + delay);
        currentSource = src;
        return true;
      } catch (e) { return false; }
    },

    /** Speel de eerste zin uit de lijst waarvan een opname bestaat (willekeurig binnen een groep). */
    playAny(ids, delay = 0) {
      const have = ids.filter(id => blobs[id]);
      if (!have.length) return Promise.resolve(false);
      return Voice.play(have[Math.floor(Math.random() * have.length)], delay);
    },

    /** Opnemen met de microfoon kan alleen via https of localhost, en niet in elke browser. */
    canRecord: () => !!(window.isSecureContext && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder),

    /** Start een opname. Geeft { stop(), done } terug; done levert de Blob. Stopt zelf na maxSec. */
    async record(maxSec = 10) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks = [];
      rec.ondataavailable = e => e.data.size && chunks.push(e.data);
      const done = new Promise(resolve => {
        rec.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          resolve(new Blob(chunks, { type: rec.mimeType || "audio/webm" }));
        };
      });
      rec.start();
      const timer = setTimeout(() => rec.state !== "inactive" && rec.stop(), maxSec * 1000);
      return { stop: () => { clearTimeout(timer); if (rec.state !== "inactive") rec.stop(); }, done };
    },
  };

  window.Voice = Voice;
})();
