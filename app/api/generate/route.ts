import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ClientAnswers, ResearchFindings, ReportContent } from "@/lib/types";
import { generateDocx } from "@/lib/docx-generator";

// Rede de segurança contra vícios de texto de IA que escapem do prompt
function cleanText(s: string) {
  return s
    .replace(/\s+[—–]\s+/g, ", ")
    .replace(/[—–]/g, ", ")
    .replace(/\*\*|__/g, "")
    .replace(/\p{Extended_Pictographic}️?/gu, "")
    .replace(/,\s*,/g, ",")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key") || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 400 });
  }

  const { clientAnswers, researchFindings } = (await req.json()) as {
    clientAnswers: ClientAnswers;
    researchFindings: ResearchFindings;
  };

  const client = new Anthropic({ apiKey });

  const researchSummary = `
ANÁLISE DO SITE:
${researchFindings.site.conteudo}

ANÁLISE DO INSTAGRAM:
${researchFindings.instagram.conteudo}

ANÁLISE DO LINKEDIN:
${researchFindings.linkedin.conteudo}

ANÁLISE DOS POSTS:
${researchFindings.posts.conteudo}

CENÁRIO COMPETITIVO E DE MERCADO:
${researchFindings.mercado.conteudo}

NOTAS ADICIONAIS:
${researchFindings.notasAdicionais}
`.trim();

  const prompt = `Você é uma consultora sênior de comunicação da Grenah gerando um diagnóstico de comunicação profissional e pago.

DADOS DO CLIENTE:
- Empresa: ${clientAnswers.nomeEmpresa}
- Responsável: ${clientAnswers.nomeResponsavel}
- Segmento: ${clientAnswers.segmento}
- Proposta de valor declarada: ${clientAnswers.propostaDeValor}
- Diferencial declarado: ${clientAnswers.diferencial}
- Público-alvo: ${clientAnswers.publicoAlvo}
- Dor principal: ${clientAnswers.dorPrincipal}
- Objeções: ${clientAnswers.objecoes}
- Concorrentes citados: ${clientAnswers.concorrentes}
- Valores da marca: ${clientAnswers.valoresMarca}
- Personalidade da marca: ${clientAnswers.personalidadeMarca}
- Canais ativos: ${clientAnswers.canaisAtivos}
- O que funciona: ${clientAnswers.oQueFunciona}
- O que não funciona: ${clientAnswers.oQueNaoFunciona}
- URL do site: ${clientAnswers.urlSite}
- Redes sociais: ${clientAnswers.redesSociais}
- Identidade visual: ${clientAnswers.identidadeVisual}
- Expectativa do diagnóstico: ${clientAnswers.expectativaDiagnostico}

PESQUISA EXTERNA REALIZADA:
${researchSummary}

Gere o conteúdo completo do diagnóstico em formato JSON com a estrutura exata abaixo.

CONTEÚDO:
1. Cada achado precisa de evidência da pesquisa externa. Nada de generalização.
2. Os serviços Grenah aparecem como consequência lógica do problema identificado.
3. Nunca invente citações. Use dados verificáveis ou deixe o campo citacao vazio.
4. A análise externa supera a autodeclaração do cliente.

TOM DE VOZ GRENAH (obrigatório):
A Grenah fala de forma reflexiva, clara, estratégica, sofisticada, humana, provocadora e intencional.
Fala com autoridade, sem arrogância. Com profundidade, sem complicação. Com sensibilidade, sem fragilidade. Com sofisticação, sem distanciamento.
Seja honesta sobre os problemas, mas sem alarmismo: o leitor deve sair com clareza e direção, não com medo.
Cada palavra precisa contribuir para a mensagem. Fale com pessoas, não com públicos abstratos.
Exemplos do que NÃO dizer e o que preferir:
- Não: "Levamos sua marca para o próximo nível." Prefira: "Preparamos sua marca para a próxima fase."
- Não: "Soluções inovadoras e personalizadas." Prefira: "Cada projeto começa pela compreensão do contexto antes da definição do caminho."

ESTILO DE ESCRITA (proibições absolutas):
- Não use travessão (—) nem meia-risca (–) em nenhuma frase. Use vírgula, ponto ou dois-pontos.
- Não use frases clichê: "no cenário atual", "é fundamental", "é crucial", "em suma", "vale ressaltar", "nesse sentido", "cada vez mais", "não é apenas X, é Y", "mais do que nunca", "jornada", "alavancar", "potencializar", "destravar".
- Não acumule adjetivos. Evite "robusto", "sólido", "estratégico", "inovador", "disruptivo", "impactante" quando não houver dado que os sustente. Prefira substantivos concretos e verbos precisos.
- Não organize ideias em grupos de três por hábito. Varie o tamanho das frases e das enumerações.
- Não use negrito, markdown, asteriscos, emojis ou exclamações.
- Escreva em português do Brasil, com acentuação correta.

SERVIÇOS GRENAH disponíveis:
- "Consultoria em Comunicação Estratégica": diagnóstico, planejamento, construção/reposicionamento de marca, gestão de mudanças
- "Identidade e Fundação de Marca": manual de marca, logo, paleta, tipografia, narrativa visual
- "Mentoria de Marca Pessoal": narrativa pessoal, tom de voz, posicionamento, conteúdo para LinkedIn
- "Treinamentos Corporativos": Liderança Comunicadora, Storytelling, LinkedIn Estratégico para Lideranças
- "Eventos, Rituais e Engajamento Cultural": eventos com propósito, rituais internos, ativações culturais

Retorne APENAS o JSON válido, sem explicações:

{
  "sumarioExecutivo": {
    "achado_critico": "O achado mais crítico em uma frase direta (o que o mercado encontra ou não encontra da empresa)",
    "fonte_achado": "Nome da fonte ou plataforma onde o achado foi verificado",
    "paragrafo1": "O que a análise externa revelou (site + redes sociais): 3-4 linhas, crítico",
    "paragrafo2": "O principal desalinhamento identificado: 3-4 linhas, específico",
    "paragrafo3": "O contexto competitivo: o que está acontecendo no mercado enquanto a empresa não comunica: 3-4 linhas",
    "bullets": [
      "Achado crítico 1: específico, com dado externo",
      "Achado crítico 2: específico, com dado externo",
      "Achado crítico 3: específico, com dado externo",
      "Achado crítico 4: específico, com dado externo",
      "Achado crítico 5: específico, com dado externo"
    ]
  },
  "planoDeAcao": {
    "introducao": "1 parágrafo explicando que a ordem das ações segue dependência lógica: 2-3 linhas",
    "acoes": [
      {
        "numero": 1,
        "prazo": "ex: Semanas 1-2",
        "titulo": "Título da ação",
        "descricao": "O que fazer e por quê: 2-4 linhas",
        "servicoLabel": "Nome do serviço Grenah correspondente",
        "servicoDesc": "Como o serviço resolve especificamente este problema: 2-3 linhas"
      },
      { "numero": 2, "prazo": "...", "titulo": "...", "descricao": "...", "servicoLabel": "...", "servicoDesc": "..." },
      { "numero": 3, "prazo": "...", "titulo": "...", "descricao": "...", "servicoLabel": "...", "servicoDesc": "..." },
      { "numero": 4, "prazo": "...", "titulo": "...", "descricao": "...", "servicoLabel": "...", "servicoDesc": "..." },
      { "numero": 5, "prazo": "...", "titulo": "...", "descricao": "...", "servicoLabel": "...", "servicoDesc": "..." }
    ]
  },
  "diagnosticoDetalhado": {
    "introducao": "Frase explicando que esta seção é o embasamento técnico para quem quiser o racional completo",
    "subsecoes": [
      {
        "titulo": "Site e Proposta de Valor",
        "analise": "Análise crítica detalhada baseada na pesquisa externa: 6-10 linhas. Citar o metatítulo/descrição real. Identificar 2-3 problemas específicos no texto do site.",
        "citacao": "Citação de referência de mercado relevante (ou deixe vazio se não houver)",
        "fonteCitacao": "Fonte da citação com ano (ex: Gartner, 2024)",
        "servicoLabel": "Nome do serviço Grenah",
        "servicoDesc": "Como o serviço Grenah resolve este problema específico"
      },
      {
        "titulo": "Identidade Visual",
        "analise": "Análise da consistência visual, qualidade e profissionalismo entre canais: 6-10 linhas",
        "citacao": "",
        "fonteCitacao": "",
        "servicoLabel": "...",
        "servicoDesc": "..."
      },
      {
        "titulo": "Presença digital e posts",
        "analise": "Análise dos posts analisados com métricas reais + padrão geral identificado: 6-10 linhas",
        "citacao": "",
        "fonteCitacao": "",
        "servicoLabel": "...",
        "servicoDesc": "..."
      },
      {
        "titulo": "Cenário Competitivo",
        "analise": "Visibilidade em imprensa, concorrentes identificados externamente, janela de oportunidade: 6-10 linhas",
        "citacao": "",
        "fonteCitacao": "",
        "servicoLabel": "...",
        "servicoDesc": "..."
      },
      {
        "titulo": "Marca Pessoal vs. Marca Corporativa",
        "analise": "Avaliação da dependência da empresa em relação a uma pessoa. Riscos e como amplificar: 6-10 linhas",
        "citacao": "",
        "fonteCitacao": "",
        "servicoLabel": "...",
        "servicoDesc": "..."
      }
    ]
  }
}`;

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Resposta inesperada do Claude." }, { status: 500 });
  }

  let reportContent: ReportContent;
  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    reportContent = jsonMatch ? JSON.parse(jsonMatch[0], (_k, v) => (typeof v === "string" ? cleanText(v) : v)) : null;
    if (!reportContent) throw new Error("JSON não encontrado");
  } catch {
    return NextResponse.json({ error: "Erro ao parsear conteúdo do relatório.", raw: content.text }, { status: 500 });
  }

  const docxBuffer = await generateDocx(clientAnswers, reportContent);

  const nomeArquivo = `Grenah_Diagnostico_${clientAnswers.nomeEmpresa.replace(/\s+/g, "")}_${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).replace(" de ", "")}.docx`;

  return new NextResponse(docxBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${nomeArquivo.normalize("NFD").replace(/[^\x20-\x7E]/g, "")}"; filename*=UTF-8''${encodeURIComponent(nomeArquivo)}`,
    },
  });
}

export const maxDuration = 120;
