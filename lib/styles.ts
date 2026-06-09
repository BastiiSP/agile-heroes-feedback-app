// Geteilte Inline-Style-Objekte — 1:1 aus der ursprünglichen HTML.
// Bewusst Inline-Styles (kein UI-Kit), damit das Design identisch bleibt.

import type { CSSProperties } from "react";
import { C } from "./constants";

// Lesbare Textfarbe auf einer Button-Fläche. Helle Markenfarben (Gold sowie
// die GmbH-Kernfarben Grün/Gelb/Orange) brauchen dunklen Text; Pink/Türkis
// tragen weißen Text. Verhalten für Bestand identisch (vorher: nur Gold dunkel).
const DARK_TEXT_ON: string[] = [C.gold, C.green, C.yellow, C.orange];
export const textOn = (color: string): string =>
  DARK_TEXT_ON.includes(color) ? "#1a1a1a" : "#fff";

export const base: CSSProperties = {
  minHeight: "100vh",
  background: C.dark,
  fontFamily: "'Nunito', sans-serif",
  color: C.text,
  position: "relative",
};

export const wrap: CSSProperties = {
  maxWidth: "620px",
  margin: "0 auto",
  padding: "48px 24px 100px",
  position: "relative",
  zIndex: 1,
};

export const card: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "16px",
  padding: "32px",
  marginBottom: "14px",
};

export const lbl = (color?: string): CSSProperties => ({
  fontSize: "10px",
  fontWeight: 800,
  color: color || C.teal,
  letterSpacing: "2px",
  textTransform: "uppercase",
  marginBottom: "12px",
  display: "block",
});

export const qst: CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: C.text,
  marginBottom: "24px",
  lineHeight: "1.4",
};

export const fup: CSSProperties = {
  fontSize: "14px",
  color: C.mutedLight,
  marginTop: "24px",
  marginBottom: "10px",
  fontStyle: "italic",
  lineHeight: "1.5",
};

export const taStyle = (highlight?: boolean, color: string = C.gold): CSSProperties => ({
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  // color + "66" ≈ 40 % Deckkraft (0x66 = 102/255). Für Gold ergibt das den
  // bisherigen Wert rgba(232,192,122,0.4).
  border: "1px solid " + (highlight ? color + "66" : "rgba(255,255,255,0.1)"),
  borderRadius: "10px",
  padding: "14px 16px",
  color: C.text,
  fontSize: "15px",
  fontFamily: "'Nunito',sans-serif",
  resize: "vertical",
  minHeight: "100px",
  outline: "none",
  boxSizing: "border-box",
  lineHeight: "1.6",
});

export const inpStyle: CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  padding: "14px 16px",
  color: C.text,
  fontSize: "15px",
  fontFamily: "'Nunito',sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

export const btnPrimary = (color: string, disabled?: boolean): CSSProperties => ({
  background: disabled ? color + "55" : color,
  color: textOn(color),
  border: "none",
  borderRadius: "10px",
  padding: "14px 32px",
  fontSize: "15px",
  fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "'Nunito',sans-serif",
});

export const ghost: CSSProperties = {
  background: "transparent",
  color: C.muted,
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  padding: "14px 24px",
  fontSize: "15px",
  cursor: "pointer",
  fontFamily: "'Nunito',sans-serif",
};

export const modBtn = (sel?: boolean, color: string = C.pink): CSSProperties => ({
  background: sel ? color : "rgba(255,255,255,0.04)",
  color: sel ? textOn(color) : C.mutedLight,
  border: sel ? "1px solid " + color : "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  padding: "12px 14px",
  fontSize: "14px",
  fontWeight: sel ? 700 : 600,
  cursor: "pointer",
  textAlign: "center",
  transition: "all 0.15s",
  fontFamily: "'Nunito',sans-serif",
});
