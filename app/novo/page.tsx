"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Diagnostic, ClientAnswers, ResearchFindings, emptyClientAnswers, emptyResearchFindings } from "@/lib/types";
import { loadDiagnostics, saveDiagnostic } from "@/lib/storage";
import Step1Upload from "@/components/Step1Upload";
import Step2Review from "@/components/Step2Review";
import Step3Research from "@/components/Step3Research";
import Step4Generate from "@/components/Step4Generate";

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ["Upload", "Respostas", "Pesquisa Externa", "Gerar Relatório"];

function stepFromStatus(d: Diagnostic): Step {
  if (d.etapa) return d.etapa;
  return d.status === "rascunho" ? 2 : d.status === "pesquisando" ? 3 : 4;
}

// Uma análise interrompida (página fechada no meio) não pode ficar presa em "carregando"
function resetLoading(f: ResearchFindings): ResearchFindings {
  const out = { ...f };
  for (const k of ["site", "instagram", "linkedin", "posts", "mercado"] as const) {
    if (out[k].status === "loading") out[k] = { ...out[k], status: out[k].conteudo ? "done" : "idle" };
  }
  return out;
}

function NovoContent() {
  const router = useRouter();
  const id = useSearchParams().get("id");

  const [step, setStep] = useState<Step>(1);
  const [apiKey, setApiKey] = useState("");
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    setApiKey(localStorage.getItem("grenah_api_key") || "");

    // Sem id: cria um id e coloca na URL, para que recarregar a página retome o mesmo rascunho
    if (!id) {
      router.replace(`/novo?id=${crypto.randomUUID()}`);
      return;
    }

    const found = loadDiagnostics().find((d) => d.id === id);
    if (found) {
      setDiagnostic({ ...found, researchFindings: resetLoading(found.researchFindings) });
      setStep(stepFromStatus(found));
      setSavedAt(found.atualizadoEm ? new Date(found.atualizadoEm) : null);
    } else {
      setDiagnostic({
        id,
        criadoEm: new Date().toISOString(),
        clientAnswers: emptyClientAnswers,
        researchFindings: emptyResearchFindings,
        status: "rascunho",
        etapa: 1,
      });
      setStep(1);
      setSavedAt(null);
    }
  }, [id, router]);

  function update(patch: Partial<Diagnostic>) {
    if (!diagnostic) return;
    const updated: Diagnostic = { ...diagnostic, ...patch };
    if (patch.etapa) setStep(patch.etapa);
    setDiagnostic(updated);
    saveDiagnostic(updated);
    setSavedAt(new Date());
  }

  function handleExtracted(answers: ClientAnswers) {
    update({ clientAnswers: answers, status: "rascunho", etapa: 2 });
  }

  if (!diagnostic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: "#DEDEDE", borderTopColor: "#AA1738" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9F9F9" }}>
      {/* Header */}
      <header className="border-b bg-white" style={{ borderColor: "#DEDEDE" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span style={{ fontFamily: "Georgia, serif", fontSize: 20, color: "#2B2B2B" }}>
            {diagnostic.clientAnswers.nomeEmpresa || "Novo diagnóstico"}
          </span>
          <span style={{ color: "#888", fontSize: 12 }}>
            {savedAt
              ? `Rascunho salvo às ${savedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
              : "O rascunho é salvo automaticamente"}
          </span>
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
                        backgroundColor: isActive ? "#AA1738" : isDone ? "#E2E9AE" : "#F4F4F4",
                        color: isActive ? "#fff" : isDone ? "#2B2B2B" : "#888",
                      }}
                    >
                      {isDone ? "✓" : num}
                    </div>
                    <span style={{ fontSize: 13, color: isActive ? "#AA1738" : isDone ? "#1A1A1A" : "#888", fontWeight: isActive ? "bold" : "normal" }}>
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
            onChange={(clientAnswers) => update({ clientAnswers })}
            onNext={() => update({ status: "pesquisando", etapa: 3 })}
            onBack={() => update({ etapa: 1 })}
          />
        )}
        {step === 3 && (
          <Step3Research
            clientAnswers={diagnostic.clientAnswers}
            findings={diagnostic.researchFindings}
            onChange={(researchFindings) => update({ researchFindings })}
            onNext={() => update({ status: "revisando", etapa: 4 })}
            onBack={() => update({ etapa: 2 })}
            apiKey={apiKey}
          />
        )}
        {step === 4 && (
          <Step4Generate
            clientAnswers={diagnostic.clientAnswers}
            researchFindings={diagnostic.researchFindings}
            onBack={() => update({ etapa: 3 })}
            onComplete={() => update({ status: "pronto" })}
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
