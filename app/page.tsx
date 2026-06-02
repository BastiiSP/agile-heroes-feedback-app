"use client";

import { useState } from "react";
import { RATINGS, OPEN_QUESTIONS, type RatingId, type OpenQuestionId } from "@/lib/constants";
import type { FeedbackEntry, FeedbackItem, Ratings, FollowUps, OpenAnswers } from "@/lib/types";
import FeedbackWizard from "@/components/FeedbackWizard";
import ConfirmView from "@/components/ConfirmView";
import ThanksView from "@/components/ThanksView";
import TrainerLogin from "@/components/TrainerLogin";
import TrainerDashboard from "@/components/TrainerDashboard";

type View = "form" | "confirm" | "thanks" | "trainer-login" | "trainer";

export default function Page() {
  const [view, setView] = useState<View>("form");
  const [step, setStep] = useState(0);
  const [selectedModule, setSelectedModule] = useState("");
  const [ratings, setRatings] = useState<Ratings>({ inhalt: 0, didaktik: 0, gestaltung: 0, trainer: 0 });
  const [followUps, setFollowUps] = useState<FollowUps>({ inhalt: "", didaktik: "", gestaltung: "", trainer: "" });
  const [openAnswers, setOpenAnswers] = useState<OpenAnswers>({ erkenntnis: "", ausprobieren: "", takeaway: "" });
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [trainerList, setTrainerList] = useState<string[]>([]);
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const [trainerPassword, setTrainerPassword] = useState("");
  const [trainerError, setTrainerError] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [filterModule, setFilterModule] = useState("all");
  const [filterTrainer, setFilterTrainer] = useState("all");
  const [loadingData, setLoadingData] = useState(false);

  const canProceed = () => {
    if (step === 0) return selectedModule !== "";
    if (step === 1) return selectedTrainer !== "";
    if (step >= 2 && step <= 5) {
      const r = RATINGS[step - 2];
      if (ratings[r.id] === 0) return false;
      return followUps[r.id].trim() !== "";
    }
    if (step >= 6 && step <= 8) return openAnswers[OPEN_QUESTIONS[step - 6].id].trim() !== "";
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (step === 0) {
      setStep(1);
      return;
    }
    if (step === 9) setView("confirm");
    else setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const resetForm = () => {
    setStep(0);
    setSelectedModule("");
    setName("");
    setSelectedTrainer("");
    setTrainerList([]);
    setRatings({ inhalt: 0, didaktik: 0, gestaltung: 0, trainer: 0 });
    setFollowUps({ inhalt: "", didaktik: "", gestaltung: "", trainer: "" });
    setOpenAnswers({ erkenntnis: "", ausprobieren: "", takeaway: "" });
    setView("form");
  };

  // Modulauswahl (Step 0): Trainerliste serverseitig laden.
  const handleSelectModule = async (m: string) => {
    setSelectedModule(m);
    setSelectedTrainer("");
    setLoadingTrainers(true);
    try {
      const res = await fetch("/api/trainers?modul=" + encodeURIComponent(m));
      const list = (await res.json()) as string[];
      setTrainerList(list);
    } catch {
      setTrainerList([]);
    }
    setLoadingTrainers(false);
  };

  const handleRateChange = (id: RatingId, value: number) => {
    setRatings((prev) => ({ ...prev, [id]: value }));
    setFollowUps((prev) => ({ ...prev, [id]: "" }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const entry: FeedbackEntry = {
      id: Date.now(),
      module: selectedModule,
      trainer: selectedTrainer,
      name: name.trim() || "Anonym",
      ratings,
      followUps,
      openAnswers,
      timestamp: new Date().toISOString(),
    };
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch {
      // Einreichung ist fire-and-forget; wir zeigen den Dank-Screen in jedem Fall.
    }
    setSubmitting(false);
    setView("thanks");
  };

  // Feedbacks laden (Login + Aktualisieren) – Passwort serverseitig geprüft.
  const loadFeedback = async (password: string): Promise<boolean> => {
    setLoadingData(true);
    let success = false;
    try {
      const res = await fetch("/api/trainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setFeedbackData((await res.json()) as FeedbackItem[]);
        success = true;
      }
    } catch {
      success = false;
    }
    setLoadingData(false);
    return success;
  };

  const handleTrainerLogin = async () => {
    const success = await loadFeedback(trainerPassword);
    if (success) setView("trainer");
    else setTrainerError(true);
  };

  if (view === "thanks") return <ThanksView onReset={resetForm} />;

  if (view === "confirm")
    return (
      <ConfirmView
        submitting={submitting}
        onBack={() => {
          setView("form");
          setStep(8);
        }}
        onSubmit={handleSubmit}
      />
    );

  if (view === "trainer-login")
    return (
      <TrainerLogin
        password={trainerPassword}
        onPasswordChange={(value) => {
          setTrainerPassword(value);
          setTrainerError(false);
        }}
        error={trainerError}
        onLogin={handleTrainerLogin}
        onBack={() => setView("form")}
      />
    );

  if (view === "trainer")
    return (
      <TrainerDashboard
        feedbackData={feedbackData}
        filterModule={filterModule}
        setFilterModule={setFilterModule}
        filterTrainer={filterTrainer}
        setFilterTrainer={setFilterTrainer}
        loadingData={loadingData}
        onRefresh={() => loadFeedback(trainerPassword)}
        onLogout={() => {
          setView("form");
          setTrainerPassword("");
          setFilterModule("all");
          setFilterTrainer("all");
        }}
      />
    );

  return (
    <FeedbackWizard
      step={step}
      selectedModule={selectedModule}
      onSelectModule={handleSelectModule}
      selectedTrainer={selectedTrainer}
      setSelectedTrainer={setSelectedTrainer}
      trainerList={trainerList}
      loadingTrainers={loadingTrainers}
      ratings={ratings}
      onRateChange={handleRateChange}
      followUps={followUps}
      setFollowUp={(id, value) => setFollowUps((prev) => ({ ...prev, [id]: value }))}
      openAnswers={openAnswers}
      setOpenAnswer={(id, value) => setOpenAnswers((prev) => ({ ...prev, [id]: value }))}
      name={name}
      setName={setName}
      ok={canProceed()}
      onNext={handleNext}
      onBack={handleBack}
      onOpenTrainerLogin={() => setView("trainer-login")}
    />
  );
}
