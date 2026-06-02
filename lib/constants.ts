// Zentrale Konstanten & Design-Tokens der Feedback-App.
// 1:1 aus der ursprünglichen Single-File-HTML übernommen.

export const MODULES = [
  "PM",
  "Tool",
  "Automation",
  "Change",
  "Governance",
  "Strategy",
  "Karriere",
] as const;

export const TOTAL_STEPS = 10;

export type RatingId = "inhalt" | "didaktik" | "gestaltung" | "trainer";
export type OpenQuestionId = "erkenntnis" | "ausprobieren" | "takeaway";

export interface RatingDef {
  id: RatingId;
  label: string;
  question: string;
  followUp: { low: string; mid: string; high: string };
}

export const RATINGS: RatingDef[] = [
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

export interface OpenQuestionDef {
  id: OpenQuestionId;
  q: string;
}

export const OPEN_QUESTIONS: OpenQuestionDef[] = [
  { id: "erkenntnis", q: "Was ist deine größte persönliche Erkenntnis aus diesem Modul?" },
  { id: "ausprobieren", q: "Was wirst du konkret ausprobieren oder umsetzen?" },
  { id: "takeaway", q: "Was nimmst du als zukünftiger KI-Manager aus diesem Modul mit?" },
];

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

export function stepColor(step: number): string {
  if (step <= 1) return C.teal;
  if (step <= 5) return C.pink;
  return C.gold;
}
