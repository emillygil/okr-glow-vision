export type OKRType = "estrategico" | "tatico";

export interface KeyResult {
  id: string;
  description: string;
  target: string;
  current: string;
  progress: number; // 0-100
  frequency: string;
  source: string;
}

export interface Objective {
  id: number;
  title: string;
  keyResults: KeyResult[];
}

export interface OKRGroup {
  type: OKRType;
  team: string;
  objectives: Objective[];
}

export const okrData: OKRGroup[] = [
  {
    type: "estrategico",
    team: "Estratégico",
    objectives: [
      {
        id: 1,
        title: "Assegurar a Sustentabilidade Financeira",
        keyResults: [
          { id: "E1.1", description: "Receber 80% dos contratos fechados para o ano, dentro da competência vigente.", target: "80%", current: "0", progress: 0, frequency: "Trimestral", source: "Nibo" },
          { id: "E1.2", description: "Garantir a receita 4,5% maior que o custo operacional projetado para 2026.", target: "4.5%", current: "-38.94%", progress: 0, frequency: "Mensal", source: "NIBO" },
          { id: "E1.3", description: "Assegurar economia mínima de 5% no processo de compras.", target: "5%", current: "0", progress: 0, frequency: "Trimestral", source: "Dashboard de compras" },
        ],
      },
      {
        id: 2,
        title: "Ampliar o Alcance Positivo da JARJ junto aos Stakeholders",
        keyResults: [
          { id: "E2.1", description: "Formalizar ao menos 2 novos acordos de parceria com a Secretaria Municipal de Educação e/ou parceiros institucionais relevantes.", target: "2", current: "0", progress: 0, frequency: "Anual", source: "Termos de parceria" },
          { id: "E2.2", description: "Estabelecer parceria com 1 CRAS no Rio de Janeiro.", target: "1", current: "0", progress: 0, frequency: "Anual", source: "Termos de parceria" },
          { id: "E2.3", description: "Criar e implementar 1 iniciativa de Empregabilidade em 2 projetos-chave.", target: "2", current: "0", progress: 0, frequency: "Anual", source: "Relatório dos projetos" },
          { id: "E2.4", description: "Desenvolver o Eixo de diversidade com 100 beneficiários.", target: "100", current: "0", progress: 0, frequency: "Anual", source: "Relatório dos projetos" },
        ],
      },
      {
        id: 3,
        title: "Garantir o Alcance e Impacto das Experiências",
        keyResults: [
          { id: "E3.1", description: "Atingir 28.000 experiências de aprendizagem em Inspire.", target: "28.000", current: "331", progress: 1, frequency: "Mensal", source: "Relatório de marketing" },
          { id: "E3.2", description: "Atingir 41.184 experiências de aprendizagem em Prepare.", target: "41.184", current: "0", progress: 0, frequency: "Mensal", source: "Relatório de marketing" },
          { id: "E3.3", description: "Atingir 3.231 experiências de aprendizagem em Succeed.", target: "3.231", current: "0", progress: 0, frequency: "Mensal", source: "Relatório de marketing" },
          { id: "E3.4", description: "Atingir 930 experiências voluntárias.", target: "930", current: "3", progress: 0, frequency: "Mensal", source: "Relatório de marketing" },
        ],
      },
      {
        id: 4,
        title: "Garantir Processos Estruturados",
        keyResults: [
          { id: "E4.1", description: "Estruturar e implantar a Área de Compras e Contratos no primeiro semestre.", target: "100%", current: "0", progress: 0, frequency: "Anual", source: "Contrato de trabalho" },
          { id: "E4.2", description: "Desenvolver, validar e contabilizar a métrica de jovens impactados.", target: "100%", current: "0", progress: 0, frequency: "Anual", source: "Relatório de projetos" },
          { id: "E4.3", description: "Criar e aplicar o Plano de Gestão de Desempenho para 100% dos colaboradores.", target: "100%", current: "0", progress: 0, frequency: "Semestral", source: "Registros internos" },
        ],
      },
      {
        id: 5,
        title: "Consolidar a Marca e Visibilidade da JARJ",
        keyResults: [
          { id: "E5.1", description: "Realizar 2 eventos de relacionamento com Stakeholders.", target: "2", current: "0", progress: 0, frequency: "Anual", source: "Release do evento" },
          { id: "E5.2", description: "Aumentar em 10% a percepção positiva da marca.", target: "10%", current: "0", progress: 0, frequency: "Anual", source: "Pesquisa de Marca" },
          { id: "E5.3", description: "Inscrição em 4 premiações externas.", target: "4", current: "0", progress: 0, frequency: "Trimestral", source: "Ficha de inscrição" },
        ],
      },
    ],
  },
  {
    type: "tatico",
    team: "Time Multi",
    objectives: [
      {
        id: 1,
        title: "Manter a Saúde Financeira Institucional",
        keyResults: [
          { id: "M1.1", description: "Garantir que o custo/despesa da área não ultrapasse o orçamento aprovado.", target: "R$ 6.013.963", current: "0", progress: 0, frequency: "Por aplicação", source: "SOS" },
          { id: "M1.2", description: "Assegurar que compras de materiais não excedam 10% de estoque por item.", target: "-", current: "-", progress: 0, frequency: "Mensal", source: "Inventário" },
          { id: "M1.3", description: "Construir banco de 4 projetos com captação mínima de R$1M para 2027.", target: "4", current: "1", progress: 25, frequency: "Anual", source: "Google Drive" },
          { id: "M1.4", description: "Priorizar impressão dentro da cota do escritório.", target: "50", current: "0", progress: 0, frequency: "Por projeto", source: "Google Drive" },
        ],
      },
      {
        id: 2,
        title: "Ampliar o Alcance Positivo da JARJ junto aos Stakeholders",
        keyResults: [
          { id: "M2.1", description: "Garantir NPS de alunos na zona de qualidade (51-75).", target: "75", current: "0", progress: 0, frequency: "Mensal", source: "Salesforce" },
          { id: "M2.2", description: "Garantir NPS de voluntários na zona de excelência (76-100).", target: "90", current: "0", progress: 0, frequency: "Mensal", source: "Salesforce" },
          { id: "M2.3", description: "Envio de relatório final em até 60 dias para 100% dos parceiros.", target: "100%", current: "0", progress: 0, frequency: "Trimestral", source: "Drive do projeto" },
        ],
      },
      {
        id: 3,
        title: "Garantir o Alcance e Impacto das Experiências",
        keyResults: [
          { id: "M3.1", description: "Atingir 1.233 experiências em Inspire.", target: "1.233", current: "30", progress: 2, frequency: "Mensal", source: "Salesforce" },
          { id: "M3.2", description: "Atingir 1.534 experiências em Prepare.", target: "1.534", current: "0", progress: 0, frequency: "Mensal", source: "Salesforce" },
          { id: "M3.3", description: "Atingir 133 experiências em Succeed.", target: "133", current: "0", progress: 0, frequency: "Mensal", source: "Salesforce" },
          { id: "M3.4", description: "Teste piloto de pesquisa de satisfação em 3 projetos.", target: "3", current: "0", progress: 0, frequency: "Anual", source: "Nova plataforma" },
          { id: "M3.5", description: "Alcançar 250 experiências de voluntários.", target: "250", current: "3", progress: 1, frequency: "Mensal", source: "Planilha de voluntariado" },
        ],
      },
      {
        id: 4,
        title: "Garantir Processos Estruturados",
        keyResults: [
          { id: "M4.1", description: "Implantar dashboard para 100% dos projetos.", target: "100%", current: "0", progress: 0, frequency: "Mensal", source: "Dashboard" },
          { id: "M4.2", description: "Criar matriz de conhecimentos com 10 boas práticas.", target: "10", current: "0", progress: 0, frequency: "Trimestral", source: "Google Drive" },
          { id: "M4.3", description: "Criar matriz RACI do Time Multi.", target: "1", current: "0", progress: 0, frequency: "Por projeto", source: "Google Drive" },
        ],
      },
      {
        id: 5,
        title: "Consolidar a Marca e Visibilidade da JARJ",
        keyResults: [
          { id: "M5.1", description: "100% dos projetos utilizem materiais oficiais do Marketing.", target: "100%", current: "0", progress: 0, frequency: "Por aplicação", source: "Relatórios finais" },
          { id: "M5.2", description: "Rotina de alinhamento mensal com Marketing.", target: "12", current: "2", progress: 17, frequency: "Mensal", source: "Agenda" },
          { id: "M5.3", description: "Gravação de vlogs nos Empresários Sombra para TikTok.", target: "6", current: "0", progress: 0, frequency: "Por projeto", source: "TikTok" },
        ],
      },
    ],
  },
  {
    type: "tatico",
    team: "Qualidade",
    objectives: [
      {
        id: 1,
        title: "Assegurar a Sustentabilidade Financeira",
        keyResults: [
          { id: "Q1.1", description: "Garantir que o custo/despesa da área não ultrapasse o orçamento aprovado.", target: "-", current: "0", progress: 0, frequency: "Por aplicação", source: "SOS" },
        ],
      },
      {
        id: 3,
        title: "Garantir o Alcance e Impacto das Experiências",
        keyResults: [
          { id: "Q3.1", description: "Teste piloto de pesquisa de satisfação em 3 projetos.", target: "3", current: "0", progress: 0, frequency: "Anual", source: "Nova plataforma" },
        ],
      },
      {
        id: 4,
        title: "Garantir Processos Estruturados",
        keyResults: [
          { id: "Q4.1", description: "Concluir 100% do cronograma de Auditorias Internas.", target: "100%", current: "0", progress: 0, frequency: "Anual", source: "Cronograma de Auditoria" },
          { id: "Q4.2", description: "Enviar 100% de relatórios de Auditoria em até 14 dias úteis.", target: "100%", current: "0", progress: 0, frequency: "Anual", source: "Registros internos" },
          { id: "Q4.3", description: "Concluir auditoria DNV ISO 9001:2015 com zero NC Maiores.", target: "100%", current: "0", progress: 0, frequency: "Anual", source: "Relatório DNV" },
          { id: "Q4.4", description: "Treinamento sobre Portal JA Brasil com 90% de participação.", target: "90%", current: "0", progress: 0, frequency: "Anual", source: "Planilha de treinamentos" },
          { id: "Q4.5", description: "Testes semestrais com 50% dos colaboradores atingindo nota 70%.", target: "50%", current: "0", progress: 0, frequency: "Semestral", source: "Relatórios dos testes" },
        ],
      },
      {
        id: 5,
        title: "Consolidar a Marca e Visibilidade da JARJ",
        keyResults: [
          { id: "Q5.1", description: "Assegurar 100% dos requisitos para renovação dos selos.", target: "100%", current: "0", progress: 0, frequency: "Anual", source: "Obtenção dos selos" },
          { id: "Q5.2", description: "Mapear eventos para participação como palestrante.", target: "2", current: "0", progress: 0, frequency: "Anual", source: "E-mails de submissão" },
        ],
      },
    ],
  },
  {
    type: "tatico",
    team: "Adm. / Fin.",
    objectives: [
      {
        id: 1,
        title: "Manter a Saúde Financeira Institucional",
        keyResults: [
          { id: "AF1.1", description: "Revisar mensalmente o orçamento aprovado.", target: "11", current: "1", progress: 9, frequency: "Trimestral", source: "Nibo/Drive" },
          { id: "AF1.2", description: "Receber pelo menos 80% dos valores dos contratos fechados.", target: "19", current: "0", progress: 0, frequency: "Mensal", source: "Nibo" },
          { id: "AF1.3", description: "Análise de mercado de 80% dos pedidos de compras.", target: "240", current: "0", progress: 0, frequency: "Mensal", source: "Nibo" },
        ],
      },
      {
        id: 2,
        title: "Ampliar o Alcance Positivo da JARJ junto aos Stakeholders",
        keyResults: [
          { id: "AF2.1", description: "Obter NPS na zona de qualidade (50-75%) nos feedbacks dos colaboradores.", target: "50", current: "0", progress: 0, frequency: "Semestral", source: "Google Forms" },
          { id: "AF2.2", description: "Realizar pelo menos 2 propostas de melhoria via NPS.", target: "2", current: "0", progress: 0, frequency: "Semestral", source: "Google Forms" },
        ],
      },
      {
        id: 3,
        title: "Garantir o Alcance e Impacto das Experiências",
        keyResults: [
          { id: "AF3.1", description: "Contribuir para 70% de conformidade na auditoria de Qualidade.", target: "70%", current: "0", progress: 0, frequency: "Anual", source: "Monday da Qualidade" },
          { id: "AF3.2", description: "Informar equipes quando gastos ultrapassarem 80%.", target: "80%", current: "0", progress: 0, frequency: "Trimestral", source: "Nibo / SOS" },
        ],
      },
      {
        id: 4,
        title: "Garantir Processos Estruturados",
        keyResults: [
          { id: "AF4.1", description: "Atualizar o procedimento de compras (Pr 07).", target: "100%", current: "0", progress: 0, frequency: "Anual", source: "Procedimento" },
          { id: "AF4.2", description: "Elaborar mapeamentos de processos para compras.", target: "6", current: "0", progress: 0, frequency: "Mensal", source: "SOS" },
          { id: "AF4.3", description: "Oferecer 2 treinamentos: compras e SOS.", target: "2", current: "0", progress: 0, frequency: "Semestral", source: "Planilha de treinamento" },
        ],
      },
      {
        id: 5,
        title: "Consolidar a Marca e Visibilidade da JARJ",
        keyResults: [
          { id: "AF5.1", description: "Preparar relatórios contábeis auditados para publicação.", target: "100%", current: "0", progress: 0, frequency: "Anual", source: "Parecer da Auditoria" },
        ],
      },
    ],
  },
  {
    type: "tatico",
    team: "Trilha Empreendedora",
    objectives: [
      {
        id: 1,
        title: "Manter a Saúde Financeira Institucional",
        keyResults: [
          { id: "TE1.1", description: "Receber 86% das cotas fechadas para o ano.", target: ">85%", current: "0", progress: 0, frequency: "Mensal", source: "Nibo" },
          { id: "TE1.2", description: "Crescer 20% o orçamento da Trilha Empreendedora.", target: "R$ 615.600", current: "R$ 135.000", progress: 22, frequency: "Mensal", source: "Nibo" },
          { id: "TE1.3", description: "Garantir entrada de no mínimo 4 novas empresas.", target: "4", current: "0", progress: 0, frequency: "Mensal", source: "Nibo" },
          { id: "TE1.4", description: "Renovar até 70% das empresas patrocinadoras.", target: "10", current: "0", progress: 0, frequency: "Mensal", source: "Monday" },
          { id: "TE1.5", description: "Assegurar economia mínima de 5% no processo de compras.", target: "5%", current: "0", progress: 0, frequency: "Trimestral", source: "Dashboard de compras" },
        ],
      },
      {
        id: 2,
        title: "Ampliar o Alcance Positivo da JARJ junto aos Stakeholders",
        keyResults: [
          { id: "TE2.1", description: "Projeto piloto de empregabilidade com 50 estudantes.", target: "50", current: "0", progress: 0, frequency: "Anual", source: "Relatório dos projetos" },
          { id: "TE2.2", description: "NPS de voluntários na Zona de Excelência (76-100).", target: "76", current: "0", progress: 0, frequency: "Por fase", source: "Salesforce" },
          { id: "TE2.3", description: "NPS de alunos na Zona de Excelência (76-90).", target: "76", current: "0", progress: 0, frequency: "Por fase", source: "Salesforce" },
          { id: "TE2.4", description: "Garantir acima de 70% de satisfação de patrocinadores.", target: "71%", current: "0", progress: 0, frequency: "Anual", source: "Google Forms" },
          { id: "TE2.5", description: "Garantir acima de 70% de satisfação de parceiros institucionais.", target: "71%", current: "0", progress: 0, frequency: "Anual", source: "Google Forms" },
          { id: "TE2.6", description: "Garantir acima de 70% de satisfação de professores.", target: "71%", current: "0", progress: 0, frequency: "Anual", source: "Google Forms" },
        ],
      },
      {
        id: 3,
        title: "Garantir o Alcance e Impacto das Experiências",
        keyResults: [
          { id: "TE3.1", description: "Atingir 400 experiências de voluntários.", target: "400", current: "0", progress: 0, frequency: "Por fase", source: "Coleta de resultados" },
          { id: "TE3.2", description: "Atingir 1.881 experiências em Inspire.", target: "1.881", current: "0", progress: 0, frequency: "Por fase", source: "Coleta mensal" },
          { id: "TE3.3", description: "Atingir 40.000 experiências em Prepare.", target: "40.000", current: "0", progress: 0, frequency: "Mensal", source: "Salesforce" },
          { id: "TE3.4", description: "Atingir 1.500 experiências em Succeed.", target: "1.500", current: "0", progress: 0, frequency: "Mensal", source: "Coleta mensal" },
          { id: "TE3.5", description: "Promover 43.381 experiências de alunos.", target: "43.381", current: "0", progress: 0, frequency: "Por fase", source: "Planilha Seeduc" },
        ],
      },
      {
        id: 4,
        title: "Garantir Processos Estruturados",
        keyResults: [
          { id: "TE4.1", description: "Investir média de 60h de capacitação por pessoa.", target: "60h", current: "0", progress: 0, frequency: "Mensal", source: "Planilha de Treinamentos" },
          { id: "TE4.2", description: "Aplicar PDI de 100% dos colaboradores.", target: "100%", current: "0", progress: 0, frequency: "Semestral", source: "PDI" },
          { id: "TE4.3", description: "Criar dashboard dos indicadores da Trilha.", target: "1", current: "0", progress: 0, frequency: "Semestral", source: "-" },
          { id: "TE4.4", description: "Criar fluxograma da Trilha e Matriz RACI.", target: "1", current: "0", progress: 0, frequency: "Anual", source: "Google Drive" },
        ],
      },
      {
        id: 5,
        title: "Consolidar a Marca e Visibilidade da JARJ",
        keyResults: [
          { id: "TE5.1", description: "Newsletter da Trilha em parceria com Marketing.", target: "3", current: "0", progress: 0, frequency: "Por fase", source: "E-mail marketing" },
          { id: "TE5.2", description: "Realizar 2 eventos de relacionamento institucional.", target: "2", current: "0", progress: 0, frequency: "Pontual", source: "Release do evento" },
          { id: "TE5.3", description: "Inscrições em 2 premiações.", target: "2", current: "0", progress: 0, frequency: "Anual", source: "Ficha de inscrição" },
        ],
      },
    ],
  },
  {
    type: "tatico",
    team: "Super Futuro",
    objectives: [
      {
        id: 1,
        title: "Manter a Saúde Financeira Institucional",
        keyResults: [
          { id: "SF1.1", description: "Executar 90% das ações previstas no orçamento anual.", target: "90%", current: "0", progress: 0, frequency: "Por ação", source: "SOS" },
          { id: "SF1.2", description: "Concluir renegociação do aditivo com Supergasbras até setembro.", target: "1", current: "0", progress: 0, frequency: "Pontual", source: "-" },
          { id: "SF1.3", description: "Assegurar economia mínima de 5% no processo de compras.", target: "5%", current: "0", progress: 0, frequency: "-", source: "-" },
        ],
      },
      {
        id: 2,
        title: "Ampliar o Alcance Positivo da JARJ junto aos Stakeholders",
        keyResults: [
          { id: "SF2.1", description: "NPS de voluntários na zona de qualidade (51-75) ou excelência.", target: "80%", current: "0%", progress: 0, frequency: "Por fase", source: "Salesforce" },
          { id: "SF2.2", description: "NPS de alunos na zona de qualidade (51-75).", target: "80%", current: "0", progress: 0, frequency: "Por fase", source: "Salesforce" },
          { id: "SF2.3", description: "Garantir acima de 70% de satisfação de patrocinadores.", target: "100%", current: "0", progress: 0, frequency: "Anual", source: "Google Forms" },
          { id: "SF2.4", description: "Garantir acima de 70% de satisfação de parceiros institucionais.", target: "100%", current: "0", progress: 0, frequency: "Anual", source: "Google Forms" },
          { id: "SF2.5", description: "Parceria com JAs regionais garantindo 1000 alunos por estado.", target: "1.000", current: "0", progress: 0, frequency: "Por fase", source: "Salesforce" },
        ],
      },
      {
        id: 3,
        title: "Garantir o Alcance e Impacto das Experiências",
        keyResults: [
          { id: "SF3.1", description: "Atingir 1.000 experiências em Inspire.", target: "1.000", current: "0", progress: 0, frequency: "Por ação", source: "YouTube" },
          { id: "SF3.2", description: "Atingir 10.000 experiências em Prepare.", target: "10.000", current: "0", progress: 0, frequency: "Por fase", source: "Salesforce" },
          { id: "SF3.3", description: "Atingir 500 experiências em Succeed.", target: "500", current: "0", progress: 0, frequency: "Por ação", source: "Formulário" },
          { id: "SF3.4", description: "Atingir 99 experiências de voluntários.", target: "99", current: "0", progress: 0, frequency: "-", source: "-" },
          { id: "SF3.5", description: "Atingir 100 alunos em cursos de qualificação profissional.", target: "100", current: "0", progress: 0, frequency: "Final do curso", source: "Organização parceira" },
          { id: "SF3.6", description: "Atingir 100 alunos PCDs participando do projeto.", target: "100", current: "0", progress: 0, frequency: "Por ação", source: "Salesforce" },
        ],
      },
      {
        id: 4,
        title: "Garantir Processos Estruturados",
        keyResults: [
          { id: "SF4.1", description: "Realizar 10 sensibilizações com instituições parceiras.", target: "10", current: "0", progress: 0, frequency: "Pontual", source: "Reuniões" },
          { id: "SF4.2", description: "Garantir 80% dos voluntários capacitados.", target: "80%", current: "0", progress: 0, frequency: "Por ação", source: "Capacitações" },
          { id: "SF4.3", description: "Garantir 80% dos professores e coordenadores capacitados.", target: "80%", current: "0", progress: 0, frequency: "Por ação", source: "Capacitações" },
          { id: "SF4.4", description: "Documentação de 100% das ações realizadas.", target: "100%", current: "0", progress: 0, frequency: "Por ação", source: "Drive" },
          { id: "SF4.5", description: "Criar 1 iniciativa de Empregabilidade.", target: "6", current: "0", progress: 0, frequency: "Pontual", source: "Documentação" },
          { id: "SF4.6", description: "Duas iniciativas no eixo de diversidade e inclusão.", target: "6", current: "0", progress: 0, frequency: "Pontual", source: "Documentação" },
        ],
      },
      {
        id: 5,
        title: "Consolidar a Marca e Visibilidade da JARJ",
        keyResults: [
          { id: "SF5.1", description: "Marca da JARJ em 100% das ações.", target: "100%", current: "0", progress: 0, frequency: "Por ação", source: "Apresentações" },
          { id: "SF5.2", description: "Evento de sensibilização com colaboradores da Supergasbras.", target: "100", current: "0", progress: 0, frequency: "Pontual", source: "Lista de presença" },
          { id: "SF5.3", description: "JA Rio citada em todas as inserções de mídia.", target: "100%", current: "0", progress: 0, frequency: "Por ação", source: "Imprensa" },
        ],
      },
    ],
  },
  {
    type: "tatico",
    team: "Novos Negócios",
    objectives: [
      {
        id: 1,
        title: "Manter a Saúde Financeira Institucional",
        keyResults: [
          { id: "NN1.1", description: "Garantir R$1.085.000 de receita total em novos projetos.", target: "R$ 1.085.000", current: "0", progress: 0, frequency: "-", source: "-" },
          { id: "NN1.2", description: "Captar R$ 600.000 em contratos para Trilha Empreendedora.", target: "R$ 600.000", current: "0", progress: 0, frequency: "-", source: "-" },
          { id: "NN1.3", description: "Inscrição em 2 editais internacionais.", target: "2", current: "0", progress: 0, frequency: "-", source: "-" },
          { id: "NN1.4", description: "Garantir entrada de no mínimo 3 novas empresas.", target: "3", current: "0", progress: 0, frequency: "-", source: "-" },
        ],
      },
      {
        id: 2,
        title: "Ampliar o Alcance Positivo da JARJ junto aos Stakeholders",
        keyResults: [
          { id: "NN2.1", description: "Formalizar 2 novos acordos de parceria.", target: "2", current: "0", progress: 0, frequency: "-", source: "-" },
          { id: "NN2.2", description: "Garantir acima de 70% de satisfação dos stakeholders.", target: "70%", current: "0", progress: 0, frequency: "-", source: "-" },
          { id: "NN2.3", description: "Realizar 1 evento institucional com foco em Voluntariado.", target: "1", current: "0", progress: 0, frequency: "-", source: "-" },
        ],
      },
      {
        id: 3,
        title: "Garantir o Alcance e Impacto das Experiências",
        keyResults: [
          { id: "NN3.1", description: "Fechar parceria que contribua com 5% do alcance em Inspire.", target: "5%", current: "0", progress: 0, frequency: "-", source: "-" },
        ],
      },
      {
        id: 4,
        title: "Garantir Processos Estruturados",
        keyResults: [
          { id: "NN4.1", description: "Atualizar procedimento 02 com menção a relacionamento institucional.", target: "1", current: "0", progress: 0, frequency: "-", source: "-" },
          { id: "NN4.2", description: "Atualizar o plano de captação.", target: "1", current: "0", progress: 0, frequency: "-", source: "-" },
          { id: "NN4.3", description: "Executar plano de relacionamento com mantenedores e associados.", target: "1", current: "0", progress: 0, frequency: "-", source: "-" },
        ],
      },
      {
        id: 5,
        title: "Consolidar a Marca e Visibilidade da JARJ",
        keyResults: [
          { id: "NN5.1", description: "Participar de 2 eventos que promovam a visibilidade.", target: "2", current: "0", progress: 0, frequency: "-", source: "-" },
        ],
      },
    ],
  },
  {
    type: "tatico",
    team: "Marketing",
    objectives: [
      {
        id: 1,
        title: "Manter a Saúde Financeira Institucional",
        keyResults: [
          { id: "MK1.1", description: "Redução de 5% no orçamento previsto de Marketing.", target: "-5%", current: "0", progress: 0, frequency: "-", source: "SOS" },
          { id: "MK1.2", description: "Gerar 200 leads B2B para a área de Captação.", target: "200", current: "0", progress: 0, frequency: "-", source: "CRM" },
        ],
      },
      {
        id: 2,
        title: "Ampliar o Alcance Positivo da JARJ junto aos Stakeholders",
        keyResults: [
          { id: "MK2.1", description: "Crescimento de 15% nas inscrições do Cria Digital.", target: "15%", current: "8.591", progress: 1, frequency: "-", source: "Plataforma de Inscrição" },
          { id: "MK2.2", description: "Régua de comunicação para Professores com 15% de taxa de abertura.", target: "15%", current: "0", progress: 0, frequency: "-", source: "Plataforma de E-mail" },
          { id: "MK2.3", description: "1.000 downloads em e-book sobre comunicação acessível.", target: "1.000", current: "0", progress: 0, frequency: "-", source: "RD Station" },
          { id: "MK2.4", description: "Régua de comunicação para mantenedores com satisfação >70.", target: ">70", current: "0", progress: 0, frequency: "-", source: "Pesquisa de satisfação" },
        ],
      },
      {
        id: 3,
        title: "Garantir o Alcance e Impacto das Experiências",
        keyResults: [
          { id: "MK3.1", description: "Atingir 25.000 experiências em Inspire.", target: "25.000", current: "573", progress: 2, frequency: "-", source: "Meta Business Suite" },
          { id: "MK3.2", description: "Atingir 605 experiências em Succeed.", target: "605", current: "0", progress: 0, frequency: "-", source: "Meta Business Suite" },
        ],
      },
      {
        id: 4,
        title: "Garantir Processos Estruturados",
        keyResults: [
          { id: "MK4.1", description: "80% das solicitações ao marketing dentro do SLA.", target: "80%", current: "0", progress: 80, frequency: "-", source: "Monday" },
          { id: "MK4.2", description: "Formulários de captação em 100% das campanhas.", target: "100%", current: "0", progress: 100, frequency: "-", source: "Plataforma de Captação" },
          { id: "MK4.3", description: "Aplicar Plano de Gestão de Desempenho para 100% CLT.", target: "100%", current: "0", progress: 0, frequency: "-", source: "Sistema de RH" },
        ],
      },
      {
        id: 5,
        title: "Consolidar a Marca e Visibilidade da JARJ",
        keyResults: [
          { id: "MK5.1", description: "Aumentar em 15% a percepção positiva da marca.", target: "15%", current: "0", progress: 0, frequency: "-", source: "Pesquisa de Marca" },
          { id: "MK5.2", description: "Inscrever a JARJ em 4 novas premiações.", target: "4", current: "0", progress: 25, frequency: "-", source: "Planilha de Premiações" },
          { id: "MK5.3", description: "Participação do Marketing nos 2 eventos de stakeholders.", target: "2", current: "0", progress: 0, frequency: "-", source: "Relatório de Clipping" },
          { id: "MK5.4", description: "Aumentar engajamento Instagram +40% e LinkedIn +15%.", target: "40%", current: "0", progress: 0, frequency: "-", source: "Meta Business Suite" },
        ],
      },
    ],
  },
  {
    type: "tatico",
    team: "Recursos Humanos",
    objectives: [
      {
        id: 1,
        title: "Manter a Saúde Financeira Institucional",
        keyResults: [
          { id: "RH1.1", description: "Pesquisa salarial de mercado com 3 fontes até junho/2026.", target: "3", current: "0", progress: 0, frequency: "-", source: "Consulta em sites" },
          { id: "RH1.2", description: "Construir Tabela Salarial institucional até outubro/2026.", target: "1", current: "0", progress: 0, frequency: "-", source: "Planilha salarial" },
          { id: "RH1.3", description: "Análise financeira do Plano de C&S 2027 até novembro/2026.", target: "1", current: "0", progress: 0, frequency: "-", source: "Dashboard financeiro" },
        ],
      },
      {
        id: 2,
        title: "Ampliar o Alcance Positivo da JARJ junto aos Stakeholders",
        keyResults: [
          { id: "RH2.1", description: "Participar de ao menos 5 eventos de RH.", target: "5", current: "0", progress: 0, frequency: "-", source: "Reuniões" },
          { id: "RH2.2", description: "Executar ao menos 3 ações do plano da pesquisa de clima.", target: "3", current: "0", progress: 0, frequency: "-", source: "Plano de ação" },
          { id: "RH2.3", description: "Executar ao menos 2 iniciativas de desenvolvimento de lideranças.", target: "2", current: "0", progress: 0, frequency: "-", source: "Treinamentos" },
        ],
      },
      {
        id: 3,
        title: "Garantir o Alcance e Impacto das Experiências",
        keyResults: [
          { id: "RH3.1", description: "Criar no mínimo 5 indicadores estratégicos de RH.", target: "5", current: "0", progress: 0, frequency: "-", source: "Planilha de indicadores" },
          { id: "RH3.2", description: "100% dos treinamentos incentivados realizados.", target: "100%", current: "0", progress: 0, frequency: "-", source: "Dashboard" },
          { id: "RH3.3", description: "Formalizar no mínimo 3 parcerias para benefícios aos colaboradores.", target: "3", current: "0", progress: 0, frequency: "-", source: "Contrato assinado" },
        ],
      },
      {
        id: 4,
        title: "Garantir Processos Estruturados",
        keyResults: [
          { id: "RH4.1", description: "Criar e aprovar Política de Cargos e Salários até dezembro/2026.", target: "1", current: "0", progress: 0, frequency: "-", source: "Manual aprovado" },
          { id: "RH4.2", description: "Criar e aprovar Política de Férias até setembro/2026.", target: "1", current: "0", progress: 0, frequency: "-", source: "Documento aprovado" },
          { id: "RH4.3", description: "Implantar Ciclo de Gestão de Desempenho até junho/2026.", target: "1", current: "0", progress: 0, frequency: "-", source: "Formulários criados" },
        ],
      },
      {
        id: 5,
        title: "Consolidar a Marca e Visibilidade da JARJ",
        keyResults: [
          { id: "RH5.1", description: "Executar 80% das ações de endomarketing do calendário.", target: "80%", current: "0", progress: 0, frequency: "-", source: "Fotos e e-mails" },
          { id: "RH5.2", description: "Implantar 2 canais oficiais de comunicação interna.", target: "2", current: "0", progress: 0, frequency: "-", source: "Quadro de avisos" },
          { id: "RH5.3", description: "Executar 5 ações de saúde e bem-estar.", target: "5", current: "0", progress: 0, frequency: "-", source: "Convites e fotos" },
        ],
      },
    ],
  },
];

export const teams = okrData.map((g) => g.team);
export const tacticalTeams = okrData.filter((g) => g.type === "tatico").map((g) => g.team);

export const objectiveTitles = [
  "Sustentabilidade Financeira",
  "Alcance junto aos Stakeholders",
  "Alcance e Impacto das Experiências",
  "Processos Estruturados",
  "Marca e Visibilidade",
];

export const objectiveIcons = ["💰", "🤝", "🎯", "⚙️", "📣"];
