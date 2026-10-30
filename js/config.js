/*
 * config.js — alles wat je makkelijk wilt aanpassen staat hier.
 *
 * ACTIONS : de stappen die sterren opleveren (punten, emoji, tekst).
 * WORLDS  : de drie werelden met unlockbare items.
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
      id: "redding", name: "Reddingswereld", emoji: "🚒",
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
      ],
    },
    {
      id: "race", name: "Racewereld", emoji: "🏎️",
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
      ],
    },
    {
      id: "bouw", name: "Bouwplaatswereld", emoji: "🏗️",
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
      ],
    },
  ],

  TYPE_LABELS: {
    voertuig: "voertuig", held: "held", accessoire: "accessoire", sticker: "sticker", decor: "decorstuk",
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
  },
};
