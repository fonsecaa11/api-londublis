// Main Chatbot Controller
class ChatbotController {
  constructor() {
    this.responses = new ChatbotResponses();
    this.ui = new ChatbotUI();
    this.isInitialized = false;
    this.init();
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  initialize() {
    if (this.isInitialized) return;
    
    // Make chatbot responses available globally
    window.chatbotResponses = this.responses;
    
    // Initialize welcome sequence
    this.initializeWelcomeSequence();
    
    // Set up periodic engagement
    this.setupPeriodicEngagement();
    
    // Handle website interactions
    this.setupWebsiteIntegration();
    
    this.isInitialized = true;
    console.log('🤖 Chatbot initialized successfully');
  }

  initializeWelcomeSequence() {
    // Show notification after a few seconds if user hasn't opened chatbot
    setTimeout(() => {
      if (!this.ui.isOpen && this.ui.messageHistory.length <= 1) {
        this.ui.showNotificationBadge();
      }
    }, 5000);
    
    // Send helpful message after some time
    setTimeout(() => {
      if (!this.ui.isOpen && this.ui.messageHistory.length <= 1) {
        this.ui.sendAutomaticMessage('Precisas de ajuda para encontrar o imóvel ideal? Estou aqui para te ajudar! 🏠✨');
      }
    }, 15000);
  }

  setupPeriodicEngagement() {
    // Periodic helpful tips (only if chatbot is not active)
    setInterval(() => {
      if (!this.ui.isOpen && !this.ui.isTyping && this.ui.messageHistory.length > 0) {
        const tips = [
          'Sabias que podes pesquisar imóveis por código postal? 🔍',
          'Experimenta perguntar sobre pontos de interesse próximos! 📍',
          'Posso ajudar-te a gerar relatórios PDF detalhados! 📄'
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        
        // Only send if last interaction was more than 5 minutes ago
        const lastMessage = this.ui.messageHistory[this.ui.messageHistory.length - 1];
        if (lastMessage && (Date.now() - lastMessage.timestamp.getTime()) > 300000) {
          this.ui.sendAutomaticMessage(randomTip);
        }
      }
    }, 600000); // Every 10 minutes
  }

  setupWebsiteIntegration() {
    // Integration with search bar
    const searchBar = document.querySelector('.search-bar input');
    if (searchBar) {
      searchBar.addEventListener('focus', () => {
        if (!this.ui.isOpen) {
          setTimeout(() => {
            this.ui.sendAutomaticMessage('Vejo que estás a pesquisar! Posso ajudar-te a encontrar o imóvel perfeito. Experimenta perguntar-me sobre localizações específicas! 🔍');
          }, 2000);
        }
      });
    }

    // Integration with feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        const features = [
          'Como posso ajudar-te com a pesquisa avançada de imóveis?',
          'Queres saber sobre pontos de interesse próximos a algum imóvel?',
          'Precisas de ajuda para gerar um relatório PDF?'
        ];
        
        if (!this.ui.isOpen) {
          this.ui.openChatbot();
          setTimeout(() => {
            this.ui.sendAutomaticMessage(features[index] || features[0]);
          }, 500);
        }
      });
    });

    // Handle navigation interactions
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const linkText = link.textContent.toLowerCase();
        let message = '';
        
        switch (linkText) {
          case 'imóveis':
            message = 'Preciso de ajuda para encontrar imóveis? Posso ajudar-te com pesquisas específicas! 🏠';
            break;
          case 'mapa':
            message = 'O mapa interativo é muito útil! Posso explicar-te como encontrar pontos de interesse e navegar pela zona! 🗺️';
            break;
          case 'contactos':
            message = 'Se precisares de suporte adicional, estou aqui para te ajudar com qualquer dúvida! 💬';
            break;
        }
        
        if (message && !this.ui.isOpen) {
          setTimeout(() => {
            this.ui.sendAutomaticMessage(message);
          }, 1000);
        }
      });
    });
  }

  // Public API methods
  sendMessage(message) {
    if (!this.ui.isOpen) {
      this.ui.openChatbot();
    }
    
    setTimeout(() => {
      this.ui.input.value = message;
      this.ui.sendMessage();
    }, 300);
  }

  openChat() {
    this.ui.openChatbot();
  }

  closeChat() {
    this.ui.closeChatbot();
  }

  // Handle external triggers
  handleExternalTrigger(type, data = {}) {
    let message = '';
    
    switch (type) {
      case 'property-viewed':
        message = `Vi que estás interessado numa propriedade! Queres saber sobre pontos de interesse próximos ou gerar um relatório PDF?`;
        break;
      case 'search-performed':
        message = `Como correu a pesquisa? Posso ajudar-te a refinar os resultados ou encontrar informações adicionais!`;
        break;
      case 'page-error':
        message = `Parece que houve um problema. Como posso ajudar-te a resolver isso?`;
        break;
      default:
        message = `Como posso ajudar-te hoje?`;
    }
    
    this.ui.sendAutomaticMessage(message);
  }
}

// Initialize chatbot when script loads
const chatbot = new ChatbotController();

// Make chatbot available globally for external integrations
window.ImóvelBot = {
  sendMessage: (message) => chatbot.sendMessage(message),
  openChat: () => chatbot.openChat(),
  closeChat: () => chatbot.closeChat(),
  trigger: (type, data) => chatbot.handleExternalTrigger(type, data)
};