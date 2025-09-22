// Chatbot Response Processing
class ChatbotResponses {
  constructor() {
    this.data = ChatbotData;
    this.conversationContext = {
      lastTopic: null,
      userPreferences: {},
      searchHistory: []
    };
  }

  // Main method to process user messages
  processMessage(message) {
    const normalizedMessage = this.normalizeMessage(message);
    
    // Check for greetings
    if (this.isGreeting(normalizedMessage)) {
      return this.getGreetingResponse();
    }
    
    // Check for thanks
    if (this.isThanks(normalizedMessage)) {
      return this.getThanksResponse();
    }
    
    // Check for help requests
    if (this.isHelpRequest(normalizedMessage)) {
      return this.getHelpResponse();
    }
    
    // Search for FAQ matches
    const faqResponse = this.findFAQMatch(normalizedMessage);
    if (faqResponse) {
      return faqResponse;
    }
    
    // Handle property searches
    if (this.isPropertySearch(normalizedMessage)) {
      return this.handlePropertySearch(message);
    }
    
    // Handle POI queries
    if (this.isPOIQuery(normalizedMessage)) {
      return this.handlePOIQuery(message);
    }
    
    // Handle region statistics
    if (this.isRegionQuery(normalizedMessage)) {
      return this.handleRegionQuery(message);
    }
    
    // Handle PDF requests
    if (this.isPDFRequest(normalizedMessage)) {
      return this.handlePDFRequest();
    }
    
    // Default response for unknown queries
    return this.getUnknownResponse();
  }

  // Normalize message for better matching
  normalizeMessage(message) {
    return message.toLowerCase()
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim();
  }

