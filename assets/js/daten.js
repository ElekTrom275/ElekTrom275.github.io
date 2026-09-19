/* daten.js – Ansicht "Daten": sichern, einlesen, zurücksetzen.
   Weil alles nur im Browser liegt, ist der Export deine Sicherungskopie. */

import { lies, alsJson, ersetzen, zuruecksetzen, beispieldatenLaden } from './store.js';
import { $, sicher } from './ui.js';
import { heuteIso } from './format.js';

export function zeichne(wurzel) {
  const stand = lies();

  wurzel.innerHTML = `
    <h2>Daten</h2>
    <p class="lead">Sichern, zurückspielen, aufräumen.</p>

    <div class="note">
      <strong>Wo liegen deine Zahlen?</strong> Ausschließlich im Speicher dieses
      Browsers (<code>localStorage</code>), auf diesem Gerät. Sie werden nicht
      hochgeladen und stehen nicht im öffentlichen Quellcode dieser Seite.
      Kehrseite: Browserdaten gelöscht = Einträge weg. Exportiere regelmäßig.
    </div>

    <div class="card">
      <h3>Bestand</h3>
      <div class="table-scroll"><table>
        <tbody>
          <tr><td>Portfolio-Positionen</td><td class="num">${stand.positionen.length}</td></tr>
          <tr><td>Buchungen</td><td class="num">${stand.ausgaben.length}</td></tr>
          <tr><td>Verträge</td><td class="num">${stand.vertraege.length}</td></tr>
          <tr><td>Speicherbedarf</td><td class="num">${sicher((alsJson().length / 1024).toFixed(1))} KB</td></tr>
        </tbody>
      </table></div>
      <div class="row-actions">
        <button class="btn primary" id="knopf-export">Als JSON exportieren</button>
        <button class="btn" id="knopf-import">JSON importieren</button>
        <input type="file" id="datei-import" accept="application/json,.json" hidden>
      </div>
    </div>

    <div class="card">
      <h3>Zum Ausprobieren</h3>
      <p class="hint">Füllt die App mit erfundenen Beispieldaten. Ersetzt den aktuellen Bestand.</p>
      <div class="row-actions">
        <button class="btn" id="knopf-beispiel">Beispieldaten laden</button>
        <button class="btn danger" id="knopf-reset">Alles löschen</button>
      </div>
    </div>
  `;

  verdrahte(wurzel);
}

let verdrahtet = false;

function verdrahte(wurzel) {
  if (verdrahtet) return;
  verdrahtet = true;

  wurzel.addEventListener('click', (ereignis) => {
    const id = ereignis.target.id;

    if (id === 'knopf-export') {
      const blob = new Blob([alsJson()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finanzen-${heuteIso()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }

    if (id === 'knopf-import') {
      $('#datei-import', wurzel).click();
    }

    if (id === 'knopf-beispiel') {
      if (confirm('Beispieldaten laden? Der aktuelle Bestand wird ersetzt.')) beispieldatenLaden();
    }

    if (id === 'knopf-reset') {
      if (confirm('Wirklich ALLE Daten löschen? Das lässt sich nicht rückgängig machen.')) zuruecksetzen();
    }
  });

  wurzel.addEventListener('change', async (ereignis) => {
    const feld = ereignis.target;
    if (feld.id !== 'datei-import') return;
    const datei = feld.files?.[0];
    if (!datei) return;
    try {
      const inhalt = JSON.parse(await datei.text());
      const sieht_gut_aus = ['positionen', 'ausgaben', 'vertraege'].some((k) => Array.isArray(inhalt[k]));
      if (!sieht_gut_aus) throw new Error('Die Datei sieht nicht nach einem Export dieser App aus.');
      if (!confirm('Import ersetzt den aktuellen Bestand. Fortfahren?')) return;
      ersetzen(inhalt);
    } catch (fehler) {
      alert('Import fehlgeschlagen: ' + fehler.message);
    } finally {
      feld.value = '';
    }
  });
}
