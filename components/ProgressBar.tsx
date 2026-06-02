import { TOTAL_STEPS, stepColor } from "@/lib/constants";

export default function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", gap: "4px", marginBottom: "40px" }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: "3px",
            borderRadius: "99px",
            background: i <= step ? stepColor(i) : "rgba(255,255,255,0.08)",
            opacity: i < step ? 0.5 : 1,
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  );
}
