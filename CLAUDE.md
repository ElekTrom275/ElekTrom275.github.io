# CLAUDE.md – Hinweise für Claude Code in diesem Projekt

## Worum es geht

Persönliche Finanzplattform (Portfolio, Ausgaben, Verträge) als statische Seite
auf GitHub Pages. Der Betreiber ist Einsteiger ohne Programmiervorkenntnisse.

## Nicht verhandelbar

**Dieses Repository ist öffentlich.** Niemals echte Finanzdaten, Kontonummern,
Namen von Banken oder Zugangsdaten in Dateien schreiben, die committet werden.
Alle Nutzerdaten gehören in den `localStorage` des Browsers. Wenn eine Aufgabe
das Speichern auf einem Server verlangt, zuerst nachfragen.

**Keine API-Schlüssel im Quellcode.** Eine statische Seite kann keine
Geheimnisse bewahren – alles im Code ist für jeden lesbar. Wenn externe Kurse
gewünscht sind, die Einschränkung erklären, statt den Schlüssel einzubauen.

## Technische Rahmenbedingungen

- Reines HTML, CSS und JavaScript als ES-Module. **Kein Build-Schritt,
  kein Framework, keine npm-Abhängigkeiten.** Was im Browser nicht direkt
  läuft, kommt nicht ins Projekt.
- Zielgruppe ist ein einzelner Nutzer auf Desktop und Handy. Layout muss ab
  360 px Breite funktionieren.
- Sprache der Oberfläche, der Kommentare und der Variablennamen: **Deutsch**.
  Bestehende Namensgebung fortführen (`zeichne`, `verdrahte`, `hinzufuegen`).

## Aufbau

| Datei | Zuständigkeit |
|---|---|
| `assets/js/store.js` | Einziger Ort, an dem gespeichert und gelesen wird |
| `assets/js/berechnung.js` | Reine Rechenlogik, kein HTML, keine DOM-Zugriffe |
| `assets/js/format.js` | Darstellung von Geld, Zahlen, Datum (de-DE) |
| `assets/js/ui.js` | Gemeinsame Bausteine (Balken, Kacheln, Formulare) |
| `assets/js/<bereich>.js` | Je eine Ansicht, exportiert `zeichne(wurzel)` |
| `assets/js/app.js` | Reiter, Farbschema, Neuzeichnen nach Datenänderung |

**Muster einer Ansicht:** `zeichne(wurzel)` baut das HTML komplett neu auf.
`verdrahte(wurzel)` hängt Zuhörer per Delegation an `wurzel` an und wird durch
ein Modul-Flag gegen mehrfaches Anhängen geschützt – der Inhalt wird ersetzt,
das Element bleibt.

Neue Rechenlogik gehört nach `berechnung.js`, nicht in eine Ansicht.

## Beim Arbeiten beachten

- Nutzereingaben vor dem Einsetzen in HTML durch `sicher()` aus `ui.js` leiten.
- Beträge als `type="text" inputmode="decimal"` erfassen und mit `zuZahl()`
  lesen – deutsche Kommaschreibweise muss funktionieren.
- Nach jeder Änderung an der Oberfläche im Browser gegenprüfen (Server:
  `python3 -m http.server 8000`, dann mit Playwright ansteuern). Änderungen
  nicht ungetestet abschließen.
- Hell- und Dunkelmodus sind beide gepflegt: Farben nur über die CSS-Variablen
  in `:root`, niemals feste Hex-Werte in den Ansichten.

## Diagramme

Balkenlisten verwenden **eine** Farbe – verglichen wird die Länge, nicht der
Farbton. Jeder Balken trägt seinen Wert als sichtbare Beschriftung, damit die
Zahl ohne Farbunterscheidung und ohne Maus lesbar ist. Bei mehr als acht
Einträgen wird der Rest zu „Sonstige" zusammengefasst. Keine Tortendiagramme,
keine zweite Y-Achse.

## Erklären, nicht nur liefern

Der Nutzer lernt mit. Änderungen in einfachen Worten zusammenfassen: was
geändert wurde, warum, und woran er sieht, dass es funktioniert. Fachbegriffe
beim ersten Mal kurz erklären.
