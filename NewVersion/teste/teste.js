// Variáveis DOM
const showStreetButton = document.getElementById('showStreetField');
const streetContainer = document.getElementById('streetContainer');
const searchInput = document.getElementById('nome_rua');
const suggestionsList = document.getElementById('suggestionsList');
const searchButton = document.getElementById('searchButton');
const form = document.querySelector('form');

// Evento para mostrar o campo de pesquisa de rua
showStreetButton.addEventListener('click', function () {
    console.log("Botão de pesquisa de rua clicado");
    streetContainer.style.display = 'block'; // Mostra o campo de pesquisa de rua
    showStreetButton.style.display = 'none'; // Esconde o botão após ser clicado
});

document.addEventListener("DOMContentLoaded", async function () {
    console.log("Página carregada, a inicializar distritos...");
    const distritoSelect = document.getElementById("distrito");

    try {
        const distritoResponse = await fetch("/api/distritos");
        const distritos = await distritoResponse.json();
        console.log("Distritos recebidos:", distritos);

        if (distritos.length === 0) {
            Swal.fire("Erro", "Nenhum distrito encontrado", "error");
        } else {
            distritos.forEach(distrito => {
                const option = document.createElement("option");
                option.value = distrito.distrito;
                option.textContent = distrito.distrito;
                distritoSelect.appendChild(option); 
            });
        }
    } catch (error) {
        console.error("Erro ao carregar distritos:", error);
        Swal.fire("Erro", "Erro ao carregar distritos", "error");
    }

    // Evento para quando um distrito for selecionado
    distritoSelect.addEventListener("change", async function () {
        console.log("Distrito selecionado:", distritoSelect.value);
        const distrito = distritoSelect.value;
        const municipioSelect = document.getElementById("municipio");
        municipioSelect.innerHTML = "";  // Limpa os municípios ao selecionar um novo distrito

        try {
            const municipioResponse = await fetch(`/api/municipios?distrito=${distrito}`);
            const municipios = await municipioResponse.json();
            console.log("Municípios recebidos:", municipios);

            if (municipios.length === 0) {
                Swal.fire("Erro", "Nenhum município encontrado para este distrito", "error");
            } else {
                municipios.forEach(municipio => {
                    const option = document.createElement("option");
                    option.value = municipio.municipio;
                    option.textContent = municipio.municipio;
                    municipioSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Erro ao carregar municípios:", error);
            Swal.fire("Erro", "Erro ao carregar municípios", "error");
        }
    });

    const municipioSelect = document.getElementById("municipio");
    municipioSelect.addEventListener("change", async function () {
        console.log("Município selecionado:", municipioSelect.value);
        const municipio = municipioSelect.value;
        const freguesiaSelect = document.getElementById("freguesia");
        freguesiaSelect.innerHTML = "";  // Limpa as freguesias ao selecionar um novo município

        try {
            const freguesiaResponse = await fetch(`/api/freguesias?municipio=${municipio}`);
            const freguesias = await freguesiaResponse.json();
            console.log("Freguesias recebidas:", freguesias);

            if (freguesias.length === 0) {
                Swal.fire("Erro", "Nenhuma freguesia encontrada para este município", "error");
            } else {
                freguesias.forEach(freguesia => {
                    const option = document.createElement("option");
                    option.value = freguesia.freguesia;
                    option.textContent = freguesia.freguesia;
                    freguesiaSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Erro ao carregar freguesias:", error);
            Swal.fire("Erro", "Erro ao carregar freguesias", "error");
        }
    });

    // Evento para submeter o formulário
    form.addEventListener('submit', function(event) {
        event.preventDefault();  // Previne o comportamento padrão do formulário

        const nuts = document.getElementById('nuts').value;
        const distrito = document.getElementById('distrito').value;
        const municipio = document.getElementById('municipio').value;
        const freguesia = document.getElementById('freguesia').value;
        const nomeRua = document.getElementById('nome_rua').value;

        console.log({ nuts, distrito, municipio, freguesia, nomeRua });

        // Chama a função de pesquisa, como exemplo
        searchResults({ nuts, distrito, municipio, freguesia, nomeRua });
    });

    // Função para chamar a API ou manipular os dados de pesquisa
    async function searchResults(data) {
        console.log("Pesquisando resultados com os dados:", data);

        // Exemplo de chamada à API para obter estatísticas de região
        try {
            const regionStatsResponse = await fetch(`/api/regionStats?freguesia=${encodeURIComponent(data.freguesia)}`);
            const regionStatsData = await regionStatsResponse.json();
            console.log("Estatísticas da freguesia recebidas:", regionStatsData);

            if (regionStatsResponse.ok) {
                displayRegionStats(regionStatsData);  // Exibe as estatísticas
            } else {
                console.error("Erro ao obter estatísticas da freguesia:", regionStatsData.detail);
            }
        } catch (error) {
            console.error("Erro ao buscar resultados:", error);
        }
    }

    // Função para exibir as estatísticas da freguesia
    function displayRegionStats(stats) {
        console.log("Exibindo estatísticas da freguesia:", stats);
        const statsContainer = document.getElementById('regionStats');
        
        if (statsContainer) {
            // Verifica se o container existe antes de preencher os dados
            statsContainer.innerHTML = `
                <h3>Estatísticas da Freguesia</h3>
                <p><strong>Freguesia:</strong> ${stats.freguesia}</p>
                <p><strong>Município:</strong> ${stats.municipio}</p>
                <p><strong>População:</strong> ${stats.indicadores.numero_total}</p>
                <p><strong>Taxa de Envelhecimento:</strong> ${stats.indicadores.taxa_envelhecimento}%</p>
                <p><strong>Taxa de Analfabetismo:</strong> ${stats.indicadores.taxa_analfabetismo}%</p>
                <p><strong>Taxa de Ensino Superior:</strong> ${stats.indicadores.taxa_ensino_superior}%</p>
                <p><strong>Taxa de Desemprego:</strong> ${stats.indicadores.taxa_desemprego}%</p>
                <p><strong>Taxa de Criminalidade:</strong> ${stats.indicadores.taxa_criminalidade}%</p>
                <p><strong>Taxa de Mortalidade:</strong> ${stats.indicadores.taxa_mortalidade}%</p>
                <p><strong>Valor da Renda (Absoluto):</strong> ${stats.indicadores.valor_renda_absoluto}€</p>
                <p><strong>Valor da Renda (Percentual):</strong> ${stats.indicadores.valor_renda_percentual}%</p>
                <p><strong>Enfermeiros por 1000 Habitantes:</strong> ${stats.indicadores.enfermeiros_por_1000}</p>
                <p><strong>Taxa de Não Transição:</strong> ${stats.indicadores.taxa_nao_transicao}%</p>
                <p><strong>Taxa de Transição:</strong> ${stats.indicadores.taxa_transicao}%</p>
                <p><strong>Empresas Constituídas (2023):</strong> ${stats.indicadores.constituicao_2023}</p>
                <p><strong>Empresas Dissolvidas (2023):</strong> ${stats.indicadores.dissolucao_2023}</p>
                <p><strong>Empresas Constituídas (2021):</strong> ${stats.indicadores.constituicao_2021}</p>
                <p><strong>Empresas Dissolvidas (2021):</strong> ${stats.indicadores.dissolucao_2021}</p>
                <p><strong>Taxa de Constituição de Empresas:</strong> ${stats.indicadores.taxa_constituicao}%</p>
                <p><strong>Variação Total Constituição de Empresas:</strong> ${stats.indicadores.constituicao_total}%</p>
                <p><strong>Variação Total Dissolução de Empresas:</strong> ${stats.indicadores.dissolucao_total}%</p>
            `;
        }
    }
});
