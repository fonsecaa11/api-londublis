document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("searchInput");  // ID atualizado
  const sugestoes = document.getElementById("suggestionsList");  // ID atualizado

  let timeoutId;  // Variável para armazenar o ID do timeout (para debounce)

  input.addEventListener("input", function () {
    const query = input.value.trim();
    
    // Se a pesquisa for muito curta, não fazer a requisição
    if (query.length < 3) {
      sugestoes.innerHTML = "";
      sugestoes.style.display = "none";  // Esconde a lista
      return;
    }

    // Limita a quantidade de requisições com debounce
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      // Requisição à API do OpenStreetMap (Nominatim)
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`)
        .then((res) => res.json())
        .then((dados) => {
          sugestoes.innerHTML = ""; // Limpa as sugestões anteriores
          if (dados.length > 0) {
            sugestoes.style.display = "block"; // Exibe a lista
            dados.forEach((lugar) => {
              const item = document.createElement("li");
              item.className = "list-group-item list-group-item-action";
              item.textContent = lugar.display_name;
              item.addEventListener("click", () => {
                input.value = lugar.display_name;
                sugestoes.innerHTML = "";
                sugestoes.style.display = "none";  // Esconde a lista de sugestões após o clique
                
                // Aqui, você pode adicionar lógica para centralizar o mapa (se estiver implementado)
                // Exemplo: map.setView([lugar.lat, lugar.lon], 15);
              });
              sugestoes.appendChild(item);
            });
          } else {
            sugestoes.style.display = "none";  // Caso não haja resultados
          }
        })
        .catch((error) => {
          console.error("Erro na requisição:", error);
          sugestoes.innerHTML = "<li class='list-group-item'>Erro ao carregar sugestões</li>";
        });
    }, 300);  // Debounce de 300ms
  });

  // Ocultar sugestões ao clicar fora
  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !sugestoes.contains(e.target)) {
      sugestoes.innerHTML = "";
      sugestoes.style.display = "none";  // Esconde a lista quando clicar fora
    }
  });

  // Para garantir que as sugestões sejam escondidas quando o input perde o foco
  input.addEventListener("blur", () => {
    setTimeout(() => {
      sugestoes.innerHTML = "";
      sugestoes.style.display = "none";  // Esconde a lista quando perde foco
    }, 200);
  });
});
