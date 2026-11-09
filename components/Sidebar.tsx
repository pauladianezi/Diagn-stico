"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Diagnostic } from "@/lib/types";
import { loadDiagnostics, subscribeDiagnostics, API_KEY_STORAGE, API_KEY_EVENT } from "@/lib/storage";
import ApiKeyModal from "./ApiKeyModal";

const STEP_LABEL: Record<number, string> = { 1: "Upload", 2: "Respostas", 3: "Pesquisa", 4: "Gerar relatório" };

function byRecent(a: Diagnostic, b: Diagnostic) {
  return (b.atualizadoEm || b.criadoEm).localeCompare(a.atualizadoEm || a.criadoEm);
}

function Item({ d, active }: { d: Diagnostic; active: boolean }) {
  const date = new Date(d.atualizadoEm || d.criadoEm).toLocaleDateString("pt-BR");
  const detail = d.status === "pronto" ? date : `${STEP_LABEL[d.etapa || 2]} · ${date}`;
  return (
    <Link
      href={d.reportContent ? `/relatorio?id=${d.id}` : `/novo?id=${d.id}`}
      className="block rounded-md px-3 py-2 transition-colors hover:bg-[#FDF1F1]"
      style={{ backgroundColor: active ? "#FDF1F1" : undefined, borderLeft: `3px solid ${active ? "#AA1738" : "transparent"}` }}
    >
      <div className="truncate" style={{ fontSize: 14, color: "#2B2B2B" }}>{d.clientAnswers.nomeEmpresa || "Sem nome"}</div>
      <div style={{ fontSize: 12, color: "#888" }}>{detail}</div>
    </Link>
  );
}

function Group({ title, items, activeId, empty }: { title: string; items: Diagnostic[]; activeId: string | null; empty: string }) {
  return (
    <div className="mb-6">
      <div className="px-3 mb-2 flex items-center justify-between" style={{ fontSize: 11, letterSpacing: 1.5, color: "#AA1738" }}>
        <span>{title}</span>
        <span style={{ color: "#AAA" }}>{items.length}</span>
      </div>
      {items.length === 0
        ? <p className="px-3" style={{ fontSize: 12, color: "#AAA" }}>{empty}</p>
        : <div className="flex flex-col gap-0.5">{items.map((d) => <Item key={d.id} d={d} active={d.id === activeId} />)}</div>}
    </div>
  );
}

export default function Sidebar() {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeId = (pathname === "/novo" || pathname === "/relatorio") ? searchParams.get("id") : null;

  const [hasKey, setHasKey] = useState(true);
  const [showKeyModal, setShowKeyModal] = useState(false);

  useEffect(() => {
    const refresh = () => setDiagnostics(loadDiagnostics());
    refresh();
    const key = localStorage.getItem(API_KEY_STORAGE) || "";
    setHasKey(!!key);
    if (!key) setShowKeyModal(true);
    return subscribeDiagnostics(refresh);
  }, []);

  function saveKey(key: string) {
    if (!key) return;
    localStorage.setItem(API_KEY_STORAGE, key);
    window.dispatchEvent(new Event(API_KEY_EVENT));
    setHasKey(true);
    setShowKeyModal(false);
  }

  const rascunhos = diagnostics.filter((d) => d.status !== "pronto").sort(byRecent);
  const prontos = diagnostics.filter((d) => d.status === "pronto").sort(byRecent);

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r" style={{ borderColor: "var(--line)" }}>
      <Link href="/" className="px-6 pt-7 pb-6 block">
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 30, lineHeight: 1, color: "var(--grena)" }}>Grenah</div>
        <div style={{ fontSize: 8, letterSpacing: 1.3, whiteSpace: "nowrap", color: "var(--gray)", marginTop: 6 }}>ESTRATÉGIA, COMUNICAÇÃO & DESIGN</div>
      </Link>
      <div className="px-4 pb-5">
        <Link
          href="/novo"
          className="block text-center rounded-md py-2 text-white text-sm"
          style={{ backgroundColor: "#AA1738" }}
        >
          + Novo diagnóstico
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-2">
        <Group title="RASCUNHOS" items={rascunhos} activeId={activeId} empty="Nenhum rascunho." />
        <Group title="RELATÓRIOS" items={prontos} activeId={activeId} empty="Nenhum relatório concluído." />
      </nav>
      <div className="px-4 py-4 border-t" style={{ borderColor: "var(--line)" }}>
        <button
          onClick={() => setShowKeyModal(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left cursor-pointer hover:bg-[#FDF1F1]"
          style={{ fontSize: 13, color: "var(--gray)" }}
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hasKey ? "#9DB04A" : "var(--grena)" }} />
          {hasKey ? "Chave de API configurada" : "Configurar chave de API"}
        </button>
      </div>
      {showKeyModal && <ApiKeyModal hasKey={hasKey} onSave={saveKey} onClose={() => setShowKeyModal(false)} />}
    </aside>
  );
}
