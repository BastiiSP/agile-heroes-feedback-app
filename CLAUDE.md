# Agile Heroes Feedback App – Projektkontext für Claude Code

## Was ist dieses Projekt?

Eine Feedback-App für Trainings und Ausbildungen bei Agile Heroes Intelligence (aktuell primär für die KI-Manager Ausbildung / KIMA). Teilnehmer geben nach jedem Modul Feedback zu Inhalten, Didaktik, Gestaltung und Trainer. Die Ergebnisse sind über einen passwortgeschützten Trainer-Bereich einsehbar.

**GitHub:** https://github.com/BastiiSP/agile-heroes-feedback-app
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

- `GET  /api/trainers?modul=X` → Trainerliste für ein Modul
- `POST /api/feedback` → Feedback einreichen (server-to-server, awaited)
- `POST /api/trainer` → Passwort serverseitig prüfen, bei Erfolg alle Feedbacks geparst zurückgeben (401 bei falschem Passwort)

## Umgebungsvariablen

In `.env.local` (lokal, gitignored) bzw. in den Vercel-Project-Settings:

```
GOOGLE_APPS_SCRIPT_URL   – Google Apps Script Endpoint (nie ändern!)
TRAINER_PASSWORD         – Passwort für den Trainer-Bereich
```

`.env.example` (committed) dokumentiert die nötigen Keys. **Niemals** mit `NEXT_PUBLIC_` prefixen – sonst landen sie im Browser.

## Projektstruktur

```
app/
  layout.tsx          # html lang=de, Nunito-Font, Favicon, globals.css
  page.tsx            # 'use client' Orchestrator: view-State + Wizard-/Trainer-Logik, ruft /api/*
  globals.css         # Reset, body, focus/hover, @keyframes spin/pulse
  icon.svg            # Favicon (AHI-Logo)
  api/
    trainers/route.ts  feedback/route.ts  trainer/route.ts
components/           # Screen, MeshBg, NetworkLines, TrainerIcon, StarRating, ProgressBar, AHILogo,
                      # FeedbackWizard, ConfirmView, ThanksView, TrainerLogin, TrainerDashboard
lib/
  constants.ts   # MODULES, RATINGS, OPEN_QUESTIONS, C (Farben), stepColor(), TOTAL_STEPS
  styles.ts      # geteilte Inline-Style-Objekte
  types.ts       # FeedbackEntry, FeedbackItem, Ratings, FollowUps, OpenAnswers
  appsScript.ts  # server-only: getTrainers/submitFeedback/loadFeedback inkl. dt. Spalten-Mapping
public/ahi-logo.svg  # Logo für den Header
```

## App-Struktur

**Views** (`view`-State in `app/page.tsx`): `form` | `confirm` | `thanks` | `trainer-login` | `trainer`.

**Formular-Schritte (Wizard, Steps 0–9, `TOTAL_STEPS = 10`):**
- Step 0: Kurs auswählen (aus `MODULES`) – lädt Trainerliste
- Step 1: Trainer auswählen
- Steps 2–5: Bewertungen (Sterne + Follow-up-Fragen) aus `RATINGS`
- Steps 6–8: Offene Fragen aus `OPEN_QUESTIONS`
- Step 9: Name eingeben (optional) → confirm → thanks

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
- Die deutschen Spaltennamen im Mapping in `lib/appsScript.ts` (`"Inhalte ★"` etc.) – müssen zum Sheet passen
- Das Design-System (Farben, Fonts, Abstände, Inline-Styles) – ist bewusst so
- Der Mesh-Hintergrund (`MeshBg`, `NetworkLines`) – rein dekorativ, stabil lassen
- Die Passwortlogik im Route Handler `app/api/trainer/route.ts` (serverseitiger Check)

## Lokale Entwicklung & Deployment

```
npm install
npm run dev      # http://localhost:3000
npm run build    # Production-Build prüfen
```

Deployment: committen und pushen – Vercel deployt automatisch aus dem GitHub-Repo. Env-Variablen müssen in den Vercel-Project-Settings gesetzt sein.

## Claudian-Update-Format

Am Ende jeder Session eine kurze Zusammenfassung ausgeben:

```
## Was wurde gemacht
[Was konkret implementiert oder geändert wurde]

## Offene Punkte
[Was noch aussteht oder bekannte Einschränkungen]

## Zum Testen
[Wie man die Änderungen manuell testen kann]
```
