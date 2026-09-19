/* dashboard.js – Ansicht "Überblick": die vier Zahlen, die zuerst zählen. */

import { lies } from './store.js';
import { geld, geldMitVorzeichen, prozent, datum, heuteIso, monatsName, monatVon } from './format.js';
import { sicher, balkenListe, kpi } from './ui.js';
import {
  portfolioKennzahlen, buchungenImMonat, ausgabenKennzahlen,
  ausgabenNachKategorie, vertragsKennzahlen, vertraegeNachDringlichkeit,
  monatsUebersicht,
} from './berechnung.js';

export function zeichne(wurzel) {
  const stand = lies();
  const dieserMonat = monatVon(heuteIso());

  const portfolio = portfolioKennzahlen(stand.positionen);
  const monatsBuchungen = buchungenImMonat(stand.ausgaben, dieserMonat);
  const monat = ausgabenKennzahlen(monatsBuchungen);
  const vertraege = vertragsKennzahlen(stand.vertraege);
  const gesamt = monatsUebersicht(stand.vertraege, monatsBuchungen);

  // Nur Fristen, die noch nicht verstrichen und in Sicht sind.
  const fristen = vertraegeNachDringlichkeit(stand.vertraege)
    .filter((e) => e.stichtag && e.tage >= 0)
    .slice(0, 5);

  const istLeer = stand.positionen.length === 0
    && stand.ausgaben.length === 0
    && stand.vertraege.length === 0;

  wurzel.innerHTML = `
    <h2>Überblick</h2>
    <p class="lead">Stand ${datum(heuteIso())} · ${monatsName(dieserMonat)}</p>

    ${istLeer ? `
      <div class="note">
        <strong>Noch nichts drin.</strong> Lege im Reiter <em>Daten</em> einmal
        Beispieldaten an, um zu sehen, wie alles zusammenspielt – und lösche sie
        später wieder. Oder fang direkt bei <em>Ausgaben</em> an.
      </div>` : ''}

    <div class="kpis">
      ${kpi({
        label: 'Portfoliowert',
        wert: geld(portfolio.wert),
        zusatz: `${stand.positionen.length} Position${stand.positionen.length === 1 ? '' : 'en'}`,
      })}
      ${kpi({
        label: 'Gewinn / Verlust',
        wert: geldMitVorzeichen(portfolio.gewinn),
        klasse: portfolio.gewinn >= 0 ? 'pos' : 'neg',
        zusatz: portfolio.rendite === null ? '–' : prozent(portfolio.rendite) + ' auf den Einsatz',
      })}
      ${kpi({
        label: 'Fixkosten / Monat',
        wert: geld(vertraege.proMonat),
        zusatz: `${geld(vertraege.proJahr)} pro Jahr`,
      })}
      ${kpi({
        label: 'Variable Ausgaben',
        wert: geld(monat.ausgaben),
        zusatz: 'ohne Verträge',
      })}
      ${kpi({
        label: 'Sparquote',
        wert: gesamt.sparquote === null ? '–' : prozent(gesamt.sparquote),
        klasse: gesamt.sparquote === null ? '' : gesamt.sparquote >= 0 ? 'pos' : 'neg',
        zusatz: gesamt.sparquote === null
          ? 'keine Einnahmen erfasst'
          : 'nach allen Kosten',
      })}
    </div>

    <div class="card">
      <h3>Was der Monat kostet</h3>
      <p class="hint">
        Verträge sind hier bereits enthalten – buche sie nicht zusätzlich
        als Ausgabe, sonst zählen sie doppelt.
      </p>
      <div class="table-scroll"><table>
        <tbody>
          <tr>
            <td>Fixkosten aus Verträgen</td>
            <td class="num">${geld(gesamt.fixkosten)}</td>
          </tr>
          <tr>
            <td>Variable Ausgaben · ${monatsName(dieserMonat)}</td>
            <td class="num">${geld(gesamt.variabel)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>Gesamt pro Monat</td>
            <td class="num">${geld(gesamt.gesamt)}</td>
          </tr>
        </tfoot>
      </table></div>
      <p class="hint" style="margin:14px 0 0">
        ${gesamt.einnahmen > 0
          ? `Bei Einnahmen von ${geld(gesamt.einnahmen)} bleiben
             <strong class="${gesamt.saldo >= 0 ? 'pos' : 'neg'}">${geldMitVorzeichen(gesamt.saldo)}</strong>
             übrig – eine Sparquote von ${prozent(gesamt.sparquote)}.`
          : 'Für diesen Monat sind keine Einnahmen erfasst. Trage dein Gehalt unter „Ausgaben“ mit einem Minus ein, dann erscheint hier die Sparquote.'}
      </p>
    </div>

    <div class="card">
      <h3>Ausgaben nach Kategorie · ${monatsName(dieserMonat)}</h3>
      <p class="hint">Aus dem Reiter „Ausgaben“. Länge des Balkens = Anteil am Monat.</p>
      ${balkenListe(ausgabenNachKategorie(monatsBuchungen), 6)}
    </div>

    <div class="card">
      <h3>Nächste Kündigungsfristen</h3>
      <p class="hint">Aus dem Reiter „Verträge“: Laufzeitende minus Kündigungsfrist.</p>
      ${fristen.length === 0
        ? '<p class="empty">Keine anstehenden Fristen erfasst.</p>'
        : `<div class="table-scroll"><table>
            <thead><tr><th>Vertrag</th><th>Kündigen bis</th><th class="num">verbleibend</th></tr></thead>
            <tbody>
              ${fristen.map((e) => `
                <tr>
                  <td>${sicher(e.vertrag.name)}</td>
                  <td>${datum(e.stichtag)}</td>
                  <td class="num">
                    <span class="tag ${e.stufe === 'kritisch' ? 'crit' : e.stufe === 'bald' ? 'warn' : 'ok'}">
                      ${e.stufe === 'kritisch' ? '⚠ ' : ''}${e.tage} Tage
                    </span>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table></div>`}
    </div>
  `;
}
