/*
 * app.js — schermen, navigatie, beloningen en vieringen.
 * Schermen: home, kind, garage (unlocks), ouder.
 */
(function () {
  const cfg = window.APP_CONFIG;
  const S = window.Store;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const STAR = cfg.currency.icon;

  /* ---------- Hulpjes: punten, items, data ---------- */

  // Alle knoppen: de vaste uit config.js plus de knoppen die de ouder zelf toevoegde.
  const allActions = () => [...cfg.ACTIONS, ...(S.state.settings.customActions || [])];
  const visibleActions = () => allActions().filter(a => !(S.state.settings.hiddenActions || []).includes(a.id));
  const actionById = id => allActions().find(a => a.id === id);
  // Ingesproken zinnen: vaste lijst plus één zin per eigen knop.
  const voiceLines = () => [...cfg.VOICE_LINES, ...(S.state.settings.customActions || []).map(a => (
    { id: `act-${a.id}`, group: "knop", when: `Knop ${a.kid}`, say: `Goed gedaan, ${a.kid.toLowerCase()}!` }))];
  const pointsFor = id => {
    const custom = (S.state.settings.points || {})[id];
    return Number.isFinite(custom) ? custom : (actionById(id) || { points: 0 }).points;
  };
  const starsWord = n => (n === 1 ? cfg.currency.single : cfg.currency.name);

  const allItems = () => cfg.WORLDS.flatMap(w => w.items.map(i => ({ ...i, world: w })));
  const isUnlocked = item => S.state.totalStars >= item.cost;
  const nextItem = () => allItems().filter(i => !isUnlocked(i)).sort((a, b) => a.cost - b.cost)[0];
  const prevCost = () => Math.max(0, ...allItems().filter(isUnlocked).map(i => i.cost));
  const newUnlocks = () => allItems().filter(i => isUnlocked(i) && !S.state.seenUnlocks.includes(i.id));

  function nextText(item) {
    if (!item) return "Je hebt alles verzameld! Wat een kampioen! 🏆";
    const n = item.cost - S.state.totalStars;
    const target = item.type === "held" ? item.name : `je nieuwe ${item.name.toLowerCase()}`;
    return `Nog ${n} ${starsWord(n)} tot ${target}!`;
  }

  const dayKey = ts => { const d = new Date(ts); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const startOfDay = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const fmtTime = ts => new Date(ts).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  const fmtDay = ts => { const s = new Date(ts).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" }); return s[0].toUpperCase() + s.slice(1); };
  const fmtShortDay = ts => new Date(ts).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" });

  function statsFor(entries) {
    const s = { stars: 0, zitten: 0, geprobeerd: 0, aangegeven: 0, plas: 0, poep: 0, handen: 0, count: entries.length };
    entries.forEach(e => { s.stars += e.points; e.actions.forEach(a => { if (a in s) s[a]++; }); });
    return s;
  }

  /* ---------- Geluidjes en eigen stem ---------- */

  function tones(notes, dur = 0.12) {
    if (!S.state.settings.sound) return;
    try {
      const audioCtx = Voice.audioCtx();
      notes.forEach((f, i) => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        const t = audioCtx.currentTime + i * dur;
        o.type = "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.6);
        o.connect(g).connect(audioCtx.destination);
        o.start(t); o.stop(t + dur * 1.8);
      });
    } catch (e) { /* geen geluid beschikbaar */ }
  }
  const sfx = {
    tap: () => tones([660], 0.07),
    star: () => tones([523, 659, 784, 1047]),
    unlock: () => tones([392, 523, 659, 784, 1047, 1319], 0.11),
    soft: () => tones([523, 784], 0.1),
  };

  // Speelt een ingesproken zin van papa/mama. Zonder opname blijft het stil (alleen de geluidjes).
  function speak(ids, delay = 0.5) {
    if (!S.state.settings.voice) return Promise.resolve(false);
    return Voice.playAny([].concat(ids), delay);
  }

  const praise = () => {
    const p = cfg.PRAISE[Math.floor(Math.random() * cfg.PRAISE.length)];
    const name = S.state.settings.childName;
    return name && Math.random() < 0.5 ? `${p.replace("!", "")}, ${name}!` : p;
  };

  /* ---------- Navigatie ---------- */

  let current = "home";
  function go(screen, opts = {}) {
    current = screen;
    $$(".screen").forEach(s => (s.hidden = s.id !== `screen-${screen}`));
    document.body.dataset.screen = screen;
    ({ home: renderHome, kind: renderKind, garage: renderGarage, ouder: renderOuder })[screen](opts);
    window.scrollTo(0, 0);
  }

  document.addEventListener("click", e => {
    const el = e.target.closest("[data-go]");
    if (el) { sfx.tap(); go(el.dataset.go, { world: el.dataset.world }); }
  });

  /* ---------- Home ---------- */

  function renderHome() {
    const name = S.state.settings.childName;
    $("#screen-home").innerHTML = `
      <div class="home">
        <div class="home-hero">
          <div class="hero-art bob">${ART.puppyheld()}</div>
          <h1 class="logo">Potjes<span>helden</span></h1>
          <p class="home-sub">${name ? `Hoi ${esc(name)}! ` : ""}Klaar voor een missie?</p>
          <div class="star-pill big">${STAR} <b>${S.state.totalStars}</b></div>
        </div>
        <button class="btn btn-mega" data-go="kind"><span class="btn-ico">🚀</span>Spelen!</button>
        <button class="btn btn-big btn-garage" data-go="garage"><span class="btn-ico">🏆</span>Mijn garage</button>
        <button class="btn btn-hold" id="parent-gate" aria-label="Houd ingedrukt voor oudermodus">
          <span class="hold-fill"></span><span class="hold-label">👤 Voor ouders <small>(houd ingedrukt)</small></span>
        </button>
        <div class="home-road" aria-hidden="true">
          <div class="road-car">${ART.raceauto()}</div>
        </div>
      </div>`;
    setupHoldGate($("#parent-gate"), () => go("ouder"));
  }

  // Ouderpoort: 1,5 seconde ingedrukt houden, zodat een peuter er niet per ongeluk in komt.
  function setupHoldGate(btn, onDone) {
    let timer;
    const start = e => { e.preventDefault(); btn.classList.add("holding"); timer = setTimeout(() => { btn.classList.remove("holding"); sfx.soft(); onDone(); }, 1500); };
    const stop = () => { btn.classList.remove("holding"); clearTimeout(timer); };
    btn.addEventListener("pointerdown", start);
    ["pointerup", "pointerleave", "pointercancel"].forEach(ev => btn.addEventListener(ev, stop));
    btn.addEventListener("contextmenu", e => e.preventDefault());
  }

  /* ---------- Kindermodus ---------- */

  function progressCard() {
    const item = nextItem();
    const from = prevCost();
    const pct = item ? Math.round(((S.state.totalStars - from) / (item.cost - from)) * 100) : 100;
    return `
      <div class="progress-card" style="--accent:${item ? item.world.color : "#ffb300"}">
        <div class="progress-thumb ${item ? "mystery" : ""}">${item ? renderArt(item) : "🏆"}</div>
        <div class="progress-body">
          <div class="progress-text">${esc(nextText(item))}</div>
          <div class="bar"><div class="bar-fill" style="width:${pct}%"></div>
            ${item ? `<span class="bar-goal">${STAR}${item.cost}</span>` : ""}</div>
        </div>
      </div>`;
  }

  function renderKind() {
    const st = S.state.settings;
    $("#screen-kind").innerHTML = `
      <header class="topbar">
        <button class="btn-round" data-go="home" aria-label="Naar home">🏠</button>
        <div class="star-pill" id="kid-stars">${STAR} <b>${S.state.totalStars}</b></div>
        <button class="btn-round" data-go="garage" aria-label="Naar garage">🏆</button>
      </header>
      <div id="kid-progress">${progressCard()}</div>
      <h2 class="kid-title">Wat heb je gedaan?</h2>
      <div class="action-grid">
        ${visibleActions().map(a => `
          <button class="action-btn" data-action="${a.id}" style="--c:${a.color}">
            <span class="action-emoji">${a.emoji}</span>
            <span class="action-label">${esc(a.kid)}</span>
            ${st.kidCanAward ? `<span class="action-pts">+${pointsFor(a.id)} ${STAR}</span>` : ""}
          </button>`).join("")}
      </div>
      <button class="btn btn-big btn-garage" data-go="garage"><span class="btn-ico">🚗</span>Naar mijn garage</button>`;

    $$(".action-btn", $("#screen-kind")).forEach(b => b.addEventListener("click", () => kidAction(b.dataset.action, b)));
    // Heeft de ouder sterren gegeven? Dan staat er misschien een verrassing klaar.
    if (newUnlocks().length) setTimeout(checkUnlocks, 500);
    else speak("welkom", 0.2);
  }

  function kidAction(id, btn) {
    const st = S.state.settings;
    const a = actionById(id);
    btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");

    const last = S.state.lastKidTap[id] || 0;
    const cooling = st.kidCooldownMin > 0 && Date.now() - last < st.kidCooldownMin * 60000;

    // Altijd een compliment, nooit een "nee". Sterren alleen als het mag (ouder-instelling / afkoeltijd).
    if (!st.kidCanAward || cooling) {
      sfx.soft();
      cheer({ points: 0, emoji: a.emoji, text: praise(), sub: st.kidCanAward ? "" : "Vertel het aan papa of mama!" });
      speakForAction(id);
      return;
    }
    S.markKidTap(id);
    const pts = pointsFor(id);
    S.addEntry({ actions: [id], points: pts, source: "kind" });
    sfx.star();
    cheer({ points: pts, emoji: a.emoji, text: praise() }, () => checkUnlocks());
    speakForAction(id);
    refreshKidHeader();
  }

  function speakForAction(id) {
    speak(`act-${id}`).then(played => { if (!played) speak(voiceLines().filter(l => l.group === "compliment").map(l => l.id)); });
  }

  function refreshKidHeader() {
    const s = $("#kid-stars"); if (s) { s.innerHTML = `${STAR} <b>${S.state.totalStars}</b>`; s.classList.remove("pop"); void s.offsetWidth; s.classList.add("pop"); }
    const p = $("#kid-progress"); if (p) p.innerHTML = progressCard();
  }

  /* ---------- Vieringen ---------- */

  function confetti(container, n = 26) {
    const icons = [STAR, "✨", "🌟", "⭐"];
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "confetti";
      s.textContent = icons[i % icons.length];
      s.style.left = Math.random() * 100 + "%";
      s.style.animationDelay = Math.random() * 0.5 + "s";
      s.style.fontSize = 18 + Math.random() * 26 + "px";
      container.appendChild(s);
    }
  }

  function cheer({ points, emoji, text, sub = "" }, after) {
    const ov = $("#overlay-cheer");
    ov.innerHTML = `
      <div class="cheer-card">
        <div class="cheer-emoji">${emoji}</div>
        <div class="cheer-text">${esc(text)}</div>
        ${points ? `<div class="cheer-points">+${points} ${STAR}</div>` : ""}
        ${sub ? `<div class="cheer-sub">${esc(sub)}</div>` : ""}
        <button class="btn btn-big btn-ok">👍 Oké!</button>
      </div>`;
    if (points) confetti(ov);
    ov.hidden = false;
    const close = () => { ov.hidden = true; ov.innerHTML = ""; clearTimeout(t); if (after) after(); };
    const t = setTimeout(close, points ? 3200 : 2400);
    ov.onclick = close;
  }

  function checkUnlocks() {
    const fresh = newUnlocks();
    if (!fresh.length) {
      const next = nextItem();
      if (current === "kind" && next && next.cost - S.state.totalStars <= 3) speak("bijna", 0.1);
      return;
    }
    showUnlock(fresh, 0);
  }

  function showUnlock(list, idx) {
    const item = list[idx];
    const ov = $("#overlay-unlock");
    ov.style.setProperty("--accent", item.world.color);
    ov.innerHTML = `
      <div class="unlock-card">
        <div class="unlock-ribbon">Nieuw in je garage!</div>
        <div class="unlock-art shine">${renderArt(item)}</div>
        <div class="unlock-name">${esc(item.name)}</div>
        <div class="unlock-world">${item.world.emoji} ${esc(item.world.name)} · ${cfg.TYPE_LABELS[item.type]}</div>
        <button class="btn btn-mega btn-ok">🎉 Joepie!</button>
      </div>`;
    confetti(ov, 40);
    ov.hidden = false;
    sfx.unlock();
    if (idx === 0) speak("nieuw", 0.9);
    S.markSeen([item.id]);
    $(".btn-ok", ov).onclick = () => {
      ov.hidden = true; ov.innerHTML = "";
      if (idx + 1 < list.length) showUnlock(list, idx + 1);
      else if (current === "kind") refreshKidHeader();
      else if (current === "garage") renderGarage({});
    };
  }

  /* ---------- Garage / unlock-scherm ---------- */

  let garageWorld = cfg.WORLDS[0].id;
  function renderGarage({ world } = {}) {
    if (world) garageWorld = world;
    const w = cfg.WORLDS.find(x => x.id === garageWorld);
    const got = w.items.filter(isUnlocked).length;
    const el = $("#screen-garage");
    el.style.setProperty("--world-bg", w.bg);
    el.style.setProperty("--accent", w.color);
    el.innerHTML = `
      <header class="topbar">
        <button class="btn-round" data-go="kind" aria-label="Terug">⬅️</button>
        <div class="star-pill">${STAR} <b>${S.state.totalStars}</b></div>
        <button class="btn-round" data-go="home" aria-label="Naar home">🏠</button>
      </header>
      <div class="world-tabs" role="tablist">
        ${cfg.WORLDS.map(x => `
          <button class="world-tab ${x.id === w.id ? "active" : ""}" data-world-tab="${x.id}" style="--c:${x.color}" role="tab" aria-selected="${x.id === w.id}">
            <span class="wt-emoji">${x.emoji}</span><span class="wt-name">${esc(x.name.replace("wereld", ""))}</span>
          </button>`).join("")}
      </div>
      <div class="world-head">
        <h2>${w.emoji} ${esc(w.name)}</h2>
        <div class="world-count">${got} / ${w.items.length} verzameld</div>
        <div class="bar small"><div class="bar-fill" style="width:${Math.round((got / w.items.length) * 100)}%"></div></div>
      </div>
      <div class="item-grid">
        ${w.items.map(i => {
          const open = isUnlocked(i);
          return `
            <button class="item ${open ? "open" : "locked"}" data-item="${i.id}">
              <div class="item-art">${renderArt(i)}</div>
              <div class="item-name">${open ? esc(i.name) : "???"}</div>
              <div class="item-meta">${open ? cfg.TYPE_LABELS[i.type] : `🔒 ${STAR} ${i.cost}`}</div>
            </button>`;
        }).join("")}
      </div>`;

    $$("[data-world-tab]", el).forEach(b => b.addEventListener("click", () => { sfx.tap(); renderGarage({ world: b.dataset.worldTab }); }));
    $$("[data-item]", el).forEach(b => b.addEventListener("click", () => {
      const item = allItems().find(i => i.id === b.dataset.item);
      b.classList.remove("wiggle"); void b.offsetWidth; b.classList.add("wiggle");
      if (isUnlocked(item)) sfx.star();
      else { sfx.soft(); speak("op-slot", 0.2); }
    }));

    if (newUnlocks().length) setTimeout(checkUnlocks, 300);
  }

  /* ---------- Oudermodus ---------- */

  let parentTab = "registreren";
  let weekOffset = 0;

  function renderOuder({} = {}) {
    const el = $("#screen-ouder");
    const tabs = [["registreren", "✏️", "Registreren"], ["overzicht", "📊", "Overzicht"], ["logboek", "📒", "Logboek"], ["knoppen", "🔘", "Knoppen"], ["stem", "🎙️", "Stem"], ["instellingen", "⚙️", "Instellingen"]];
    el.innerHTML = `
      <header class="parent-top">
        <button class="btn-round small" data-go="home" aria-label="Naar home">🏠</button>
        <div><h1>Oudermodus</h1><div class="parent-sub">Totaal verdiend: ${STAR} ${S.state.totalStars}</div></div>
        <button class="btn-round small" data-go="kind" aria-label="Naar kindermodus">🧒</button>
      </header>
      <nav class="parent-tabs">${tabs.map(([id, ico, label]) => `<button class="ptab ${id === parentTab ? "active" : ""}" data-ptab="${id}"><span>${ico}</span>${label}</button>`).join("")}</nav>
      <div class="parent-body" id="parent-body"></div>`;
    $$("[data-ptab]", el).forEach(b => b.addEventListener("click", () => { parentTab = b.dataset.ptab; renderOuder(); }));
    ({ registreren: tabRegister, overzicht: tabOverview, logboek: tabLog, knoppen: tabButtons, stem: tabVoice, instellingen: tabSettings })[parentTab]($("#parent-body"));
  }

  const toLocalInput = ts => { const d = new Date(ts); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

  function tabRegister(root) {
    root.innerHTML = `
      <form class="card form" id="reg-form" autocomplete="off">
        <h2>Snel registreren</h2>
        <label class="field"><span>Datum en tijd</span><input type="datetime-local" name="ts" value="${toLocalInput(Date.now())}" required></label>
        <div class="field"><span>Wat ging er goed?</span>
          <div class="chips">
            ${visibleActions().map(a => `
              <label class="chip"><input type="checkbox" name="act" value="${a.id}">
                <span>${a.emoji} ${esc(a.label)} <em>+${pointsFor(a.id)}</em></span></label>`).join("")}
          </div>
        </div>
        <label class="field"><span>Bijzonderheden <small>(optioneel)</small></span>
          <textarea name="note" rows="2" placeholder="Bijv. na het eten, zelf naar de wc gelopen…"></textarea></label>
        <div class="points-row">
          <label class="switch"><input type="checkbox" name="manual"><span>Zelf aantal sterren kiezen</span></label>
          <div class="stepper">
            <button type="button" data-step="-1" aria-label="Minder">−</button>
            <output id="pts-out">0</output>
            <button type="button" data-step="1" aria-label="Meer">+</button>
          </div>
        </div>
        <p class="hint" id="pts-hint">Automatisch berekend op basis van de aangevinkte stappen.</p>
        <button class="btn btn-primary" type="submit">${STAR} Opslaan</button>
      </form>

      <div class="card">
        <h2>Snelle bonus</h2>
        <p class="hint">Voor iets extra's, zoals goed meewerken of dapper zijn.</p>
        <div class="bonus-row">${[1, 2, 3, 5].map(n => `<button class="btn btn-bonus" data-bonus="${n}">+${n} ${STAR}</button>`).join("")}</div>
      </div>`;

    const form = $("#reg-form", root);
    const out = $("#pts-out", root);
    let manualPts = 0;
    const autoPts = () => $$('input[name="act"]:checked', form).reduce((s, i) => s + pointsFor(i.value), 0);
    const update = () => {
      const manual = form.manual.checked;
      if (!manual) manualPts = autoPts();
      out.textContent = manualPts;
      $(".stepper", form).classList.toggle("disabled", !manual);
      $("#pts-hint", root).textContent = manual ? "Je kiest zelf hoeveel sterren er bij komen." : "Automatisch berekend op basis van de aangevinkte stappen.";
    };
    form.addEventListener("change", update);
    $$("[data-step]", form).forEach(b => b.addEventListener("click", () => {
      if (!form.manual.checked) return;
      manualPts = Math.max(0, Math.min(50, manualPts + Number(b.dataset.step))); update();
    }));
    update();

    form.addEventListener("submit", e => {
      e.preventDefault();
      const actions = $$('input[name="act"]:checked', form).map(i => i.value);
      const note = form.note.value.trim();
      if (!actions.length && !note && !manualPts) { toast("Vink eerst iets aan 🙂"); return; }
      const ts = new Date(form.ts.value).getTime() || Date.now();
      const entry = S.addEntry({ actions, points: manualPts, note, ts, source: "ouder" });
      toast(`Opgeslagen! +${entry.points} ${STAR}`);
      renderOuder();
      if (newUnlocks().length) toast(`Opgeslagen! +${entry.points} ${STAR} · Er staat een verrassing klaar in de garage 🎁`);
    });

    $$("[data-bonus]", root).forEach(b => b.addEventListener("click", () => {
      const n = Number(b.dataset.bonus);
      S.addEntry({ actions: [], points: n, note: "Bonus", source: "bonus" });
      toast(`Bonus gegeven: +${n} ${STAR}`);
      renderOuder();
    }));
  }

  function tabOverview(root) {
    const today = startOfDay(Date.now());
    const todayStats = statsFor(S.state.log.filter(e => startOfDay(e.ts) === today));
    // Week = maandag t/m zondag
    const monday = new Date(today); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + weekOffset * 7);
    const days = [...Array(7)].map((_, i) => { const d = new Date(monday); d.setDate(d.getDate() + i); return d.getTime(); });
    const perDay = days.map(d => ({ d, s: statsFor(S.state.log.filter(e => startOfDay(e.ts) === d)) }));
    const weekStats = statsFor(S.state.log.filter(e => e.ts >= days[0] && e.ts < days[6] + 864e5));
    const max = Math.max(5, ...perDay.map(p => p.s.stars));
    const stat = (ico, n, label) => `<div class="stat"><div class="stat-ico">${ico}</div><div class="stat-n">${n}</div><div class="stat-l">${label}</div></div>`;
    const weekLabel = weekOffset === 0 ? "Deze week" : weekOffset === -1 ? "Vorige week" : `${fmtShortDay(days[0])} – ${fmtShortDay(days[6])}`;

    root.innerHTML = `
      <div class="card">
        <h2>Vandaag</h2>
        <div class="stats">
          ${stat(STAR, todayStats.stars, "sterren")}
          ${stat("🚽", todayStats.zitten, "gezeten")}
          ${stat("🙋", todayStats.aangegeven, "zelf gezegd")}
          ${stat("💧", todayStats.plas, "plasjes")}
          ${stat("💩", todayStats.poep, "poepjes")}
          ${stat("🧼", todayStats.handen, "handen")}
        </div>
      </div>

      <div class="card">
        <div class="week-nav">
          <button class="btn-round small" data-week="-1" aria-label="Vorige week">◀</button>
          <h2>${weekLabel}</h2>
          <button class="btn-round small" data-week="1" ${weekOffset >= 0 ? "disabled" : ""} aria-label="Volgende week">▶</button>
        </div>
        <div class="week-chart">
          ${perDay.map(({ d, s }) => `
            <div class="wday ${d === today ? "today" : ""}">
              <div class="wbar-wrap"><div class="wbar" style="height:${(s.stars / max) * 100}%"><span>${s.stars || ""}</span></div></div>
              <div class="wlabel">${new Date(d).toLocaleDateString("nl-NL", { weekday: "short" })}</div>
              <div class="wicons">${s.plas ? `💧${s.plas}` : ""} ${s.poep ? `💩${s.poep}` : ""}</div>
            </div>`).join("")}
        </div>
        <div class="stats compact">
          ${stat(STAR, weekStats.stars, "sterren")}
          ${stat("💧", weekStats.plas, "plasjes")}
          ${stat("💩", weekStats.poep, "poepjes")}
          ${stat("🙋", weekStats.aangegeven, "zelf gezegd")}
        </div>
        <p class="hint">Elke stap telt, ook gaan zitten en proberen. Kleine stapjes zijn grote overwinningen. 💛</p>
      </div>

      <div class="card">
        <h2>Verzameld</h2>
        <div class="stats compact">
          ${cfg.WORLDS.map(w => stat(w.emoji, `${w.items.filter(isUnlocked).length}/${w.items.length}`, esc(w.name))).join("")}
        </div>
        <p class="hint">${esc(nextText(nextItem()))}</p>
      </div>`;

    $$("[data-week]", root).forEach(b => b.addEventListener("click", () => { weekOffset = Math.min(0, weekOffset + Number(b.dataset.week)); renderOuder(); }));
  }

  function tabLog(root) {
    const entries = [...S.state.log].reverse();
    if (!entries.length) { root.innerHTML = `<div class="card empty">Nog niets geregistreerd. Elk begin is een feestje! 🎈</div>`; return; }
    const groups = [];
    entries.forEach(e => {
      const k = dayKey(e.ts);
      if (!groups.length || groups[groups.length - 1].k !== k) groups.push({ k, ts: e.ts, items: [] });
      groups[groups.length - 1].items.push(e);
    });
    const srcLabel = { kind: "🧒 kind", ouder: "👤 ouder", bonus: "🎁 bonus" };
    root.innerHTML = groups.slice(0, 60).map(g => `
      <div class="card log-day">
        <h3>${esc(fmtDay(g.ts))} <span class="log-sum">${STAR} ${g.items.reduce((s, e) => s + e.points, 0)}</span></h3>
        ${g.items.map(e => `
          <div class="log-row">
            <div class="log-time">${fmtTime(e.ts)}</div>
            <div class="log-main">
              <div class="log-acts">${e.actions.map(a => `<span title="${esc(actionById(a)?.label || a)}">${actionById(a)?.emoji || "•"}</span>`).join("") || "🎁"}
                <span class="log-pts">+${e.points}</span><span class="log-src">${srcLabel[e.source] || ""}</span></div>
              ${e.note ? `<div class="log-note">${esc(e.note)}</div>` : ""}
            </div>
            <button class="log-del" data-del="${e.id}" aria-label="Verwijder registratie">✕</button>
          </div>`).join("")}
      </div>`).join("");
    $$("[data-del]", root).forEach(b => b.addEventListener("click", () => {
      ask("Deze registratie uit het logboek halen? De verdiende sterren blijven gewoon staan.", "Ja, weghalen")
        .then(ok => { if (ok) { S.removeEntry(b.dataset.del); renderOuder(); } });
    }));
  }

  /* Knoppen beheren: punten aanpassen, verbergen, eigen knoppen toevoegen */

  const BUTTON_EMOJI = ["🩲", "🧻", "🚽", "👖", "🌙", "☀️", "🦷", "🚿", "👟", "🧸", "🎵", "⭐", "🚒", "🏎️", "🚜", "🐶", "🦺", "🏆", "💦", "🌊", "🙌"];
  const BUTTON_COLORS = ["#4fc3f7", "#9575cd", "#ffb74d", "#4dd0e1", "#a1887f", "#81c784", "#f06292", "#ff8a65", "#7986cb", "#aed581"];
  const BUTTON_IDEAS = [
    { kid: "Droge broek", label: "Droge broek/onderbroek", emoji: "🩲", points: 3 },
    { kid: "Afvegen", label: "Zelf billen afvegen", emoji: "🧻", points: 2 },
    { kid: "Doortrekken", label: "Zelf doortrekken", emoji: "🌊", points: 1 },
    { kid: "Broek aan", label: "Zelf broek aantrekken", emoji: "👖", points: 2 },
  ];

  function tabButtons(root) {
    const st = S.state.settings;
    const hidden = st.hiddenActions || [];
    const customIds = (st.customActions || []).map(a => a.id);
    root.innerHTML = `
      <form class="card form" id="btn-form">
        <h2>Knoppen voor ${esc(st.childName || "je kind")}</h2>
        <p class="hint">Pas aan hoeveel sterren een knop geeft, of zet een knop uit. Een uitgezette knop verdwijnt uit de kindermodus, maar alles wat al verdiend is blijft staan.</p>
        <div class="btn-list">
          ${allActions().map(a => `
            <div class="btn-item ${hidden.includes(a.id) ? "off" : ""}">
              <span class="bi-emoji" style="background:${a.color}">${a.emoji}</span>
              <span class="bi-text"><b>${esc(a.kid)}</b><small>${esc(a.label)}</small></span>
              <label class="bi-pts"><input type="number" min="0" max="20" name="pt-${a.id}" value="${pointsFor(a.id)}" inputmode="numeric" aria-label="Sterren voor ${esc(a.kid)}">⭐</label>
              <label class="switch bi-show" title="Zichtbaar"><input type="checkbox" name="show-${a.id}" ${hidden.includes(a.id) ? "" : "checked"}><span>Aan</span></label>
              ${customIds.includes(a.id) ? `<button type="button" class="log-del" data-delbtn="${a.id}" aria-label="Knop verwijderen">🗑</button>` : ""}
            </div>`).join("")}
        </div>
        <button class="btn btn-primary" type="submit">Wijzigingen opslaan</button>
      </form>

      <form class="card form" id="new-btn" autocomplete="off">
        <h2>Nieuwe knop maken</h2>
        <div class="field"><span>Snel kiezen</span>
          <div class="idea-row">${BUTTON_IDEAS.map((x, i) => `<button type="button" class="vbtn" data-idea="${i}">${x.emoji} ${esc(x.kid)}</button>`).join("")}</div>
        </div>
        <label class="field"><span>Tekst op de knop <small>(kort, max. 14 tekens)</small></span>
          <input name="kid" maxlength="14" required placeholder="Bijv. Droge broek"></label>
        <label class="field"><span>Uitleg voor jezelf <small>(optioneel)</small></span>
          <input name="label" maxlength="40" placeholder="Bijv. Droge onderbroek na het dutje"></label>
        <div class="field"><span>Plaatje</span>
          <div class="pick-grid">${BUTTON_EMOJI.map((e, i) => `<label class="pick"><input type="radio" name="emoji" value="${e}" ${i === 0 ? "checked" : ""}><span>${e}</span></label>`).join("")}</div>
        </div>
        <div class="field"><span>Kleur</span>
          <div class="pick-grid">${BUTTON_COLORS.map((c, i) => `<label class="pick"><input type="radio" name="color" value="${c}" ${i === 0 ? "checked" : ""}><span class="swatch" style="background:${c}"></span></label>`).join("")}</div>
        </div>
        <label class="field"><span>Aantal sterren</span>
          <input type="number" name="points" min="0" max="20" value="2" inputmode="numeric"></label>
        <button class="btn btn-primary" type="submit">➕ Knop toevoegen</button>
      </form>`;

    $("#btn-form", root).addEventListener("submit", e => {
      e.preventDefault();
      const f = e.target;
      const points = { ...(st.points || {}) };
      const hiddenNew = [];
      allActions().forEach(a => {
        const v = parseInt(f[`pt-${a.id}`].value, 10);
        points[a.id] = Number.isFinite(v) ? Math.max(0, Math.min(20, v)) : a.points;
        if (!f[`show-${a.id}`].checked) hiddenNew.push(a.id);
      });
      if (hiddenNew.length === allActions().length) { toast("Laat minstens één knop aan staan 🙂"); return; }
      S.updateSettings({ points, hiddenActions: hiddenNew });
      toast("Knoppen opgeslagen ✅");
      renderOuder();
    });

    $$("[data-delbtn]", root).forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.delbtn;
      ask("Deze knop verwijderen? Verdiende sterren blijven staan.", "Ja, verwijderen").then(ok => {
        if (!ok) return;
        S.updateSettings({
          customActions: st.customActions.filter(a => a.id !== id),
          hiddenActions: (st.hiddenActions || []).filter(x => x !== id),
        });
        Voice.remove(`act-${id}`);
        toast("Knop verwijderd");
        renderOuder();
      });
    }));

    const nf = $("#new-btn", root);
    $$("[data-idea]", nf).forEach(b => b.addEventListener("click", () => {
      const x = BUTTON_IDEAS[b.dataset.idea];
      nf.kid.value = x.kid; nf.label.value = x.label; nf.points.value = x.points;
      const r = $$('input[name="emoji"]', nf).find(i => i.value === x.emoji);
      if (r) r.checked = true;
    }));
    nf.addEventListener("submit", e => {
      e.preventDefault();
      const kid = nf.kid.value.trim();
      if (!kid) return;
      const pts = parseInt(nf.points.value, 10);
      const action = {
        id: "c" + Date.now().toString(36),
        kid, label: nf.label.value.trim() || kid,
        emoji: nf.emoji.value, color: nf.color.value,
        points: Number.isFinite(pts) ? Math.max(0, Math.min(20, pts)) : 2,
      };
      S.updateSettings({ customActions: [...(st.customActions || []), action] });
      toast(`Knop "${kid}" toegevoegd ✅ Je kunt er bij 🎙️ Stem een zin voor inspreken.`);
      renderOuder();
    });
  }

  let recording = null; // { id, ctrl } tijdens een opname

  function tabVoice(root) {
    const canRec = Voice.canRecord();
    const lines = voiceLines();
    const done = lines.filter(l => Voice.has(l.id)).length;
    const groups = [["algemeen", "Algemeen"], ["knop", "Bij de knoppen"], ["compliment", "Complimentjes"]];
    root.innerHTML = `
      <div class="card">
        <h2>Jouw stem 🎙️</h2>
        <p class="hint">Spreek zelf de zinnen in die ${esc(S.state.settings.childName || "je kind")} hoort. Een zin zonder opname blijft stil, er klinkt dan alleen een vrolijk geluidje. De tekst is een voorstel: zeg het gerust op je eigen manier.</p>
        <div class="voice-count">${done} van ${lines.length} zinnen ingesproken</div>
        ${canRec ? "" : `<p class="note-box">Opnemen met de microfoon kan hier niet (dat kan alleen in een browser via https of op de computer zelf via localhost). Neem de zin op met de <b>Dictafoon</b>-app en kies hem met <b>📁 Bestand</b>.</p>`}
      </div>
      ${groups.map(([g, title]) => `
        <div class="card">
          <h2>${title}</h2>
          ${lines.filter(l => l.group === g).map(l => {
            const has = Voice.has(l.id), rec = recording && recording.id === l.id;
            return `
              <div class="voice-row ${has ? "has" : ""}">
                <div class="voice-text">
                  <div class="voice-say">“${esc(l.say)}”</div>
                  <div class="voice-when">${esc(l.when)}</div>
                </div>
                <div class="voice-btns">
                  ${canRec ? `<button class="vbtn ${rec ? "rec" : ""}" data-rec="${l.id}">${rec ? "⏹ Stop" : "🔴 Opnemen"}</button>` : ""}
                  <label class="vbtn" for="vf-${l.id}">📁 Bestand</label>
                  <input type="file" id="vf-${l.id}" data-file="${l.id}" accept="audio/*" hidden>
                  ${has ? `<button class="vbtn" data-play="${l.id}">▶️ Luister</button><button class="vbtn ghost" data-delvoice="${l.id}" aria-label="Opname wissen">🗑</button>` : ""}
                </div>
              </div>`;
          }).join("")}
        </div>`).join("")}`;

    $$("[data-rec]", root).forEach(b => b.addEventListener("click", async () => {
      const id = b.dataset.rec;
      if (recording) {
        const r = recording; recording = null;
        r.ctrl.stop();
        if (r.id !== id) tabVoice(root);
        return;
      }
      try {
        const ctrl = await Voice.record(10);
        recording = { id, ctrl };
        tabVoice(root);
        const blob = await ctrl.done;
        recording = null;
        if (blob.size > 0) { await Voice.save(id, blob); toast("Opgenomen ✅"); Voice.play(id); }
      } catch (e) {
        recording = null;
        toast("De microfoon mag niet gebruikt worden. Kies dan een bestand.");
      }
      tabVoice(root);
    }));
    $$("[data-file]", root).forEach(inp => inp.addEventListener("change", async () => {
      const file = inp.files[0]; if (!file) return;
      if (file.size > 5 * 1024 * 1024) { toast("Dat bestand is te groot (max 5 MB)."); return; }
      await Voice.save(inp.dataset.file, file);
      const ok = await Voice.play(inp.dataset.file);
      toast(ok ? "Opname toegevoegd ✅" : "Dit geluidsbestand kan deze browser niet afspelen.");
      tabVoice(root);
    }));
    $$("[data-play]", root).forEach(b => b.addEventListener("click", () => Voice.play(b.dataset.play)));
    $$("[data-delvoice]", root).forEach(b => b.addEventListener("click", () => {
      ask("Deze opname wissen?", "Ja, wissen").then(ok => { if (ok) Voice.remove(b.dataset.delvoice).then(() => tabVoice(root)); });
    }));
  }

  function tabSettings(root) {
    const st = S.state.settings;
    root.innerHTML = `
      <form class="card form" id="set-form">
        <h2>Kind</h2>
        <label class="field"><span>Naam van je kind <small>(voor de complimentjes)</small></span>
          <input name="childName" value="${esc(st.childName)}" maxlength="20" placeholder="Bijv. Noah"></label>
        <label class="switch"><input type="checkbox" name="sound" ${st.sound ? "checked" : ""}><span>Geluidjes</span></label>
        <label class="switch"><input type="checkbox" name="voice" ${st.voice ? "checked" : ""}><span>Mijn ingesproken zinnen afspelen <small>(inspreken bij 🎙️ Stem)</small></span></label>

        <h2>Kindermodus</h2>
        <label class="switch"><input type="checkbox" name="kidCanAward" ${st.kidCanAward ? "checked" : ""}><span>Kind mag zelf sterren geven met de knoppen</span></label>
        <label class="field"><span>Zelfde knop telt weer na</span>
          <select name="kidCooldownMin">
            ${[0, 1, 2, 5, 10, 30].map(n => `<option value="${n}" ${n === st.kidCooldownMin ? "selected" : ""}>${n === 0 ? "direct (geen wachttijd)" : n + " minuten"}</option>`).join("")}
          </select></label>
        <p class="hint">Tikt je kind binnen die tijd nog eens, dan krijgt het wel een compliment maar geen extra sterren.</p>

        <button class="btn btn-primary" type="submit">Instellingen opslaan</button>
      </form>

      <div class="card">
        <h2>Gegevens</h2>
        <p class="hint">Alles wordt alleen op dit apparaat bewaard (in de browser). Maak af en toe een back-up.</p>
        <div class="btn-row">
          <button class="btn" id="btn-export">⬇️ Back-up downloaden</button>
          <button class="btn" id="btn-copy">📋 Back-up kopiëren</button>
          <label class="btn" for="file-import">⬆️ Back-up terugzetten</label>
          <input type="file" id="file-import" accept="application/json,.json" hidden>
        </div>
        <button class="btn btn-danger" id="btn-reset">Alles wissen en opnieuw beginnen</button>
      </div>`;

    $("#set-form", root).addEventListener("submit", e => {
      e.preventDefault();
      const f = e.target;
      S.updateSettings({
        childName: f.childName.value.trim(), sound: f.sound.checked, voice: f.voice.checked,
        kidCanAward: f.kidCanAward.checked, kidCooldownMin: Number(f.kidCooldownMin.value),
      });
      toast("Instellingen opgeslagen ✅");
      renderOuder();
    });

    $("#btn-export", root).addEventListener("click", () => {
      const blob = new Blob([S.exportJSON()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `potjeshelden-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
    });
    $("#btn-copy", root).addEventListener("click", () => {
      navigator.clipboard.writeText(S.exportJSON())
        .then(() => toast("Back-up gekopieerd. Plak hem in een notitie of mail aan jezelf."))
        .catch(() => toast("Kopiëren lukte niet in deze browser."));
    });
    $("#file-import", root).addEventListener("change", async e => {
      const file = e.target.files[0]; if (!file) return;
      try { S.importJSON(await file.text()); toast("Back-up teruggezet ✅"); renderOuder(); }
      catch (err) { toast("Dit bestand kon niet gelezen worden."); }
    });
    $("#btn-reset", root).addEventListener("click", () => {
      ask("Weet je het zeker? Alle sterren, unlocks en het logboek worden gewist.", "Ja, verder")
        .then(ok => ok && ask("Echt alles wissen? Dit kan niet ongedaan worden gemaakt.", "Alles wissen"))
        .then(ok => { if (ok) { S.resetAll(); toast("Alles is gewist. Nieuwe start! 🌱"); renderOuder(); } });
    });
  }

  /* ---------- Bevestigen (eigen venster, werkt overal) ---------- */

  function ask(message, okLabel) {
    return new Promise(resolve => {
      const ov = $("#overlay-ask");
      ov.innerHTML = `
        <div class="ask-card" role="alertdialog" aria-modal="true">
          <p>${esc(message)}</p>
          <div class="btn-row">
            <button class="btn" data-ans="0">Nee, toch niet</button>
            <button class="btn btn-warn" data-ans="1">${esc(okLabel)}</button>
          </div>
        </div>`;
      ov.hidden = false;
      $$("[data-ans]", ov).forEach(b => b.addEventListener("click", () => { ov.hidden = true; ov.innerHTML = ""; resolve(b.dataset.ans === "1"); }));
    });
  }

  /* ---------- Toast ---------- */

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.hidden = false;
    t.classList.remove("show"); void t.offsetWidth; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2800);
  }

  // Stemmen laden soms pas later in (Safari/Chrome)
  Voice.init().finally(() => go("home"));
})();
