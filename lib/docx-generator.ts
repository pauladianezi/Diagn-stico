import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, Header, Footer,
  ShadingType, convertMillimetersToTwip, PageBreak,
} from "docx";
import { ClientAnswers, ReportContent, ActionItem } from "./types";
import { NIVEIS, Nivel } from "./services";

// Paleta oficial (Brand Design System Grenah)
const GRENA = "AA1738";
const ROSE  = "F6BABC";
const VERDE = "E2E9AE";
const WHITE = "FFFFFF";
const DARK  = "2B2B2B";
const GRAY  = "6B6B6B";
const LINE  = "E6E6E6";
const ROSE_BG = "FDF1F1";

// Tipografia oficial: Minion (títulos) e Montserrat (texto)
const SERIF = "Minion Variable Concept";
const SANS  = "Montserrat";

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const cellNoBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noTableBorders: any = { ...cellNoBorders, insideH: noBorder, insideV: noBorder };

function run(text: string, opts: { font?: string; size?: number; color?: string; bold?: boolean; italics?: boolean; spacing?: number } = {}) {
  return new TextRun({
    text,
    font: opts.font ?? SANS,
    size: opts.size ?? 20,
    color: opts.color ?? DARK,
    bold: opts.bold,
    italics: opts.italics,
    characterSpacing: opts.spacing,
  });
}

function sp(space: number) {
  return new Paragraph({ spacing: { before: space } });
}

function rule(color = GRENA) {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color } },
    spacing: { before: 200, after: 200 },
  });
}

function callout(text: string, source: string) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noTableBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 120, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: GRENA, fill: GRENA },
            borders: cellNoBorders,
            children: [new Paragraph({ text: "" })],
          }),
          new TableCell({
            shading: { type: ShadingType.CLEAR, color: ROSE_BG, fill: ROSE_BG },
            borders: cellNoBorders,
            margins: { top: 200, bottom: 200, left: 280, right: 280 },
            children: [
              new Paragraph({ children: [run(`“${text}”`, { font: SERIF, size: 24, italics: true })] }),
              ...(source
                ? [new Paragraph({ children: [run(source, { size: 16, color: GRAY })], spacing: { before: 100 } })]
                : []),
            ],
          }),
        ],
      }),
    ],
  });
}

function grenahService(label: string, desc: string) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noTableBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 2400, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: GRENA, fill: GRENA },
            borders: cellNoBorders,
            margins: { top: 180, bottom: 180, left: 220, right: 180 },
            children: [
              new Paragraph({ children: [run("GRENAH RECOMENDA", { size: 13, color: ROSE, bold: true, spacing: 40 })] }),
              new Paragraph({ children: [run(label, { font: SERIF, size: 22, color: WHITE })], spacing: { before: 100 } }),
            ],
          }),
          new TableCell({
            shading: { type: ShadingType.CLEAR, color: ROSE_BG, fill: ROSE_BG },
            borders: cellNoBorders,
            margins: { top: 180, bottom: 180, left: 260, right: 260 },
            children: [new Paragraph({ children: [run(desc, { size: 19 })], spacing: { line: 300 } })],
          }),
        ],
      }),
    ],
  });
}

function actionItem(item: ActionItem) {
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noTableBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 900, type: WidthType.DXA },
            borders: cellNoBorders,
            margins: { top: 80, bottom: 80, right: 160 },
            children: [new Paragraph({ children: [run(String(item.numero).padStart(2, "0"), { font: SERIF, size: 56, color: GRENA })] })],
          }),
          new TableCell({
            borders: cellNoBorders,
            margins: { top: 100, bottom: 80 },
            children: [
              new Paragraph({ children: [run(item.titulo, { font: SERIF, size: 26 })] }),
              new Paragraph({ children: [run(item.prazo.toUpperCase(), { size: 14, color: GRENA, spacing: 40 })], spacing: { before: 60 } }),
              new Paragraph({ children: [run(item.descricao, { size: 19, color: GRAY })], spacing: { before: 100, line: 300 } }),
            ],
          }),
        ],
      }),
    ],
  });
  return [table, sp(80), grenahService(item.servicoLabel, item.servicoDesc), sp(240)];
}

