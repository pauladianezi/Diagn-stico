import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, Header, Footer,
  PageNumber, NumberFormat, HeadingLevel, ShadingType,
  convertMillimetersToTwip, PageBreak, Tab, TabStopPosition, TabStopType,
} from "docx";
import { ClientAnswers, ReportContent, ActionItem } from "./types";

const RED   = "C0392B";
const DARK  = "1A1A1A";
const GRAY  = "555555";
const LGRAY = "F4F4F4";
const MGRAY = "DEDEDE";
const WHITE = "FFFFFF";
const DRED  = "7B1A1A";

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noTableBorders: any = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideH: noBorder, insideV: noBorder };

function sp(space: number) {
  return new Paragraph({ spacing: { before: space } });
}

function hrRed() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: RED } },
    spacing: { before: 240, after: 240 },
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
            width: { size: 160, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: RED, fill: RED },
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            children: [new Paragraph({ text: "" })],
          }),
          new TableCell({
            shading: { type: ShadingType.CLEAR, color: LGRAY, fill: LGRAY },
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            margins: { top: 160, bottom: 160, left: 240, right: 240 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `"${text}"`, font: "Georgia", size: 21, italics: true, color: DARK }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `â€” ${source}`, font: "Arial", size: 17, color: GRAY }),
                ],
                spacing: { before: 80 },
              }),
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
            width: { size: 2200, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: DRED, fill: DRED },
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            margins: { top: 160, bottom: 160, left: 200, right: 160 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: "GRENAH", font: "Arial", size: 14, bold: true, color: "E8A09A", characterSpacing: 40 })],
              }),
              new Paragraph({
                children: [new TextRun({ text: "RECOMENDA", font: "Arial", size: 14, bold: true, color: "E8A09A", characterSpacing: 40 })],
              }),
              new Paragraph({
                children: [new TextRun({ text: label, font: "Georgia", size: 18, bold: true, color: WHITE })],
                spacing: { before: 80 },
              }),
            ],
          }),
          new TableCell({
            shading: { type: ShadingType.CLEAR, color: LGRAY, fill: LGRAY },
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            margins: { top: 160, bottom: 160, left: 240, right: 240 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: desc, font: "Arial", size: 20, color: DARK })],
              }),
            ],
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
            width: { size: 800, type: WidthType.DXA },
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            margins: { top: 80, bottom: 80, right: 160 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: `0${item.numero}`, font: "Georgia", size: 52, bold: true, color: RED })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 1400, type: WidthType.DXA },
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            margins: { top: 80, bottom: 80, right: 240 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: "PRAZO", font: "Arial", size: 17, bold: true, color: RED, characterSpacing: 60 })],
              }),
              new Paragraph({
                children: [new TextRun({ text: item.prazo, font: "Arial", size: 20, color: DARK })],
              }),
            ],
          }),
          new TableCell({
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            margins: { top: 80, bottom: 80 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: item.titulo, font: "Arial", size: 22, bold: true, color: DARK })],
              }),
              new Paragraph({
                children: [new TextRun({ text: item.descricao, font: "Arial", size: 20, color: GRAY })],
                spacing: { before: 60 },
              }),
            ],
          }),
        ],
      }),
    ],
  });
  return [table, sp(60), grenahService(item.servicoLabel, item.servicoDesc), sp(160)];
}

function summaryLine(text: string) {
  return new Paragraph({
    children: [
      new TextRun({ text: "â–¸  ", font: "Arial", size: 22, bold: true, color: RED }),
      new TextRun({ text, font: "Arial", size: 22, color: DARK }),
    ],
    spacing: { before: 100 },
  });
}

