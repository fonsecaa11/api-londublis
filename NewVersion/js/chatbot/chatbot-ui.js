  const avatar = document.getElementById('avatar');
    const type = 'user'; // Altere para 'bot' ou outro valor para testar

    // Definindo os SVGs para o usuário e para o robô
    const userSVG = `
      <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="6" r="4" fill="#1C274C"/>
        <path d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z" fill="#1C274C"/>
      </svg>
    `;
    const botSVG = `
      <svg fill="#ffffff" width="30px" height="30px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
        <title>ic_fluent_bot_24_regular</title>
        <desc>Created with Sketch.</desc>
        <g id="🔍-Product-Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="ic_fluent_bot_24_regular" fill="#212121" fill-rule="nonzero">
                <path d="M17.7530511,13.999921 C18.9956918,13.999921 20.0030511,15.0072804 20.0030511,16.249921 L20.0030511,17.1550008 C20.0030511,18.2486786 19.5255957,19.2878579 18.6957793,20.0002733 C17.1303315,21.344244 14.8899962,22.0010712 12,22.0010712 C9.11050247,22.0010712 6.87168436,21.3444691 5.30881727,20.0007885 C4.48019625,19.2883988 4.00354153,18.2500002 4.00354153,17.1572408 L4.00354153,16.249921 C4.00354153,15.0072804 5.01090084,13.999921 6.25354153,13.999921 L17.7530511,13.999921 Z M17.7530511,15.499921 L6.25354153,15.499921 C5.83932796,15.499921 5.50354153,15.8357075 5.50354153,16.249921 L5.50354153,17.1572408 C5.50354153,17.8128951 5.78953221,18.4359296 6.28670709,18.8633654 C7.5447918,19.9450082 9.44080155,20.5010712 12,20.5010712 C14.5599799,20.5010712 16.4578003,19.9446634 17.7186879,18.8621641 C18.2165778,18.4347149 18.5030511,17.8112072 18.5030511,17.1550005 L18.5030511,16.249921 C18.5030511,15.8357075 18.1672647,15.499921 17.7530511,15.499921 Z M11.8985607,2.00734093 L12.0003312,2.00049432 C12.380027,2.00049432 12.6938222,2.2826482 12.7434846,2.64872376 L12.7503312,2.75049432 L12.7495415,3.49949432 L16.25,3.5 C17.4926407,3.5 18.5,4.50735931 18.5,5.75 L18.5,10.254591 C18.5,11.4972317 17.4926407,12.504591 16.25,12.504591 L7.75,12.504591 C6.50735931,12.504591 5.5,11.4972317 5.5,10.254591 L5.5,5.75 C5.5,4.50735931 6.50735931,3.5 7.75,3.5 L11.2495415,3.49949432 L11.2503312,2.75049432 C11.2503312,2.37079855 11.5324851,2.05700336 11.8985607,2.00734093 L12.0003312,2.00049432 L11.8985607,2.00734093 Z M16.25,5 L7.75,5 C7.33578644,5 7,5.33578644 7,5.75 L7,10.254591 C7,10.6688046 7.33578644,11.004591 7.75,11.004591 L16.25,11.004591 C16.6642136,11.004591 17,10.6688046 17,10.254591 L17,5.75 C17,5.33578644 16.6642136,5 16.25,5 Z M9.74928905,6.5 C10.4392523,6.5 10.9985781,7.05932576 10.9985781,7.74928905 C10.9985781,8.43925235 10.4392523,8.99857811 9.74928905,8.99857811 C9.05932576,8.99857811 8.5,8.43925235 8.5,7.74928905 C8.5,7.05932576 9.05932576,6.5 9.74928905,6.5 Z M14.2420255,6.5 C14.9319888,6.5 15.4913145,7.05932576 15.4913145,7.74928905 C15.4913145,8.43925235 14.9319888,8.99857811 14.2420255,8.99857811 C13.5520622,8.99857811 12.9927364,8.43925235 12.9927364,7.74928905 C12.9927364,7.05932576 13.5520622,6.5 14.2420255,6.5 Z" id="🎨-Color">
                
                </path>
             </g>
         </g>
      </svg>
    `;

    
