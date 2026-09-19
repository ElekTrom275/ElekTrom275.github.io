/* store.js – der Datenspeicher der App.
   ----------------------------------------------------------------------------
   WICHTIG: Alle Daten liegen ausschließlich im localStorage deines Browsers.
   Sie werden nie an einen Server geschickt und landen nie im Git-Repository.
   Der Code ist öffentlich, deine Zahlen sind es nicht.

   Nachteil davon: löschst du die Browserdaten, sind die Einträge weg.
   Deshalb gibt es im Reiter "Daten" einen Export als JSON-Datei. */

const SPEICHER_SCHLUESSEL = 'finanzplattform.v1';

/** So sieht ein leerer Datenbestand aus. */
function leererStand() {
  return {
    version: 1,
    positionen: [],   // Portfolio-Positionen
    ausgaben: [],     // einzelne Buchungen
    vertraege: [],    // laufende Verträge / Abos
  };
}

/** Eindeutige ID für neue Einträge. */
export function neueId() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

/* Der aktuelle Stand wird einmal geladen und dann im Arbeitsspeicher gehalten. */
let stand = laden();

function laden() {
  try {
    const roh = localStorage.getItem(SPEICHER_SCHLUESSEL);
    if (!roh) return leererStand();
    const geparst = JSON.parse(roh);
    // Fehlende Felder ergänzen, damit ältere Stände nicht die App zerlegen.
    return { ...leererStand(), ...geparst };
  } catch (fehler) {
    console.warn('Gespeicherte Daten konnten nicht gelesen werden:', fehler);
    return leererStand();
  }
}

function speichern() {
  try {
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(stand));
  } catch (fehler) {
    alert('Speichern fehlgeschlagen (Speicher voll oder blockiert): ' + fehler.message);
  }
  benachrichtigen();
}

/* --- Beobachter: Wer sich anmeldet, wird nach jeder Änderung neu gezeichnet --- */
const beobachter = new Set();

export function beiAenderung(funktion) {
  beobachter.add(funktion);
}

function benachrichtigen() {
  for (const funktion of beobachter) funktion(stand);
}

/** Lesender Zugriff auf den gesamten Stand. */
export function lies() {
  return stand;
}

/* --- Schreibende Zugriffe -------------------------------------------------- */

/** Fügt einen Eintrag in eine der Listen ein. */
export function hinzufuegen(liste, eintrag) {
  stand[liste].push({ id: neueId(), ...eintrag });
  speichern();
}

/** Aktualisiert einen Eintrag anhand seiner ID. */
export function aktualisieren(liste, id, aenderungen) {
  const index = stand[liste].findIndex((e) => e.id === id);
  if (index === -1) return;
  stand[liste][index] = { ...stand[liste][index], ...aenderungen };
  speichern();
}

/** Entfernt einen Eintrag anhand seiner ID. */
export function entfernen(liste, id) {
  stand[liste] = stand[liste].filter((e) => e.id !== id);
  speichern();
}

/** Ersetzt den kompletten Stand (für den Import). */
export function ersetzen(neuerStand) {
  stand = { ...leererStand(), ...neuerStand };
  speichern();
}

/** Löscht alles. */
export function zuruecksetzen() {
  stand = leererStand();
  speichern();
}

/** Der ganze Stand als hübsch formatiertes JSON – für den Export. */
export function alsJson() {
  return JSON.stringify(stand, null, 2);
}

/** Beispieldaten zum Ausprobieren, damit die App nicht leer wirkt. */
export function beispieldatenLaden() {
  const jahr = new Date().getFullYear();
  const monat = String(new Date().getMonth() + 1).padStart(2, '0');
  stand = {
    version: 1,
    positionen: [
      { id: neueId(), name: 'MSCI World ETF', symbol: 'IE00B4L5Y983', art: 'ETF',   stueck: 42,  kaufkurs: 78.40,  kurs: 94.10 },
      { id: neueId(), name: 'Tagesgeld',       symbol: '',             art: 'Cash',  stueck: 1,   kaufkurs: 8000,   kurs: 8000 },
      { id: neueId(), name: 'Siemens',         symbol: 'DE0007236101', art: 'Aktie', stueck: 12,  kaufkurs: 148.20, kurs: 171.50 },
    ],
    ausgaben: [
      { id: neueId(), datum: `${jahr}-${monat}-03`, text: 'Wocheneinkauf',   kategorie: 'Lebensmittel', betrag: 82.45 },
      { id: neueId(), datum: `${jahr}-${monat}-05`, text: 'Tankstelle',      kategorie: 'Mobilität',    betrag: 64.90 },
      { id: neueId(), datum: `${jahr}-${monat}-08`, text: 'Restaurant',      kategorie: 'Freizeit',     betrag: 38.00 },
      { id: neueId(), datum: `${jahr}-${monat}-11`, text: 'Wocheneinkauf',   kategorie: 'Lebensmittel', betrag: 76.20 },
      { id: neueId(), datum: `${jahr}-${monat}-01`, text: 'Gehalt',          kategorie: 'Einkommen',    betrag: -3100.00 },
    ],
    vertraege: [
      { id: neueId(), name: 'Miete',            anbieter: 'Hausverwaltung', betrag: 980,   intervall: 'monatlich', start: `${jahr - 2}-04-01`, kuendigungsfristTage: 90,  endeAm: '',                  notiz: '' },
      { id: neueId(), name: 'Mobilfunk',        anbieter: 'Telekom',        betrag: 29.95, intervall: 'monatlich', start: `${jahr - 1}-06-15`, kuendigungsfristTage: 30,  endeAm: `${jahr + 1}-06-14`, notiz: '' },
      { id: neueId(), name: 'Haftpflicht',      anbieter: 'HUK',            betrag: 68,    intervall: 'jährlich',  start: `${jahr - 3}-01-01`, kuendigungsfristTage: 30,  endeAm: `${jahr}-12-31`,     notiz: '' },
      { id: neueId(), name: 'Streaming',        anbieter: 'Netflix',        betrag: 13.99, intervall: 'monatlich', start: `${jahr - 1}-02-01`, kuendigungsfristTage: 0,   endeAm: '',                  notiz: 'monatlich kündbar' },
    ],
  };
  speichern();
}
