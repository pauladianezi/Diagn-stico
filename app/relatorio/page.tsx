"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Diagnostic, ReportContent } from "@/lib/types";
import { loadDiagnostics, saveDiagnostic } from "@/lib/storage";
import ReportView from "@/components/ReportView";

function RelatorioContent() {
  const id = useSearchParams().get("id");
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDiagnostic(loadDiagnostics().find((d) => d.id === id) || null);
    setLoaded(true);
  }, [id]);

  function handleChange(report: ReportContent) {
    if (!diagnostic) return;
    const updated = { ...diagnostic, reportContent: report };
    setDiagnostic(updated);
    // Agrupa edições rápidas em um único salvamento
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveDiagnostic(updated);
      setSavedAt(new Date());
    }, 400);
  }

  const nome = diagnostic?.clientAnswers.nomeEmpresa || "Cliente";

  function downloadPdf() {
    const original = document.title;
    document.title = `Grenah_Diagnostico_${nome.replace(/\s+/g, "")}`;
    const restore = () => { document.title = original; window.removeEventListener("afterprint", restore); };
    window.addEventListener("afterprint", restore);
    window.print();
  }

  async function downloadWord() {
    if (!diagnostic?.reportContent) return;
    setDownloading(true);
    setError("");
    try {
      const res = await fetch("/api/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientAnswers: diagnostic.clientAnswers, report: diagnostic.reportContent }),
      });
      if (!res.ok) throw new Error();
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `Grenah_Diagnostico_${nome.replace(/\s+/g, "")}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Não foi possível gerar o arquivo Word. Tente novamente.");
    } finally {
      setDownloading(false);
    }
  }

  if (!loaded) return null;

  if (!diagnostic?.reportContent) {
    return (
      <main className="max-w-xl mx-auto px-10 py-24 text-center">
        <h1 style={{ fontSize: 32 }}>Relatório não encontrado</h1>
        <p style={{ color: "var(--gray)", fontSize: 14, margin: "10px 0 24px" }}>
          Este diagnóstico ainda não tem um relatório gerado, ou foi criado em outro navegador.
        </p>
        <Link href={id ? `/novo?id=${id}` : "/"} className="px-5 py-2.5 rounded-md text-white text-sm" style={{ backgroundColor: "var(--grena)" }}>
          {id ? "Voltar ao diagnóstico" : "Ir para o início"}
        </Link>
      </main>
    );
  }

  return (
    <div>
      <div className="no-print report-toolbar">
        <div className="flex items-center gap-4 min-w-0">
          <Link href={`/novo?id=${diagnostic.id}`} style={{ fontSize: 13, color: "var(--gray)" }}>← Diagnóstico</Link>
          <span className="truncate" style={{ fontFamily: "var(--font-serif)", fontSize: 18 }}>{nome}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span style={{ fontSize: 12, color: "#999" }}>
            {savedAt
              ? `Alterações salvas às ${savedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
              : "Clique em qualquer texto para editar"}
          </span>
          <button onClick={downloadWord} disabled={downloading} className="px-4 py-2 rounded-md text-sm border cursor-pointer disabled:opacity-50" style={{ borderColor: "var(--grena)", color: "var(--grena)" }}>
            {downloading ? "Gerando..." : "Baixar Word"}
          </button>
          <button onClick={downloadPdf} className="px-4 py-2 rounded-md text-sm text-white cursor-pointer" style={{ backgroundColor: "var(--grena)" }}>
            Baixar PDF
          </button>
        </div>
      </div>
      {error && <p className="no-print text-center py-2" style={{ fontSize: 13, color: "var(--grena)", backgroundColor: "var(--rose-bg)" }}>{error}</p>}
      <ReportView answers={diagnostic.clientAnswers} report={diagnostic.reportContent} geradoEm={diagnostic.geradoEm} onChange={handleChange} />
      <p className="no-print text-center pb-10" style={{ fontSize: 12, color: "#aaa" }}>
        Para salvar em PDF, escolha "Salvar como PDF" na janela de impressão e desative "Cabeçalhos e rodapés".
      </p>
    </div>
  );
}

export default function RelatorioPage() {
  return (
    <Suspense>
      <RelatorioContent />
    </Suspense>
  );
}
