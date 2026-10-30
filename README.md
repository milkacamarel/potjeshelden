# Potjeshelden 🚒🏎️🏗️

Een vrolijke webapp die zindelijkheidstraining leuk maakt voor peuters. Je kind verdient sterren voor elke kleine stap (gaan zitten, proberen, zelf aangeven, plasje, poepje, handen wassen) en spaart zo reddingsvoertuigen, raceauto's en bouwmachines bij elkaar.

**De app straft nooit.** Sterren gaan alleen omhoog, verzamelde voertuigen blijven altijd van je kind en er is nergens een "mislukt" of "ongelukje". Dat is bewust: zeker bij een kind met peuterdiarree draait het om het belonen van elke positieve stap.

## Online en offline spelen

De app is een zogenaamde web-app: je opent hem één keer via het webadres, zet hem op je beginscherm (Safari: deelknop → **Zet op beginscherm**) en daarna werkt hij ook **zonder internet**. Is er wel internet, dan haalt de app op de achtergrond automatisch de nieuwste versie op. Die zie je de keer daarna.

## Zelf lokaal starten

Er is geen installatie of internetverbinding nodig.

**Snelste manier:** dubbelklik op `index.html`. De app opent in je browser.

**Op telefoon of iPad (aanrader):** start een klein webservertje op je computer en open het adres op je tablet in hetzelfde wifi-netwerk.

```bash
cd zindelijkheidsapp
python3 -m http.server 8000
```

Open daarna op de computer `http://localhost:8000` of op de iPad `http://<ip-adres-van-je-computer>:8000`.

Tip voor iPad/iPhone: tik in Safari op het deelicoon en kies **"Zet op beginscherm"**. Dan opent de app als een eigen icoontje, zonder adresbalk.

> Let op: de voortgang wordt bewaard in de browser van het apparaat waarop je speelt. Op een ander apparaat of in een andere browser begin je opnieuw. Gebruik in de oudermodus **Instellingen → Back-up downloaden** om gegevens mee te nemen.

## Zo werkt het

### Home
Grote knoppen voor **Spelen!** (kindermodus) en **Mijn garage** (verzameling). De knop **Voor ouders** moet je 1,5 seconde ingedrukt houden, zodat je peuter er niet per ongeluk in komt.

### Kindermodus
- Zes grote knoppen met plaatjes: 🚽 Zitten, 💪 Geprobeerd, 🙋 Ik moet!, 💧 Plasje, 💩 Poepje, 🧼 Handen.
- Na elke tik volgt een feestje met sterren, een geluidje en, als je die hebt ingesproken, jouw eigen stem.
- Bovenaan staat een voortgangsbalk met het volgende voertuig als silhouet: *"Nog 2 sterren tot je nieuwe graafmachine!"*
- Komt er een nieuw item vrij, dan verschijnt een groot "Nieuw in je garage!"-scherm.
- Zo voorkom je eindeloos tikken: dezelfde knop geeft pas na een paar minuten weer sterren (instelbaar). Je kind krijgt wel altijd een compliment.

### Garage (unlock-scherm)
Drie werelden met elk 11 items: voertuigen, helden, accessoires, stickers en decorstukken.
- 🚒 **Reddingswereld**: puppyhelden, brandweerwagen, reddingshelikopter …
- 🏎️ **Racewereld**: raceauto's, coureurs, finishvlag, gouden beker …
- 🏗️ **Bouwplaatswereld**: kiepwagen, graafmachine, bulldozer, hijskraan …

Wat nog op slot zit, zie je als silhouet met het aantal sterren dat nodig is.

### Oudermodus
- **Registreren**: datum en tijd, aanvinken wat er goed ging, bijzonderheden. Sterren worden automatisch berekend, of je kiest zelf een aantal. Daarnaast zijn er knoppen voor een snelle bonus (+1, +2, +3, +5).
- **Overzicht**: vandaag in één oogopslag, een weekgrafiek (met bladeren naar vorige weken) en hoeveel er per wereld verzameld is.
- **Logboek**: alle registraties per dag, met wie ze invoerde (kind, ouder of bonus). Een verkeerde invoer kun je weghalen. De sterren blijven dan wel staan.
- **Knoppen**: pas het aantal sterren per knop aan, zet knoppen aan of uit, en maak eigen knoppen met tekst, plaatje, kleur en sterren (met snelle ideeën zoals *Droge broek* en *Zelf afvegen*). Eigen knoppen verschijnen meteen in de kindermodus, het registratieformulier en bij 🎙️ Stem.
- **Stem**: spreek zelf de zinnen in die je kind hoort (zie hieronder).
- **Instellingen**: naam van je kind (standaard Lulu), geluidjes en je ingesproken zinnen aan/uit, of het kind zelf sterren mag geven, de wachttijd per knop, punten per stap, back-up downloaden/terugzetten en alles wissen.

### Standaard puntentabel

| Stap | Sterren |
|---|---|
| Gaan zitten | 1 |
| Rustig geprobeerd | 2 |
| Zelf aangegeven | 3 |
| Plasje op potje/toilet | 4 |
| Poepje op potje/toilet | 5 |
| Handen gewassen (bonus) | 1 |

Je kunt deze in de oudermodus bij **Knoppen** aanpassen.

## MacBook en iPad gelijk houden

Koppel de app één keer aan een **privé** repository in je eigen GitHub-account (Oudermodus → Instellingen → Synchroniseren). Daarna zijn sterren, logboek, knoppen, instellingen en ingesproken zinnen op al je gekoppelde apparaten hetzelfde.

