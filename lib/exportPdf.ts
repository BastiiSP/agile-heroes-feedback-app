// PDF-Export der Feedback-Auswertung – helles A4-Layout in Markenfarben,
// gedacht zum direkten Weitergeben an Trainer. jsPDF + jspdf-autotable werden
// erst beim Klick dynamisch geladen (eigener Chunk, Hauptbundle bleibt schlank).
//
// Helvetica (Latin-1) deckt ä/ö/ü/ß ab; ★-Glyphen existieren dort nicht,
// deshalb werden Sterne als Vektorformen gezeichnet.

import type { jsPDF } from "jspdf";
import { C } from "./constants";
import type { FeedbackItem } from "./types";
import {
  EXPORT_OPEN,
  EXPORT_RATINGS,
  type ExportMeta,
  avgColor,
  buildFilename,
  buildFilterDescription,
  formatDateDe,
} from "./exportShared";

export interface PdfOptions {
  includeSummary: boolean;
  includeEntries: boolean;
}

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const BOTTOM = PAGE_H - 18; // Inhalt endet hier, darunter Fußzeile

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const PINK = hexToRgb(C.pink);
const TEAL = hexToRgb(C.teal);
const DARK: Rgb = [33, 33, 33];
const MUTED: Rgb = [120, 120, 120];
const LIGHT_LINE: Rgb = [229, 231, 235];

// Lädt ein Logo (SVG oder PNG) unskaliert auf einen Canvas, um es als
// PNG-Data-URL in jsPDF einzubetten (addImage kann kein SVG direkt). Beide
// verwendeten Dateien sind bereits eng auf den Logo-Inhalt zugeschnitten,
// daher entfällt ein nachträgliches Zuschneiden.
async function loadLogoImage(src: string): Promise<{ dataUrl: string; ratio: number } | null> {
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { dataUrl: canvas.toDataURL("image/png"), ratio: canvas.width / canvas.height };
  } catch {
    return null;
  }
}

// Fünfzackiger Stern als geschlossener Linienzug (gefüllt oder Outline).
function drawStar(doc: jsPDF, cx: number, cy: number, r: number, filled: boolean): void {
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    pts.push([cx + rad * Math.cos(ang), cy + rad * Math.sin(ang)]);
  }
  const deltas = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
  doc.lines(deltas, pts[0][0], pts[0][1], [1, 1], filled ? "F" : "S", true);
}

// Sterne mit Dezimalunterstützung via Clip-Mask:
// Alle 5 Outline-Sterne zeichnen, dann Clip-Rechteck auf den gefüllten Anteil
// setzen und darin 5 gefüllte Sterne zeichnen (wie ein Fortschrittsbalken).
function drawStarsPartial(doc: jsPDF, x: number, y: number, value: number, color: Rgb): void {
  const r = 1.8;
  const spacing = 4.4;
  const totalWidth = 4 * spacing + 2 * r; // 21.2 mm für 5 Sterne
  const fillWidth = Math.max(0, Math.min(value / 5, 1)) * totalWidth;

  doc.setFillColor(...color);
  doc.setDrawColor(...color);
  doc.setLineWidth(0.2);

  // 1. Alle 5 Sterne als Outline (leere Sterne im Hintergrund)
  for (let i = 0; i < 5; i++) {
    drawStar(doc, x + i * spacing + r, y, r, false);
  }

  // 2. Gefüllte Sterne via Clip auf den Fortschrittsbalken-Bereich
  if (fillWidth > 0) {
    doc.saveGraphicsState();
    (doc as unknown as Record<string, (...args: unknown[]) => void>).rect(
      x, y - r - 0.5, fillWidth, 2 * r + 1, null
    );
    doc.clip();
    doc.discardPath();
    doc.setFillColor(...color);
    for (let i = 0; i < 5; i++) {
      drawStar(doc, x + i * spacing + r, y, r, true);
    }
    doc.restoreGraphicsState();
  }
}

