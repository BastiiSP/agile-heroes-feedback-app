// Unauffälliges Schloss-Icon unten rechts → öffnet den Trainer-Login.
export default function TrainerIcon({ onClick }: { onClick: () => void }) {
  return (
    <div
      style={{ position: "fixed", bottom: "24px", right: "28px", zIndex: 10, cursor: "pointer", opacity: 0.2 }}
      onClick={onClick}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="12" rx="2" stroke="#888" strokeWidth="1.8" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#888" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1.5" fill="#888" />
      </svg>
    </div>
  );
}
