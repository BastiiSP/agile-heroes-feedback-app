// Geteilte Typen & Helfer für den CSV-/PDF-Export aus dem Trainer-Dashboard.
// Eine Quelle für Labels, Filterbeschreibung und Dateinamen, damit Dashboard,
// CSV und PDF nie auseinanderlaufen.

import { KIMA_RATINGS, C, type OpenQuestionId, type RatingDef } from "./constants";

// Die Bewertungs-IDs/-Labels sind ausbildungsübergreifend identisch; wie im
// Dashboard dient KIMA_RATINGS nur als Label-Quelle.
export const EXPORT_RATINGS: RatingDef[] = KIMA_RATINGS;

// Anzeige-Labels der offenen Fragen (identisch zur Dashboard-Auswertung).
export const EXPORT_OPEN: { id: OpenQuestionId; label: string }[] = [
  { id: "erkenntnis", label: "Größte Erkenntnis" },
  { id: "ausprobieren", label: "Konkret ausprobieren" },
  { id: "takeaway", label: "Take-away" },
];

// Beschreibt den Filterstand, unter dem exportiert wird ("all" = kein Filter).
export interface ExportMeta {
  ausbildung: string;
  modul: string;
  trainer: string;
  dateFrom: string; // "yyyy-mm-dd" oder ""
  dateTo: string; // "yyyy-mm-dd" oder ""
  count: number;
}

// Ampel-Farben für Durchschnittswerte – identisch zur Dashboard-Anzeige.
export function avgColor(value: number): string {
  if (isNaN(value)) return C.muted;
  if (value >= 4.1) return "#6ee7b7";
  if (value >= 3.0) return "#f0a86b";
  return "#ef4444";
}

export function formatDateDe(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTimeDe(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "yyyy-mm-dd" (Date-Input) → "dd.mm.yyyy"
export function formatInputDateDe(value: string): string {
  const [y, m, d] = value.split("-");
  return y && m && d ? `${d}.${m}.${y}` : value;
}

function describeZeitraum(meta: ExportMeta): string {
  if (!meta.dateFrom && !meta.dateTo) return "gesamt";
  const from = meta.dateFrom ? formatInputDateDe(meta.dateFrom) : "Anfang";
  const to = meta.dateTo ? formatInputDateDe(meta.dateTo) : "heute";
  return `${from} – ${to}`;
}

export function buildFilterDescription(meta: ExportMeta): string {
  return [
    "Ausbildung: " + (meta.ausbildung === "all" ? "Alle" : meta.ausbildung),
    "Modul: " + (meta.modul === "all" ? "Alle" : meta.modul),
    "Trainer: " + (meta.trainer === "all" ? "Alle" : meta.trainer),
    "Zeitraum: " + describeZeitraum(meta),
  ].join("  ·  ");
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "alle"
  );
}

export function buildFilename(meta: ExportMeta, ext: "csv" | "pdf"): string {
  const now = new Date();
  const ymd = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const part = (v: string) => slugify(v === "all" ? "alle" : v);
  const range = meta.dateFrom || meta.dateTo ? `_${meta.dateFrom || "anfang"}_bis_${meta.dateTo || ymd}` : "";
  return `ahi-feedback_${part(meta.ausbildung)}_${part(meta.modul)}_${part(meta.trainer)}${range}_${ymd}.${ext}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
