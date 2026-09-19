/* portfolio.js – Ansicht "Portfolio": Positionen erfassen und bewerten. */

import { lies, hinzufuegen, entfernen, aktualisieren } from './store.js';
import { geld, geldMitVorzeichen, zahl, prozent } from './format.js';
import { sicher, balkenListe, formularDaten, zuZahl } from './ui.js';
import {
  positionsWert, positionsEinsatz, positionsGewinn,
  portfolioKennzahlen, portfolioNachArt,
} from './berechnung.js';

const ARTEN = ['ETF', 'Aktie', 'Anleihe', 'Fonds', 'Krypto', 'Cash', 'Sonstiges'];

/* Welche Zeile gerade bearbeitet wird, ist reine Ansichtssache und gehört
   deshalb nicht in den Datenspeicher, sondern hierher. null = keine.
   Weil es nur einen Wert gibt, ist immer höchstens eine Zeile offen. */
let bearbeiteId = null;

export function zeichne(wurzel) {
  const { positionen } = lies();
  const k = portfolioKennzahlen(positionen);

  // Wurde die bearbeitete Position zwischenzeitlich gelöscht, gibt es nichts
  // mehr zu bearbeiten – sonst bliebe ein Zustand stehen, der ins Leere zeigt.
  if (bearbeiteId && !positionen.some((p) => p.id === bearbeiteId)) bearbeiteId = null;

  wurzel.innerHTML = `
    <h2>Portfolio</h2>
    <p class="lead">Deine Anlagen mit Einstandskurs und aktuellem Kurs.</p>

    <div class="kpis">
      <div class="kpi">
        <div class="label">Aktueller Wert</div>
        <div class="value">${geld(k.wert)}</div>
        <div class="sub">${positionen.length} Position${positionen.length === 1 ? '' : 'en'}</div>
      </div>
      <div class="kpi">
        <div class="label">Eingesetzt</div>
        <div class="value">${geld(k.einsatz)}</div>
      </div>
      <div class="kpi">
        <div class="label">Gewinn / Verlust</div>
        <div class="value ${k.gewinn >= 0 ? 'pos' : 'neg'}">${geldMitVorzeichen(k.gewinn)}</div>
        <div class="sub">${k.rendite === null ? '–' : prozent(k.rendite) + ' auf den Einsatz'}</div>
      </div>
    </div>

    <div class="card">
      <h3>Position hinzufügen</h3>
      <p class="hint">Kurse trägst du von Hand nach – die App holt bewusst keine Daten von außen.</p>
      <form class="grid" id="formular-position">
        <div>
          <label for="pos-name">Bezeichnung</label>
          <input id="pos-name" name="name" required placeholder="z. B. MSCI World ETF">
        </div>
        <div>
          <label for="pos-symbol">ISIN / Kürzel</label>
          <input id="pos-symbol" name="symbol" placeholder="optional">
        </div>
        <div>
          <label for="pos-art">Art</label>
          <select id="pos-art" name="art">
            ${ARTEN.map((a) => `<option>${a}</option>`).join('')}
          </select>
        </div>
        <div>
          <label for="pos-stueck">Stückzahl</label>
          <input id="pos-stueck" name="stueck" type="text" inputmode="decimal" required value="1">
        </div>
        <div>
          <label for="pos-kaufkurs">Kaufkurs (€)</label>
          <input id="pos-kaufkurs" name="kaufkurs" type="text" inputmode="decimal" required placeholder="78,40">
        </div>
        <div>
          <label for="pos-kurs">Aktueller Kurs (€)</label>
          <input id="pos-kurs" name="kurs" type="text" inputmode="decimal" required placeholder="94,10">
        </div>
        <div>
          <button class="btn primary" type="submit">Hinzufügen</button>
        </div>
      </form>
    </div>

    <div class="card">
      <h3>Positionen</h3>
      <p class="hint">Den aktuellen Kurs überschreibst du direkt in der Tabelle. Alles andere über „bearbeiten“.</p>
      ${positionen.length === 0
        ? '<p class="empty">Noch keine Positionen erfasst.</p>'
        : `<div class="table-scroll"><table>
            <thead>
              <tr>
                <th>Bezeichnung</th>
                <th>Art</th>
                <th class="num">Stück</th>
                <th class="num">Kaufkurs</th>
                <th class="num">Akt. Kurs</th>
                <th class="num">Wert</th>
                <th class="num">G/V</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${positionen.map((p) =>
                p.id === bearbeiteId ? bearbeitungsZeile(p) : anzeigeZeile(p)).join('')}
            </tbody>
          </table></div>`}
    </div>

    <div class="card">
      <h3>Aufteilung nach Anlageart</h3>
      <p class="hint">Länge des Balkens = Anteil am Gesamtwert.</p>
      ${balkenListe(portfolioNachArt(positionen))}
    </div>
  `;

  verdrahte(wurzel);
}

