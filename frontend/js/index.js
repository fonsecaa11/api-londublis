// Mock Data
const mockPOIs = [
    {
        id: '1',
        name: 'Escola Básica Central',
        type: 'escola',
        lat: 38.7223,
        lng: -9.1393,
        address: 'Rua da Escola, 123',
        rating: 4.2
    },
    {
        id: '2',
        name: 'Estação Metro Marquês',
        type: 'transporte',
        lat: 38.7243,
        lng: -9.1373,
        address: 'Av. da República',
        rating: 4.0
    },
    {
        id: '3',
        name: 'ATM Millennium',
        type: 'atm',
        lat: 38.7213,
        lng: -9.1403,
        address: 'Rua Augusta, 45'
    },
    {
        id: '4',
        name: 'Centro de Saúde',
        type: 'saude',
        lat: 38.7233,
        lng: -9.1383,
        address: 'Praça da Saúde, 12',
        rating: 3.8
    },
    {
        id: '5',
        name: 'Shopping Center',
        type: 'comercio',
        lat: 38.7203,
        lng: -9.1413,
        address: 'Av. Comercial, 89',
        rating: 4.5
    },
    {
        id: '6',
        name: 'Parque Verde',
        type: 'lazer',
        lat: 38.7253,
        lng: -9.1363,
        address: 'Jardim Central',
        rating: 4.3
    }
];

const mockRegionData = {
    name: 'Lisboa Centro',
    population: 125000,
    density: 6847,
    schools: 15,
    transport: 8,
    healthcare: 5,
    commerce: 142,
    safety: 78,
    averageRent: 850,
    coordinates: {
        lat: 38.7223,
        lng: -9.1393
    }
};

// Global State
let currentTheme = localStorage.getItem('theme') || 'light';
let currentRegion = mockRegionData;
let currentPOIs = mockPOIs;
let selectedPOI = null;
let isLoading = false;

// DOM Elements
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchInfo = document.getElementById('searchInfo');
const loading = document.getElementById('loading');
const welcome = document.getElementById('welcome');
const results = document.getElementById('results');
const themeToggle = document.getElementById('themeToggle');
const generateReportBtn = document.getElementById('generateReport');
const poiCount = document.getElementById('poiCount');
const mapContainer = document.getElementById('mapContainer');
const poiList = document.getElementById('poiList');
const regionStats = document.getElementById('regionStats');
const selectedPoiElement = document.getElementById('selectedPoi');

