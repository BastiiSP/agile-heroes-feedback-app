---
name: contract-check
description: Prüft, ob der Spalten-Vertrag zwischen gas/Code.js (FEEDBACK_HEADERS + handleSubmit) und lib/appsScript.ts (loadFeedback-Mapping) sowie die RatingId/OpenQuestionId-Keys aus lib/constants.ts noch synchron sind. Nutzen nach jeder Änderung an einer der drei Dateien oder wenn Feedback-Einreichungen/-Auswertungen unerwartet leere Felder zeigen.
---

# Contract Check: Sheets-Spalten & Rating/Question-IDs

Die Feedback-App hat **zwei unabhängige Verträge**, die synchron gehalten
werden müssen, weil GAS und Next.js nur lose über JSON gekoppelt sind (keine
gemeinsamen Typen, kein Compiler, der das prüft):

## Vertrag 1 – Sheet-Spaltennamen (Next.js ↔ GAS)

**Quelle der Wahrheit:** `gas/Code.js`, `FEEDBACK_HEADERS` (16 Einträge):

```
Zeitstempel, Ausbildung, Modul, Trainer, Name,
Inhalte ★, Didaktik ★, Aufbau ★, Trainer ★,
Inhalte Kommentar, Didaktik Kommentar, Aufbau Kommentar, Trainer Kommentar,
Erkenntnis, Ausprobieren, Take-away
```

Dieselben 16 Strings – **zeichengenau**, inkl. `★`-Symbol, Leerzeichen und dem
Bindestrich in `"Take-away"` – tauchen als Objekt-Keys in
`lib/appsScript.ts` → `loadFeedback()` auf (`obj["Inhalte ★"]`,
`obj["Take-away"]` etc.). `handleSubmit()` in `gas/Code.js` baut umgekehrt aus
einem `FeedbackEntry`-JSON (das `submitFeedback()` unverändert als
`?action=submit&data=<JSON>` verschickt) ein `values`-Objekt mit genau diesen
16 Keys.

**Prüfschritte:**
1. `gas/Code.js` lesen, alle 16 Strings aus `FEEDBACK_HEADERS` extrahieren.
2. `lib/appsScript.ts` lesen, alle `obj["…"]`-Zugriffe in `loadFeedback()`
   extrahieren.
3. Beide Mengen zeichengenau vergleichen (Groß-/Kleinschreibung, `★`,
   Bindestriche, Leerzeichen zählen). Jede Abweichung = stiller Datenverlust:
   GAS legt eine neue Spalte an ODER `loadFeedback()` liefert für dieses Feld
   dauerhaft einen leeren String, ohne dass ein Fehler auftritt.
4. Zusätzlich prüfen, dass `handleSubmit()`s `values`-Objekt-Keys ebenfalls
   exakt zu `FEEDBACK_HEADERS` passen (dort ist es dieselbe Datei, aber leicht
   zu vertippen).

## Vertrag 2 – RatingId / OpenQuestionId (lib/constants.ts ↔ beide Seiten)

**Quelle der Wahrheit:** `lib/constants.ts`:
- `RatingId = "inhalt" | "didaktik" | "gestaltung" | "trainer"`
- `OpenQuestionId = "erkenntnis" | "ausprobieren" | "takeaway"`

Diese vier bzw. drei Strings sind nicht nur Labels, sondern echte Objekt-Keys
auf beiden Seiten:
- Im Client/`FeedbackEntry` (`lib/types.ts`) als `ratings.inhalt`,
  `followUps.didaktik`, `openAnswers.takeaway` usw.
- In `gas/Code.js` → `handleSubmit()` als `ratings.inhalt`,
  `followUps.gestaltung`, `openAnswers.erkenntnis` usw.
- In `lib/appsScript.ts` → `loadFeedback()` beim Rückweg
  (`ratings: { inhalt: parseInt(obj["Inhalte ★"]) || 0, ... }`).

Alle `PROGRAMS`-Einträge in `lib/constants.ts` (`KIMA_RATINGS`, `AIAE_RATINGS`,
`KIMA_OPEN`, `AIAE_OPEN`, `SYCO_OPEN`, `ACA_OPEN`) müssen dieselben vier/drei
IDs verwenden – **nur die Anzeigetexte dürfen pro Ausbildung variieren**, nie
die `id`-Felder. Eine neue ID hier bricht sowohl `gas/Code.js` (Spalte bliebe
leer, da `FEEDBACK_HEADERS` sie nicht kennt) als auch `loadFeedback()`.

**Prüfschritte:**
1. `lib/constants.ts` lesen: alle `RatingDef`/`OpenQuestionDef`-Objekte in
   allen `*_RATINGS`/`*_OPEN`-Arrays auflisten, `id`-Felder extrahieren.
2. Sicherstellen, dass ausschließlich die vier bzw. drei bekannten IDs
   vorkommen – keine neue, keine fehlende, keine Tippfehler-Variante.
3. Falls eine neue ID auftaucht: prüfen, ob `gas/Code.js` (`FEEDBACK_HEADERS`
   + `handleSubmit()`) und `lib/appsScript.ts` (`loadFeedback()`) entsprechend
   erweitert wurden. Falls nicht → Vertrag gebrochen, konkret benennen was wo
   fehlt.

## Ausgabeformat

Kurzer Bericht:
- **Vertrag 1 (Spalten):** ✅ synchron / ❌ mit Liste der abweichenden Strings
  (Datei:Stelle, erwartet vs. gefunden).
- **Vertrag 2 (IDs):** ✅ synchron / ❌ mit betroffener ID, Datei und Stelle.
- Falls beide grün: kurz bestätigen, keine Änderungen vornehmen.
- Falls rot: konkreten Fix vorschlagen (welche Datei welche Zeile anpassen),
  aber nicht selbstständig committen.
