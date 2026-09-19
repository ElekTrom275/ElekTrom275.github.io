/* ausgaben.js – Ansicht "Ausgaben": einzelne Buchungen erfassen und auswerten.
   Vereinbarung: positiver Betrag = Ausgabe, negativer Betrag = Einnahme. */

import { lies, hinzufuegen, entfernen } from './store.js';
import { geld, geldMitVorzeichen, datum, heuteIso, monatsName, monatVon } from './format.js';
import { sicher, balkenListe, formularDaten, zuZahl } from './ui.js';
import {
  buchungenImMonat, ausgabenKennzahlen, ausgabenNachKategorie, vorhandeneMonate,
} from './berechnung.js';

const KATEGORIEN = [
  'Lebensmittel', 'Wohnen', 'Mobilität', 'Versicherung', 'Gesundheit',
  'Freizeit', 'Anschaffung', 'Bildung', 'Einkommen', 'Sonstiges',
];

/* Der gewählte Monat ist reine Ansichtssache und gehört deshalb nicht
   in den Datenspeicher, sondern hierher. '' bedeutet "alle Monate". */
let gewaehlterMonat = monatVon(heuteIso());

export function zeichne(wurzel) {
  const { ausgaben } = lies();
  const monate = vorhandeneMonate(ausgaben);

  // Falls der vorgewählte Monat keine Buchungen hat, auf den neuesten wechseln.
  if (gewaehlterMonat && monate.length > 0 && !monate.includes(gewaehlterMonat)) {
    gewaehlterMonat = monate[0];
  }

  const gefiltert = buchungenImMonat(ausgaben, gewaehlterMonat)
    .slice()
    .sort((a, b) => String(b.datum).localeCompare(String(a.datum)));
  const k = ausgabenKennzahlen(gefiltert);

  wurzel.innerHTML = `
    <h2>Ausgaben</h2>
    <p class="lead">Jede Buchung einzeln. Einnahmen trägst du mit Minus ein, z. B. <code>-3100</code>.</p>

    <div class="kpis">
      <div class="kpi">
        <div class="label">Ausgaben</div>
        <div class="value">${geld(k.ausgaben)}</div>
        <div class="sub">${gewaehlterMonat ? monatsName(gewaehlterMonat) : 'alle Monate'}</div>
      </div>
      <div class="kpi">
        <div class="label">Einnahmen</div>
        <div class="value">${geld(k.einnahmen)}</div>
      </div>
      <div class="kpi">
        <div class="label">Saldo</div>
        <div class="value ${k.saldo >= 0 ? 'pos' : 'neg'}">${geldMitVorzeichen(k.saldo)}</div>
        <div class="sub">Einnahmen minus Ausgaben</div>
      </div>
    </div>

    <div class="card">
      <h3>Buchung erfassen</h3>
      <form class="grid" id="formular-buchung">
        <div>
          <label for="aus-datum">Datum</label>
          <input id="aus-datum" name="datum" type="date" required value="${heuteIso()}">
        </div>
        <div>
          <label for="aus-text">Beschreibung</label>
          <input id="aus-text" name="text" required placeholder="z. B. Wocheneinkauf">
        </div>
        <div>
          <label for="aus-kategorie">Kategorie</label>
          <select id="aus-kategorie" name="kategorie">
            ${KATEGORIEN.map((kat) => `<option${kat === 'Lebensmittel' ? ' selected' : ''}>${kat}</option>`).join('')}
          </select>
        </div>
        <div>
          <label for="aus-betrag">Betrag (€)</label>
          <input id="aus-betrag" name="betrag" type="text" inputmode="decimal" required placeholder="82,45">
        </div>
        <div>
          <button class="btn primary" type="submit">Buchen</button>
        </div>
      </form>
    </div>

    <div class="card">
      <h3>Buchungen</h3>
      <div style="margin-bottom:14px;max-width:280px">
        <label for="aus-monat">Zeitraum</label>
        <select id="aus-monat">
          <option value=""${gewaehlterMonat === '' ? ' selected' : ''}>Alle Monate</option>
          ${monate.map((m) => `<option value="${m}"${m === gewaehlterMonat ? ' selected' : ''}>${monatsName(m)}</option>`).join('')}
        </select>
      </div>
      ${gefiltert.length === 0
        ? '<p class="empty">Keine Buchungen in diesem Zeitraum.</p>'
        : `<div class="table-scroll"><table>
            <thead>
              <tr>
                <th>Datum</th><th>Beschreibung</th><th>Kategorie</th>
                <th class="num">Betrag</th><th></th>
              </tr>
            </thead>
            <tbody>
              ${gefiltert.map((b) => {
                const betrag = Number(b.betrag) || 0;
                return `
                <tr>
                  <td>${datum(b.datum)}</td>
                  <td>${sicher(b.text)}</td>
                  <td>${sicher(b.kategorie || '–')}</td>
                  <td class="num ${betrag < 0 ? 'pos' : ''}">${geld(Math.abs(betrag))}${betrag < 0 ? ' ein' : ''}</td>
                  <td><button class="link" data-loeschen="${b.id}" title="Buchung löschen">löschen</button></td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">Summe Ausgaben</td>
                <td class="num">${geld(k.ausgaben)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table></div>`}
    </div>

    <div class="card">
      <h3>Wohin geht das Geld?</h3>
      <p class="hint">Ausgaben je Kategorie im gewählten Zeitraum. Einnahmen bleiben außen vor.</p>
      ${balkenListe(ausgabenNachKategorie(gefiltert))}
    </div>
  `;

  verdrahte(wurzel);
}

let verdrahtet = false;

function verdrahte(wurzel) {
  if (verdrahtet) return;
  verdrahtet = true;

  wurzel.addEventListener('submit', (ereignis) => {
    if (ereignis.target.id !== 'formular-buchung') return;
    ereignis.preventDefault();
    const d = formularDaten(ereignis.target);
    if (!d.text || !d.datum) return;
    // Erst den Monat umstellen, dann speichern: das Speichern zeichnet sofort neu.
    gewaehlterMonat = monatVon(d.datum);
    hinzufuegen('ausgaben', {
      datum: d.datum,
      text: d.text,
      kategorie: d.kategorie || 'Sonstiges',
      betrag: zuZahl(d.betrag),
    });
  });

  wurzel.addEventListener('change', (ereignis) => {
    if (ereignis.target.id !== 'aus-monat') return;
    gewaehlterMonat = ereignis.target.value;
    zeichne(wurzel);
  });

  wurzel.addEventListener('click', (ereignis) => {
    const id = ereignis.target.dataset?.loeschen;
    if (!id) return;
    if (confirm('Diese Buchung wirklich löschen?')) entfernen('ausgaben', id);
  });
}
