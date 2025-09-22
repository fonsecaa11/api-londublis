// Toast functionality
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Login form handling
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            showToast('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        showToast('Login realizado! Bem-vindo de volta!', 'success');
    });
}

// Register form handling
if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    const submitBtn = document.getElementById('submitBtn');
    const termsCheckbox = document.getElementById('terms');
    
    // Enable/disable submit button based on terms checkbox
    termsCheckbox.addEventListener('change', () => {
        submitBtn.disabled = !termsCheckbox.checked;
    });
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const acceptTerms = document.getElementById('terms').checked;
        
        // Validations
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            showToast('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showToast('As senhas não coincidem.', 'error');
            return;
        }
        
        if (!acceptTerms) {
            showToast('Você deve aceitar os termos e condições.', 'error');
            return;
        }
        
        showToast('Conta criada! Bem-vindo! Sua conta foi criada com sucesso.', 'success');
    });
}

// Função para pegar o token de sessão do cookie
function getSessionToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        if (cookie.trim().startsWith('session_token=')) {
            return cookie.trim().substring('session_token='.length);
        }
    }
    return null;
}

// Função de login
async function login(event) {
    event.preventDefault();  // Impede o envio do formulário (não recarrega a página)

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.status === 200) {
        console.log(data);  // Aqui você pode verificar a resposta do servidor
        alert(data.message);
        // O cookie de sessão é gerido automaticamente pelo navegador, mas você pode fazer algo com ele:
        const sessionToken = getSessionToken();
        console.log("Token de sessão:", sessionToken);  // Verificando o token do cookie
        // Agora, você pode redirecionar o usuário para a página de acordo com seu papel
        window.location.href = data.redirect;
    } else {
        console.log(data);
        alert("Login falhou: " + data.error);
    }
}

// Adiciona o evento de submit ao formulário de login
document.getElementById("login-form").addEventListener("submit", login);
