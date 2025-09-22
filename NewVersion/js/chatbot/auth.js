// Auth Modal Functions
window.showLoginPopup = function() {
  const modal = document.getElementById('authModal');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

window.hideLoginPopup = function() {
  const modal = document.getElementById('authModal');
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
}

window.switchTab = function(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  } else {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
}

// Initialize Supabase client
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Supabase URL and Key
const supabaseUrl = 'https://pwejnrzhdvnjzlopigvz.supabase.co';
const supabaseKey = 'londublis1234';
const supabase = createClient(supabaseUrl, supabaseKey);

// Handle Login with Supabase
window.handleLogin = async function(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const email = formData.get('email');
  const password = formData.get('password');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    console.log('Login realizado com sucesso:', data);
    alert('Login realizado com sucesso!');
    hideLoginPopup();

  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    alert('Erro ao realizar login: ' + error.message);
  }
}

// Defina a função no escopo global da janela
window.handleRegister = async function(event) {
  event.preventDefault();
  const formData = new FormData(event.target); // Pega os dados do formulário
  const email = formData.get('email');
  const password = formData.get('password');

  console.log('Tentando registrar:', { email, password });

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });

    if (error) throw error;

    console.log('Conta criada com sucesso no Supabase Auth:', data);

    // Insira o usuário na tabela "usuarios"
    const { data: insertData, error: insertError } = await supabase
      .from('usuarios')  // Sua tabela de usuários no Supabase
      .insert([{ email: email }]);

    if (insertError) {
      console.error('Erro ao inserir na tabela de usuários:', insertError.message);
      alert('Erro ao criar conta na base de dados: ' + insertError.message);
      return;
    }

    console.log('Usuário inserido na tabela de usuários:', insertData);

    alert('Conta criada com sucesso!');
    hideLoginPopup(); // Fecha o modal de login

  } catch (error) {
    console.error('Erro ao criar conta:', error.message);
    alert('Erro ao criar conta: ' + error.message);
  }
};



// Close modal when clicking outside
document.getElementById('authModal').addEventListener('click', function(event) {
  if (event.target === this) {
    hideLoginPopup();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    hideLoginPopup();
  }
});
