import { AHI_THEME, AHG_THEME } from "@/lib/theme";

// Doppel-Logo für den Startbildschirm (Programmauswahl, noch keine Ausbildung
// gewählt): beide Marken-Embleme nebeneinander unter einem gemeinsamen
// „AGILE HEROES"-Wortzug. Sobald eine Ausbildung gewählt ist, übernimmt wieder
// das marken­abhängige <AHILogo /> (siehe FeedbackWizard).
export default function DualLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={AHI_THEME.logoSrc}
          alt={AHI_THEME.logoAlt}
          style={{ height: "54px", width: "auto", display: "block" }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={AHG_THEME.logoSrc}
          alt={AHG_THEME.logoAlt}
          style={{ height: "54px", width: "auto", display: "block" }}
        />
      </div>
      <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "2.5px", color: "#f0f0f0", lineHeight: 1.2 }}>
        AGILE HEROES
      </div>
    </div>
  );
}
