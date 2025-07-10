export const mockCallDetailData = {
  'call-1': {
    agent: 'PATRICIA',
    campaign: 'Campanha Padrão',
    score: '7.86',
    summary: 'O atendente conversou com o Sr. Manuel sobre a portabilidade de um empréstimo, oferecendo uma proposta que não aumentaria o desconto mensal e liberaria um valor em conta. O atendente se mostrou prestativo e solicitou que o cliente respondesse assim que possível.',
    feedback: {
      positive: {
        title: 'Mandando bem',
        description: 'O atendente demonstrou empatia e foi claro ao explicar a proposta, além de manter um tom amigável durante toda a interação.'
      },
      negative: {
        title: 'Pode melhorar',
        description: 'O encerramento da conversa poderia ser mais formal e incluir uma frase de agradecimento ou disposição para futuras necessidades.'
      }
    },
    generalSummary: 'A conversa foi cordial e focada em atender a necessidade do cliente, mas poderia ter um encerramento mais formal.',
    criteria: [
      {
        name: 'Simpatia',
        score: '8.5',
        color: 'bg-[#5CB868]',
        description: 'Atendente demonstrou boa cordialidade e simpatia durante toda a conversa.',
        hasAttention: false
      },
      {
        name: 'Cordialidade',
        score: '8.0',
        color: 'bg-[#5CB868]',
        description: 'Tom adequado e respeitoso durante toda a interação.',
        hasAttention: false
      },
      {
        name: 'Negociação',
        score: '7.5',
        color: 'bg-[#dc9610]',
        description: 'Apresentou a proposta de forma clara, mas poderia ter explorado mais as necessidades.',
        hasAttention: false
      },
      {
        name: 'Tempo',
        score: '7.0',
        color: 'bg-[#dc9610]',
        description: 'Conversa dentro do tempo adequado, mas alguns pontos poderiam ser mais diretos.',
        hasAttention: false
      },
      {
        name: 'Abordagem',
        score: '8.2',
        color: 'bg-[#5CB868]',
        description: 'Abordagem adequada e focada no problema do cliente.',
        hasAttention: false
      },
      {
        name: 'Finalização',
        score: '6.5',
        color: 'bg-[#dc9610]',
        description: 'Encerramento adequado mas poderia ser mais formal e completo.',
        hasAttention: true
      },
      {
        name: 'Formalidade',
        score: '7.8',
        color: 'bg-[#dc9610]',
        description: 'Manteve formalidade adequada, com pequenos pontos de melhoria.',
        hasAttention: false
      }
    ],
    transcript: {
      content: `Agente: Sim, mas é o único áudio que eu tenho. Os outros áudios que eu tenho lá, né? É lógico. Eu vou ficar solicitando porque é conhecimento de operação.
Agente: Conhecimento de operação.
Agente: Oi, Sr. Manuel.
Agente: Oi, Sr. Manuel. Oi.
Cliente: Oi.
Agente: Acabamos de conversar aqui por ligação. O senhor me informou que está sem internet, né? Eu solicito a simulação, tá? Da proposta e vou passar para o senhor aqui por ligação. Tá bom?
Agente: Ah! você tem aquela parcela de 819 que você paga com o banco mercantil, certo? que é descontada do seu benefício todos os meses.
Cliente: dá
Agente: A gente consegue fazer a portabilidade dela para o Banco Sinato mantendo o mesmo valor de parcela, sem mexer no seu salário, sem aumentar um real no seu desconto, tá? Mantendo o mesmo valor e liberando em conta aproximadamente 5 mil reais para o senhor.
Agente: Então, olha a proposta aí. Pode falar.
Cliente: né preciso 5 mil não.
Agente: A gente consegue, conseguimos sim, tá? Com essa operação de portabilidade, sem aumentar o seu salário, o desconto, né? A gente consegue liberar 5 mil para o senhor dessa proposta, tá? tá?
Agente: O que que eu vou fazer? Eu vou chamar o senhor no WhatsApp, se você conseguir uma internet ainda hoje, pra gente conseguir dar andamento, essa campanha ela é especial, tá que ela tá pra se encerrar, ela é bem curta, tá? Eu vou passar por escrito aí a proposta e a documentação que a gente precisa pra seguir com a digitação, tá bom?
Cliente: bom, tá
Cliente: bom, logo
Agente: Tá? Eu vou passar aí no seu WhatsApp, tá
Cliente: aí, tá
Agente: bom? Aí o senhor me responde assim que puder, tá? Fico no aguardo.
Cliente: bom.
Agente: Obrigada, tchau, tchau.`
    },
    listData: {
      id: 'LST-2024-00147'
    },
    callData: {
      number: '+55 (16) 98180-5151',
      date: '17/04/2025 às 16:59',
      campaign: 'Campanha Padrão',
      status: 'Finalizada',
      qualification: 'Venda feita por telefone',
      mode: 'Manual',
      type: 'Móvel',
      protocol: 'p-20250417165917364',
      billedTime: '00:01:24',
      value: 'R$ 0,077',
      conversationTime: '-',
      mailboxDetection: '-',
      mailboxTime: '00:00:00',
      waitTime: '00:00:00',
      postServiceTime: '00:00:00',
      hangupCause: 'Normal clearing',
      amdRecording: '0:00 / 0:00',
      callId: 'o6015df2ac8104a1d224251',
      mailingList: '-',
      rpcFormattedCallDate: '2025-04-17T16:59:10-03:00',
      receptiveQueue: '-',
      receptiveNumberName: '-',
      receptiveNumber: '-',
      receptiveUraName: '-',
      receptiveUra: '00:00:00',
      agentTalkTime: '-',
      postServiceUraTime: '00:00:00',
      postServiceUra: '-',
      amdTime: '0:00:00'
    }
  },
  'call-2': {
    agent: 'JOÃO',
    campaign: 'Campanha Premium',
    score: '8.2',
    summary: 'Excelente atendimento com abordagem consultiva e encerramento adequado.',
    feedback: {
      positive: {
        title: 'Mandando bem',
        description: 'Atendimento exemplar com foco na solução do cliente.'
      },
      negative: {
        title: 'Pode melhorar',
        description: 'Poderia ter explorado mais oportunidades de cross-sell.'
      }
    },
    generalSummary: 'Atendimento de alta qualidade com excelente relacionamento com o cliente.',
    criteria: [
      {
        name: 'Simpatia',
        score: '9.0',
        color: 'bg-[#5CB868]',
        description: 'Excelente simpatia e carisma durante toda a conversa.',
        hasAttention: false
      },
      {
        name: 'Cordialidade',
        score: '8.5',
        color: 'bg-[#5CB868]',
        description: 'Muito cordial e respeitoso.',
        hasAttention: false
      }
    ],
    transcript: {
      content: 'Transcrição da segunda ligação...'
    },
    listData: {
      id: 'LST-2024-00148'
    },
    callData: {
      number: '+55 (11) 99234-5678',
      date: '17/04/2025 às 14:30',
      campaign: 'Campanha Premium',
      status: 'Finalizada',
      qualification: 'Atendimento realizado',
      mode: 'Automático',
      type: 'Fixo',
      protocol: 'p-20250417143015234',
      billedTime: '00:02:15',
      value: 'R$ 0,125',
      conversationTime: '00:01:45',
      mailboxDetection: 'Não',
      mailboxTime: '00:00:00',
      waitTime: '00:00:15',
      postServiceTime: '00:00:30',
      hangupCause: 'Normal clearing',
      amdRecording: '0:00 / 0:00',
      callId: 'a7823bd4ef2054b8d445672',
      mailingList: 'Lista Premium',
      rpcFormattedCallDate: '2025-04-17T14:30:45-03:00',
      receptiveQueue: 'Queue 1',
      receptiveNumberName: 'João Silva',
      receptiveNumber: '+55 (11) 99234-5678',
      receptiveUraName: 'URA Principal',
      receptiveUra: '00:00:15',
      agentTalkTime: '00:01:30',
      postServiceUraTime: '00:00:30',
      postServiceUra: 'URA Pós-Atendimento',
      amdTime: '0:00:03'
    }
  }
};

