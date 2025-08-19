// Variáveis DOM
const searchInput = document.getElementById('searchInput'); // Campo de entrada de pesquisa
const searchButton = document.getElementById('searchButton'); // Botão de pesquisa
const searchForm = document.getElementById('searchForm'); // Formulário de pesquisa
const suggestionsList = document.getElementById('suggestionsList'); // Lista de sugestões
const loading = document.getElementById('loading'); // Elemento de carregamento
const results = document.getElementById('results'); // Elemento de resultados
const welcome = document.getElementById('welcome'); // Elemento de boas-vindas
const poiCount = document.getElementById('poiCount'); // Elemento de contagem de POIs
const searchInfo = document.getElementById('searchInfo'); // Elemento de informações da pesquisa
const generateReportBtn = document.getElementById('generateReport'); // Botão de gerar relatório
const themeToggle = document.getElementById('themeToggle'); // Botão para alternar tema
const mapContainer = document.getElementById('mapContainer'); // Contêiner do mapa
const poiList = document.getElementById('poiList'); // Lista de POIs
const regionStats = document.getElementById('regionStats'); // Estatísticas da região
const selectedPoi = document.getElementById('selectedPoi'); // Detalhes do POI selecionado

// Declarando as variáveis globais
let currentPOIs = [];  // Variável global para armazenar POIs
let isLoading = false;  // Variável global para controle do estado de carregamento

// Definir a variável currentTheme (caso não exista) e obter o valor salvo do localStorage, se disponível
let currentTheme = localStorage.getItem('theme') || 'light'; // Se não houver nada salvo, 'light' será o tema padrãO

// Função para buscar sugestões de pesquisa
async function fetchSuggestions(query) {
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log("Sugestões recebidas:", data); // Log para verificar as sugestões recebidas
        
        if (response.ok) {
            return data.map(item => ({
                display_name: item.display_name,  // Nome do local
                lat: item.lat,                    // Latitude
                lon: item.lon,                    // Longitude
            }));
            
        } else {
            console.error('Erro ao buscar sugestões:', data);
        }
    } catch (error) {
        console.error('Erro na requisição da API:', error);
    }
}

// Função de pesquisa de POIs reais com base nas coordenadas
// Função de pesquisa de POIs reais com base nas coordenadas
async function searchRealPOIs(lat, lon) {
    console.log("Pesquisando POIs para as coordenadas:", lat, lon); // Log para verificar as coordenadas

    const url = `/api/pois`;  // URL da API no backend para buscar POIs com base nas coordenadas
    const body = JSON.stringify({
        lat: lat,  // Latitude
        lon: lon,  // Longitude
    });
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body,
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        console.log("POIs encontrados:", data); // Log para verificar os POIs encontrados
        
        if (response.ok) {
            currentPOIs = data;  // Atualiza a lista global de POIs com os dados reais

            // Agora, inicializa o mapa com as coordenadas lat e lon
            initMap(lat, lon);

            // Aqui, você pode adicionar lógica adicional para marcar os POIs no mapa, se necessário
            addPOIsToMap(currentPOIs);  // Função para adicionar POIs ao mapa
        } else {
            console.error('Erro ao buscar POIs:', data);
        }
    } catch (error) {
        console.error('Erro na requisição da API:', error);
    }
}

// Função para adicionar POIs ao mapa
function addPOIsToMap(POIs) {
    POIs.forEach(poi => {
        // Adicione um marcador para cada POI
        new maplibregl.Marker()
            .setLngLat([poi.lon, poi.lat])
            .addTo(map);  // 'map' deve ser o mapa já inicializado em algum lugar
    });
}

// Função para exibir as sugestões de pesquisa
function displaySuggestions(suggestions) {
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = '';  // Limpa a lista de sugestões antes de exibir as novas

    if (suggestions && suggestions.length > 0) {
        suggestionsList.style.display = 'block';  // Exibe a lista de sugestões

        // Cria um item de lista para cada sugestão
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion.display_name;
            li.addEventListener('click', () => handleSuggestionClick(suggestion));  // Ação ao clicar em uma sugestão
            suggestionsList.appendChild(li);
        });
    } else {
        suggestionsList.style.display = 'none';  // Oculta a lista se não houver sugestões
    }
}

