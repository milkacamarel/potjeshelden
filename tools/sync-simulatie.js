// Draai met: python3 -m http.server 8766 (in de app-map) en daarna: node tools/sync-simulatie.js http://localhost:8766/ 75
// Vereist Playwright (npm i playwright).
// Sync-simulatie: 3 apparaten, nep-GitHub met vertraging, verouderde reads en storingen.
// Gebruik: node sim.js <url> <seconden>
const { chromium } = require('playwright');
const URL_ = process.argv[2] || 'http://localhost:8766/';
const DURATION = Number(process.argv[3] || 75) * 1000;

let seed = 42; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- nep-GitHub ----------
const files = new Map(); // path -> { content, sha, prev: {content, sha}, writtenAt }
const stats = { get: 0, get304: 0, put: 0, put409: 0, err5xx: 0, del: 0 };
let shaN = 0;
async function mock(route) {
  const req = route.request(); const url = new URL(req.url());
  const headers = { 'access-control-allow-origin': '*', 'access-control-expose-headers': 'ETag', 'access-control-allow-headers': '*' };
  const json = (status, obj, extra = {}) => route.fulfill({ status, contentType: 'application/json', headers: { ...headers, ...extra }, body: JSON.stringify(obj) });
  if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { ...headers, 'access-control-allow-methods': '*' } });
  await sleep(150 + rnd() * 450); // netwerk + GitHub vertraging
  if (rnd() < 0.03) { stats.err5xx++; return json(502, { message: 'Bad gateway' }); }
  const m = url.pathname.match(/^\/repos\/fam\/potjeshelden-data(?:\/contents\/(.+))?$/);
  if (!m) return json(404, {});
  const path = m[1] && decodeURIComponent(m[1]);
  if (!path) return json(200, { private: true, permissions: { push: true } });
  const f = files.get(path); const method = req.method();
  if (method === 'GET') {
    stats.get++;
    if (!f) return json(404, { message: 'Not Found' });
    // GitHub-replica's lopen soms een paar seconden achter na een schrijfactie
    const view = f.prev && Date.now() - f.writtenAt < 3000 && rnd() < 0.5 ? f.prev : f;
    const etag = `"${view.sha}"`;
    if (req.headers()['if-none-match'] === etag) { stats.get304++; return route.fulfill({ status: 304, headers: { ...headers, ETag: etag } }); }
    if ((req.headers()['accept'] || '').includes('raw')) return route.fulfill({ status: 200, headers: { ...headers, ETag: etag }, body: Buffer.from(view.content, 'base64') });
    return json(200, { content: view.content, sha: view.sha }, { ETag: etag });
  }
  if (method === 'PUT') {
    const b = JSON.parse(req.postData());
    if (f && b.sha !== f.sha) { stats.put409++; return json(409, { message: 'is at ' + f.sha + ' but expected ' + b.sha }); }
    if (!f && b.sha) return json(422, {});
    stats.put++;
    const n = { content: b.content, sha: 's' + (++shaN), prev: f ? { content: f.content, sha: f.sha } : null, writtenAt: Date.now() };
    files.set(path, n);
    return json(f ? 200 : 201, { content: { sha: n.sha } });
  }
  if (method === 'DELETE') { stats.del++; files.delete(path); return json(200, {}); }
}

