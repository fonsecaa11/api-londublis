// Chatbot Data and Configuration
const ChatbotData = {
  // FAQ Database
  faqs: [
    {
      keywords: ['pesquisar', 'procurar', 'buscar', 'encontrar', 'imóvel', 'casa', 'apartamento'],
      question: 'Como pesquisar um imóvel no site?',
      answer: 'Para pesquisar um imóvel, pode usar a barra de pesquisa no topo da página. Digite:\n• Nome da rua ou morada\n• Código postal\n• Coordenadas geográficas\n• Tipo de imóvel (casa, apartamento, etc.)\n\nTambém pode filtrar por preço, número de quartos e outras características.'
    },
    {
      keywords: ['pois', 'pontos', 'interesse', 'escolas', 'transportes', 'serviços', 'próximo'],
      question: 'Como encontrar pontos de interesse próximos?',
      answer: 'Os pontos de interesse aparecem automaticamente quando seleciona um imóvel. Pode ver:\n• 🏫 Escolas e universidades\n• 🚌 Transportes públicos\n• 🅿️ Estacionamentos\n• 🛒 Supermercados e centros comerciais\n• 🍽️ Restaurantes e cafés\n• 🏥 Hospitais e farmácias\n\nClique no ícone do mapa para ver todos os POIs da área.'
    },
    {
      keywords: ['pdf', 'relatório', 'relatorio', 'documento', 'gerar', 'download', 'baixar'],
      question: 'Como gerar um relatório PDF?',
      answer: 'Para gerar um relatório PDF sobre um imóvel:\n1. Aceda à página do imóvel\n2. Clique em "Gerar Relatório PDF"\n3. Selecione as informações a incluir:\n   • Detalhes do imóvel\n   • Pontos de interesse\n   • Estatísticas da região\n   • Mapas e fotografias\n4. O PDF será gerado automaticamente para download'
    },
    {
      keywords: ['estatísticas', 'estatisticas', 'dados', 'região', 'regiao', 'área', 'area', 'população', 'populacao'],
      question: 'Como consultar dados estatísticos de uma região?',
      answer: 'Para ver estatísticas de uma região:\n• Clique no mapa da área que pretende\n• Selecione "Dados da Região" no menu\n• Encontrará informações sobre:\n  - População e densidade\n  - Preços médios de imóveis\n  - Transportes e acessibilidade\n  - Qualidade das escolas\n  - Índices de segurança\n  - Crescimento urbano'
    },
    {
      keywords: ['conta', 'registo', 'registro', 'login', 'perfil', 'criar'],
      question: 'Como criar uma conta?',
      answer: 'Para criar uma conta:\n1. Clique em "Registar" no canto superior direito\n2. Preencha os seus dados:\n   • Email\n   • Password segura\n   • Nome completo\n3. Confirme o email que receber\n4. Já pode guardar imóveis favoritos e criar alertas personalizados!'
    },
    {
      keywords: ['mapa', 'localização', 'localizacao', 'navegar', 'direções', 'direcoes'],
      question: 'Como usar o mapa interativo?',
      answer: 'O mapa interativo permite:\n• 🔍 Zoom in/out com a roda do rato\n• 📍 Clicar em marcadores para ver detalhes\n• 🗂️ Filtrar por tipo de imóvel\n• 🎯 Pesquisar por localização específica\n• 📏 Medir distâncias\n• 🛣️ Ver rotas e transportes\n\nUse os controlos do lado direito para personalizar a visualização.'
    }
  ],

  // Property suggestions database
  propertyData: [
    { id: 1, address: 'Rua da Liberdade, 123, Lisboa', price: '350.000€', type: 'Apartamento T2', postal: '1250-142' },
    { id: 2, address: 'Avenida da República, 456, Porto', price: '280.000€', type: 'Apartamento T3', postal: '4000-001' },
    { id: 3, address: 'Rua de Santa Catarina, 789, Porto', price: '220.000€', type: 'Apartamento T1', postal: '4000-447' },
    { id: 4, address: 'Alameda dos Oceanos, 321, Lisboa', price: '450.000€', type: 'Casa T4', postal: '1990-197' },
    { id: 5, address: 'Rua do Carmo, 654, Lisboa', price: '320.000€', type: 'Apartamento T2', postal: '1200-092' }
  ],

  // POIs data
  poisData: {
    escolas: ['Escola Básica D. Dinis', 'Colégio São João de Brito', 'Universidade de Lisboa'],
    transportes: ['Metro - Estação Marquês', 'Autocarros 736, 746, 783', 'Comboio - Estação do Oriente'],
    servicos: ['Hospital Santa Maria', 'Centro Comercial Colombo', 'Farmácia Central'],
    restaurantes: ['Taberna do Real Fado', 'Pastéis de Belém', 'Ramiro - Marisqueira']
  },

  // Regional statistics
  regionalStats: {
    'lisboa': {
      population: '547.733 habitantes',
      avgPrice: '4.200€/m²',
      schools: '8.5/10 qualidade',
      safety: '7.2/10 segurança',
      transport: '9.1/10 transportes'
    },
    'porto': {
      population: '237.591 habitantes', 
      avgPrice: '2.800€/m²',
      schools: '8.2/10 qualidade',
      safety: '7.8/10 segurança',
      transport: '8.4/10 transportes'
    }
  },

  // Quick response templates
  quickResponses: {
    greeting: [
      'Olá! Como posso ajudar-te hoje? 😊',
      'Bem-vindo! Em que posso ser útil?',
      'Olá! Estou aqui para te ajudar com imóveis e muito mais!'
    ],
    
    thanks: [
      'De nada! Foi um prazer ajudar! 😊',
      'Fico feliz por ter ajudado!',
      'Sempre às ordens! Se precisares de mais alguma coisa, é só dizer!'
    ],

    unknown: [
      'Desculpa, não compreendi bem a tua pergunta. Podes reformular?',
      'Hmm, não tenho certeza sobre isso. Podes ser mais específico?',
      'Não encontrei informações sobre isso. Experimenta perguntar de outra forma.'
    ],

    help: [
      'Posso ajudar-te com:\n• 🏠 Pesquisa de imóveis\n• 📍 Pontos de interesse\n• 📊 Dados de regiões\n• 📄 Relatórios PDF\n• ❓ Suporte técnico\n\nO que precisas?'
    ]
  }
};