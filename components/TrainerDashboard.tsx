import { useState } from "react";
import { C, PROGRAMS, KIMA_RATINGS, type RatingId } from "@/lib/constants";
import { wrap, card, ghost, inpStyle, modBtn } from "@/lib/styles";
import type { FeedbackItem } from "@/lib/types";
import { avgColor, type ExportMeta } from "@/lib/exportShared";
import { exportFeedbackCsv } from "@/lib/exportCsv";
import { exportFeedbackPdf } from "@/lib/exportPdf";
import Screen from "./Screen";
import DualLogo from "./DualLogo";
import TrainerFilterSelect from "./TrainerFilterSelect";

// Die Bewertungs-IDs/-Labels sind ausbildungsübergreifend identisch; KIMA_RATINGS
// dient hier nur als Label-Quelle für die Auswertung.
const RATING_LABELS = KIMA_RATINGS;

export default function TrainerDashboard({
  feedbackData,
  filterAusbildung,
  setFilterAusbildung,
  filterModule,
  setFilterModule,
  filterTrainer,
  setFilterTrainer,
  loadingData,
  onRefresh,
  onLogout,
}: {
  feedbackData: FeedbackItem[];
  filterAusbildung: string;
  setFilterAusbildung: (a: string) => void;
  filterModule: string;
  setFilterModule: (m: string) => void;
  filterTrainer: string;
  setFilterTrainer: (t: string) => void;
  loadingData: boolean;
  onRefresh: () => void;
  onLogout: () => void;
}) {
  // Zeitraum-Filter & Export-Optionen leben lokal: das Dashboard wird beim
  // Abmelden unmounted, der State resettet also automatisch.
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pdfSummary, setPdfSummary] = useState(true);
  const [pdfEntries, setPdfEntries] = useState(true);
  const [pdfBusy, setPdfBusy] = useState(false);

  // Datumsvergleich auf Tagesebene (lokale Zeit, passend zur Anzeige).
  const dayKey = (d: Date) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const inputKey = (s: string) => parseInt(s.replace(/-/g, ""), 10);
  const inDateRange = (ts: string) => {
    if (!dateFrom && !dateTo) return true;
    if (!ts) return false;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return false;
    const k = dayKey(d);
    return (!dateFrom || k >= inputKey(dateFrom)) && (!dateTo || k <= inputKey(dateTo));
  };

  const filtered = feedbackData.filter(
    (f) =>
      (filterAusbildung === "all" || f.ausbildung === filterAusbildung) &&
      (filterModule === "all" || f.module === filterModule) &&
      (filterTrainer === "all" || f.trainer === filterTrainer) &&
      inDateRange(f.timestamp)
  );
  const availableTrainers = [...new Set(feedbackData.map((f) => f.trainer).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "de")
  );

  // Module datengesteuert aus den Einträgen der gewählten Ausbildung ableiten –
  // so erscheint der Filter automatisch (nicht) für zukünftige Ausbildungen.
  // Sortierung: bekannte Programm-Reihenfolge zuerst, Unbekanntes alphabetisch.
  const moduleOrder = PROGRAMS.find((p) => p.label === filterAusbildung)?.modules ?? [];
  const availableModules =
    filterAusbildung === "all"
      ? []
      : [...new Set(feedbackData.filter((f) => f.ausbildung === filterAusbildung).map((f) => f.module).filter(Boolean))].sort(
          (a, b) => {
            const ia = moduleOrder.indexOf(a);
            const ib = moduleOrder.indexOf(b);
            if (ia !== -1 && ib !== -1) return ia - ib;
            if (ia !== -1) return -1;
            if (ib !== -1) return 1;
            return a.localeCompare(b, "de");
          }
        );

  const avg = (key: RatingId) => {
    const v = filtered.filter((f) => f.ratings[key] > 0);
    if (!v.length) return "";
    return (v.reduce((a, b) => a + b.ratings[key], 0) / v.length).toFixed(1);
  };

  const exportMeta: ExportMeta = {
    ausbildung: filterAusbildung,
    modul: filterModule,
    trainer: filterTrainer,
    dateFrom,
    dateTo,
    count: filtered.length,
  };
  const handlePdfExport = async () => {
    setPdfBusy(true);
    try {
      await exportFeedbackPdf(filtered, exportMeta, { includeSummary: pdfSummary, includeEntries: pdfEntries });
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <Screen>
      <div style={wrap}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <DualLogo />
          <button style={{ ...ghost, fontSize: "13px", padding: "8px 16px" }} onClick={onLogout}>
            Abmelden
          </button>
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "6px" }}>Feedback-Auswertung</h1>
        <p style={{ color: C.muted, fontSize: "14px", marginBottom: "24px" }}>
          {filterAusbildung === "all" ? "Alle Ausbildungen" : filterAusbildung}
        </p>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
          <span style={{ fontSize: "10px", fontWeight: 800, color: C.gold, letterSpacing: "1.5px", textTransform: "uppercase", alignSelf: "center", marginRight: "4px" }}>
            Ausbildung
          </span>
          <button
            style={modBtn(filterAusbildung === "all")}
            onClick={() => {
              setFilterAusbildung("all");
              setFilterModule("all");
            }}
          >
            Alle
          </button>
          {PROGRAMS.map((p) => (
            <button
              key={p.id}
              style={modBtn(filterAusbildung === p.label)}
              onClick={() => {
                setFilterAusbildung(p.label);
                setFilterModule("all");
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        {availableModules.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: C.teal, letterSpacing: "1.5px", textTransform: "uppercase", alignSelf: "center", marginRight: "4px" }}>
              Modul
            </span>
            <button style={modBtn(filterModule === "all")} onClick={() => setFilterModule("all")}>
              Alle
            </button>
            {availableModules.map((m) => (
              <button key={m} style={modBtn(filterModule === m)} onClick={() => setFilterModule(m)}>
                {m}
              </button>
            ))}
          </div>
        )}
        <TrainerFilterSelect trainers={availableTrainers} selected={filterTrainer} onSelect={setFilterTrainer} />
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px" }}>
          <span style={{ fontSize: "10px", fontWeight: 800, color: C.mutedLight, letterSpacing: "1.5px", textTransform: "uppercase", marginRight: "4px" }}>
            Zeitraum
          </span>
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ ...inpStyle, width: "auto", padding: "9px 12px", fontSize: "14px", colorScheme: "dark" }}
          />
          <span style={{ color: C.muted, fontSize: "13px" }}>bis</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ ...inpStyle, width: "auto", padding: "9px 12px", fontSize: "14px", colorScheme: "dark" }}
          />
          {(dateFrom || dateTo) && (
            <button
              style={{ ...ghost, fontSize: "12px", padding: "8px 14px" }}
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
            >
              Zurücksetzen
            </button>
          )}
        </div>

        <div style={{ ...card, padding: "18px 20px", marginBottom: "24px" }}>
          <span style={{ fontSize: "10px", fontWeight: 800, color: C.gold, letterSpacing: "1.5px", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>
            Export
          </span>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "13px", color: C.mutedLight, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={pdfSummary}
                onChange={(e) => setPdfSummary(e.target.checked)}
                style={{ accentColor: C.pink, cursor: "pointer" }}
              />
              Zusammenfassung
            </label>
            <label style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "13px", color: C.mutedLight, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={pdfEntries}
                onChange={(e) => setPdfEntries(e.target.checked)}
                style={{ accentColor: C.pink, cursor: "pointer" }}
              />
              Einzelfeedback
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginLeft: "auto" }}>
              <button
                style={{
                  ...ghost,
                  fontSize: "13px",
                  padding: "8px 16px",
                  color: C.text,
                  ...(filtered.length === 0 || pdfBusy || (!pdfSummary && !pdfEntries)
                    ? { opacity: 0.4, cursor: "not-allowed" }
                    : null),
                }}
                disabled={filtered.length === 0 || pdfBusy || (!pdfSummary && !pdfEntries)}
                onClick={handlePdfExport}
              >
                {pdfBusy ? "PDF wird erstellt…" : "Als PDF"}
              </button>
              <button
                style={{
                  ...ghost,
                  fontSize: "13px",
                  padding: "8px 16px",
                  color: C.text,
                  ...(filtered.length === 0 ? { opacity: 0.4, cursor: "not-allowed" } : null),
                }}
                disabled={filtered.length === 0}
                onClick={() => exportFeedbackCsv(filtered, exportMeta)}
              >
                Als CSV
              </button>
            </div>
          </div>
          <p style={{ color: C.muted, fontSize: "12px", margin: "10px 0 0" }}>
            {filtered.length === 0
              ? "Keine Einträge im aktuellen Filterstand."
              : `${filtered.length} ${filtered.length !== 1 ? "Einträge" : "Eintrag"} im Export (entspricht dem aktuellen Filterstand). Die Inhalte-Auswahl gilt für das PDF.`}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "28px" }}>
          {RATING_LABELS.map((r) => {
            const a = avg(r.id);
            return (
              <div key={r.id} style={{ ...card, padding: "16px", textAlign: "center", marginBottom: 0 }}>
                <div style={{ fontSize: "26px", fontWeight: 800, color: avgColor(parseFloat(a)) }}>{a || "–"}</div>
                <div style={{ fontSize: "11px", color: C.muted, marginTop: "4px" }}>{r.label}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
          <p style={{ color: "#444", fontSize: "12px", margin: 0 }}>
            {filtered.length} {filtered.length !== 1 ? "Antworten" : "Antwort"}
            {filterModule !== "all" ? " · " + filterModule : ""}
          </p>
          <button style={{ ...ghost, fontSize: "12px", padding: "6px 14px" }} onClick={onRefresh}>
            Aktualisieren
          </button>
        </div>

        {loadingData ? (
          <p style={{ color: C.muted }}>Lade Daten...</p>
        ) : filtered.length === 0 ? (
          <div style={{ ...card, textAlign: "center", padding: "48px" }}>
            <p style={{ color: C.muted }}>Noch keine Antworten vorhanden.</p>
          </div>
        ) : (
          filtered.map((entry, idx) => (
            <div key={idx} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  {entry.ausbildung && (
                    <span style={{ background: "rgba(135,205,203,0.15)", color: C.teal, borderRadius: "6px", padding: "3px 10px", fontSize: "12px", fontWeight: 700 }}>
                      {entry.ausbildung}
                    </span>
                  )}
                  {entry.module && (
                    <span style={{ background: "rgba(219,115,166,0.15)", color: C.pink, borderRadius: "6px", padding: "3px 10px", fontSize: "12px", fontWeight: 700 }}>
                      {entry.module}
                    </span>
                  )}
                  <span style={{ color: C.muted, fontSize: "12px" }}>
                    {entry.timestamp
                      ? new Date(entry.timestamp).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
                      : ""}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  {entry.trainer && <div style={{ color: C.teal, fontSize: "12px", fontWeight: 700 }}>{entry.trainer}</div>}
                  <div style={{ color: C.muted, fontSize: "12px" }}>{entry.name}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "18px" }}>
                {RATING_LABELS.map((r) => (
                  <div key={r.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ fontSize: "10px", color: C.muted, marginBottom: "6px" }}>{r.label}</div>
                    <div style={{ color: C.pink, fontSize: "14px", letterSpacing: "2px" }}>
                      {"★".repeat(entry.ratings[r.id])}
                      {"☆".repeat(5 - entry.ratings[r.id])}
                    </div>
                    {entry.followUps[r.id] && (
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", fontStyle: "italic", lineHeight: "1.4" }}>
                        &quot;{entry.followUps[r.id]}&quot;
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {(
                  [
                    ["Größte Erkenntnis", entry.openAnswers.erkenntnis],
                    ["Konkret ausprobieren", entry.openAnswers.ausprobieren],
                    ["Take-away", entry.openAnswers.takeaway],
                  ] as [string, string][]
                )
                  .filter(([, v]) => v)
                  .map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: "10px", color: C.muted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
                        {label}
                      </div>
                      <div style={{ fontSize: "14px", color: C.mutedLight, lineHeight: "1.6" }}>{val}</div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Screen>
  );
}
