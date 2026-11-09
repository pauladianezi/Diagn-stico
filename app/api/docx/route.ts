import { NextRequest, NextResponse } from "next/server";
import { ClientAnswers, ReportContent } from "@/lib/types";
import { generateDocx } from "@/lib/docx-generator";

// Monta o .docx a partir do conteúdo já gerado (e possivelmente editado) do relatório
export async function POST(req: NextRequest) {
  const { clientAnswers, report } = (await req.json()) as { clientAnswers: ClientAnswers; report: ReportContent };
  if (!clientAnswers || !report) {
    return NextResponse.json({ error: "Conteúdo do relatório ausente." }, { status: 400 });
  }

  const buffer = await generateDocx(clientAnswers, report);
  const nomeArquivo = `Grenah_Diagnostico_${(clientAnswers.nomeEmpresa || "Cliente").replace(/\s+/g, "")}.docx`;

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${nomeArquivo.normalize("NFD").replace(/[^\x20-\x7E]/g, "")}"; filename*=UTF-8''${encodeURIComponent(nomeArquivo)}`,
    },
  });
}

export const maxDuration = 60;
