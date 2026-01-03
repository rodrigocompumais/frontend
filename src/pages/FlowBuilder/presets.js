
export const flowPresets = [
    {
        id: 1,
        name: "Boas-vindas e Menu",
        description: "Saudação inicial com menu de opções principais.",
        flow: {
            nodes: [
                { id: "1", type: "start", position: { x: 250, y: 100 }, data: { label: "Inicio do fluxo" } },
                { id: "2", type: "message", position: { x: 250, y: 300 }, data: { label: "Olá! Seja bem-vindo à nossa empresa. Como podemos ajudar hoje?" } },
                { id: "3", type: "menu", position: { x: 250, y: 500 }, data: { message: "Por favor, escolha uma opção:", arrayOption: [{ value: 1, label: "Falar com Suporte" }, { value: 2, label: "Vendas" }, { value: 3, label: "Financeiro" }] } },
                { id: "4", type: "message", position: { x: 50, y: 800 }, data: { label: "Você selecionou Suporte. Um atendente irá ajudá-lo em breve." } },
                { id: "5", type: "message", position: { x: 250, y: 800 }, data: { label: "Você selecionou Vendas. Confira nossas promoções!" } },
                { id: "6", type: "message", position: { x: 450, y: 800 }, data: { label: "Você selecionou Financeiro. Digite seu CPF para continuarmos." } }
            ],
            edges: [
                { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
                { id: "e2-3", source: "2", target: "3", type: "smoothstep" },
                { id: "e3-4", source: "3", target: "4", sourceHandle: "b-0", type: "buttonedge" },
                { id: "e3-5", source: "3", target: "5", sourceHandle: "b-1", type: "buttonedge" },
                { id: "e3-6", source: "3", target: "6", sourceHandle: "b-2", type: "buttonedge" }
            ]
        }
    },
    {
        id: 2,
        name: "Triagem de Suporte",
        description: "Direciona o cliente para o departamento correto.",
        flow: {
            nodes: [
                { id: "1", type: "start", position: { x: 250, y: 100 }, data: { label: "Inicio do fluxo" } },
                { id: "2", type: "menu", position: { x: 250, y: 300 }, data: { message: "Qual o motivo do seu contato?", arrayOption: [{ value: 1, label: "Problema Técnico" }, { value: 2, label: "Dúvida Financeira" }, { value: 3, label: "Outros Assuntos" }] } },
                { id: "3", type: "ticket", position: { x: 50, y: 600 }, data: { queue: 1, label: "Fila Técnica" } },
                { id: "4", type: "ticket", position: { x: 250, y: 600 }, data: { queue: 2, label: "Fila Financeira" } },
                { id: "5", type: "ticket", position: { x: 450, y: 600 }, data: { queue: 3, label: "Fila Geral" } }
            ],
            edges: [
                { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
                { id: "e2-3", source: "2", target: "3", sourceHandle: "b-0", type: "buttonedge" },
                { id: "e2-4", source: "2", target: "4", sourceHandle: "b-1", type: "buttonedge" },
                { id: "e2-5", source: "2", target: "5", sourceHandle: "b-2", type: "buttonedge" }
            ]
        }
    },
    {
        id: 3,
        name: "Fora do Horário",
        description: "Mensagem automática para contatos fora do expediente.",
        flow: {
            nodes: [
                { id: "1", type: "start", position: { x: 250, y: 100 }, data: { label: "Inicio do fluxo" } },
                { id: "2", type: "condition", position: { x: 250, y: 300 }, data: { condition: "time", key: "open", value: "" } },
                { id: "3", type: "message", position: { x: 100, y: 500 }, data: { label: "Estamos abertos! Um atendente logo falará com você." } },
                { id: "4", type: "message", position: { x: 400, y: 500 }, data: { label: "No momento estamos fechados. Nosso horário é das 9h às 18h. Deixe sua mensagem!" } }
            ],
            edges: [
                { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
                { id: "e2-3", source: "2", target: "3", sourceHandle: "true", type: "smoothstep", label: "Aberto" },
                { id: "e2-4", source: "2", target: "4", sourceHandle: "false", type: "smoothstep", label: "Fechado" }
            ]
        }
    },
    {
        id: 4,
        name: "Pesquisa de Satisfação",
        description: "Coleta feedback do cliente (NPS).",
        flow: {
            nodes: [
                { id: "1", type: "start", position: { x: 250, y: 100 }, data: { label: "Inicio do fluxo" } },
                { id: "2", type: "message", position: { x: 250, y: 300 }, data: { label: "Espero que hayamos resolvido seu problema! Poderia avaliar nosso atendimento?" } },
                { id: "3", type: "menu", position: { x: 250, y: 500 }, data: { message: "De 0 a 10, qual a chance de nos indicar?", arrayOption: [{ value: 1, label: "0-6 (Não recomendo)" }, { value: 2, label: "7-8 (Neutro)" }, { value: 3, label: "9-10 (Recomendo)" }] } },
                { id: "4", type: "message", position: { x: 250, y: 800 }, data: { label: "Obrigado pelo seu feedback! Isso nos ajuda a melhorar." } }
            ],
            edges: [
                { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
                { id: "e2-3", source: "2", target: "3", type: "smoothstep" },
                { id: "e3-4a", source: "3", target: "4", sourceHandle: "b-0", type: "buttonedge" },
                { id: "e3-4b", source: "3", target: "4", sourceHandle: "b-1", type: "buttonedge" },
                { id: "e3-4c", source: "3", target: "4", sourceHandle: "b-2", type: "buttonedge" }
            ]
        }
    },
    {
        id: 5,
        name: "Captura de Leads",
        description: "Solicita nome e e-mail do contato.",
        flow: {
            nodes: [
                { id: "1", type: "start", position: { x: 250, y: 100 }, data: { label: "Inicio do fluxo" } },
                { id: "2", type: "message", position: { x: 250, y: 300 }, data: { label: "Olá! Para receber nossas novidades, precisamos de alguns dados." } },
                { id: "3", type: "message", position: { x: 250, y: 500 }, data: { label: "Qual é o seu nome completo?" } },
                { id: "4", type: "message", position: { x: 250, y: 700 }, data: { label: "Obrigado! E qual é o seu melhor e-mail?" } },
                { id: "5", type: "message", position: { x: 250, y: 900 }, data: { label: "Perfeito! Seu cadastro foi realizado." } }
            ],
            edges: [
                { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
                { id: "e2-3", source: "2", target: "3", type: "smoothstep" },
                { id: "e3-4", source: "3", target: "4", type: "smoothstep" },
                { id: "e4-5", source: "4", target: "5", type: "smoothstep" }
            ]
        }
    },
    {
        id: 6,
        name: "Agendamento",
        description: "Flow simples para direcionar agendamentos.",
        flow: {
            nodes: [
                { id: "1", type: "start", position: { x: 250, y: 100 }, data: { label: "Inicio do fluxo" } },
                { id: "2", type: "message", position: { x: 250, y: 300 }, data: { label: "Gostaria de agendar uma consulta conosco?" } },
                { id: "3", type: "menu", position: { x: 250, y: 500 }, data: { message: "Escolha uma opção:", arrayOption: [{ value: 1, label: "Ver horários disponíveis" }, { value: 2, label: "Falar com secretária" }] } },
                { id: "4", type: "message", position: { x: 100, y: 800 }, data: { label: "Acesse nosso link de agendamento: https://agenda.exemplo.com" } },
                { id: "5", type: "ticket", position: { x: 400, y: 800 }, data: { queue: 1, label: "Secretaria" } }
            ],
            edges: [
                { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
                { id: "e2-3", source: "2", target: "3", type: "smoothstep" },
                { id: "e3-4", source: "3", target: "4", sourceHandle: "b-0", type: "buttonedge" },
                { id: "e3-5", source: "3", target: "5", sourceHandle: "b-1", type: "buttonedge" }
            ]
        }
    },
    {
        id: 7,
        name: "FAQ Bot",
        description: "Responde perguntas frequentes.",
        flow: {
            nodes: [
                { id: "1", type: "start", position: { x: 250, y: 100 }, data: { label: "Inicio do fluxo" } },
                { id: "2", type: "menu", position: { x: 250, y: 300 }, data: { message: "Sobre o que você tem dúvida?", arrayOption: [{ value: 1, label: "Preços" }, { value: 2, label: "Prazo de Entrega" }, { value: 3, label: "Formas de Pagamento" }] } },
                { id: "3", type: "message", position: { x: 0, y: 600 }, data: { label: "Nossos planos começam a partir de R$ 99,00/mês." } },
                { id: "4", type: "message", position: { x: 250, y: 600 }, data: { label: "O prazo de entrega padrão é de 3 a 5 dias úteis." } },
                { id: "5", type: "message", position: { x: 500, y: 600 }, data: { label: "Aceitamos cartão, boleto e PIX." } },
                { id: "6", type: "message", position: { x: 250, y: 900 }, data: { label: "Algo mais que possamos ajudar?" } }
            ],
            edges: [
                { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
                { id: "e2-3", source: "2", target: "3", sourceHandle: "b-0", type: "buttonedge" },
                { id: "e2-4", source: "2", target: "4", sourceHandle: "b-1", type: "buttonedge" },
                { id: "e2-5", source: "2", target: "5", sourceHandle: "b-2", type: "buttonedge" },
                { id: "e3-6", source: "3", target: "6", type: "smoothstep" },
                { id: "e4-6", source: "4", target: "6", type: "smoothstep" },
                { id: "e5-6", source: "5", target: "6", type: "smoothstep" }
            ]
        }
    },
    {
        id: 8,
        name: "Vitrine de Produtos",
        description: "Mostra imagens de produtos.",
        flow: {
            nodes: [
                { id: "1", type: "start", position: { x: 250, y: 100 }, data: { label: "Inicio do fluxo" } },
                { id: "2", type: "message", position: { x: 250, y: 300 }, data: { label: "Confira nossos lançamentos!" } },
                { id: "3", type: "img", position: { x: 250, y: 500 }, data: { url: "https://via.placeholder.com/300?text=Produto+1" } },
                { id: "4", type: "img", position: { x: 250, y: 800 }, data: { url: "https://via.placeholder.com/300?text=Produto+2" } },
                { id: "5", type: "message", position: { x: 250, y: 1100 }, data: { label: "Gostou de algum? Fale com um vendedor!" } }
            ],
            edges: [
                { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
                { id: "e2-3", source: "2", target: "3", type: "smoothstep" },
                { id: "e3-4", source: "3", target: "4", type: "smoothstep" },
                { id: "e4-5", source: "4", target: "5", type: "smoothstep" }
            ]
        }
    },
    {
        id: 9,
        name: "Resposta com Áudio",
        description: "Envia um áudio pré-gravado.",
        flow: {
            nodes: [
                { id: "1", type: "start", position: { x: 250, y: 100 }, data: { label: "Inicio do fluxo" } },
                { id: "2", type: "message", position: { x: 250, y: 300 }, data: { label: "Olá! Escute essa mensagem importante:" } },
                { id: "3", type: "audio", position: { x: 250, y: 500 }, data: { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", record: true } },
                { id: "4", type: "message", position: { x: 250, y: 700 }, data: { label: "Espero que tenha gostado." } }
            ],
            edges: [
                { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
                { id: "e2-3", source: "2", target: "3", type: "smoothstep" },
                { id: "e3-4", source: "3", target: "4", type: "smoothstep" }
            ]
        }
    },
    {
        id: 10,
        name: "Demo Integrações",
        description: "Exemplo com Typebot e OpenAI.",
        flow: {
            nodes: [
                { id: "1", type: "start", position: { x: 250, y: 100 }, data: { label: "Inicio do fluxo" } },
                { id: "2", type: "menu", position: { x: 250, y: 300 }, data: { message: "Você prefere falar com IA ou Fluxo?", arrayOption: [{ value: 1, label: "OpenAI ChatGPT" }, { value: 2, label: "Typebot" }] } },
                { id: "3", type: "openai", position: { x: 100, y: 600 }, data: { name: "Assistente IA", prompt: "Aja como um atendente virtual." } },
                { id: "4", type: "typebot", position: { x: 400, y: 600 }, data: { url: "https://typebot.io/meu-bot", typebotId: "meu-bot" } }
            ],
            edges: [
                { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
                { id: "e2-3", source: "2", target: "3", sourceHandle: "b-0", type: "buttonedge" },
                { id: "e2-4", source: "2", target: "4", sourceHandle: "b-1", type: "buttonedge" }
            ]
        }
    }
];
