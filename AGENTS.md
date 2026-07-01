# Agile Heroes Feedback App – Projektkontext für Codex

## Was ist dieses Projekt?

Eine Feedback-App für Trainings und Ausbildungen bei Agile Heroes Intelligence. Teilnehmer wählen zuerst ihre **Ausbildung** (aktuell *KI-Manager Ausbildung / KIMA* mit Modulen und *AI Automation Engineer / AIAE* ohne Module) und geben dann Feedback zu Inhalten, Didaktik, Gestaltung und Trainer. Die Ergebnisse sind über einen passwortgeschützten Trainer-Bereich einsehbar.

**GitHub:** <https://github.com/BastiiSP/agile-heroes-feedback-app>
**Trainerpasswort:** liegt als Umgebungsvariable `TRAINER_PASSWORD` (nicht im Code).

> Hinweis: Die App wurde von einer Single-File-HTML (React via CDN + Babel) auf **Next.js (App Router, TypeScript)** migriert und wird auf **Vercel** deployt. Die alte Datei `agile-heroes-feedback-app.html` liegt noch zur Referenz im Repo.

## Technischer Aufbau

- **Next.js 15 (App Router)** + **React 19** + **TypeScript**, Build über `next build`
- **Inline-Styles** (kein Tailwind, kein UI-Kit) – das Design ist bewusst 1:1 aus dem MVP übernommen
- **Google Apps Script** als Backend-API – verarbeitet Einreichungen und liefert Trainerdaten
- **Google Sheets** als Datenbank (hinter dem Apps Script)
- **Vercel** für Hosting (Push zu GitHub → automatisches Deploy)

### Wichtig: Backend-Aufrufe laufen über Route Handlers

Der Browser spricht **nie direkt** mit Google Apps Script, sondern nur mit den eigenen API-Routen unter `app/api/`. Diese rufen das Apps Script serverseitig auf (`lib/appsScript.ts`). Dadurch bleiben `GOOGLE_APPS_SCRIPT_URL` und `TRAINER_PASSWORD` echte Server-Secrets und tauchen nie im Client-Bundle auf.

- `GET  /api/trainers` → **vollständige** Trainerliste (modul-unabhängig) als `Trainer[]` (`{ name, rufname? }`). Das Apps Script liefert bei `getTrainers` die gesamte, deduplizierte Liste aus dem Tab „Trainer" (Spalte A = Vollname, optionale Spalte B „Rufname"; der `modul`-Parameter wird ignoriert). `getTrainers()` in `lib/appsScript.ts` macht dafür **einen** Aufruf und normalisiert defensiv: alte reine Namenslisten (`string[]`) werden weiterhin akzeptiert. Der Rufname dient nur Suche + Anzeige im `TrainerPicker`; gespeichert/gesendet wird stets der Vollname.
- `POST /api/feedback` → Feedback einreichen (server-to-server, awaited); Payload enthält `ausbildung`

- `POST /api/trainer` → Passwort serverseitig prüfen, bei Erfolg alle Feedbacks geparst zurückgeben (401 bei falschem Passwort)

## Umgebungsvariablen

In `.env.local` (lokal, gitignored) bzw. in den Vercel-Project-Settings:

```text
GOOGLE_APPS_SCRIPT_URL   – Google Apps Script Endpoint (nie ändern!)
TRAINER_PASSWORD         – Passwort für den Trainer-Bereich
```

`.env.example` (committed) dokumentiert die nötigen Keys. **Niemals** mit `NEXT_PUBLIC_` prefixen – sonst landen sie im Browser.

## Projektstruktur

```text
app/
  layout.tsx          # html lang=de, Nunito-Font, Favicon, globals.css
  page.tsx            # 'use client' Orchestrator: view-State + Wizard-/Trainer-Logik, ruft /api/*
  globals.css         # Reset, body, focus/hover, @keyframes spin/pulse
  icon.svg            # Favicon (AHI-Logo)
  api/
    trainers/route.ts  feedback/route.ts  trainer/route.ts
components/           # Screen, MeshBg, NetworkLines, TrainerIcon, StarRating, ProgressBar, TopicNav, AHILogo,
                      # FeedbackWizard, TrainerPicker, ConfirmView, ThanksView, TrainerLogin, TrainerDashboard
lib/
  constants.ts   # MODULES, PROGRAMS (KIMA/AIAE inkl. eigener Fragesätze), Step-Typen + buildSteps(),
                 # phaseOf()/phaseColor()/stepColorForKind(), C (Farben)
  styles.ts      # geteilte Inline-Style-Objekte
  types.ts       # FeedbackEntry, FeedbackItem (inkl. ausbildung), Ratings, FollowUps, OpenAnswers
  appsScript.ts  # server-only: getTrainers/submitFeedback/loadFeedback inkl. dt. Spalten-Mapping
gas/
  Code.js        # Google-Apps-Script-Quellcode (doGet: submit/getTrainers/Lesepfad), via clasp synchronisiert
  appsscript.json  # GAS-Manifest (Webapp: ANYONE_ANONYMOUS, V8)
.clasp.json      # clasp-Konfiguration (Script-ID + rootDir gas/)
public/ahi-logo.svg  # Logo für den Header
```

## App-Struktur

**Views** (`view`-State in `app/page.tsx`): `form` | `confirm` | `thanks` | `trainer-login` | `trainer`.

