import { useMemo, useState } from "react";
import { C } from "@/lib/constants";
import { inpStyle, modBtn } from "@/lib/styles";

// Kompakter, durchsuchbarer Trainer-Filter für das Dashboard (nach Vorbild des
// TrainerPickers im Wizard, aber ohne Anpinnen/Bestätigen): "Alle Trainer" als
// Standard, Suchfeld + scrollbare Trefferliste, Klick filtert sofort. Die Namen
// kommen aus den Feedback-Daten (Vollnamen, ohne Rufnamen).
export default function TrainerFilterSelect({
  trainers,
  selected,
  onSelect,
}: {
  trainers: string[];
  selected: string;
  onSelect: (trainer: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trainers;
    return trainers.filter((t) => t.toLowerCase().includes(q));
  }, [trainers, query]);

  // Den gewählten Trainer immer anzeigen, auch wenn er nicht zur Suche passt.
  const list =
    selected !== "all" && !filtered.includes(selected) && trainers.includes(selected)
      ? [selected, ...filtered]
      : filtered;

  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: list.length ? "8px" : 0 }}>
        <span style={{ fontSize: "10px", fontWeight: 800, color: C.pink, letterSpacing: "1.5px", textTransform: "uppercase", marginRight: "4px" }}>
          Trainer
        </span>
        <button style={modBtn(selected === "all")} onClick={() => onSelect("all")}>
          Alle Trainer
        </button>
        <input
          type="text"
          style={{ ...inpStyle, width: "auto", flex: 1, minWidth: "150px", padding: "10px 14px", fontSize: "14px" }}
          placeholder="Trainer suchen..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setQuery("");
            if (e.key === "Enter" && filtered.length === 1) onSelect(filtered[0]);
          }}
        />
      </div>
      {list.length === 0 ? (
        <p style={{ color: C.muted, fontStyle: "italic", fontSize: "13px", margin: "8px 0 0" }}>
          Keine Treffer für „{query.trim()}&quot;.
        </p>
      ) : (
        <div
          style={{
            maxHeight: "170px",
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
            gap: "8px",
            paddingRight: "4px",
          }}
        >
          {list.map((t) => (
            <button key={t} style={modBtn(selected === t)} onClick={() => onSelect(t)}>
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
