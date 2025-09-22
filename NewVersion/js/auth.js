// Função auxiliar para requests
async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw data;
  return data;
}

// ----------- REGISTO -----------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  const submitBtn = document.getElementById("submitBtn");
  const termsCheckbox = document.getElementById("terms");

  // Desativar botão por defeito
  if (submitBtn && termsCheckbox) {
    submitBtn.disabled = !termsCheckbox.checked;

    // Atualizar estado quando clicar no checkbox
    termsCheckbox.addEventListener("change", () => {
      submitBtn.disabled = !termsCheckbox.checked;
    });
  }

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const senha = document.getElementById("regPassword").value;
      const confirm = document.getElementById("confirmPassword").value;
      const acceptTerms = document.getElementById("terms").checked;

      if (!acceptTerms) {
        alert("Precisa de aceitar os termos e condições.");
        return;
      }

      if (senha !== confirm) {
        alert("As senhas não coincidem!");
        return;
      }

      const data = await postJSON("/register", {
        first_name: firstName,
        last_name: lastName,
        email,
        senha
      });

      alert(data.message);
      window.location.href = "login.html";
    } catch (err) {
      alert(err.detail || err.message || "Erro no registo");
    }
  });
}

// ----------- LOGIN -----------
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;
        
        console.log("Tentando login com email:", email); // Log do email antes de enviar a solicitação

        const data = await postJSON("/login", { email, senha });
        
        console.log("Resposta do servidor:", data); // Log da resposta do servidor

        alert(data.message);  

        // Armazenar o ID do usuário no localStorage
        localStorage.setItem('userId', data.email); // Aqui, 'userId' vem da resposta do backend
        console.log("ID do usuário armazenado no localStorage:", data.email);

        window.location.href = data.redirect;
    } catch (err) {
        console.error("Erro no login:", err); // Log de erro no console
        alert(err.detail || err.message || "Erro no login");
    }
});

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