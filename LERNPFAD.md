# Lernpfad: Deine Finanzplattform mit Claude Code weiterbauen

Diese Datei ist für dich geschrieben – nicht für Claude. Sie erklärt, wie du
ohne Vorkenntnisse an diesem Projekt weiterarbeitest.

---

## Teil 1 · Was hier eigentlich passiert

Claude Code ist kein Chat, der dir Code zum Abtippen gibt. Es ist ein Assistent,
der **direkt in deinem Projektordner arbeitet**: Dateien lesen, Dateien ändern,
Programme ausführen, Ergebnisse prüfen, mit Git committen.

Der Ablauf ist immer derselbe:

```
Du beschreibst, was du willst
        ↓
Claude liest die vorhandenen Dateien
        ↓
Claude ändert oder schreibt Dateien
        ↓
Claude testet, ob es funktioniert
        ↓
Du schaust es dir an und sagst, was noch fehlt
```

Der vierte Schritt ist der entscheidende. Ein Assistent, der Code schreibt und
ihn nie ausführt, produziert Vermutungen. Beim Bau dieser App hat genau dieses
Testen zwei echte Fehler gefunden: Betragsfelder, in die man kein deutsches
Komma tippen konnte, und ein doppeltes Neuzeichnen, das gerade getippte
Eingaben gelöscht hat. Beides wäre dir sonst erst beim Benutzen aufgefallen.

**Daraus folgt deine wichtigste Gewohnheit:** Sag immer dazu, dass getestet
werden soll. Zum Beispiel: *„…und prüf im Browser, dass es wirklich geht."*

---

## Teil 2 · Wie du gute Aufträge formulierst

Du musst keine Fachbegriffe können. Du musst nur genau sein.

### Schwach

> Mach das Portfolio besser.

### Gut

> Im Portfolio soll ich eine Position auch bearbeiten können, nicht nur löschen.
> Ein Klick auf „bearbeiten" macht die Zeile zu Eingabefeldern, mit „speichern"
> und „abbrechen". Halte dich an das Muster der anderen Dateien und prüf im
> Browser, dass es funktioniert.

Der Unterschied: **was**, **wo**, **wie es sich verhalten soll**, und **woran
man merkt, dass es fertig ist**.

### Vier Formulierungen, die fast immer helfen

| Satz | Wofür |
|---|---|
| „Erklär mir erst, was du vorhast, bevor du etwas änderst." | Du behältst die Kontrolle |
| „Halte dich an das Muster der bestehenden Dateien." | Das Projekt bleibt einheitlich |
| „Prüf im Browser, dass es wirklich funktioniert." | Keine ungetesteten Vermutungen |
| „Erklär mir die Änderung in einfachen Worten." | Du lernst dabei etwas |

### Wenn etwas kaputt ist

Sag nicht „geht nicht". Sag, was du getan hast und was passiert ist:

> Ich habe im Reiter Ausgaben auf „löschen" geklickt. Es kommt zweimal
> hintereinander die Rückfrage, und danach ist die Zeile trotzdem noch da.

Das reicht, um den Fehler zu finden.

---

## Teil 3 · Die Handgriffe, die du brauchst

### Im Browser (claude.ai/code)

So arbeitest du gerade. Du beschreibst etwas, Claude arbeitet in einer Kopie
des Projekts und schiebt die Änderungen als **Branch** zu GitHub. Ein Branch
ist ein Seitenstrang: Du kannst dort alles ausprobieren, ohne die laufende
Seite kaputtzumachen. Erst wenn du zufrieden bist, wird er nach `main`
übernommen – und `main` ist das, was unter elektrom275.github.io live steht.

### Auf deinem eigenen Rechner (später, optional)

```bash
# einmalig: Projekt herunterladen
git clone https://github.com/ElekTrom275/ElekTrom275.github.io.git
cd ElekTrom275.github.io

# Seite lokal anschauen
python3 -m http.server 8000     # dann http://localhost:8000 öffnen

# Claude Code starten
claude
```

### Nützliche Eingaben in Claude Code

| Eingabe | Wirkung |
|---|---|
| `/clear` | Gespräch zurücksetzen – gut vor einer neuen, unabhängigen Aufgabe |
| `/init` | Claude schreibt eine Projektbeschreibung (`CLAUDE.md`); hier schon erledigt |
| `/code-review` | Lässt die letzten Änderungen auf Fehler durchsehen |
| `Shift+Tab` | Schaltet in den Planungsmodus: erst planen, dann ändern |
| `Esc` | Bricht ab, wenn Claude in die falsche Richtung läuft |

---

