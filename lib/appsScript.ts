// Serverseitige Anbindung an das Google Apps Script.
// Läuft AUSSCHLIESSLICH in Route Handlers — die Apps-Script-URL verlässt
// den Server nie. server-to-server entfällt jede CORS-Problematik.

import "server-only";
import type { FeedbackEntry, FeedbackItem } from "./types";

function gasUrl(): string {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!url) {
    throw new Error("GOOGLE_APPS_SCRIPT_URL ist nicht gesetzt.");
  }
  return url;
}

// Trainerliste für ein Modul laden.
export async function getTrainers(modul: string): Promise<string[]> {
  const res = await fetch(
    gasUrl() + "?action=getTrainers&modul=" + encodeURIComponent(modul),
    { cache: "no-store" }
  );
  const list = (await res.json()) as string[];
  return [...list].sort((a, b) => a.localeCompare(b, "de"));
}

// Feedback einreichen. Ersetzt den ursprünglichen Image-Beacon durch einen
// echten, awaited Server-Request.
export async function submitFeedback(entry: FeedbackEntry): Promise<void> {
  const url = gasUrl() + "?action=submit&data=" + encodeURIComponent(JSON.stringify(entry));
  await fetch(url, { cache: "no-store" });
}

// Alle Feedbacks laden und auf das interne Modell mappen (deutsche
// Spaltennamen aus dem Sheet → FeedbackItem). Neueste zuerst.
export async function loadFeedback(): Promise<FeedbackItem[]> {
  const res = await fetch(gasUrl(), { cache: "no-store" });
  const rows = (await res.json()) as Record<string, string>[];
  const items: FeedbackItem[] = rows.map((obj, i) => ({
    id: i,
    module: obj["Modul"] || "",
    trainer: obj["Trainer"] || "",
    name: obj["Name"] || "",
    timestamp: obj["Zeitstempel"] || "",
    ratings: {
      inhalt: parseInt(obj["Inhalte ★"]) || 0,
      didaktik: parseInt(obj["Didaktik ★"]) || 0,
      gestaltung: parseInt(obj["Aufbau ★"]) || 0,
      trainer: parseInt(obj["Trainer ★"]) || 0,
    },
    followUps: {
      inhalt: obj["Inhalte Kommentar"] || "",
      didaktik: obj["Didaktik Kommentar"] || "",
      gestaltung: obj["Aufbau Kommentar"] || "",
      trainer: obj["Trainer Kommentar"] || "",
    },
    openAnswers: {
      erkenntnis: obj["Erkenntnis"] || "",
      ausprobieren: obj["Ausprobieren"] || "",
      takeaway: obj["Take-away"] || "",
    },
  }));
  return items.reverse();
}