export async function exportFeedbackPdf(
  items: FeedbackItem[],
  meta: ExportMeta,
  options: PdfOptions
): Promise<void> {
  if (items.length === 0 || (!options.includeSummary && !options.includeEntries)) return;

  const { jsPDF: JsPdf } = await import("jspdf");
  const { autoTable } = await import("jspdf-autotable");
  const [ahiLogo, ahgLogo] = await Promise.all([
    loadLogoImage("/agile-heroes-intelligence-logo-pdf.svg"),
    loadLogoImage("/agile-heroes-logo.png"),
  ]);

  const doc = new JsPdf({ unit: "mm", format: "a4" });
  let y = 0;

  // Kopf (beide Marken-Logos + Wordmark + Teal-Linie) auf jeder Seite –
  // spiegelt DualLogo.tsx (AHI + AHG nebeneinander, ein Wordmark), da der
  // Export beide Marken/Ausbildungen abdeckt.
  const drawHeader = () => {
    let logoX = MARGIN;
    const lh = 13;
    if (ahiLogo) {
      const lw = lh * ahiLogo.ratio;
      doc.addImage(ahiLogo.dataUrl, "PNG", logoX, 7.5, lw, lh);
      logoX += lw + 3.5;
    }
    if (ahgLogo) {
      const lw = lh * ahgLogo.ratio;
      doc.addImage(ahgLogo.dataUrl, "PNG", logoX, 7.5, lw, lh);
      logoX += lw + 3.5;
    }
    const textX = logoX === MARGIN ? MARGIN : logoX + 0.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text("AGILE HEROES", textX, 15.5, { charSpace: 0.4 });
    doc.setDrawColor(...TEAL);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, 24, PAGE_W - MARGIN, 24);
    y = 33;
  };

  const addPage = () => {
    doc.addPage();
    drawHeader();
  };

  // Seitenumbruch, bevor ein Block der Höhe h über den Inhaltsbereich liefe.
  const ensure = (h: number) => {
    if (y + h > BOTTOM) addPage();
  };

  // Abschnitts-Label im Stil der Dashboard-Filterlabels (Uppercase, gesperrt).
  const sectionLabel = (text: string, color: Rgb) => {
    ensure(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...color);
    doc.text(text.toUpperCase(), MARGIN, y, { charSpace: 0.8 });
    y += 6;
  };

  // ── Titelblock ──────────────────────────────────────────────────────────
  drawHeader();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...DARK);
  doc.text("Feedback-Auswertung", MARGIN, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  const desc = doc.splitTextToSize(buildFilterDescription(meta), CONTENT_W) as string[];
  doc.text(desc, MARGIN, y);
  y += desc.length * 4.5 + 1.5;
  doc.text(
    `${meta.count} ${meta.count === 1 ? "Antwort" : "Antworten"}  ·  Erstellt am ${new Date().toLocaleDateString(
      "de-DE",
      { day: "2-digit", month: "2-digit", year: "numeric" }
    )}`,
    MARGIN,
    y
  );
  y += 10;

  // ── Zusammenfassung ─────────────────────────────────────────────────────
  if (options.includeSummary) {
    sectionLabel("Zusammenfassung", hexToRgb(C.gold));

    const gap = 6;
    const boxW = (CONTENT_W - 3 * gap) / 4;
    const boxH = 27;
    ensure(boxH + 8);
    EXPORT_RATINGS.forEach((r, i) => {
      const x = MARGIN + i * (boxW + gap);
      const rated = items.filter((f) => f.ratings[r.id] > 0);
      const avgN = rated.length
        ? rated.reduce((sum, f) => sum + f.ratings[r.id], 0) / rated.length
        : NaN;

      doc.setFillColor(248, 248, 248);
      doc.setDrawColor(...LIGHT_LINE);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, boxW, boxH, 2.5, 2.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(...hexToRgb(avgColor(avgN)));
      doc.text(isNaN(avgN) ? "–" : avgN.toFixed(1).replace(".", ",") + " / 5", x + boxW / 2, y + 9, {
        align: "center",
      });

      drawStarsPartial(doc, x + boxW / 2 - 11.5, y + 14.5, isNaN(avgN) ? 0 : avgN, PINK);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...MUTED);
      const label = doc.splitTextToSize(r.label, boxW - 4) as string[];
      doc.text(label, x + boxW / 2, y + 20.5, { align: "center" });
    });
    y += boxH + 9;

    // Kompakte Übersichtstabelle aller Antworten im Export.
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN, top: 30, bottom: 16 },
      head: [["Datum", "Ausbildung", "Modul", "Trainer", "Inhalte", "Didaktik", "Aufbau & Vis.", "Trainer (Bew.)"]],
      body: items.map((f) => [
        formatDateDe(f.timestamp) || "–",
        f.ausbildung || "–",
        f.module || "–",
        f.trainer || "–",
        ...EXPORT_RATINGS.map((r) => (f.ratings[r.id] > 0 ? String(f.ratings[r.id]) : "–")),
      ]),
      styles: { font: "helvetica", fontSize: 8, textColor: DARK, cellPadding: 1.6 },
      headStyles: { fillColor: TEAL, textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: {
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center" },
      },
    });
    y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 10;
  }

  // ── Einzelfeedback ──────────────────────────────────────────────────────
  if (options.includeEntries) {
    sectionLabel("Einzelfeedback", PINK);

    items.forEach((entry, idx) => {
      // Blöcke vorbereiten (Umbrüche vorab berechnen, dann Höhe messen).
      const ratingBlocks = EXPORT_RATINGS.map((r) => ({
        label: r.label,
        value: entry.ratings[r.id],
        comment: entry.followUps[r.id]
          ? (doc.splitTextToSize(entry.followUps[r.id], CONTENT_W - 6) as string[])
          : [],
      }));
      const openBlocks = EXPORT_OPEN.filter((o) => entry.openAnswers[o.id]).map((o) => ({
        label: o.label,
        lines: doc.splitTextToSize(entry.openAnswers[o.id], CONTENT_W - 6) as string[],
      }));

      const ratingH = (b: (typeof ratingBlocks)[number]) => 5 + b.comment.length * 3.6 + (b.comment.length ? 1.6 : 0.4);
      const openH = (b: (typeof openBlocks)[number]) => 4 + b.lines.length * 3.8 + 2;
      const totalH =
        7 + ratingBlocks.reduce((s, b) => s + ratingH(b), 0) + openBlocks.reduce((s, b) => s + openH(b), 0) + 6;

      // Eintrag möglichst nicht über Seiten splitten; passt er auf keine ganze
      // Seite, brechen die Teilblöcke unten einzeln um.
      if (y + totalH > BOTTOM && totalH <= BOTTOM - 33) addPage();

      // Kopfzeile des Eintrags
      ensure(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...DARK);
      const left = [entry.ausbildung, entry.module, formatDateDe(entry.timestamp)].filter(Boolean).join("  ·  ");
      doc.text(left, MARGIN, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      const right = [entry.trainer, entry.name].filter(Boolean).join(" – ");
      doc.text(right, PAGE_W - MARGIN, y, { align: "right" });
      y += 7;

      // Bewertungen mit Sternen + Kommentar
      ratingBlocks.forEach((b) => {
        ensure(ratingH(b));
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...MUTED);
        doc.text(b.label, MARGIN + 2, y);
        drawStarsPartial(doc, MARGIN + 52, y - 1.4, b.value, PINK);
        doc.setTextColor(...DARK);
        doc.text(b.value > 0 ? `${b.value} / 5` : "–", MARGIN + 78, y);
        y += 4.6;
        if (b.comment.length) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(b.comment, MARGIN + 4, y);
          y += b.comment.length * 3.6 + 2;
        } else {
          y += 0.4;
        }
      });

      // Offene Antworten
      openBlocks.forEach((b) => {
        ensure(openH(b));
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...MUTED);
        doc.text(b.label.toUpperCase(), MARGIN + 2, y, { charSpace: 0.5 });
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text(b.lines, MARGIN + 2, y);
        y += b.lines.length * 3.8 + 2;
      });

      // Trennlinie zwischen Einträgen
      if (idx < items.length - 1) {
        y += 2;
        if (y < BOTTOM - 4) {
          doc.setDrawColor(...LIGHT_LINE);
          doc.setLineWidth(0.3);
          doc.line(MARGIN, y, PAGE_W - MARGIN, y);
        }
        y += 6;
      }
    });
  }

  // ── Fußzeile mit Seitenzahlen (zweiter Durchlauf) ───────────────────────
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Agile Heroes Intelligence · Feedback-Auswertung", MARGIN, PAGE_H - 8);
    doc.text(`Seite ${i} / ${pages}`, PAGE_W - MARGIN, PAGE_H - 8, { align: "right" });
  }

  doc.save(buildFilename(meta, "pdf"));
}
