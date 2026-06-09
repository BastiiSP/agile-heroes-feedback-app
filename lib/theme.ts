// Marken-Themes für den Feedback-Wizard. Jede Marke definiert ihre drei
// Phasenfarben (setup/rating/reflexion), ihr Header-Logo und den dekorativen
// Mesh-Gradient. Das AHI-Theme bildet 1:1 das bisherige Erscheinungsbild ab
// und ist der Default (siehe ThemeContext).

import { C, PROGRAMS, type Phase, type BrandKey } from "./constants";

export interface Theme {
  key: BrandKey;
  // Phasenfarben
  setup: string;
  rating: string;
  reflexion: string;
  // Header-Logo
  logoSrc: string;
  logoAlt: string;
  logoLine1: string;
  logoLine2: string; // leer => zweite Zeile wird nicht gerendert
  logoLine2Color: string;
  // dekorativer Hintergrund-Gradient (komplettes CSS-`background`)
  meshGradient: string;
}

// Agile Heroes Intelligence – exakt das bisherige Design.
export const AHI_THEME: Theme = {
  key: "ahi",
  setup: C.teal,
  rating: C.pink,
  reflexion: C.gold,
  logoSrc: "/ahi-logo.svg",
  logoAlt: "Agile Heroes Intelligence",
  logoLine1: "AGILE HEROES",
  logoLine2: "INTELLIGENCE",
  logoLine2Color: C.teal,
  meshGradient:
    "radial-gradient(ellipse at 15% 20%, rgba(219,115,166,0.15) 0%, transparent 55%), radial-gradient(ellipse at 85% 75%, rgba(135,205,203,0.12) 0%, transparent 50%)",
};

// Agile Heroes GmbH – Grün/Gelb/Orange + rundes Logo.
export const AHG_THEME: Theme = {
  key: "ahg",
  setup: C.green,
  rating: C.orange,
  reflexion: C.yellow,
  logoSrc: "/agile-heroes-logo.png",
  logoAlt: "Agile Heroes",
  logoLine1: "AGILE HEROES",
  logoLine2: "", // GmbH: keine farbige Unterzeile, Logo ist das Markenzeichen
  logoLine2Color: C.green,
  meshGradient:
    "radial-gradient(ellipse at 15% 20%, rgba(205,232,106,0.15) 0%, transparent 55%), radial-gradient(ellipse at 85% 75%, rgba(254,175,72,0.12) 0%, transparent 50%)",
};

// Phasenfarbe für ein gegebenes Theme (ersetzt das harte phaseColor() im
// Wizard-Pfad, ohne phaseColor in constants.ts zu verändern).
export function phaseColorT(theme: Theme, phase: Phase): string {
  if (phase === "rating") return theme.rating;
  if (phase === "reflexion") return theme.reflexion;
  return theme.setup;
}

// Theme zur aktuell gewählten Ausbildung. Ohne Auswahl (oder unbekannte id)
// gilt das neutrale AHI-Default-Theme.
export function themeForProgramId(id: string): Theme {
  const program = PROGRAMS.find((p) => p.id === id);
  return program?.brand === "ahg" ? AHG_THEME : AHI_THEME;
}