// Função para lidar com o clique nas sugestões de pesquisa
function handleSuggestionClick(suggestion) {
    console.log('Sugestão selecionada:', suggestion);
    searchInput.value = suggestion.display_name;
    document.getElementById('suggestionsList').style.display = 'none';  // Oculta a lista após a seleção

    // Chama a função para buscar POIs com base nas coordenadas da sugestão
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    handleSearchByCoordinates(lat, lon);
}

// Função chamada durante a digitação do usuário
async function handleSearchInput(e) {
    const query = searchInput.value.trim();
    console.log("Input de pesquisa alterado:", query); // Log para verificar a entrada de pesquisa

    if (query) {
        const suggestions = await fetchSuggestions(query);
        displaySuggestions(suggestions);  // Exibe sugestões
    } else {
        document.getElementById('suggestionsList').style.display = 'none';  // Oculta se não houver texto
    }
}

// Função para realizar a pesquisa com as coordenadas ao invés do termo
async function handleSearchByCoordinates(lat, lon) {
    setLoading(true);
    searchInfo.textContent = `Pesquisando POIs para as coordenadas: ${lat}, ${lon}`;
    
    // Chama a função para pesquisar POIs com as coordenadas
    await searchRealPOIs(lat, lon);

    setLoading(false);
    showResults();
    renderPOIList();
    renderRegionStats(lat, lon);  // Atualiza as estatísticas da região com dados reais, se disponíveis
    updatePOICount();
}

// Event listener para capturar a digitação do usuário no campo de pesquisa
searchInput.addEventListener('input', handleSearchInput);

// Event listener para a submissão do formulário de pesquisa
searchForm.addEventListener('submit', handleSearch);