export const mockListData = [
  {
    id: 'list-1',
    name: 'Campanha Black Friday',
    date: '15 de novembro',
    agents: 12,
    calls: 2847,
    duration: '2h 30m',
    status: 'active',
    score: 8.5,
    good: 67,
    neutral: 23,
    bad: 10
  },
  {
    id: 'list-2', 
    name: 'Retenção Clientes Premium',
    date: '14 de novembro',
    agents: 8,
    calls: 1256,
    duration: '1h 45m',
    status: 'completed',
    score: 9.2,
    good: 78,
    neutral: 18,
    bad: 4
  },
  {
    id: 'list-3',
    name: 'Cobrança Cartão Crédito',
    date: '13 de novembro',
    agents: 15,
    calls: 3421,
    duration: '3h 15m',
    status: 'paused',
    score: 7.1,
    good: 45,
    neutral: 35,
    bad: 20
  },
  {
    id: 'list-4',
    name: 'Vendas Produtos Digitais',
    date: '12 de novembro',
    agents: 6,
    calls: 892,
    duration: '1h 20m',
    status: 'completed',
    score: 8.8,
    good: 72,
    neutral: 21,
    bad: 7
  }
];

export const mockAgentData = [
  {
    id: 'agent-1',
    name: 'PATRICIA',
    calls: 45,
    duration: '3h 20m',
    score: 8.2,
    status: 'active'
  },
  {
    id: 'agent-2', 
    name: 'JOÃO',
    calls: 38,
    duration: '2h 45m',
    score: 7.9,
    status: 'active'
  },
  {
    id: 'agent-3',
    name: 'MARIA',
    calls: 52,
    duration: '4h 10m',
    score: 9.1,
    status: 'inactive'
  },
  {
    id: 'agent-4',
    name: 'CARLOS',
    calls: 33,
    duration: '2h 15m',
    score: 7.5,
    status: 'active'
  }
];

