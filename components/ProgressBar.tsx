"use client";

import { phaseOf, type Step } from "@/lib/constants";
import { phaseColorT } from "@/lib/theme";
import { useTheme } from "./ThemeContext";

export default function ProgressBar({ steps, step }: { steps: Step[]; step: number }) {
  const theme = useTheme();
  return (
    <div style={{ display: "flex", gap: "4px", marginBottom: "40px" }}>
      {steps.map((s, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: "3px",
            borderRadius: "99px",
            background: i <= step ? phaseColorT(theme, phaseOf(s.kind)) : "rgba(255,255,255,0.08)",
            opacity: i < step ? 0.5 : 1,
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  );
}
