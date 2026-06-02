// Header-Logo. Das SVG liegt als statisches Asset unter /public/ahi-logo.svg
// (statt wie früher als ~20 KB Inline-base64).
export default function AHILogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ahi-logo.svg"
        alt="Agile Heroes Intelligence"
        style={{ height: "54px", width: "auto", display: "block" }}
      />
      <div>
        <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "2.5px", color: "#f0f0f0", lineHeight: 1.2 }}>
          AGILE HEROES
        </div>
        <div style={{ fontSize: "13px", fontWeight: 300, letterSpacing: "2.5px", color: "#87cdcb", lineHeight: 1.2 }}>
          INTELLIGENCE
        </div>
      </div>
    </div>
  );
}
