"use client";

import { useState, useRef, useEffect } from "react";
import { ClientAnswers, ResearchFindings, ResearchSection } from "@/lib/types";

interface Props {
  clientAnswers: ClientAnswers;
  findings: ResearchFindings;
  onChange: (findings: ResearchFindings) => void;
  onNext: () => void;
  onBack: () => void;
  apiKey: string;
}

type SectionKey = keyof Omit<ResearchFindings, "notasAdicionais">;

const SECTIONS: {
  key: SectionKey;
  label: string;
  icon: string;
  desc: string;
  mode: "auto" | "images";
}[] = [
  { key: "site",      label: "Site e Proposta de Valor", icon: "🌐", desc: "Busca automática via Jina AI Reader",               mode: "auto"   },
  { key: "instagram", label: "Instagram",                  icon: "📸", desc: "Anexe prints do perfil e do feed",                  mode: "images" },
  { key: "linkedin",  label: "LinkedIn",                   icon: "💼", desc: "Anexe prints da página e de publicações",           mode: "images" },
  { key: "posts",     label: "Posts de Destaque",          icon: "📊", desc: "Anexe prints dos posts indicados como melhores",    mode: "images" },
  { key: "mercado",   label: "Cenário Competitivo",        icon: "🔍", desc: "Análise via busca automática",                      mode: "auto"   },
];

