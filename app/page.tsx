"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Diagnostic } from "@/lib/types";
import { loadDiagnostics, deleteDiagnostic, subscribeDiagnostics } from "@/lib/storage";

// Status no ciclo de maturação da marca: Verde (início), Rosé (em curso), Grená (concluído)
const STATUS: Record<Diagnostic["status"], { label: string; bg: string; color: string }> = {
  rascunho:    { label: "Rascunho",    bg: "#F2F2F2",          color: "var(--gray)" },
  pesquisando: { label: "Pesquisando", bg: "var(--verde)",     color: "#5C6B1F" },
  revisando:   { label: "Revisando",   bg: "var(--rose-bg)",   color: "var(--grena)" },
  gerando:     { label: "Gerando",     bg: "var(--rose)",      color: "var(--grena)" },
  pronto:      { label: "Pronto",      bg: "var(--grena)",     color: "#fff" },
};

export default function Home() {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);

  useEffect(() => {
    const refresh = () => setDiagnostics(loadDiagnostics());
    refresh();
    return subscribeDiagnostics(refresh);
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-10 py-14">
      <div style={{ fontSize: 11, letterSpacing: 2, color: "var(--grena)", marginBottom: 10 }}>DIAGNÓSTICO DE COMUNICAÇÃO</div>
      <div className="flex items-end justify-between gap-6 pb-6 mb-8 border-b" style={{ borderColor: "var(--grena)" }}>
        <div>
          <h1 style={{ fontSize: 44, lineHeight: 1.05, color: "var(--dark)" }}>Diagnósticos</h1>
          <p style={{ color: "var(--gray)", fontSize: 14, marginTop: 10 }}>
            Cada diagnóstico começa pela compreensão do momento da marca.
          </p>
        </div>
        <Link
          href="/novo"
          className="shrink-0 px-5 py-2.5 rounded-md text-white text-sm"
          style={{ backgroundColor: "var(--grena)" }}
        >
          + Novo diagnóstico
        </Link>
      </div>

      {diagnostics.length === 0 ? (
        <div className="rounded-xl flex flex-col items-center justify-center py-20 text-center" style={{ backgroundColor: "var(--rose-bg)" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--dark)" }}>Nenhum diagnóstico ainda.</p>
          <p style={{ color: "var(--gray)", fontSize: 14, margin: "8px 0 24px" }}>
            Envie o questionário preenchido pelo cliente para começar.
          </p>
          <Link href="/novo" className="px-6 py-2.5 rounded-md text-white text-sm" style={{ backgroundColor: "var(--grena)" }}>
            Criar o primeiro diagnóstico
          </Link>
        </div>
      ) : (
        <div className="flex flex-col">
          {diagnostics.map((d) => {
            const s = STATUS[d.status];
            return (
              <div key={d.id} className="py-5 flex items-center justify-between gap-4 border-b" style={{ borderColor: "var(--line)" }}>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="truncate" style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--dark)" }}>
                      {d.clientAnswers.nomeEmpresa || "Sem nome"}
                    </span>
                    <span className="shrink-0 px-2.5 py-0.5 rounded-full" style={{ fontSize: 11, backgroundColor: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--gray)" }}>
                    {[d.clientAnswers.segmento, d.clientAnswers.nomeResponsavel, new Date(d.atualizadoEm || d.criadoEm).toLocaleDateString("pt-BR")]
                      .filter(Boolean)
                      .join("  |  ")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={d.reportContent ? `/relatorio?id=${d.id}` : `/novo?id=${d.id}`}
                    className="px-4 py-1.5 rounded-md text-sm border"
                    style={{ borderColor: "var(--grena)", color: "var(--grena)" }}
                  >
                    {d.status === "pronto" ? "Abrir" : "Continuar"}
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir o diagnóstico de ${d.clientAnswers.nomeEmpresa || "Sem nome"}?`)) deleteDiagnostic(d.id);
                    }}
                    className="px-3 py-1.5 rounded-md text-sm cursor-pointer hover:bg-[#FDF1F1]"
                    style={{ color: "var(--gray)" }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