(async () => {
  const b = await chromium.launch();
  const errs = [];
  const names = ['MacBook', 'iPad', 'iPhone'];
  const devs = [];
  for (const name of names) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.route('https://api.github.com/**', mock);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(name + ': ' + e.message));
    devs.push({ name, ctx, p, online: true });
  }
  // Koppelen
  const conf = { owner: 'fam', repo: 'potjeshelden-data', token: 'tok' };
  for (const d of devs) {
    await d.p.goto(URL_); await d.p.waitForTimeout(300);
    await d.p.evaluate(async c => { Store.updateSettings({ kidCooldownMin: 0 }); await Sync.connect(c); }, conf);
  }
  await sleep(2000);

  const expected = { stars: 0, entries: new Set(), buttons: new Set() };
  const pending = []; const latencies = []; const onlineLat = []; let missedDuringRun = 0;
  const start = Date.now();
  let actions = 0;

  // Watcher: hoe snel komt een wijziging aan op de andere apparaten?
  const watcher = (async () => {
    while (Date.now() - start < DURATION + 45000) {
      const snaps = await Promise.all(devs.map(d => d.p.evaluate(() => ({ ids: Store.state.log.map(e => e.id), btns: (Store.state.settings.customActions || []).map(a => a.id) })).catch(() => ({ ids: [], btns: [] }))));
      for (const item of pending) {
        devs.forEach((d, i) => {
          if (i === item.origin || item.seen[i] || !d.online) return;
          const ok = item.kind === 'button' ? snaps[i].btns.includes(item.id) : snaps[i].ids.includes(item.id);
          if (ok) { item.seen[i] = Date.now(); const l = (Date.now() - item.t0) / 1000; latencies.push(l); const rel = item.t0 - start; if (!(rel > 18000 && rel < 42000) && !(i === 1 && item.seen[i] - start > 38000 && item.seen[i] - start < 47000)) onlineLat.push(l); }
        });
      }
      await sleep(250);
    }
  })();

  // Willekeurige acties
  while (Date.now() - start < DURATION) {
    const t = Date.now() - start;
    // iPad gaat tussen 20s en 40s offline
    const ipad = devs[1];
    if (t > 20000 && t < 40000 && ipad.online) { ipad.online = false; await ipad.ctx.setOffline(true); await ipad.p.evaluate(() => window.dispatchEvent(new Event('offline'))); }
    if (t >= 40000 && !ipad.online) { ipad.online = true; await ipad.ctx.setOffline(false); await ipad.p.evaluate(() => window.dispatchEvent(new Event('online'))); }

    const oi = Math.floor(rnd() * devs.length); const d = devs[oi];
    const r = rnd();
    if (r < 0.75) { // kind tikt een knop / ouder registreert
      const pts = 1 + Math.floor(rnd() * 5);
      const id = await d.p.evaluate(p => Store.addEntry({ actions: ['plas'], points: p, source: 'kind' }).id, pts);
      expected.stars += pts; expected.entries.add(id);
      pending.push({ kind: 'entry', id, origin: oi, t0: Date.now(), seen: {} });
    } else if (r < 0.9) { // ouder voegt knop toe
      const id = 'c' + Math.floor(rnd() * 1e9).toString(36);
      await d.p.evaluate(id => Store.updateSettings({ customActions: [...(Store.state.settings.customActions || []), { id, kid: id, label: id, emoji: '⭐', color: '#4fc3f7', points: 2 }] }), id);
      expected.buttons.add(id);
      pending.push({ kind: 'button', id, origin: oi, t0: Date.now(), seen: {} });
    } else { // ouder wist registratie (sterren blijven)
      await d.p.evaluate(() => { const e = Store.entries()[0]; if (e) Store.removeEntry(e.id); });
    }
    actions++;
    await sleep(700 + rnd() * 2300);
  }

  // Na afloop: hoe lang duurt het tot alles gelijk is?
  const endActions = Date.now();
  let converged = null;
  while (Date.now() - endActions < 45000) {
    const s = await Promise.all(devs.map(d => d.p.evaluate(() => ({ stars: Store.state.totalStars, ids: Store.state.log.map(e => e.id).sort().join(), removed: Store.state.log.filter(e => e.removed).map(e => e.id).sort().join(), btns: (Store.state.settings.customActions || []).map(a => a.id).sort().join() }))));
    const same = s.every(x => x.stars === s[0].stars && x.ids === s[0].ids && x.removed === s[0].removed && x.btns === s[0].btns);
    if (same && s[0].stars === expected.stars) { converged = (Date.now() - endActions) / 1000; break; }
    await sleep(500);
  }
  await watcher.catch(() => {});
  const final = await Promise.all(devs.map(d => d.p.evaluate(() => ({ stars: Store.state.totalStars, entries: Store.state.log.length, btns: (Store.state.settings.customActions || []).map(a => a.id), status: Sync.status.state }))));
  const lostButtons = [...expected.buttons].filter(id => !final.every(f => f.btns.includes(id)));
  latencies.sort((a, b) => a - b);
  const pct = q => latencies.length ? latencies[Math.min(latencies.length - 1, Math.floor(q * latencies.length))].toFixed(1) : '-';
  const notArrived = pending.reduce((n, it) => n + devs.filter((d, i) => i !== it.origin && !it.seen[i]).length, 0);
  console.log(JSON.stringify({
    acties: actions,
    verwachte_sterren: expected.stars,
    sterren_per_apparaat: final.map(f => f.stars),
    knoppen_kwijt: lostButtons.length + ' van ' + expected.buttons.size,
    gelijk_na_afloop_sec: converged,
    vertraging_sec: { mediaan: pct(0.5), p90: pct(0.9), max: pct(0.999) },
    vertraging_alles_online_sec: (() => { const a = onlineLat.sort((x, y) => x - y); const q = f => a.length ? a[Math.min(a.length - 1, Math.floor(f * a.length))].toFixed(1) : '-'; return { mediaan: q(0.5), p90: q(0.9), max: q(0.999) }; })(),
    nooit_aangekomen: notArrived,
    github: stats,
    status: final.map(f => f.status),
    fouten: errs,
  }, null, 1));
  await b.close();
  process.exit(0);
})();