// Icons
const icons = {
    escola: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>`,
    transporte: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 6v6h8V6"/>
        <path d="M4 15s1-1 4-1 5 0 8 0 4 1 4 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2z"/>
        <circle cx="7" cy="18" r="1"/>
        <circle cx="17" cy="18" r="1"/>
    </svg>`,
    atm: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect width="20" height="14" x="2" y="5" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>`,
    saude: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
    </svg>`,
    comercio: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>`,
    lazer: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v20"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>`,
    mapPin: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
    </svg>`,
    star: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>`,
    location: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
    </svg>`
};

// Type Labels
const typeLabels = {
    escola: 'Escolas',
    transporte: 'Transportes',
    atm: 'ATMs',
    saude: 'Saúde',
    comercio: 'Comércio',
    lazer: 'Lazer'
};

// Initialize App
function initApp() {
    applyTheme();
    setupEventListeners();
    updatePOICount();
}

// Theme Management
function applyTheme() {
    document.body.classList.toggle('dark', currentTheme === 'dark');
    updateThemeButton();
}

function updateThemeButton() {
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const themeText = themeToggle.querySelector('.theme-text');
    
    if (currentTheme === 'dark') {
        themeIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>`;
        themeText.textContent = 'Tema Claro';
    } else {
        themeIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>`;
        themeText.textContent = 'Tema Escuro';
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme();
}

// Event Listeners
function setupEventListeners() {
    searchForm.addEventListener('submit', handleSearch);
    themeToggle.addEventListener('click', toggleTheme);
    generateReportBtn.addEventListener('click', generateReport);
}

// Search Functionality
function handleSearch(e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    
    if (!query) return;
    
    setLoading(true);
    searchInfo.textContent = `Pesquisando: ${query}`;
    
    // Simulate API call
    setTimeout(() => {
        // Mock different regions based on search
        const newRegion = {
            ...mockRegionData,
            name: query.includes('Porto') ? 'Porto Centro' : 
                  query.includes('Coimbra') ? 'Coimbra Centro' : 
                  `Região de ${query}`
        };
        
        currentRegion = newRegion;
        currentPOIs = mockPOIs;
        selectedPOI = null;
        
        setLoading(false);
        showResults();
        renderMap();
        renderPOIList();
        renderRegionStats();
        updatePOICount();
    }, 1500);
}

// Loading State
function setLoading(loading) {
    isLoading = loading;
    
    if (loading) {
        searchButton.disabled = true;
        searchButton.innerHTML = `<div class="spinner"></div>`;
        welcome.style.display = 'none';
        results.style.display = 'none';
        document.getElementById('loading').style.display = 'flex';
    } else {
        searchButton.disabled = false;
        searchButton.innerHTML = `<svg class="search-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
        </svg>`;
        document.getElementById('loading').style.display = 'none';
    }
}

// Show Results
function showResults() {
    welcome.style.display = 'none';
    results.style.display = 'block';
}

// Update POI Count
function updatePOICount() {
    poiCount.textContent = `${currentPOIs.length} POIs encontrados`;
}

// Render Map
function renderMap() {
    mapContainer.innerHTML = `
        <!-- Map Grid -->
        <div class="map-grid">
            ${Array.from({ length: 400 }, (_, i) => '<div class="map-grid-cell"></div>').join('')}
        </div>
        
        <!-- Map Center -->
        <div class="map-center">
            <div class="map-center-pulse"></div>
            <div class="map-center-icon">${icons.mapPin}</div>
        </div>
        
        <!-- POI Markers -->
        ${currentPOIs.map(poi => `
            <div class="poi-marker poi-${poi.type}" 
                 style="left: ${50 + (poi.lng + 9.1393) * 2000}%; top: ${50 + (38.7223 - poi.lat) * 2000}%;"
                 onclick="selectPOI('${poi.id}')">
                <div class="poi-marker-icon">
                    ${icons[poi.type]}
                </div>
                <div class="poi-marker-tooltip">
                    <div class="poi-marker-tooltip-content">${poi.name}</div>
                </div>
            </div>
        `).join('')}
        
        <!-- Map Legend -->
        <div class="map-legend">
            <h4>Pontos de Interesse</h4>
            <div class="legend-grid">
                ${Object.entries(typeLabels).map(([type, label]) => `
                    <div class="legend-item">
                        <div class="legend-icon poi-${type}">${icons[type]}</div>
                        <span class="legend-text">${label}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Render POI List
function renderPOIList() {
    const groupedPOIs = currentPOIs.reduce((acc, poi) => {
        if (!acc[poi.type]) {
            acc[poi.type] = [];
        }
        acc[poi.type].push(poi);
        return acc;
    }, {});
    
    poiList.innerHTML = `
        <h3>Pontos de Interesse Próximos</h3>
        ${Object.entries(groupedPOIs).map(([type, pois]) => `
            <div class="poi-category">
                <div class="poi-category-header">
                    <div class="poi-category-icon ${type}">
                        ${icons[type]}
                    </div>
                    <h4 class="poi-category-title">${typeLabels[type]} (${pois.length})</h4>
                </div>
                <div class="poi-items">
                    ${pois.map(poi => `
                        <div class="poi-item" onclick="selectPOI('${poi.id}')">
                            <div class="poi-item-header">
                                <div class="poi-item-info">
                                    <h5>${poi.name}</h5>
                                    <div class="poi-item-address">
                                        ${icons.location}
                                        ${poi.address}
                                    </div>
                                </div>
                                ${poi.rating ? `
                                    <div class="poi-item-rating">
                                        ${icons.star}
                                        <span>${poi.rating}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    `;
}

// Render Region Stats
function renderRegionStats() {
    const stats = [
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>`,
            label: 'População',
            value: currentRegion.population.toLocaleString(),
            color: 'poi-escola'
        },
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
            </svg>`,
            label: 'Densidade/km²',
            value: currentRegion.density.toLocaleString(),
            color: 'poi-comercio'
        },
        {
            icon: icons.escola,
            label: 'Escolas',
            value: currentRegion.schools.toString(),
            color: 'poi-escola'
        },
        {
            icon: icons.transporte,
            label: 'Transportes',
            value: currentRegion.transport.toString(),
            color: 'poi-transporte'
        },
        {
            icon: icons.saude,
            label: 'Centros de Saúde',
            value: currentRegion.healthcare.toString(),
            color: 'poi-saude'
        },
        {
            icon: icons.comercio,
            label: 'Comércios',
            value: currentRegion.commerce.toString(),
            color: 'poi-comercio'
        },
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>`,
            label: 'Índice Segurança',
            value: `${currentRegion.safety}/100`,
            color: 'poi-lazer'
        },
        {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
            </svg>`,
            label: 'Renda Média',
            value: `€${currentRegion.averageRent}`,
            color: 'poi-atm'
        }
    ];
    
    regionStats.innerHTML = `
        <h3>Dados da Região: ${currentRegion.name}</h3>
        <div class="stats-grid">
            ${stats.map(stat => `
                <div class="stat-item">
                    <div class="stat-header">
                        <div class="stat-icon ${stat.color}">${stat.icon}</div>
                        <span class="stat-label">${stat.label}</span>
                    </div>
                    <div class="stat-value">${stat.value}</div>
                </div>
            `).join('')}
        </div>
        <div class="region-summary">
            <h4>Resumo da Localização</h4>
            <p>${currentRegion.name} é uma região com boa densidade populacional e infraestrutura desenvolvida. Com ${currentRegion.schools} escolas e ${currentRegion.transport} opções de transporte, oferece excelente qualidade de vida com índice de segurança de ${currentRegion.safety}/100.</p>
        </div>
    `;
}

// Select POI
function selectPOI(poiId) {
    selectedPOI = currentPOIs.find(poi => poi.id === poiId);
    
    if (selectedPOI) {
        selectedPoiElement.style.display = 'block';
        selectedPoiElement.innerHTML = `
            <h3>POI Selecionado</h3>
            <div class="selected-poi-content">
                <div class="selected-poi-info">
                    <h4>${selectedPOI.name}</h4>
                    <p>${selectedPOI.address}</p>
                    <p class="selected-poi-type">Tipo: ${selectedPOI.type}</p>
                </div>
                ${selectedPOI.rating ? `
                    <div class="selected-poi-rating">
                        <span>Avaliação:</span>
                        <div class="selected-poi-rating-value">
                            <span class="selected-poi-rating-number">${selectedPOI.rating}</span>
                            <span class="selected-poi-rating-total">/5</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Scroll to selected POI
        selectedPoiElement.scrollIntoView({ behavior: 'smooth' });
    }
}

// Generate Report
function generateReport() {
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        // Title
        pdf.setFontSize(20);
        pdf.text('Relatório de Localização', 20, 30);
        
        // Region info
        pdf.setFontSize(16);
        pdf.text(`Região: ${currentRegion.name}`, 20, 50);
        
        pdf.setFontSize(12);
        const info = [
            `População: ${currentRegion.population.toLocaleString()}`,
            `Densidade: ${currentRegion.density.toLocaleString()}/km²`,
            `Escolas: ${currentRegion.schools}`,
            `Transportes: ${currentRegion.transport}`,
            `Centros de Saúde: ${currentRegion.healthcare}`,
            `Comércios: ${currentRegion.commerce}`,
            `Índice de Segurança: ${currentRegion.safety}/100`,
            `Renda Média: €${currentRegion.averageRent}`
        ];
        
        info.forEach((item, index) => {
            pdf.text(item, 20, 70 + (index * 10));
        });
        
        // POIs
        pdf.setFontSize(16);
        pdf.text('Pontos de Interesse:', 20, 170);
        
        pdf.setFontSize(10);
        currentPOIs.forEach((poi, index) => {
            if (170 + (index * 6) + 20 < 280) {
                pdf.text(`• ${poi.name} - ${poi.address}`, 20, 180 + (index * 6));
            }
        });
        
        pdf.save(`relatorio-${currentRegion.name.toLowerCase().replace(' ', '-')}.pdf`);
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        alert('Erro ao gerar relatório. Tente novamente.');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);