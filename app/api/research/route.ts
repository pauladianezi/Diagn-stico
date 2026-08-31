import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ClientAnswers } from "@/lib/types";

// ── Prompts por seção ────────────────────────────────────────────────────────

const SITE_PROMPT = (a: ClientAnswers, siteContent: string) => `
Você é uma consultora sênior de comunicação da Grenah fazendo uma análise crítica e independente.

Analise o conteúdo do site de "${a.nomeEmpresa}" e redija um diagnóstico detalhado sobre:
1. Metatítulo e metadescrição — o que aparece no Google?
2. Proposta de valor na homepage — está alinhada com o produto real (${a.propostaDeValor})?
3. Linguagem usada — corresponde ao público-alvo (${a.publicoAlvo})?
4. Calls-to-action — são adequados para o nível de sofisticação da oferta?
5. Provas sociais: cases, depoimentos, logos de clientes
6. Blog — existe? Está ativo?
7. Liste 2–3 problemas específicos identificados no texto do site

Tom: crítico e direto. Cite trechos reais do conteúdo do site. Aponte desalinhamentos específicos.

CONTEÚDO DO SITE (extraído automaticamente):
${siteContent.slice(0, 12000)}
`.trim();

const INSTAGRAM_PROMPT = (a: ClientAnswers) => `
Você é uma consultora sênior de comunicação da Grenah fazendo uma análise crítica e independente.

Analise os prints do Instagram de "${a.nomeEmpresa}" (${a.redesSociais}) e redija um diagnóstico detalhado sobre:
1. Bio: idioma correto? Alinhada com o público-alvo (${a.publicoAlvo})?
2. Número de seguidores e total de posts (se visível)
3. Consistência visual do feed: há sistema visual ou cada post parece independente?
4. Qualidade das imagens: geradas por IA? Fotos reais? Infográficos?
5. Formatos usados: foto, vídeo, carrossel, reels
6. Engajamento médio visível: curtidas e comentários
7. Tom do copy: é genérico ou tem perspectiva própria?

Tom: crítico e direto. Base sua análise APENAS no que é visível nos prints.
O que o cliente diz que funciona: ${a.oQueFunciona}
O que o cliente diz que não funciona: ${a.oQueNaoFunciona}
`.trim();

const LINKEDIN_PROMPT = (a: ClientAnswers) => `
Você é uma consultora sênior de comunicação da Grenah fazendo uma análise crítica e independente.

Analise os prints do LinkedIn de "${a.nomeEmpresa}" (${a.redesSociais}) e redija um diagnóstico detalhado sobre:
1. Página da empresa: descrição clara? Alinhada com o produto real?
2. Quem publica: a empresa ou o fundador/pessoa física? Qual é mais forte?
3. Frequência de publicação (se visível)
4. Formatos usados: texto, imagem, carrossel, vídeo?
5. Engajamento visível: curtidas, comentários, compartilhamentos
6. Força da marca pessoal vs. marca corporativa

Tom: crítico e direto. Base sua análise APENAS no que é visível nos prints.
Segmento: ${a.segmento}
Público-alvo: ${a.publicoAlvo}
`.trim();

const POSTS_PROMPT = (a: ClientAnswers) => `
Você é uma consultora sênior de comunicação da Grenah fazendo uma análise crítica e independente.

Analise os prints dos posts que o cliente indicou como seus melhores resultados.

Para cada post visível nos prints, avalie:
- Plataforma e formato (foto, vídeo, carrossel, reels)
- Métricas visíveis (curtidas, comentários, compartilhamentos)
- Formato visual: foto real, gerado por IA, infográfico?
- Qualidade do copy: genérico ou específico?
- CTA: existe? É adequado para o público (${a.publicoAlvo})?
- O que funciona e o que não funciona neste post

Termine com o padrão geral identificado e o que revela sobre o nível de exigência que a empresa aplica à própria comunicação.

O que o cliente acha que funciona: ${a.oQueFunciona}
`.trim();

