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

  async function getData() {
    const res = await gh(`contents/${DATA}`);
    if (res.status === 404) return { data: null, sha: null };
    if (!res.ok) throw httpError(res);
    const j = await res.json();
    let text;
    if (j.content) text = new TextDecoder().decode(fromB64(j.content));
    else { // groter dan 1 MB: los ophalen
      const raw = await gh(`contents/${DATA}`, { headers: { Accept: "application/vnd.github.raw+json" } });
      if (!raw.ok) throw httpError(raw);
      text = await raw.text();
    }
    return { data: JSON.parse(text), sha: j.sha };
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

    const remoteSettingsNewer = (remote.settingsUpdatedAt || 0) > (local.settingsUpdatedAt || 0);

    return {
      ...local,
      version: 2,
      log: [...byId.values()].sort((a, b) => a.ts - b.ts),
      seenUnlocks: [...seen],
      lastKidTap: taps,
      settings: remoteSettingsNewer ? remote.settings : local.settings,
      settingsUpdatedAt: Math.max(local.settingsUpdatedAt || 0, remote.settingsUpdatedAt || 0),
      voiceMeta: { ...(local.voiceMeta || {}) }, // wordt per zin bijgewerkt in syncVoice
      resetAt,
    };
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
    const { log, seenUnlocks, lastKidTap, settings, settingsUpdatedAt, voiceMeta, resetAt } = s;
    return { app: "potjeshelden", version: 2, log, seenUnlocks, lastKidTap, settings, settingsUpdatedAt, voiceMeta, resetAt };
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
    busy = true; setStatus({ state: "busy", error: "" });
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const before = stable(toRemote(Store.state));
        const { data: remote, sha } = await getData();
        const merged = merge(Store.state, remote);
        await syncVoice(merged, Store.state.voiceMeta, remote && remote.voiceMeta);
        const out = stable(toRemote(merged));
        const changedLocally = out !== before;
        if (changedLocally) {
          Store.replace(merged);
          window.dispatchEvent(new CustomEvent("potjeshelden:synced"));
        }
        if (!remote || out !== stable(toRemote({ ...remote, voiceMeta: remote.voiceMeta || {} }))) {
          try {
            await putFile(DATA, new TextEncoder().encode(JSON.stringify(toRemote(merged), null, 1)), sha, "Voortgang bijgewerkt");
          } catch (e) {
            if (e.status === 409 || e.status === 422) continue; // tegelijk gewijzigd op een ander apparaat: opnieuw samenvoegen
            throw e;
          }
        }
        break;
      }
      const now = Date.now();
      try { localStorage.setItem(CFG_KEY + "-last", String(now)); } catch (e) { /* niets */ }
      setStatus({ state: "idle", lastSync: now });
    } catch (e) {
      const offline = !navigator.onLine || e instanceof TypeError;
      setStatus({ state: offline ? "offline" : "error", error: e.status === 401 ? "De sleutel klopt niet (meer)." : e.status === 404 ? "De opslag-repository is niet gevonden." : e.status === 403 ? "De sleutel mag niet schrijven in deze repository." : offline ? "" : e.message });
    } finally {
      busy = false;
      if (again) { again = false; schedule(500); }
    }
  }

  function schedule(ms = 2500) { clearTimeout(timer); timer = setTimeout(syncNow, ms); }

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
      conf = c;
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
      Store.onChange(() => conf && schedule());
      window.addEventListener("online", () => schedule(300));
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") schedule(300); });
      setInterval(() => { if (conf && document.visibilityState === "visible") syncNow(); }, 60000);
      if (conf) schedule(300);
    },
  };

  window.Sync = Sync;
})();