function summaryLine(text: string) {
  return new Paragraph({
    children: [run("●   ", { size: 14, color: GRENA }), run(text)],
    indent: { left: 360, hanging: 360 },
    spacing: { before: 120, line: 300 },
  });
}

function sectionHeading(num: string, title: string) {
  return [
    new Paragraph({ children: [run(num, { size: 16, color: GRENA, spacing: 60 })], spacing: { before: 200 } }),
    new Paragraph({ children: [run(title, { font: SERIF, size: 44 })], spacing: { before: 60 } }),
    rule(),
  ];
}

function subheading(text: string) {
  return new Paragraph({
    children: [run(text, { font: SERIF, size: 28, color: GRENA })],
    spacing: { before: 360, after: 120 },
  });
}

function bodyPara(text: string) {
  return new Paragraph({
    children: [run(text)],
    spacing: { before: 120, line: 320 },
  });
}

function toNivel(n: string | undefined): Nivel {
  const s = (n || "").toLowerCase();
  if (s.startsWith("verde")) return "Verde";
  if (s.startsWith("ros")) return "Rosé";
  return "Grenah";
}

// Selo de maturidade: os três níveis lado a lado, com o nível da marca preenchido na cor dele
function maturityBlock(nivelRaw: string, justificativa: string) {
  const nivel = toNivel(nivelRaw);
  const cells = (Object.keys(NIVEIS) as Nivel[]).map((n) => {
    const active = n === nivel;
    const fill = active ? NIVEIS[n].cor : WHITE;
    const textColor = active && n === "Grenah" ? WHITE : DARK;
    return new TableCell({
      shading: { type: ShadingType.CLEAR, color: fill, fill },
      borders: { top: { style: BorderStyle.SINGLE, size: 4, color: NIVEIS[n].cor }, bottom: { style: BorderStyle.SINGLE, size: 4, color: NIVEIS[n].cor }, left: { style: BorderStyle.SINGLE, size: 4, color: NIVEIS[n].cor }, right: { style: BorderStyle.SINGLE, size: 4, color: NIVEIS[n].cor } },
      margins: { top: 140, bottom: 140, left: 160, right: 160 },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [run(n, { font: SERIF, size: active ? 30 : 24, color: active ? textColor : GRAY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [run(NIVEIS[n].lema, { size: 15, color: active ? textColor : GRAY })], spacing: { before: 40 } }),
      ],
    });
  });
  return [
    new Paragraph({ children: [run("NÍVEL DE MATURIDADE DE COMUNICAÇÃO", { size: 14, color: GRENA, spacing: 40 })], spacing: { before: 120, after: 120 } }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: cells })] }),
    new Paragraph({ children: [run(justificativa, { size: 19, color: GRAY })], spacing: { before: 140, line: 300 } }),
  ];
}

function trilhaItem(t: ReportContent["consideracoesFinais"]["trilha"][number], i: number) {
  const nivel = toNivel(t.nivel);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noTableBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 120, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: NIVEIS[nivel].cor, fill: NIVEIS[nivel].cor },
            borders: cellNoBorders,
            children: [new Paragraph({ text: "" })],
          }),
          new TableCell({
            borders: cellNoBorders,
            margins: { top: 120, bottom: 160, left: 260, right: 120 },
            children: [
              new Paragraph({ children: [run(`${String(i + 1).padStart(2, "0")}   ${t.servico}`, { font: SERIF, size: 26 })] }),
              new Paragraph({ children: [run(`NÍVEL ${nivel.toUpperCase()}`, { size: 13, color: GRENA, spacing: 40 })], spacing: { before: 40 } }),
              new Paragraph({ children: [run(t.motivo, { size: 19 })], spacing: { before: 100, line: 300 } }),
              new Paragraph({ children: [run("Entregáveis", { size: 16, color: GRAY, bold: true })], spacing: { before: 120 } }),
              ...(t.entregaveis || []).map((e) =>
                new Paragraph({ children: [run("●   ", { size: 12, color: GRENA }), run(e, { size: 18, color: GRAY })], indent: { left: 300, hanging: 300 }, spacing: { before: 40 } })
              ),
            ],
          }),
        ],
      }),
    ],
  });
}

