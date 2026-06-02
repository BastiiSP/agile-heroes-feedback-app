import { C, phaseColor, phaseOf, type Step } from "@/lib/constants";

// Detaillierte Themen-/Kategorien-Leiste: gibt Orientierung, welche Themen die
// Fragen abdecken und wo man gerade steht. Ableitung aus dem (variablen)
// Step-Array, damit zusätzliche Module/Fragen automatisch erscheinen.
//   Setup · Inhalte · Didaktik · Aufbau · Trainer · Reflexion

interface Category {
  key: string;
  label: string;
  color: string;
}

// Jedem Schritt einen Kategorie-Schlüssel zuordnen.
function bucketKey(step: Step): string {
  if (step.kind === "rating") return "rating:" + step.rating.id;
  if (step.kind === "open" || step.kind === "name") return "reflexion";
  return "setup"; // program | module | trainer
}

function bucketLabel(step: Step): string {
  if (step.kind === "rating") return step.rating.label.split(" & ")[0]; // „Aufbau & Visualisierung" → „Aufbau"
  if (step.kind === "open" || step.kind === "name") return "Reflexion";
  return "Setup";
}

export default function TopicNav({ steps, step }: { steps: Step[]; step: number }) {
  // Geordnete, eindeutige Kategorien aufbauen.
  const categories: Category[] = [];
  steps.forEach((s) => {
    const key = bucketKey(s);
    if (!categories.some((c) => c.key === key)) {
      categories.push({ key, label: bucketLabel(s), color: phaseColor(phaseOf(s.kind)) });
    }
  });

  const activeKey = bucketKey(steps[step]);
  const activeIndex = categories.findIndex((c) => c.key === activeKey);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginBottom: "16px" }}>
      {categories.map((cat, i) => {
        const active = i === activeIndex;
        const done = i < activeIndex;
        return (
          <div key={cat.key} style={{ display: "flex", flexDirection: "column", gap: "5px", flex: "1 1 auto", minWidth: "54px" }}>
            <span
              style={{
                fontSize: "10px",
                fontWeight: active ? 800 : 700,
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                color: active ? cat.color : done ? C.mutedLight : C.muted,
                transition: "color 0.3s",
              }}
            >
              {cat.label}
            </span>
            <span
              style={{
                height: "2px",
                borderRadius: "99px",
                background: active || done ? cat.color : "rgba(255,255,255,0.08)",
                opacity: done && !active ? 0.5 : 1,
                transition: "background 0.3s, opacity 0.3s",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
