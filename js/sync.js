/*
 * sync.js — houdt meerdere apparaten (bijv. MacBook en iPad) gelijk.
 *
 * De gegevens staan in een privé GitHub-repository van de ouder (standaard "potjeshelden-data"):
 *   data.json        sterren, logboek, knoppen en instellingen
 *   audio/<zin>-…    ingesproken zinnen
 * De app werkt altijd eerst lokaal (ook offline). Zodra er internet is, worden de apparaten samengevoegd:
 *   - registraties: alles van beide apparaten (weghalen telt ook door);
 *   - instellingen en knoppen: de laatst gewijzigde versie wint;
 *   - opnames: de nieuwste opname per zin wint.
 */
(function () {
  const CFG_KEY = "potjeshelden-sync";
  const API = "https://api.github.com";
  const DATA = "data.json";

  let conf = loadConf();
  let busy = false, again = false, timer = null;
  let changeSeq = 1, pushedSeq = 0; // lokale wijzigingen tellen; verschil = nog niet op GitHub
  const isDirty = () => changeSeq !== pushedSeq;
  let lastRemote = null;     // { data, sha, etag } van de laatste keer ophalen
  const POLL_MS = 4000;      // zolang de app open staat: elke 4 s kijken (kost bijna niets dankzij ETag)
  const superseded = new Set(); // versies van data.json waarvan we weten dat ze al vervangen zijn
  const PUSH_DELAY_MS = 800; // wijzigingen kort bundelen voor ze verstuurd worden
  const status = { state: conf ? "idle" : "off", lastSync: Number(localStorage.getItem(CFG_KEY + "-last")) || 0, error: "" };
  const statusListeners = [];

  function loadConf() {
    try { const c = JSON.parse(localStorage.getItem(CFG_KEY)); return c && c.owner && c.repo && c.token ? c : null; } catch (e) { return null; }
  }
  function setStatus(patch) { Object.assign(status, patch); statusListeners.forEach(fn => fn(status)); }

  /* ---------- GitHub API ---------- */

  async function gh(path, opts = {}, c = conf) {
    const res = await fetch(`${API}/repos/${c.owner}/${c.repo}${path ? "/" + path : ""}`, {
      cache: "no-store", ...opts,
      headers: { Authorization: `Bearer ${c.token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(opts.headers || {}) },
    });
    return res;
  }

  const toB64 = bytes => { let bin = ""; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(bin); };
  const fromB64 = b64 => Uint8Array.from(atob(b64.replace(/\s/g, "")), ch => ch.charCodeAt(0));

  /** Haalt data.json op. Met ETag: als er niets veranderd is, antwoordt GitHub met 304 (telt niet mee voor de limiet). */
  async function getData() {
    const res = await gh(`contents/${DATA}`, lastRemote && lastRemote.etag ? { headers: { "If-None-Match": lastRemote.etag } } : {});
    if (res.status === 304 && lastRemote) return { ...lastRemote, unchanged: true };
    if (res.status === 404) return { data: null, sha: null, etag: null };
    if (!res.ok) throw httpError(res);
    const j = await res.json();
    let text;
    if (j.content) text = new TextDecoder().decode(fromB64(j.content));
    else { // groter dan 1 MB: los ophalen
      const raw = await gh(`contents/${DATA}`, { headers: { Accept: "application/vnd.github.raw+json" } });
      if (!raw.ok) throw httpError(raw);
      text = await raw.text();
    }
    return { data: JSON.parse(text), sha: j.sha, etag: res.headers.get("ETag") };
  }

  async function putFile(path, bytes, sha, message) {
    const res = await gh(`contents/${path}`, { method: "PUT", body: JSON.stringify({ message, content: toB64(bytes), ...(sha ? { sha } : {}) }) });
    if (!res.ok) throw httpError(res);
    return (await res.json()).content.sha;
  }

  async function deleteFile(path, sha) {
    try { await gh(`contents/${path}`, { method: "DELETE", body: JSON.stringify({ message: `Opname verwijderd: ${path}`, sha }) }); } catch (e) { /* opruimen mag mislukken */ }
  }

  async function getAudio(path) {
    const res = await gh(`contents/${path}`, { headers: { Accept: "application/vnd.github.raw+json" } });
    if (!res.ok) throw httpError(res);
    return res.blob();
  }

  function httpError(res) { const e = new Error(`GitHub ${res.status}`); e.status = res.status; return e; }

  /* ---------- Samenvoegen ---------- */

  function merge(local, remote) {
    if (!remote) return JSON.parse(JSON.stringify(local));
    const resetAt = Math.max(local.resetAt || 0, remote.resetAt || 0);
    const keep = (side) => (side.resetAt || 0) >= resetAt;
    const afterReset = e => (e.created || e.ts) > resetAt;

    const byId = new Map();
    [...(local.log || []), ...(remote.log || [])].filter(afterReset).forEach(e => {
      const prev = byId.get(e.id);
      byId.set(e.id, prev ? { ...prev, removed: !!(prev.removed || e.removed) } : { ...e });
    });

    const seen = new Set([...(keep(local) ? local.seenUnlocks || [] : []), ...(keep(remote) ? remote.seenUnlocks || [] : [])]);
    const taps = {};
    [local, remote].filter(keep).forEach(side => Object.entries(side.lastKidTap || {}).forEach(([k, v]) => { taps[k] = Math.max(taps[k] || 0, v); }));

    const settings = mergeSettings(local, remote);

    return {
      ...local,
      version: 2,
      log: [...byId.values()].sort((a, b) => a.ts - b.ts),
      seenUnlocks: [...seen],
      lastKidTap: taps,
      settings: settings.settings,
      settingsTs: settings.ts,
      settingsUpdatedAt: Math.max(local.settingsUpdatedAt || 0, remote.settingsUpdatedAt || 0),
      voiceMeta: { ...(local.voiceMeta || {}) }, // wordt per zin bijgewerkt in syncVoice
      resetAt,
    };
  }

  /** Instellingen per onderdeel samenvoegen: de laatst gewijzigde waarde wint. Eigen knoppen worden per knop samengevoegd. */
  function mergeSettings(local, remote) {
    const tsOf = side => side.settingsTs || Object.fromEntries(Object.keys(side.settings || {}).map(k => [k, side.settingsUpdatedAt || 0]));
    const lt = tsOf(local), rt = tsOf(remote);
    const ls = local.settings || {}, rs = remote.settings || {};
    const out = {}, ts = {};
    new Set([...Object.keys(ls), ...Object.keys(rs)]).forEach(k => {
      const useRemote = !(k in ls) || ((rt[k] || 0) > (lt[k] || 0) && k in rs);
      out[k] = useRemote ? rs[k] : ls[k];
      ts[k] = Math.max(lt[k] || 0, rt[k] || 0);
    });
    // Gewiste knoppen: van beide kanten onthouden
    const deleted = { ...(rs.deletedActions || {}) };
    Object.entries(ls.deletedActions || {}).forEach(([id, t]) => { deleted[id] = Math.max(deleted[id] || 0, t); });
    // Eigen knoppen: alles van beide kanten, behalve gewiste; bij dezelfde knop wint de nieuwste lijst
    const newer = (rt.customActions || 0) > (lt.customActions || 0) ? [rs, ls] : [ls, rs];
    const byId = new Map();
    [...(newer[1].customActions || []), ...(newer[0].customActions || [])].forEach(a => byId.set(a.id, a));
    out.customActions = [...byId.values()].filter(a => !deleted[a.id]);
    out.deletedActions = deleted;
    return { settings: out, ts };
  }

  const extFor = type => (/mp4|m4a|aac/.test(type) ? "m4a" : /webm/.test(type) ? "webm" : /mpeg|mp3/.test(type) ? "mp3" : /wav/.test(type) ? "wav" : /ogg/.test(type) ? "ogg" : "audio");

  /** Per zin: de nieuwste opname wint. Uploadt, downloadt of wist waar nodig. */
  async function syncVoice(merged, localMeta, remoteMeta) {
    const ids = new Set([...Object.keys(localMeta || {}), ...Object.keys(remoteMeta || {})]);
    for (const id of ids) {
      const L = localMeta[id], R = (remoteMeta || {})[id];
      if (L && (!R || L.ts > R.ts)) {
        // Dit apparaat heeft de nieuwste versie
        if (L.deleted) {
          if (R && R.path && !R.deleted) await deleteFile(R.path, R.sha);
          merged.voiceMeta[id] = { ts: L.ts, deleted: true };
        } else if (!L.path && Voice.has(id)) {
          const blob = Voice.blob(id);
          const path = `audio/${id}-${L.ts}.${extFor(blob.type || "")}`;
          const sha = await putFile(path, new Uint8Array(await blob.arrayBuffer()), null, `Opname: ${id}`);
          if (R && R.path && !R.deleted && R.path !== path) await deleteFile(R.path, R.sha);
          merged.voiceMeta[id] = { ts: L.ts, path, sha };
        } else {
          merged.voiceMeta[id] = L;
        }
      } else if (R && (!L || R.ts > L.ts)) {
        // Een ander apparaat heeft de nieuwste versie
        if (R.deleted) await Voice.dropLocal(id);
        else if (R.path) await Voice.putLocal(id, await getAudio(R.path));
        merged.voiceMeta[id] = R;
      } else if (R) {
        merged.voiceMeta[id] = R.path || R.deleted ? R : L;
      }
    }
  }

  function toRemote(s) {
    const { log, seenUnlocks, lastKidTap, settings, settingsTs, settingsUpdatedAt, voiceMeta, resetAt } = s;
    return { app: "potjeshelden", version: 2, log, seenUnlocks, lastKidTap, settings, settingsTs, settingsUpdatedAt, voiceMeta, resetAt };
  }

  /* ---------- De sync zelf ---------- */

  // JSON met vaste volgorde van sleutels, zodat "niets veranderd" ook echt als gelijk herkend wordt.
  const stable = v => Array.isArray(v) ? `[${v.map(stable).join(",")}]`
    : v && typeof v === "object" ? `{${Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => JSON.stringify(k) + ":" + stable(v[k])).join(",")}}`
    : JSON.stringify(v);

  async function syncNow() {
    if (!conf) return;
    if (busy) { again = true; return; }
    if (!navigator.onLine) { setStatus({ state: "offline" }); return; }
    busy = true;
    let failed = false;
    const quiet = !isDirty(); // gewone controle: status niet laten knipperen
    if (!quiet) setStatus({ state: "busy", error: "" });
    try {
      for (let attempt = 0; attempt < 6; attempt++) {
        const seq = changeSeq, wasDirty = isDirty();
        const remote = await getData();
        // GitHub geeft vlak na een wijziging soms nog even de oude versie terug: dan kort wachten en opnieuw vragen
        if (remote.sha && superseded.has(remote.sha)) { await new Promise(r => setTimeout(r, 600 + attempt * 400)); continue; }
        if (remote.unchanged && !wasDirty) break; // niets nieuws, aan beide kanten
        const before = stable(toRemote(Store.state));
        const merged = merge(Store.state, remote.data);
        await syncVoice(merged, Store.state.voiceMeta, remote.data && remote.data.voiceMeta);
        const out = stable(toRemote(merged));
        if (out !== before) {
          Store.replace(merged);
          window.dispatchEvent(new CustomEvent("potjeshelden:synced"));
        }
        lastRemote = { data: remote.data, sha: remote.sha, etag: remote.etag };
        if (!remote.data || out !== stable(toRemote({ ...remote.data, voiceMeta: remote.data.voiceMeta || {} }))) {
          try {
            const sha = await putFile(DATA, new TextEncoder().encode(JSON.stringify(toRemote(merged))), remote.sha, "Voortgang bijgewerkt");
            if (remote.sha) superseded.add(remote.sha);
            lastRemote = { data: toRemote(merged), sha, etag: null };
          } catch (e) {
            if (e.status === 409 || e.status === 422) {
              if (remote.sha) superseded.add(remote.sha);
              // Een ander apparaat schreef net tegelijk: even wachten, opnieuw ophalen en samenvoegen
              lastRemote = null;
              await new Promise(r => setTimeout(r, 300 + Math.random() * 700 * (attempt + 1)));
              continue;
            }
            throw e;
          }
        }
        pushedSeq = seq;
        break;
      }
      const now = Date.now();
      try { localStorage.setItem(CFG_KEY + "-last", String(now)); } catch (e) { /* niets */ }
      setStatus({ state: isDirty() ? "busy" : "idle", lastSync: now, error: "" });
    } catch (e) {
      failed = true;
      const offline = !navigator.onLine || e instanceof TypeError;
      const transient = offline || (e.status >= 500) || e.status === 409 || e.status === 422;
      setStatus({ state: offline ? "offline" : transient ? "idle" : "error", error: e.status === 401 ? "De sleutel klopt niet (meer)." : e.status === 404 ? "De opslag-repository is niet gevonden." : e.status === 403 ? "De sleutel mag niet schrijven in deze repository (of de limiet is even bereikt)." : transient ? "" : e.message });
      if (transient && !offline) schedule(2000 + Math.random() * 2000); // tijdelijke storing: zo opnieuw proberen
    } finally {
      busy = false;
      if (!failed && (again || isDirty())) { again = false; schedule(PUSH_DELAY_MS); }
    }
  }

  function schedule(ms = PUSH_DELAY_MS) { clearTimeout(timer); timer = setTimeout(syncNow, ms); }

  /* ---------- Koppelen ---------- */

  async function test(c) {
    const res = await gh("", {}, c);
    if (res.status === 401) throw new Error("De sleutel klopt niet. Controleer of je hem helemaal hebt gekopieerd.");
    if (res.status === 404) throw new Error(`Repository ${c.owner}/${c.repo} niet gevonden, of de sleutel heeft er geen toegang toe.`);
    if (!res.ok) throw new Error(`GitHub gaf fout ${res.status}.`);
    const repo = await res.json();
    if (repo.private === false) throw new Error("Deze repository is openbaar. Gebruik een privé repository, dan kan niemand anders de gegevens zien.");
    if (repo.permissions && repo.permissions.push === false) throw new Error("De sleutel mag niet schrijven. Zet bij Contents de toegang op Read and write.");
  }

  const Sync = {
    get configured() { return !!conf; },
    get conf() { return conf; },
    get status() { return status; },
    onStatus(fn) { statusListeners.push(fn); },
    syncNow,

    async connect(c) {
      c = { owner: c.owner.trim(), repo: (c.repo || "potjeshelden-data").trim(), token: c.token.trim() };
      await test(c);
      conf = c; lastRemote = null; changeSeq++;
      localStorage.setItem(CFG_KEY, JSON.stringify(c));
      setStatus({ state: "idle" });
      await syncNow();
    },

    disconnect() {
      conf = null;
      try { localStorage.removeItem(CFG_KEY); } catch (e) { /* niets */ }
      setStatus({ state: "off", error: "" });
    },

    /** Link waarmee een ander apparaat in één tik gekoppeld wordt. De sleutel staat achter de #, die wordt niet naar de server gestuurd. */
    pairLink() {
      const payload = btoa(JSON.stringify(conf));
      return `${location.origin}${location.pathname}#koppel=${encodeURIComponent(payload)}`;
    },

    /** Korte tekst met dezelfde gegevens als de koppellink, om te plakken (handig voor de app op het iPad-beginscherm). */
    pairCode() { return "PH1-" + btoa(JSON.stringify(conf)); },

    async fromCode(text) {
      const t = String(text).trim();
      const m = t.match(/#koppel=(.+)$/);
      const b64 = m ? decodeURIComponent(m[1]) : t.replace(/^PH1-/, "");
      let c;
      try { c = JSON.parse(atob(b64)); } catch (e) { throw new Error("Deze code klopt niet. Kopieer hem opnieuw."); }
      await Sync.connect(c);
    },

    /** Kijk bij het opstarten of de app via een koppellink geopend is. */
    async fromLink() {
      const m = location.hash.match(/^#koppel=(.+)$/);
      if (!m) return null;
      history.replaceState(null, "", location.pathname + location.search);
      try {
        const c = JSON.parse(atob(decodeURIComponent(m[1])));
        await Sync.connect(c);
        return true;
      } catch (e) { return e.message || "Koppelen mislukt."; }
    },

    start() {
      Store.onChange(() => { changeSeq++; if (conf) schedule(); });
      window.addEventListener("online", () => schedule(300));
      window.addEventListener("offline", () => conf && setStatus({ state: "offline" }));
      // Terug in de app (bijv. iPad uit de slaapstand): meteen bijwerken
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") schedule(100); });
      window.addEventListener("pageshow", () => schedule(100));
      setInterval(() => { if (conf && document.visibilityState === "visible" && !busy) syncNow(); }, POLL_MS);
      if (conf) schedule(300);
    },
  };

  window.Sync = Sync;
})();
