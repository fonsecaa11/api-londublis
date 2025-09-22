document.getElementById("searchForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Evita o comportamento padrão de envio do formulário
    
    const input = document.getElementById("searchInput").value.trim(); // Captura o valor do campo de entrada

    console.log("Formulario submetido, valor de input:", input);

    if (!input) {
        Swal.fire("Erro", "Por favor insira uma morada ou coordenadas.", "warning");
        console.log("Nenhuma morada ou coordenadas inseridas.");
        return;
    }

    let lat, lon;

    // Verifica se é coordenada (formato: número, número)
    const coordMatch = input.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
        lat = parseFloat(coordMatch[1]);
        lon = parseFloat(coordMatch[3]);
        console.log(`Coordenadas inseridas: Lat = ${lat}, Lon = ${lon}`);
    } else {
        // Se não for coordenada, tenta buscar a morada usando Nominatim
        try {
            console.log("Buscando morada usando Nominatim...");
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`);
            const data = await response.json();
            if (!data.length) {
                Swal.fire("Não encontrado", "Morada não encontrada.", "error");
                console.log("Morada não encontrada.");
                return;
            }
            lat = parseFloat(data[0].lat);
            lon = parseFloat(data[0].lon);
            console.log(`Morada encontrada: Lat = ${lat}, Lon = ${lon}`);
        } catch (error) {
            Swal.fire("Erro", "Erro ao buscar a morada.", "error");
            return;
        }
    }

    // Agora podemos passar as coordenadas (lat, lon) para a lógica do mapa ou outro processamento necessário
    document.getElementById("lat").value = lat;
    document.getElementById("lon").value = lon;

    // Se você quiser disparar algum outro evento após a busca, como atualizar o mapa, pode fazer aqui
    const event = new Event("submit", { bubbles: true, cancelable: true });
    document.getElementById("poiForm").dispatchEvent(event);
});
