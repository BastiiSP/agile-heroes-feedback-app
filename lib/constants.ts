// Zentrale Konstanten & Design-Tokens der Feedback-App.
// 1:1 aus der ursprünglichen Single-File-HTML übernommen (Texte & Farben).

export const MODULES = [
  "PM",
  "Tool",
  "Automation",
  "Change",
  "Governance",
  "Strategy",
  "Karriere",
] as const;

export type RatingId = "inhalt" | "didaktik" | "gestaltung" | "trainer";
export type OpenQuestionId = "erkenntnis" | "ausprobieren" | "takeaway";

export interface RatingDef {
  id: RatingId;
  label: string;
  question: string;
  followUp: { low: string; mid: string; high: string };
}

// Bewertungsfragen der KI-Manager Ausbildung (KIMA) – Wording 1:1 wie bisher.
export const KIMA_RATINGS: RatingDef[] = [
  {
    id: "inhalt",
    label: "Inhalte",
    question: "Wie bewertest du die Inhalte dieses Moduls?",
    followUp: {
      low: "Was würdest du dir bei den Inhalten anders wünschen?",
      mid: "Was hätte die Inhalte für dich auf das 5-Sterne-Niveau gehoben?",
      high: "Was hat dich bei den Inhalten am meisten begeistert?",
    },
  },
  {
    id: "didaktik",
    label: "Didaktik",
    question: "Wie bewertest du die Didaktik dieses Moduls?",
    followUp: {
      low: "Was würdest du dir didaktisch anders wünschen?",
      mid: "Was hätte die Didaktik für dich auf das 5-Sterne-Niveau gehoben?",
      high: "Was hat didaktisch besonders gut funktioniert?",
    },
  },
  {
    id: "gestaltung",
    label: "Aufbau & Visualisierung",
    question: "Wie bewertest du den Aufbau und die Visualisierung der Lerninhalte?",
    followUp: {
      low: "Was würdest du dir bei der Gestaltung anders wünschen?",
      mid: "Was hätte den Aufbau für dich auf das 5-Sterne-Niveau gehoben?",
      high: "Was hat dir an der Gestaltung besonders gut gefallen?",
    },
  },
  {
    id: "trainer",
    label: "Trainer",
    question: "Wie bewertest du deinen Trainer in diesem Modul?",
    followUp: {
      low: "Was würdest du dir vom Trainer anders wünschen?",
      mid: "Was hätte dein Trainer tun müssen, um das 5-Sterne-Niveau zu erreichen?",
      high: "Was hat dein Trainer in diesem Modul besonders stark gemacht?",
    },
  },
];

// Bewertungsfragen der AI Automation Engineer Ausbildung (AIAE) –
// gleiche IDs, aber Wording ohne „Modul" (spricht von „Training").
export const AIAE_RATINGS: RatingDef[] = [
  {
    id: "inhalt",
    label: "Inhalte",
    question: "Wie bewertest du die Inhalte dieses Trainings?",
    followUp: {
      low: "Was würdest du dir bei den Inhalten anders wünschen?",
      mid: "Was hätte die Inhalte für dich auf das 5-Sterne-Niveau gehoben?",
      high: "Was hat dich bei den Inhalten am meisten begeistert?",
    },
  },
  {
    id: "didaktik",
    label: "Didaktik",
    question: "Wie bewertest du die Didaktik dieses Trainings?",
    followUp: {
      low: "Was würdest du dir didaktisch anders wünschen?",
      mid: "Was hätte die Didaktik für dich auf das 5-Sterne-Niveau gehoben?",
      high: "Was hat didaktisch besonders gut funktioniert?",
    },
  },
  {
    id: "gestaltung",
    label: "Aufbau & Visualisierung",
    question: "Wie bewertest du den Aufbau und die Visualisierung der Lerninhalte?",
    followUp: {
      low: "Was würdest du dir bei der Gestaltung anders wünschen?",
      mid: "Was hätte den Aufbau für dich auf das 5-Sterne-Niveau gehoben?",
      high: "Was hat dir an der Gestaltung besonders gut gefallen?",
    },
  },
  {
    id: "trainer",
    label: "Trainer",
    question: "Wie bewertest du deinen Trainer in diesem Training?",
    followUp: {
      low: "Was würdest du dir vom Trainer anders wünschen?",
      mid: "Was hätte dein Trainer tun müssen, um das 5-Sterne-Niveau zu erreichen?",
      high: "Was hat dein Trainer in diesem Training besonders stark gemacht?",
    },
  },
];

