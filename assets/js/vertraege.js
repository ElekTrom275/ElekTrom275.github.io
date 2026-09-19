/* vertraege.js – Ansicht "Verträge": laufende Kosten und Kündigungsfristen. */

import { lies, hinzufuegen, entfernen } from './store.js';
import { geld, datum } from './format.js';
import { sicher, balkenListe, formularDaten, zuZahl } from './ui.js';
import {
  INTERVALLE, vertragProMonat, vertragsKennzahlen, vertraegeNachDringlichkeit,
} from './berechnung.js';

/** Einheitliche Anzeige der Kündigungslage eines Vertrags. */
function fristAnzeige({ stufe, tage, stichtag }) {
  if (!stichtag) return '<span class="tag ok">kein Stichtag</span>';
  const text = `bis ${datum(stichtag)}`;
  if (stufe === 'vorbei')   return `<span class="tag ok">Frist verstrichen</span><br><span style="font-size:12px;color:var(--text-muted)">${text}</span>`;
  if (stufe === 'kritisch') return `<span class="tag crit">⚠ noch ${tage} Tage</span><br><span style="font-size:12px;color:var(--text-muted)">${text}</span>`;
  if (stufe === 'bald')     return `<span class="tag warn">noch ${tage} Tage</span><br><span style="font-size:12px;color:var(--text-muted)">${text}</span>`;
  return `<span class="tag ok">noch ${tage} Tage</span><br><span style="font-size:12px;color:var(--text-muted)">${text}</span>`;
}

export function zeichne(wurzel) {
  const { vertraege } = lies();
  const k = vertragsKennzahlen(vertraege);
  const sortiert = vertraegeNachDringlichkeit(vertraege);
  const eilig = sortiert.filter((e) => e.stufe === 'kritisch' || e.stufe === 'bald').length;

  wurzel.innerHTML = `
    <h2>Verträge</h2>
    <p class="lead">Abos, Versicherungen, Miete – alles, was regelmäßig abgebucht wird.</p>

    <div class="kpis">
      <div class="kpi">
        <div class="label">Fixkosten pro Monat</div>
        <div class="value">${geld(k.proMonat)}</div>
        <div class="sub">${vertraege.length} ${vertraege.length === 1 ? 'Vertrag' : 'Verträge'}</div>
      </div>
      <div class="kpi">
        <div class="label">Fixkosten pro Jahr</div>
        <div class="value">${geld(k.proJahr)}</div>
      </div>
      <div class="kpi">
        <div class="label">Fristen im Blick</div>
        <div class="value ${eilig > 0 ? 'neg' : ''}">${eilig}</div>
        <div class="sub">Kündigung in den nächsten 90 Tagen</div>
      </div>
    </div>

    <div class="card">
      <h3>Vertrag anlegen</h3>
      <p class="hint">Der Kündigungs-Stichtag wird berechnet aus Enddatum minus Frist.</p>
      <form class="grid" id="formular-vertrag">
        <div>
          <label for="ver-name">Bezeichnung</label>
          <input id="ver-name" name="name" required placeholder="z. B. Mobilfunk">
        </div>
        <div>
          <label for="ver-anbieter">Anbieter</label>
          <input id="ver-anbieter" name="anbieter" placeholder="optional">
        </div>
        <div>
          <label for="ver-betrag">Betrag (€)</label>
          <input id="ver-betrag" name="betrag" type="text" inputmode="decimal" required placeholder="29,95">
        </div>
        <div>
          <label for="ver-intervall">Zahlungsrhythmus</label>
          <select id="ver-intervall" name="intervall">
            ${Object.keys(INTERVALLE).map((i) => `<option>${i}</option>`).join('')}
          </select>
        </div>
        <div>
          <label for="ver-start">Laufzeitbeginn</label>
          <input id="ver-start" name="start" type="date">
        </div>
        <div>
          <label for="ver-ende">Laufzeitende</label>
          <input id="ver-ende" name="endeAm" type="date">
        </div>
        <div>
          <label for="ver-frist">Kündigungsfrist (Tage)</label>
          <input id="ver-frist" name="kuendigungsfristTage" type="number" step="1" min="0" value="30">
        </div>
        <div>
          <label for="ver-notiz">Notiz</label>
          <input id="ver-notiz" name="notiz" placeholder="optional">
        </div>
        <div>
          <button class="btn primary" type="submit">Anlegen</button>
        </div>
      </form>
    </div>

    <div class="card">
      <h3>Laufende Verträge</h3>
      <p class="hint">Sortiert nach Dringlichkeit der Kündigungsfrist.</p>
      ${sortiert.length === 0
        ? '<p class="empty">Noch keine Verträge erfasst.</p>'
        : `<div class="table-scroll"><table>
            <thead>
              <tr>
                <th>Vertrag</th><th>Rhythmus</th>
                <th class="num">Betrag</th><th class="num">pro Monat</th>
                <th>Kündigen</th><th></th>
              </tr>
            </thead>
            <tbody>
              ${sortiert.map((eintrag) => {
                const v = eintrag.vertrag;
                return `
                <tr>
                  <td>${sicher(v.name)}${v.anbieter ? `<br><span style="color:var(--text-muted);font-size:12px">${sicher(v.anbieter)}</span>` : ''}</td>
                  <td>${sicher(v.intervall)}</td>
                  <td class="num">${geld(v.betrag)}</td>
                  <td class="num">${geld(vertragProMonat(v))}</td>
                  <td style="white-space:normal">${fristAnzeige(eintrag)}</td>
                  <td><button class="link" data-loeschen="${v.id}" title="Vertrag löschen">löschen</button></td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">Summe</td>
                <td class="num">${geld(k.proMonat)}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table></div>`}
    </div>

    <div class="card">
      <h3>Größte Fixkosten</h3>
      <p class="hint">Alle Verträge auf Monatskosten umgerechnet und verglichen.</p>
      ${balkenListe(vertraege.map((v) => ({ name: v.name, wert: vertragProMonat(v) })))}
    </div>
  `;

  verdrahte(wurzel);
}

let verdrahtet = false;

function verdrahte(wurzel) {
  if (verdrahtet) return;
  verdrahtet = true;

  wurzel.addEventListener('submit', (ereignis) => {
    if (ereignis.target.id !== 'formular-vertrag') return;
    ereignis.preventDefault();
    const d = formularDaten(ereignis.target);
    if (!d.name) return;
    hinzufuegen('vertraege', {
      name: d.name,
      anbieter: d.anbieter || '',
      betrag: zuZahl(d.betrag),
      intervall: d.intervall || 'monatlich',
      start: d.start || '',
      endeAm: d.endeAm || '',
      kuendigungsfristTage: zuZahl(d.kuendigungsfristTage),
      notiz: d.notiz || '',
    });
  });

  wurzel.addEventListener('click', (ereignis) => {
    const id = ereignis.target.dataset?.loeschen;
    if (!id) return;
    if (confirm('Diesen Vertrag wirklich löschen?')) entfernen('vertraege', id);
  });
}
