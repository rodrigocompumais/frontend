// 10 Templates pré-prontos de FlowBuilder

export const flowBuilderTemplates = [
  {
    id: 'welcome-bot',
    name: 'Bot de Boas-Vindas',
    description: 'Fluxo simples de boas-vindas com apresentação e menu de opções',
    category: 'Atendimento',
    icon: '👋',
    nodes: [
      {
        id: '1',
        position: { x: 100, y: 100 },
        data: { label: 'Início do fluxo' },
        type: 'start',
      },
      {
        id: '2',
        position: { x: 400, y: 100 },
        data: { 
          label: 'Olá! Bem-vindo(a) ao nosso atendimento. Como posso ajudá-lo hoje?' 
        },
        type: 'message',
      },
      {
        id: '3',
        position: { x: 700, y: 100 },
        data: { 
          message: 'Escolha uma opção:',
          arrayOption: [
            { number: 1, value: 'Falar com atendente' },
            { number: 2, value: 'Informações sobre produtos' },
            { number: 3, value: 'Suporte técnico' },
          ]
        },
        type: 'menu',
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'buttonedge' },
      { id: 'e2-3', source: '2', target: '3', type: 'buttonedge' },
    ],
  },
  
  {
    id: 'sales-funnel',
    name: 'Funil de Vendas',
    description: 'Qualificação de leads e encaminhamento para equipe de vendas',
    category: 'Vendas',
    icon: '💰',
    nodes: [
      {
        id: '1',
        position: { x: 100, y: 100 },
        data: { label: 'Início do fluxo' },
        type: 'start',
      },
      {
        id: '2',
        position: { x: 400, y: 100 },
        data: { 
          label: 'Olá! Vamos te ajudar a encontrar a melhor solução para você.' 
        },
        type: 'message',
      },
      {
        id: '3',
        position: { x: 700, y: 100 },
        data: { 
          message: 'Qual produto você tem interesse?',
          arrayOption: [
            { number: 1, value: 'Plano Básico' },
            { number: 2, value: 'Plano Profissional' },
            { number: 3, value: 'Plano Enterprise' },
          ]
        },
        type: 'menu',
      },
      {
        id: '4',
        position: { x: 1000, y: 100 },
        data: { 
          label: 'Perfeito! Vou conectar você com um especialista.' 
        },
        type: 'message',
      },
      {
        id: '5',
        position: { x: 1300, y: 100 },
        data: { 
          label: 'Criando ticket de vendas...' 
        },
        type: 'ticket',
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'buttonedge' },
      { id: 'e2-3', source: '2', target: '3', type: 'buttonedge' },
      { id: 'e3a-4', source: '3', sourceHandle: 'a1', target: '4', type: 'buttonedge' },
      { id: 'e3b-4', source: '3', sourceHandle: 'a2', target: '4', type: 'buttonedge' },
      { id: 'e3c-4', source: '3', sourceHandle: 'a3', target: '4', type: 'buttonedge' },
      { id: 'e4-5', source: '4', target: '5', type: 'buttonedge' },
    ],
  },

  {
    id: 'support-bot',
    name: 'Suporte Técnico',
    description: 'Triagem de problemas técnicos e abertura de chamados',
    category: 'Suporte',
    icon: '🛠️',
    nodes: [
      {
        id: '1',
        position: { x: 100, y: 100 },
        data: { label: 'Início do fluxo' },
        type: 'start',
      },
      {
        id: '2',
        position: { x: 400, y: 100 },
        data: { 
          label: 'Olá! Seja bem-vindo ao suporte técnico.' 
        },
        type: 'message',
      },
      {
        id: '3',
        position: { x: 700, y: 100 },
        data: { 
          message: 'Qual tipo de problema você está enfrentando?',
          arrayOption: [
            { number: 1, value: 'Não consigo fazer login' },
            { number: 2, value: 'Erro no sistema' },
            { number: 3, value: 'Dúvida sobre funcionalidade' },
            { number: 4, value: 'Outro problema' },
          ]
        },
        type: 'menu',
      },
      {
        id: '4',
        position: { x: 1000, y: 100 },
        data: { 
          label: 'Entendi. Vou criar um chamado para nossa equipe técnica.' 
        },
        type: 'message',
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'buttonedge' },
      { id: 'e2-3', source: '2', target: '3', type: 'buttonedge' },
      { id: 'e3-4', source: '3', sourceHandle: 'a1', target: '4', type: 'buttonedge' },
    ],
  },

  {
    id: 'appointment-booking',
    name: 'Agendamento de Consulta',
    description: 'Fluxo para agendamento de consultas ou reuniões',
    category: 'Agendamento',
    icon: '📅',
    nodes: [
      {
        id: '1',
        position: { x: 100, y: 100 },
        data: { label: 'Início do fluxo' },
        type: 'start',
      },
      {
        id: '2',
        position: { x: 400, y: 100 },
        data: { 
          label: 'Olá! Vamos agendar sua consulta.' 
        },
        type: 'message',
      },
      {
        id: '3',
        position: { x: 700, y: 100 },
        data: { 
          message: 'Qual horário você prefere?',
          arrayOption: [
            { number: 1, value: 'Manhã (8h-12h)' },
            { number: 2, value: 'Tarde (13h-17h)' },
            { number: 3, value: 'Noite (18h-21h)' },
          ]
        },
        type: 'menu',
      },
      {
        id: '4',
        position: { x: 1000, y: 100 },
        data: { 
          label: 'Perfeito! Agendamento confirmado. Em breve você receberá uma confirmação.' 
        },
        type: 'message',
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'buttonedge' },
      { id: 'e2-3', source: '2', target: '3', type: 'buttonedge' },
      { id: 'e3-4', source: '3', sourceHandle: 'a1', target: '4', type: 'buttonedge' },
    ],
  },

  {
    id: 'feedback-collector',
    name: 'Coletor de Feedback',
    description: 'Coleta feedback e avaliação de clientes',
    category: 'Pesquisa',
    icon: '⭐',
    nodes: [
      {
        id: '1',
        position: { x: 100, y: 100 },
        data: { label: 'Início do fluxo' },
        type: 'start',
      },
      {
        id: '2',
        position: { x: 400, y: 100 },
        data: { 
          label: 'Olá! Gostaríamos de saber sua opinião sobre nosso atendimento.' 
        },
        type: 'message',
      },
      {
        id: '3',
        position: { x: 700, y: 100 },
        data: { 
          message: 'Como você avalia nosso atendimento?',
          arrayOption: [
            { number: 1, value: '⭐ Ruim' },
            { number: 2, value: '⭐⭐ Regular' },
            { number: 3, value: '⭐⭐⭐ Bom' },
            { number: 4, value: '⭐⭐⭐⭐ Muito Bom' },
            { number: 5, value: '⭐⭐⭐⭐⭐ Excelente' },
          ]
        },
        type: 'menu',
      },
      {
        id: '4',
        position: { x: 1000, y: 100 },
        data: { 
          label: 'Obrigado pelo seu feedback! Ele é muito importante para nós.' 
        },
        type: 'message',
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'buttonedge' },
      { id: 'e2-3', source: '2', target: '3', type: 'buttonedge' },
      { id: 'e3-4', source: '3', sourceHandle: 'a3', target: '4', type: 'buttonedge' },
    ],
  },

  {
    id: 'product-catalog',
    name: 'Catálogo de Produtos',
    description: 'Apresenta catálogo de produtos com imagens e informações',
    category: 'Vendas',
    icon: '🛍️',
    nodes: [
      {
        id: '1',
        position: { x: 100, y: 100 },
        data: { label: 'Início do fluxo' },
        type: 'start',
      },
      {
        id: '2',
        position: { x: 400, y: 100 },
        data: { 
          label: 'Seja bem-vindo! Confira nosso catálogo de produtos.' 
        },
        type: 'message',
      },
      {
        id: '3',
        position: { x: 700, y: 100 },
        data: { 
          message: 'Qual categoria você deseja ver?',
          arrayOption: [
            { number: 1, value: 'Eletrônicos' },
            { number: 2, value: 'Moda' },
            { number: 3, value: 'Casa e Decoração' },
          ]
        },
        type: 'menu',
      },
      {
        id: '4',
        position: { x: 1000, y: 100 },
        data: { 
          label: 'Ótima escolha! Vou te mostrar nossos produtos.' 
        },
        type: 'message',
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'buttonedge' },
      { id: 'e2-3', source: '2', target: '3', type: 'buttonedge' },
      { id: 'e3-4', source: '3', sourceHandle: 'a1', target: '4', type: 'buttonedge' },
    ],
  },

  {
    id: 'faq-bot',
    name: 'FAQ Automático',
    description: 'Responde perguntas frequentes automaticamente',
    category: 'Atendimento',
    icon: '❓',
    nodes: [
      {
        id: '1',
        position: { x: 100, y: 100 },
        data: { label: 'Início do fluxo' },
        type: 'start',
      },
      {
        id: '2',
        position: { x: 400, y: 100 },
        data: { 
          label: 'Olá! Posso te ajudar com algumas dúvidas comuns.' 
        },
        type: 'message',
      },
      {
        id: '3',
        position: { x: 700, y: 100 },
        data: { 
          message: 'Sobre o que você gostaria de saber?',
          arrayOption: [
            { number: 1, value: 'Horário de funcionamento' },
            { number: 2, value: 'Formas de pagamento' },
            { number: 3, value: 'Política de devolução' },
            { number: 4, value: 'Falar com atendente' },
          ]
        },
        type: 'menu',
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'buttonedge' },
      { id: 'e2-3', source: '2', target: '3', type: 'buttonedge' },
    ],
  },

  {
    id: 'lead-qualification',
    name: 'Qualificação de Lead',
    description: 'Qualifica leads através de perguntas estratégicas',
    category: 'Marketing',
    icon: '🎯',
    nodes: [
      {
        id: '1',
        position: { x: 100, y: 100 },
        data: { label: 'Início do fluxo' },
        type: 'start',
      },
      {
        id: '2',
        position: { x: 400, y: 100 },
        data: { 
          label: 'Olá! Para te ajudar melhor, preciso de algumas informações.' 
        },
        type: 'message',
      },
      {
        id: '3',
        position: { x: 700, y: 100 },
        data: { 
          message: 'Qual o tamanho da sua empresa?',
          arrayOption: [
            { number: 1, value: 'Micro (1-10 funcionários)' },
            { number: 2, value: 'Pequena (11-50)' },
            { number: 3, value: 'Média (51-200)' },
            { number: 4, value: 'Grande (200+)' },
          ]
        },
        type: 'menu',
      },
      {
        id: '4',
        position: { x: 1000, y: 100 },
        data: { 
          label: 'Perfeito! Vou conectar você com o consultor ideal.' 
        },
        type: 'message',
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'buttonedge' },
      { id: 'e2-3', source: '2', target: '3', type: 'buttonedge' },
      { id: 'e3-4', source: '3', sourceHandle: 'a2', target: '4', type: 'buttonedge' },
    ],
  },

  {
    id: 'event-registration',
    name: 'Inscrição em Evento',
    description: 'Fluxo para inscrição e confirmação em eventos',
    category: 'Eventos',
    icon: '🎉',
    nodes: [
      {
        id: '1',
        position: { x: 100, y: 100 },
        data: { label: 'Início do fluxo' },
        type: 'start',
      },
      {
        id: '2',
        position: { x: 400, y: 100 },
        data: { 
          label: 'Seja bem-vindo! Vamos fazer sua inscrição no evento.' 
        },
        type: 'message',
      },
      {
        id: '3',
        position: { x: 700, y: 100 },
        data: { 
          message: 'Qual dia você gostaria de participar?',
          arrayOption: [
            { number: 1, value: 'Dia 15 - Workshop Manhã' },
            { number: 2, value: 'Dia 15 - Workshop Tarde' },
            { number: 3, value: 'Dia 16 - Palestra' },
          ]
        },
        type: 'menu',
      },
      {
        id: '4',
        position: { x: 1000, y: 100 },
        data: { 
          label: 'Inscrição confirmada! Você receberá mais detalhes por email.' 
        },
        type: 'message',
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'buttonedge' },
      { id: 'e2-3', source: '2', target: '3', type: 'buttonedge' },
      { id: 'e3-4', source: '3', sourceHandle: 'a1', target: '4', type: 'buttonedge' },
    ],
  },

  {
    id: 'onboarding-customer',
    name: 'Onboarding de Cliente',
    description: 'Guia novo cliente pelo processo de onboarding',
    category: 'Atendimento',
    icon: '🚀',
    nodes: [
      {
        id: '1',
        position: { x: 100, y: 100 },
        data: { label: 'Início do fluxo' },
        type: 'start',
      },
      {
        id: '2',
        position: { x: 400, y: 100 },
        data: { 
          label: 'Olá! Seja muito bem-vindo! Vamos começar sua jornada.' 
        },
        type: 'message',
      },
      {
        id: '3',
        position: { x: 700, y: 100 },
        data: { 
          message: 'O que você gostaria de fazer primeiro?',
          arrayOption: [
            { number: 1, value: 'Tutorial básico' },
            { number: 2, value: 'Configurar minha conta' },
            { number: 3, value: 'Ver recursos avançados' },
          ]
        },
        type: 'menu',
      },
      {
        id: '4',
        position: { x: 1000, y: 100 },
        data: { 
          label: 'Ótimo! Vamos começar. Preparado?' 
        },
        type: 'message',
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'buttonedge' },
      { id: 'e2-3', source: '2', target: '3', type: 'buttonedge' },
      { id: 'e3-4', source: '3', sourceHandle: 'a1', target: '4', type: 'buttonedge' },
    ],
  },
];

export const getTemplateById = (id) => {
  return flowBuilderTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category) => {
  return flowBuilderTemplates.filter(template => template.category === category);
};

export const getAllCategories = () => {
  return [...new Set(flowBuilderTemplates.map(t => t.category))];
};
