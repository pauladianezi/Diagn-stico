import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import mammoth from "mammoth";
import { ClientAnswers, emptyClientAnswers } from "@/lib/types";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key") || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { value: rawText } = await mammoth.extractRawText({ buffer });

  const client = new Anthropic({ apiKey });

  const fields = Object.keys(emptyClientAnswers).join(", ");

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Você recebeu o texto extraído de um questionário de diagnóstico de comunicação preenchido por um cliente.

Extraia as informações e retorne um JSON com exatamente estas chaves:
${fields}

Mapeamento das seções do questionário:
- nomeEmpresa, nomeResponsavel, segmento → Bloco 01 / cabeçalho
- propostaDeValor, diferencial → Bloco 01, perguntas 1.2 e 1.3
- publicoAlvo, dorPrincipal, objecoes → Bloco 02
- concorrentes, nivelInvestimento → Bloco 03
- valoresMarca, personalidadeMarca → Bloco 04
- canaisAtivos, oQueFunciona, oQueNaoFunciona, postsDestaque → Bloco 05
- urlSite, redesSociais, canaisAbandonados, responsavelConteudo, autopercepçãoDigital → Bloco 06
- identidadeVisual → Bloco 07
- expectativaDiagnostico → Bloco 08

Para campos não encontrados, use string vazia "".
Retorne APENAS o JSON, sem explicações adicionais.

TEXTO DO QUESTIONÁRIO:
${rawText}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Resposta inesperada do Claude." }, { status: 500 });
  }

  let answers: ClientAnswers;
  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    answers = jsonMatch ? JSON.parse(jsonMatch[0]) : emptyClientAnswers;
  } catch {
    answers = emptyClientAnswers;
  }

  return NextResponse.json({ answers, rawText });
}
