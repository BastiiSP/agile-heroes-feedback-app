// Serverseitige Anbindung an das Google Apps Script.
// Läuft AUSSCHLIESSLICH in Route Handlers — die Apps-Script-URL verlässt
// den Server nie. server-to-server entfällt jede CORS-Problematik.

import "server-only";
import type { FeedbackEntry, FeedbackItem, Trainer } from "./types";

function gasUrl(): string {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!url) {
    throw new Error("GOOGLE_APPS_SCRIPT_URL ist nicht gesetzt.");
  }
  return url;
}

// Vollständige Trainerliste laden (modul-unabhängig).
// Das Apps Script liefert seit dem Trainer-Blatt-Umbau bei `getTrainers` die
// gesamte, deduplizierte Liste (der `modul`-Parameter wird ignoriert).
// Defensiv normalisiert: akzeptiert sowohl die alte reine Namensliste
// (`string[]`) als auch die neue Form mit Rufname (`{name, rufname}[]` bzw.
// `{Trainer, Rufname}[]`). So ist die Reihenfolge von Deploy und GAS-Umbau egal.
export async function getTrainers(): Promise<Trainer[]> {
  const res = await fetch(gasUrl() + "?action=getTrainers", { cache: "no-store" });
  const raw = (await res.json()) as unknown[];
  const list: Trainer[] = raw
    .map((entry) => {
      if (typeof entry === "string") return { name: entry.trim() };
      const o = entry as Record<string, string>;
      const name = (o.name ?? o.Trainer ?? "").trim();
      const rufname = (o.rufname ?? o.Rufname ?? "").trim();
      return rufname ? { name, rufname } : { name };
    })
    .filter((t) => t.name);
  return list.sort((a, b) => a.name.localeCompare(b.name, "de"));
}

// Feedback einreichen. Ersetzt den ursprünglichen Image-Beacon durch einen
// echten, awaited Server-Request. GET-Vertrag (action=submit&data=…) wie im
// MVP – das Apps Script schreibt die Zeile in doGet.
//
// Wichtig: Die Antwort wird vollständig konsumiert und geprüft. Das stellt
// sicher, dass der Outbound-Request tatsächlich abgeschlossen ist (kein
// vorzeitiger Funktions-Freeze auf Vercel) UND macht GAS-Fehler überhaupt
// erst sichtbar – das Verschlucken der Antwort war die Ursache dafür, dass
// fehlgeschlagene Einreichungen bisher unbemerkt blieben.
export async function submitFeedback(entry: FeedbackEntry): Promise<void> {
  const url = gasUrl() + "?action=submit&data=" + encodeURIComponent(JSON.stringify(entry));
  const res = await fetch(url, { cache: "no-store" });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`GAS submit failed: ${res.status} ${body.slice(0, 300)}`);
  }
  // GAS liefert bei einem Skriptfehler oft 200 + Fehlertext/HTML zurück.
  if (/error|exception|<title>/i.test(body)) {
    throw new Error(`GAS submit returned error body: ${body.slice(0, 300)}`);
  }
}

// Alle Feedbacks laden und auf das interne Modell mappen (deutsche
// Spaltennamen aus dem Sheet → FeedbackItem). Neueste zuerst.
export async function loadFeedback(): Promise<FeedbackItem[]> {
  const res = await fetch(gasUrl(), { cache: "no-store" });
  const rows = (await res.json()) as Record<string, string>[];
  const items: FeedbackItem[] = rows.map((obj, i) => ({
    id: i,
    ausbildung: obj["Ausbildung"] || "",
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
