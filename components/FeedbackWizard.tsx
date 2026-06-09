import {
  C,
  PROGRAMS,
  phaseOf,
  type Step,
  type RatingId,
  type OpenQuestionId,
} from "@/lib/constants";
import { phaseColorT } from "@/lib/theme";
import { useTheme } from "./ThemeContext";
import { wrap, card, lbl, qst, fup, taStyle, inpStyle, btnPrimary, ghost, modBtn } from "@/lib/styles";
import type { Ratings, FollowUps, OpenAnswers, Trainer } from "@/lib/types";
import Screen from "./Screen";
import AHILogo from "./AHILogo";
import DualLogo from "./DualLogo";
import ProgressBar from "./ProgressBar";
import TopicNav from "./TopicNav";
import StarRating from "./StarRating";
import TrainerPicker from "./TrainerPicker";
import TrainerIcon from "./TrainerIcon";

const getFollowUpType = (score: number): "low" | "mid" | "high" =>
  score <= 3 ? "low" : score === 4 ? "mid" : "high";

export default function FeedbackWizard({
  steps,
  step,
  selectedProgram,
  onSelectProgram,
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
  steps: Step[];
  step: number;
  selectedProgram: string;
  onSelectProgram: (id: string) => void;
  selectedModule: string;
  onSelectModule: (m: string) => void;
  selectedTrainer: string;
  setSelectedTrainer: (t: string) => void;
  trainerList: Trainer[];
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
  const theme = useTheme();
  const current = steps[step];
  const color = phaseColorT(theme, phaseOf(current.kind));
  const currentProgram = PROGRAMS.find((p) => p.id === selectedProgram);

  const NavRow = ({ label }: { label: string }) => (
    <div style={{ display: "flex", justifyContent: step > 0 ? "space-between" : "flex-end", marginTop: "24px" }}>
      {step > 0 && (
        <button style={ghost} onClick={onBack}>
          Zurück
        </button>
      )}
      <button style={btnPrimary(color, !ok)} onClick={onNext}>
        {label}
      </button>
    </div>
  );

  return (
    <Screen>
      {current.kind === "program" && <TrainerIcon onClick={onOpenTrainerLogin} />}
      <div style={wrap}>
        {current.kind === "program" && !selectedProgram ? <DualLogo /> : <AHILogo />}
        <TopicNav steps={steps} step={step} />
        <ProgressBar steps={steps} step={step} />

        {current.kind === "program" && (
          <div style={card}>
            <span style={lbl(theme.setup)}>Ausbildung auswählen</span>
            <p style={qst}>Welche Ausbildung absolvierst du gerade?</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "10px" }}>
              {PROGRAMS.map((p) => (
                <button key={p.id} style={modBtn(selectedProgram === p.id, theme.rating)} onClick={() => onSelectProgram(p.id)}>
                  {p.label}
                </button>
              ))}
            </div>
            <NavRow label="Weiter" />
          </div>
        )}

        {current.kind === "module" && (
          <div style={card}>
            <span style={lbl(theme.setup)}>Modul auswählen</span>
            <p style={qst}>Welches Modul hast du gerade abgeschlossen?</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: "10px" }}>
              {(currentProgram?.modules ?? []).map((m) => (
                <button key={m} style={modBtn(selectedModule === m, theme.rating)} onClick={() => onSelectModule(m)}>
                  {m}
                </button>
              ))}
            </div>
            <NavRow label="Weiter" />
          </div>
        )}

        {current.kind === "trainer" && (
          <div style={card}>
            <span style={lbl(theme.setup)}>Trainer auswählen</span>
            <p style={qst}>Wer hat dich als Trainer begleitet?</p>
            <TrainerPicker
              trainers={trainerList}
              selected={selectedTrainer}
              onSelect={setSelectedTrainer}
              loading={loadingTrainers}
            />
            <NavRow label="Weiter" />
          </div>
        )}

        {current.kind === "rating" && (() => {
          const r = current.rating;
          const score = ratings[r.id];
          const type = score > 0 ? getFollowUpType(score) : null;
          const followupFilled = followUps[r.id].trim() !== "";
          return (
            <div style={card}>
              <span style={lbl(theme.rating)}>{r.label}</span>
              <p style={qst}>{r.question}</p>
              <StarRating value={score} onChange={(v) => onRateChange(r.id, v)} />
              {type ? (
                <>
                  <p style={fup}>{r.followUp[type]}</p>
                  <textarea
                    style={taStyle(!followupFilled, theme.reflexion)}
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
              <NavRow label="Weiter" />
            </div>
          );
        })()}

        {current.kind === "open" && (() => {
          const q = current.question;
          const filled = openAnswers[q.id].trim() !== "";
          return (
            <div style={card}>
              <span style={lbl(theme.reflexion)}>Deine Reflexion</span>
              <p style={qst}>{q.q}</p>
              <textarea
                style={taStyle(!filled, theme.reflexion)}
                placeholder="Deine Antwort (Pflichtfeld)..."
                value={openAnswers[q.id]}
                onChange={(e) => setOpenAnswer(q.id, e.target.value)}
              />
              <NavRow label="Weiter" />
            </div>
          );
        })()}

        {current.kind === "name" && (
          <div style={card}>
            <span style={lbl(theme.reflexion)}>Fast geschafft</span>
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
            <NavRow label={name.trim() ? "Weiter" : "Überspringen"} />
          </div>
        )}
      </div>
    </Screen>
  );
}
