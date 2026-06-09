import { C } from "@/lib/constants";
import { useTheme } from "./ThemeContext";
import { wrap, ghost } from "@/lib/styles";
import Screen from "./Screen";
import AHILogo from "./AHILogo";

export default function ThanksView({ onReset }: { onReset: () => void }) {
  const theme = useTheme();
  return (
    <Screen>
      <div style={{ ...wrap, textAlign: "center", paddingTop: "80px" }}>
        <AHILogo />
        <div style={{ marginBottom: "28px" }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={theme.setup} strokeWidth="1.5" />
            <path d="M8 12L11 15L16 9" stroke={theme.setup} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "16px" }}>Vielen herzlichen Dank!</h1>
        <p style={{ fontSize: "16px", color: C.muted, lineHeight: "1.75", maxWidth: "440px", margin: "0 auto 36px" }}>
          Dein Feedback hilft uns dabei, unsere Ausbildungen kontinuierlich zu verbessern und noch wertvoller zu gestalten – für dich und alle zukünftigen Teilnehmer. Das bedeutet uns wirklich viel.
        </p>
        <div style={{ display: "inline-block", padding: "16px 24px", background: theme.setup + "14", border: "1px solid " + theme.setup + "33", borderRadius: "12px", marginBottom: "36px" }}>
          <p style={{ color: theme.setup, fontWeight: 700, margin: 0, fontSize: "15px" }}>Das Agile Heroes Team</p>
        </div>
        <div>
          <button style={ghost} onClick={onReset}>Neues Feedback geben</button>
        </div>
      </div>
    </Screen>
  );
}
