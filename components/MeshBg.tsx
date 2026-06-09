"use client";

import { useTheme } from "./ThemeContext";

// Dekorativer Mesh-Hintergrund (zwei radiale Gradienten). Rein dekorativ.
// Der Gradient stammt aus dem aktiven Theme; ohne Provider = AHI (unverändert).
export default function MeshBg() {
  const theme = useTheme();
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        background: theme.meshGradient,
      }}
    />
  );
}