/** Eine Zeile, wie sie normalerweise aussieht: Werte lesen, Knöpfe rechts. */
function anzeigeZeile(p) {
  const gewinn = positionsGewinn(p);
  const einsatz = positionsEinsatz(p);
  return `
    <tr>
      <td>${sicher(p.name)}${p.symbol ? `<br><span style="color:var(--text-muted);font-size:12px">${sicher(p.symbol)}</span>` : ''}</td>
      <td>${sicher(p.art || '–')}</td>
      <td class="num">${zahl(p.stueck)}</td>
      <td class="num">${geld(p.kaufkurs)}</td>
      <td class="num">
        <input type="text" inputmode="decimal" value="${zahl(p.kurs)}"
               data-kurs-fuer="${p.id}" style="width:110px;text-align:right"
               aria-label="Aktueller Kurs von ${sicher(p.name)}">
      </td>
      <td class="num">${geld(positionsWert(p))}</td>
      <td class="num ${gewinn >= 0 ? 'pos' : 'neg'}">
        ${geldMitVorzeichen(gewinn)}<br>
        <span style="font-size:12px">${einsatz > 0 ? prozent(gewinn / einsatz) : '–'}</span>
      </td>
      <td>
        <button class="link" data-bearbeiten="${p.id}" title="Position bearbeiten">bearbeiten</button>
        <button class="link" data-loeschen="${p.id}" title="Position löschen">löschen</button>
      </td>
    </tr>`;
}

/** Dieselbe Zeile, aber als Eingabefelder. */
function bearbeitungsZeile(p) {
  // Eine Art, die nicht in der Liste steht (z. B. aus einem Import), soll
  // nicht stillschweigend verschwinden – deshalb hinten anhängen.
  const artenListe = p.art && !ARTEN.includes(p.art) ? [...ARTEN, p.art] : ARTEN;
  const feld = (name, wert, breite, rechts = true) => `
    <input data-feld="${name}" type="text" inputmode="decimal" value="${sicher(wert)}"
           style="width:${breite};${rechts ? 'text-align:right' : ''}"
           aria-label="${name} von ${sicher(p.name)}">`;

  return `
    <tr data-zeile="${p.id}">
      <td style="white-space:normal">
        <input data-feld="name" value="${sicher(p.name)}" style="width:160px" aria-label="Bezeichnung">
        <input data-feld="symbol" value="${sicher(p.symbol || '')}" style="width:160px;margin-top:4px"
               placeholder="ISIN / Kürzel" aria-label="ISIN oder Kürzel">
      </td>
      <td>
        <select data-feld="art" aria-label="Art" style="width:120px">
          ${artenListe.map((a) => `<option${a === (p.art || 'Sonstiges') ? ' selected' : ''}>${sicher(a)}</option>`).join('')}
        </select>
      </td>
      <td class="num">${feld('stueck', zahl(p.stueck), '90px')}</td>
      <td class="num">${feld('kaufkurs', zahl(p.kaufkurs), '110px')}</td>
      <td class="num">${feld('kurs', zahl(p.kurs), '110px')}</td>
      <td colspan="2" style="white-space:normal;color:var(--text-muted);font-size:13px">
        Wert und Gewinn werden nach dem Speichern neu berechnet.
      </td>
      <td style="white-space:normal">
        <button class="btn primary klein" data-speichern="${p.id}">speichern</button>
        <button class="link" data-abbrechen="ja">abbrechen</button>
      </td>
    </tr>`;
}

