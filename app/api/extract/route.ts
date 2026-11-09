import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import mammoth from "mammoth";
import { ClientAnswers, emptyClientAnswers } from "@/lib/types";

export const maxDuration = 120;

function friendlyError(e: unknown): string {
  const err = e as { status?: number; message?: string };
  if (err?.status === 401) return 'Chave de API inválida. Clique em "Chave de API" no menu lateral e confira a chave.';
  if (err?.status === 400 && /credit|balance/i.test(err.message || "")) return "Sem crédito na conta da Anthropic. Adicione crédito em console.anthropic.com.";
  if (err?.status === 404) return "Modelo do Claude indisponível para esta chave.";
  if (err?.status === 429) return "Limite de uso da API atingido. Aguarde um minuto e tente de novo.";
  return `Erro ao processar o arquivo: ${err?.message || "falha desconhecida"}`;
}

export async function POST(req: NextRequest) {
  try {
    return await handle(req);
  } catch (e) {
    console.error("extract error", e);
    return NextResponse.json({ error: friendlyError(e) }, { status: 500 });
  }
}

async function handle(req: NextRequest) {
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