**Formular-Schritte (Wizard):** Die Schrittfolge ist **nicht mehr fest indexiert**, sondern wird per `buildSteps(program)` aus dem State abgeleitet (Step-Deskriptoren mit `kind`: `program | module | trainer | rating | open | name`). `step` ist der Index in dieses Array; `canProceed()` und das Rendering in `FeedbackWizard` schalten auf `steps[step].kind`.

- `program`: Ausbildung auswählen (aus `PROGRAMS`)
- `module`: Modul auswählen (aus `program.modules`) – **entfällt automatisch, wenn die Ausbildung keine Module hat** (z.B. AIAE)
- `trainer`: Trainer auswählen über die suchbare Liste (`TrainerPicker`, lädt alle Trainer einmalig beim Mount)
- `rating` (×4): Bewertungen (Sterne + Follow-up) aus `program.ratings`
- `open` (×3): Offene Fragen aus `program.openQuestions`
- `name`: Name eingeben (optional) → confirm → thanks

Eigene Module/Module für AIAE später = `modules`-Array in `PROGRAMS` füllen, sonst nichts. Die `TopicNav` (Themen-Leiste) und `ProgressBar` leiten sich beide aus dem `steps`-Array + `phaseOf()` ab. Bewertungs-/Fragetexte sind pro Ausbildung in `lib/constants.ts` definiert (`KIMA_RATINGS`/`KIMA_OPEN` vs. `AIAE_RATINGS`/`AIAE_OPEN`); die IDs bleiben identisch, nur die Anzeigetexte unterscheiden sich.

## Design-System

**Farben (`C`-Objekt in `lib/constants.ts`):**

- `C.pink` (#db73a6) – Primärfarbe, Sterne, Akzente
- `C.teal` (#87cdcb) – Sekundärfarbe, Labels, Kurs-Buttons
- `C.gold` (#e8c07a) – offene Fragen
- `C.dark` (#212121) – Hintergrund
- `C.text` (#f0f0f0) – Text

**Font:** Nunito (Google Fonts via `<link>` in `app/layout.tsx`)
**Stil:** Dark Mode, abgerundete Buttons, animierter Mesh-Hintergrund (dekorativ, nicht anfassen)

## Was nicht angefasst werden darf

- `GOOGLE_APPS_SCRIPT_URL` (Env) – nie ändern, sonst bricht die gesamte Datenanbindung
- Die deutschen Spaltennamen im Mapping in `lib/appsScript.ts` (`"Inhalte ★"` etc.) – müssen zum Sheet passen und identisch in `FEEDBACK_HEADERS` in `gas/Code.js` stehen (beide Seiten desselben Vertrags)
- Das Design-System (Farben, Fonts, Abstände, Inline-Styles) – ist bewusst so
- Der Mesh-Hintergrund (`MeshBg`, `NetworkLines`) – rein dekorativ, stabil lassen
- Die Passwortlogik im Route Handler `app/api/trainer/route.ts` (serverseitiger Check)

## Lokale Entwicklung & Deployment

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Production-Build prüfen
```

Deployment: committen und pushen – Vercel deployt automatisch aus dem GitHub-Repo. Env-Variablen müssen in den Vercel-Project-Settings gesetzt sein.

## GAS-Entwicklung mit clasp

Der Google-Apps-Script-Code liegt versioniert unter `gas/Code.js` und wird mit [clasp](https://github.com/google/clasp) (devDependency) synchronisiert. `.clasp.json` enthält die Script-ID des bestehenden GAS-Projekts.

**Workflow für GAS-Änderungen:**

```bash
npm run gas:pull     # Cloud-Stand nach gas/ holen (vor dem Editieren, falls jemand im Web-Editor geändert hat)
# … gas/Code.js lokal bearbeiten …
npm run gas:push     # Code zu Google hochladen (überschreibt den Cloud-Stand!)
npm run gas:deploy   # bestehendes Web-App-Deployment auf die neue Version heben
```

**Wichtig:**

- `gas:deploy` nutzt fest `clasp deploy -i <Deployment-ID>` und aktualisiert damit das **bestehende** Deployment – die `/exec`-URL (= `GOOGLE_APPS_SCRIPT_URL`) bleibt stabil. **Niemals** `clasp deploy` ohne `-i` bzw. `clasp create-deployment` nutzen, das erzeugt eine neue URL
- `clasp push` allein reicht **nicht** – die Web-App serviert eine feste Version, erst `gas:deploy` macht Änderungen live
- Auth: einmalig `npx clasp login` (Browser-OAuth mit dem Google-Konto, dem das Script gehört: `ki.manager.tools@gmail.com`); Credentials liegen in `~/.clasprc.json`, nie im Repo
- `gas/Code.js` schreibt header-basiert in den Tab „Feedback": Werte werden über die Spaltennamen der Kopfzeile zugeordnet, fehlende Spalten automatisch rechts ergänzt. Die `FEEDBACK_HEADERS`-Liste muss zum Spalten-Mapping in `lib/appsScript.ts` passen
- GAS-Antworten dürfen im Erfolgsfall **nie** `error`/`exception`/HTML enthalten – `submitFeedback()` wertet das als Fehlschlag

## Claudian-Update-Format

Am Ende jeder Session eine kurze Zusammenfassung ausgeben:

```text
## Was wurde gemacht
[Was konkret implementiert oder geändert wurde]

## Offene Punkte
[Was noch aussteht oder bekannte Einschränkungen]

## Zum Testen
[Wie man die Änderungen manuell testen kann]
```
