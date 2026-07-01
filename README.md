# Agile Heroes Feedback App

Feedback-App für die KI-Manager Ausbildung (KIMA) von Agile Heroes Intelligence.
Teilnehmer bewerten nach jedem Modul Inhalte, Didaktik, Gestaltung und Trainer;
die Ergebnisse sind über einen passwortgeschützten Trainer-Bereich einsehbar.

## Tech-Stack

- **Next.js 15** (App Router) + **React** + **TypeScript**
- Backend-Anbindung (Google Apps Script + Google Sheets) über serverseitige
  Route Handlers unter `app/api/` – Secrets bleiben serverseitig
- Hosting auf **Vercel**

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Production-Build
```

Benötigte Umgebungsvariablen (siehe `.env.example`):

```text
GOOGLE_APPS_SCRIPT_URL   # Google Apps Script Endpoint
TRAINER_PASSWORD         # Passwort für den Trainer-Bereich
```

Details zu Architektur, Design-System und Konventionen: siehe `CLAUDE.md`.