## Teil 4 · Übungsaufgaben, aufsteigend

Arbeite sie der Reihe nach ab. Zu jeder steht ein Auftrag, den du direkt
kopieren kannst. Nimm dir **eine pro Sitzung** vor – kleine Schritte lassen
sich prüfen, große nicht.

### Stufe 1 – Dich zurechtfinden

**1.1 Eigene Kategorien**
> In `assets/js/ausgaben.js` steht oben eine Liste `KATEGORIEN`. Ändere sie auf:
> Lebensmittel, Wohnen, Auto, Versicherung, Hobby, Urlaub, Einkommen, Sonstiges.

*Was du lernst:* wo Einstellungen stehen und wie eine Änderung sofort wirkt.

**1.2 Eine Kennzahl ergänzen**
> Ergänze im Überblick eine vierte Kachel „Sparquote": Anteil des Saldos an den
> Einnahmen des laufenden Monats, in Prozent. Rechne in `berechnung.js`,
> zeige es in `dashboard.js`.

*Was du lernst:* die Trennung von Rechnen und Anzeigen.

### Stufe 2 – Echte Funktionen

**2.1 Positionen bearbeiten**
> Im Portfolio soll ich eine Position bearbeiten können, nicht nur löschen.
> Klick auf „bearbeiten" macht die Zeile zu Eingabefeldern mit „speichern" und
> „abbrechen". Prüf im Browser, dass es funktioniert.

**2.2 Wiederkehrende Buchungen**
> Verträge sollen automatisch als Ausgabe zählen. Füge im Überblick eine Zeile
> „Fixkosten + variable Ausgaben = Gesamt pro Monat" hinzu und erkläre mir kurz,
> warum du es so und nicht anders gerechnet hast.

**2.3 CSV-Import der Bank**
> Ich möchte einen CSV-Export meiner Bank in die Ausgaben einlesen können.
> Baue im Reiter Daten einen CSV-Import: Datei auswählen, Spalten zuordnen
> (Datum, Verwendungszweck, Betrag), Vorschau zeigen, dann übernehmen.
> Die Datei darf den Browser nicht verlassen.

*Das ist der Punkt, an dem die App wirklich nützlich wird* – Tippen entfällt.

### Stufe 3 – Sauberkeit

**3.1 Automatische Tests**
> Richte Tests für `berechnung.js` ein, die ohne Browser laufen. Prüfe
> mindestens: Portfoliogewinn, Monatskosten eines jährlichen Vertrags,
> Kündigungs-Stichtag. Schreib in die README, wie ich sie starte.

**3.2 Mehrere Monate vergleichen**
> Baue im Reiter Ausgaben eine Ansicht, die die letzten zwölf Monate
> nebeneinander zeigt, damit ich Ausreißer sehe. Beachte die Vorgaben
> in `CLAUDE.md` zur Darstellung von Diagrammen.

---

## Teil 5 · Vier Regeln, die du nicht brechen solltest

**1. Keine echten Zahlen ins Repository.**
Dieses Repository ist öffentlich. Alles, was du hier einträgst, kann jeder
lesen – dauerhaft, auch nach dem Löschen. Die App speichert deshalb nur im
Browser. Exportierte JSON-Dateien legst du außerhalb dieses Ordners ab.

**2. Keine Zugangsdaten, keine Schlüssel.**
Falls du später Kurse automatisch abrufen willst: API-Schlüssel gehören
niemals in den Code einer öffentlichen Seite. Frag vorher nach, wie man das
richtig löst.

**3. Rechne stichprobenartig nach.**
Software rechnet zuverlässig falsch, wenn die Annahme falsch war. Prüf ein
paar Zahlen gegen deinen Kontoauszug, bevor du dich auf sie verlässt.

**4. Ein Schritt pro Sitzung.**
„Bau mir alles" führt zu Code, den niemand mehr überblickt – du nicht und
Claude auch nicht. Kleine, geprüfte Schritte summieren sich schneller.

---

## Teil 6 · Wenn du nicht weiterweißt

Diese Sätze funktionieren immer:

> Erklär mir, was die Datei `assets/js/store.js` macht – für jemanden ohne
> Programmierkenntnisse.

> Ich verstehe nicht, warum sich die Ansicht neu aufbaut, wenn ich etwas
> speichere. Zeig mir, wo das passiert.

> Die Zahl in der Kachel stimmt nicht mit meinem Kontoauszug überein.
> Geh die Rechnung mit mir durch.

Du musst den Code nicht beherrschen, um ihn zu verantworten. Du musst nur
verstehen, was er tut, und merken, wenn etwas nicht stimmt.