function makeHeader(nomeCliente: string, mes: string) {
  return new Header({
    children: [
      new Paragraph({
        children: [
          run("Grenah", { font: SERIF, size: 20, color: GRENA }),
          run(`     Diagnóstico de Comunicação  |  ${nomeCliente}  |  ${mes}`, { size: 14, color: GRAY }),
        ],
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE } },
        spacing: { after: 120 },
      }),
    ],
  });
}

function makeFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE } },
        children: [run("ESTRATÉGIA, COMUNICAÇÃO & DESIGN   |   grenah.one   |   Documento confidencial", { size: 13, color: GRAY, spacing: 30 })],
        spacing: { before: 120 },
      }),
    ],
  });
}

function makeCover(answers: ClientAnswers) {
  const dataHoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  return [
    new Paragraph({ children: [run("Grenah", { font: SERIF, size: 40, color: GRENA })], spacing: { before: 200 } }),
    new Paragraph({ children: [run("ESTRATÉGIA, COMUNICAÇÃO & DESIGN", { size: 13, color: GRAY, spacing: 60 })] }),
    sp(1600),
    new Paragraph({ children: [run("DIAGNÓSTICO DE COMUNICAÇÃO", { size: 16, color: GRENA, spacing: 60 })] }),
    new Paragraph({ children: [run(answers.nomeEmpresa || "Cliente", { font: SERIF, size: 80 })], spacing: { before: 160 } }),
    new Paragraph({
      children: [run(`Leitura da comunicação externa e caminhos para ${answers.segmento || "o negócio"}`, { font: SERIF, size: 26, italics: true, color: GRAY })],
      spacing: { before: 200 },
    }),
    rule(ROSE),
    new Table({
      width: { size: 6400, type: WidthType.DXA },
      borders: { ...noTableBorders, insideH: { style: BorderStyle.SINGLE, size: 2, color: LINE } },
      rows: [
        ["Empresa", answers.nomeEmpresa],
        ["Responsável", answers.nomeResponsavel],
        ["Segmento", answers.segmento],
        ["Data", dataHoje],
        ["Elaborado por", "Grenah"],
        ["Contato", "paula.dianezi@grenah.one  |  11 97376-0906"],
      ].map(([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 1900, type: WidthType.DXA },
              borders: cellNoBorders,
              margins: { top: 90, bottom: 90, right: 160 },
              children: [new Paragraph({ children: [run(label.toUpperCase(), { size: 14, color: GRENA, spacing: 30 })] })],
            }),
            new TableCell({
              borders: cellNoBorders,
              margins: { top: 90, bottom: 90 },
              children: [new Paragraph({ children: [run(value || "", { size: 18 })] })],
            }),
          ],
        })
      ),
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

