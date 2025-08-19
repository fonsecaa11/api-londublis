const map = new maplibregl.Map({
    container: 'mapContainer',
    style: 'https://api.protomaps.com/styles/v5/light/pt.json?key=009a3749c1dd61a4',
    center: [-9.142, 38.736], // Lisboa
    zoom: 15,
    pitch: 60,
    bearing: -20,
    antialias: true
});

// Função para renderizar o mapa real com POIs
function renderMap() {
    console.log('Iniciando a renderização dos POIs...');
    
    if (!currentPOIs || currentPOIs.length === 0) {
        console.log('Nenhum POI encontrado!');
    } else {
        currentPOIs.forEach(poi => {
            console.log(`Renderizando POI: ${poi.name} (Lat: ${poi.lat}, Lng: ${poi.lng})`);

            // Selecionar o ícone com base no tipo de POI
            const poiIcon = icons[poi.type] || icons['mapPin']; // Usar um ícone padrão se o tipo não estiver definido

            // Criar o marcador com o ícone selecionado
            const marker = new maplibregl.Marker({ element: createIconElement(poiIcon) })
                .setLngLat([poi.lng, poi.lat]) // Definir a posição do POI
                .setPopup(new maplibregl.Popup().setHTML(`
                    <h3>${poi.name}</h3>
                    <p>${poi.description}</p>
                `)) // Popup ao clicar no POI
                .addTo(map);
        });
    }

    // Criar a legenda do mapa
    console.log('Gerando legenda...');
    const legendHTML = Object.entries(typeLabels).map(([type, label]) => {
        console.log(`Tipo: ${type}, Rótulo: ${label}`);
        return `
            <div class="legend-item">
                <div class="legend-icon poi-${type}">${icons[type]}</div>
                <span class="legend-text">${label}</span>
            </div>
        `;
    }).join('');
    
    // Adicionar a legenda ao seu contêiner de legenda
    const legendContainer = document.querySelector('.map-legend');
    if (legendContainer) {
        console.log('Adicionando a legenda ao contêiner...');
        legendContainer.innerHTML = `
            <h4>Pontos de Interesse</h4>
            <div class="legend-grid">${legendHTML}</div>
        `;
    } else {
        console.error('Não foi possível encontrar o contêiner da legenda!');
    }
}

// Função para criar um elemento de ícone SVG e aplicar estilo
function createIconElement(icon) {
    const div = document.createElement('div');
    div.innerHTML = icon;
    div.style.width = '32px';  // Defina o tamanho do ícone conforme necessário
    div.style.height = '32px'; // Defina o tamanho do ícone conforme necessário
    return div;
}

map.on('load', function() {
    console.log('Mapa carregado com sucesso');
    renderMap(); // Após o mapa carregar, renderize os POIs
});