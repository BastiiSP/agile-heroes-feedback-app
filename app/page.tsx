"use client";

import { useEffect, useMemo, useState } from "react";
import { PROGRAMS, buildSteps, type RatingId, type OpenQuestionId } from "@/lib/constants";
import type { FeedbackEntry, FeedbackItem, Ratings, FollowUps, OpenAnswers, Trainer } from "@/lib/types";
import FeedbackWizard from "@/components/FeedbackWizard";
import ConfirmView from "@/components/ConfirmView";
import ThanksView from "@/components/ThanksView";
import TrainerLogin from "@/components/TrainerLogin";
import TrainerDashboard from "@/components/TrainerDashboard";

type View = "form" | "confirm" | "thanks" | "trainer-login" | "trainer";

export default function Page() {
  const [view, setView] = useState<View>("form");
  const [step, setStep] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [ratings, setRatings] = useState<Ratings>({ inhalt: 0, didaktik: 0, gestaltung: 0, trainer: 0 });
  const [followUps, setFollowUps] = useState<FollowUps>({ inhalt: "", didaktik: "", gestaltung: "", trainer: "" });
  const [openAnswers, setOpenAnswers] = useState<OpenAnswers>({ erkenntnis: "", ausprobieren: "", takeaway: "" });
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [trainerList, setTrainerList] = useState<Trainer[]>([]);
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const [trainerPassword, setTrainerPassword] = useState("");
  const [trainerError, setTrainerError] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [filterAusbildung, setFilterAusbildung] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [filterTrainer, setFilterTrainer] = useState("all");
  const [loadingData, setLoadingData] = useState(false);

  const program = useMemo(() => PROGRAMS.find((p) => p.id === selectedProgram), [selectedProgram]);
  const steps = useMemo(() => buildSteps(program), [program]);

  // Trainer einmalig beim Laden holen – modul-unabhängig, für alle Pfade.
  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingTrainers(true);
      try {
        const res = await fetch("/api/trainers");
        const list = (await res.json()) as Trainer[];
        if (active) setTrainerList(list);
      } catch {
        if (active) setTrainerList([]);
      }
      if (active) setLoadingTrainers(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const canProceed = () => {
    const current = steps[step];
    switch (current.kind) {
      case "program":
        return selectedProgram !== "";
      case "module":
        return selectedModule !== "";
      case "trainer":
        return selectedTrainer !== "";
      case "rating":
        return ratings[current.rating.id] > 0 && followUps[current.rating.id].trim() !== "";
      case "open":
        return openAnswers[current.question.id].trim() !== "";
      case "name":
        return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (step === steps.length - 1) setView("confirm");
    else setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const resetForm = () => {
    setStep(0);
    setSelectedProgram("");
    setSelectedModule("");
    setName("");
    setSelectedTrainer("");
    setRatings({ inhalt: 0, didaktik: 0, gestaltung: 0, trainer: 0 });
    setFollowUps({ inhalt: "", didaktik: "", gestaltung: "", trainer: "" });
    setOpenAnswers({ erkenntnis: "", ausprobieren: "", takeaway: "" });
    setSubmitError(false);
    setView("form");
  };

  // Ausbildungswahl: Modulwahl zurücksetzen (relevant bei Wechsel zw. Pfaden).
  const handleSelectProgram = (id: string) => {
    setSelectedProgram(id);
    setSelectedModule("");
  };

  const handleRateChange = (id: RatingId, value: number) => {
    setRatings((prev) => ({ ...prev, [id]: value }));
    setFollowUps((prev) => ({ ...prev, [id]: "" }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(false);
    const entry: FeedbackEntry = {
      id: Date.now(),
      ausbildung: program?.label || "",
      module: selectedModule,
      trainer: selectedTrainer,
      name: name.trim() || "Anonym",
      ratings,
      followUps,
      openAnswers,
      timestamp: new Date().toISOString(),
    };
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (!res.ok) throw new Error(`submit failed: ${res.status}`);
      // Dankesseite NUR bei bestätigtem Erfolg – sonst bliebe ein
      // fehlgeschlagenes Speichern (wie bisher) unbemerkt.
      setView("thanks");
    } catch {
      // Eingaben bleiben erhalten; der Nutzer bleibt auf der confirm-View
      // und kann erneut absenden.
      setSubmitError(true);
    }
    setSubmitting(false);
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
        error={submitError}
        onBack={() => {
          setSubmitError(false);
          setView("form");
          setStep(steps.length - 1);
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
        filterAusbildung={filterAusbildung}
        setFilterAusbildung={setFilterAusbildung}
        filterModule={filterModule}
        setFilterModule={setFilterModule}
        filterTrainer={filterTrainer}
        setFilterTrainer={setFilterTrainer}
        loadingData={loadingData}
        onRefresh={() => loadFeedback(trainerPassword)}
        onLogout={() => {
          setView("form");
          setTrainerPassword("");
          setFilterAusbildung("all");
          setFilterModule("all");
          setFilterTrainer("all");
        }}
      />
    );

  return (
    <FeedbackWizard
      steps={steps}
      step={step}
      selectedProgram={selectedProgram}
      onSelectProgram={handleSelectProgram}
      selectedModule={selectedModule}
      onSelectModule={setSelectedModule}
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
