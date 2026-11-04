/*
 * config.js — alles wat je makkelijk wilt aanpassen staat hier.
 *
 * ACTIONS : de stappen die sterren opleveren (punten, emoji, tekst).
 * WORLDS  : de werelden met unlockbare items.
 *           "cost" = het totaal aantal verdiende sterren waarbij het item vrijkomt.
 *           Sterren worden nooit uitgegeven of afgepakt: items blijven altijd vrij.
 * PRAISE  : vrolijke complimenten die willekeurig getoond en voorgelezen worden.
 */
window.APP_CONFIG = {
  currency: { name: "sterren", single: "ster", icon: "⭐" },

  ACTIONS: [
    { id: "zitten",     label: "Gaan zitten",   kid: "Zitten",        emoji: "🚽", points: 1, color: "#4fc3f7" },
    { id: "geprobeerd", label: "Rustig geprobeerd", kid: "Geprobeerd", emoji: "💪", points: 2, color: "#9575cd" },
    { id: "aangegeven", label: "Zelf aangegeven", kid: "Ik moet!",    emoji: "🙋", points: 3, color: "#ffb74d" },
    { id: "plas",       label: "Plasje op potje/toilet", kid: "Plasje", emoji: "💧", points: 4, color: "#4dd0e1" },
    { id: "poep",       label: "Poepje op potje/toilet", kid: "Poepje", emoji: "💩", points: 5, color: "#a1887f" },
    { id: "handen",     label: "Handen gewassen (bonus)", kid: "Handen", emoji: "🧼", points: 1, color: "#81c784" },
  ],

  // Per item: id (uniek), name, type, cost, en art (zie art.js) + opts, óf emoji.
  // type: voertuig | held | accessoire | sticker | decor
  WORLDS: [
    {
      id: "redding", name: "Reddingswereld", short: "Redding", emoji: "🚒",
      color: "#e53935", bg: "linear-gradient(160deg,#ffebee,#e3f2fd)",
      items: [
        { id: "r-puppy-rood",   name: "Puppy Vonk",        type: "held",       cost: 3,   art: "puppyheld", opts: { fur: "#c98b4f", hat: "#e53935", vest: "#e53935" } },
        { id: "r-brandweer",    name: "Brandweerwagen",    type: "voertuig",   cost: 8,   art: "brandweerauto" },
        { id: "r-sticker-bot",  name: "Botje-sticker",     type: "sticker",    cost: 12,  emoji: "🦴" },
        { id: "r-reddingsauto", name: "Reddingsauto",      type: "voertuig",   cost: 20,  art: "reddingsauto" },
        { id: "r-puppy-blauw",  name: "Puppy Blauwtje",    type: "held",       cost: 30,  art: "puppyheld", opts: { fur: "#8d6e63", hat: "#1e88e5", vest: "#1565c0" } },
        { id: "r-medaille",     name: "Heldenmedaille",    type: "accessoire", cost: 40,  emoji: "🎖️" },
        { id: "r-helikopter",   name: "Reddingshelikopter",type: "voertuig",   cost: 55,  art: "helikopter" },
        { id: "r-kazerne",      name: "Kazerne",           type: "decor",      cost: 70,  emoji: "🏠" },
        { id: "r-puppy-groen",  name: "Puppy Blad",        type: "held",       cost: 90,  art: "puppyheld", opts: { fur: "#e0c097", hat: "#43a047", vest: "#2e7d32" } },
        { id: "r-sticker-hart", name: "Hartjes-sticker",   type: "sticker",    cost: 110, emoji: "💖" },
        { id: "r-ladderwagen",  name: "Grote ladderwagen", type: "voertuig",   cost: 140, art: "brandweerauto", opts: { c: "#c62828", c2: "#ffffff" } },
        // Nieuwe prijzen (november 2026): de reis gaat verder!
        { id: "r-puppy-paars",  name: "Puppy Pluis",       type: "held",       cost: 175, art: "puppyheld", opts: { fur: "#f5d6a8", hat: "#8e24aa", vest: "#6a1b9a" } },
        { id: "r-boot",         name: "Reddingsboot",      type: "voertuig",   cost: 205, art: "reddingsboot" },
        { id: "r-sticker-ster", name: "Heldenster-sticker",type: "sticker",    cost: 240, emoji: "🌟" },
        { id: "r-gele-boot",    name: "Snelle gele boot",  type: "voertuig",   cost: 285, art: "reddingsboot", opts: { c: "#ffc400", c2: "#1565c0" } },
        { id: "r-vuurtoren",    name: "Vuurtoren",         type: "decor",      cost: 330, emoji: "🗼" },
        { id: "r-puppy-zwart",  name: "Puppy Vlek",        type: "held",       cost: 390, art: "puppyheld", opts: { fur: "#5d4037", hat: "#ff6d00", vest: "#ef6c00" } },
        { id: "r-gouden-wagen", name: "Gouden brandweerwagen", type: "voertuig", cost: 470, art: "brandweerauto", opts: { c: "#ffb300", c2: "#e53935" } },
      ],
    },
    {
      id: "race", name: "Racewereld", short: "Race", emoji: "🏎️",
      color: "#7c4dff", bg: "linear-gradient(160deg,#ede7f6,#fff3e0)",
      items: [
        { id: "a-raceauto-1",  name: "Rode racer",        type: "voertuig",   cost: 5,   art: "raceauto", opts: { c: "#e53935", nr: "1" } },
        { id: "a-coureur",     name: "Coureur Flits",     type: "held",       cost: 10,  art: "coureur" },
        { id: "a-vlag",        name: "Finishvlag",        type: "accessoire", cost: 16,  emoji: "🏁" },
        { id: "a-sportwagen",  name: "Paarse bliksem",    type: "voertuig",   cost: 25,  art: "sportwagen" },
        { id: "a-sticker-vuur",name: "Vlammen-sticker",   type: "sticker",    cost: 35,  emoji: "🔥" },
        { id: "a-raceauto-7",  name: "Blauwe racer",      type: "voertuig",   cost: 45,  art: "raceauto", opts: { c: "#1e88e5", c2: "#ffeb3b", nr: "7" } },
        { id: "a-coureur-2",   name: "Coureur Turbo",     type: "held",       cost: 60,  art: "coureur", opts: { helmet: "#00acc1", stripe: "#ffeb3b" } },
        { id: "a-baan",        name: "Looping-baan",      type: "decor",      cost: 80,  emoji: "🎢" },
        { id: "a-sportwagen-2",name: "Neon racer",        type: "voertuig",   cost: 100, art: "sportwagen", opts: { c: "#00c853", c2: "#ffea00" } },
        { id: "a-beker",       name: "Gouden beker",      type: "accessoire", cost: 125, emoji: "🏆" },
        { id: "a-raceauto-99", name: "Super racer",       type: "voertuig",   cost: 160, art: "raceauto", opts: { c: "#ffb300", c2: "#e53935", nr: "99" } },
        { id: "a-monster",     name: "Monstertruck",      type: "voertuig",   cost: 185, art: "monstertruck" },
        { id: "a-helm",        name: "Racehelm",          type: "accessoire", cost: 215, emoji: "⛑️" },
        { id: "a-coureur-3",   name: "Coureur Zoef",      type: "held",       cost: 255, art: "coureur", opts: { helmet: "#43a047", stripe: "#ffffff" } },
        { id: "a-monster-2",   name: "Oranje monstertruck",type: "voertuig",  cost: 300, art: "monstertruck", opts: { c: "#ff6d00", c2: "#212121" } },
        { id: "a-sticker-bliksem",name: "Bliksem-sticker",type: "sticker",    cost: 350, emoji: "⚡" },
        { id: "a-raceauto-3",  name: "Zilveren racer",    type: "voertuig",   cost: 410, art: "raceauto", opts: { c: "#90a4ae", c2: "#ffffff", nr: "3" } },
        { id: "a-podium",      name: "Winnaarspodium",    type: "decor",      cost: 500, emoji: "🥇" },
      ],
    },
    {
      id: "bouw", name: "Bouwplaatswereld", short: "Bouw", emoji: "🏗️",
      color: "#ff8f00", bg: "linear-gradient(160deg,#fff8e1,#efebe9)",
      items: [
        { id: "b-kiepwagen",   name: "Kiepwagen",         type: "voertuig",   cost: 6,   art: "kiepwagen" },
        { id: "b-graaf",       name: "Graafmachine",      type: "voertuig",   cost: 14,  art: "graafmachine" },
        { id: "b-bouwer",      name: "Bouwer Bas",        type: "held",       cost: 22,  art: "bouwer" },
        { id: "b-pion",        name: "Pionnen",           type: "accessoire", cost: 28,  emoji: "🚧" },
        { id: "b-bulldozer",   name: "Bulldozer",         type: "voertuig",   cost: 38,  art: "bulldozer" },
        { id: "b-sticker-steen",name: "Stenen-sticker",   type: "sticker",    cost: 50,  emoji: "🧱" },
        { id: "b-hijskraan",   name: "Hijskraan",         type: "voertuig",   cost: 65,  art: "hijskraan" },
        { id: "b-bouwer-2",    name: "Bouwer Lotte",      type: "held",       cost: 85,  art: "bouwer", opts: { helmet: "#ffffff", vest: "#26a69a" } },
        { id: "b-graaf-groen", name: "Groene graafmachine",type: "voertuig",  cost: 105, art: "graafmachine", opts: { c: "#66bb6a", c2: "#2e7d32" } },
        { id: "b-zandbak",     name: "Zandheuvel",        type: "decor",      cost: 120, emoji: "⛰️" },
        { id: "b-mega-kraan",  name: "Mega hijskraan",    type: "voertuig",   cost: 150, art: "hijskraan", opts: { c: "#e53935", c2: "#ffca28" } },
        { id: "b-betonmolen",  name: "Betonmolen",        type: "voertuig",   cost: 170, art: "betonmolen" },
        { id: "b-bouwer-3",    name: "Bouwer Sam",        type: "held",       cost: 195, art: "bouwer", opts: { helmet: "#42a5f5", vest: "#ffca28" } },
        { id: "b-kiepwagen-2", name: "Blauwe kiepwagen",  type: "voertuig",   cost: 230, art: "kiepwagen", opts: { c: "#1e88e5", c2: "#ffca28" } },
        { id: "b-sticker-moer",name: "Moertjes-sticker",  type: "sticker",    cost: 270, emoji: "🔩" },
        { id: "b-bulldozer-2", name: "Rode bulldozer",    type: "voertuig",   cost: 315, art: "bulldozer", opts: { c: "#e53935", c2: "#b71c1c" } },
        { id: "b-huis",        name: "Nieuw huis",        type: "decor",      cost: 370, emoji: "🏡" },
        { id: "b-betonmolen-2",name: "Paarse betonmolen", type: "voertuig",   cost: 440, art: "betonmolen", opts: { c: "#8e24aa", c2: "#e1bee7" } },
      ],
    },
    {
      id: "ruimte", name: "Ruimtewereld", short: "Ruimte", emoji: "🚀",
      color: "#5e35b1", bg: "linear-gradient(160deg,#ede7f6,#e3f2fd)",
      items: [
        { id: "s-raket",       name: "Raket",             type: "voertuig",   cost: 165, art: "raket" },
        { id: "s-puppy",       name: "Ruimtepuppy Komeet",type: "held",       cost: 180, art: "puppyheld", opts: { fur: "#cfa575", hat: "#eceff1", vest: "#5e35b1" } },
        { id: "s-maan",        name: "Maan",              type: "decor",      cost: 200, emoji: "🌙" },
        { id: "s-maanwagen",   name: "Maanwagen",         type: "voertuig",   cost: 220, art: "maanwagen" },
        { id: "s-sticker-ster",name: "Sterren-sticker",   type: "sticker",    cost: 250, emoji: "✨" },
        { id: "s-satelliet",   name: "Satelliet",         type: "accessoire", cost: 275, emoji: "🛰️" },
        { id: "s-raket-blauw", name: "Blauwe raket",      type: "voertuig",   cost: 310, art: "raket", opts: { c: "#e3f2fd", c2: "#1e88e5", win: "#ffeb3b" } },
        { id: "s-planeet",     name: "Ringplaneet",       type: "decor",      cost: 345, emoji: "🪐" },
        { id: "s-ufo",         name: "Vriendelijke ufo",  type: "voertuig",   cost: 380, emoji: "🛸" },
        { id: "s-maanwagen-2", name: "Oranje maanwagen",  type: "voertuig",   cost: 420, art: "maanwagen", opts: { c: "#cfd8dc", c2: "#ff6d00" } },
        { id: "s-raket-goud",  name: "Gouden maanraket",  type: "voertuig",   cost: 520, art: "raket", opts: { c: "#fff8e1", c2: "#ffb300", win: "#7c4dff" } },
      ],
    },
    {
      id: "dino", name: "Dinowereld", short: "Dino", emoji: "🦖",
      color: "#43a047", bg: "linear-gradient(160deg,#f1f8e9,#fff8e1)",
      items: [
        { id: "d-ei",            name: "Dino-ei",               type: "decor",      cost: 155, art: "dino_ei" },
        { id: "d-langnek",       name: "Langnek Lotje",         type: "held",       cost: 175, art: "langnek" },
        { id: "d-trofee-brons",  name: "Bronzen dinotrofee",    type: "trofee",     cost: 195, art: "dinotrofee", opts: { c: "#d7a26c", c2: "#a0643a", dino: "#66bb6a" } },
        { id: "d-tyranno",       name: "Brulsaurus Bram",       type: "held",       cost: 215, art: "tyranno" },
        { id: "d-voetstap",      name: "Dinopootjes-sticker",   type: "sticker",    cost: 240, emoji: "🐾" },
        { id: "d-driehoorn",     name: "Driehoorn Dirk",        type: "held",       cost: 265, art: "driehoorn" },
        { id: "d-trofee-zilver", name: "Zilveren dinotrofee",   type: "trofee",     cost: 295, art: "dinotrofee", opts: { c: "#e0e6ea", c2: "#90a4ae", dino: "#ff8a65" } },
        { id: "d-vulkaan",       name: "Lieve vulkaan",         type: "decor",      cost: 325, emoji: "🌋" },
        { id: "d-stekeldino",    name: "Stekeltje",             type: "held",       cost: 360, art: "stekeldino" },
        { id: "d-ei-blauw",      name: "Blauw dino-ei",         type: "decor",      cost: 395, art: "dino_ei", opts: { c: "#e3f2fd", c2: "#42a5f5" } },
        { id: "d-trofee-goud",   name: "Gouden dinotrofee",     type: "trofee",     cost: 435, art: "dinotrofee", opts: { c: "#ffd54f", c2: "#ff8f00", dino: "#4fc3f7" } },
        { id: "d-langnek-paars", name: "Paarse langnek",        type: "held",       cost: 480, art: "langnek", opts: { c: "#ce93d8", c2: "#8e24aa" } },
        { id: "d-tyranno-groen", name: "Groene Brulsaurus",     type: "held",       cost: 540, art: "tyranno", opts: { c: "#9ccc65", c2: "#558b2f" } },
        { id: "d-trofee-diamant",name: "Diamanten dinotrofee",  type: "trofee",     cost: 600, art: "dinotrofee", opts: { c: "#b2ebf2", c2: "#26a69a", dino: "#ba68c8" } },
      ],
    },
  ],

  TYPE_LABELS: {
    voertuig: "voertuig", held: "held", accessoire: "accessoire", sticker: "sticker", decor: "decorstuk", prijs: "echte prijs", trofee: "trofee",
  },

  PRAISE: [
    "Goed gedaan!", "Wauw, super!", "Jij bent een held!", "Toppie!", "Knap hoor!",
    "Vroem vroem, goed bezig!", "Wat ben jij sterk!", "Hoera!", "Jij kunt het!",
  ],

  // Zinnen die je zelf kunt inspreken (Oudermodus > Stem).
  // group: "compliment" wordt willekeurig gekozen als er voor een knop geen eigen zin is.
  // when: wanneer de zin klinkt (alleen ter uitleg voor de ouder).
  VOICE_LINES: [
    { id: "welkom",        group: "algemeen",   when: "Bij het openen van de kindermodus", say: "Hoi Lulu! Klaar voor een missie?" },
    { id: "act-zitten",     group: "knop",       when: "Knop Zitten",        say: "Goed zo, je bent gaan zitten!" },
    { id: "act-geprobeerd", group: "knop",       when: "Knop Geprobeerd",    say: "Knap dat je het geprobeerd hebt!" },
    { id: "act-aangegeven", group: "knop",       when: "Knop Ik moet!",      say: "Super dat je het zelf zei, Lulu!" },
    { id: "act-plas",       group: "knop",       when: "Knop Plasje",        say: "Hoera, een plasje op het potje!" },
    { id: "act-poep",       group: "knop",       when: "Knop Poepje",        say: "Wauw, een poepje op het potje! Wat knap!" },
    { id: "act-handen",     group: "knop",       when: "Knop Handen",        say: "Lekker schone handjes!" },
    { id: "compliment-1",   group: "compliment", when: "Los compliment (als een knop geen eigen zin heeft)", say: "Goed gedaan, Lulu!" },
    { id: "compliment-2",   group: "compliment", when: "Los compliment",     say: "Jij bent een echte held!" },
    { id: "compliment-3",   group: "compliment", when: "Los compliment",     say: "Vroem vroem, goed bezig!" },
    { id: "bijna",          group: "algemeen",   when: "Als het volgende voertuig nog maar een paar sterren weg is", say: "Je bent er bijna! Nog een paar sterren!" },
    { id: "nieuw",          group: "algemeen",   when: "Als er iets nieuws in de garage komt", say: "Hoera! Er staat iets nieuws in je garage!" },
    { id: "filmpje",       group: "algemeen",   when: "Bij het starten van het Potjesfilmpje", say: "Lekker blijven zitten, Lulu. Kijk maar mee!" },
    { id: "autootje",      group: "algemeen",   when: "Bij elke 100 sterren (echte prijs)", say: "Wauw Lulu, 100 sterren! Je mag een echt autootje uitkiezen!" },
    { id: "op-slot",        group: "algemeen",   when: "Tikken op een voertuig dat nog op slot zit", say: "Nog even sparen, dan is deze ook van jou!" },
  ],

  // Standaardinstellingen (ouder kan ze aanpassen in Oudermodus > Instellingen)
  DEFAULT_SETTINGS: {
    childName: "Lulu",
    sound: true,
    voice: true,           // eigen stemopnames afspelen
    kidCanAward: true,     // mag het kind in Kindermodus zelf sterren geven?
    kidCooldownMin: 2,     // zelfde knop telt pas weer na X minuten (0 = altijd)
    customActions: [],     // eigen knoppen, toegevoegd in Oudermodus > Knoppen
    hiddenActions: [],     // knoppen die de ouder heeft uitgezet
    funActions: [],        // plezierknoppen: geen sterren, mogen altijd
    actionOrder: [],       // volgorde van de knoppen op het kinderscherm
    rewardEvery: 100,      // elke zoveel sterren een echte prijs
    rewardName: "miniatuurautootje", // wat de echte prijs is
  },
};