1. Maak een privé repository `potjeshelden-data` (de link in de app vult de naam al in).
2. Maak een sleutel (fine-grained personal access token) met alleen toegang tot die repository en bij *Contents* de rechten *Read and write*.
3. Vul op de MacBook je GitHub-naam en de sleutel in en tik op **Koppelen**.
4. Tik op **Ander apparaat koppelen** en open die link op de iPad (bijv. via AirDrop). Klaar.

Hoe het werkt:
- De app werkt altijd eerst op het apparaat zelf, dus ook offline. Bij internet wordt elke paar seconden na een wijziging, bij het openen van de app en elke minuut bijgewerkt.
- Registraties van beide apparaten worden samengevoegd. Bij instellingen en knoppen wint de laatste wijziging, bij opnames de nieuwste opname per zin.
- Sterren worden nooit minder: ook als twee apparaten tegelijk offline sterren geven, tellen ze allebei mee.
- De sleutel staat alleen in de browser van je eigen apparaten en mag alleen in `potjeshelden-data` lezen en schrijven.

## Je eigen stem inspreken

De app gebruikt geen computerstem. In **Oudermodus → 🎙️ Stem** staan 13 zinnen, zoals *"Hoera, een plasje op het potje!"* bij de plasjesknop en *"Er staat iets nieuws in je garage!"* bij een nieuw voertuig. Per zin kun je:

- **🔴 Opnemen** met de microfoon (maximaal 10 seconden, nog een keer tikken = stoppen), of
- **📁 Bestand** kiezen: neem de zin op met bijvoorbeeld de Dictafoon-app, bewaar hem in Bestanden en kies hem hier.

Een zin zonder opname blijft gewoon stil. Heeft een knop geen eigen zin, dan kiest de app een van je ingesproken complimentjes.

Goed om te weten:
- Opnemen met de microfoon kan alleen als de app via `localhost` of `https` draait. Open je de app op de iPad via `http://<ip-adres>:8000`, dan staat de opnameknop niet aan. Gebruik dan **📁 Bestand**.
- Opnames worden bewaard op het apparaat zelf. Heb je je apparaten gekoppeld, dan gaan ze vanzelf mee naar de andere apparaten. Ze zitten niet in de back-up.
- Wil je andere zinnen? Pas de lijst `VOICE_LINES` aan in `js/config.js`.

## Bestandsstructuur

```
zindelijkheidsapp/
├── index.html        Pagina met de vier schermen en de overlays
├── manifest.webmanifest  Naam en icoon voor 'Zet op beginscherm'
├── sw.js             Zorgt dat de app offline werkt (verhoog VERSION bij een nieuwe versie)
├── icons/            App-iconen
├── css/
│   └── style.css     Alle opmaak (kleuren staan bovenaan als variabelen)
├── js/
│   ├── config.js     Punten, werelden, unlockbare items, complimenten, standaardinstellingen
│   ├── art.js        Eigen SVG-tekeningen van voertuigen en helden
│   ├── storage.js    Opslaan en laden in localStorage, back-up, reset
│   ├── voice.js      Eigen stemopnames: opnemen, bewaren (IndexedDB) en afspelen
│   ├── sync.js       Apparaten gelijk houden via een privé GitHub-repository
│   └── app.js        Schermen, navigatie, beloningen, vieringen, oudermodus
└── README.md
```

Er zijn geen frameworks en geen build-stap. Het is gewone HTML, CSS en JavaScript.

## Uitbreiden

**Nieuw item toevoegen:** zet in `js/config.js` een regel bij de juiste wereld:

```js
{ id: "b-wals", name: "Wals", type: "voertuig", cost: 180, emoji: "🚜" },
```

- `id` moet uniek zijn.
- `cost` is het totaal aantal verdiende sterren waarbij het item vrijkomt.
- `type` is een van: `voertuig`, `held`, `accessoire`, `sticker`, `decor`.
- Gebruik `emoji`, of `art` met een tekening uit `art.js` plus eigen kleuren, bijvoorbeeld `art: "raceauto", opts: { c: "#00bcd4", nr: "5" }`.

**Nieuwe tekening:** voeg in `js/art.js` een functie toe aan `ART` die een SVG-string teruggeeft. Daarna kun je ernaar verwijzen met `art: "naam"`.

**Nieuwe wereld:** voeg in `config.js` een object toe aan `WORLDS` met `id`, `name`, `emoji`, `color`, `bg` en `items`. Het garage-scherm toont hem automatisch.

**Nieuwe stap om te belonen:** dat kan gewoon in de app via Oudermodus → Knoppen. Als ontwikkelaar kun je ook een regel toevoegen aan `ACTIONS`. Hij verschijnt dan vanzelf in de kindermodus, het registratieformulier en de instellingen.

**Complimenten:** pas de lijst `PRAISE` aan.

## Privacy

Alles staat op het apparaat zelf (localStorage en IndexedDB voor de opnames). Alleen als je synchroniseren aanzet, gaan de gegevens naar je eigen privé GitHub-repository, nergens anders heen. Alleen het lettertype wordt bij een internetverbinding van Google Fonts geladen. Zonder internet valt de app terug op een standaard rond lettertype.

## Idee voor een volgende versie

- Synchroniseren tussen telefoon van ouder en iPad van kind
- Eigen foto als avatar
- Een speelscène per wereld waar je verzamelde voertuigen rondrijden
- Herinneringen ("tijd om even te proberen!")
