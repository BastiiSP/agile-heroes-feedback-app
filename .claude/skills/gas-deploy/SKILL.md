---
name: gas-deploy
description: Führt den vollständigen clasp-Workflow aus, um Änderungen an gas/Code.js live auf das bestehende Google-Apps-Script-Deployment zu bringen (pull → editieren → push → deploy -i <bestehende-ID>). User-only, weil ein falscher Schritt die Produktiv-URL bricht.
disable-model-invocation: true
---

# GAS Deploy

Kapselt den Deploy-Workflow für `gas/Code.js` (Google Apps Script Backend der
Feedback-App). Das Script-Projekt ist über `.clasp.json` verknüpft:

- **Script-ID:** `1BqCwOiCXlGhKWqDCdS1gjs6uakuBsB93sghmlNrmktTNclyoB9Y7CNLA`
- **Bestehendes Web-App-Deployment (ID):**
  `AKfycbxVV4pCljaLeLe2Tn1hsL14JIe3a1fkok_SKJ9GMAYC79sTJn9o7Lw_JGUwEJNUidnLwQ`
- Diese Deployment-ID ist bereits fest in `npm run gas:deploy`
  (`clasp deploy -i <ID>`, siehe `package.json`) verdrahtet.

## ⚠️ Die eine Regel, die alles entscheidet

**Niemals `clasp deploy` ohne `-i <Deployment-ID>` und niemals
`clasp create-deployment` ausführen.** Beides erzeugt ein neues Deployment mit
einer neuen `/exec`-URL. Die aktuelle URL steht als `GOOGLE_APPS_SCRIPT_URL` in
`.env.local` und in den Vercel-Project-Settings – ohne `-i` verliert die App
sofort die Verbindung zum Backend und muss in Vercel manuell auf die neue URL
umgestellt werden. Immer `npm run gas:deploy` verwenden, nie `npx clasp deploy`
frei Hand tippen.

## Ablauf

1. **Pull – Cloud-Stand holen** (falls im Web-Editor unter script.google.com
   etwas geändert wurde, das nicht über clasp lief):
   ```bash
   npm run gas:pull
   ```
   Danach `git diff gas/` prüfen, ob sich etwas Unerwartetes geändert hat.

2. **`gas/Code.js` lokal bearbeiten.**
   Dabei den Spalten-Vertrag beachten: `FEEDBACK_HEADERS` in `gas/Code.js` muss
   exakt (inkl. `★`-Zeichen und Bindestrich in `"Take-away"`) zum Mapping in
   `lib/appsScript.ts` (`loadFeedback()`) passen. Bei Unsicherheit vorher den
   `contract-check`-Skill laufen lassen.

3. **Push – Code hochladen** (überschreibt den Cloud-Stand):
   ```bash
   npm run gas:push
   ```
   Das allein macht **nichts live** – die Web-App serviert weiterhin die
   zuletzt deployte Version.

4. **Deploy – bestehendes Deployment auf neue Version heben:**
   ```bash
   npm run gas:deploy
   ```
   Das führt intern `clasp deploy -i AKfycbxVV4pCljaLeLe2Tn1hsL14JIe3a1fkok_SKJ9GMAYC79sTJn9o7Lw_JGUwEJNUidnLwQ`
   aus. Nur dieser Befehl macht Änderungen für die echte `/exec`-URL sichtbar.

5. **Verifizieren:** Kurz `GOOGLE_APPS_SCRIPT_URL` aus `.env.local` mit
   `?action=getTrainers` im Browser oder via `curl` aufrufen und prüfen, dass
   eine valide JSON-Antwort kommt (kein `error`/`exception`/HTML – genau das
   prüft auch `submitFeedback()` in `lib/appsScript.ts`).

## Auth-Hinweis

Falls `clasp` nach Login fragt: `npx clasp login` (Browser-OAuth mit dem
Google-Konto `ki.manager.tools@gmail.com`, dem das Script gehört). Credentials
liegen in `~/.clasprc.json`, niemals ins Repo committen.

## Falls die URL doch mal wechselt

Sollte versehentlich ohne `-i` deployt worden sein und eine neue URL
entstanden sein: alte und neue Deployments unter
`npx clasp deployments` auflisten, das gewünschte bestehende Deployment-ID
identifizieren, und ab sofort ausschließlich `npm run gas:deploy` (mit der
korrekten ID in `package.json`) nutzen. `GOOGLE_APPS_SCRIPT_URL` in
`.env.local` und in den Vercel-Project-Settings müsste dann auf die
ursprüngliche `/exec`-URL zurückgesetzt werden – nicht einfach die neue URL
übernehmen, ohne mit Basti Rücksprache zu halten.