export interface OpenQuestionDef {
  id: OpenQuestionId;
  q: string;
}

export const KIMA_OPEN: OpenQuestionDef[] = [
  { id: "erkenntnis", q: "Was ist deine größte persönliche Erkenntnis aus diesem Modul?" },
  { id: "ausprobieren", q: "Was wirst du konkret ausprobieren oder umsetzen?" },
  { id: "takeaway", q: "Was nimmst du als zukünftiger KI-Manager aus diesem Modul mit?" },
];

export const AIAE_OPEN: OpenQuestionDef[] = [
  { id: "erkenntnis", q: "Was ist deine größte persönliche Erkenntnis aus diesem Training?" },
  { id: "ausprobieren", q: "Was wirst du konkret ausprobieren oder umsetzen?" },
  { id: "takeaway", q: "Was nimmst du als AI Automation Engineer aus diesem Training mit?" },
];

// Eine Ausbildung bündelt ihre Module und ihre (gewordeten) Fragesätze.
// Der AIAE-Pfad hat aktuell keine Module – das Hinzufügen von Modulen ist
// die einzige nötige Änderung, damit er einen Modul-Schritt erhält.
export interface ProgramDef {
  id: string;
  label: string;
  modules: readonly string[];
  ratings: RatingDef[];
  openQuestions: OpenQuestionDef[];
}

export const PROGRAMS: ProgramDef[] = [
  {
    id: "ki-manager",
    label: "KI-Manager Ausbildung",
    modules: MODULES,
    ratings: KIMA_RATINGS,
    openQuestions: KIMA_OPEN,
  },
  {
    id: "ai-automation",
    label: "AI Automation Engineer",
    modules: [],
    ratings: AIAE_RATINGS,
    openQuestions: AIAE_OPEN,
  },
];

// ── Dynamische Wizard-Schritte ──────────────────────────────────────────────
// Statt fester Indizes wird die Schrittfolge aus dem State abgeleitet. Der
// Modul-Schritt entfällt automatisch, wenn die Ausbildung keine Module hat.

export type StepKind = "program" | "module" | "trainer" | "rating" | "open" | "name";

export type Step =
  | { kind: "program" }
  | { kind: "module" }
  | { kind: "trainer" }
  | { kind: "rating"; rating: RatingDef }
  | { kind: "open"; question: OpenQuestionDef }
  | { kind: "name" };

export function buildSteps(program?: ProgramDef): Step[] {
  const steps: Step[] = [{ kind: "program" }];
  if (!program) return steps;
  if (program.modules.length > 0) steps.push({ kind: "module" });
  steps.push({ kind: "trainer" });
  program.ratings.forEach((rating) => steps.push({ kind: "rating", rating }));
  program.openQuestions.forEach((question) => steps.push({ kind: "open", question }));
  steps.push({ kind: "name" });
  return steps;
}

// ── Phasen (für Farben, ProgressBar & Themen-Navigation) ─────────────────────

export type Phase = "setup" | "rating" | "reflexion";

export function phaseOf(kind: StepKind): Phase {
  if (kind === "rating") return "rating";
  if (kind === "open" || kind === "name") return "reflexion";
  return "setup"; // program | module | trainer
}

// Farbpalette
export const C = {
  pink: "#db73a6",
  teal: "#87cdcb",
  gold: "#e8c07a",
  dark: "#212121",
  text: "#f0f0f0",
  muted: "#888",
  mutedLight: "#bbb",
} as const;

export function phaseColor(phase: Phase): string {
  if (phase === "rating") return C.pink;
  if (phase === "reflexion") return C.gold;
  return C.teal;
}

export function stepColorForKind(kind: StepKind): string {
  return phaseColor(phaseOf(kind));
}
