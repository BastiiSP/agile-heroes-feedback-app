"use client";

import { createContext, useContext, type ReactNode } from "react";
import { AHI_THEME, type Theme } from "@/lib/theme";

// Default = AHI-Theme. Komponenten ohne umschließenden Provider (Dashboard,
// Login) erhalten dadurch automatisch das unveränderte AHI-Erscheinungsbild.
const ThemeContext = createContext<Theme>(AHI_THEME);

export function ThemeProvider({ value, children }: { value: Theme; children: ReactNode }) {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