const MERCADO_PROMPT = (a: ClientAnswers) => `
Você é uma consultora sênior de comunicação da Grenah. Use seu conhecimento de mercado para analisar o cenário competitivo de "${a.nomeEmpresa}" no segmento "${a.segmento}".

Redija um diagnóstico detalhado sobre:
1. Visibilidade esperada em veículos de imprensa especializada para uma empresa deste segmento
2. Os 2–3 principais concorrentes diretos conhecidos no mercado brasileiro — especialmente os que o cliente não mencionou (ele citou: ${a.concorrentes})
3. Há players internacionais entrando no mercado brasileiro neste segmento?
4. Qual é o nível atual de consolidação deste mercado?
5. A janela de oportunidade de comunicação — e por que ela não é permanente

Importante: Seja crítico e direto. Se a empresa não aparece em imprensa especializada, este é um achado crítico. Contextualize o que está acontecendo no mercado enquanto a empresa não comunica.
`.trim();

const SECTION_PROMPTS: Record<string, (a: ClientAnswers) => string> = {
  instagram: INSTAGRAM_PROMPT,
  linkedin:  LINKEDIN_PROMPT,
  posts:     POSTS_PROMPT,
  mercado:   MERCADO_PROMPT,
};

// ── Tipos de imagem aceitos ──────────────────────────────────────────────────

type AnthropicMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

function detectMediaType(base64: string): AnthropicMediaType {
  const header = base64.slice(0, 8);
  if (header.startsWith("iVBOR"))  return "image/png";
  if (header.startsWith("R0lGOD")) return "image/gif";
  if (header.startsWith("UklGR")) return "image/webp";
  return "image/jpeg";
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key") || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 400 });
  }

  const body = await req.json() as {
    clientAnswers: ClientAnswers;
    section: string;
    images?: string[];
  };
  const { clientAnswers, section, images = [] } = body;

  const client = new Anthropic({ apiKey });

  // ── Site: Jina AI Reader ─────────────────────────────────────────────────
  if (section === "site") {
    const url = clientAnswers.urlSite?.trim();
    if (!url) {
      return NextResponse.json({ error: "URL do site não informada no questionário." }, { status: 400 });
    }

    const jinaUrl = `https://r.jina.ai/${url}`;
    let siteContent = "";
    try {
      const res = await fetch(jinaUrl, {
        headers: { Accept: "text/markdown", "X-No-Cache": "true" },
        signal: AbortSignal.timeout(20000),
      });
      siteContent = await res.text();
    } catch {
      return NextResponse.json({ error: "Não foi possível acessar o site. Verifique se a URL está correta e o site está online." }, { status: 502 });
    }

    if (!siteContent || siteContent.length < 100) {
      return NextResponse.json({ error: "O site retornou conteúdo insuficiente para análise." }, { status: 422 });
    }

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      messages: [{ role: "user", content: SITE_PROMPT(clientAnswers, siteContent) }],
    });

    const resultado = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n\n");

    return NextResponse.json({ resultado });
  }

  const promptFn = SECTION_PROMPTS[section];
  if (!promptFn) {
    return NextResponse.json({ error: "Seção inválida." }, { status: 400 });
  }

  // ── Mercado: análise textual sem imagens ─────────────────────────────────
  if (section === "mercado") {
    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      messages: [{ role: "user", content: promptFn(clientAnswers) }],
    });
    const resultado = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n\n");
    return NextResponse.json({ resultado });
  }

  // ── Instagram / LinkedIn / Posts: Claude Vision ──────────────────────────
  if (!images || images.length === 0) {
    return NextResponse.json({ error: "Nenhuma imagem enviada. Anexe pelo menos um print antes de analisar." }, { status: 400 });
  }

  const imageBlocks = images.map((base64) => ({
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: detectMediaType(base64),
      data: base64,
    },
  }));

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    messages: [{
      role: "user",
      content: [
        ...imageBlocks,
        { type: "text" as const, text: promptFn(clientAnswers) },
      ],
    }],
  });

  const resultado = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n\n");

  return NextResponse.json({ resultado });
}

export const maxDuration = 60;
