import { C } from "@/lib/constants";
import { wrap, inpStyle, btnPrimary, ghost } from "@/lib/styles";
import Screen from "./Screen";
import AHILogo from "./AHILogo";

export default function TrainerLogin({
  password,
  onPasswordChange,
  error,
  onLogin,
  onBack,
}: {
  password: string;
  onPasswordChange: (value: string) => void;
  error: boolean;
  onLogin: () => void;
  onBack: () => void;
}) {
  return (
    <Screen>
      <div style={{ ...wrap, maxWidth: "420px" }}>
        <div style={{ paddingTop: "80px" }}>
          <AHILogo />
          <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "8px" }}>Trainer-Zugang</h1>
          <p style={{ fontSize: "15px", color: C.muted, marginBottom: "28px" }}>
            Bitte gib das Passwort ein, um zur Feedback-Auswertung zu gelangen.
          </p>
          <input
            type="password"
            style={inpStyle}
            placeholder="Passwort"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onLogin()}
          />
          {error && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "8px" }}>Falsches Passwort.</p>}
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button style={btnPrimary(C.teal, false)} onClick={onLogin}>Anmelden</button>
            <button style={ghost} onClick={onBack}>Zurück</button>
          </div>
        </div>
      </div>
    </Screen>
  );
}
