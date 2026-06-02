import { useEffect, useMemo, useRef, useState } from "react";
import { C } from "@/lib/constants";
import { inpStyle, modBtn } from "@/lib/styles";
import type { Trainer } from "@/lib/types";

// Vollname oben, optionaler Rufname darunter dezent in Anführungszeichen.
// Wird in der Trefferliste und im angepinnten Button wiederverwendet.
function TrainerLabel({ t, sel }: { t: Trainer; sel: boolean }) {
  return (
    <span style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.25 }}>
      <span>{t.name}</span>
      {t.rufname && (
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            marginTop: "2px",
            color: sel ? "rgba(255,255,255,0.8)" : C.muted,
          }}
        >
          &ldquo;{t.rufname}&rdquo;
        </span>
      )}
    </span>
  );
}

// Suchbarer Trainer-Picker für 20+ wachsende Einträge: Filter-Eingabe +
// scrollbare, gefilterte Trefferliste. Verhindert „Trainer nicht gefunden"-
// Abbrüche und ersetzt die flache Button-Reihe. Die Suche schlägt auf Vollname
// UND optionalen Rufname an; ausgewählt/gespeichert wird stets der Vollname.
export default function TrainerPicker({
  trainers,
  selected,
  onSelect,
  loading,
}: {
  trainers: Trainer[];
  selected: string;
  onSelect: (name: string) => void;
  loading: boolean;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trainers;
    return trainers.filter(
      (t) => t.name.toLowerCase().includes(q) || (t.rufname?.toLowerCase().includes(q) ?? false)
    );
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
        onSelect(filtered[activeIndex].name);
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
  // damit die Auswahl sichtbar bleibt. Das volle Trainer-Objekt holen, damit der
  // Rufname auch im angepinnten Button erscheint.
  const pinnedTrainer =
    selected && !filtered.some((t) => t.name === selected)
      ? trainers.find((t) => t.name === selected) ?? { name: selected }
      : null;

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
      {pinnedTrainer && (
        <div style={{ marginTop: "10px" }}>
          <button data-trainer style={modBtn(true)} onClick={() => onSelect(pinnedTrainer.name)}>
            <TrainerLabel t={pinnedTrainer} sel />
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
              key={t.name}
              data-trainer
              style={{
                ...modBtn(selected === t.name),
                ...(i === activeIndex && selected !== t.name ? { border: "1px solid " + C.teal } : null),
              }}
              onClick={() => onSelect(t.name)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <TrainerLabel t={t} sel={selected === t.name} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
