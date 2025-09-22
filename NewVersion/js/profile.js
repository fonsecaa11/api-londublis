// Acessar o ID do usuário
const userId = localStorage.getItem('userId');

if (userId) {
    // Fazer uma requisição para buscar as informações do usuário
    fetch(`/user/${userId}`)
        .then(res => res.json())
        .then(data => {
            // Exibir os dados do usuário na página de perfil
            document.getElementById('user-name').innerText = `${data.firstName} ${data.lastName}`;
            document.getElementById('user-email').innerText = data.email;
        })
        .catch(err => console.error(err));
} else {
    // Se não houver usuário autenticado, redirecionar para a página de login
    window.location.href = 'login.html';
}
