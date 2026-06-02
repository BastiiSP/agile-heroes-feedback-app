import { useEffect, useMemo, useRef, useState } from "react";
import { C } from "@/lib/constants";
import { inpStyle, modBtn } from "@/lib/styles";

// Suchbarer Trainer-Picker für 20+ wachsende Einträge: Filter-Eingabe +
// scrollbare, gefilterte Trefferliste. Verhindert „Trainer nicht gefunden"-
// Abbrüche und ersetzt die flache Button-Reihe.
export default function TrainerPicker({
  trainers,
  selected,
  onSelect,
  loading,
}: {
  trainers: string[];
  selected: string;
  onSelect: (t: string) => void;
  loading: boolean;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trainers;
    return trainers.filter((t) => t.toLowerCase().includes(q));
  }, [trainers, query]);

  // Aktives (per Tastatur markiertes) Item in den sichtbaren Bereich scrollen.
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const node = listRef.current.querySelectorAll<HTMLElement>("[data-trainer]")[activeIndex];
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        e.preventDefault();
        onSelect(filtered[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setQuery("");
      setActiveIndex(-1);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "12px", color: C.muted, fontSize: "14px" }}>
        <span
          style={{
            display: "inline-block",
            width: "16px",
            height: "16px",
            border: "2px solid " + C.teal,
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        Trainer werden geladen...
      </div>
    );
  }

  if (trainers.length === 0) {
    return (
      <p style={{ color: C.muted, fontStyle: "italic", fontSize: "14px" }}>
        Keine Trainer verfügbar.
      </p>
    );
  }

  // Gewähltes Item, das durch die Suche herausgefiltert wurde, oben anpinnen,
  // damit die Auswahl sichtbar bleibt.
  const pinnedSelected = selected && !filtered.includes(selected) ? selected : null;

  return (
    <div>
      <input
        type="text"
        style={inpStyle}
        placeholder="Trainer suchen..."
        value={query}
        autoFocus
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
      />
      {pinnedSelected && (
        <div style={{ marginTop: "10px" }}>
          <button data-trainer style={modBtn(true)} onClick={() => onSelect(pinnedSelected)}>
            {pinnedSelected}
          </button>
        </div>
      )}
      {filtered.length === 0 ? (
        <p style={{ color: C.muted, fontStyle: "italic", fontSize: "14px", marginTop: "14px" }}>
          Keine Treffer für „{query.trim()}".
        </p>
      ) : (
        <div
          ref={listRef}
          style={{
            maxHeight: "280px",
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
            gap: "10px",
            marginTop: "14px",
            paddingRight: "4px",
          }}
        >
          {filtered.map((t, i) => (
            <button
              key={t}
              data-trainer
              style={{
                ...modBtn(selected === t),
                ...(i === activeIndex && selected !== t ? { border: "1px solid " + C.teal } : null),
              }}
              onClick={() => onSelect(t)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
