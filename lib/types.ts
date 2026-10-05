export interface ClientAnswers {
  nomeEmpresa: string;
  nomeResponsavel: string;
  segmento: string;
  propostaDeValor: string;
  diferencial: string;
  publicoAlvo: string;
  dorPrincipal: string;
  objecoes: string;
  concorrentes: string;
  nivelInvestimento: string;
  valoresMarca: string;
  personalidadeMarca: string;
  canaisAtivos: string;
  oQueFunciona: string;
  oQueNaoFunciona: string;
  postsDestaque: string;
  urlSite: string;
  redesSociais: string;
  canaisAbandonados: string;
  responsavelConteudo: string;
  autopercepçãoDigital: string;
  identidadeVisual: string;
  expectativaDiagnostico: string;
}

export interface ResearchSection {
  conteudo: string;
  status: 'idle' | 'loading' | 'done' | 'error';
  editado: boolean;
}

export interface ResearchFindings {
  site: ResearchSection;
  instagram: ResearchSection;
  linkedin: ResearchSection;
  posts: ResearchSection;
  mercado: ResearchSection;
  notasAdicionais: string;
}

export interface ActionItem {
  numero: number;
  prazo: string;
  titulo: string;
  descricao: string;
  servicoLabel: string;
  servicoDesc: string;
}

export interface SummaryBullet {
  texto: string;
}

export interface DiagnosisSubsection {
  titulo: string;
  analise: string;
  citacao?: string;
  fonteCitacao?: string;
  servicoLabel: string;
  servicoDesc: string;
}

export interface ReportContent {
  sumarioExecutivo: {
    achado_critico: string;
    fonte_achado: string;
    paragrafo1: string;
    paragrafo2: string;
    paragrafo3: string;
    bullets: string[];
  };
  planoDeAcao: {
    introducao: string;
    acoes: ActionItem[];
  };
  diagnosticoDetalhado: {
    introducao: string;
    subsecoes: DiagnosisSubsection[];
  };
  maturidade: {
    nivel: 'Verde' | 'Rosé' | 'Grenah';
    justificativa: string;
  };
  consideracoesFinais: {
    paragrafos: string[];
    trilha: {
      servico: string;
      nivel: 'Verde' | 'Rosé' | 'Grenah';
      motivo: string;
      entregaveis: string[];
    }[];
    proximosPassos: string;
  };
}

export interface Diagnostic {
  id: string;
  criadoEm: string;
  clientAnswers: ClientAnswers;
  researchFindings: ResearchFindings;
  reportContent?: ReportContent;
  status: 'rascunho' | 'pesquisando' | 'revisando' | 'gerando' | 'pronto';
  etapa?: 1 | 2 | 3 | 4;
  atualizadoEm?: string;
}

export const emptyClientAnswers: ClientAnswers = {
  nomeEmpresa: '',
  nomeResponsavel: '',
  segmento: '',
  propostaDeValor: '',
  diferencial: '',
  publicoAlvo: '',
  dorPrincipal: '',
  objecoes: '',
  concorrentes: '',
  nivelInvestimento: '',
  valoresMarca: '',
  personalidadeMarca: '',
  canaisAtivos: '',
  oQueFunciona: '',
  oQueNaoFunciona: '',
  postsDestaque: '',
  urlSite: '',
  redesSociais: '',
  canaisAbandonados: '',
  responsavelConteudo: '',
  autopercepçãoDigital: '',
  identidadeVisual: '',
  expectativaDiagnostico: '',
};

export const emptyResearchFindings: ResearchFindings = {
  site: { conteudo: '', status: 'idle', editado: false },
  instagram: { conteudo: '', status: 'idle', editado: false },
  linkedin: { conteudo: '', status: 'idle', editado: false },
  posts: { conteudo: '', status: 'idle', editado: false },
  mercado: { conteudo: '', status: 'idle', editado: false },
  notasAdicionais: '',
};
