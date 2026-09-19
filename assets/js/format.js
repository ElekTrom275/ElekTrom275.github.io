/* format.js – Zahlen, Geld und Datum einheitlich darstellen.
   Diese Datei enthält absichtlich keine Logik über Portfolios oder Verträge,
   nur Darstellung. Das nennt man "Trennung der Zuständigkeiten". */

const geldFormat = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const zahlFormat = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

const prozentFormat = new Intl.NumberFormat('de-DE', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** 1234.5 -> "1.234,50 €" */
export function geld(betrag) {
  return geldFormat.format(Number(betrag) || 0);
}

/** 1234.5 -> "+1.234,50 €" (mit Vorzeichen, für Gewinn/Verlust) */
export function geldMitVorzeichen(betrag) {
  const n = Number(betrag) || 0;
  return (n > 0 ? '+' : '') + geldFormat.format(n);
}

/** 12.5 -> "12,5" */
export function zahl(wert) {
  return zahlFormat.format(Number(wert) || 0);
}

/** 0.125 -> "12,5 %" */
export function prozent(anteil) {
  if (!Number.isFinite(anteil)) return '–';
  return prozentFormat.format(anteil);
}

/** "2026-09-19" -> "19.09.2026" */
export function datum(isoDatum) {
  if (!isoDatum) return '–';
  const d = new Date(isoDatum + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return isoDatum;
  return d.toLocaleDateString('de-DE');
}

/** "2026-09" -> "September 2026" */
export function monatsName(monatsSchluessel) {
  const [jahr, monat] = monatsSchluessel.split('-').map(Number);
  const d = new Date(jahr, monat - 1, 1);
  return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}

/** Heute als "2026-09-19" – praktisch für Formular-Vorbelegungen. */
export function heuteIso() {
  return new Date().toISOString().slice(0, 10);
}

/** "2026-09-19" -> "2026-09" */
export function monatVon(isoDatum) {
  return (isoDatum || '').slice(0, 7);
}

/** Ganze Tage von heute bis zum Zieldatum (negativ = liegt in der Vergangenheit). */
export function tageBis(isoDatum) {
  if (!isoDatum) return null;
  const ziel = new Date(isoDatum + 'T00:00:00');
  if (Number.isNaN(ziel.getTime())) return null;
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  return Math.round((ziel - heute) / 86400000);
}
