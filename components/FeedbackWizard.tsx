import {
  C,
  MODULES,
  RATINGS,
  OPEN_QUESTIONS,
  stepColor,
  type RatingId,
  type OpenQuestionId,
} from "@/lib/constants";
import { wrap, card, lbl, qst, fup, taStyle, inpStyle, btnPrimary, ghost, modBtn } from "@/lib/styles";
import type { Ratings, FollowUps, OpenAnswers } from "@/lib/types";
import Screen from "./Screen";
import AHILogo from "./AHILogo";
import ProgressBar from "./ProgressBar";
import StarRating from "./StarRating";
import TrainerIcon from "./TrainerIcon";

const getFollowUpType = (score: number): "low" | "mid" | "high" =>
  score <= 3 ? "low" : score === 4 ? "mid" : "high";

export default function FeedbackWizard({
  step,
  selectedModule,
  onSelectModule,
  selectedTrainer,
  setSelectedTrainer,
  trainerList,
  loadingTrainers,
  ratings,
  onRateChange,
  followUps,
  setFollowUp,
  openAnswers,
  setOpenAnswer,
  name,
  setName,
  ok,
  onNext,
  onBack,
  onOpenTrainerLogin,
}: {
  step: number;
  selectedModule: string;
  onSelectModule: (m: string) => void;
  selectedTrainer: string;
  setSelectedTrainer: (t: string) => void;
  trainerList: string[];
  loadingTrainers: boolean;
  ratings: Ratings;
  onRateChange: (id: RatingId, value: number) => void;
  followUps: FollowUps;
  setFollowUp: (id: RatingId, value: string) => void;
  openAnswers: OpenAnswers;
  setOpenAnswer: (id: OpenQuestionId, value: string) => void;
  name: string;
  setName: (value: string) => void;
  ok: boolean;
  onNext: () => void;
  onBack: () => void;
  onOpenTrainerLogin: () => void;
}) {
  const color = stepColor(step);

  const NavRow = ({
    label,
    navColor,
    disabled,
    showBack = true,
  }: {
    label: string;
    navColor: string;
    disabled: boolean;
    showBack?: boolean;
  }) => (
    <div style={{ display: "flex", justifyContent: showBack ? "space-between" : "flex-end", marginTop: "24px" }}>
      {showBack && (
        <button style={ghost} onClick={onBack}>
          Zurück
        </button>
      )}
      <button style={btnPrimary(navColor, disabled)} onClick={onNext}>
        {label}
      </button>
    </div>
  );

  return (
    <Screen>
      {step === 0 && <TrainerIcon onClick={onOpenTrainerLogin} />}
      <div style={wrap}>
        <AHILogo />
        <ProgressBar step={step} />

        {step === 0 && (
          <div style={card}>
            <span style={lbl(C.teal)}>Modul auswählen</span>
            <p style={qst}>Welches Modul hast du gerade abgeschlossen?</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: "10px" }}>
              {MODULES.map((m) => (
                <button key={m} style={modBtn(selectedModule === m)} onClick={() => onSelectModule(m)}>
                  {m}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button style={btnPrimary(C.teal, !ok)} onClick={onNext}>
                Weiter
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={card}>
            <span style={lbl(C.teal)}>Trainer auswählen</span>
            <p style={qst}>Wer hat dich in diesem Modul als Trainer begleitet?</p>
            {loadingTrainers ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: C.muted, fontSize: "14px" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "16px",
                    height: "16px",
                    border: "2px solid " + C.teal,
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Trainer werden geladen...
              </div>
            ) : trainerList.length === 0 ? (
              <p style={{ color: C.muted, fontStyle: "italic", fontSize: "14px" }}>
                Keine Trainer für dieses Modul hinterlegt.
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "10px" }}>
                {trainerList.map((t) => (
                  <button key={t} style={modBtn(selectedTrainer === t)} onClick={() => setSelectedTrainer(t)}>
                    {t}
                  </button>
                ))}
              </div>
            )}
            <NavRow label="Weiter" navColor={C.teal} disabled={!ok} />
          </div>
        )}

        {step >= 2 && step <= 5 && (() => {
          const r = RATINGS[step - 2];
          const score = ratings[r.id];
          const type = score > 0 ? getFollowUpType(score) : null;
          const followupFilled = followUps[r.id].trim() !== "";
          return (
            <div style={card}>
              <span style={lbl(C.pink)}>{r.label}</span>
              <p style={qst}>{r.question}</p>
              <StarRating value={score} onChange={(v) => onRateChange(r.id, v)} />
              {type ? (
                <>
                  <p style={fup}>{r.followUp[type]}</p>
                  <textarea
                    style={taStyle(!followupFilled)}
                    placeholder="Deine Antwort (Pflichtfeld)..."
                    value={followUps[r.id]}
                    onChange={(e) => setFollowUp(r.id, e.target.value)}
                  />
                </>
              ) : (
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", marginTop: "20px", fontStyle: "italic" }}>
                  Bitte wähle zunächst eine Bewertung aus.
                </p>
              )}
              <NavRow label="Weiter" navColor={C.pink} disabled={!ok} />
            </div>
          );
        })()}

        {step >= 6 && step <= 8 && (() => {
          const q = OPEN_QUESTIONS[step - 6];
          const filled = openAnswers[q.id].trim() !== "";
          return (
            <div style={card}>
              <span style={lbl(C.gold)}>Deine Reflexion</span>
              <p style={qst}>{q.q}</p>
              <textarea
                style={taStyle(!filled)}
                placeholder="Deine Antwort (Pflichtfeld)..."
                value={openAnswers[q.id]}
                onChange={(e) => setOpenAnswer(q.id, e.target.value)}
              />
              <NavRow label="Weiter" navColor={C.gold} disabled={!ok} />
            </div>
          );
        })()}

        {step === 9 && (
          <div style={card}>
            <span style={lbl(C.gold)}>Fast geschafft</span>
            <p style={qst}>Möchtest du deinen Namen hinterlassen?</p>
            <p style={{ fontSize: "14px", color: C.muted, marginBottom: "16px", lineHeight: "1.6" }}>
              Dein Feedback ist standardmäßig anonym. Du kannst deinen Namen freiwillig angeben.
            </p>
            <input
              type="text"
              style={inpStyle}
              placeholder="Dein Name (optional)..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <NavRow label={name.trim() ? "Weiter" : "Überspringen"} navColor={C.gold} disabled={false} />
          </div>
        )}
      </div>
    </Screen>
  );
}
