document.addEventListener("DOMContentLoaded", function () {
        const input = document.getElementById("inputPesquisa");
        const sugestoes = document.getElementById("sugestoes");

        input.addEventListener("input", function () {
          const query = input.value.trim();
          console.log(`Input alterado: ${query}`); // Log para verificar o valor do input

          if (query.length < 3) {
            console.log("Menos de 3 caracteres, escondendo sugestões...");
            sugestoes.innerHTML = "";
            sugestoes.style.display = "none"; // Esconde as sugestões
            return;
          }

          fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              query
            )}&addressdetails=1&limit=5`
          )
            .then((res) => res.json())
            .then((dados) => {
              console.log("Dados recebidos da API:", dados); // Log para ver os dados recebidos da API
              sugestoes.innerHTML = "";
              sugestoes.style.display = "block"; // Exibe as sugestões

              if (dados.length === 0) {
                console.log("Nenhuma sugestão encontrada.");
              }

              dados.forEach((lugar) => {
                const item = document.createElement("li");
                item.className = "list-group-item list-group-item-action";
                item.textContent = lugar.display_name;
                item.addEventListener("click", () => {
                  console.log(`Local selecionado: ${lugar.display_name}`); // Log para verificar o local selecionado
                  input.value = lugar.display_name;
                  sugestoes.innerHTML = "";
                  sugestoes.style.display = "none"; // Esconde as sugestões após a seleção
                  // Adiciona a lógica para centralizar o mapa, se necessário
                  // map.setView([lugar.lat, lugar.lon], 15);
                });
                sugestoes.appendChild(item);
              });
            })
            .catch((error) => {
              console.log("Erro ao buscar dados da API:", error); // Log para capturar erros na requisição
            });
        });

        // Ocultar sugestões ao clicar fora
        document.addEventListener("click", (e) => {
          if (!input.contains(e.target) && !sugestoes.contains(e.target)) {
            console.log(
              "Clicado fora do campo de pesquisa ou das sugestões, escondendo sugestões."
            );
            sugestoes.innerHTML = "";
            sugestoes.style.display = "none"; // Esconde as sugestões
          }
        });
      });