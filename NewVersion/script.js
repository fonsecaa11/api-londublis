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

// Função para verificar o login
function checkLoginStatus() {
    const userId = localStorage.getItem('userId'); // Obtém o ID do usuário do localStorage

    if (userId) {
        // Se o userId estiver presente, o usuário está logado
        console.log(`Usuário logado. ID: ${userId}`);
    } else {
        // Se o userId não estiver presente, o usuário não está logado
        console.log("Usuário não está logado.");
    }
}

function updateHeader() {
      const userId = localStorage.getItem("userId");
      const loginNav = document.getElementById("login-nav");
      const userNav = document.getElementById("user-nav");

      if (loginNav && userNav) {  // Verifica se os elementos existem
        if (userId) {
          console.log("Utilizador loooogado:", userId);
          loginNav.style.display = "none";
          userNav.style.display = "inline-flex";
        } else {
          console.log("Utilizador não logado.");
          loginNav.style.display = "inline-flex";
          userNav.style.display = "none";
        }
      } else {
        console.error("Elementos não encontrados no DOM.");
      }
}




// Função para buscar sugestões de pesquisa
async function fetchSuggestions(query) {
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=4&countrycodes=PT`;

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
        const marker = new maplibregl.Marker()
            .setLngLat([poi.lon, poi.lat])
            .addTo(map);

        // Adiciona um evento de clique ao marcador
        marker.getElement().addEventListener('click', () => {
            // Chama a função selectPOI passando o id do POI
            selectPOI(poi.id_poi); // Usando id_poi
        });
    });
}

// Função para selecionar e exibir os detalhes do POI
function selectPOI(poiId) {
    // Log para verificar se o id está sendo passado corretamente
    console.log('POI ID selecionado:', poiId);

    // Encontra o POI selecionado com base no id
    const selectedPOI = currentPOIs.find(poi => poi.id_poi === poiId); // Usando id_poi

    // Verifica se o POI foi encontrado
    console.log('POI encontrado:', selectedPOI);

    if (selectedPOI) {
        // Exibe o painel de detalhes
        const selectedPoiElement = document.getElementById('selectedPoi');
        console.log('Elemento do POI selecionado:', selectedPoiElement);

        selectedPoiElement.style.display = 'block';

        // Preenche o conteúdo com os detalhes do POI
        selectedPoiElement.innerHTML = `
            <h3>POI Selecionado</h3>
            <div class="selected-poi-content">
                <div class="selected-poi-info">
                    <h4>${selectedPOI.descr_entidade || 'Nome desconhecido'}</h4>
                    <p>${selectedPOI.descr_poi || 'Endereço desconhecido'}</p>
                    <p class="selected-poi-type">Tipo: ${selectedPOI.descr_categoria || 'Categoria desconhecida'}</p>
                </div>
                ${selectedPOI.distancia_pedonal_m ? `
                    <div class="selected-poi-rating">
                        <span>Distância pedonal:</span>
                        <div class="selected-poi-rating-value">
                            <span class="selected-poi-rating-number">${selectedPOI.distancia_pedonal_m}m</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Rola para o painel de detalhes
        selectedPoiElement.scrollIntoView({ behavior: 'smooth' });
    } else {
        console.log('POI não encontrado!');
    }
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
        'alojamento': '<svg  xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%" viewBox="0 0 14 14" id="svg2"><metadata   id="metadata8">  <rdf:RDF>    <cc:Work       rdf:about="">      <dc:format>image/svg+xml</dc:format>      <dc:type         rdf:resource="http://purl.org/dc/dcmitype/StillImage" />      <dc:title></dc:title>    </cc:Work>  </rdf:RDF></metadata><defs   id="defs6" /><rect   width="14"   height="14"   x="0"   y="0"   id="canvas"   style="fill:none;stroke:none;visibility:hidden" /><path   d="M 0.625,3 C 0.25,3 0,3.25 0,3.75 l 0,7.25 1.25,0 0,-1.75 c 0,0 10.380697,0.01892 11.5,0 L 12.75,11 14,11 14,8.625 14,4.75 C 14,4.4202582 13.86199,4 13.375,4 12.88801,4 12.75,4.4202582 12.75,4.75 l 0,3.25 -11.5,0 0,-4.25 C 1.25,3.25 1,3 0.625,3 z M 3.5,4 C 2.671573,4 2,4.671573 2,5.5 2,6.328427 2.671573,7 3.5,7 4.328427,7 5,6.328427 5,5.5 5,4.671573 4.328427,4 3.5,4 z m 2,1 0,2 6.5,0 C 12,6 10.963825,5 10,5 z"   id="hotel"   style="fill=currentColor" /></svg>',
        'alimentação e bebidas': '<svg version="1.1" id="designs" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  width="20px" height="20px" viewBox="0 0 32 32" xml:space="preserve" fill="currentColor"> <style type="text/css"> .sketchy_een{fill=currentColor;} </style> <path class="sketchy_een" d="M17.855,3.83c-0.012-0.106-0.043-0.21-0.098-0.308c-0.111-0.199-0.266-0.39-0.407-0.57 c-0.096-0.118-0.195-0.248-0.312-0.348c-0.166-0.139-0.354-0.264-0.571-0.308c-0.153-0.029-0.304-0.04-0.459-0.046 c-0.047-0.002-0.093-0.003-0.139-0.003c-0.086,0-0.172,0.003-0.258,0.007c-0.094,0.002-0.187,0.006-0.281,0.004 c-0.319-0.002-0.638,0.023-0.957,0.036c-0.342,0.013-0.686,0.031-1.03,0.04c-0.371,0.01-0.742,0.023-1.112,0.033 c-0.348,0.008-0.696,0.04-1.043,0.05c-0.606,0.017-1.214,0.013-1.819,0.017c-0.625,0.004-1.25,0.052-1.875,0.092 C7.197,2.545,6.9,2.557,6.604,2.578C6.218,2.605,5.8,2.633,5.461,2.842c-0.22,0.134-0.382,0.319-0.516,0.537 C4.756,3.684,4.722,4.042,4.752,4.391C4.754,4.403,4.758,4.413,4.76,4.425C4.744,4.486,4.721,4.546,4.722,4.612 c0.008,0.791,0.08,1.579,0.122,2.368c0.038,0.736,0.042,1.472,0.071,2.205c0.057,1.512-0.084,3.05,0.323,4.526 c0.153,0.558,0.346,1.11,0.625,1.622c0.243,0.445,0.577,0.789,1.001,1.063c0.392,0.252,0.816,0.342,1.275,0.384 c0.206,0.017,0.415,0.036,0.623,0.05c0.055,0.003,0.112,0.002,0.168,0.004c-0.042,0.75-0.074,1.5-0.097,2.253 c-0.025,0.828-0.082,1.653-0.097,2.482c-0.025,1.542-0.073,3.092-0.021,4.636c0.015,0.466,0.054,0.931,0.136,1.391 c0.032,0.174,0.078,0.34,0.143,0.506c0.086,0.224,0.18,0.453,0.302,0.659c0.214,0.365,0.506,0.692,0.868,0.914 c0.344,0.21,0.768,0.289,1.162,0.317c0.336,0.023,0.686-0.008,1.011-0.097c0.117-0.031,0.22-0.075,0.331-0.124 c0.157-0.069,0.289-0.189,0.415-0.304c0.166-0.155,0.306-0.365,0.415-0.566c0.193-0.357,0.285-0.784,0.363-1.177 c0.08-0.403,0.132-0.822,0.151-1.233c0.017-0.378,0.031-0.757,0.032-1.137c0.002-0.376-0.027-0.755-0.046-1.131 c-0.036-0.764-0.096-1.527-0.141-2.291c-0.048-0.784-0.111-1.565-0.17-2.349c-0.025-0.336-0.038-0.675-0.071-1.011 c-0.032-0.355-0.076-0.709-0.113-1.064c-0.015-0.14-0.036-0.279-0.055-0.418c0.29-0.01,0.579-0.017,0.868-0.053 c0.269-0.032,0.537-0.054,0.793-0.145c0.254-0.088,0.512-0.172,0.742-0.317c0.38-0.239,0.738-0.527,1.07-0.827 c0.401-0.363,0.625-0.852,0.81-1.351c0.227-0.621,0.333-1.303,0.333-1.963c0.002-0.726,0-1.456-0.015-2.182 c-0.015-0.665,0.011-1.332,0.029-1.997c0.019-0.757-0.004-1.514,0-2.27c0.004-0.518,0.067-1.034,0.071-1.554 C18.149,4.187,18.03,3.976,17.855,3.83z M16.539,12.156c-0.002,0.267,0.007,0.536-0.02,0.803c-0.052,0.345-0.132,0.698-0.26,1.022 c-0.066,0.149-0.135,0.302-0.222,0.439c-0.121,0.137-0.26,0.257-0.402,0.371c-0.198,0.142-0.413,0.271-0.633,0.378 c-0.192,0.069-0.398,0.123-0.597,0.157c-0.271,0.033-0.54,0.065-0.81,0.1c0.023-0.003,0.047-0.007,0.07-0.01 c-0.203,0.027-0.394,0.019-0.596,0.004c-0.285-0.024-0.529,0.147-0.683,0.377c-0.003,0.001-0.005,0-0.008,0.001 c-0.004,0-0.008,0.002-0.013,0.004c-0.327,0.09-0.562,0.396-0.562,0.738c0,0.103,0.022,0.203,0.061,0.294 c0.06,0.534,0.095,1.071,0.149,1.605c0.034,0.338,0.042,0.678,0.063,1.017c0.025,0.39,0.067,0.78,0.092,1.17 c0.053,0.78,0.103,1.56,0.172,2.337c0.067,0.755,0.13,1.51,0.161,2.265c0.023,0.583,0.011,1.179-0.054,1.757 c-0.057,0.357-0.133,0.705-0.255,1.045c-0.036,0.074-0.077,0.145-0.122,0.214c-0.035,0.04-0.071,0.079-0.11,0.116 c-0.071,0.021-0.143,0.037-0.215,0.05c-0.161,0.013-0.321,0.012-0.482-0.001c-0.085-0.016-0.168-0.038-0.249-0.065 c-0.035-0.018-0.069-0.037-0.103-0.058c-0.069-0.063-0.133-0.13-0.193-0.201c-0.09-0.132-0.166-0.27-0.233-0.415 c-0.043-0.108-0.082-0.218-0.108-0.331c-0.023-0.098-0.04-0.198-0.055-0.299c-0.09-0.725-0.058-1.463-0.054-2.191 c0.004-0.774,0.015-1.548,0.029-2.322c0.029-1.651,0.078-3.302,0.212-4.95c0.029-0.367,0.059-0.732,0.086-1.099 c0.021-0.284-0.152-0.526-0.384-0.676c-0.004-0.018,0.001-0.036-0.004-0.054c-0.057-0.208-0.197-0.39-0.384-0.499 c-0.183-0.107-0.373-0.127-0.572-0.097c-0.189,0.009-0.386-0.016-0.573-0.035c-0.191-0.02-0.382-0.031-0.573-0.05 c-0.101-0.017-0.202-0.039-0.299-0.07c-0.093-0.05-0.184-0.108-0.272-0.169c-0.077-0.069-0.148-0.145-0.216-0.224 c-0.146-0.208-0.275-0.432-0.383-0.662c-0.195-0.503-0.322-1.039-0.405-1.572c-0.063-0.579-0.048-1.166-0.048-1.746 C6.48,9.965,6.461,9.308,6.445,8.648c-0.015-0.65-0.019-1.3-0.078-1.947C6.302,6.005,6.302,5.31,6.308,4.612 c0-0.02-0.01-0.037-0.012-0.057C6.308,4.5,6.332,4.445,6.327,4.391C6.319,4.31,6.309,4.228,6.306,4.146 C6.423,4.113,6.544,4.09,6.664,4.071c0.312-0.035,0.628-0.055,0.942-0.082c0.012,0.641,0.05,1.28,0.099,1.92 C7.726,6.204,7.732,6.496,7.753,6.79c0.023,0.304,0.054,0.606,0.071,0.912C7.856,8.27,7.86,8.841,7.856,9.41 c-0.003,0.551-0.004,1.1-0.023,1.651c-0.018,0.038-0.034,0.078-0.046,0.12C7.76,11.281,7.76,11.379,7.758,11.48 c-0.004,0.413,0.35,0.757,0.759,0.757c0.407,0,0.764-0.344,0.757-0.757c0-0.032,0-0.065,0-0.097 c-0.001-0.108-0.024-0.205-0.063-0.293c-0.002-0.543,0.026-1.086,0.023-1.629C9.23,8.889,9.23,8.317,9.201,7.746 C9.173,7.142,9.119,6.542,9.104,5.938C9.088,5.254,9.08,4.571,9.083,3.887c0.402-0.015,0.805-0.026,1.206-0.025 c0.068,0,0.137-0.001,0.205-0.001c0.012,0.627,0.036,1.254,0.049,1.88c0.013,0.677,0.021,1.353,0.029,2.028 c0.004,0.336,0.006,0.671,0.006,1.005c0,0.329-0.021,0.657-0.011,0.986c0.008,0.333,0.032,0.665,0.05,0.998 c0.013,0.281,0.01,0.56,0.011,0.841c0,0.394,0.327,0.722,0.722,0.722c0.369,0,0.753-0.329,0.722-0.722 c-0.021-0.264-0.025-0.529-0.031-0.795c-0.006-0.329-0.027-0.657-0.031-0.986c-0.002-0.34,0.015-0.682,0.021-1.022 c0.008-0.342,0.006-0.684,0.006-1.026c0-0.669-0.023-1.34-0.013-2.01c0.01-0.644,0.038-1.288,0.051-1.932 c0.288-0.005,0.575-0.009,0.864-0.012c0.109-0.002,0.217-0.002,0.326-0.003c0.009,0.719,0.041,1.435,0.088,2.153 c0.048,0.728,0.109,1.458,0.141,2.188c0.031,0.692,0.036,1.386,0.078,2.077c0.031,0.512,0.004,1.036,0.086,1.544 c0.029,0.18,0.191,0.355,0.342,0.445c0.172,0.099,0.382,0.128,0.575,0.075c0.185-0.052,0.348-0.176,0.445-0.342 c0.088-0.151,0.105-0.298,0.09-0.457c0.003,0.022,0.006,0.045,0.009,0.067c-0.012-0.111-0.026-0.22-0.041-0.33 c-0.022-0.188-0.026-0.377-0.037-0.566c-0.015-0.315-0.042-0.629-0.057-0.942c-0.031-0.642-0.036-1.286-0.067-1.928 c-0.032-0.669-0.088-1.338-0.132-2.005c-0.042-0.667-0.012-1.337-0.004-2.004c0.06-0.001,0.12-0.005,0.181-0.004 c0.13,0.004,0.262,0.002,0.392,0c0.216-0.005,0.431-0.008,0.645,0.009c0.058,0.059,0.114,0.123,0.166,0.187 c0.08,0.111,0.159,0.228,0.221,0.347c0.043,0.08,0.105,0.142,0.172,0.198c0.004,0.733-0.028,1.469-0.032,2.202 c-0.004,0.761-0.008,1.523-0.011,2.286c-0.004,0.677,0.023,1.351,0.027,2.028C16.545,11.41,16.545,11.783,16.539,12.156z M27.245,14.23c-0.099-0.757-0.204-1.51-0.396-2.247c-0.18-0.701-0.369-1.397-0.516-2.108c-0.145-0.717-0.313-1.431-0.512-2.135c-0.099-0.352-0.201-0.707-0.325-1.049c-0.128-0.35-0.266-0.694-0.407-1.036c-0.155-0.376-0.306-0.764-0.501-1.124c-0.17-0.31-0.35-0.612-0.541-0.908c-0.197-0.304-0.399-0.612-0.64-0.879c-0.254-0.281-0.577-0.512-0.933-0.644C22.284,2.029,22.088,2,21.893,2c-0.353,0-0.708,0.096-1.042,0.215c-0.199,0.073-0.361,0.176-0.47,0.363C20.303,2.709,20.282,2.86,20.29,3.01c-0.004,0.029-0.018,0.055-0.019,0.085c-0.027,0.808-0.046,1.615-0.075,2.423c-0.025,0.778-0.031,1.558-0.011,2.333c0.042,1.577,0.149,3.151,0.193,4.728c0.021,0.782,0.04,1.563,0.029,2.345c-0.011,0.757-0.054,1.516-0.084,2.272c-0.029,0.763-0.032,1.523-0.032,2.286c-0.002,0.759-0.017,1.521,0.008,2.28c0.025,0.749,0.048,1.496,0.082,2.244c0.017,0.352,0.021,0.703,0.038,1.057c0.015,0.296,0.025,0.594,0.021,0.891c-0.004,0.541-0.002,1.084,0.061,1.621c0.063,0.535,0.157,1.072,0.409,1.556c0.149,0.287,0.434,0.501,0.717,0.648c0.237,0.122,0.487,0.17,0.753,0.164c0.141-0.002,0.285-0.008,0.428-0.006c0.176,0.004,0.346-0.008,0.522-0.05c0.155-0.036,0.304-0.115,0.447-0.183c0.206-0.099,0.38-0.25,0.552-0.399c0.153-0.134,0.319-0.247,0.453-0.401c0.145-0.164,0.281-0.344,0.413-0.52c0.101-0.134,0.164-0.327,0.226-0.478c0.019-0.043,0.036-0.086,0.054-0.129c0.113-0.259,0.233-0.508,0.288-0.789c0.055-0.283,0.145-0.558,0.193-0.843c0.055-0.338,0.094-0.692,0.115-1.036c0.023-0.357,0.029-0.722,0.011-1.08c-0.021-0.44-0.115-0.875-0.201-1.303c-0.065-0.325-0.122-0.648-0.17-0.977c-0.086-0.577-0.229-1.147-0.365-1.714c-0.048-0.203-0.059-0.413-0.126-0.612c-0.014-0.043-0.022-0.086-0.036-0.128c0.028-0.033,0.068-0.06,0.084-0.097c0.007-0.016,0.014-0.031,0.022-0.046c0.083-0.088,0.175-0.167,0.268-0.246c0.227-0.197,0.447-0.424,0.612-0.678c0.174-0.275,0.323-0.571,0.461-0.864c0.162-0.34,0.268-0.707,0.382-1.066C27.226,15.636,27.339,14.924,27.245,14.23z M23.004,28.345c0.01-0.008,0.021-0.017,0.032-0.025l0,0C23.025,28.328,23.014,28.336,23.004,28.345z M23.037,28.319L23.037,28.319c0.03-0.024,0.061-0.048,0.092-0.071C23.098,28.271,23.067,28.295,23.037,28.319z M25.65,15.252c-0.042,0.24-0.108,0.474-0.172,0.708c-0.07,0.251-0.142,0.502-0.235,0.744c-0.104,0.236-0.211,0.48-0.355,0.694c-0.148,0.176-0.305,0.352-0.477,0.498c-0.18,0.155-0.375,0.302-0.47,0.527c-0.013,0.029-0.017,0.056-0.027,0.085c-0.217,0.141-0.379,0.37-0.361,0.637c0.015,0.21,0.044,0.413,0.119,0.61c0.057,0.147,0.084,0.296,0.107,0.451c0.017,0.127,0.036,0.252,0.068,0.377c0.034,0.138,0.076,0.275,0.107,0.415c0.061,0.268,0.109,0.537,0.155,0.806c0.118,0.666,0.282,1.325,0.397,1.992c0.065,0.587,0.04,1.18-0.03,1.767c-0.037,0.25-0.095,0.495-0.157,0.74c-0.067,0.258-0.134,0.51-0.231,0.756c-0.084,0.197-0.176,0.397-0.298,0.57c-0.081,0.102-0.167,0.203-0.262,0.291c-0.117,0.108-0.244,0.208-0.371,0.307c-0.066,0.046-0.135,0.087-0.207,0.124c-0.026,0.009-0.053,0.016-0.079,0.023c-0.183,0.012-0.369,0.029-0.552,0.023c-0.016-0.01-0.032-0.02-0.048-0.031c-0.008-0.007-0.016-0.015-0.024-0.022c-0.013-0.021-0.025-0.043-0.036-0.065c-0.085-0.251-0.143-0.51-0.183-0.772c-0.056-0.502-0.059-1-0.07-1.505c-0.006-0.287-0.025-0.573-0.04-0.86c-0.021-0.348-0.029-0.696-0.044-1.045c-0.031-0.736-0.078-1.472-0.096-2.209c-0.017-0.755-0.017-1.508-0.019-2.265c-0.002-1.546,0.036-3.092,0.054-4.638c0.019-1.58-0.031-3.161-0.111-4.74c-0.057-1.177-0.119-2.358-0.111-3.537c0.007-1.05,0.098-2.093,0.165-3.14c0.025-0.007,0.048-0.019,0.073-0.025c0.028,0,0.056,0,0.085,0.002c0.033,0.007,0.066,0.016,0.098,0.026c0.059,0.033,0.117,0.068,0.174,0.106c0.127,0.115,0.239,0.243,0.347,0.376c0.023,0.029,0.045,0.058,0.068,0.087c-0.009-0.012-0.019-0.024-0.028-0.036c0.245,0.315,0.464,0.646,0.669,0.988c0.183,0.31,0.333,0.631,0.476,0.959c-0.005-0.012-0.01-0.024-0.015-0.036c0.005,0.013,0.011,0.026,0.016,0.039c0.019,0.043,0.038,0.087,0.056,0.131c-0.018-0.041-0.036-0.082-0.053-0.122c0.115,0.278,0.227,0.557,0.336,0.839c0.105,0.275,0.187,0.554,0.269,0.839c0.176,0.606,0.334,1.215,0.47,1.833c0.134,0.615,0.252,1.235,0.38,1.85c0.059,0.287,0.145,0.566,0.21,0.85c0.069,0.308,0.122,0.618,0.168,0.931c0.044,0.341,0.089,0.682,0.109,1.026C25.682,14.574,25.684,14.909,25.65,15.252z M23.72,6.062c-0.002-0.004-0.003-0.008-0.005-0.011c0,0.001,0.001,0.002,0.001,0.003C23.717,6.056,23.719,6.059,23.72,6.062z"/></svg>',
        'ar livre e lazer': '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M9 5.25C7.03323 5.25 5.25 7.15209 5.25 9.75C5.25 12.0121 6.60204 13.7467 8.25001 14.1573V10.9014L6.33398 9.62405L7.16603 8.37597L8.792 9.45995L9.87597 7.83398L11.124 8.66603L9.75001 10.7271V14.1573C11.398 13.7467 12.75 12.0121 12.75 9.75C12.75 7.15209 10.9668 5.25 9 5.25ZM3.75 9.75C3.75 12.6785 5.62993 15.2704 8.25001 15.6906V19.5H3V21H21V19.5H18.75V18L18 17.25H12L11.25 18V19.5H9.75001V15.6906C12.3701 15.2704 14.25 12.6785 14.25 9.75C14.25 6.54892 12.0038 3.75 9 3.75C5.99621 3.75 3.75 6.54892 3.75 9.75ZM12.75 19.5H17.25V18.75H12.75V19.5Z" fill="#080341"/> </svg>',
        'comércio e serviços': '<svg fill="currentColor" height="20px" width="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  	 viewBox="0 0 511.999 511.999" xml:space="preserve"> <g> 	<g> 		<path d="M214.685,402.828c-24.829,0-45.029,20.2-45.029,45.029c0,24.829,20.2,45.029,45.029,45.029s45.029-20.2,45.029-45.029 			C259.713,423.028,239.513,402.828,214.685,402.828z M214.685,467.742c-10.966,0-19.887-8.922-19.887-19.887 			c0-10.966,8.922-19.887,19.887-19.887s19.887,8.922,19.887,19.887C234.572,458.822,225.65,467.742,214.685,467.742z"/> 	</g> </g> <g> 	<g> 		<path d="M372.63,402.828c-24.829,0-45.029,20.2-45.029,45.029c0,24.829,20.2,45.029,45.029,45.029s45.029-20.2,45.029-45.029 			C417.658,423.028,397.458,402.828,372.63,402.828z M372.63,467.742c-10.966,0-19.887-8.922-19.887-19.887 			c0-10.966,8.922-19.887,19.887-19.887c10.966,0,19.887,8.922,19.887,19.887C392.517,458.822,383.595,467.742,372.63,467.742z"/> 	</g> </g> <g> 	<g> 		<path d="M383.716,165.755H203.567c-6.943,0-12.571,5.628-12.571,12.571c0,6.943,5.629,12.571,12.571,12.571h180.149 			c6.943,0,12.571-5.628,12.571-12.571C396.287,171.382,390.659,165.755,383.716,165.755z"/> 	</g> </g> <g> 	<g> 		<path d="M373.911,231.035H213.373c-6.943,0-12.571,5.628-12.571,12.571s5.628,12.571,12.571,12.571h160.537 			c6.943,0,12.571-5.628,12.571-12.571C386.481,236.664,380.853,231.035,373.911,231.035z"/> 	</g> </g> <g> 	<g> 		<path d="M506.341,109.744c-4.794-5.884-11.898-9.258-19.489-9.258H95.278L87.37,62.097c-1.651-8.008-7.113-14.732-14.614-17.989 			l-55.177-23.95c-6.37-2.767-13.773,0.156-16.536,6.524c-2.766,6.37,0.157,13.774,6.524,16.537L62.745,67.17l60.826,295.261 			c2.396,11.628,12.752,20.068,24.625,20.068h301.166c6.943,0,12.571-5.628,12.571-12.571c0-6.943-5.628-12.571-12.571-12.571 			H148.197l-7.399-35.916H451.69c11.872,0,22.229-8.44,24.624-20.068l35.163-170.675 			C513.008,123.266,511.136,115.627,506.341,109.744z M451.69,296.301H135.619l-35.161-170.674l386.393,0.001L451.69,296.301z"/> 	</g> </g> </svg>',
        'entertenimento e cultura': '<svg width="20px" height="20px" viewBox="0 0 1024 1024" fill="currentColor" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M890.378 185.931v-87.011l-394.703 87.011h-33.281l-394.703-87.011v87.011h-41.486v695.564h431.986v0.957l4.205-0.957h33.281l4.205 0.957v-0.957h497.918v-695.564h-107.421zM109.383 185.931v-35.199l348.804 76.934v603.011l-348.804-76.973v-567.774zM848.722 150.654v602.969l-348.844 76.934v-602.969l348.844-76.934zM961.559 558.27h-48.986v-49.111h48.986v49.111zM88.513 831.553v-39.819l180.482 39.819h-180.482zM876.463 790.151v41.319h-187.354l187.354-41.319zM411.698 339.134l-258.582-86.096 5.747-17.164 7.497-22.368 258.582 86.096-13.247 39.529zM411.698 450.802l-258.582-86.096 13.164-39.529 258.582 86.096-13.164 39.529zM411.698 562.518l-258.582-86.096 13.164-39.529 258.582 86.096-13.164 39.529zM411.698 674.106l-258.582-86.055 13.164-39.529 258.582 86.055-13.164 39.529zM411.698 772.951l-258.582-86.055 13.164-39.529 258.582 86.055-13.164 39.529zM546.405 339.134l-13.164-39.529 258.54-86.096 7.497 22.368 5.79 17.164-258.666 86.096zM546.405 450.802l-13.164-39.529 258.54-86.096 13.164 39.529-258.54 86.096zM546.405 562.518l-13.164-39.529 258.54-86.096 13.164 39.529-258.54 86.096zM546.405 674.106l-13.164-39.529 258.54-86.055 13.164 39.529-258.54 86.055zM546.405 772.951l-13.164-39.529 258.54-86.055 13.164 39.529-258.54 86.055z" /></svg>',
        'desporto': '<svg width="20px" height="20px" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> \<rect width="48" height="48" fill="white" fill-opacity="0.01"/> \<path d="M36 15C38.7614 15 41 12.7614 41 10C41 7.23858 38.7614 5 36 5C33.2386 5 31 7.23858 31 10C31 12.7614 33.2386 15 36 15Z" fill="transparent" stroke="currentColor" stroke-width="4"/> \<path d="M12 16.7691L20.0031 13.998L31 19.2466L20.0031 27.4442L31 34.6834L24.0083 43.998" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/> \<path d="M35.3198 21.6434L38.0015 23.1018L43.9998 17.4658" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/> \<path d="M16.849 31.5454L13.8793 35.4572L4.00391 40.9964" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/> \</svg>',
        'educação': '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M21 10L12 5L3 10L6 11.6667M21 10L18 11.6667M21 10V10C21.6129 10.3064 22 10.9328 22 11.618V16.9998M6 11.6667L12 15L18 11.6667M6 11.6667V17.6667L12 21L18 17.6667L18 11.6667" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'outros': '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M6 10.5C5.17157 10.5 4.5 11.1716 4.5 12C4.5 12.8284 5.17157 13.5 6 13.5C6.82843 13.5 7.5 12.8284 7.5 12C7.5 11.1716 6.82843 10.5 6 10.5Z" fill="currentColor"/><path d="M10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12Z" fill="currentColor"/><path d="M16.5 12C16.5 11.1716 17.1716 10.5 18 10.5C18.8284 10.5 19.5 11.1716 19.5 12C19.5 12.8284 18.8284 13.5 18 13.5C17.1716 13.5 16.5 12.8284 16.5 12Z" fill="currentColor"/></svg>',
        'instituições públicas': '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5528 1.10557C11.8343 0.964809 12.1657 0.964809 12.4472 1.10557L22.4472 6.10557C22.862 6.31298 23.0798 6.77838 22.9732 7.22975C22.8667 7.68112 22.4638 8 22 8H1.99998C1.5362 8 1.13328 7.68112 1.02673 7.22975C0.920172 6.77838 1.13795 6.31298 1.55276 6.10557L11.5528 1.10557ZM6.23604 6H17.7639L12 3.11803L6.23604 6ZM5.99998 9C6.55226 9 6.99998 9.44772 6.99998 10V15C6.99998 15.5523 6.55226 16 5.99998 16C5.44769 16 4.99998 15.5523 4.99998 15V10C4.99998 9.44772 5.44769 9 5.99998 9ZM9.99998 9C10.5523 9 11 9.44772 11 10V15C11 15.5523 10.5523 16 9.99998 16C9.44769 16 8.99998 15.5523 8.99998 15V10C8.99998 9.44772 9.44769 9 9.99998 9ZM14 9C14.5523 9 15 9.44772 15 10V15C15 15.5523 14.5523 16 14 16C13.4477 16 13 15.5523 13 15V10C13 9.44772 13.4477 9 14 9ZM18 9C18.5523 9 19 9.44772 19 10V15C19 15.5523 18.5523 16 18 16C17.4477 16 17 15.5523 17 15V10C17 9.44772 17.4477 9 18 9ZM2.99998 18C2.99998 17.4477 3.44769 17 3.99998 17H20C20.5523 17 21 17.4477 21 18C21 18.5523 20.5523 19 20 19H3.99998C3.44769 19 2.99998 18.5523 2.99998 18ZM0.999976 21C0.999976 20.4477 1.44769 20 1.99998 20H22C22.5523 20 23 20.4477 23 21C23 21.5523 22.5523 22 22 22H1.99998C1.44769 22 0.999976 21.5523 0.999976 21Z" fill="currentColor"/> </svg>',
        'saúde': '<svg width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">    <g>        <path fill="currentColor" d="M0 0h24v24H0z"/>        <path fill-rule="nonzero" d="M8 20v-6h8v6h3V4H5v16h3zm2 0h4v-4h-4v4zm11 0h2v2H1v-2h2V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v17zM11 8V6h2v2h2v2h-2v2h-2v-2H9V8h2z"/>    </g></svg>',
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
        const freguesiaResponse = await fetch(`/api/obter_freguesia?lat=${lat}&lon=${lon}`);
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
    
    checkLoginStatus();
    updateHeader();

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


