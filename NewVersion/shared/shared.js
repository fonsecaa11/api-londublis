// Função para carregar o header
  document.addEventListener("DOMContentLoaded", function() {
    fetch('shared/header.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('header-container').innerHTML = data;
      });
  });

// Função para carregar o footer
  document.addEventListener("DOMContentLoaded", function() {
    fetch('shared/footer.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('footer-container').innerHTML = data;
      });
  });