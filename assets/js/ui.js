/* ui.js – kleine Helfer, die alle Ansichten gemeinsam nutzen. */

import { geld, prozent } from './format.js';

/** Kurzform für document.querySelector. */
export const $ = (auswahl, wurzel = document) => wurzel.querySelector(auswahl);

/** Kurzform für querySelectorAll, liefert ein echtes Array. */
export const $$ = (auswahl, wurzel = document) => Array.from(wurzel.querySelectorAll(auswahl));

/** Macht Nutzereingaben sicher, bevor sie als HTML eingesetzt werden.
    Ohne das könnte ein Eintrag namens <script> die Seite manipulieren. */
export function sicher(text) {
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * Baut eine waagerechte Balkenliste.
 * Bewusst nur EINE Farbe: verglichen wird die Länge, nicht der Farbton.
 * Jeder Balken trägt seinen Wert direkt daneben – so ist die Zahl auch
 * ohne Mausbewegung und ohne Farbunterscheidung lesbar.
 *
 * @param {Array<{name: string, wert: number}>} eintraege
 * @param {number} maxAnzahl  wie viele Balken höchstens, Rest wird zu "Sonstige"
 */
export function balkenListe(eintraege, maxAnzahl = 8) {
  const sortiert = [...eintraege].filter((e) => e.wert > 0).sort((a, b) => b.wert - a.wert);
  if (sortiert.length === 0) {
    return '<p class="empty">Noch keine Daten für diese Auswertung.</p>';
  }

  // Alles jenseits der Obergrenze zu einem Sammelposten zusammenfassen.
  let zeilen = sortiert;
  if (sortiert.length > maxAnzahl) {
    const kopf = sortiert.slice(0, maxAnzahl - 1);
    const restSumme = sortiert.slice(maxAnzahl - 1).reduce((s, e) => s + e.wert, 0);
    zeilen = [...kopf, { name: 'Sonstige', wert: restSumme }];
  }

  const gesamt = zeilen.reduce((s, e) => s + e.wert, 0);
  const groesster = zeilen[0].wert;

  return `<div class="bars">${zeilen.map((e) => {
    const breite = Math.max(1, (e.wert / groesster) * 100);
    const anteil = gesamt > 0 ? e.wert / gesamt : 0;
    return `
      <div class="bar-row" title="${sicher(e.name)}: ${geld(e.wert)} (${prozent(anteil)})">
        <div class="bar-head">
          <span class="name">${sicher(e.name)}</span>
          <span class="val">${geld(e.wert)} · ${prozent(anteil)}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${breite.toFixed(1)}%"></div>
        </div>
      </div>`;
  }).join('')}</div>`;
}

/** Eine Kennzahl-Kachel fürs Dashboard. */
export function kpi({ label, wert, zusatz = '', klasse = '' }) {
  return `
    <div class="kpi">
      <div class="label">${sicher(label)}</div>
      <div class="value ${klasse}">${wert}</div>
      ${zusatz ? `<div class="sub">${zusatz}</div>` : ''}
    </div>`;
}

/** Liest ein Formular als einfaches Objekt aus. */
export function formularDaten(formular) {
  const daten = {};
  for (const [schluessel, wert] of new FormData(formular).entries()) {
    daten[schluessel] = typeof wert === 'string' ? wert.trim() : wert;
  }
  return daten;
}

/**
 * Wandelt eine Eingabe in eine Zahl um – deutsch wie englisch geschrieben.
 * "1.234,56" -> 1234.56   |   "1234.56" -> 1234.56   |   "" -> 0
 */
export function zuZahl(eingabe) {
  if (typeof eingabe === 'number') return Number.isFinite(eingabe) ? eingabe : 0;
  let text = String(eingabe ?? '').replace(/\s/g, '');
  if (text === '') return 0;
  if (text.includes(',')) {
    // Deutsche Schreibweise: Punkte sind Tausendertrenner, Komma ist das Komma.
    text = text.replace(/\./g, '').replace(',', '.');
  }
  const n = Number(text);
  return Number.isFinite(n) ? n : 0;
}
