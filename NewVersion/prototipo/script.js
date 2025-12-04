const selectDistrito = document.getElementById("selectDistrito");
const selectConcelho = document.getElementById("selectConcelho");
const selectFreguesia = document.getElementById("selectFreguesia");
const resultadoDiv = document.getElementById("resultado");

// -------------------------------
// 1. Carregar distritos no início
// -------------------------------
async function carregarDistritos() {
    const res = await fetch("/api/distritos");
    const distritos = await res.json();
    distritos.forEach(d => {
        selectDistrito.innerHTML += `<option value="${d.id_distrito}">${d.descr_distrito}</option>`;
    });
}
carregarDistritos();

// -----------------------------------------------------
// 2. Quando escolhe distrito → carregar concelhos
// -----------------------------------------------------
selectDistrito.addEventListener("change", async () => {
    const id = selectDistrito.value;
    selectConcelho.innerHTML = `<option value="">Escolha um concelho</option>`;
    selectFreguesia.innerHTML = `<option value="">Escolha uma freguesia</option>`;
    selectConcelho.disabled = true;
    selectFreguesia.disabled = true;

    if (!id) return;

    const res = await fetch(`/api/concelhos/${id}`);
    const concelhos = await res.json();
    concelhos.forEach(c => {
        selectConcelho.innerHTML += `<option value="${c.id_concelho}">${c.descr_concelho}</option>`;
    });
    selectConcelho.disabled = false;
});

// ----------------------------------------------------
// 3. Quando escolhe concelho → carregar freguesias
// ----------------------------------------------------
selectConcelho.addEventListener("change", async () => {
    const id = selectConcelho.value;
    selectFreguesia.innerHTML = `<option value="">Escolha uma freguesia</option>`;
    selectFreguesia.disabled = true;

    if (!id) return;

    const res = await fetch(`/api/freguesias/${id}`);
    const freguesias = await res.json();
    freguesias.forEach(f => {
        selectFreguesia.innerHTML += `<option value="${f.id_freguesia}">${f.descr_freguesia}</option>`;
    });
    selectFreguesia.disabled = false;
});

