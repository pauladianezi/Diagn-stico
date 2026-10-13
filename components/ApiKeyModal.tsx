"use client";

import { useState } from "react";

interface Props {
  hasKey: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
}

export default function ApiKeyModal({ hasKey, onSave, onClose }: Props) {
  const [value, setValue] = useState("");

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ backgroundColor: "rgba(43,43,43,0.45)" }}>
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-xl">
        <div style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--grena)", marginBottom: 6 }}>CONFIGURAÇÃO</div>
        <h2 style={{ fontSize: 26, color: "var(--dark)", marginBottom: 8 }}>Chave de API</h2>
        <p style={{ fontSize: 14, color: "var(--gray)", marginBottom: 20, lineHeight: 1.6 }}>
          O app usa o Claude (Anthropic) para ler o questionário, analisar os prints e escrever o relatório.
          Crie uma chave em{" "}
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ color: "var(--grena)", textDecoration: "underline" }}>
            console.anthropic.com
          </a>.
        </p>
        <label style={{ fontSize: 12, color: "var(--gray)", display: "block", marginBottom: 6 }}>
          Chave (começa com sk-ant-)
        </label>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) onSave(value.trim()); }}
          placeholder="sk-ant-..."
          autoFocus
          className="w-full border rounded-md px-3 py-2 text-sm mb-4"
          style={{ borderColor: "var(--line)" }}
        />
        <div className="flex gap-3">
          <button
            onClick={() => onSave(value.trim())}
            disabled={!value.trim()}
            className="flex-1 py-2 rounded-md text-white text-sm cursor-pointer disabled:opacity-40 disabled:cursor-default"
            style={{ backgroundColor: "var(--grena)" }}
          >
            Salvar
          </button>
          {hasKey && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm border cursor-pointer"
              style={{ borderColor: "var(--line)", color: "var(--gray)" }}
            >
              Cancelar
            </button>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#999", marginTop: 14 }}>
          A chave fica salva apenas neste navegador.
        </p>
      </div>
    </div>
  );
}