const MAX_IMAGES = 15;

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
      resolve(base64);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function Step3Research({ clientAnswers, findings, onChange, onNext, onBack, apiKey }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sectionImages, setSectionImages] = useState<Record<string, File[]>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function setSection(key: SectionKey, patch: Partial<ResearchSection>) {
    onChange({ ...findings, [key]: { ...findings[key], ...patch } });
  }

  async function research(sectionKey: SectionKey, mode: "auto" | "images") {
    setSection(sectionKey, { status: "loading", editado: false });
    setErrors((e) => ({ ...e, [sectionKey]: "" }));

    let images: string[] = [];
    if (mode === "images") {
      const files = sectionImages[sectionKey] || [];
      if (files.length === 0) {
        setErrors((e) => ({ ...e, [sectionKey]: "Anexe pelo menos um print antes de analisar." }));
        setSection(sectionKey, { status: "error" });
        return;
      }
      try {
        images = await Promise.all(files.map(compressImage));
      } catch {
        setErrors((e) => ({ ...e, [sectionKey]: "Erro ao processar as imagens." }));
        setSection(sectionKey, { status: "error" });
        return;
      }
    }

    // Route para mercado usa web_search (legado) — mantemos como auto sem imagens
    if (sectionKey === "mercado") {
      images = [];
    }

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ clientAnswers, section: sectionKey, images }),
      });

      let data: { resultado?: string; error?: string } = {};
      try { data = await res.json(); } catch { /* non-JSON */ }

      if (!res.ok) {
        setErrors((e) => ({ ...e, [sectionKey]: data.error || "Erro na pesquisa." }));
        setSection(sectionKey, { status: "error" });
        return;
      }

      setSection(sectionKey, { conteudo: data.resultado ?? "", status: "done", editado: false });
    } catch {
      setErrors((e) => ({ ...e, [sectionKey]: "Erro de conexão. Tente novamente." }));
      setSection(sectionKey, { status: "error" });
    }
  }

  function updateContent(key: SectionKey, value: string) {
    setSection(key, { conteudo: value, editado: true });
  }

  // Ctrl+V cola o print na seção de imagens em que o usuário clicou ou passou o mouse por último
  const [pasteTarget, setPasteTarget] = useState<SectionKey>("instagram");
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT")) return;
      const files = Array.from(e.clipboardData?.files || []).filter((f) => f.type.startsWith("image/"));
      if (files.length === 0) return;
      e.preventDefault();
      addImages(pasteTarget, files);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [pasteTarget]);

  function addImages(key: SectionKey, newFiles: FileList | File[] | null) {
    if (!newFiles) return;
    const arr = Array.from(newFiles)
      .filter((f) => f.type.startsWith("image/"))
      // Prints colados chegam todos como "image.png"; renomeia para distinguir
      .map((f, i) => (f.name === "image.png" ? new File([f], `print-${Date.now()}-${i}.png`, { type: f.type }) : f));
    setSectionImages((prev) => {
      if ((prev[key]?.length || 0) + arr.length > MAX_IMAGES) {
        setErrors((e) => ({ ...e, [key]: `Limite de ${MAX_IMAGES} imagens por seção. As excedentes foram ignoradas.` }));
      }
      return prev;
    });
    setSectionImages((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...arr].slice(0, MAX_IMAGES),
    }));
  }

  function removeImage(key: SectionKey, idx: number) {
    setErrors((e) => ({ ...e, [key]: "" }));
    setSectionImages((prev) => {
      const updated = [...(prev[key] || [])];
      updated.splice(idx, 1);
      return { ...prev, [key]: updated };
    });
  }

  const anyData = SECTIONS.some(
    (s) => findings[s.key].conteudo.trim().length > 0
  );

  return (
    <div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: "#1A1A1A", marginBottom: 8 }}>
        Passo 3 — Pesquisa Externa
      </h2>
      <p style={{ color: "#555", fontSize: 14, marginBottom: 8 }}>
        Site e Cenário Competitivo são buscados automaticamente. Instagram, LinkedIn e Posts precisam dos prints.
      </p>
      <div className="mb-6 p-3 rounded" style={{ backgroundColor: "#FFF5F5", border: "1px solid #FFCCCC" }}>
        <p style={{ color: "#C0392B", fontSize: 13 }}>
          <strong>Atenção:</strong> Complete ao menos uma seção antes de gerar o relatório. Cada análise pode levar até 30–60s.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {SECTIONS.map((s) => {
          const section = findings[s.key];
          const isLoading = section.status === "loading";
          const isDone   = section.status === "done" || section.conteudo.trim().length > 0;
          const isError  = section.status === "error";
          const imgs     = sectionImages[s.key] || [];

          return (
            <div
              key={s.key}
              className="bg-white rounded-xl border"
              style={{ borderColor: s.mode === "images" && pasteTarget === s.key ? "#F6BABC" : "#DEDEDE" }}
              onMouseEnter={s.mode === "images" ? () => setPasteTarget(s.key) : undefined}
              onClick={s.mode === "images" ? () => setPasteTarget(s.key) : undefined}
            >

              {/* Header da seção */}
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                  <div>
                    <h3 style={{ fontWeight: "bold", fontSize: 15, color: "#1A1A1A" }}>{s.label}</h3>
                    <p style={{ fontSize: 13, color: "#888" }}>{s.desc}</p>
                  </div>
                </div>

                {/* Botão de ação */}
                <button
                  onClick={() => research(s.key, s.mode)}
                  disabled={isLoading}
                  className="shrink-0 px-4 py-1.5 rounded text-sm font-medium cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  style={{
                    backgroundColor: isDone ? "#F4F4F4" : "#C0392B",
                    color: isDone ? "#555" : "#fff",
                    border: isDone ? "1px solid #DEDEDE" : "none",
                  }}
                >
                  {isLoading && (
                    <span className="w-3 h-3 border-2 rounded-full animate-spin"
                      style={{ borderColor: isDone ? "#aaa4" : "#fff4", borderTopColor: isDone ? "#555" : "#fff" }} />
                  )}
                  {isLoading
                    ? "Analisando..."
                    : isDone
                    ? "↺ Refazer"
                    : s.mode === "images"
                    ? "Analisar prints"
                    : "Pesquisar automaticamente"}
                </button>
              </div>

              {/* Upload de prints (só para seções de imagem) */}
              {s.mode === "images" && !isLoading && (
                <div className="px-4 pb-4" style={{ borderTop: "1px solid #F4F4F4" }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    ref={(el) => { fileInputRefs.current[s.key] = el; }}
                    onChange={(e) => addImages(s.key, e.target.files)}
                  />

                  {imgs.length === 0 ? (
                    <div
                      className="mt-3 rounded-lg border-2 border-dashed flex flex-col items-center justify-center py-6 cursor-pointer"
                      style={{ borderColor: "#DEDEDE", backgroundColor: "#FAFAFA" }}
                      onClick={() => fileInputRefs.current[s.key]?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); addImages(s.key, e.dataTransfer.files); }}
                    >
                      <span style={{ fontSize: 28, marginBottom: 6 }}>📎</span>
                      <p style={{ color: "#555", fontSize: 13 }}>Clique, arraste ou cole os prints aqui (Ctrl+V)</p>
                      <p style={{ color: "#AAA", fontSize: 12 }}>PNG, JPG • até {MAX_IMAGES} imagens</p>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {imgs.map((file, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`print ${i + 1}`}
                              className="w-20 h-20 object-cover rounded border"
                              style={{ borderColor: "#DEDEDE" }}
                            />
                            <button
                              onClick={() => removeImage(s.key, i)}
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs cursor-pointer"
                              style={{ backgroundColor: "#C0392B" }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {imgs.length < MAX_IMAGES && (
                          <div
                            className="w-20 h-20 rounded border-2 border-dashed flex items-center justify-center cursor-pointer"
                            style={{ borderColor: "#DEDEDE" }}
                            onClick={() => fileInputRefs.current[s.key]?.click()}
                          >
                            <span style={{ color: "#AAA", fontSize: 22 }}>+</span>
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: "#888" }}>{imgs.length} de {MAX_IMAGES} prints • Cole mais com Ctrl+V ou clique em "Analisar prints"</p>
                      {!isError && errors[s.key] && <p style={{ fontSize: 12, color: "#AA1738", marginTop: 4 }}>{errors[s.key]}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="px-4 pb-4 flex items-center gap-3" style={{ backgroundColor: "#FAFAFA", borderTop: "1px solid #F4F4F4" }}>
                  <div className="w-5 h-5 border-4 rounded-full animate-spin shrink-0"
                    style={{ borderColor: "#DEDEDE", borderTopColor: "#C0392B" }} />
                  <p style={{ color: "#555", fontSize: 13 }}>
                    {s.mode === "images" ? "Claude está analisando os prints..." : "Buscando e analisando o site..."}
                  </p>
                </div>
              )}

              {/* Erro */}
              {isError && errors[s.key] && (
                <div className="px-4 pb-4" style={{ backgroundColor: "#FFF5F5", borderTop: "1px solid #FFCCCC" }}>
                  <p style={{ color: "#C0392B", fontSize: 13, paddingTop: 12 }}>{errors[s.key]}</p>
                  <textarea
                    rows={5}
                    className="mt-3 w-full rounded border p-3 text-sm"
                    style={{ borderColor: "#DEDEDE", color: "#1A1A1A", fontFamily: "Arial, sans-serif" }}
                    placeholder="Ou adicione os achados manualmente..."
                    value={section.conteudo}
                    onChange={(e) => updateContent(s.key, e.target.value)}
                  />
                </div>
              )}

              {/* Resultado */}
              {isDone && !isLoading && (
                <div className="px-4 pb-4" style={{ borderTop: "1px solid #DEDEDE" }}>
                  <p style={{ fontSize: 12, color: "#888", paddingTop: 10, marginBottom: 6 }}>
                    {section.editado ? "✏️ Editado manualmente" : "✅ Gerado pelo Claude — edite se necessário"}
                  </p>
                  <textarea
                    rows={10}
                    className="w-full rounded border p-3 text-sm"
                    style={{ borderColor: "#DEDEDE", color: "#1A1A1A", fontFamily: "Arial, sans-serif", resize: "vertical" }}
                    value={section.conteudo}
                    onChange={(e) => updateContent(s.key, e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Notas adicionais */}
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: "#DEDEDE" }}>
          <h3 style={{ fontWeight: "bold", fontSize: 15, color: "#1A1A1A", marginBottom: 4 }}>
            📝 Notas Adicionais
          </h3>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
            Observações que não vieram da análise automática — contexto de reunião, impressões subjetivas, etc.
          </p>
          <textarea
            rows={4}
            className="w-full rounded border p-3 text-sm"
            style={{ borderColor: "#DEDEDE", color: "#1A1A1A", fontFamily: "Arial, sans-serif" }}
            placeholder="Ex: Cliente mencionou em reunião que está lançando um produto novo em julho..."
            value={findings.notasAdicionais}
            onChange={(e) => onChange({ ...findings, notasAdicionais: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded border text-sm cursor-pointer"
          style={{ borderColor: "#DEDEDE", color: "#555" }}
        >
          ← Voltar
        </button>
        <button
          onClick={onNext}
          className="px-8 py-2.5 rounded text-white text-sm font-medium cursor-pointer"
          style={{ backgroundColor: anyData ? "#C0392B" : "#AAAAAA" }}
        >
          Gerar Relatório →
        </button>
      </div>
    </div>
  );
}