// --------------------------------
// 4. Botão pesquisar → carregar dados estatísticos
// --------------------------------
document.getElementById("btnPesquisar").addEventListener("click", async () => {
    const distrito = selectDistrito.options[selectDistrito.selectedIndex].text;
    const concelho = selectConcelho.options[selectConcelho.selectedIndex].text;
    const freguesia = selectFreguesia.options[selectFreguesia.selectedIndex].text;
    const idFreguesia = selectFreguesia.value;

    if (!idFreguesia) {
        alert("Escolha uma freguesia antes de pesquisar!");
        return;
    }

    resultadoDiv.innerHTML = "A carregar dados...";
    document.getElementById("densidade").innerHTML = "";

    try {
        
        // =======================================================
        // 1. BUSCAR DENSIDADE POPULACIONAL (nova funcionalidade)
        // =======================================================

        const res2 = await fetch(`/api/freguesia/densidade/${freguesia}`);
        const densidade = await res2.json();

        const tabelaDados = densidade.densidade_populacional;

        if (!tabelaDados || tabelaDados.length === 0) {
            document.getElementById("densidade").innerHTML = "<p>Sem dados de densidade populacional.</p>";
            return;
        }

        // Cálculo do crescimento total HM
        const hm = tabelaDados.find(d => d.genero === "HM");
        const crescimentoTotal = hm ? hm.crescimento_percentual.toFixed(1) : null;

        let densHTML = `
            <p>Crescimento 2011→2021: <strong>${crescimentoTotal ? "+" + crescimentoTotal + "%" : "-"}</strong></p>

            <table border="1" cellpadding="6">
                <tr>
                    <th>Gênero</th>
                    <th>2011</th>
                    <th>2021</th>
                    <th>Cresc. %</th>
                </tr>
        `;

        tabelaDados.forEach(linha => {
            densHTML += `
                <tr>
                    <td>${linha.genero}</td>
                    <td>${linha.valor_2011}</td>
                    <td>${linha.valor_2021}</td>
                    <td>${linha.crescimento_percentual ? linha.crescimento_percentual.toFixed(1) + "%" : "-"}</td>
                </tr>
            `;
        });

        densHTML += "</table>";

        document.getElementById("densidade").innerHTML = densHTML;

    } catch (err) {
        console.error(err);
        resultadoDiv.innerHTML = "Erro ao carregar dados!";
    }

    // ===============================
    // 2. BUSCAR PIRÂMIDE ETÁRIA
    // ===============================
    try {
        const resPiramide = await fetch(`/api/freguesia/piramide/${freguesia}`);
        const piramideDados = await resPiramide.json();

        if (!piramideDados.piramide_etaria || piramideDados.piramide_etaria.length === 0) {
            document.getElementById("piramide").innerHTML = "<p>Sem dados de pirâmide etária.</p>";
        } else {
            // Mostrar totais acima do gráfico
            const totais = piramideDados.totais;
            document.getElementById("piramide").innerHTML = `
                <p><strong>Total Homens:</strong> ${totais.homens} |
                   <strong>Total Mulheres:</strong> ${totais.mulheres} |
                   <strong>Total HM:</strong> ${totais.hm}</p>
                <div id="graficoPiramide"></div>
            `;

            // Preparar dados para ApexCharts
            const categorias = piramideDados.piramide_etaria.map(d => d.faixa_etaria);
            const homens = piramideDados.piramide_etaria.map(d => d.homens);
            const mulheres = piramideDados.piramide_etaria.map(d => d.mulheres);

            const options = {
                chart: {
                    type: 'bar',
                    height: 500,
                    stacked: true,
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                        barHeight: '80%',
                    }
                },
                dataLabels: {
                    enabled: true,
                    formatter: function (val) {
                        return Math.abs(val);
                    }
                },
                series: [{
                    name: 'Homens',
                    data: homens
                }, {
                    name: 'Mulheres',
                    data: mulheres
                }],
                xaxis: {
                    categories: categorias,
                    labels: {
                        formatter: function(val) {
                            return Math.abs(val);
                        }
                    }
                },
                colors: ['#7FB3D5', '#F5B7B1'], // cores suaves
                tooltip: {
                    y: {
                        formatter: function(val) {
                            return Math.abs(val);
                        }
                    }
                }
            };

            const chart = new ApexCharts(document.querySelector("#piramide"), options);
            chart.render();
        }

    } catch (err) {
        console.error(err);
        document.getElementById("piramide").innerHTML = "Erro ao carregar pirâmide etária!";
    }

    try {
        // =======================================================
        // 3. BUSCAR VARIAÇÃO POPULACIONAL POR GRUPO ETÁRIO
        // =======================================================
        const resVariacao = await fetch(`/api/freguesia/variacao_populacional/${freguesia}`);
        const dadosVariacao = await resVariacao.json();
        if (!dadosVariacao.variacao_populacional) {
            document.getElementById("variacao").innerHTML = "<p>Sem dados de variação populacional.</p>";
        } else {
            const grupos = Object.keys(dadosVariacao.variacao_populacional);
            const homens = grupos.map(g => dadosVariacao.variacao_populacional[g].H || 0);
            const mulheres = grupos.map(g => dadosVariacao.variacao_populacional[g].M || 0);
            const total = grupos.map(g => dadosVariacao.variacao_populacional[g].HM || 0);

            const optionsVariacao = {
                chart: { type: 'bar', height: 400 },
                plotOptions: { bar: { horizontal: false } },
                series: [
                    { name: 'Homens', data: homens },
                    { name: 'Mulheres', data: mulheres },
                    { name: 'Total', data: total }
                ],
                xaxis: { categories: grupos },
                colors: ['#7FB3D5', '#F5B7B1', '#95A5A6'],
                tooltip: { y: { formatter: val => val.toFixed(1) + "%" } }
            };

            document.getElementById("variacao").innerHTML = `<div id="graficoVariacao"></div>`;
            const chartVariacao = new ApexCharts(document.querySelector("#graficoVariacao"), optionsVariacao);
            chartVariacao.render();
        }

        resultadoDiv.innerHTML = `Dados carregados para <strong>${freguesia}</strong>.`;

    } catch (err) {
        console.error(err);
        document.getElementById("piramide").innerHTML = "Erro ao carregar pirâmide etária!";
    }
});


// --------------------------------
// 5. Botão limpar
// --------------------------------
document.getElementById("btnLimpar").addEventListener("click", () => {
    selectDistrito.value = "";
    selectConcelho.innerHTML = `<option value="">Escolha um concelho</option>`;
    selectFreguesia.innerHTML = `<option value="">Escolha uma freguesia</option>`;
    selectConcelho.disabled = true;
    selectFreguesia.disabled = true;
    resultadoDiv.innerHTML = "";
});