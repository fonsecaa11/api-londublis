// Main website functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize search functionality
  initializeSearch();
  
  // Initialize feature interactions
  initializeFeatures();
  
  // Initialize responsive design helpers
  initializeResponsive();
  
  // Initialize performance optimizations
  initializePerformance();
});

function initializeSearch() {
  const searchInput = document.querySelector('.search-bar input');
  const searchButton = document.querySelector('.search-btn');
  
  if (!searchInput || !searchButton) return;
  
  // Auto-complete functionality
  let searchTimeout;
  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const query = this.value.trim();
    
    if (query.length > 2) {
      searchTimeout = setTimeout(() => {
        showSearchSuggestions(query);
      }, 300);
    } else {
      hideSearchSuggestions();
    }
  });
  
  // Search execution
  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  function showSearchSuggestions(query) {
    // Create or get suggestions container
    let suggestionsContainer = document.getElementById('search-suggestions');
    if (!suggestionsContainer) {
      suggestionsContainer = document.createElement('div');
      suggestionsContainer.id = 'search-suggestions';
      suggestionsContainer.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 2px solid var(--neutral-200);
        border-top: none;
        border-radius: 0 0 var(--radius-lg) var(--radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: 100;
        max-height: 200px;
        overflow-y: auto;
      `;
      document.querySelector('.search-bar').style.position = 'relative';
      document.querySelector('.search-bar').appendChild(suggestionsContainer);
    }
    
    // Mock suggestions based on query
    const mockSuggestions = generateMockSuggestions(query);
    
    suggestionsContainer.innerHTML = '';
    mockSuggestions.forEach(suggestion => {
      const item = document.createElement('div');
      item.style.cssText = `
        padding: var(--space-3) var(--space-4);
        border-bottom: 1px solid var(--neutral-100);
        cursor: pointer;
        transition: background-color 0.2s ease;
      `;
      item.textContent = suggestion;
      
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = 'var(--neutral-50)';
      });
      
      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'transparent';
      });
      
      item.addEventListener('click', () => {
        searchInput.value = suggestion;
        hideSearchSuggestions();
        performSearch();
      });
      
      suggestionsContainer.appendChild(item);
    });
  }
  
  function hideSearchSuggestions() {
    const container = document.getElementById('search-suggestions');
    if (container) {
      container.remove();
    }
  }
  
  function generateMockSuggestions(query) {
    const suggestions = [
      'Apartamento T2 Lisboa',
      'Casa T3 Porto',
      'Rua da Liberdade, Lisboa',
      '1250-142 Lisboa',
      'Apartamento T1 Baixa',
      'Villa T4 Cascais',
      'Studio Centro Histórico',
      'Penthouse Avenidas Novas'
    ];
    
    return suggestions
      .filter(s => s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }
  
  function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    hideSearchSuggestions();
    
    // Show loading state
    const originalText = searchButton.textContent;
    searchButton.textContent = '⏳';
    searchButton.disabled = true;
    
    // Simulate search
    setTimeout(() => {
      searchButton.textContent = originalText;
      searchButton.disabled = false;
      
      // Show results (mock)
      showSearchResults(query);
      
      // Trigger chatbot assistance
      if (window.ImóvelBot) {
        window.ImóvelBot.trigger('search-performed', { query });
      }
    }, 1500);
  }
  
  function showSearchResults(query) {
    // Create results modal or section
    console.log(`Searching for: ${query}`);
    
    // For demo purposes, show an alert
    alert(`Pesquisa realizada para: "${query}"\n\nEm produção, aqui apareceriam os resultados dos imóveis.`);
  }
}

function initializeFeatures() {
  const featureCards = document.querySelectorAll('.feature-card');
  
  featureCards.forEach((card, index) => {
    // Add enhanced hover effects
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
      card.style.boxShadow = 'var(--shadow-xl)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = 'var(--shadow-sm)';
    });
    
    // Add click functionality
    card.addEventListener('click', () => {
      handleFeatureClick(index);
    });
    
    // Add keyboard navigation
    card.setAttribute('tabindex', '0');
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleFeatureClick(index);
      }
    });
  });
  
  function handleFeatureClick(index) {
    const features = [
      {
        title: 'Pesquisa Avançada',
        action: () => {
          document.querySelector('.search-bar input').focus();
          if (window.ImóvelBot) {
            window.ImóvelBot.sendMessage('Como funciona a pesquisa avançada?');
          }
        }
      },
      {
        title: 'Pontos de Interesse',
        action: () => {
          if (window.ImóvelBot) {
            window.ImóvelBot.sendMessage('Que pontos de interesse posso consultar?');
          }
        }
      },
      {
        title: 'Relatórios PDF',
        action: () => {
          if (window.ImóvelBot) {
            window.ImóvelBot.sendMessage('Como gero relatórios PDF?');
          }
        }
      }
    ];
    
    if (features[index]) {
      features[index].action();
    }
  }
}

function initializeResponsive() {
  // Handle mobile navigation
  const header = document.querySelector('.header');
  const nav = document.querySelector('.header nav');
  
  // Add mobile menu toggle if needed
  if (window.innerWidth <= 768) {
    addMobileNavigation();
  }
  
  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth <= 768) {
        addMobileNavigation();
      } else {
        removeMobileNavigation();
      }
    }, 250);
  });
  
  function addMobileNavigation() {
    if (document.querySelector('.mobile-menu-toggle')) return;
    
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-menu-toggle';
    mobileToggle.innerHTML = '☰';
    mobileToggle.style.cssText = `
      display: block;
      background: none;
      border: none;
      font-size: var(--font-size-xl);
      cursor: pointer;
      color: var(--primary-color);
    `;
    
    mobileToggle.addEventListener('click', () => {
      nav.style.display = nav.style.display === 'none' ? 'flex' : 'none';
    });
    
    header.querySelector('.container').appendChild(mobileToggle);
    nav.style.display = 'none';
  }
  
  function removeMobileNavigation() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
      mobileToggle.remove();
      nav.style.display = 'flex';
    }
  }
}

function initializePerformance() {
  // Lazy loading for images (if any are added later)
  const observerOptions = {
    root: null,
    rootMargin: '10px',
    threshold: 0.1
  };
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, observerOptions);
  
  // Observe all images with data-src
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
  
  // Optimize scroll performance
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      cancelAnimationFrame(scrollTimeout);
    }
    
    scrollTimeout = requestAnimationFrame(() => {
      handleScroll();
    });
  });
  
  function handleScroll() {
    const scrolled = window.pageYOffset;
    const header = document.querySelector('.header');
    
    // Add shadow to header on scroll
    if (scrolled > 10) {
      header.style.boxShadow = 'var(--shadow-md)';
    } else {
      header.style.boxShadow = 'none';
    }
  }
  
  // Preload critical resources
  const preloadLinks = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
  ];
  
  preloadLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });
}

// Global utility functions
window.utils = {
  // Debounce function for performance
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function for scroll events
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Format price utility
  formatPrice: (price) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  },
  
  // Format date utility
  formatDate: (date) => {
    return new Intl.DateTimeFormat('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }
};