  // Check if message is a greeting
  isGreeting(message) {
    const greetings = ['ola', 'olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'ei'];
    return greetings.some(greeting => message.includes(greeting));
  }

  // Check if message is thanks
  isThanks(message) {
    const thankWords = ['obrigado', 'obrigada', 'obrigad', 'obrigad@', 'thanks', 'valeu', 'brigado', 'brigada'];
    return thankWords.some(word => message.includes(word));
  }

  // Check if message is asking for help
  isHelpRequest(message) {
    const helpWords = ['ajuda', 'ajudar', 'help', 'suporte', 'auxilio', 'como', 'o que podes fazer'];
    return helpWords.some(word => message.includes(word));
  }

  // Check if message is about property search
  isPropertySearch(message) {
    const searchWords = ['pesquisar', 'procurar', 'buscar', 'encontrar', 'imovel', 'casa', 'apartamento'];
    return searchWords.some(word => message.includes(word));
  }

  // Check if message is about POIs
  isPOIQuery(message) {
    const poiWords = ['pois', 'pontos', 'interesse', 'escolas', 'transportes', 'servicos', 'restaurantes', 'proximo'];
    return poiWords.some(word => message.includes(word));
  }

  // Check if message is about regions
  isRegionQuery(message) {
    const regionWords = ['regiao', 'area', 'estatisticas', 'dados', 'populacao', 'lisboa', 'porto'];
    return regionWords.some(word => message.includes(word));
  }

  // Check if message is about PDF
  isPDFRequest(message) {
    const pdfWords = ['pdf', 'relatorio', 'documento', 'gerar', 'download'];
    return pdfWords.some(word => message.includes(word));
  }

  // Find FAQ match
  findFAQMatch(message) {
    for (const faq of this.data.faqs) {
      const matchCount = faq.keywords.filter(keyword => 
        message.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount >= 2) {
        this.conversationContext.lastTopic = faq.question;
        return {
          type: 'faq',
          content: faq.answer,
          relatedQuestion: faq.question
        };
      }
    }
    return null;
  }

  // Handle property search
  handlePropertySearch(message) {
    // Extract potential search terms
    const searchTerms = this.extractSearchTerms(message);
    let results = [];

    if (searchTerms.postalCode) {
      results = this.data.propertyData.filter(prop => 
        prop.postal.includes(searchTerms.postalCode)
      );
    } else if (searchTerms.location) {
      results = this.data.propertyData.filter(prop => 
        prop.address.toLowerCase().includes(searchTerms.location)
      );
    } else {
      // Show random properties
      results = this.data.propertyData.slice(0, 3);
    }

    if (results.length > 0) {
      let response = `Encontrei ${results.length} imóveis que podem interessar-te:\n\n`;
      results.forEach((prop, index) => {
        response += `${index + 1}. 📍 ${prop.address}\n💰 ${prop.price} - ${prop.type}\n\n`;
      });
      response += 'Gostarias de saber mais sobre algum destes imóveis ou ver pontos de interesse próximos?';
      
      return {
        type: 'property-search',
        content: response,
        data: results
      };
    } else {
      return {
        type: 'no-results',
        content: 'Não encontrei imóveis com esses critérios. Experimenta pesquisar por:\n• Nome da rua\n• Código postal\n• Cidade (Lisboa, Porto, etc.)\n• Tipo de imóvel'
      };
    }
  }

  // Extract search terms from message
  extractSearchTerms(message) {
    const postalCodeRegex = /\b\d{4}-?\d{3}\b/;
    const cities = ['lisboa', 'porto', 'coimbra', 'braga', 'faro'];
    
    const postalMatch = message.match(postalCodeRegex);
    const cityMatch = cities.find(city => message.toLowerCase().includes(city));
    
    return {
      postalCode: postalMatch ? postalMatch[0] : null,
      location: cityMatch || null
    };
  }

  // Handle POI queries
  handlePOIQuery(message) {
    const location = this.extractLocation(message) || 'Lisboa';
    
    let response = `Aqui estão os principais pontos de interesse próximos de ${location}:\n\n`;
    
    response += `🏫 **Escolas:**\n${this.data.poisData.escolas.join('\n')}\n\n`;
    response += `🚌 **Transportes:**\n${this.data.poisData.transportes.join('\n')}\n\n`;
    response += `🏥 **Serviços:**\n${this.data.poisData.servicos.join('\n')}\n\n`;
    response += `🍽️ **Restaurantes:**\n${this.data.poisData.restaurantes.join('\n')}\n\n`;
    
    response += 'Queres saber mais detalhes sobre algum destes locais?';
    
    return {
      type: 'poi-info',
      content: response,
      location: location
    };
  }

  // Handle region statistics
  handleRegionQuery(message) {
    const region = message.toLowerCase().includes('porto') ? 'porto' : 'lisboa';
    const stats = this.data.regionalStats[region];
    
    if (stats) {
      let response = `📊 **Estatísticas de ${region.charAt(0).toUpperCase() + region.slice(1)}:**\n\n`;
      response += `👥 População: ${stats.population}\n`;
      response += `💰 Preço médio: ${stats.avgPrice}\n`;
      response += `🏫 Escolas: ${stats.schools}\n`;
      response += `🛡️ Segurança: ${stats.safety}\n`;
      response += `🚇 Transportes: ${stats.transport}\n\n`;
      response += 'Precisas de mais informações sobre esta região?';
      
      return {
        type: 'region-stats',
        content: response,
        region: region
      };
    }
    
    return {
      type: 'no-data',
      content: 'Ainda não tenho dados estatísticos para essa região. As regiões disponíveis são: Lisboa e Porto.'
    };
  }

  // Handle PDF requests
  handlePDFRequest() {
    return {
      type: 'pdf-help',
      content: `Para gerar um relatório PDF:\n\n1. Usar a barra de pesquisa no topo\n2. Clica em "Gerar Relatório PDF"\n3. Escolhe as informações a incluir:\n   • Detalhes do imóvel\n   • Pontos de interesse\n   • Estatísticas da região\n   • Mapas\n4. O PDF será criado automaticamente\n\nPrecisas de ajuda com algum imóvel específico?`
    };
  }

  // Extract location from message
  extractLocation(message) {
    const cities = ['lisboa', 'porto', 'coimbra', 'braga', 'faro', 'aveiro', 'setúbal'];
    return cities.find(city => message.toLowerCase().includes(city));
  }

  // Get greeting response
  getGreetingResponse() {
    const responses = this.data.quickResponses.greeting;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      type: 'greeting',
      content: `${randomResponse}\n\nPosso ajudar-te com:\n• 🔍 Pesquisa de imóveis\n• 📍 Pontos de interesse\n• 📊 Dados regionais\n• 📄 Relatórios PDF\n• ❓ Suporte técnico`
    };
  }

  // Get thanks response
  getThanksResponse() {
    const responses = this.data.quickResponses.thanks;
    return {
      type: 'thanks',
      content: responses[Math.floor(Math.random() * responses.length)]
    };
  }

  // Get help response
  getHelpResponse() {
    return {
      type: 'help',
      content: this.data.quickResponses.help[0]
    };
  }

  // Get unknown response
  getUnknownResponse() {
    const responses = this.data.quickResponses.unknown;
    return {
      type: 'unknown',
      content: responses[Math.floor(Math.random() * responses.length)]
    };
  }

  // Handle quick actions
  handleQuickAction(action) {
    switch (action) {
      case 'search':
        return {
          type: 'quick-action',
          content: 'Para pesquisar imóveis, podes:\n\n🔍 Usar a barra de pesquisa no topo\n📍 Digitar endereço ou código postal\n🗺️ Navegar pelo mapa interativo\n⚙️ Usar filtros avançados\n\nO que gostarias de pesquisar?'
        };
      
      case 'pois':
        return this.handlePOIQuery('pontos de interesse lisboa');
      
      case 'pdf':
        return this.handlePDFRequest();
      
      case 'help':
        return this.getHelpResponse();
      
      default:
        return this.getUnknownResponse();
    }
  }
}