import { C, MODULES, PROGRAMS, KIMA_RATINGS, type RatingId } from "@/lib/constants";
import { wrap, card, ghost, modBtn } from "@/lib/styles";
import type { FeedbackItem } from "@/lib/types";
import Screen from "./Screen";
import AHILogo from "./AHILogo";

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
  const filtered = feedbackData.filter(
    (f) =>
      (filterAusbildung === "all" || f.ausbildung === filterAusbildung) &&
      (filterModule === "all" || f.module === filterModule) &&
      (filterTrainer === "all" || f.trainer === filterTrainer)
  );
  const availableTrainers = [...new Set(feedbackData.map((f) => f.trainer).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "de")
  );
  const avg = (key: RatingId) => {
    const v = filtered.filter((f) => f.ratings[key] > 0);
    if (!v.length) return "";
    return (v.reduce((a, b) => a + b.ratings[key], 0) / v.length).toFixed(1);
  };
  const avgColor = (a: string) => {
    const n = parseFloat(a);
    if (isNaN(n)) return C.muted;
    if (n >= 4.1) return "#6ee7b7";
    if (n >= 3.0) return "#f0a86b";
    return "#ef4444";
  };

  return (
    <Screen>
      <div style={wrap}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <AHILogo />
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
          <button style={modBtn(filterAusbildung === "all")} onClick={() => setFilterAusbildung("all")}>
            Alle
          </button>
          {PROGRAMS.map((p) => (
            <button key={p.id} style={modBtn(filterAusbildung === p.label)} onClick={() => setFilterAusbildung(p.label)}>
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
          <span style={{ fontSize: "10px", fontWeight: 800, color: C.teal, letterSpacing: "1.5px", textTransform: "uppercase", alignSelf: "center", marginRight: "4px" }}>
            Modul
          </span>
          <button style={modBtn(filterModule === "all")} onClick={() => setFilterModule("all")}>
            Alle
          </button>
          {MODULES.map((m) => (
            <button key={m} style={modBtn(filterModule === m)} onClick={() => setFilterModule(m)}>
              {m}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
          <span style={{ fontSize: "10px", fontWeight: 800, color: C.pink, letterSpacing: "1.5px", textTransform: "uppercase", alignSelf: "center", marginRight: "4px" }}>
            Trainer
          </span>
          <button style={modBtn(filterTrainer === "all")} onClick={() => setFilterTrainer("all")}>
            Alle
          </button>
          {availableTrainers.map((t) => (
            <button key={t} style={modBtn(filterTrainer === t)} onClick={() => setFilterTrainer(t)}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "28px" }}>
          {RATING_LABELS.map((r) => {
            const a = avg(r.id);
            return (
              <div key={r.id} style={{ ...card, padding: "16px", textAlign: "center", marginBottom: 0 }}>
                <div style={{ fontSize: "26px", fontWeight: 800, color: avgColor(a) }}>{a || "–"}</div>
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
