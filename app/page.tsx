"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Diagnostic } from "@/lib/types";
import { loadDiagnostics, deleteDiagnostic as removeDiagnostic, subscribeDiagnostics } from "@/lib/storage";

export default function Home() {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [savedKey, setSavedKey] = useState("");

  useEffect(() => {
    const refresh = () => setDiagnostics(loadDiagnostics());
    refresh();
    const key = localStorage.getItem("grenah_api_key") || "";
    setSavedKey(key);
    if (!key) setShowKeyModal(true);
    return subscribeDiagnostics(refresh);
  }, []);

  function saveKey() {
    localStorage.setItem("grenah_api_key", apiKey.trim());
    setSavedKey(apiKey.trim());
    setShowKeyModal(false);
  }

  function deleteDiagnostic(id: string) {
    removeDiagnostic(id);
  }

  const statusLabel: Record<string, string> = {
    rascunho: "Rascunho",
    pesquisando: "Pesquisando",
    revisando: "Revisando",
    gerando: "Gerando",
    pronto: "Pronto",
  };

  const statusColor: Record<string, string> = {
    rascunho: "bg-gray-100 text-gray-600",
    pesquisando: "bg-yellow-100 text-yellow-700",
    revisando: "bg-blue-100 text-blue-700",
    gerando: "bg-purple-100 text-purple-700",
    pronto: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9F9F9" }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: "#DEDEDE", backgroundColor: "#fff" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "Georgia, serif", fontWeight: "bold", fontSize: 22, color: "#C0392B" }}>
              GRENAH
            </span>
            <span style={{ color: "#DEDEDE" }}>·</span>
            <span style={{ color: "#555", fontSize: 14 }}>Diagnóstico de Comunicação</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowKeyModal(true)}
              className="text-sm px-3 py-1.5 rounded border cursor-pointer"
              style={{ borderColor: "#DEDEDE", color: "#555" }}
            >
              {savedKey ? "🔑 API configurada" : "⚠️ Configurar API"}
            </button>
            <Link
              href="/novo"
              className="px-4 py-2 rounded text-white text-sm font-medium"
              style={{ backgroundColor: "#C0392B" }}
            >
              + Novo Diagnóstico
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, color: "#1A1A1A", marginBottom: 8 }}>
          Diagnósticos
        </h1>
        <p style={{ color: "#555", fontSize: 14, marginBottom: 32 }}>
          Gerencie todos os diagnósticos de comunicação criados pela Grenah.
        </p>

        {diagnostics.length === 0 ? (
          <div
            className="rounded-lg border-2 border-dashed flex flex-col items-center justify-center py-20"
            style={{ borderColor: "#DEDEDE" }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p style={{ color: "#555", marginBottom: 16 }}>Nenhum diagnóstico criado ainda.</p>
            <Link
              href="/novo"
              className="px-6 py-2 rounded text-white text-sm font-medium"
              style={{ backgroundColor: "#C0392B" }}
            >
              Criar primeiro diagnóstico
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {diagnostics.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-lg border p-5 flex items-center justify-between"
                style={{ borderColor: "#DEDEDE" }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span style={{ fontFamily: "Georgia, serif", fontWeight: "bold", fontSize: 18, color: "#1A1A1A" }}>
                      {d.clientAnswers.nomeEmpresa || "Sem nome"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[d.status]}`}>
                      {statusLabel[d.status]}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "#555" }}>
                    {d.clientAnswers.segmento && `${d.clientAnswers.segmento}  ·  `}
                    {d.clientAnswers.nomeResponsavel && `${d.clientAnswers.nomeResponsavel}  ·  `}
                    {new Date(d.criadoEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/novo?id=${d.id}`}
                    className="px-4 py-1.5 rounded text-sm border"
                    style={{ borderColor: "#DEDEDE", color: "#555" }}
                  >
                    Continuar
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir diagnóstico de ${d.clientAnswers.nomeEmpresa}?`)) deleteDiagnostic(d.id);
                    }}
                    className="px-4 py-1.5 rounded text-sm border cursor-pointer"
                    style={{ borderColor: "#DEDEDE", color: "#C0392B" }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-xl">
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, color: "#1A1A1A", marginBottom: 8 }}>
              Configurar Chave de API
            </h2>
            <p style={{ fontSize: 14, color: "#555", marginBottom: 20 }}>
              Para usar o Claude (Anthropic), você precisa de uma chave de API. Obtenha a sua em{" "}
              <strong>console.anthropic.com</strong>.
            </p>
            <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 6 }}>
              Chave de API (começa com sk-ant-)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full border rounded px-3 py-2 text-sm mb-4"
              style={{ borderColor: "#DEDEDE", outline: "none" }}
            />
            <div className="flex gap-3">
              <button
                onClick={saveKey}
                className="flex-1 py-2 rounded text-white text-sm font-medium"
                style={{ backgroundColor: "#C0392B" }}
                disabled={!apiKey.trim()}
              >
                Salvar
              </button>
              {savedKey && (
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded text-sm border"
                  style={{ borderColor: "#DEDEDE", color: "#555" }}
                >
                  Cancelar
                </button>
              )}
            </div>
            <p style={{ fontSize: 12, color: "#888", marginTop: 12 }}>
              A chave é salva apenas neste navegador. Nunca compartilhamos seus dados.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
