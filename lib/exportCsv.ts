// CSV-Export der gefilterten Feedback-Einträge – Rohdaten für Excel/Sheets.
// Semikolon-getrennt (deutsches Excel), UTF-8 mit BOM (korrekte Umlaute),
// CRLF-Zeilenenden. Keine externe Bibliothek nötig.

import type { FeedbackItem } from "./types";
import {
  EXPORT_OPEN,
  EXPORT_RATINGS,
  type ExportMeta,
  buildFilename,
  downloadBlob,
  formatDateTimeDe,
} from "./exportShared";

const SEP = ";";

// Felder mit Trennzeichen, Anführungszeichen oder Zeilenumbrüchen (Freitexte!)
// in "…" einschließen, innere Anführungszeichen verdoppeln.
function escapeField(value: string | number): string {
  const s = String(value ?? "");
  return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function exportFeedbackCsv(items: FeedbackItem[], meta: ExportMeta): void {
  if (items.length === 0) return;

  // "Trainer (Bewertung)" disambiguiert die Sterne-Spalte von der Personen-Spalte.
  const ratingHeader = (label: string) => (label === "Trainer" ? "Trainer (Bewertung)" : label);
  const header = [
    "Zeitstempel",
    "Ausbildung",
    "Modul",
    "Trainer",
    "Name",
    ...EXPORT_RATINGS.flatMap((r) => [ratingHeader(r.label), r.label + " Kommentar"]),
    ...EXPORT_OPEN.map((o) => o.label),
  ];

  const rows = items.map((f) => [
    formatDateTimeDe(f.timestamp),
    f.ausbildung,
    f.module,
    f.trainer,
    f.name,
    ...EXPORT_RATINGS.flatMap((r) => [f.ratings[r.id] || "", f.followUps[r.id] || ""]),
    ...EXPORT_OPEN.map((o) => f.openAnswers[o.id] || ""),
  ]);

  const csv = [header, ...rows].map((row) => row.map(escapeField).join(SEP)).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, buildFilename(meta, "csv"));
}