export const mockCallsData = [
  {
    id: 'call-1',
    number: '+55 (16) 98180-5151',
    duration: '1:24',
    score: 7.86,
    status: 'completed',
    agent: 'PATRICIA',
    campaign: 'Campanha Padrão'
  },
  {
    id: 'call-2',
    number: '+55 (11) 99234-5678', 
    duration: '2:15',
    score: 8.2,
    status: 'completed',
    agent: 'JOÃO',
    campaign: 'Campanha Premium'
  },
  {
    id: 'call-3',
    number: '+55 (21) 97654-3210',
    duration: '0:45',
    score: 6.5,
    status: 'failed',
    agent: 'MARIA',
    campaign: 'Retenção Clientes'
  },
  {
    id: 'call-4',
    number: '+55 (85) 91234-5678',
    duration: '3:30',
    score: 9.1,
    status: 'completed', 
    agent: 'CARLOS',
    campaign: 'Vendas Premium'
  }
];

// Dashboard data
export const mockDashboardData = {
  totalCalls: 15732,
  totalAgents: 45,
  totalDuration: '285h 30m',
  avgScore: 8.4,
  monthlyGrowth: 12.5,
  companyAverage: '8.4',
  callsInAttention: 247,
  performance: {
    good: 75,
    neutral: 18,
    bad: 7
  },
  lists: [
    {
      id: 'list-1',
      name: 'Campanha Black Friday',
      average: '8.5',
      hasAttention: false,
      totalCalls: 2847,
      performance: {
        good: 67,
        neutral: 23,
        bad: 10
      }
    },
    {
      id: 'list-2',
      name: 'Retenção Clientes Premium',
      average: '9.2',
      hasAttention: false,
      totalCalls: 1256,
      performance: {
        good: 78,
        neutral: 18,
        bad: 4
      }
    },
    {
      id: 'list-3',
      name: 'Cobrança Cartão Crédito',
      average: '7.1',
      hasAttention: true,
      totalCalls: 3421,
      performance: {
        good: 45,
        neutral: 35,
        bad: 20
      }
    },
    {
      id: 'list-4',
      name: 'Vendas Produtos Digitais',
      average: '8.8',
      hasAttention: false,
      totalCalls: 892,
      performance: {
        good: 72,
        neutral: 21,
        bad: 7
      }
    },
    {
      id: 'list-5',
      name: 'Prospecção Novos Clientes',
      average: '7.8',
      hasAttention: false,
      totalCalls: 1654,
      performance: {
        good: 58,
        neutral: 32,
        bad: 10
      }
    },
    {
      id: 'list-6',
      name: 'Suporte Técnico',
      average: '8.9',
      hasAttention: false,
      totalCalls: 987,
      performance: {
        good: 76,
        neutral: 19,
        bad: 5
      }
    },
    {
      id: 'list-7',
      name: 'Renovação de Contratos',
      average: '8.1',
      hasAttention: false,
      totalCalls: 743,
      performance: {
        good: 64,
        neutral: 28,
        bad: 8
      }
    },
    {
      id: 'list-8',
      name: 'Pesquisa de Satisfação',
      average: '9.0',
      hasAttention: false,
      totalCalls: 532,
      performance: {
        good: 82,
        neutral: 15,
        bad: 3
      }
    }
  ],
  metrics: {
    totalCalls: {
      value: 15732,
      good: 8421,
      neutral: 4892,
      bad: 2419
    },
    avgScore: {
      value: 8.4,
      good: 75,
      neutral: 18,
      bad: 7
    },
    duration: {
      value: '285h 30m',
      good: 68,
      neutral: 22,
      bad: 10
    },
    satisfaction: {
      value: 92,
      good: 82,
      neutral: 13,
      bad: 5
    }
  }
};