function sectionHeading(num: string, title: string) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${num} â€” `, font: "Georgia", size: 30, bold: true, color: RED }),
      new TextRun({ text: title.toUpperCase(), font: "Georgia", size: 30, bold: true, color: DARK }),
    ],
    spacing: { before: 400, after: 200 },
  });
}

function subheading(text: string) {
  return new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), font: "Arial", size: 19, bold: true, color: RED, characterSpacing: 30 })],
    spacing: { before: 320, after: 120 },
  });
}

function bodyPara(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: 22, color: DARK })],
    spacing: { before: 100 },
  });
}

function makeHeader(nomeCliente: string, mes: string) {
  return new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { ...noTableBorders, bottom: { style: BorderStyle.SINGLE, size: 4, color: MGRAY } },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "GRENAH", font: "Georgia", size: 18, bold: true, color: RED }),
                      new TextRun({ text: `  Â·  DiagnÃ³stico de ComunicaÃ§Ã£o  Â·  ${nomeCliente}  Â·  ${mes}`, font: "Arial", size: 18, color: GRAY }),
                    ],
                    spacing: { after: 80 },
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function makeFooter() {
  return new Footer({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { ...noTableBorders, top: { style: BorderStyle.SINGLE, size: 4, color: MGRAY } },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: "Confidencial  Â·  grenah.one  Â·  Uso exclusivo do cliente", font: "Arial", size: 16, italics: true, color: GRAY }),
                    ],
                    spacing: { before: 80 },
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function makeCover(answers: ClientAnswers, mes: string) {
  const dataHoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  return [
    new Paragraph({
      children: [new TextRun({ text: "DIAGNÃ“STICO DE COMUNICAÃ‡ÃƒO", font: "Georgia", size: 52, color: MGRAY })],
      spacing: { before: 600 },
    }),
    new Paragraph({
      children: [new TextRun({ text: answers.nomeEmpresa || "Cliente", font: "Georgia", size: 80, bold: true, color: RED })],
      spacing: { before: 160 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: `AnÃ¡lise crÃ­tica da comunicaÃ§Ã£o externa e recomendaÃ§Ãµes estratÃ©gicas para ${answers.segmento || "o negÃ³cio"}`,
        font: "Georgia", size: 24, italics: true, color: GRAY,
      })],
      spacing: { before: 200 },
    }),
    sp(400),
    new Table({
      width: { size: 6000, type: WidthType.DXA },
      borders: { ...noTableBorders, insideH: { style: BorderStyle.SINGLE, size: 2, color: MGRAY } },
      rows: [
        ...[
          ["Empresa", answers.nomeEmpresa],
          ["ResponsÃ¡vel", answers.nomeResponsavel],
          ["Segmento", answers.segmento],
          ["Data", dataHoje],
          ["Elaborado por", "Grenah"],
          ["Contato", "paula.dianezi@grenah.one  Â·  11 97376-0906"],
        ].map(([label, value]) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 1800, type: WidthType.DXA },
                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                margins: { top: 80, bottom: 80, right: 160 },
                children: [new Paragraph({ children: [new TextRun({ text: label, font: "Arial", size: 18, bold: true, color: RED, characterSpacing: 30 })] })],
              }),
              new TableCell({
                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                margins: { top: 80, bottom: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: value, font: "Arial", size: 18, color: DARK })] })],
              }),
            ],
          })
        ),
      ],
    }),
    sp(800),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: "grenah.one", font: "Georgia", size: 20, italics: true, color: RED })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

export async function generateDocx(answers: ClientAnswers, report: ReportContent): Promise<Buffer> {
  const mesAno = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const coverChildren = makeCover(answers, mesAno);

  const section01: (Paragraph | Table)[] = [
    sectionHeading("01", "SumÃ¡rio Executivo"),
    callout(report.sumarioExecutivo.achado_critico, report.sumarioExecutivo.fonte_achado),
    sp(160),
    bodyPara(report.sumarioExecutivo.paragrafo1),
    bodyPara(report.sumarioExecutivo.paragrafo2),
    bodyPara(report.sumarioExecutivo.paragrafo3),
    sp(160),
    subheading("Achados Centrais"),
    ...report.sumarioExecutivo.bullets.map(b => summaryLine(b)),
  ];

  const acoes = report.planoDeAcao.acoes.flatMap(a => actionItem(a));
  const section02: (Paragraph | Table)[] = [
    new Paragraph({ children: [new PageBreak()] }),
    sectionHeading("02", "Plano de AÃ§Ã£o"),
    bodyPara(report.planoDeAcao.introducao),
    sp(160),
    ...acoes,
  ];

  const subsecoes = report.diagnosticoDetalhado.subsecoes.flatMap((sub, i) => {
    const items: (Paragraph | Table)[] = [
      subheading(`3.${i + 1} ${sub.titulo}`),
      bodyPara(sub.analise),
    ];
    if (sub.citacao) {
      items.push(sp(80), callout(sub.citacao, sub.fonteCitacao || ""), sp(80));
    }
    items.push(sp(80), grenahService(sub.servicoLabel, sub.servicoDesc), sp(160));
    return items;
  });

  const section03: (Paragraph | Table)[] = [
    new Paragraph({ children: [new PageBreak()] }),
    sectionHeading("03", "DiagnÃ³stico Detalhado"),
    new Paragraph({
      children: [new TextRun({ text: report.diagnosticoDetalhado.introducao, font: "Georgia", size: 21, italics: true, color: GRAY })],
      spacing: { after: 200 },
    }),
    ...subsecoes,
  ];

  const closing: (Paragraph | Table)[] = [
    new Paragraph({ children: [new PageBreak()] }),
    hrRed(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '"Profundidade, ConsistÃªncia, Humanidade, Coragem, Parceria."', font: "Georgia", size: 22, italics: true, color: DARK })],
      spacing: { before: 400, after: 160 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "grenah.one  Â·  11 97376-0906", font: "Arial", size: 20, bold: true, color: RED })],
    }),
  ];

  const doc = new Document({
    numbering: undefined,
    sections: [
      {
        properties: {
          page: {
            margin: { top: convertMillimetersToTwip(25), bottom: convertMillimetersToTwip(25), left: convertMillimetersToTwip(28), right: convertMillimetersToTwip(28) },
          },
        },
        headers: { default: makeHeader(answers.nomeEmpresa, mesAno) },
        footers: { default: makeFooter() },
        children: [
          ...coverChildren,
          ...section01,
          ...section02,
          ...section03,
          ...closing,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}



