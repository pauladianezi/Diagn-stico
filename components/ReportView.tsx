"use client";

import { useLayoutEffect, useRef } from "react";
import { ClientAnswers, ReportContent } from "@/lib/types";
import { NIVEIS, SERVICOS, Nivel, toNivel } from "@/lib/services";

interface Props {
  answers: ClientAnswers;
  report: ReportContent;
  geradoEm?: string;
  onChange: (report: ReportContent) => void;
}

const SERIF = "var(--font-serif)";
const nivelCor = (n: Nivel) => `#${NIVEIS[n].cor}`;

// Texto editável direto na página. Salva ao sair do campo (blur).
function Ed({ value, onChange, style, placeholder }: {
  value: string; onChange: (v: string) => void; style?: React.CSSProperties; placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.textContent !== value) el.textContent = value;
  }, [value]);

  return (
    <div
      ref={ref}
      className="ed"
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck
      data-ph={placeholder}
      style={{ whiteSpace: "pre-wrap", ...style }}
      onPaste={(e) => {
        e.preventDefault();
        document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
      }}
      onBlur={(e) => {
        const v = e.currentTarget.innerText.replace(/\n+$/, "").trim();
        if (v !== value) onChange(v);
      }}
    />
  );
}

function RemoveBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className="no-print rm-btn">×</button>
  );
}

function AddBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="no-print add-btn">+ {children}</button>
  );
}

function Heading({ num, title }: { num: string; title: string }) {
  return (
    <div className="avoid-break" style={{ marginTop: 56 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "var(--grena)" }}>{num}</div>
      <h2 style={{ fontSize: 40, lineHeight: 1.1, color: "var(--dark)", marginTop: 4 }}>{title}</h2>
      <div style={{ borderBottom: "1px solid var(--grena)", margin: "14px 0 26px" }} />
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 26, color: "var(--grena)", marginTop: 34, marginBottom: 10 }}>{children}</h3>;
}

function Callout({ children, source }: { children: React.ReactNode; source?: React.ReactNode }) {
  return (
    <div className="avoid-break" style={{ display: "flex", background: "var(--rose-bg)", margin: "10px 0" }}>
      <div style={{ width: 6, background: "var(--grena)", flexShrink: 0 }} />
      <div style={{ padding: "18px 22px", flex: 1 }}>
        {children}
        {source}
      </div>
    </div>
  );
}

function ServiceBox({ label, desc, onLabel, onDesc }: {
  label: string; desc: string; onLabel: (v: string) => void; onDesc: (v: string) => void;
}) {
  return (
    <div className="avoid-break service-box" style={{ display: "flex", margin: "14px 0" }}>
      <div style={{ background: "var(--grena)", color: "#fff", padding: "16px 18px", width: 190, flexShrink: 0 }}>
        <div style={{ fontSize: 9, letterSpacing: 2.5, color: "var(--rose)" }}>GRENAH RECOMENDA</div>
        <Ed value={label} onChange={onLabel} placeholder="Serviço" style={{ fontFamily: SERIF, fontSize: 18, marginTop: 6, color: "#fff" }} />
      </div>
      <div style={{ background: "var(--rose-bg)", padding: "16px 20px", flex: 1 }}>
        <Ed value={desc} onChange={onDesc} placeholder="Como o serviço resolve este problema" style={{ fontSize: 13.5, lineHeight: 1.7 }} />
      </div>
    </div>
  );
}

const body: React.CSSProperties = { fontSize: 14, lineHeight: 1.8, margin: "10px 0" };