// Agents data (renaming for consistency)
export const mockAgentsData = mockAgentData;

// List detail data
export const mockListDetailData = {
  'list-1': {
    id: 'list-1',
    name: 'Campanha Black Friday',
    date: '15 de novembro',
    status: 'active',
    score: 8.5,
    agents: 12,
    calls: 2847,
    duration: '2h 30m',
    good: 67,
    neutral: 23,
    bad: 10,
    criteria: [
      { name: 'Simpatia', score: 8.5 },
      { name: 'Cordialidade', score: 8.2 },
      { name: 'Negociação', score: 7.8 },
      { name: 'Tempo', score: 8.0 },
      { name: 'Abordagem', score: 8.3 },
      { name: 'Finalização', score: 7.5 },
      { name: 'Formalidade', score: 8.1 }
    ]
  },
  'list-2': {
    id: 'list-2',
    name: 'Retenção Clientes Premium',
    date: '14 de novembro',
    status: 'completed',
    score: 9.2,
    agents: 8,
    calls: 1256,
    duration: '1h 45m',
    good: 78,
    neutral: 18,
    bad: 4,
    criteria: [
      { name: 'Simpatia', score: 9.1 },
      { name: 'Cordialidade', score: 9.3 },
      { name: 'Negociação', score: 8.9 },
      { name: 'Tempo', score: 9.0 },
      { name: 'Abordagem', score: 9.2 },
      { name: 'Finalização', score: 8.8 },
      { name: 'Formalidade', score: 9.4 }
    ]
  },
  'list-3': {
    id: 'list-3',
    name: 'Cobrança Cartão Crédito',
    date: '13 de novembro',
    status: 'paused',
    score: 7.1,
    agents: 15,
    calls: 3421,
    duration: '3h 15m',
    good: 45,
    neutral: 35,
    bad: 20,
    criteria: [
      { name: 'Simpatia', score: 7.0 },
      { name: 'Cordialidade', score: 7.2 },
      { name: 'Negociação', score: 6.8 },
      { name: 'Tempo', score: 7.5 },
      { name: 'Abordagem', score: 7.1 },
      { name: 'Finalização', score: 6.9 },
      { name: 'Formalidade', score: 7.3 }
    ]
  },
  'list-4': {
    id: 'list-4',
    name: 'Vendas Produtos Digitais',
    date: '12 de novembro',
    status: 'completed',
    score: 8.8,
    agents: 6,
    calls: 892,
    duration: '1h 20m',
    good: 72,
    neutral: 21,
    bad: 7,
    criteria: [
      { name: 'Simpatia', score: 8.7 },
      { name: 'Cordialidade', score: 8.9 },
      { name: 'Negociação', score: 8.6 },
      { name: 'Tempo', score: 8.8 },
      { name: 'Abordagem', score: 8.9 },
      { name: 'Finalização', score: 8.5 },
      { name: 'Formalidade', score: 9.0 }
    ]
  }
};

