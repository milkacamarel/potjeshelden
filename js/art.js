/*
 * art.js — eigen, originele SVG-tekeningen.
 * Elke functie krijgt een opties-object (vooral kleuren) en geeft een SVG-string terug.
 * Nieuwe tekening toevoegen? Maak een functie in ART en verwijs ernaar in config.js met art: "naam".
 */
(function () {
  const wheel = (cx, cy, r) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2b2b38"/><circle cx="${cx}" cy="${cy}" r="${r * 0.45}" fill="#d9dce6"/>`;

  const svg = (body, vb = "0 0 120 90") =>
    `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;

  const ART = {
    graafmachine: ({ c = "#ffb300", c2 = "#ff8f00" } = {}) => svg(`
      <rect x="10" y="66" width="62" height="16" rx="8" fill="#3a3a48"/>
      ${[20, 34, 48, 62].map(x => `<circle cx="${x}" cy="74" r="5" fill="#8a8fa3"/>`).join("")}
      <rect x="14" y="48" width="54" height="18" rx="5" fill="${c}"/>
      <rect x="20" y="26" width="26" height="24" rx="5" fill="${c2}"/>
      <rect x="25" y="30" width="16" height="12" rx="3" fill="#bfe9ff"/>
      <path d="M60 50 L80 18 L88 22 L70 54 Z" fill="${c}"/>
      <path d="M80 18 L104 36 L98 42 L78 28 Z" fill="${c2}"/>
      <path d="M96 38 L112 44 L108 62 Q98 64 92 54 Z" fill="#5b5f73"/>
      <circle cx="82" cy="22" r="4" fill="#3a3a48"/>`),

    bulldozer: ({ c = "#ffca28", c2 = "#f9a825" } = {}) => svg(`
      <rect x="18" y="64" width="64" height="18" rx="9" fill="#3a3a48"/>
      ${[28, 42, 56, 70].map(x => `<circle cx="${x}" cy="73" r="5" fill="#8a8fa3"/>`).join("")}
      <rect x="22" y="44" width="58" height="20" rx="5" fill="${c}"/>
      <rect x="30" y="22" width="30" height="24" rx="5" fill="${c2}"/>
      <rect x="35" y="26" width="20" height="13" rx="3" fill="#bfe9ff"/>
      <rect x="80" y="50" width="12" height="6" fill="#5b5f73"/>
      <path d="M92 36 Q104 56 92 84 L108 84 L108 36 Z" fill="#7d8296"/>
      <rect x="62" y="30" width="5" height="14" rx="2" fill="#3a3a48"/>`),

    hijskraan: ({ c = "#ffb300", c2 = "#e65100" } = {}) => svg(`
      <rect x="22" y="12" width="8" height="66" fill="${c}"/>
      ${[18, 30, 42, 54, 66].map(y => `<path d="M22 ${y} L30 ${y + 12} M30 ${y} L22 ${y + 12}" stroke="${c2}" stroke-width="2"/>`).join("")}
      <rect x="6" y="10" width="100" height="7" rx="2" fill="${c}"/>
      <rect x="4" y="17" width="14" height="10" fill="#5b5f73"/>
      <rect x="30" y="18" width="14" height="12" rx="2" fill="${c2}"/>
      <line x1="90" y1="17" x2="90" y2="52" stroke="#3a3a48" stroke-width="2"/>
      <path d="M86 52 h8 v4 q0 6 -6 6" fill="none" stroke="#3a3a48" stroke-width="3"/>
      <rect x="80" y="64" width="22" height="14" rx="2" fill="#ef5350"/>
      <rect x="12" y="78" width="30" height="6" rx="2" fill="#3a3a48"/>`),

    kiepwagen: ({ c = "#ff7043", c2 = "#ffb300" } = {}) => svg(`
      <path d="M8 30 L70 30 L64 60 L14 60 Z" fill="${c2}"/>
      <path d="M14 38 L66 38" stroke="#00000022" stroke-width="3"/>
      <rect x="70" y="34" width="34" height="26" rx="6" fill="${c}"/>
      <rect x="76" y="38" width="18" height="12" rx="3" fill="#bfe9ff"/>
      <rect x="8" y="58" width="100" height="10" rx="4" fill="#5b5f73"/>
      ${wheel(26, 72, 11)}${wheel(54, 72, 11)}${wheel(90, 72, 11)}`),

    raceauto: ({ c = "#e53935", c2 = "#ffffff", nr = "1" } = {}) => svg(`
      <path d="M6 58 Q8 44 26 42 L44 30 L74 30 L86 42 Q110 44 114 58 L114 64 L6 64 Z" fill="${c}"/>
      <path d="M48 34 L72 34 L80 42 L44 42 Z" fill="#bfe9ff"/>
      <rect x="6" y="40" width="10" height="4" fill="${c}"/>
      <rect x="2" y="34" width="16" height="6" rx="2" fill="#2b2b38"/>
      <circle cx="60" cy="52" r="8" fill="${c2}"/>
      <text x="60" y="56" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="11" fill="#2b2b38">${nr}</text>
      <path d="M20 50 h20 M80 50 h20" stroke="${c2}" stroke-width="3" stroke-linecap="round"/>
      ${wheel(30, 66, 11)}${wheel(92, 66, 11)}`),

    sportwagen: ({ c = "#7c4dff", c2 = "#00e5ff" } = {}) => svg(`
      <path d="M8 60 Q10 46 30 44 Q46 28 70 30 Q88 32 100 46 Q114 48 114 60 L114 64 L8 64 Z" fill="${c}"/>
      <path d="M44 42 Q54 34 68 34 Q80 36 88 46 L44 46 Z" fill="#bfe9ff"/>
      <path d="M12 54 L110 54" stroke="${c2}" stroke-width="4" stroke-linecap="round"/>
      <path d="M20 46 l10 -4 M24 50 l12 -4" stroke="${c2}" stroke-width="2"/>
      ${wheel(32, 66, 10)}${wheel(92, 66, 10)}`),

    brandweerauto: ({ c = "#e53935", c2 = "#ffd54f" } = {}) => svg(`
      <rect x="8" y="34" width="70" height="30" rx="4" fill="${c}"/>
      <path d="M78 34 L98 34 L112 50 L112 64 L78 64 Z" fill="${c}"/>
      <path d="M82 38 L96 38 L106 50 L82 50 Z" fill="#bfe9ff"/>
      <rect x="12" y="24" width="62" height="6" rx="2" fill="#cfd3de"/>
      ${[18, 28, 38, 48, 58, 68].map(x => `<rect x="${x}" y="22" width="3" height="10" fill="#9aa0b4"/>`).join("")}
      <rect x="86" y="26" width="12" height="7" rx="3" fill="#42a5f5"/>
      <rect x="8" y="50" width="70" height="4" fill="${c2}"/>
      ${[16, 32, 48, 64].map(x => `<rect x="${x}" y="38" width="10" height="8" rx="2" fill="#ffffff55"/>`).join("")}
      ${wheel(28, 66, 11)}${wheel(92, 66, 11)}`),

    reddingsauto: ({ c = "#ffffff", c2 = "#ff5252" } = {}) => svg(`
      <rect x="8" y="28" width="72" height="36" rx="6" fill="${c}" stroke="#d0d4e0" stroke-width="2"/>
      <path d="M80 36 L98 36 L112 50 L112 64 L80 64 Z" fill="${c}" stroke="#d0d4e0" stroke-width="2"/>
      <path d="M84 40 L96 40 L106 50 L84 50 Z" fill="#bfe9ff"/>
      <rect x="36" y="34" width="8" height="24" fill="${c2}"/><rect x="28" y="42" width="24" height="8" fill="${c2}"/>
      <rect x="8" y="54" width="104" height="4" fill="${c2}"/>
      <rect x="24" y="20" width="10" height="8" rx="3" fill="#42a5f5"/><rect x="54" y="20" width="10" height="8" rx="3" fill="#ff5252"/>
      ${wheel(28, 66, 11)}${wheel(92, 66, 11)}`),

    helikopter: ({ c = "#ff7043", c2 = "#ffffff" } = {}) => svg(`
      <rect x="20" y="14" width="80" height="4" rx="2" fill="#3a3a48"/>
      <rect x="58" y="18" width="4" height="10" fill="#3a3a48"/>
      <path d="M30 30 Q60 24 82 34 Q92 44 84 58 L40 58 Q26 52 30 30 Z" fill="${c}"/>
      <path d="M62 34 Q78 34 82 46 L62 46 Z" fill="#bfe9ff"/>
      <path d="M32 40 L6 36 L6 44 L32 48 Z" fill="${c}"/>
      <rect x="2" y="30" width="6" height="18" rx="3" fill="#3a3a48"/>
      <rect x="40" y="38" width="14" height="4" fill="${c2}"/><rect x="45" y="33" width="4" height="14" fill="${c2}"/>
      <path d="M40 58 L36 70 M78 58 L82 70 M28 70 L94 70" stroke="#3a3a48" stroke-width="4" stroke-linecap="round"/>`),

    puppyheld: ({ fur = "#c98b4f", hat = "#e53935", vest = "#1e88e5" } = {}) => svg(`
      <ellipse cx="60" cy="80" rx="30" ry="12" fill="${vest}"/>
      <path d="M36 82 Q34 60 60 58 Q86 60 84 82 Z" fill="${vest}"/>
      <circle cx="60" cy="68" r="5" fill="#ffd54f"/>
      <ellipse cx="30" cy="40" rx="10" ry="18" fill="${fur}" transform="rotate(-20 30 40)" opacity=".85"/>
      <ellipse cx="90" cy="40" rx="10" ry="18" fill="${fur}" transform="rotate(20 90 40)" opacity=".85"/>
      <circle cx="60" cy="42" r="24" fill="${fur}"/>
      <ellipse cx="60" cy="52" rx="13" ry="10" fill="#f6e3cc"/>
      <circle cx="51" cy="38" r="4" fill="#2b2b38"/><circle cx="69" cy="38" r="4" fill="#2b2b38"/>
      <circle cx="52" cy="37" r="1.4" fill="#fff"/><circle cx="70" cy="37" r="1.4" fill="#fff"/>
      <ellipse cx="60" cy="48" rx="5" ry="3.5" fill="#2b2b38"/>
      <path d="M54 54 Q60 60 66 54" stroke="#2b2b38" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M38 24 Q60 2 82 24 L82 26 L38 26 Z" fill="${hat}"/>
      <rect x="34" y="24" width="52" height="6" rx="3" fill="${hat}"/>
      <path d="M60 10 l3 6 h6 l-5 4 2 6 -6 -4 -6 4 2 -6 -5 -4 h6 z" fill="#ffd54f"/>`, "0 0 120 95"),

    coureur: ({ helmet = "#e53935", visor = "#263238", stripe = "#ffffff" } = {}) => svg(`
      <path d="M30 92 Q30 66 60 64 Q90 66 90 92 Z" fill="${helmet}"/>
      <circle cx="60" cy="40" r="28" fill="${helmet}"/>
      <path d="M60 12 L60 68" stroke="${stripe}" stroke-width="6"/>
      <path d="M36 38 Q60 30 84 38 L84 50 Q60 58 36 50 Z" fill="#f6d2b5"/>
      <circle cx="50" cy="44" r="3.5" fill="#2b2b38"/><circle cx="70" cy="44" r="3.5" fill="#2b2b38"/>
      <path d="M54 50 Q60 55 66 50" stroke="#2b2b38" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M34 34 Q60 22 86 34 L86 38 Q60 28 34 38 Z" fill="${visor}" opacity=".85"/>`, "0 0 120 95"),

    bouwer: ({ helmet = "#ffca28", vest = "#ff7043" } = {}) => svg(`
      <path d="M30 92 Q30 64 60 62 Q90 64 90 92 Z" fill="${vest}"/>
      <path d="M44 66 L44 92 M76 66 L76 92" stroke="#e0f2f1" stroke-width="5"/>
      <circle cx="60" cy="44" r="20" fill="#f6d2b5"/>
      <circle cx="53" cy="44" r="3" fill="#2b2b38"/><circle cx="67" cy="44" r="3" fill="#2b2b38"/>
      <path d="M53 52 Q60 58 67 52" stroke="#2b2b38" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M36 36 Q38 14 60 14 Q82 14 84 36 Z" fill="${helmet}"/>
      <rect x="30" y="33" width="60" height="6" rx="3" fill="${helmet}"/>
      <rect x="57" y="12" width="6" height="22" rx="3" fill="#00000018"/>`, "0 0 120 95"),

    raket: ({ c = "#eceff1", c2 = "#e53935", win = "#4fc3f7" } = {}) => svg(`
      <path d="M60 4 Q82 24 80 60 L40 60 Q38 24 60 4 Z" fill="${c}" stroke="#cfd8dc" stroke-width="2"/>
      <path d="M60 4 Q72 14 76 28 L44 28 Q48 14 60 4 Z" fill="${c2}"/>
      <circle cx="60" cy="40" r="9" fill="${win}" stroke="#90a4ae" stroke-width="3"/>
      <path d="M40 46 L24 66 L40 62 Z M80 46 L96 66 L80 62 Z" fill="${c2}"/>
      <rect x="46" y="60" width="28" height="6" rx="2" fill="#90a4ae"/>
      <path d="M48 66 Q60 92 72 66 Z" fill="#ffb300"/><path d="M53 66 Q60 82 67 66 Z" fill="#fff176"/>`, "0 0 120 95"),

    maanwagen: ({ c = "#b0bec5", c2 = "#7c4dff" } = {}) => svg(`
      <rect x="18" y="42" width="84" height="16" rx="6" fill="${c}"/>
      <path d="M34 42 L44 24 L76 24 L86 42 Z" fill="${c2}"/>
      <path d="M48 28 L72 28 L78 40 L42 40 Z" fill="#bfe9ff"/>
      <line x1="88" y1="42" x2="96" y2="14" stroke="#607d8b" stroke-width="3"/><circle cx="96" cy="12" r="6" fill="#ffeb3b"/>
      ${wheel(30, 66, 12)}${wheel(60, 66, 12)}${wheel(90, 66, 12)}`),

    betonmolen: ({ c = "#ff7043", c2 = "#eceff1" } = {}) => svg(`
      <rect x="76" y="30" width="32" height="30" rx="6" fill="${c}"/>
      <rect x="82" y="35" width="18" height="12" rx="3" fill="#bfe9ff"/>
      <ellipse cx="44" cy="40" rx="34" ry="18" fill="${c2}" transform="rotate(-12 44 40)"/>
      <path d="M18 34 L70 22 M22 44 L74 32 M26 54 L76 42" stroke="${c}" stroke-width="4" opacity=".8"/>
      <rect x="6" y="58" width="104" height="8" rx="3" fill="#5b5f73"/>
      ${wheel(24, 70, 11)}${wheel(48, 70, 11)}${wheel(92, 70, 11)}`),

    reddingsboot: ({ c = "#ff6d00", c2 = "#ffffff" } = {}) => svg(`
      <path d="M0 70 Q15 64 30 70 T60 70 T90 70 T120 70 L120 90 L0 90 Z" fill="#4fc3f7"/>
      <path d="M10 56 L110 56 L98 74 L22 74 Z" fill="${c}"/>
      <rect x="10" y="60" width="100" height="4" fill="${c2}"/>
      <rect x="40" y="32" width="40" height="24" rx="4" fill="${c2}"/>
      <rect x="46" y="37" width="12" height="10" rx="2" fill="#bfe9ff"/><rect x="62" y="37" width="12" height="10" rx="2" fill="#bfe9ff"/>
      <rect x="56" y="22" width="8" height="10" rx="2" fill="#42a5f5"/>
      <circle cx="26" cy="50" r="7" fill="none" stroke="${c2}" stroke-width="4"/><circle cx="26" cy="50" r="7" fill="none" stroke="${c}" stroke-width="4" stroke-dasharray="5 6"/>`),

    monstertruck: ({ c = "#00c853", c2 = "#ffea00" } = {}) => svg(`
      <path d="M18 40 L34 24 L74 24 L90 40 L106 42 L106 54 L14 54 L14 42 Z" fill="${c}"/>
      <path d="M40 28 L70 28 L80 40 L34 40 Z" fill="#bfe9ff"/>
      <path d="M18 48 L104 48" stroke="${c2}" stroke-width="4"/>
      <rect x="40" y="54" width="40" height="6" fill="#5b5f73"/>
      ${wheel(30, 66, 18)}${wheel(90, 66, 18)}`, "0 0 120 90"),

    /* ---- Dinowereld: vriendelijke, eigen dino's (geen tanden, altijd een glimlach) ---- */
    langnek: ({ c = "#81c784", c2 = "#388e3c" } = {}) => svg(`
      <path d="M36 56 Q16 58 4 70 Q20 68 38 64 Z" fill="${c}"/>
      <path d="M74 52 Q86 30 90 16 L102 18 Q96 38 86 58 Z" fill="${c}"/>
      <ellipse cx="102" cy="15" rx="12" ry="8" fill="${c}"/>
      <circle cx="105" cy="12" r="2.4" fill="#2b2b38"/><path d="M104 18 Q109 20 112 16" stroke="#2b2b38" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <rect x="40" y="62" width="10" height="20" rx="4" fill="${c2}"/><rect x="70" y="62" width="10" height="20" rx="4" fill="${c2}"/>
      <ellipse cx="60" cy="56" rx="30" ry="18" fill="${c}"/>
      <rect x="50" y="64" width="10" height="18" rx="4" fill="${c}"/><rect x="78" y="62" width="10" height="20" rx="4" fill="${c}"/>
      <circle cx="52" cy="48" r="4" fill="${c2}" opacity=".6"/><circle cx="64" cy="44" r="3" fill="${c2}" opacity=".6"/><circle cx="70" cy="54" r="3.5" fill="${c2}" opacity=".6"/>`),

    tyranno: ({ c = "#ff8a65", c2 = "#e64a19" } = {}) => svg(`
      <path d="M40 50 Q14 56 2 74 Q22 70 44 62 Z" fill="${c}"/>
      <rect x="44" y="62" width="11" height="22" rx="4" fill="${c2}"/>
      <ellipse cx="58" cy="54" rx="22" ry="16" fill="${c}"/>
      <rect x="58" y="62" width="11" height="22" rx="4" fill="${c}"/>
      <path d="M66 42 Q70 18 92 14 Q114 12 114 30 Q114 42 96 42 Q80 44 74 50 Z" fill="${c}"/>
      <circle cx="96" cy="23" r="3" fill="#2b2b38"/><circle cx="97" cy="22" r="1" fill="#fff"/>
      <path d="M92 34 Q102 38 110 33" stroke="#2b2b38" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="106" cy="30" r="3" fill="#ffab91" opacity=".8"/>
      <path d="M74 54 Q82 56 82 62" stroke="${c2}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M46 44 L50 36 L54 42 L58 34 L62 41" fill="${c2}"/>`),

    driehoorn: ({ c = "#4fc3f7", c2 = "#0277bd" } = {}) => svg(`
      <path d="M28 54 Q12 56 4 66 Q18 66 30 62 Z" fill="${c}"/>
      <rect x="34" y="62" width="11" height="20" rx="4" fill="${c2}"/><rect x="64" y="62" width="11" height="20" rx="4" fill="${c2}"/>
      <ellipse cx="52" cy="54" rx="26" ry="17" fill="${c}"/>
      <rect x="44" y="64" width="11" height="18" rx="4" fill="${c}"/><rect x="72" y="62" width="11" height="20" rx="4" fill="${c}"/>
      <circle cx="80" cy="42" r="20" fill="${c2}"/>
      <ellipse cx="92" cy="52" rx="17" ry="13" fill="${c}"/>
      <path d="M86 40 L82 20 L92 38 Z M98 40 L102 20 L104 40 Z" fill="#fff8e1"/>
      <path d="M106 50 L118 44 L108 56 Z" fill="#fff8e1"/>
      <circle cx="94" cy="48" r="2.6" fill="#2b2b38"/>
      <path d="M96 58 Q102 60 106 56" stroke="#2b2b38" stroke-width="1.6" fill="none" stroke-linecap="round"/>`),

    stekeldino: ({ c = "#ba68c8", c2 = "#ffb300" } = {}) => svg(`
      <path d="M32 40 L38 22 L46 36 L52 16 L60 34 L68 18 L74 36 L82 26 L84 44 Z" fill="${c2}"/>
      <path d="M30 56 Q10 54 2 44 Q8 62 30 64 Z" fill="${c}"/>
      <path d="M6 48 L2 38 L10 46 Z M12 52 L10 42 L16 50 Z" fill="${c2}"/>
      <rect x="36" y="62" width="10" height="20" rx="4" fill="${c}" opacity=".85"/><rect x="70" y="62" width="10" height="20" rx="4" fill="${c}" opacity=".85"/>
      <path d="M28 60 Q34 34 60 34 Q86 34 92 60 Z" fill="${c}"/>
      <rect x="46" y="62" width="10" height="20" rx="4" fill="${c}"/><rect x="78" y="60" width="10" height="22" rx="4" fill="${c}"/>
      <ellipse cx="102" cy="58" rx="13" ry="9" fill="${c}"/>
      <circle cx="105" cy="55" r="2.4" fill="#2b2b38"/><path d="M104 62 Q109 64 113 60" stroke="#2b2b38" stroke-width="1.6" fill="none" stroke-linecap="round"/>`),

    dino_ei: ({ c = "#fff3e0", c2 = "#8bc34a" } = {}) => svg(`
      <ellipse cx="60" cy="84" rx="30" ry="5" fill="#00000018"/>
      <path d="M60 6 Q90 8 90 50 Q90 84 60 84 Q30 84 30 50 Q30 8 60 6 Z" fill="${c}" stroke="#e0c9a6" stroke-width="2"/>
      <circle cx="48" cy="34" r="6" fill="${c2}"/><circle cx="70" cy="26" r="4" fill="${c2}"/><circle cx="74" cy="56" r="7" fill="${c2}"/><circle cx="46" cy="64" r="4.5" fill="${c2}"/>
      <path d="M36 46 L44 40 L50 48 L58 40 L64 48 L72 40 L78 48 L84 44" stroke="#a1887f" stroke-width="2.5" fill="none" stroke-linejoin="round"/>`, "0 0 120 92"),

    dinotrofee: ({ c = "#ffc107", c2 = "#ff8f00", dino = "#66bb6a" } = {}) => svg(`
      <path d="M38 14 L82 14 L78 46 Q74 60 60 60 Q46 60 42 46 Z" fill="${c}"/>
      <path d="M40 18 Q24 18 26 32 Q28 42 42 42" stroke="${c2}" stroke-width="5" fill="none"/>
      <path d="M80 18 Q96 18 94 32 Q92 42 78 42" stroke="${c2}" stroke-width="5" fill="none"/>
      <path d="M46 18 L50 46" stroke="#ffffff" stroke-width="4" opacity=".45" stroke-linecap="round"/>
      <rect x="54" y="58" width="12" height="12" fill="${c2}"/>
      <rect x="40" y="70" width="40" height="14" rx="3" fill="${c2}"/>
      <rect x="46" y="74" width="28" height="6" rx="2" fill="${c}"/>
      <ellipse cx="62" cy="34" rx="9" ry="6" fill="${dino}"/><path d="M68 32 Q74 22 78 22 L80 26 Q76 28 72 36 Z" fill="${dino}"/>
      <path d="M54 34 Q48 36 46 40 Q52 39 56 37 Z" fill="${dino}"/>
      <rect x="57" y="38" width="3" height="6" rx="1" fill="${dino}"/><rect x="64" y="38" width="3" height="6" rx="1" fill="${dino}"/>
      <circle cx="78.5" cy="23.5" r="1" fill="#2b2b38"/>`, "0 0 120 90"),

    potje: ({ c = "#4fc3f7" } = {}) => svg(`
      <ellipse cx="60" cy="40" rx="40" ry="12" fill="${c}"/>
      <ellipse cx="60" cy="40" rx="28" ry="7" fill="#e1f5fe"/>
      <path d="M20 40 Q22 76 60 78 Q98 76 100 40" fill="${c}"/>
      <path d="M96 46 Q114 46 108 60" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle cx="44" cy="58" r="4" fill="#fff" opacity=".6"/>`),
  };

  /** Tekent een item uit config: SVG als er art is, anders een grote emoji. */
  function renderArt(item) {
    if (item.art && ART[item.art]) return ART[item.art](item.opts || {});
    return `<span class="emoji-art" aria-hidden="true">${item.emoji || "⭐"}</span>`;
  }

  window.ART = ART;
  window.renderArt = renderArt;
})();
