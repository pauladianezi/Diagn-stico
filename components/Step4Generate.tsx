"use client";

import { useState } from "react";
import { ClientAnswers, ResearchFindings } from "@/lib/types";

interface Props {
  clientAnswers: ClientAnswers;
  researchFindings: ResearchFindings;
  onBack: () => void;
  onComplete: () => void;
  apiKey: string;
}

export default function Step4Generate({ clientAnswers, researchFindings, onBack, onComplete, apiKey }: Props) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  async function generate() {
    setLoading(true);
    setError("");
    setProgress("Claude está analisando todos os dados e escrevendo o diagnóstico...");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ clientAnswers, researchFindings }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao gerar o relatório.");
        setLoading(false);
        return;
      }

      setProgress("Montando o documento Word...");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const contentDisposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      a.download = filenameMatch ? filenameMatch[1] : `Grenah_Diagnostico_${clientAnswers.nomeEmpresa}.docx`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setGenerated(true);
      onComplete();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  const hasResearch = Object.entries(researchFindings)
    .filter(([k]) => k !== "notasAdicionais")
    .some(([, v]) => typeof v === "object" && (v as { conteudo: string }).conteudo.trim().length > 0);

  return (
    <div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: "#1A1A1A", marginBottom: 8 }}>
        Passo 4 — Gerar Relatório
      </h2>
      <p style={{ color: "#555", fontSize: 14, marginBottom: 32 }}>
        Claude vai redigir todo o conteúdo do diagnóstico e montar o documento Word pronto para entrega.
      </p>

      {/* Resumo */}
      <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: "#DEDEDE" }}>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#1A1A1A", marginBottom: 16 }}>
          Resumo do Diagnóstico
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            ["Empresa", clientAnswers.nomeEmpresa],
            ["Responsável", clientAnswers.nomeResponsavel],
            ["Segmento", clientAnswers.segmento],
            ["Site", clientAnswers.urlSite],
          ].map(([label, value]) => (
            <div key={label}>
              <p style={{ fontSize: 11, color: "#C0392B", fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase" }}>{label}</p>
              <p style={{ fontSize: 14, color: "#1A1A1A" }}>{value || "—"}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4" style={{ borderTop: "1px solid #DEDEDE" }}>
          <p style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>Pesquisas realizadas:</p>
          <div className="flex gap-2 flex-wrap">
            {["site", "instagram", "linkedin", "posts", "mercado"].map((key) => {
              const section = researchFindings[key as keyof ResearchFindings];
              const done = typeof section === "object" && (section as { conteudo: string }).conteudo.trim().length > 0;
              return (
                <span
                  key={key}
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ backgroundColor: done ? "#ECFDF5" : "#F4F4F4", color: done ? "#065F46" : "#888" }}
                >
                  {done ? "✓" : "○"} {key}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {!hasResearch && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <p style={{ color: "#92400E", fontSize: 14 }}>
            ⚠️ Nenhuma pesquisa externa foi realizada. O diagnóstico será baseado apenas nas respostas do questionário, sem análise externa.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: "#FFF5F5", border: "1px solid #FFCCCC" }}>
          <p style={{ color: "#C0392B", fontSize: 14 }}>{error}</p>
        </div>
      )}

      {generated && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: "#ECFDF5", border: "1px solid #6EE7B7" }}>
          <p style={{ color: "#065F46", fontSize: 14 }}>
            ✅ Diagnóstico gerado com sucesso! O arquivo foi baixado para o seu computador.
          </p>
        </div>
      )}

      {loading && (
        <div className="mb-6 p-6 rounded-xl flex flex-col items-center gap-4" style={{ backgroundColor: "#F4F4F4" }}>
          <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: "#DEDEDE", borderTopColor: "#C0392B" }} />
          <p style={{ color: "#555", fontSize: 14, textAlign: "center" }}>{progress}</p>
          <p style={{ color: "#888", fontSize: 13, textAlign: "center" }}>
            Este processo pode levar de 1 a 3 minutos. Por favor, não feche esta janela.
          </p>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-6 py-2.5 rounded border text-sm cursor-pointer disabled:opacity-40"
          style={{ borderColor: "#DEDEDE", color: "#555" }}
        >
          ← Voltar
        </button>
        <button
          onClick={generate}
          disabled={loading}
          className="px-8 py-3 rounded text-white text-base font-medium cursor-pointer disabled:opacity-40 flex items-center gap-3"
          style={{ backgroundColor: "#C0392B" }}
        >
          {loading && <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "#fff4", borderTopColor: "#fff" }} />}
          {generated ? "↺ Gerar Novamente" : "📄 Gerar Diagnóstico .docx"}
        </button>
      </div>

      <p style={{ fontSize: 12, color: "#888", textAlign: "center", marginTop: 12 }}>
        O arquivo será baixado automaticamente ao final do processo.
      </p>
    </div>
  );
}
