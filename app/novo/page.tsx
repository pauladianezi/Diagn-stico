"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Diagnostic, ClientAnswers, ResearchFindings, emptyClientAnswers, emptyResearchFindings } from "@/lib/types";
import Step1Upload from "@/components/Step1Upload";
import Step2Review from "@/components/Step2Review";
import Step3Research from "@/components/Step3Research";
import Step4Generate from "@/components/Step4Generate";
import { Suspense } from "react";

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ["Upload", "Respostas", "Pesquisa Externa", "Gerar Relatório"];

function NovoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [step, setStep] = useState<Step>(1);
  const [apiKey, setApiKey] = useState("");
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);

  useEffect(() => {
    const key = localStorage.getItem("grenah_api_key") || "";
    setApiKey(key);

    if (id) {
      const stored = localStorage.getItem("grenah_diagnostics");
      if (stored) {
        const all: Diagnostic[] = JSON.parse(stored);
        const found = all.find((d) => d.id === id);
        if (found) {
          setDiagnostic(found);
          setStep(found.status === "rascunho" ? 2 : found.status === "pesquisando" ? 3 : 4);
          return;
        }
      }
    }

    const newDiag: Diagnostic = {
      id: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
      clientAnswers: emptyClientAnswers,
      researchFindings: emptyResearchFindings,
      status: "rascunho",
    };
    setDiagnostic(newDiag);
  }, [id]);

  function save(diag: Diagnostic) {
    const stored = localStorage.getItem("grenah_diagnostics");
    const all: Diagnostic[] = stored ? JSON.parse(stored) : [];
    const idx = all.findIndex((d) => d.id === diag.id);
    if (idx >= 0) all[idx] = diag;
    else all.unshift(diag);
    localStorage.setItem("grenah_diagnostics", JSON.stringify(all));
  }

  function handleExtracted(answers: ClientAnswers, rawText: string) {
    if (!diagnostic) return;
    const updated: Diagnostic = { ...diagnostic, clientAnswers: answers, status: "rascunho" };
    setDiagnostic(updated);
    save(updated);
    setStep(2);
  }

  function handleAnswersChange(answers: ClientAnswers) {
    if (!diagnostic) return;
    const updated: Diagnostic = { ...diagnostic, clientAnswers: answers };
    setDiagnostic(updated);
    save(updated);
  }

  function handleToResearch() {
    if (!diagnostic) return;
    const updated: Diagnostic = { ...diagnostic, status: "pesquisando" };
    setDiagnostic(updated);
    save(updated);
    setStep(3);
  }

  function handleResearchChange(findings: ResearchFindings) {
    if (!diagnostic) return;
    const updated: Diagnostic = { ...diagnostic, researchFindings: findings };
    setDiagnostic(updated);
    save(updated);
  }

  function handleToGenerate() {
    if (!diagnostic) return;
    const updated: Diagnostic = { ...diagnostic, status: "revisando" };
    setDiagnostic(updated);
    save(updated);
    setStep(4);
  }

  function handleComplete() {
    if (!diagnostic) return;
    const updated: Diagnostic = { ...diagnostic, status: "pronto" };
    setDiagnostic(updated);
    save(updated);
  }

  if (!diagnostic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: "#DEDEDE", borderTopColor: "#C0392B" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9F9F9" }}>
      {/* Header */}
      <header className="border-b bg-white" style={{ borderColor: "#DEDEDE" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <span style={{ fontFamily: "Georgia, serif", fontWeight: "bold", fontSize: 22, color: "#C0392B" }}>GRENAH</span>
              <span style={{ color: "#DEDEDE" }}>·</span>
              <span style={{ color: "#555", fontSize: 14 }}>Novo Diagnóstico</span>
            </Link>
          </div>
          <div style={{ color: "#888", fontSize: 13 }}>
            {diagnostic.clientAnswers.nomeEmpresa || "Novo cliente"}
          </div>
        </div>
      </header>

      {/* Steps indicator */}
      <div className="bg-white border-b" style={{ borderColor: "#DEDEDE" }}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-0">
            {STEP_LABELS.map((label, i) => {
              const num = (i + 1) as Step;
              const isActive = step === num;
              const isDone = step > num;
              return (
                <div key={i} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: isActive ? "#C0392B" : isDone ? "#ECFDF5" : "#F4F4F4",
                        color: isActive ? "#fff" : isDone ? "#065F46" : "#888",
                      }}
                    >
                      {isDone ? "✓" : num}
                    </div>
                    <span style={{ fontSize: 13, color: isActive ? "#C0392B" : isDone ? "#1A1A1A" : "#888", fontWeight: isActive ? "bold" : "normal" }}>
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className="w-8 h-px mx-3" style={{ backgroundColor: "#DEDEDE" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        {step === 1 && (
          <Step1Upload onComplete={handleExtracted} apiKey={apiKey} />
        )}
        {step === 2 && (
          <Step2Review
            answers={diagnostic.clientAnswers}
            onChange={handleAnswersChange}
            onNext={handleToResearch}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3Research
            clientAnswers={diagnostic.clientAnswers}
            findings={diagnostic.researchFindings}
            onChange={handleResearchChange}
            onNext={handleToGenerate}
            onBack={() => setStep(2)}
            apiKey={apiKey}
          />
        )}
        {step === 4 && (
          <Step4Generate
            clientAnswers={diagnostic.clientAnswers}
            researchFindings={diagnostic.researchFindings}
            onBack={() => setStep(3)}
            onComplete={handleComplete}
            apiKey={apiKey}
          />
        )}
      </main>
    </div>
  );
}

export default function NovoPage() {
  return (
    <Suspense>
      <NovoContent />
    </Suspense>
  );
}
