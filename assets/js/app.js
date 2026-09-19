/* app.js – der Einstiegspunkt. Hält die Reiter, das Farbschema und sorgt
   dafür, dass nach jeder Datenänderung die sichtbare Ansicht neu gezeichnet wird. */

import { beiAenderung } from './store.js';
import { $, $$ } from './ui.js';

import * as ueberblick from './dashboard.js';
import * as portfolio from './portfolio.js';
import * as ausgaben from './ausgaben.js';
import * as vertraege from './vertraege.js';
import * as daten from './daten.js';

/* Name des Reiters -> Modul, das ihn zeichnet.
   Einen neuen Bereich hinzufügen heißt: hier eine Zeile ergänzen,
   in index.html einen Knopf und einen Abschnitt, fertig. */
const ANSICHTEN = { ueberblick, portfolio, ausgaben, vertraege, daten };

let aktiv = null; // noch nichts gezeichnet

function zeichneAktive() {
  const modul = ANSICHTEN[aktiv];
  const behaelter = $(`#view-${aktiv}`);
  if (!modul || !behaelter) return;
  modul.zeichne(behaelter);
}

function wechsleZu(name, ausHash = false) {
  if (!ANSICHTEN[name]) name = 'ueberblick';

  // Schon sichtbar? Dann nicht neu zeichnen – sonst würde das Setzen des
  // Hashes ein zweites Zeichnen auslösen und gerade getippte Eingaben löschen.
  if (name === aktiv) {
    if (!ausHash) location.hash = name;
    return;
  }
  aktiv = name;

  for (const knopf of $$('nav.tabs button')) {
    knopf.setAttribute('aria-selected', String(knopf.dataset.ziel === name));
  }
  for (const abschnitt of $$('.view')) {
    abschnitt.hidden = abschnitt.id !== `view-${name}`;
  }

  if (!ausHash) location.hash = name;
  zeichneAktive();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* --- Farbschema ----------------------------------------------------------- */

function farbschemaSetzen(wert) {
  if (wert === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', wert);
  }
  try { localStorage.setItem('finanzplattform.theme', wert); } catch { /* egal */ }
}

function farbschemaStarten() {
  let gespeichert = 'system';
  try { gespeichert = localStorage.getItem('finanzplattform.theme') || 'system'; } catch { /* egal */ }
  farbschemaSetzen(gespeichert);

  $('#knopf-theme').addEventListener('click', () => {
    const jetzt = document.documentElement.getAttribute('data-theme');
    // system -> dunkel -> hell -> system
    const naechstes = jetzt === 'dark' ? 'light' : jetzt === 'light' ? 'system' : 'dark';
    farbschemaSetzen(naechstes);
  });
}

/* --- Start ---------------------------------------------------------------- */

function start() {
  for (const knopf of $$('nav.tabs button')) {
    knopf.addEventListener('click', () => wechsleZu(knopf.dataset.ziel));
  }

  window.addEventListener('hashchange', () => {
    wechsleZu(location.hash.slice(1), true);
  });

  farbschemaStarten();

  // Nach jeder Änderung am Datenbestand die sichtbare Ansicht erneuern.
  beiAenderung(() => zeichneAktive());

  wechsleZu(location.hash.slice(1) || 'ueberblick', true);
}

start();