export async function generateDocx(answers: ClientAnswers, report: ReportContent): Promise<Buffer> {
  const mesAno = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const section01: (Paragraph | Table)[] = [
    ...sectionHeading("01", "Sumário executivo"),
    ...(report.maturidade ? [...maturityBlock(report.maturidade.nivel, report.maturidade.justificativa), sp(240)] : []),
    callout(report.sumarioExecutivo.achado_critico, report.sumarioExecutivo.fonte_achado),
    sp(160),
    bodyPara(report.sumarioExecutivo.paragrafo1),
    bodyPara(report.sumarioExecutivo.paragrafo2),
    bodyPara(report.sumarioExecutivo.paragrafo3),
    subheading("Achados centrais"),
    ...report.sumarioExecutivo.bullets.map(summaryLine),
  ];

  const section02: (Paragraph | Table)[] = [
    new Paragraph({ children: [new PageBreak()] }),
    ...sectionHeading("02", "Plano de ação"),
    bodyPara(report.planoDeAcao.introducao),
    sp(240),
    ...report.planoDeAcao.acoes.flatMap(actionItem),
  ];

  const subsecoes = report.diagnosticoDetalhado.subsecoes.flatMap((sub, i) => {
    const items: (Paragraph | Table)[] = [subheading(`3.${i + 1}  ${sub.titulo}`), bodyPara(sub.analise)];
    if (sub.citacao) items.push(sp(120), callout(sub.citacao, sub.fonteCitacao || ""));
    items.push(sp(160), grenahService(sub.servicoLabel, sub.servicoDesc), sp(200));
    return items;
  });

  const section03: (Paragraph | Table)[] = [
    new Paragraph({ children: [new PageBreak()] }),
    ...sectionHeading("03", "Diagnóstico detalhado"),
    new Paragraph({
      children: [run(report.diagnosticoDetalhado.introducao, { font: SERIF, size: 24, italics: true, color: GRAY })],
      spacing: { after: 200 },
    }),
    ...subsecoes,
  ];

  const cf = report.consideracoesFinais;
  const section04: (Paragraph | Table)[] = cf
    ? [
        new Paragraph({ children: [new PageBreak()] }),
        ...sectionHeading("04", "Considerações finais"),
        ...(report.maturidade ? [new Paragraph({
          children: [
            run("Nível de maturidade: ", { size: 16, color: GRAY, spacing: 20 }),
            run(toNivel(report.maturidade.nivel), { font: SERIF, size: 26, color: GRENA }),
            run(`   ${NIVEIS[toNivel(report.maturidade.nivel)].lema}`, { size: 16, color: GRAY }),
          ],
          spacing: { after: 120 },
        })] : []),
        ...(cf.paragrafos || []).map(bodyPara),
        subheading("Trilha de comunicação recomendada"),
        new Paragraph({
          children: [run("Os serviços estão em ordem de prioridade. A cor indica o nível de maturidade a que cada um pertence na esteira Grenah.", { size: 17, color: GRAY, italics: true })],
          spacing: { after: 200 },
        }),
        ...(cf.trilha || []).flatMap((t, i) => [trilhaItem(t, i), sp(160)]),
        subheading("Próximos passos"),
        bodyPara(cf.proximosPassos),
      ]
    : [];

  const closing: (Paragraph | Table)[] = [
    new Paragraph({ children: [new PageBreak()] }),
    sp(2400),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [run("Grenah", { font: SERIF, size: 56, color: GRENA })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [run("ESTRATÉGIA, COMUNICAÇÃO & DESIGN", { size: 14, color: GRAY, spacing: 60 })] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [run("Toda marca tem seu tempo de maturação.", { font: SERIF, size: 26, italics: true })],
      spacing: { before: 480 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: VERDE } },
      children: [run("grenah.one   |   paula.dianezi@grenah.one   |   11 97376-0906", { size: 16, color: GRAY })],
      spacing: { before: 480 },
    }),
  ];

  const doc = new Document({
    styles: { default: { document: { run: { font: SANS, size: 20, color: DARK } } } },
    sections: [
      {
        properties: {
          page: {
            margin: { top: convertMillimetersToTwip(25), bottom: convertMillimetersToTwip(25), left: convertMillimetersToTwip(28), right: convertMillimetersToTwip(28) },
          },
        },
        headers: { default: makeHeader(answers.nomeEmpresa, mesAno) },
        footers: { default: makeFooter() },
        children: [...makeCover(answers), ...section01, ...section02, ...section03, ...section04, ...closing],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