// Agent detail data
export const mockAgentDetailData = {
  'agent-1': {
    id: 'agent-1',
    name: 'PATRICIA',
    calls: 45,
    duration: '3h 20m',
    score: 8.2,
    status: 'active',
    email: 'patricia@niah.com.br',
    phone: '+55 (16) 99999-9999',
    startDate: '15 de janeiro de 2024',
    metrics: {
      totalCalls: { value: 45, good: 32, neutral: 10, bad: 3 },
      avgScore: { value: 8.2, good: 71, neutral: 22, bad: 7 },
      duration: { value: '3h 20m', good: 75, neutral: 20, bad: 5 },
      satisfaction: { value: 89, good: 78, neutral: 15, bad: 7 }
    },
    criteria: [
      { name: 'Simpatia', score: 8.5 },
      { name: 'Cordialidade', score: 8.0 },
      { name: 'Negociação', score: 7.8 },
      { name: 'Tempo', score: 8.2 },
      { name: 'Abordagem', score: 8.3 },
      { name: 'Finalização', score: 7.9 },
      { name: 'Formalidade', score: 8.1 }
    ]
  },
  'agent-2': {
    id: 'agent-2',
    name: 'JOÃO',
    calls: 38,
    duration: '2h 45m',
    score: 7.9,
    status: 'active',
    email: 'joao@niah.com.br',
    phone: '+55 (11) 98888-8888',
    startDate: '20 de fevereiro de 2024',
    metrics: {
      totalCalls: { value: 38, good: 28, neutral: 8, bad: 2 },
      avgScore: { value: 7.9, good: 68, neutral: 25, bad: 7 },
      duration: { value: '2h 45m', good: 72, neutral: 23, bad: 5 },
      satisfaction: { value: 85, good: 75, neutral: 18, bad: 7 }
    },
    criteria: [
      { name: 'Simpatia', score: 8.1 },
      { name: 'Cordialidade', score: 7.8 },
      { name: 'Negociação', score: 7.5 },
      { name: 'Tempo', score: 8.0 },
      { name: 'Abordagem', score: 7.9 },
      { name: 'Finalização', score: 7.7 },
      { name: 'Formalidade', score: 8.2 }
    ]
  },
  'agent-3': {
    id: 'agent-3',
    name: 'MARIA',
    calls: 52,
    duration: '4h 10m',
    score: 9.1,
    status: 'inactive',
    email: 'maria@niah.com.br',
    phone: '+55 (21) 97777-7777',
    startDate: '10 de março de 2024',
    metrics: {
      totalCalls: { value: 52, good: 45, neutral: 6, bad: 1 },
      avgScore: { value: 9.1, good: 85, neutral: 12, bad: 3 },
      duration: { value: '4h 10m', good: 82, neutral: 15, bad: 3 },
      satisfaction: { value: 95, good: 88, neutral: 10, bad: 2 }
    },
    criteria: [
      { name: 'Simpatia', score: 9.2 },
      { name: 'Cordialidade', score: 9.0 },
      { name: 'Negociação', score: 8.9 },
      { name: 'Tempo', score: 9.1 },
      { name: 'Abordagem', score: 9.3 },
      { name: 'Finalização', score: 8.8 },
      { name: 'Formalidade', score: 9.4 }
    ]
  },
  'agent-4': {
    id: 'agent-4',
    name: 'CARLOS',
    calls: 33,
    duration: '2h 15m',
    score: 7.5,
    status: 'active',
    email: 'carlos@niah.com.br',
    phone: '+55 (85) 96666-6666',
    startDate: '5 de abril de 2024',
    metrics: {
      totalCalls: { value: 33, good: 22, neutral: 8, bad: 3 },
      avgScore: { value: 7.5, good: 64, neutral: 28, bad: 8 },
      duration: { value: '2h 15m', good: 67, neutral: 25, bad: 8 },
      satisfaction: { value: 82, good: 71, neutral: 21, bad: 8 }
    },
    criteria: [
      { name: 'Simpatia', score: 7.6 },
      { name: 'Cordialidade', score: 7.4 },
      { name: 'Negociação', score: 7.2 },
      { name: 'Tempo', score: 7.8 },
      { name: 'Abordagem', score: 7.5 },
      { name: 'Finalização', score: 7.3 },
      { name: 'Formalidade', score: 7.7 }
    ]
  }
};