// Função para renderizar a lista de POIs
function renderPOIList() {
    console.log("Renderizando lista de POIs");

    if (!poiList) return;

    // Limpa a lista de POIs antes de adicionar os novos
    poiList.innerHTML = '';

    // Caminhos dos SVGs por categoria
    const categoryIcons = {
        'alojamento': 'img/alojamneto.svg',
        'alimentação e bebidas': 'img/alimentacao.svg',
        'ar livre e lazer': 'img/ar_livre.svg',
        'comércio e serviços': 'img/comercio.svg',
        'entertenimento e cultura': 'img/entretenimento.svg',
        'desporto': 'img/desporto.svg',
        'educação': '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M21 10L12 5L3 10L6 11.6667M21 10L18 11.6667M21 10V10C21.6129 10.3064 22 10.9328 22 11.618V16.9998M6 11.6667L12 15L18 11.6667M6 11.6667V17.6667L12 21L18 17.6667L18 11.6667" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'outros': '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M6 10.5C5.17157 10.5 4.5 11.1716 4.5 12C4.5 12.8284 5.17157 13.5 6 13.5C6.82843 13.5 7.5 12.8284 7.5 12C7.5 11.1716 6.82843 10.5 6 10.5Z" fill="currentColor"/><path d="M10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12Z" fill="currentColor"/><path d="M16.5 12C16.5 11.1716 17.1716 10.5 18 10.5C18.8284 10.5 19.5 11.1716 19.5 12C19.5 12.8284 18.8284 13.5 18 13.5C17.1716 13.5 16.5 12.8284 16.5 12Z" fill="currentColor"/></svg>',
        'instituições públicas': 'img/instituicao.svg',
        'saúde': 'img/hospital.svg',
        'transportes': '<svg width="20px" height="20px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M708.266 744.581h-377.18v40.96h377.18z"/><path d="M130.055 747.52H71.779c-16.906 0-30.822-13.907-30.822-30.792V204.871c0-16.885 13.917-30.792 30.822-30.792h880.435c16.912 0 30.822 13.903 30.822 30.792v511.857c0 16.889-13.91 30.792-30.822 30.792h-35.553v40.96h35.553c39.528 0 71.782-32.236 71.782-71.752V204.871c0-39.516-32.254-71.752-71.782-71.752H71.779c-39.521 0-71.782 32.239-71.782 71.752v511.857c0 39.513 32.261 71.752 71.782 71.752h58.276v-40.96z"/><path d="M314.805 766.646c0-44.737-36.27-81.009-81.009-81.009-44.73 0-80.998 36.273-80.998 81.009s36.268 81.009 80.998 81.009c44.739 0 81.009-36.272 81.009-81.009zm40.96 0c0 67.358-54.607 121.969-121.969 121.969-67.353 0-121.958-54.613-121.958-121.969s54.605-121.969 121.958-121.969c67.361 0 121.969 54.611 121.969 121.969zm535.331 0c0-44.737-36.27-81.009-81.009-81.009-44.73 0-80.998 36.273-80.998 81.009s36.268 81.009 80.998 81.009c44.739 0 81.009-36.272 81.009-81.009zm40.96 0c0 67.358-54.607 121.969-121.969 121.969-67.353 0-121.958-54.613-121.958-121.969s54.605-121.969 121.958-121.969c67.361 0 121.969 54.611 121.969 121.969zm62.931-292.402H759.805a10.238 10.238 0 01-10.24-10.24V163.839h-40.96v300.165c0 28.278 22.922 51.2 51.2 51.2h235.182v-40.96zm-378.283.171c5.657 0 10.24-4.583 10.24-10.24V266.543c0-5.657-4.583-10.24-10.24-10.24H133.622a10.238 10.238 0 00-10.24 10.24v197.632c0 5.657 4.583 10.24 10.24 10.24h483.082zm0 40.96H133.622c-28.278 0-51.2-22.922-51.2-51.2V266.543c0-28.278 22.922-51.2 51.2-51.2h483.082c28.278 0 51.2 22.922 51.2 51.2v197.632c0 28.278-22.922 51.2-51.2 51.2z"/><path d="M354.685 248.111v239.892h40.96V248.111z"/></svg>'
    };

    const categoryStyles = {
        'alojamento': { background: '#f7e2a0', color: '#f59e0b' },
        'alimentação e bebidas': { background: '#fdd64f', color: '#d97706' },
        'entertenimento e cultura': { background: '#e0b4f1', color: '#7c3aed' },
        'instituições públicas': { background: '#b7f1d6', color: '#047857' },
        'outros': { background: '#e1e3e8', color: '#6b7280' },
        'educação': { background: '#c4d9f8', color: '#1d4ed8' },
        'transportes': { background: '#b7f1d6', color: '#047857' },
        'desporto': { background: '#f7c59e', color: '#c2410c' },
        'saúde': { background: '#f7b4b4', color: '#dc2626' },
        'comércio e serviços': { background: '#e0b4f1', color: '#7c3aed' },
        'ar livre e lazer': { background: '#91f0d3', color: '#047857' },
    };

    const darkCategoryStyles = {
        'alojamento': { background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' },
        'alimentação e bebidas': { background: 'rgba(253, 122, 6, 0.2)', color: '#fdba74' },
        'entertenimento e cultura': { background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd' },
        'instituições públicas': { background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7' },
        'outros': { background: 'rgba(107, 114, 128, 0.2)', color: '#9ca3af' },
        'educação': { background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' },
        'transportes': { background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7' },
        'desporto': { background: 'rgba(249, 115, 22, 0.2)', color: '#fdba74' },
        'saúde': { background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' },
        'comércio e serviços': { background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd' },
        'ar livre e lazer': { background: 'rgba(5, 150, 105, 0.2)', color: '#6ee7b7' },
    };

    const isDarkMode = document.body.classList.contains('dark');  // Verifica se está no modo escuro

    if (currentPOIs && currentPOIs.length > 0) {
        // Agrupar os POIs por categoria
        const groupedPOIs = currentPOIs.reduce((groups, poi) => {
            const category = poi.descr_categoria || 'Sem categoria'; // Categoria padrão
            const categoryClass = category.replace(/\s+/g, '_').toLowerCase(); // Substituir espaços por underscores
            if (!groups[categoryClass]) {
                groups[categoryClass] = [];
            }
            groups[categoryClass].push(poi);
            return groups;
        }, {});

        // Iterar sobre as categorias e seus respectivos POIs
        Object.keys(groupedPOIs).forEach(categoryClass => {
            const category = categoryClass.replace(/_/g, ' '); // Reverter para nome original
            const categoryHeader = document.createElement('div');
            categoryHeader.classList.add('poi-category-header');

            // Ícone da categoria (com a tag <svg>)
            const categoryIcon = document.createElement('div');
            categoryIcon.classList.add('poi-category-icon', categoryClass);

            // Insere o SVG diretamente no HTML
            categoryIcon.innerHTML = categoryIcons[category];

            // Determinar os estilos com base no modo
            const style = isDarkMode ? darkCategoryStyles[category] : categoryStyles[category];
            categoryIcon.style.backgroundColor = style ? style.background : '#ffffff';
            categoryIcon.style.color = style ? style.color : '#000000';

            // Título da categoria
            const categoryTitle = document.createElement('h4');
            categoryTitle.classList.add('poi-category-title');
            categoryTitle.innerText = category;

            // Toggle para expandir/colapsar
            const toggleButton = document.createElement('button');
            toggleButton.classList.add('poi-category-toggle');
            toggleButton.innerHTML = `<img src="./img/chevron-bottom.svg" alt="Expandir" height="20" width="20">`;

            toggleButton.style.backgroundColor = 'transparent';
            toggleButton.style.marginBottom = '-5px';
            toggleButton.style.border = 'none';
            toggleButton.style.cursor = 'pointer';

            categoryHeader.appendChild(categoryIcon);
            categoryHeader.appendChild(categoryTitle);
            categoryHeader.appendChild(toggleButton);

            // Criar lista de POIs (inicialmente escondida)
            const ul = document.createElement('ul');
            ul.classList.add('poi-items');
            ul.style.display = 'none';

            groupedPOIs[categoryClass].forEach(poi => {
                const li = document.createElement('li');
                li.classList.add('poi-item');
                li.innerHTML = `
                    <div class="poi-item-header">
                        <div class="poi-item-info">
                            <h5>${poi.descr_poi}</h5>
                            <div class="poi-item-address">${poi.distancia_pedonal_m || 'N/A'} m</div>
                        </div>
                    </div>
                `;
                ul.appendChild(li);
            });

            // Evento de clique para expandir/colapsar a lista
            toggleButton.addEventListener('click', () => {
                const isCollapsed = ul.style.display === 'none';

                if (isCollapsed) {
                    ul.style.display = 'block'; // Exibe a lista
                    toggleButton.innerHTML = `<img src="./img/chevron-top.svg" alt="Fechar" height="20" width="20">`; // Ícone de fechar (triângulo para cima)
                } else {
                    ul.style.display = 'none'; // Esconde a lista
                    toggleButton.innerHTML = `<img src="./img/chevron-bottom.svg" alt="Expandir" height="20" width="20">`; // Ícone de expandir (triângulo para baixo)
                }
            });

            // Adiciona a categoria e a lista ao DOM
            const poiCategory = document.createElement('div');
            poiCategory.classList.add('poi-category');
            poiCategory.appendChild(categoryHeader);
            poiCategory.appendChild(ul);

            poiList.appendChild(poiCategory);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'Nenhum POI encontrado para essas coordenadas';
        poiList.appendChild(li);
    }
}

// Função para renderizar as estatísticas da região
async function renderRegionStats(lat, lon) {
    console.log("Renderizando as estatísticas da região");

    try {
        const freguesiaResponse = await fetch(`/api/freguesia?lat=${lat}&lon=${lon}`);
        if (!freguesiaResponse.ok) {
            throw new Error('Erro ao carregar as estatísticas');
        }
        const freguesiaData = await freguesiaResponse.json();
        console.log(freguesiaData);
        window.freguesiaDetalhes = freguesiaData;

        const freguesiaDiv = document.getElementById("regionStats");

        if (freguesiaData) {
            freguesiaDiv.innerHTML = `
                <div class="region-title">
                    <h2>Dados do Concelho: ${freguesiaData.descr_concelho}</h2>  <!-- nome da região -->
                </div>

                <!-- Informação Detalhada -->
                <div class="grid-title">
                    <h3>Estatísticas da Freguesia</h3>
                </div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">📊</span>
                            <span class="stat-label">Taxa de Envelhecimento</span>
                        </div>
                        <div class="stat-value">${freguesiaData.taxa_envelhecimento}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">📉</span>
                            <span class="stat-label">Taxa de Desemprego</span>
                        </div>
                        <div class="stat-value">${freguesiaData.taxa_desemprego}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">💶</span>
                            <span class="stat-label">Renda Média</span>
                        </div>
                        <div class="stat-value">${freguesiaData.valor_renda_absoluto}€</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">📚</span>
                            <span class="stat-label">Ensino Superior</span>
                        </div>
                        <div class="stat-value">${freguesiaData.taxa_ensino_superior}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">⚖️</span>
                            <span class="stat-label">Taxa de Criminalidade</span>
                        </div>
                        <div class="stat-value">${freguesiaData.taxa_criminalidade}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">💀</span>
                            <span class="stat-label">Taxa de Mortalidade</span>
                        </div>
                        <div class="stat-value">${freguesiaData.taxa_mortalidade}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">💰</span>
                            <span class="stat-label">Renda Percentual</span>
                        </div>
                        <div class="stat-value">${freguesiaData.valor_renda_percentual}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">👩‍⚕️</span>
                            <span class="stat-label">Enfermeiros por 1000 hab.</span>
                        </div>
                        <div class="stat-value">${freguesiaData.enfermeiros_por_1000}</div>
                    </div>
                </div>

                <!-- Informação Atividade Económica -->
                <div class="grid-title">
                    <h3>Informação Atividade Económica</h3>
                </div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">🏢</span>
                            <span class="stat-label">Constituições de Empresas (2023)</span>
                        </div>
                        <div class="stat-value">${freguesiaData.constituicao_2023}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">❌</span>
                            <span class="stat-label">Dissoluções de Empresas (2023)</span>
                        </div>
                        <div class="stat-value">${freguesiaData.dissolucao_2023}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">🏛️</span>
                            <span class="stat-label">Constituições de Empresas (2021)</span>
                        </div>
                        <div class="stat-value">${freguesiaData.constituicao_2021}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">⚖️</span>
                            <span class="stat-label">Dissoluções de Empresas (2021)</span>
                        </div>
                        <div class="stat-value">${freguesiaData.dissolucao_2021}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">📊</span>
                            <span class="stat-label">Taxa de Constituição</span>
                        </div>
                        <div class="stat-value">${freguesiaData.taxa_constituicao}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">📈</span>
                            <span class="stat-label">Total de Constituição</span>
                        </div>
                        <div class="stat-value">${freguesiaData.constituicao_total}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">📉</span>
                            <span class="stat-label">Total de Dissoluções</span>
                        </div>
                        <div class="stat-value">${freguesiaData.dissolucao_total}</div>
                    </div>
                </div>

                <!-- Informação Escolar -->
                <div class="grid-title">
                    <h3>Informação Escolar</h3>
                </div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">👨‍🎓</span>
                            <span class="stat-label">Número Total de Alunos</span>
                        </div>
                        <div class="stat-value">${freguesiaData.numero_total}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">❌</span>
                            <span class="stat-label">Número de Alunos Não Aprovados</span>
                        </div>
                        <div class="stat-value">${freguesiaData.numero_nao_transicao}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">📉</span>
                            <span class="stat-label">Taxa de Não Transição</span>
                        </div>
                        <div class="stat-value">${freguesiaData.taxa_nao_transicao}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">✔️</span>
                            <span class="stat-label">Número de Alunos Aprovados</span>
                        </div>
                        <div class="stat-value">${freguesiaData.numero_transicao}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-header">
                            <span class="stat-icon">📈</span>
                            <span class="stat-label">Taxa de Transição</span>
                        </div>
                        <div class="stat-value">${freguesiaData.taxa_transicao}%</div>
                    </div>
                </div>

                <!-- Resumo da IA -->
                <div id="locationSummary" class="region-summary">
                    <h4>Resumo da Localização</h4>
                    <p>A gerar resumo...</p>
                </div>
            `;

            // Chama a IA depois de renderizar as estatísticas
            console.log("[renderRegionStats] Chamando IA para gerar resumo...");
            await generateLocationSummary(lat, lon);
            console.log("[renderRegionStats] IA chamada com sucesso.");
        } else {
            freguesiaDiv.innerHTML = 'Não foi possível obter dados da freguesia para essas coordenadas.';
        }

    } catch (error) {
        console.error('Erro ao carregar as estatísticas:', error);
        document.getElementById('regionStats').innerHTML = 'Erro ao carregar estatísticas da região. Tente novamente.';
    }
}

async function generateLocationSummary(lat, lon) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    try {
        console.log("[generateLocationSummary] Chamando a API para gerar o resumo da localização...");
        console.log('[generateLocationSummary] Enviando dados para IA:', { lat: latNum, lon: lonNum });

        // Alteração para enviar os parâmetros como query string
        const response = await fetch(`/api/ia-resume?lat=${latNum}&lon=${lonNum}`, {
            method: 'GET',  // Usando GET, pois estamos a passar os dados na URL
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const responseText = await response.text();
            console.error('Erro na requisição:', response.status, responseText);
            throw new Error(`Erro ao gerar resumo da IA: ${response.status}`);
        }

        const data = await response.json();
        console.log("Resposta da IA:", data);

        if (data && data.resumo) {
            displayLocationSummary(data.resumo);
        } else {
            console.warn("[generateLocationSummary] Resumo não encontrado na resposta.");
            displayLocationSummary('Erro ao gerar resumo, sem conteúdo.');
        }

    } catch (error) {
        console.error("[generateLocationSummary] Erro ao chamar a API IA:", error);
        displayLocationSummary('Erro ao gerar o resumo. Tente novamente mais tarde.');
    }
}

// Atualiza o display do resumo dentro do bloco
function displayLocationSummary(summary) {
    console.log("[displayLocationSummary] Atualizando o HTML com o resumo:", summary);
    const summaryElement = document.getElementById('locationSummary');
    if (summaryElement) {
        summaryElement.innerHTML = `<h4>Resumo da Localização</h4><p>${summary}</p>`;
    } else {
        console.warn("[displayLocationSummary] Elemento #locationSummary não encontrado no DOM.");
    }
}

// Função de pesquisa ao submeter o formulário
async function handleSearch(event) {
    event.preventDefault();  // Previne o comportamento padrão de submissão do formulário (recarregar a página)
    
    const query = searchInput.value.trim();
    if (query) {
        const suggestions = await fetchSuggestions(query);
        displaySuggestions(suggestions);
    }
}

// Função para exibir ou ocultar o estado de carregamento
function setLoading(loadingState) {
    console.log("Estado de carregamento:", loadingState); // Log para verificar o estado de carregamento

    isLoading = loadingState;

    if (loadingState) {
        if (searchButton) searchButton.disabled = true;
        if (searchButton) searchButton.innerHTML = `<div class="spinner"></div>`;
        if (welcome) welcome.style.display = 'none';
        if (results) results.style.display = 'none';
        if (loading) loading.style.display = 'flex';  // Exibe o carregamento
    } else {
        if (searchButton) searchButton.disabled = false;
        if (searchButton) searchButton.innerHTML = `<svg class="search-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
        </svg>`;
        if (loading) loading.style.display = 'none';  // Oculta o carregamento
    }
}

// Função para exibir os resultados da pesquisa
function showResults() {
    console.log("Exibindo resultados"); // Log para confirmar que a exibição de resultados foi chamada
    if (welcome) welcome.style.display = 'none';
    if (results) results.style.display = 'block';
}

// Função para atualizar a contagem de POIs
function updatePOICount() {
    console.log("Contagem de POIs atualizada:", currentPOIs.length); // Log para verificar a contagem de POIs
    if (poiCount) poiCount.textContent = `${currentPOIs.length} POIs encontrados`;
}

// Inicializar o aplicativo
function initApp() {
    console.log("Inicializando o aplicativo..."); // Log para confirmar a inicialização do app
    
    applyTheme();
    setupEventListeners();
    updatePOICount();
}

// Funções para aplicar o tema
function applyTheme() {
    console.log("Aplicando tema:", currentTheme); // Log para verificar qual tema está sendo aplicado
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
    console.log("Trocando para o tema:", currentTheme === 'light' ? 'dark' : 'light'); // Log para verificar a troca de tema
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme();
}

function setupEventListeners() {
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
}

// Inicializar app
document.addEventListener('DOMContentLoaded', initApp);
