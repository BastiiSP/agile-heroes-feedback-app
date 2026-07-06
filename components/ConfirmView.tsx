import { C } from "@/lib/constants";
import { useTheme } from "./ThemeContext";
import { wrap, ghost, btnPrimary } from "@/lib/styles";
import Screen from "./Screen";
import AHILogo from "./AHILogo";

export default function ConfirmView({
  submitting,
  error,
  onBack,
  onSubmit,
}: {
  submitting: boolean;
  error?: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const theme = useTheme();
  return (
    <Screen>
      <div style={{ ...wrap, textAlign: "center", paddingTop: "80px" }}>
        <AHILogo />
        <div style={{ marginBottom: "28px" }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke={theme.reflexion} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={theme.reflexion} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{ fontSize: "10px", fontWeight: 800, color: theme.reflexion, letterSpacing: "2px", textTransform: "uppercase" }}>Letzter Schritt</span>
        <h1 style={{ fontSize: "26px", fontWeight: 800, margin: "12px 0 16px" }}>Bereit zum Absenden?</h1>
        <p style={{ fontSize: "16px", color: C.muted, lineHeight: "1.7", maxWidth: "400px", margin: "0 auto 16px" }}>
          Dein Feedback ist vollständig. Ein Klick, und du machst die Ausbildung besser.
        </p>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)", marginBottom: "16px" }}>
          Du kannst auch nochmal zurückgehen und etwas anpassen.
        </p>
        <p style={{ fontSize: "13px", color: C.muted, lineHeight: "1.6", maxWidth: "400px", margin: error ? "0 auto 20px" : "0 auto 40px" }}>
          Mit Klick auf „Feedback absenden“ stimmst du zu, dass dein Feedback an die Trainer:innen weitergegeben werden kann.
        </p>
        {error && (
          <p style={{ fontSize: "15px", color: C.pink, fontWeight: 700, lineHeight: "1.6", maxWidth: "400px", margin: "0 auto 28px" }}>
            Dein Feedback konnte gerade nicht gespeichert werden. Deine Eingaben sind erhalten – bitte versuche es noch einmal.
          </p>
        )}
        <div style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
          <button style={ghost} onClick={onBack}>Zurück</button>
          <button
            className="pulse"
            style={{ ...btnPrimary(theme.reflexion, submitting), padding: "16px 40px", fontSize: "16px", borderRadius: "10px" }}
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? "Wird gesendet..." : "Feedback absenden"}
          </button>
        </div>
      </div>
    </Screen>
  );
}
