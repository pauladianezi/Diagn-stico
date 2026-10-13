"use client";

import { useState, useRef } from "react";
import { ClientAnswers, emptyClientAnswers } from "@/lib/types";

interface Props {
  onComplete: (answers: ClientAnswers, rawText: string) => void;
  apiKey: string;
}

export default function Step1Upload({ onComplete, apiKey }: Props) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    if (!file.name.endsWith(".docx")) {
      setError("Por favor, envie um arquivo .docx");
      return;
    }
    setLoading(true);
    setError("");
    setProgress("Lendo o arquivo...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProgress("Extraindo respostas com Claude (pode levar 30s)...");
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "x-api-key": apiKey },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao processar o arquivo.");
        setLoading(false);
        return;
      }

      onComplete(data.answers, data.rawText);
    } catch (e) {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function skipUpload() {
    onComplete(emptyClientAnswers, "");
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "#1A1A1A", marginBottom: 8 }}>
        Passo 1. Upload do Questionário
      </h2>
      <p style={{ color: "#555", fontSize: 14, marginBottom: 32 }}>
        Envie o arquivo .docx preenchido pelo cliente. Claude extrairá automaticamente todas as respostas.
      </p>

      <div
        className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-16 cursor-pointer transition-colors"
        style={{
          borderColor: dragging ? "#AA1738" : "#DEDEDE",
          backgroundColor: dragging ? "#FDF1F1" : "#FAFAFA",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !loading && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".docx" className="hidden" onChange={handleFileChange} />

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: "#DEDEDE", borderTopColor: "#AA1738" }} />
            <p style={{ color: "#555", fontSize: 14 }}>{progress}</p>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, letterSpacing: 2, color: "var(--grena)", marginBottom: 12 }}>.DOCX</div>
            <p style={{ color: "#1A1A1A", fontWeight: "bold", marginBottom: 4 }}>
              Arraste o .docx aqui ou clique para selecionar
            </p>
            <p style={{ color: "#888", fontSize: 13 }}>Questionário Grenah de Diagnóstico de Comunicação</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: "#FDF1F1", border: "1px solid #F6BABC" }}>
          <p style={{ color: "#AA1738", fontSize: 14 }}>{error}</p>
        </div>
      )}

      {!apiKey && (
        <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <p style={{ color: "#92400E", fontSize: 14 }}>
            Chave de API não configurada. Use o botão no rodapé do menu lateral para informar sua chave Anthropic.
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={skipUpload}
          className="text-sm cursor-pointer"
          style={{ color: "#888", textDecoration: "underline" }}
        >
          Preencher manualmente (sem arquivo)
        </button>
      </div>
    </div>
  );
}