// Company data
export const companyData = {
  name: 'NIAH! Sistemas',
  logo: '/logo-niah.png',
  address: 'Av. Paulista, 1000 - São Paulo, SP',
  phone: '+55 (11) 3000-0000',
  email: 'contato@niah.com.br',
  website: 'https://niah.com.br',
  cnpj: '12.345.678/0001-90',
  employees: 125,
  founded: '2020',
  description: 'Plataforma SaaS de avaliação automatizada de chamadas telefônicas com inteligência artificial.'
};

// Function to get list metrics
export const getListMetrics = (listId: string) => {
  const baseData = mockListDetailData[listId as keyof typeof mockListDetailData];
  
  if (!baseData) {
    // Return default data if list not found
    return {
      name: 'Lista não encontrada',
      listName: 'Lista não encontrada',
      dateRange: '1 - 30 Nov 2024',
      average: '8.2',
      callsInAttention: 12,
      totalCalls: 200,
      performance: {
        good: { percentage: 75, feedbacks: 150 },
        neutral: { percentage: 20, feedbacks: 40 },
        bad: { percentage: 5, feedbacks: 10 }
      },
      agents: []
    };
  }

  // Extend base data with additional metrics needed by ListDetailPage
  return {
    ...baseData,
    listName: baseData.name,
    dateRange: '1 - 30 Nov 2024',
    average: baseData.score.toFixed(1),
    callsInAttention: Math.round(baseData.calls * (baseData.bad / 100)),
    totalCalls: baseData.calls,
    performance: {
      good: { 
        percentage: baseData.good, 
        feedbacks: Math.round(baseData.calls * (baseData.good / 100))
      },
      neutral: { 
        percentage: baseData.neutral, 
        feedbacks: Math.round(baseData.calls * (baseData.neutral / 100))
      },
      bad: { 
        percentage: baseData.bad, 
        feedbacks: Math.round(baseData.calls * (baseData.bad / 100))
      }
    },
    agents: [
      {
        id: 'agent-1',
        name: 'PATRICIA',
        average: '8.2',
        hasAttention: false,
        totalFeedbacks: 45,
        performance: { good: 75, neutral: 20, bad: 5 },
        calls: [
          { id: 'call-1', score: 7.86, criteria: baseData.criteria },
          { id: 'call-2', score: 8.2, criteria: baseData.criteria }
        ]
      },
      {
        id: 'agent-2', 
        name: 'JOÃO',
        average: '7.9',
        hasAttention: false,
        totalFeedbacks: 38,
        performance: { good: 68, neutral: 25, bad: 7 },
        calls: [
          { id: 'call-3', score: 7.5, criteria: baseData.criteria },
          { id: 'call-4', score: 8.3, criteria: baseData.criteria }
        ]
      },
      {
        id: 'agent-3',
        name: 'MARIA',
        average: '9.1',
        hasAttention: false,
        totalFeedbacks: 52,
        performance: { good: 85, neutral: 12, bad: 3 },
        calls: [
          { id: 'call-5', score: 9.2, criteria: baseData.criteria },
          { id: 'call-6', score: 9.0, criteria: baseData.criteria }
        ]
      },
      {
        id: 'agent-4',
        name: 'CARLOS',
        average: '7.5',
        hasAttention: true,
        totalFeedbacks: 33,
        performance: { good: 64, neutral: 28, bad: 8 },
        calls: [
          { id: 'call-7', score: 7.2, criteria: baseData.criteria },
          { id: 'call-8', score: 7.8, criteria: baseData.criteria }
        ]
      }
    ]
  };
};