// Chatbot UI Management
class ChatbotUI {
  constructor() {
    this.isOpen = false;
    this.isTyping = false;
    this.messageHistory = [];
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    this.container = document.getElementById('chatbotContainer');
    this.toggle = document.getElementById('chatbotToggle');
    this.window = document.getElementById('chatbotWindow');
    this.close = document.getElementById('chatbotClose');
    this.messages = document.getElementById('chatbotMessages');
    this.input = document.getElementById('messageInput');
    this.sendButton = document.getElementById('sendButton');
    this.typingIndicator = document.getElementById('typingIndicator');
    this.quickActions = document.getElementById('quickActions');
    this.notificationBadge = document.getElementById('notificationBadge');
  }

  attachEventListeners() {
    // Toggle chatbot
    this.toggle.addEventListener('click', () => this.toggleChatbot());
    this.close.addEventListener('click', () => this.closeChatbot());
    
    // Send message
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    
    // Quick actions
    this.quickActions.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-action')) {
        const action = e.target.dataset.action;
        this.handleQuickAction(action);
      }
    });
    
    // Auto-focus input when chatbot opens
    this.input.addEventListener('focus', () => {
      this.hideNotificationBadge();
    });
    
    // Handle input changes
    this.input.addEventListener('input', () => {
      this.sendButton.disabled = !this.input.value.trim();
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.container.contains(e.target)) {
        // Don't close immediately, add a small delay
        setTimeout(() => {
          if (this.isOpen && !this.input.matches(':focus')) {
            this.closeChatbot();
          }
        }, 100);
      }
    });
  }

  toggleChatbot() {
    if (this.isOpen) {
      this.closeChatbot();
    } else {
      this.openChatbot();
    }
  }

  openChatbot() {
    this.isOpen = true;
    this.window.classList.add('active');
    this.toggle.style.transform = 'scale(0.9)';
    this.hideNotificationBadge();
    
    // Focus input after animation
    setTimeout(() => {
      this.input.focus();
    }, 300);
    
    // Show welcome message if first time
    if (this.messageHistory.length === 1) {
      setTimeout(() => {
        this.addBotMessage('Posso ajudar-te a encontrar informações sobre imóveis, pontos de interesse, ou qualquer dúvida que tenhas! 😊');
      }, 500);
    }
  }

  closeChatbot() {
    this.isOpen = false;
    this.window.classList.remove('active');
    this.toggle.style.transform = 'scale(1)';
    this.input.blur();
  }

  sendMessage() {
    const message = this.input.value.trim();
    if (!message || this.isTyping) return;
    
    this.addUserMessage(message);
    this.input.value = '';
    this.sendButton.disabled = true;
    
    // Show typing indicator
    this.showTypingIndicator();
    
    // Process message and respond
    setTimeout(() => {
      const response = window.chatbotResponses.processMessage(message);
      this.hideTypingIndicator();
      this.addBotMessage(response.content, response);
    }, 1000 + Math.random() * 1500); // Random delay for more natural feel
  }

  addUserMessage(message) {
    const messageElement = this.createMessageElement(message, 'user');
    this.messages.appendChild(messageElement);
    this.scrollToBottom();
    this.messageHistory.push({ type: 'user', content: message, timestamp: new Date() });
  }

  addBotMessage(message, responseData = null) {
    const messageElement = this.createMessageElement(message, 'bot');
    this.messages.appendChild(messageElement);
    this.scrollToBottom();
    this.messageHistory.push({ 
      type: 'bot', 
      content: message, 
      timestamp: new Date(),
      data: responseData 
    });
    
    // Add interactive elements based on response type
    if (responseData) {
      this.addInteractiveElements(messageElement, responseData);
    }
  }

  createMessageElement(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    if (type === 'user') {
      avatar.innerHTML = userSVG; // Substitui o emoji por SVG
    } else {
      avatar.innerHTML = botSVG;  // Substitui o emoji por SVG
    }
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const messageText = document.createElement('p');
    messageText.innerHTML = this.formatMessage(message);
    content.appendChild(messageText);
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = this.formatTime(new Date());
    content.appendChild(time);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    return messageDiv;
  }

  addInteractiveElements(messageElement, responseData) {
    const content = messageElement.querySelector('.message-content');
    
    if (responseData.type === 'property-search' && responseData.data) {
      // Add property cards
      const propertyContainer = document.createElement('div');
      propertyContainer.className = 'property-results';
      propertyContainer.style.cssText = `
        margin-top: var(--space-3);
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      `;
      
      responseData.data.forEach((property, index) => {
        const propertyCard = this.createPropertyCard(property);
        propertyContainer.appendChild(propertyCard);
      });
      
      content.insertBefore(propertyContainer, content.querySelector('.message-time'));
    }
    
    if (responseData.type === 'faq' || responseData.type === 'help') {
      // Add helpful action buttons
      this.addActionButtons(content, responseData);
    }
  }

  createPropertyCard(property) {
    const card = document.createElement('div');
    card.style.cssText = `
      background: var(--neutral-50);
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-lg);
      padding: var(--space-3);
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    
    card.innerHTML = `
      <div style="font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-1);">
        ${property.type}
      </div>
      <div style="font-size: var(--font-size-sm); color: var(--neutral-600); margin-bottom: var(--space-2);">
        📍 ${property.address}
      </div>
      <div style="font-weight: 600; color: var(--primary-color);">
        💰 ${property.price}
      </div>
    `;
    
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = 'var(--shadow-lg)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'none';
    });
    
    card.addEventListener('click', () => {
      this.handlePropertyClick(property);
    });
    
    return card;
  }

  addActionButtons(content, responseData) {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      margin-top: var(--space-3);
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    `;
    
    let buttons = [];
    
    if (responseData.type === 'faq') {
      buttons = [
        { text: '🔍 Pesquisar Imóveis', action: 'search' },
        { text: '📍 Ver POIs', action: 'pois' }
      ];
    } else if (responseData.type === 'help') {
      buttons = [
        { text: '🏠 Ver Imóveis', action: 'search' },
        { text: '📄 Gerar PDF', action: 'pdf' }
      ];
    }
    
    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.textContent = btn.text;
      button.style.cssText = `
        background: var(--primary-color);
        color: white;
        border: none;
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      `;
      
      button.addEventListener('mouseenter', () => {
        button.style.background = 'var(--primary-dark)';
        button.style.transform = 'translateY(-1px)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.background = 'var(--primary-color)';
        button.style.transform = 'translateY(0)';
      });
      
      button.addEventListener('click', () => {
        this.handleQuickAction(btn.action);
      });
      
      buttonContainer.appendChild(button);
    });
    
    content.insertBefore(buttonContainer, content.querySelector('.message-time'));
  }

  handlePropertyClick(property) {
    const message = `Quero saber mais sobre: ${property.address}`;
    this.addUserMessage(message);
    
    setTimeout(() => {
      this.showTypingIndicator();
      setTimeout(() => {
        this.hideTypingIndicator();
        const detailResponse = `📍 **${property.type}** - ${property.address}\n💰 **Preço:** ${property.price}\n\n📋 **Informações disponíveis:**\n• Ver fotografias e detalhes\n• Pontos de interesse próximos\n• Dados da região\n• Gerar relatório PDF completo\n\nO que gostarias de saber sobre este imóvel?`;
        this.addBotMessage(detailResponse);
      }, 1000);
    }, 100);
  }

  handleQuickAction(action) {
    const response = window.chatbotResponses.handleQuickAction(action);
    
    // Add user message first
    const actionTexts = {
      search: 'Como pesquisar imóveis?',
      pois: 'Quais são os pontos de interesse disponíveis?',
      pdf: 'Como gerar relatórios PDF?',
      help: 'Preciso de ajuda'
    };
    
    this.addUserMessage(actionTexts[action] || 'Ajuda');
    
    // Then add bot response
    this.showTypingIndicator();
    setTimeout(() => {
      this.hideTypingIndicator();
      this.addBotMessage(response.content, response);
    }, 800);
  }

  showTypingIndicator() {
    this.isTyping = true;
    this.typingIndicator.classList.add('active');
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    this.isTyping = false;
    this.typingIndicator.classList.remove('active');
  }

  showNotificationBadge() {
    this.notificationBadge.classList.remove('hidden');
  }

  hideNotificationBadge() {
    this.notificationBadge.classList.add('hidden');
  }

  formatMessage(message) {
    return message
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    
    return date.toLocaleDateString('pt-PT', { 
      day: 'numeric', 
      month: 'short' 
    });
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      this.messages.scrollTop = this.messages.scrollHeight;
    });
  }

  // Public method to send automatic messages
  sendAutomaticMessage(message) {
    if (!this.isOpen) {
      this.showNotificationBadge();
    }
    
    setTimeout(() => {
      this.addBotMessage(message);
    }, 500);
  }
}