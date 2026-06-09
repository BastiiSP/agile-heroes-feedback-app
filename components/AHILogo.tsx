"use client";

import { useTheme } from "./ThemeContext";

// Header-Logo. Quelle, Untertitel und Untertitel-Farbe kommen aus dem aktiven
// Theme. Ohne Provider gilt AHI (Wortmarke + türkises „INTELLIGENCE").
export default function AHILogo() {
  const theme = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={theme.logoSrc}
        alt={theme.logoAlt}
        style={{ height: "54px", width: "auto", display: "block" }}
      />
      <div>
        <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "2.5px", color: "#f0f0f0", lineHeight: 1.2 }}>
          {theme.logoLine1}
        </div>
        {theme.logoLine2 && (
          <div style={{ fontSize: "13px", fontWeight: 300, letterSpacing: "2.5px", color: theme.logoLine2Color, lineHeight: 1.2 }}>
            {theme.logoLine2}
          </div>
        )}
      </div>
    </div>
  );
}