/* Die Zuhörer hängen am Abschnitt, nicht an den einzelnen Knöpfen: der Inhalt
   wird bei jedem Zeichnen ersetzt, der Abschnitt bleibt. Deshalb genau einmal
   anhängen – sonst sammeln sie sich mit jedem Zeichnen an. */
let verdrahtet = false;

function verdrahte(wurzel) {
  if (verdrahtet) return;
  verdrahtet = true;

  wurzel.addEventListener('submit', (ereignis) => {
    if (ereignis.target.id !== 'formular-position') return;
    ereignis.preventDefault();
    const d = formularDaten(ereignis.target);
    if (!d.name) return;
    hinzufuegen('positionen', {
      name: d.name,
      symbol: d.symbol || '',
      art: d.art || 'Sonstiges',
      stueck: zuZahl(d.stueck),
      kaufkurs: zuZahl(d.kaufkurs),
      kurs: zuZahl(d.kurs),
    });
  });

  wurzel.addEventListener('click', (ereignis) => {
    const daten = ereignis.target.dataset;
    if (!daten) return;

    if (daten.bearbeiten) {
      bearbeiteId = daten.bearbeiten;
      zeichne(wurzel);
      return;
    }

    if (daten.abbrechen) {
      bearbeiteId = null;
      zeichne(wurzel);
      return;
    }

    if (daten.speichern) {
      speichereZeile(wurzel, daten.speichern);
      return;
    }

    if (daten.loeschen) {
      if (confirm('Diese Position wirklich löschen?')) entfernen('positionen', daten.loeschen);
    }
  });

  // In einer Reihe von Eingabefeldern erwartet man Enter und Escape.
  wurzel.addEventListener('keydown', (ereignis) => {
    if (!bearbeiteId || !ereignis.target.dataset?.feld) return;
    if (ereignis.key === 'Enter') {
      ereignis.preventDefault();
      speichereZeile(wurzel, bearbeiteId);
    }
    if (ereignis.key === 'Escape') {
      bearbeiteId = null;
      zeichne(wurzel);
    }
  });

  wurzel.addEventListener('change', (ereignis) => {
    const id = ereignis.target.dataset?.kursFuer;
    if (!id) return;
    aktualisieren('positionen', id, { kurs: zuZahl(ereignis.target.value) });
  });
}

/** Liest die Eingabefelder einer Zeile aus und schreibt sie in den Speicher. */
function speichereZeile(wurzel, id) {
  const zeile = wurzel.querySelector(`tr[data-zeile="${id}"]`);
  if (!zeile) return;
  const wert = (name) => zeile.querySelector(`[data-feld="${name}"]`).value;

  const name = wert('name').trim();
  if (!name) {
    alert('Die Bezeichnung darf nicht leer sein.');
    zeile.querySelector('[data-feld="name"]').focus();
    return;
  }

  // Erst den Bearbeitungsmodus beenden, dann speichern: das Speichern
  // zeichnet sofort neu, und dann soll die Zeile wieder normal aussehen.
  bearbeiteId = null;
  aktualisieren('positionen', id, {
    name,
    symbol: wert('symbol').trim(),
    art: wert('art'),
    stueck: zuZahl(wert('stueck')),
    kaufkurs: zuZahl(wert('kaufkurs')),
    kurs: zuZahl(wert('kurs')),
  });
}
