"use client";

import { ClientAnswers } from "@/lib/types";

interface Props {
  answers: ClientAnswers;
  onChange: (answers: ClientAnswers) => void;
  onNext: () => void;
  onBack: () => void;
}

function Field({
  label, field, value, onChange, placeholder, multiline,
}: {
  label: string;
  field: keyof ClientAnswers;
  value: string;
  onChange: (f: keyof ClientAnswers, v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const base = {
    width: "100%", border: "1px solid #DEDEDE", borderRadius: 6,
    padding: "8px 12px", fontSize: 14, color: "#1A1A1A",
    backgroundColor: "#FAFAFA", outline: "none", fontFamily: "Arial, sans-serif",
    resize: "vertical" as const,
  };
  return (
    <div className="mb-4">
      <label style={{ fontSize: 12, fontWeight: "bold", color: "#C0392B", letterSpacing: 1, display: "block", marginBottom: 4, textTransform: "uppercase" }}>
        {label}
      </label>
      {multiline ? (
        <textarea rows={3} style={base} value={value} placeholder={placeholder} onChange={(e) => onChange(field, e.target.value)} />
      ) : (
        <input type="text" style={base} value={value} placeholder={placeholder} onChange={(e) => onChange(field, e.target.value)} />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#1A1A1A", borderBottom: "2px solid #C0392B", paddingBottom: 6, marginBottom: 16 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function Step2Review({ answers, onChange, onNext, onBack }: Props) {
  function set(field: keyof ClientAnswers, value: string) {
    onChange({ ...answers, [field]: value });
  }

  const isValid = answers.nomeEmpresa.trim().length > 0;

  return (
    <div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: "#1A1A1A", marginBottom: 8 }}>
        Passo 2 — Revisar Respostas do Cliente
      </h2>
      <p style={{ color: "#555", fontSize: 14, marginBottom: 32 }}>
        Verifique e corrija as informações extraídas. Elas servem como contexto para a análise — não como fonte primária.
      </p>

      <Section title="Identificação">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nome da Empresa" field="nomeEmpresa" value={answers.nomeEmpresa} onChange={set} placeholder="Ex: IAgentics" />
          <Field label="Nome do Responsável" field="nomeResponsavel" value={answers.nomeResponsavel} onChange={set} placeholder="Ex: João Silva" />
          <Field label="Segmento / Setor" field="segmento" value={answers.segmento} onChange={set} placeholder="Ex: Software B2B, SaaS, Consultoria" />
        </div>
      </Section>

      <Section title="Bloco 01 — O Negócio">
        <Field label="Proposta de Valor Declarada" field="propostaDeValor" value={answers.propostaDeValor} onChange={set} multiline placeholder="O que o cliente acha que vende..." />
        <Field label="Diferencial Declarado" field="diferencial" value={answers.diferencial} onChange={set} multiline placeholder="O que o cliente acha que o diferencia..." />
      </Section>

      <Section title="Bloco 02 — Público-Alvo">
        <Field label="Público-Alvo" field="publicoAlvo" value={answers.publicoAlvo} onChange={set} multiline />
        <Field label="Dor Principal do Cliente" field="dorPrincipal" value={answers.dorPrincipal} onChange={set} multiline />
        <Field label="Objeções Identificadas" field="objecoes" value={answers.objecoes} onChange={set} multiline />
      </Section>

      <Section title="Bloco 03 — Mercado e Concorrência">
        <Field label="Concorrentes Citados" field="concorrentes" value={answers.concorrentes} onChange={set} multiline />
        <Field label="Nível de Investimento em Comunicação" field="nivelInvestimento" value={answers.nivelInvestimento} onChange={set} />
      </Section>

      <Section title="Bloco 04 — Identidade da Marca">
        <Field label="Valores da Marca" field="valoresMarca" value={answers.valoresMarca} onChange={set} multiline />
        <Field label="Personalidade da Marca" field="personalidadeMarca" value={answers.personalidadeMarca} onChange={set} multiline />
      </Section>

      <Section title="Bloco 05 — Comunicação Atual">
        <Field label="Canais Ativos" field="canaisAtivos" value={answers.canaisAtivos} onChange={set} />
        <Field label="O que funciona" field="oQueFunciona" value={answers.oQueFunciona} onChange={set} multiline />
        <Field label="O que não funciona" field="oQueNaoFunciona" value={answers.oQueNaoFunciona} onChange={set} multiline />
        <Field label="Posts de Destaque (links)" field="postsDestaque" value={answers.postsDestaque} onChange={set} multiline placeholder="Cole os links dos posts que o cliente indicou como melhores resultados" />
      </Section>

      <Section title="Bloco 06 — Presença Digital">
        <Field label="URL do Site" field="urlSite" value={answers.urlSite} onChange={set} placeholder="https://..." />
        <Field label="Redes Sociais (@ ou link)" field="redesSociais" value={answers.redesSociais} onChange={set} placeholder="@empresa no Instagram, linkedin.com/company/..." />
        <Field label="Canais Abandonados" field="canaisAbandonados" value={answers.canaisAbandonados} onChange={set} />
        <Field label="Responsável pelo Conteúdo" field="responsavelConteudo" value={answers.responsavelConteudo} onChange={set} />
        <Field label="Autopercepção da Presença Digital" field="autopercepçãoDigital" value={answers.autopercepçãoDigital} onChange={set} multiline />
      </Section>

      <Section title="Bloco 07 — Identidade Visual">
        <Field label="Identidade Visual Atual" field="identidadeVisual" value={answers.identidadeVisual} onChange={set} multiline />
      </Section>

      <Section title="Bloco 08 — Expectativas">
        <Field label="Principal Expectativa do Diagnóstico" field="expectativaDiagnostico" value={answers.expectativaDiagnostico} onChange={set} multiline />
      </Section>

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="px-6 py-2.5 rounded border text-sm cursor-pointer" style={{ borderColor: "#DEDEDE", color: "#555" }}>
          ← Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="px-8 py-2.5 rounded text-white text-sm font-medium cursor-pointer disabled:opacity-40"
          style={{ backgroundColor: "#C0392B" }}
        >
          Iniciar Pesquisa Externa →
        </button>
      </div>
    </div>
  );
}
