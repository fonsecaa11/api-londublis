// Global variables
let currentLocationData = null;
let currentPOIs = [];
let currentFilters = {
    education: true,
    health: true,
    transport: true,
    shopping: true,
    leisure: true
};
let selectedPOI = null;

// Page navigation
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation active states
    updateNavigation(pageId);
    
    // Reset results if going to home
    if (pageId === 'home') {
        resetResults();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNavigation(currentPage) {
    // Desktop navigation
    const desktopNavItems = document.querySelectorAll('.nav-item');
    desktopNavItems.forEach(item => {
        const page = item.getAttribute('data-page');
        if (page === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Mobile navigation
    const mobileNavItems = document.querySelectorAll('.nav-item-mobile');
    mobileNavItems.forEach(item => {
        const page = item.getAttribute('data-page');
        if (page === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    mobileNav.classList.toggle('active');
}

// Search functionality
function setExampleCoordinates() {
    document.getElementById('latitude').value = '38.7223';
    document.getElementById('longitude').value = '-9.1393';
    document.getElementById('error-message').textContent = '';
}

function validateCoordinates(lat, lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    return !isNaN(latitude) && !isNaN(longitude) && 
           latitude >= -90 && latitude <= 90 && 
           longitude >= -180 && longitude <= 180;
}

async function handleSearch(event) {
    event.preventDefault();
    
    const latitude = document.getElementById('latitude').value.trim();
    const longitude = document.getElementById('longitude').value.trim();
    const errorElement = document.getElementById('error-message');
    
    // Clear previous errors
    errorElement.textContent = '';
    errorElement.style.display = 'none';
    
    // Validate coordinates
    if (!validateCoordinates(latitude, longitude)) {
        errorElement.textContent = 'Por favor, insira coordenadas válidas';
        errorElement.style.display = 'block';
        return;
    }
    
    // Show loading
    showLoading();
    
    try {
        // Simulate API calls
        const [locationData, pois] = await Promise.all([
            fetchLocationData({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) }),
            fetchPOIs({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) })
        ]);
        
        currentLocationData = locationData;
        currentPOIs = pois;
        
        // Display results
        displayResults(locationData, pois);
        
    } catch (error) {
        showError('Erro ao carregar dados da localização. Tente novamente.');
    }
}

function showLoading() {
    document.getElementById('loading-section').classList.remove('hidden');
    document.getElementById('results-section').classList.add('hidden');
    
    // Update search button
    const searchBtn = document.getElementById('searchBtn');
    searchBtn.disabled = true;
    searchBtn.innerHTML = `
        <div class="spinner" style="width: 1.25rem; height: 1.25rem; margin: 0;"></div>
        <span>Analisando...</span>
    `;
}

function hideLoading() {
    document.getElementById('loading-section').classList.add('hidden');
    
    // Reset search button
    const searchBtn = document.getElementById('searchBtn');
    searchBtn.disabled = false;
    searchBtn.innerHTML = `
        <span class="btn-icon">🔍</span>
        <span>Buscar Dados</span>
    `;
}

function showError(message) {
    hideLoading();
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Mock data service
async function fetchLocationData(coordinates) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
        address: `Rua Exemplo, ${Math.floor(coordinates.latitude * 100)}, Lisboa`,
        coordinates,
        demographics: {
            population: Math.floor(Math.random() * 50000) + 10000,
            averageIncome: Math.floor(Math.random() * 20000) + 25000,
            crimeRate: Math.floor(Math.random() * 5) + 1,
            educationLevel: 'Superior'
        },
        realEstate: {
            averagePrice: Math.floor(Math.random() * 200000) + 150000,
            pricePerSqm: Math.floor(Math.random() * 2000) + 2000,
            appreciation: Math.floor(Math.random() * 15) + 2,
            propertyTypes: {
                residential: 70,
                commercial: 20,
                mixed: 10
            }
        },
        infrastructure: {
            schools: Math.floor(Math.random() * 10) + 3,
            hospitals: Math.floor(Math.random() * 5) + 1,
            publicTransport: Math.floor(Math.random() * 8) + 2,
            shoppingCenters: Math.floor(Math.random() * 6) + 1
        },
        investment: {
            growthIndex: Math.floor(Math.random() * 30) + 70,
            opportunities: [
                'Crescimento demográfico previsto',
                'Novos projetos de infraestrutura',
                'Valorização histórica consistente'
            ],
            riskLevel: Math.random() > 0.6 ? 'low' : Math.random() > 0.3 ? 'medium' : 'high'
        }
    };
}

async function fetchPOIs(coordinates) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const categories = ['education', 'health', 'transport', 'shopping', 'leisure'];
    const names = {
        education: ['Escola Primária', 'Colégio São José', 'Universidade Nova'],
        health: ['Hospital Central', 'Clínica Médica', 'Centro de Saúde'],
        transport: ['Estação Metro', 'Paragem Autocarro', 'Terminal Rodoviário'],
        shopping: ['Centro Comercial', 'Supermercado', 'Mercado Local'],
        leisure: ['Parque Municipal', 'Cinema', 'Ginásio']
    };
    
    const pois = [];
    
    categories.forEach(category => {
        const count = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < count; i++) {
            pois.push({
                id: `${category}-${i}`,
                name: names[category][i % names[category].length] + ` ${i + 1}`,
                category,
                coordinates: {
                    latitude: coordinates.latitude + (Math.random() - 0.5) * 0.01,
                    longitude: coordinates.longitude + (Math.random() - 0.5) * 0.01
                },
                address: `Rua ${category} ${i + 1}, Lisboa`,
                description: `Descrição do ${names[category][i % names[category].length]}`
            });
        }
    });
    
    return pois;
}

// Display results
function displayResults(locationData, pois) {
    hideLoading();
    
    // Show results section
    document.getElementById('results-section').classList.remove('hidden');
    
    // Populate data report
    populateDataReport(locationData);
    
    // Setup interactive map
    setupInteractiveMap(locationData.coordinates, pois);
    
    // Scroll to results
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
}

function populateDataReport(data) {
    // Address
    document.getElementById('report-address').textContent = data.address;
    
    // Demographics
    document.getElementById('population').textContent = data.demographics.population.toLocaleString('pt-PT');
    document.getElementById('income').textContent = `€${data.demographics.averageIncome.toLocaleString('pt-PT')}`;
    document.getElementById('crime-rate').textContent = `${data.demographics.crimeRate}/10`;
    document.getElementById('education').textContent = data.demographics.educationLevel;
    
    // Real Estate
    document.getElementById('avg-price').textContent = `€${data.realEstate.averagePrice.toLocaleString('pt-PT')}`;
    document.getElementById('price-per-sqm').textContent = `€${data.realEstate.pricePerSqm.toLocaleString('pt-PT')}/m²`;
    document.getElementById('appreciation').textContent = `+${data.realEstate.appreciation}%`;
    
    // Investment
    document.getElementById('growth-index').textContent = `${data.investment.growthIndex}/100`;
    
    const riskElement = document.getElementById('risk-level');
    const riskText = {
        low: 'Baixo',
        medium: 'Médio',
        high: 'Alto'
    };
    riskElement.textContent = `🛡️ ${riskText[data.investment.riskLevel]}`;
    riskElement.className = `risk-badge ${data.investment.riskLevel}`;
    
    // Opportunities
    const opportunitiesList = document.getElementById('opportunities-list');
    opportunitiesList.innerHTML = '';
    data.investment.opportunities.forEach(opportunity => {
        const li = document.createElement('li');
        li.textContent = opportunity;
        opportunitiesList.appendChild(li);
    });
    
    // Charts
    createPropertyChart(data.realEstate.propertyTypes);
    createInfrastructureChart(data.infrastructure);
}

function createPropertyChart(propertyTypes) {
    const ctx = document.getElementById('propertyChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Residencial', 'Comercial', 'Misto'],
            datasets: [{
                data: [propertyTypes.residential, propertyTypes.commercial, propertyTypes.mixed],
                backgroundColor: ['#2563eb', '#10b981', '#f59e0b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createInfrastructureChart(infrastructure) {
    const ctx = document.getElementById('infrastructureChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Escolas', 'Hospitais', 'Transporte', 'Comércio'],
            datasets: [{
                data: [infrastructure.schools, infrastructure.hospitals, infrastructure.publicTransport, infrastructure.shoppingCenters],
                backgroundColor: '#2563eb'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Interactive Map
function setupInteractiveMap(center, pois) {
    setupMapFilters();
    renderMap(center, pois);
    renderPOIList(pois);
}

function setupMapFilters() {
    const filterButtons = document.getElementById('filterButtons');
    const categories = {
        education: { icon: '🎓', label: 'Educação', color: '#2563eb' },
        health: { icon: '🏥', label: 'Saúde', color: '#dc2626' },
        transport: { icon: '🚌', label: 'Transporte', color: '#059669' },
        shopping: { icon: '🛒', label: 'Comércio', color: '#7c3aed' },
        leisure: { icon: '☕', label: 'Lazer', color: '#ea580c' }
    };
    
    filterButtons.innerHTML = '';
    
    Object.entries(categories).forEach(([category, config]) => {
        const count = currentPOIs.filter(poi => poi.category === category).length;
        const button = document.createElement('button');
        button.className = `filter-btn ${currentFilters[category] ? 'active' : ''}`;
        button.onclick = () => toggleFilter(category);
        button.innerHTML = `
            <span>${config.icon}</span>
            <span>${config.label}</span>
            <span class="filter-count">${count}</span>
        `;
        filterButtons.appendChild(button);
    });
}

function toggleFilter(category) {
    currentFilters[category] = !currentFilters[category];
    setupMapFilters();
    renderMap(currentLocationData.coordinates, currentPOIs);
    renderPOIList(currentPOIs);
    selectedPOI = null;
    hidePOIInfo();
}

function renderMap(center, pois) {
    const mapElement = document.getElementById('map');
    
    // Clear existing markers
    const existingMarkers = mapElement.querySelectorAll('.poi-marker, .center-marker, .center-label');
    existingMarkers.forEach(marker => marker.remove());
    
    // Add center marker
    const centerMarker = document.createElement('div');
    centerMarker.className = 'center-marker';
    mapElement.appendChild(centerMarker);
    
    const centerLabel = document.createElement('div');
    centerLabel.className = 'center-label';
    centerLabel.textContent = 'Centro da Pesquisa';
    mapElement.appendChild(centerLabel);
    
    // Add POI markers
    const filteredPOIs = pois.filter(poi => currentFilters[poi.category]);
    
    filteredPOIs.forEach((poi, index) => {
        const marker = document.createElement('div');
        marker.className = `poi-marker ${poi.category}`;
        marker.onclick = () => selectPOI(poi);
        
        // Position marker (simulated positioning)
        const x = 20 + (index % 5) * 15;
        const y = 20 + Math.floor(index / 5) * 15;
        marker.style.left = `${x}%`;
        marker.style.top = `${y}%`;
        
        // Add icon based on category
        const icons = {
            education: '🎓',
            health: '🏥',
            transport: '🚌',
            shopping: '🛒',
            leisure: '☕'
        };
        marker.textContent = icons[poi.category];
        
        mapElement.appendChild(marker);
    });
}

function renderPOIList(pois) {
    const filteredPOIs = pois.filter(poi => currentFilters[poi.category]);
    const poiListContent = document.getElementById('poi-list-content');
    const poiCount = document.getElementById('poi-count');
    
    poiCount.textContent = filteredPOIs.length;
    poiListContent.innerHTML = '';
    
    const categories = {
        education: { icon: '🎓', label: 'Educação' },
        health: { icon: '🏥', label: 'Saúde' },
        transport: { icon: '🚌', label: 'Transporte' },
        shopping: { icon: '🛒', label: 'Comércio' },
        leisure: { icon: '☕', label: 'Lazer' }
    };
    
    filteredPOIs.forEach(poi => {
        const config = categories[poi.category];
        const poiItem = document.createElement('div');
        poiItem.className = `poi-item ${selectedPOI?.id === poi.id ? 'selected' : ''}`;
        poiItem.onclick = () => selectPOI(poi);
        
        poiItem.innerHTML = `
            <div class="poi-icon ${poi.category}">
                ${config.icon}
            </div>
            <div class="poi-details">
                <div class="poi-name">${poi.name}</div>
                <div class="poi-address">${poi.address}</div>
                <div class="poi-category-label">${config.label}</div>
            </div>
        `;
        
        poiListContent.appendChild(poiItem);
    });
}

function selectPOI(poi) {
    selectedPOI = poi;
    showPOIInfo(poi);
    renderPOIList(currentPOIs);
}

function showPOIInfo(poi) {
    const poiInfo = document.getElementById('poi-info');
    const categories = {
        education: { label: 'Educação', color: '#2563eb' },
        health: { label: 'Saúde', color: '#dc2626' },
        transport: { label: 'Transporte', color: '#059669' },
        shopping: { label: 'Comércio', color: '#7c3aed' },
        leisure: { label: 'Lazer', color: '#ea580c' }
    };
    
    const config = categories[poi.category];
    
    poiInfo.innerHTML = `
        <button class="close-btn" onclick="hidePOIInfo()">×</button>
        <h4>${poi.name}</h4>
        <p>${poi.address}</p>
        ${poi.description ? `<p>${poi.description}</p>` : ''}
        <div class="poi-category">
            <div class="category-dot" style="background-color: ${config.color}"></div>
            <span>${config.label}</span>
        </div>
    `;
    
    poiInfo.classList.remove('hidden');
}

function hidePOIInfo() {
    document.getElementById('poi-info').classList.add('hidden');
    selectedPOI = null;
    renderPOIList(currentPOIs);
}

// Action functions
async function generatePDF() {
    try {
        const element = document.getElementById('report-content');
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('relatorio-investimento.pdf');
    } catch (error) {
        alert('Erro ao gerar PDF. Tente novamente.');
    }
}

function saveSearch() {
    const searchData = {
        locationData: currentLocationData,
        pois: currentPOIs,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('geoinvest-search', JSON.stringify(searchData));
    alert('Pesquisa salva com sucesso!');
}

function shareResults() {
    if (navigator.share && currentLocationData) {
        navigator.share({
            title: 'Relatório GeoInvest',
            text: `Análise de investimento para ${currentLocationData.address}`,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copiado para a área de transferência!');
    }
}

function newSearch() {
    resetResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetResults() {
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('loading-section').classList.add('hidden');
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('latitude').value = '';
    document.getElementById('longitude').value = '';
    currentLocationData = null;
    currentPOIs = [];
    selectedPOI = null;
}

// Contact form
function handleContactSubmit(event) {
    event.preventDefault();
    
    // Show success message
    document.getElementById('contactForm').style.display = 'none';
    document.getElementById('contact-success').classList.remove('hidden');
    
    // Reset form after 3 seconds
    setTimeout(() => {
        document.getElementById('contact-success').classList.add('hidden');
        document.getElementById('contactForm').style.display = 'block';
        document.getElementById('contactForm').reset();
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set initial page
    showPage('home');
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const mobileNav = document.getElementById('mobileNav');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (!mobileNav.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
            mobileNav.classList.remove('active');
        }
    });
});