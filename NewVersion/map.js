let map; // Variável global para o mapa

// Função para inicializar o mapa
function initMap(lat, lon) {
    map = new maplibregl.Map({
        container: 'mapContainer',
        style: 'https://api.protomaps.com/styles/v5/light/pt.json?key=009a3749c1dd61a4',
        center: [lon, lat],
        zoom: 15,
        pitch: 60,
        bearing: -20,
        antialias: true
    });
}
