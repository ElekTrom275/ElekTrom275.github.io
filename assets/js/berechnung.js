/* berechnung.js – die Rechenlogik der App.
   Hier steht kein HTML. Das macht die Funktionen leicht überprüfbar:
   rein gehen Daten, raus kommen Zahlen. */

import { monatVon, tageBis } from './format.js';

/* --- Portfolio ------------------------------------------------------------ */

/** Aktueller Wert einer Position (Stückzahl × aktueller Kurs). */
export function positionsWert(position) {
  return (Number(position.stueck) || 0) * (Number(position.kurs) || 0);
}

/** Eingesetztes Kapital einer Position (Stückzahl × Kaufkurs). */
export function positionsEinsatz(position) {
  return (Number(position.stueck) || 0) * (Number(position.kaufkurs) || 0);
}

/** Gewinn oder Verlust einer Position in Euro. */
export function positionsGewinn(position) {
  return positionsWert(position) - positionsEinsatz(position);
}

/** Kennzahlen über das gesamte Portfolio. */
export function portfolioKennzahlen(positionen) {
  const wert    = positionen.reduce((s, p) => s + positionsWert(p), 0);
  const einsatz = positionen.reduce((s, p) => s + positionsEinsatz(p), 0);
  const gewinn  = wert - einsatz;
  return {
    wert,
    einsatz,
    gewinn,
    rendite: einsatz > 0 ? gewinn / einsatz : null,
  };
}

/** Aufteilung des Portfolios nach Anlageart, z. B. ETF / Aktie / Cash. */
export function portfolioNachArt(positionen) {
  const summen = new Map();
  for (const p of positionen) {
    const art = p.art || 'Sonstiges';
    summen.set(art, (summen.get(art) || 0) + positionsWert(p));
  }
  return [...summen].map(([name, wert]) => ({ name, wert }));
}

/* --- Ausgaben ------------------------------------------------------------- */
/* Vereinbarung: positiver Betrag = Ausgabe, negativer Betrag = Einnahme. */

/** Alle Buchungen eines Monats ("2026-09"). Ohne Angabe: alle. */
export function buchungenImMonat(ausgaben, monat) {
  if (!monat) return ausgaben;
  return ausgaben.filter((a) => monatVon(a.datum) === monat);
}

/** Summe der Ausgaben, Einnahmen und der Saldo für eine Liste von Buchungen. */
export function ausgabenKennzahlen(buchungen) {
  let ausgaben = 0;
  let einnahmen = 0;
  for (const b of buchungen) {
    const betrag = Number(b.betrag) || 0;
    if (betrag >= 0) ausgaben += betrag;
    else einnahmen += -betrag;
  }
  return { ausgaben, einnahmen, saldo: einnahmen - ausgaben };
}

/** Summen je Kategorie – nur Ausgaben, keine Einnahmen. */
export function ausgabenNachKategorie(buchungen) {
  const summen = new Map();
  for (const b of buchungen) {
    const betrag = Number(b.betrag) || 0;
    if (betrag <= 0) continue;
    const kategorie = b.kategorie || 'Ohne Kategorie';
    summen.set(kategorie, (summen.get(kategorie) || 0) + betrag);
  }
  return [...summen].map(([name, wert]) => ({ name, wert }));
}

/** Alle vorkommenden Monate, neueste zuerst – für das Auswahlfeld. */
export function vorhandeneMonate(ausgaben) {
  const menge = new Set(ausgaben.map((a) => monatVon(a.datum)).filter(Boolean));
  return [...menge].sort().reverse();
}

/* --- Verträge ------------------------------------------------------------- */

/** Wie viele Monate liegen zwischen zwei Zahlungen? */
export const INTERVALLE = {
  'monatlich':      1,
  'vierteljährlich': 3,
  'halbjährlich':   6,
  'jährlich':       12,
};

/** Was kostet ein Vertrag rechnerisch pro Monat? */
export function vertragProMonat(vertrag) {
  const monate = INTERVALLE[vertrag.intervall] ?? 1;
  return (Number(vertrag.betrag) || 0) / monate;
}

/** Summe aller Verträge, auf den Monat und aufs Jahr gerechnet. */
export function vertragsKennzahlen(vertraege) {
  const proMonat = vertraege.reduce((s, v) => s + vertragProMonat(v), 0);
  return { proMonat, proJahr: proMonat * 12 };
}

/**
 * Der letzte Tag, an dem man noch rechtzeitig kündigen kann:
 * Vertragsende minus Kündigungsfrist.
 * Ohne Enddatum gibt es keinen Stichtag (z. B. monatlich kündbar).
 */
export function kuendigenBis(vertrag) {
  if (!vertrag.endeAm) return null;
  const ende = new Date(vertrag.endeAm + 'T00:00:00');
  if (Number.isNaN(ende.getTime())) return null;
  ende.setDate(ende.getDate() - (Number(vertrag.kuendigungsfristTage) || 0));
  return ende.toISOString().slice(0, 10);
}

/**
 * Einstufung der Dringlichkeit für die Anzeige.
 * 'vorbei'  – Stichtag verstrichen
 * 'kritisch' – weniger als 30 Tage
 * 'bald'     – weniger als 90 Tage
 * 'ruhig'    – alles andere oder kein Stichtag
 */
export function dringlichkeit(vertrag) {
  const stichtag = kuendigenBis(vertrag);
  if (!stichtag) return { stufe: 'ruhig', tage: null, stichtag: null };
  const tage = tageBis(stichtag);
  let stufe = 'ruhig';
  if (tage < 0) stufe = 'vorbei';
  else if (tage <= 30) stufe = 'kritisch';
  else if (tage <= 90) stufe = 'bald';
  return { stufe, tage, stichtag };
}

/** Verträge nach Dringlichkeit sortiert – die eiligsten zuerst. */
export function vertraegeNachDringlichkeit(vertraege) {
  return [...vertraege]
    .map((v) => ({ vertrag: v, ...dringlichkeit(v) }))
    .sort((a, b) => {
      if (a.tage === null && b.tage === null) return 0;
      if (a.tage === null) return 1;
      if (b.tage === null) return -1;
      return a.tage - b.tage;
    });
}
