/*
 * film.js — het Potjesfilmpje: korte, rustige tekenfilmpjes om naar te kijken terwijl je op het potje zit.
 * Vier scènes die na elkaar afspelen (en daarna opnieuw): bouwplaats, redding, race en ruimte.
 * Alles is eigen tekenwerk (art.js) en werkt offline.
 *
 * Nieuwe scène toevoegen: maak een functie in SCENES die { svg, update(t) } teruggeeft.
 * t loopt van 0 tot SCENE_SEC seconden.
 */
(function () {
  const SCENE_SEC = 18;
  const W = 400, H = 260;

  // Een tekening uit art.js op een plek in de scène zetten. De <g> eromheen kan bewegen.
  const put = (id, art, opts, x, y, w, h) =>
    `<g id="${id}"><g transform="translate(${x} ${y})">${ART[art](opts || {}).replace("<svg ", `<svg width="${w}" height="${h}" `)}</g></g>`;
  const emoji = (id, e, x, y, size) => `<text id="${id}" x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central">${e}</text>`;

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * clamp(k);
  const ease = k => { k = clamp(k); return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; };
  const phase = (t, from, to) => ease((t - from) / (to - from));

  const SCENES = [
    // 1. Bouwplaats: de graafmachine vult de kiepwagen, die daarna wegrijdt
    function bouw(tone) {
      const svg = `
        <defs><linearGradient id="fb-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe9ff"/><stop offset="1" stop-color="#fff8e1"/></linearGradient></defs>
        <rect width="${W}" height="${H}" fill="url(#fb-sky)"/>
        <circle cx="340" cy="46" r="26" fill="#ffd54f"/>
        <rect y="214" width="${W}" height="46" fill="#a1887f"/><rect y="210" width="${W}" height="8" fill="#81c784"/>
        <path d="M0 214 Q60 196 120 214 Z" fill="#8d6e63"/>
        ${put("fb-dig", "graafmachine", {}, 6, 116, 140, 105)}
        <g id="fb-truck"><g transform="translate(0 112)">
          <ellipse id="fb-pile" cx="58" cy="44" rx="36" ry="0" fill="#795548"/>
          ${ART.kiepwagen({}).replace("<svg ", `<svg width="160" height="120" `)}
        </g></g>
        <circle id="fb-load" r="9" fill="#795548" opacity="0"/>
        ${emoji("fb-honk", "📢", 330, 120, 30)}`;
      let lastLoad = -1, honked = false;
      return {
        svg,
        update(t, root) {
          const truckX = t < 13 ? lerp(420, 210, phase(t, 0, 3)) : lerp(210, 440, phase(t, 13, 17));
          root.querySelector("#fb-truck").setAttribute("transform", `translate(${truckX} 0)`);
          const loads = Math.floor(clamp((t - 3.5) / 1.8, 0, 5));
          root.querySelector("#fb-pile").setAttribute("ry", Math.min(loads, 5) * 5);
          // Een schep zand vliegt in een boog van de graafbak naar de laadbak
          const k = ((t - 3.5) % 1.8) / 1.8;
          const load = root.querySelector("#fb-load");
          if (t > 3.5 && t < 12.5) {
            const x = lerp(140, truckX + 58, k), y = 168 - Math.sin(k * Math.PI) * 70;
            load.setAttribute("cx", x); load.setAttribute("cy", y); load.setAttribute("opacity", k < 0.95 ? 1 : 0);
            const n = Math.floor((t - 3.5) / 1.8);
            if (n !== lastLoad) { lastLoad = n; tone([330, 262], 0.1); }
          } else load.setAttribute("opacity", 0);
          const dig = Math.sin(t * 3.5) * (t > 3.5 && t < 12.5 ? 4 : 0);
          root.querySelector("#fb-dig").setAttribute("transform", `rotate(${dig} 70 210)`);
          root.querySelector("#fb-honk").setAttribute("opacity", t > 12.3 && t < 13.6 ? 1 : 0);
          if (t > 12.3 && !honked) { honked = true; tone([392, 0, 392], 0.14); }
          if (t < 1) { honked = false; lastLoad = -1; }
        },
      };
    },

    // 2. Redding: de brandweerwagen komt, de ladder gaat omhoog en een puppyheld redt het poesje
    function redding(tone) {
      const base = { x: 214, y: 150 }, cat = { x: 318, y: 78 };
      const L = Math.hypot(cat.x - base.x, base.y - cat.y), ang = Math.atan2(base.y - cat.y, cat.x - base.x) * 180 / Math.PI;
      const svg = `
        <rect width="${W}" height="${H}" fill="#e3f2fd"/>
        <circle cx="60" cy="40" r="18" fill="#fff" opacity=".9"/><circle cx="80" cy="40" r="22" fill="#fff" opacity=".9"/>
        <rect y="214" width="${W}" height="46" fill="#b0bec5"/><rect y="210" width="${W}" height="8" fill="#81c784"/>
        <rect x="330" y="96" width="22" height="118" rx="6" fill="#8d6e63"/>
        <circle cx="340" cy="80" r="44" fill="#66bb6a"/><circle cx="306" cy="98" r="28" fill="#81c784"/><circle cx="372" cy="104" r="30" fill="#4caf50"/>
        <rect x="270" y="86" width="70" height="7" rx="3" fill="#8d6e63"/>
        <g id="fr-truck">
          <g id="fr-ladder" transform="translate(${base.x} ${base.y}) rotate(0)">
            <rect x="0" y="-5" width="${L}" height="10" rx="3" fill="#cfd3de" stroke="#9aa0b4" stroke-width="2"/>
            ${Array.from({ length: 8 }, (_, i) => `<rect x="${8 + i * (L - 16) / 7}" y="-5" width="3" height="10" fill="#9aa0b4"/>`).join("")}
          </g>
          <g transform="translate(110 110)">${ART.brandweerauto({}).replace("<svg ", `<svg width="150" height="112" `)}</g>
        </g>
        ${emoji("fr-cat", "🐱", cat.x, cat.y - 6, 30)}
        <g id="fr-pup">${ART.puppyheld({}).replace("<svg ", `<svg x="-24" y="-46" width="48" height="38" `)}</g>
        ${emoji("fr-heart", "💖", 300, 60, 30)}`;
      let cheered = false;
      return {
        svg,
        update(t, root) {
          const tx = t < 15 ? lerp(-280, 0, phase(t, 0, 3)) : lerp(0, 420, phase(t, 15.5, 18));
          root.querySelector("#fr-truck").setAttribute("transform", `translate(${tx} 0)`);
          const up = t < 13 ? phase(t, 3, 5.5) : 1 - phase(t, 13, 15);
          root.querySelector("#fr-ladder").setAttribute("transform", `translate(${base.x} ${base.y}) rotate(${-ang * up})`);
          // Puppy klimt omhoog (6-9 s) en met het poesje weer naar beneden (10-13 s)
          const s = t < 9.5 ? phase(t, 6, 9) : 1 - phase(t, 10, 13);
          const a = ang * Math.PI / 180;
          const px = base.x + tx + Math.cos(a) * L * s, py = base.y - Math.sin(a) * L * s;
          const pup = root.querySelector("#fr-pup");
          pup.setAttribute("transform", `translate(${px} ${py})`);
          pup.setAttribute("opacity", t > 5.8 && t < 13.2 ? 1 : 0);
          const catEl = root.querySelector("#fr-cat");
          if (t < 9.5) { catEl.setAttribute("x", cat.x); catEl.setAttribute("y", cat.y - 6 + Math.sin(t * 6) * 2); catEl.setAttribute("opacity", 1); }
          else if (t < 13.2) { catEl.setAttribute("x", px + 18); catEl.setAttribute("y", py - 30); }
          else { catEl.setAttribute("x", lerp(base.x + 10, 250, phase(t, 13.2, 14))); catEl.setAttribute("y", 196); }
          const heart = root.querySelector("#fr-heart");
          const hk = phase(t, 13.2, 15.5);
          heart.setAttribute("opacity", t > 13.2 && t < 15.5 ? 1 - hk * 0.7 : 0);
          heart.setAttribute("y", 170 - hk * 90); heart.setAttribute("x", 250);
          if (t > 13.2 && !cheered) { cheered = true; tone([523, 659, 784], 0.12); }
          if (t < 1) cheered = false;
        },
      };
    },

    // 3. Race: drie raceauto's halen elkaar in, met een finishvlag aan het eind
    function race(tone) {
      const cars = [
        { id: "fa-c1", art: "raceauto", opts: { c: "#e53935", nr: "1" }, lane: 128, sp: 1.0, ph: 0 },
        { id: "fa-c2", art: "raceauto", opts: { c: "#1e88e5", c2: "#ffeb3b", nr: "7" }, lane: 160, sp: 1.3, ph: 2 },
        { id: "fa-c3", art: "sportwagen", opts: {}, lane: 192, sp: 0.8, ph: 4 },
      ];
      const svg = `
        <rect width="${W}" height="${H}" fill="#e8f5e9"/>
        <g id="fa-trees">${Array.from({ length: 10 }, (_, i) => `<g transform="translate(${i * 60} 0)"><rect x="18" y="74" width="8" height="30" fill="#8d6e63"/><circle cx="22" cy="70" r="18" fill="#66bb6a"/></g>`).join("")}</g>
        <rect y="104" width="${W}" height="130" fill="#585d70"/>
        <rect y="104" width="${W}" height="6" fill="#ffffff"/><rect y="228" width="${W}" height="6" fill="#ffffff"/>
        <g id="fa-dash">${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 50}" y="${150}" width="26" height="4" fill="#fff"/><rect x="${i * 50 + 25}" y="${182}" width="26" height="4" fill="#fff"/>`).join("")}</g>
        <g id="fa-finish" opacity="0">${Array.from({ length: 13 }, (_, r) => Array.from({ length: 2 }, (_, c) => `<rect x="${c * 10}" y="${104 + r * 10}" width="10" height="10" fill="${(r + c) % 2 ? "#fff" : "#212121"}"/>`).join("")).join("")}</g>
        ${cars.map(c => put(c.id, c.art, c.opts, 0, 0, 100, 75)).join("")}
        ${emoji("fa-flag", "🏁", 200, 56, 48)}`;
      let flagged = false;
      return {
        svg,
        update(t, root) {
          root.querySelector("#fa-dash").setAttribute("transform", `translate(${-(t * 220) % 50} 0)`);
          root.querySelector("#fa-trees").setAttribute("transform", `translate(${-(t * 60) % 60} 0)`);
          cars.forEach(c => {
            const x = 140 + Math.sin(t * 0.7 * c.sp + c.ph) * 110;
            const bump = Math.sin(t * 20 + c.ph) * 1.2;
            root.querySelector("#" + c.id).setAttribute("transform", `translate(${x} ${c.lane - 58 + bump})`);
          });
          const fx = lerp(420, 300, phase(t, 13, 15));
          root.querySelector("#fa-finish").setAttribute("transform", `translate(${fx} 0)`);
          root.querySelector("#fa-finish").setAttribute("opacity", t > 13 ? 1 : 0);
          const flag = root.querySelector("#fa-flag");
          flag.setAttribute("opacity", t > 14.5 ? 1 : 0);
          flag.setAttribute("transform", `rotate(${Math.sin(t * 8) * 10} 200 56)`);
          if (t > 14.5 && !flagged) { flagged = true; tone([523, 659, 784, 1047], 0.12); }
          if (t < 1) flagged = false;
        },
      };
    },

    // 4. Ruimte: aftellen, de raket stijgt op en landt op de maan
    function ruimte(tone) {
      const stars = Array.from({ length: 26 }, (_, i) => ({ x: (i * 97) % W, y: (i * 53) % 200, r: 1 + (i % 3) }));
      const svg = `
        <rect width="${W}" height="${H}" fill="#311b92"/>
        <rect width="${W}" height="${H}" fill="#4527a0" opacity=".6"/>
        ${stars.map((s, i) => `<circle class="fs-star" data-i="${i}" cx="${s.x}" cy="${s.y}" r="${s.r}" fill="#fff59d"/>`).join("")}
        <g id="fs-moon"><circle cx="330" cy="66" r="40" fill="#fff9c4"/><circle cx="316" cy="56" r="7" fill="#f0e68c"/><circle cx="342" cy="80" r="9" fill="#f0e68c"/>
          <circle id="fs-eye1" cx="320" cy="64" r="3" fill="#5d4037"/><circle id="fs-eye2" cx="340" cy="64" r="3" fill="#5d4037"/>
          <path id="fs-smile" d="M318 76 Q330 86 342 76" stroke="#5d4037" stroke-width="3" fill="none" stroke-linecap="round"/></g>
        <rect y="226" width="${W}" height="34" fill="#7e57c2"/>
        <rect x="160" y="216" width="80" height="12" rx="3" fill="#9e9e9e"/>
        <g id="fs-smoke">${Array.from({ length: 5 }, (_, i) => `<circle cx="${170 + i * 15}" cy="222" r="10" fill="#eceff1"/>`).join("")}</g>
        <g id="fs-rocket"><g id="fs-rocket-in">${ART.raket({}).replace("<svg ", `<svg x="-45" y="-71" width="90" height="71" `)}</g></g>
        <text id="fs-count" x="200" y="110" font-size="72" font-weight="800" text-anchor="middle" fill="#fff59d" font-family="Baloo 2, sans-serif"></text>`;
      let lastCount = null, landed = false;
      return {
        svg,
        update(t, root) {
          const n = t < 1 ? "" : t < 2 ? "3" : t < 3 ? "2" : t < 4 ? "1" : t < 5 ? "🚀" : "";
          const cnt = root.querySelector("#fs-count");
          if (cnt.textContent !== n) { cnt.textContent = n; if (n) tone(n === "🚀" ? [523, 784] : [440], 0.12); }
          // Opstijgen (4-9 s), daarna klein naar de maan vliegen en landen (9-15 s)
          let x = 200, y = 218, sc = 1, rot = 0;
          if (t >= 4 && t < 9) { y = 218 - Math.pow(phase(t, 4, 9), 1.6) * 330; }
          else if (t >= 9) { const k = phase(t, 9, 14.5); x = lerp(40, 330, k); y = lerp(250, 30, k) + Math.sin(k * Math.PI) * -20; sc = 0.45; rot = lerp(60, 0, phase(t, 13, 14.5)); }
          if (t >= 4 && t < 9) x = 200 + Math.sin(t * 30) * 1.5;
          root.querySelector("#fs-rocket").setAttribute("transform", `translate(${x} ${y}) rotate(${rot}) scale(${sc})`);
          const sm = phase(t, 4, 7);
          root.querySelector("#fs-smoke").setAttribute("opacity", t > 4 && t < 8 ? 1 - sm : 0);
          root.querySelector("#fs-smoke").setAttribute("transform", `translate(200 222) scale(${1 + sm * 1.6}) translate(-200 -222)`);
          root.querySelectorAll(".fs-star").forEach(s => s.setAttribute("opacity", 0.5 + 0.5 * Math.sin(t * 2 + Number(s.dataset.i))));
          if (t > 14.5 && !landed) { landed = true; tone([659, 784, 1047, 1319], 0.12); }
          root.querySelector("#fs-smile").setAttribute("d", t > 14.5 ? "M316 74 Q330 92 344 74" : "M318 76 Q330 86 342 76");
          if (t < 1) { landed = false; lastCount = null; }
        },
      };
    },
  ];

  let raf = null, startAt = 0, sceneIdx = 0, scene = null, onClose = null, soundOn = true;

  function tone(notes, dur = 0.12) {
    if (!soundOn) return;
    try {
      const ctx = Voice.audioCtx();
      notes.forEach((f, i) => {
        if (!f) return;
        const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * dur;
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.5);
        o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur * 1.7);
      });
    } catch (e) { /* geen geluid */ }
  }

  function loadScene(i) {
    const ov = document.getElementById("overlay-film");
    sceneIdx = (i + SCENES.length) % SCENES.length;
    scene = SCENES[sceneIdx](tone);
    ov.querySelector(".film-stage").innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tekenfilmpje">${scene.svg}</svg>`;
    ov.querySelectorAll(".film-dot").forEach((d, j) => d.classList.toggle("on", j === sceneIdx));
    startAt = performance.now();
  }

  function frame(now) {
    const t = (now - startAt) / 1000;
    if (t >= SCENE_SEC) loadScene(sceneIdx + 1);
    else scene.update(t, document.querySelector("#overlay-film .film-stage svg"));
    raf = requestAnimationFrame(frame);
  }

  const Film = {
    /** Start het filmpje. opts: { sound, onClose } */
    open(opts = {}) {
      soundOn = opts.sound !== false; onClose = opts.onClose || null;
      const ov = document.getElementById("overlay-film");
      ov.innerHTML = `
        <div class="film-card">
          <div class="film-stage"></div>
          <div class="film-dots">${SCENES.map((_, i) => `<button class="film-dot" data-scene="${i}" aria-label="Filmpje ${i + 1}">${["🚜", "🚒", "🏎️", "🚀"][i]}</button>`).join("")}</div>
          <button class="btn btn-mega film-done">👍 Klaar!</button>
        </div>`;
      ov.hidden = false;
      ov.querySelectorAll(".film-dot").forEach(b => b.addEventListener("click", () => loadScene(Number(b.dataset.scene))));
      ov.querySelector(".film-done").addEventListener("click", Film.close);
      loadScene(Math.floor(Math.random() * SCENES.length));
      cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    },

    close() {
      cancelAnimationFrame(raf); raf = null;
      const ov = document.getElementById("overlay-film");
      ov.hidden = true; ov.innerHTML = "";
      if (onClose) { const cb = onClose; onClose = null; cb(); }
    },

    get open_() { return raf !== null; },
  };

  // Op de achtergrond: niet doorrekenen (scheelt batterij), bij terugkomst verder bij dezelfde scène
  document.addEventListener("visibilitychange", () => {
    if (raf === null) return;
    if (document.visibilityState === "visible") startAt = performance.now();
  });

  window.Film = Film;
})();
