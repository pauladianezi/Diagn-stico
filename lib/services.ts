// Esteira de serviços Grenah (Apresentação Institucional e Proposta Comercial, 2026)

export type Nivel = "Verde" | "Rosé" | "Grenah";

export const NIVEIS: Record<Nivel, { cor: string; lema: string; indicado: string }> = {
  Verde: {
    cor: "E2E9AE",
    lema: "Clareza para decidir",
    indicado: "Marcas nascentes, comunicação crua ou inexistente, negócios em organização e profissionais sem clareza de posicionamento. Foco em diagnóstico, descoberta, análise e preparação.",
  },
  "Rosé": {
    cor: "F6BABC",
    lema: "Consistência para ser percebida",
    indicado: "Marcas em crescimento, comunicação a amadurecer, presença digital inconsistente e necessidade de melhorar narrativa e percepção. Foco em narrativa, comunicação, presença e refinamento.",
  },
  Grenah: {
    cor: "AA1738",
    lema: "Maturidade para permanecer",
    indicado: "Marcas estabelecidas, empresas em reposicionamento e negócios com presença existente que precisa evoluir. Foco em estratégia, comunicação e design integrados.",
  },
};

export const SERVICOS: { nome: string; nivel: Nivel; entregaveis: string }[] = [
  { nivel: "Verde", nome: "Modelo de Negócio", entregaveis: "Canvas de modelo de negócio, análise da proposta de valor, mapeamento de públicos e segmentos, fontes de receita, diferenciais competitivos, oportunidades de crescimento, recomendações para posicionamento e comunicação" },
  { nivel: "Verde", nome: "Posicionamento Verbal", entregaveis: "Imersão estratégica, essência da marca, declaração de posicionamento, proposta de valor única, promessa da marca, personalidade e arquétipos, tom de voz e mensagens-chave" },
  { nivel: "Verde", nome: "Cultura Empresarial", entregaveis: "Diagnóstico de cultura e comunicação interna, mapeamento de valores, rituais e comportamentos, desalinhamentos internos, diretrizes de comunicação cultural, propostas de rituais, plano de ativação cultural" },
  { nivel: "Verde", nome: "Criação de Naming", entregaveis: "Diagnóstico para naming, critérios de criação, pesquisa de território verbal, opções de nomes, análise semântica, verificação preliminar de domínio e redes, apoio na validação" },
  { nivel: "Verde", nome: "Identidade Visual", entregaveis: "Direção criativa, moodboard, estudos de logotipo, paleta cromática, tipografia, elementos gráficos, aplicações iniciais, guia visual ou manual conforme escopo" },
  { nivel: "Verde", nome: "Branding", entregaveis: "Diagnóstico de marca, essência e DNA, posicionamento, proposta de valor, arquitetura de marca ou serviços, tom de voz, direção visual, brand guide ou Brand Design System" },
  { nivel: "Verde", nome: "Comunicação Estratégica", entregaveis: "Diagnóstico de comunicação, mapeamento de públicos e canais, objetivos de comunicação, mensagens-chave, plano de comunicação, diretrizes de tom e linguagem, recomendações de canais, conteúdos e ações" },
  { nivel: "Verde", nome: "Mentoria Inicial", entregaveis: "Sessões individuais, diagnóstico de marca pessoal, objetivos profissionais, narrativa pessoal, ajustes de posicionamento, diretrizes de presença digital, plano de ação" },
  { nivel: "Rosé", nome: "Criação de Conteúdo", entregaveis: "Pilares editoriais, planejamento de temas, calendário editorial, roteiros ou textos, diretrizes de linguagem por canal, formatos, revisão estratégica. Modalidades: planejamento editorial (3 a 6 meses), blog com SEO, textos de site institucional ou e-commerce" },
  { nivel: "Rosé", nome: "Redes Sociais", entregaveis: "Diagnóstico dos perfis, estratégia de canais, pilares de conteúdo, calendário editorial, diretrizes de tom, criação ou orientação de posts, relatório de insights. Modalidades de estratégia (Essencial, Estratégico, Premium) e de manutenção com produção e tráfego" },
  { nivel: "Rosé", nome: "Rebranding", entregaveis: "Diagnóstico da marca atual, análise do que permanece e evolui, reposicionamento, refinamento verbal, evolução da identidade visual, atualização de aplicações, guia de transição" },
  { nivel: "Rosé", nome: "Design", entregaveis: "Direção visual de peças, layouts institucionais, peças digitais ou impressas, templates editáveis, apresentações comerciais, materiais de campanha" },
  { nivel: "Rosé", nome: "Evolução de Comunicação Empresarial", entregaveis: "Diagnóstico da comunicação, canais internos e externos, gaps de mensagem, revisão da narrativa institucional, diretrizes por público, plano de evolução da comunicação" },
  { nivel: "Rosé", nome: "Reposicionamento de Mercado", entregaveis: "Diagnóstico do posicionamento atual, análise de mercado e concorrência, públicos estratégicos, revisão da proposta de valor, nova declaração de posicionamento, mensagens-chave" },
  { nivel: "Rosé", nome: "Novo Produto ou Serviço Empresarial", entregaveis: "Diagnóstico da nova oferta, público e proposta de valor, nome ou arquitetura da oferta, mensagens-chave, argumentos comerciais, direção de comunicação, materiais de lançamento" },
  { nivel: "Rosé", nome: "Treinamentos", entregaveis: "Diagnóstico da necessidade, tema e objetivos, conteúdo, material de apoio, dinâmicas, facilitação, recomendações pós-treinamento. Temas: liderança comunicadora, storytelling, comunicação assertiva, cultura, change management, LinkedIn estratégico" },
  { nivel: "Rosé", nome: "Mentoria de Evolução", entregaveis: "Sessões individuais ou em grupo, diagnóstico de posicionamento, narrativa, ajustes de comunicação, diretrizes para LinkedIn e apresentações, preparação para talks e entrevistas, plano de ação" },
  { nivel: "Grenah", nome: "Eventos e Rituais Corporativos", entregaveis: "Diagnóstico do objetivo, conceito da experiência, roteiro de condução, narrativa do encontro, materiais de apoio, diretrizes de facilitação, recomendações de continuidade" },
  { nivel: "Grenah", nome: "Experiências de Reforço Institucional", entregaveis: "Objetivo institucional, conceito da experiência, públicos envolvidos, narrativa e mensagens-chave, direção de materiais e ambientação, roteiro de ativação, plano de comunicação" },
  { nivel: "Grenah", nome: "Campanhas Pontuais", entregaveis: "Diagnóstico do objetivo, conceito criativo, mensagem central, desdobramentos por canal, peças digitais ou impressas, cronograma de ativação" },
  { nivel: "Grenah", nome: "Lançamento de Produto ou Serviço", entregaveis: "Diagnóstico do produto, público e proposta de valor, conceito de pré-lançamento, lançamento e sustentação, mensagens-chave, plano de comunicação, peças de divulgação" },
  { nivel: "Grenah", nome: "Reforço de Comunicação", entregaveis: "Diagnóstico de canais e mensagens, ruídos e inconsistências, revisão de mensagens-chave, ajuste de tom de voz, plano de reforço por canal, diretrizes para continuidade" },
  { nivel: "Grenah", nome: "Monitoramento de Redes Sociais", entregaveis: "Monitoramento mensal, trimestral ou por campanha, desempenho dos conteúdos, análise de temas e interações, oportunidades, riscos e ruídos, relatório de insights" },
  { nivel: "Grenah", nome: "Gestão de Comunicação", entregaveis: "Planejamento contínuo, organização de demandas, gestão de calendário, alinhamento com fornecedores e equipe, revisão de conteúdos, relatórios e reuniões de acompanhamento" },
  { nivel: "Grenah", nome: "Workshops", entregaveis: "Objetivo do workshop, pauta, dinâmica, material de apoio, facilitação, registro de aprendizados, síntese com próximos passos" },
  { nivel: "Grenah", nome: "Mentoria", entregaveis: "Sessões de acompanhamento, diagnóstico do desafio atual, revisão de posicionamento, direcionamento de decisões, apoio em exposição e crescimento, plano de continuidade" },
];

export function catalogoParaPrompt(): string {
  return (Object.keys(NIVEIS) as Nivel[])
    .map((n) => `NÍVEL ${n.toUpperCase()} (${NIVEIS[n].lema}):\n` +
      SERVICOS.filter((s) => s.nivel === n).map((s) => `- "${s.nome}": ${s.entregaveis}`).join("\n"))
    .join("\n\n");
}
