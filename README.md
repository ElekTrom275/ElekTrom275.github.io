# Finanzplattform

Eine persönliche Übersicht über **Portfolio**, **Ausgaben** und **Verträge**.
Läuft als reine Webseite auf GitHub Pages – ohne Server, ohne Anmeldung, ohne Datenbank.

👉 Live: https://elektrom275.github.io/

---

## Das Wichtigste zuerst: Wo liegen die Daten?

**Ausschließlich im Speicher deines Browsers** (`localStorage`), auf dem Gerät,
an dem du sie eingibst.

Das ist Absicht. Dieses Repository ist öffentlich – jeder kann den Quellcode lesen.
Deine Kontostände haben dort nichts verloren. Deshalb gilt:

| | |
|---|---|
| ✅ Der **Code** liegt auf GitHub | öffentlich, das ist in Ordnung |
| ✅ Deine **Zahlen** liegen im Browser | privat, verlassen das Gerät nie |
| ❌ Nie eine Datei mit echten Zahlen committen | auch nicht „nur kurz zum Testen" |

**Merke dir eine Regel:** Wenn eine Datei Beträge enthält, die wirklich deine sind,
gehört sie nicht in dieses Repository. Die `.gitignore` hilft dir dabei mit.

Kehrseite des Ganzen: Löschst du deine Browserdaten, sind die Einträge weg.
Deshalb gibt es im Reiter **Daten** einen Export als JSON-Datei. Nutze ihn regelmäßig
und lege die Datei irgendwo ab, wo sie sicher ist – aber nicht in diesem Ordner.

---

## Was die App kann

| Bereich | Inhalt |
|---|---|
| **Überblick** | Portfoliowert, Gewinn/Verlust, Fixkosten pro Monat, Ausgaben des laufenden Monats, nächste Kündigungsfristen |
| **Portfolio** | Positionen mit Stückzahl, Kaufkurs und aktuellem Kurs; Gewinn/Verlust je Position; Aufteilung nach Anlageart |
| **Ausgaben** | Buchungen mit Datum, Kategorie und Betrag; Monatsfilter; Auswertung nach Kategorie |
| **Verträge** | Abos und Versicherungen; Umrechnung auf Monatskosten; Berechnung des Kündigungs-Stichtags |
| **Daten** | Export/Import als JSON, Beispieldaten, alles löschen |

Kurse werden **von Hand** eingetragen. Die App ruft bewusst keine externen
Dienste auf – das hält sie einfach und verhindert, dass Daten nach außen gehen.

---

## Aufbau der Dateien

```
index.html                Gerüst der Seite: Kopf, Reiter, fünf leere Abschnitte
assets/css/style.css      Alle Farben und Layouts
assets/js/
  app.js                  Einstiegspunkt: Reiter umschalten, Farbschema
  store.js                Datenspeicher (localStorage) – speichern, lesen, löschen
  berechnung.js           Rechenlogik – ohne HTML, deshalb gut prüfbar
  format.js               Darstellung von Geld, Zahlen, Datum
  ui.js                   Gemeinsame Helfer: Balkenlisten, Kacheln, Formulare
  dashboard.js            Ansicht „Überblick"
  portfolio.js            Ansicht „Portfolio"
  ausgaben.js             Ansicht „Ausgaben"
  vertraege.js            Ansicht „Verträge"
  daten.js                Ansicht „Daten"
archiv/                   die alte Testseite, nur zur Erinnerung
```

Das Muster ist überall gleich:

1. `zeichne(wurzel)` baut das HTML des Bereichs komplett neu auf,
2. `verdrahte(wurzel)` hängt die Ereignis-Zuhörer **einmalig** an,
3. jede Änderung am Speicher löst automatisch ein neues Zeichnen aus.

---

## Lokal ausprobieren

Doppelklick auf `index.html` genügt **nicht** – der Browser blockiert dann das
Laden der JavaScript-Module. Starte stattdessen einen kleinen lokalen Server:

```bash
cd ElekTrom275.github.io
python3 -m http.server 8000
```

Dann im Browser öffnen: <http://localhost:8000>

---

## Weiterentwickeln

Siehe **[LERNPFAD.md](LERNPFAD.md)** – dort steht Schritt für Schritt, wie du mit
Claude Code neue Funktionen ergänzt, und welche Aufgaben sich als Nächstes lohnen.

---

Keine Anlageberatung. Zahlen ohne Gewähr – prüfe sie gegen deine Kontoauszüge.