export default function ReportView({ answers, report, geradoEm, onChange }: Props) {
  function upd(fn: (d: ReportContent) => void) {
    const d: ReportContent = JSON.parse(JSON.stringify(report));
    fn(d);
    onChange(d);
  }

  const nivel = toNivel(report.maturidade?.nivel);
  const cf = report.consideracoesFinais;
  const data = new Date(geradoEm || Date.now()).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const mes = new Date(geradoEm || Date.now()).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <article className="report-paper">
      {/* Capa */}
      <header className="report-cover">
        <div style={{ fontFamily: SERIF, fontSize: 34, color: "var(--grena)", lineHeight: 1 }}>Grenah</div>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "var(--gray)", marginTop: 6 }}>ESTRATÉGIA, COMUNICAÇÃO &amp; DESIGN</div>

        <div style={{ marginTop: 110 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "var(--grena)" }}>DIAGNÓSTICO DE COMUNICAÇÃO</div>
          <h1 style={{ fontSize: 64, lineHeight: 1.05, margin: "14px 0 18px", color: "var(--dark)" }}>{answers.nomeEmpresa || "Cliente"}</h1>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 21, color: "var(--gray)" }}>
            Leitura da comunicação externa e caminhos para {answers.segmento || "o negócio"}
          </p>
          <div style={{ borderBottom: "1px solid var(--rose)", margin: "30px 0 10px" }} />
          <table style={{ fontSize: 13, borderCollapse: "collapse", width: "100%", maxWidth: 520 }}>
            <tbody>
              {[
                ["Empresa", answers.nomeEmpresa],
                ["Responsável", answers.nomeResponsavel],
                ["Segmento", answers.segmento],
                ["Data", data],
                ["Elaborado por", "Grenah"],
                ["Contato", "paula.dianezi@grenah.one  |  11 97376-0906"],
              ].map(([l, v]) => (
                <tr key={l} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "9px 14px 9px 0", fontSize: 10, letterSpacing: 2, color: "var(--grena)", width: 140 }}>{l.toUpperCase()}</td>
                  <td style={{ padding: "9px 0" }}>{v || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </header>

      {/* 01 Sumário executivo */}
      <section className="page-break">
        <Heading num="01" title="Sumário executivo" />

        {report.maturidade && (
          <div className="avoid-break">
            <div style={{ fontSize: 10, letterSpacing: 2.5, color: "var(--grena)", marginBottom: 10 }}>NÍVEL DE MATURIDADE DE COMUNICAÇÃO</div>
            <div style={{ display: "flex" }}>
              {(Object.keys(NIVEIS) as Nivel[]).map((n) => {
                const active = n === nivel;
                return (
                  <button
                    key={n}
                    type="button"
                    title="Clique para alterar o nível"
                    onClick={() => upd((d) => { d.maturidade.nivel = n; })}
                    className="nivel-box"
                    style={{
                      flex: 1, padding: "14px 10px", textAlign: "center", cursor: "pointer",
                      border: `1px solid ${nivelCor(n)}`, background: active ? nivelCor(n) : "#fff",
                      color: active && n === "Grenah" ? "#fff" : active ? "var(--dark)" : "var(--gray)",
                    }}
                  >
                    <div style={{ fontFamily: SERIF, fontSize: active ? 26 : 20 }}>{n}</div>
                    <div style={{ fontSize: 11, marginTop: 2 }}>{NIVEIS[n].lema}</div>
                  </button>
                );
              })}
            </div>
            <Ed
              value={report.maturidade.justificativa}
              onChange={(v) => upd((d) => { d.maturidade.justificativa = v; })}
              style={{ fontSize: 13.5, lineHeight: 1.75, color: "var(--gray)", marginTop: 14 }}
            />
          </div>
        )}

        <div style={{ height: 22 }} />
        <Callout
          source={
            <Ed
              value={report.sumarioExecutivo.fonte_achado}
              onChange={(v) => upd((d) => { d.sumarioExecutivo.fonte_achado = v; })}
              placeholder="Fonte"
              style={{ fontSize: 11, color: "var(--gray)", marginTop: 6 }}
            />
          }
        >
          <Ed
            value={report.sumarioExecutivo.achado_critico}
            onChange={(v) => upd((d) => { d.sumarioExecutivo.achado_critico = v; })}
            style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, lineHeight: 1.4 }}
          />
        </Callout>

        {(["paragrafo1", "paragrafo2", "paragrafo3"] as const).map((k) => (
          <Ed key={k} value={report.sumarioExecutivo[k]} onChange={(v) => upd((d) => { d.sumarioExecutivo[k] = v; })} style={body} />
        ))}

        <SubHeading>Achados centrais</SubHeading>
        {report.sumarioExecutivo.bullets.map((b, i) => (
          <div key={i} className="avoid-break row-hover" style={{ display: "flex", gap: 12, alignItems: "flex-start", margin: "8px 0" }}>
            <span style={{ color: "var(--grena)", fontSize: 9, marginTop: 8 }}>●</span>
            <Ed value={b} onChange={(v) => upd((d) => { d.sumarioExecutivo.bullets[i] = v; })} style={{ fontSize: 14, lineHeight: 1.7, flex: 1 }} />
            <RemoveBtn label="Remover achado" onClick={() => upd((d) => { d.sumarioExecutivo.bullets.splice(i, 1); })} />
          </div>
        ))}
        <AddBtn onClick={() => upd((d) => { d.sumarioExecutivo.bullets.push("Novo achado"); })}>Adicionar achado</AddBtn>
      </section>

      {/* 02 Plano de ação */}
      <section className="page-break">
        <Heading num="02" title="Plano de ação" />
        <Ed value={report.planoDeAcao.introducao} onChange={(v) => upd((d) => { d.planoDeAcao.introducao = v; })} style={body} />

        {report.planoDeAcao.acoes.map((a, i) => (
          <div key={i} className="avoid-break row-hover" style={{ marginTop: 28 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, color: "var(--grena)", width: 64, flexShrink: 0 }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ flex: 1 }}>
                <Ed value={a.titulo} onChange={(v) => upd((d) => { d.planoDeAcao.acoes[i].titulo = v; })} style={{ fontFamily: SERIF, fontSize: 25 }} />
                <Ed value={a.prazo} onChange={(v) => upd((d) => { d.planoDeAcao.acoes[i].prazo = v; })} placeholder="Prazo" style={{ fontSize: 10, letterSpacing: 2, color: "var(--grena)", marginTop: 4, textTransform: "uppercase" }} />
                <Ed value={a.descricao} onChange={(v) => upd((d) => { d.planoDeAcao.acoes[i].descricao = v; })} style={{ ...body, color: "var(--gray)", fontSize: 13.5 }} />
              </div>
              <RemoveBtn label="Remover ação" onClick={() => upd((d) => { d.planoDeAcao.acoes.splice(i, 1); d.planoDeAcao.acoes.forEach((x, n) => { x.numero = n + 1; }); })} />
            </div>
            <ServiceBox
              label={a.servicoLabel} desc={a.servicoDesc}
              onLabel={(v) => upd((d) => { d.planoDeAcao.acoes[i].servicoLabel = v; })}
              onDesc={(v) => upd((d) => { d.planoDeAcao.acoes[i].servicoDesc = v; })}
            />
          </div>
        ))}
        <AddBtn onClick={() => upd((d) => { d.planoDeAcao.acoes.push({ numero: d.planoDeAcao.acoes.length + 1, prazo: "", titulo: "Nova ação", descricao: "", servicoLabel: "", servicoDesc: "" }); })}>Adicionar ação</AddBtn>
      </section>

      {/* 03 Diagnóstico detalhado */}
      <section className="page-break">
        <Heading num="03" title="Diagnóstico detalhado" />
        <Ed
          value={report.diagnosticoDetalhado.introducao}
          onChange={(v) => upd((d) => { d.diagnosticoDetalhado.introducao = v; })}
          style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, color: "var(--gray)", lineHeight: 1.5 }}
        />
        {report.diagnosticoDetalhado.subsecoes.map((s, i) => (
          <div key={i} className="row-hover">
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 36 }}>
              <span style={{ fontFamily: SERIF, fontSize: 26, color: "var(--grena)" }}>3.{i + 1}</span>
              <Ed value={s.titulo} onChange={(v) => upd((d) => { d.diagnosticoDetalhado.subsecoes[i].titulo = v; })} style={{ fontFamily: SERIF, fontSize: 26, color: "var(--grena)", flex: 1 }} />
              <RemoveBtn label="Remover seção" onClick={() => upd((d) => { d.diagnosticoDetalhado.subsecoes.splice(i, 1); })} />
            </div>
            <Ed value={s.analise} onChange={(v) => upd((d) => { d.diagnosticoDetalhado.subsecoes[i].analise = v; })} style={body} />
            {s.citacao ? (
              <Callout
                source={
                  <Ed value={s.fonteCitacao || ""} onChange={(v) => upd((d) => { d.diagnosticoDetalhado.subsecoes[i].fonteCitacao = v; })} placeholder="Fonte" style={{ fontSize: 11, color: "var(--gray)", marginTop: 6 }} />
                }
              >
                <Ed value={s.citacao} onChange={(v) => upd((d) => { d.diagnosticoDetalhado.subsecoes[i].citacao = v; })} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, lineHeight: 1.45 }} />
              </Callout>
            ) : null}
            <ServiceBox
              label={s.servicoLabel} desc={s.servicoDesc}
              onLabel={(v) => upd((d) => { d.diagnosticoDetalhado.subsecoes[i].servicoLabel = v; })}
              onDesc={(v) => upd((d) => { d.diagnosticoDetalhado.subsecoes[i].servicoDesc = v; })}
            />
          </div>
        ))}
      </section>

      {/* 04 Considerações finais */}
      {cf && (
        <section className="page-break">
          <Heading num="04" title="Considerações finais" />
          {report.maturidade && (
            <p style={{ fontSize: 12, color: "var(--gray)", marginBottom: 6 }}>
              Nível de maturidade:{" "}
              <span style={{ fontFamily: SERIF, fontSize: 22, color: "var(--grena)" }}>{nivel}</span>
              <span style={{ marginLeft: 10 }}>{NIVEIS[nivel].lema}</span>
            </p>
          )}
          {cf.paragrafos.map((p, i) => (
            <div key={i} className="row-hover" style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Ed value={p} onChange={(v) => upd((d) => { d.consideracoesFinais.paragrafos[i] = v; })} style={{ ...body, flex: 1 }} />
              <RemoveBtn label="Remover parágrafo" onClick={() => upd((d) => { d.consideracoesFinais.paragrafos.splice(i, 1); })} />
            </div>
          ))}
          <AddBtn onClick={() => upd((d) => { d.consideracoesFinais.paragrafos.push("Novo parágrafo"); })}>Adicionar parágrafo</AddBtn>

          <SubHeading>Trilha de comunicação recomendada</SubHeading>
          <p style={{ fontSize: 12.5, fontStyle: "italic", color: "var(--gray)", marginBottom: 18 }}>
            Os serviços estão em ordem de prioridade. A cor indica o nível de maturidade a que cada um pertence na esteira Grenah.
          </p>

          {cf.trilha.map((t, i) => {
            const n = toNivel(t.nivel);
            const known = SERVICOS.some((s) => s.nome === t.servico);
            return (
              <div key={i} className="avoid-break row-hover" style={{ display: "flex", margin: "0 0 18px" }}>
                <div style={{ width: 6, background: nivelCor(n), flexShrink: 0 }} />
                <div style={{ padding: "6px 0 10px 20px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 24 }}>{String(i + 1).padStart(2, "0")}</span>
                    <select
                      className="no-print svc-select"
                      value={t.servico}
                      onChange={(e) => upd((d) => {
                        const s = SERVICOS.find((x) => x.nome === e.target.value);
                        d.consideracoesFinais.trilha[i].servico = e.target.value;
                        if (s) { d.consideracoesFinais.trilha[i].nivel = s.nivel; d.consideracoesFinais.trilha[i].entregaveis = s.entregaveis.split(", ").slice(0, 4); }
                      })}
                    >
                      {!known && <option value={t.servico}>{t.servico}</option>}
                      {(Object.keys(NIVEIS) as Nivel[]).map((lv) => (
                        <optgroup key={lv} label={`Nível ${lv}`}>
                          {SERVICOS.filter((s) => s.nivel === lv).map((s) => <option key={s.nome + lv} value={s.nome}>{s.nome}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <span className="print-only" style={{ fontFamily: SERIF, fontSize: 24 }}>{t.servico}</span>
                    <span style={{ flex: 1 }} />
                    <RemoveBtn label="Remover serviço" onClick={() => upd((d) => { d.consideracoesFinais.trilha.splice(i, 1); })} />
                  </div>
                  <div style={{ fontSize: 9.5, letterSpacing: 2.5, color: "var(--grena)", margin: "2px 0 8px" }}>NÍVEL {n.toUpperCase()}</div>
                  <Ed value={t.motivo} onChange={(v) => upd((d) => { d.consideracoesFinais.trilha[i].motivo = v; })} style={{ fontSize: 13.5, lineHeight: 1.7 }} />
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray)", margin: "12px 0 4px" }}>Entregáveis</div>
                  {t.entregaveis.map((e, k) => (
                    <div key={k} className="row-hover" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: "var(--grena)", fontSize: 8, marginTop: 7 }}>●</span>
                      <Ed value={e} onChange={(v) => upd((d) => { d.consideracoesFinais.trilha[i].entregaveis[k] = v; })} style={{ fontSize: 12.5, color: "var(--gray)", lineHeight: 1.6, flex: 1 }} />
                      <RemoveBtn label="Remover entregável" onClick={() => upd((d) => { d.consideracoesFinais.trilha[i].entregaveis.splice(k, 1); })} />
                    </div>
                  ))}
                  <AddBtn onClick={() => upd((d) => { d.consideracoesFinais.trilha[i].entregaveis.push("Novo entregável"); })}>Adicionar entregável</AddBtn>
                </div>
              </div>
            );
          })}
          <AddBtn onClick={() => upd((d) => { d.consideracoesFinais.trilha.push({ servico: SERVICOS[0].nome, nivel: SERVICOS[0].nivel, motivo: "", entregaveis: [] }); })}>Adicionar serviço à trilha</AddBtn>

          <SubHeading>Próximos passos</SubHeading>
          <Ed value={cf.proximosPassos} onChange={(v) => upd((d) => { d.consideracoesFinais.proximosPassos = v; })} style={body} />
        </section>
      )}

      {/* Encerramento */}
      <footer className="page-break" style={{ textAlign: "center", paddingTop: 140 }}>
        <div style={{ fontFamily: SERIF, fontSize: 56, color: "var(--grena)", lineHeight: 1 }}>Grenah</div>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "var(--gray)", marginTop: 8 }}>ESTRATÉGIA, COMUNICAÇÃO &amp; DESIGN</div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 24, margin: "44px 0 36px" }}>Toda marca tem seu tempo de maturação.</p>
        <div style={{ display: "inline-block", borderTop: "1px solid var(--verde)", paddingTop: 20, fontSize: 12, color: "var(--gray)" }}>
          grenah.one &nbsp;|&nbsp; paula.dianezi@grenah.one &nbsp;|&nbsp; 11 97376-0906
        </div>
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 40, textTransform: "capitalize" }}>{mes}</div>
      </footer>
    </article>
  );
}
