// Global Variables
let users = [
    {
        id: 1,
        name: 'João Silva',
        email: 'joao.silva@email.com',
        status: 'active',
        role: 'admin',
        lastAccess: '2025-09-15 14:30'
    },
    {
        id: 2,
        name: 'Artiom Gusanu',
        email: 'artyy.gus@gmail.com',
        status: 'active',
        role: 'user',
        lastAccess: '2025-09-15 12:15'
    },
    {
        id: 3,
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@email.com',
        status: 'inactive',
        role: 'user',
        lastAccess: '2025-09-10 09:45'
    },
    {
        id: 4,
        name: 'Ana Costa',
        email: 'ana.costa@email.com',
        status: 'pending',
        role: 'moderator',
        lastAccess: 'Nunca'
    },
    {
        id: 5,
        name: 'Carlos Lima',
        email: 'carlos.lima@email.com',
        status: 'active',
        role: 'user',
        lastAccess: '2025-09-14 16:20'
    }
];

let activities = [
    {
        id: 1,
        type: 'login',
        user: 'João Silva',
        description: 'fez login no sistema',
        timestamp: '2025-09-15 14:30',
        avatar: 'JS'
    },
    {
        id: 2,
        type: 'user_create',
        user: 'Sistema',
        description: 'criou novo utilizador: Ana Costa',
        timestamp: '2025-09-15 13:45',
        avatar: 'S'
    },
    {
        id: 3,
        type: 'search',
        user: 'Artiom Gusanu',
        description: 'pesquisou por "Rua Escadaria Filipe Pinheiro, 2600-542, Alhandra, Vila Franca de Xira, Portugal"',
        timestamp: '2025-09-15 12:15',
        avatar: 'AG'
    },
    {
        id: 4,
        type: 'user_update',
        user: 'Pedro Oliveira',
        description: 'atualizou seus dados',
        timestamp: '2025-09-15 11:30',
        avatar: 'PO'
    },
    {
        id: 5,
        type: 'login',
        user: 'Carlos Lima',
        description: 'fez login no sistema',
        timestamp: '2025-09-14 16:20',
        avatar: 'CL'
    }
];

let searchStats = [
    { term: 'dashboard', count: 1247 },
    { term: 'usuarios', count: 892 },
    { term: 'relatorios', count: 634 },
    { term: 'configuracoes', count: 521 },
    { term: 'estatisticas', count: 398 },
    { term: 'atividades', count: 287 },
    { term: 'perfil', count: 234 },
    { term: 'ajuda', count: 198 }
];

let currentEditingUser = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    setupNavigation();
    setupSearch();
    setupFilters();
    setupModals();
    loadInitialData();
    startRealTimeUpdates();
}

// Navigation Setup
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.getAttribute('data-section');
            
            // Update navigation
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update sections
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection + '-section').classList.add('active');
            
            // Update header title
            updateHeaderTitle(targetSection);
            
            // Load section data
            loadSectionData(targetSection);
        });
    });
}

// Update Header Title
function updateHeaderTitle(section) {
    const titles = {
        overview: { title: 'Visão Geral', subtitle: 'Dashboard principal do sistema' },
        users: { title: 'Gerenciar utilizadores', subtitle: 'Adicione, edite e remova utilizadores do sistema' },
        statistics: { title: 'Estatísticas', subtitle: 'Análise detalhada das métricas do site' },
        activities: { title: 'Atividades Recentes', subtitle: 'Histórico de ações realizadas no sistema' }
    };
    
    const titleData = titles[section];
    document.getElementById('page-title').textContent = titleData.title;
    document.getElementById('page-subtitle').textContent = titleData.subtitle;
}

// Search Setup
function setupSearch() {
    const globalSearch = document.getElementById('global-search');
    const userSearch = document.getElementById('user-search');
    
    globalSearch.addEventListener('input', handleGlobalSearch);
    userSearch.addEventListener('input', handleUserSearch);
}

// Global Search Handler
function handleGlobalSearch(e) {
    const query = e.target.value.toLowerCase();
    // Implement global search functionality
    console.log('Global search:', query);
}

// User Search Handler
function handleUserSearch(e) {
    const query = e.target.value.toLowerCase();
    filterUsers(query);
}

// Filter Setup
function setupFilters() {
    const userFilter = document.getElementById('user-filter');
    const activityFilter = document.getElementById('activity-type-filter');
    
    userFilter.addEventListener('change', handleUserFilter);
    activityFilter.addEventListener('change', handleActivityFilter);
}

// User Filter Handler
function handleUserFilter(e) {
    const status = e.target.value;
    filterUsersByStatus(status);
}

// Activity Filter Handler
function handleActivityFilter(e) {
    const type = e.target.value;
    filterActivitiesByType(type);
}

// Modal Setup
function setupModals() {
    const userForm = document.getElementById('user-form');
    userForm.addEventListener('submit', handleUserFormSubmit);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
            closeConfirmModal();
        }
    });
}

// Load Initial Data
function loadInitialData() {
    loadUsers();
    loadRecentActivities();
    loadSearchStatistics();
    loadActivitiesList();
    updateStatistics();
}

// Load Section Data
function loadSectionData(section) {
    switch(section) {
        case 'overview':
            loadRecentActivities();
            updateStatistics();
            break;
        case 'users':
            loadUsers();
            break;
        case 'statistics':
            loadSearchStatistics();
            break;
        case 'activities':
            loadActivitiesList();
            break;
    }
}

// Load Users
function loadUsers() {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = createUserRow(user);
        tbody.appendChild(row);
    });
}

// Create User Row
function createUserRow(user) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td><span class="status-badge ${user.status}">${getStatusText(user.status)}</span></td>
        <td>${user.lastAccess}</td>
        <td>
            <div class="action-buttons">
                <button class="btn-icon edit" onclick="editUser(${user.id})" title="Editar">
                    ✏️
                </button>
                <button class="btn-icon delete" onclick="confirmDeleteUser(${user.id})" title="Excluir">
                    🗑️
                </button>
            </div>
        </td>
    `;
    return row;
}

// Get Status Text
function getStatusText(status) {
    const statusTexts = {
        active: 'Ativo',
        inactive: 'Inativo',
        pending: 'Pendente'
    };
    return statusTexts[status] || status;
}

// Filter Users
function filterUsers(query) {
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
    
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';
    
    filteredUsers.forEach(user => {
        const row = createUserRow(user);
        tbody.appendChild(row);
    });
}

// Filter Users by Status
function filterUsersByStatus(status) {
    let filteredUsers = users;
    
    if (status !== 'all') {
        filteredUsers = users.filter(user => user.status === status);
    }
    
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';
    
    filteredUsers.forEach(user => {
        const row = createUserRow(user);
        tbody.appendChild(row);
    });
}

// Show Add User Modal
function showAddUserModal() {
    currentEditingUser = null;
    document.getElementById('modal-title').textContent = 'Adicionar utilizador';
    document.getElementById('user-form').reset();
    document.getElementById('user-modal').classList.add('active');
}

// Edit User
function editUser(userId) {
    currentEditingUser = users.find(user => user.id === userId);
    
    if (currentEditingUser) {
        document.getElementById('modal-title').textContent = 'Editar utilizador';
        document.getElementById('user-name').value = currentEditingUser.name;
        document.getElementById('user-email').value = currentEditingUser.email;
        document.getElementById('user-status').value = currentEditingUser.status;
        document.getElementById('user-role').value = currentEditingUser.role;
        document.getElementById('user-modal').classList.add('active');
    }
}

// Handle User Form Submit
function handleUserFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        status: document.getElementById('user-status').value,
        role: document.getElementById('user-role').value
    };
    
    if (currentEditingUser) {
        updateUser(currentEditingUser.id, formData);
    } else {
        addUser(formData);
    }
    
    closeModal();
}

// Add User
function addUser(userData) {
    const newUser = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...userData,
        lastAccess: 'Nunca'
    };
    
    users.push(newUser);
    loadUsers();
    
    // Add activity
    addActivity({
        type: 'user_create',
        user: 'Sistema',
        description: `criou novo utilizador: ${newUser.name}`,
        avatar: 'S'
    });
    
    showMessage('utilizador adicionado com sucesso!', 'success');
    updateStatistics();
}

// Update User
function updateUser(userId, userData) {
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...userData };
        loadUsers();
        
        // Add activity
        addActivity({
            type: 'user_update',
            user: 'Admin',
            description: `atualizou dados de: ${userData.name}`,
            avatar: 'A'
        });
        
        showMessage('utilizador atualizado com sucesso!', 'success');
        updateStatistics();
    }
}

// Confirm Delete User
function confirmDeleteUser(userId) {
    const user = users.find(u => u.id === userId);
    
    if (user) {
        document.getElementById('confirm-message').textContent = 
            `Tem certeza que deseja excluir o utilizador "${user.name}"? Esta ação não pode ser desfeita.`;
        
        document.getElementById('confirm-action').onclick = () => {
            deleteUser(userId);
            closeConfirmModal();
        };
        
        document.getElementById('confirm-modal').classList.add('active');
    }
}

// Delete User
function deleteUser(userId) {
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
        const user = users[userIndex];
        users.splice(userIndex, 1);
        loadUsers();
        
        // Add activity
        addActivity({
            type: 'user_delete',
            user: 'Admin',
            description: `removeu utilizador: ${user.name}`,
            avatar: 'A'
        });
        
        showMessage('utilizador removido com sucesso!', 'success');
        updateStatistics();
    }
}

// Close Modal
function closeModal() {
    document.getElementById('user-modal').classList.remove('active');
    currentEditingUser = null;
}

// Close Confirm Modal
function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.remove('active');
}

// Load Recent Activities
function loadRecentActivities() {
    const container = document.getElementById('recent-activities');
    container.innerHTML = '';
    
    activities.slice(0, 5).forEach(activity => {
        const activityElement = createActivityElement(activity);
        container.appendChild(activityElement);
    });
}

// Create Activity Element
function createActivityElement(activity) {
    const div = document.createElement('div');
    div.className = 'activity-item';
    
    div.innerHTML = `
        <div class="activity-avatar">${activity.avatar}</div>
        <div class="activity-content">
            <div class="activity-text">${activity.user} ${activity.description}</div>
            <div class="activity-time">${formatTime(activity.timestamp)}</div>
        </div>
    `;
    
    return div;
}

// Add Activity
function addActivity(activityData) {
    const newActivity = {
        id: Math.max(...activities.map(a => a.id)) + 1,
        timestamp: new Date().toLocaleString('pt-BR'),
        ...activityData
    };
    
    activities.unshift(newActivity);
    loadRecentActivities();
    loadActivitiesList();
}

// Load Search Statistics
function loadSearchStatistics() {
    const container = document.getElementById('search-stats');
    container.innerHTML = '';
    
    searchStats.forEach(stat => {
        const div = document.createElement('div');
        div.className = 'search-item';
        
        div.innerHTML = `
            <span class="search-term">${stat.term}</span>
            <span class="search-count">${stat.count.toLocaleString()} pesquisas</span>
        `;
        
        container.appendChild(div);
    });
}

// Load Activities List
function loadActivitiesList() {
    const container = document.getElementById('activities-list');
    container.innerHTML = '';
    
    activities.forEach(activity => {
        const activityElement = createActivityElement(activity);
        container.appendChild(activityElement);
    });
}

// Filter Activities by Type
function filterActivitiesByType(type) {
    let filteredActivities = activities;
    
    if (type !== 'all') {
        filteredActivities = activities.filter(activity => activity.type === type);
    }
    
    const container = document.getElementById('activities-list');
    container.innerHTML = '';
    
    filteredActivities.forEach(activity => {
        const activityElement = createActivityElement(activity);
        container.appendChild(activityElement);
    });
}

// Update Statistics
function updateStatistics() {
    // Update user count
    document.getElementById('total-users').textContent = users.length.toLocaleString();
    
    // Simulate random updates for other stats
    const views = 1432;
    const searches = 891;
    const activeUsers = 3;
    
    document.getElementById('total-views').textContent = views.toLocaleString();
    document.getElementById('total-searches').textContent = searches.toLocaleString();
    document.getElementById('active-users').textContent = activeUsers.toLocaleString();
}

// Start Real-time Updates
function startRealTimeUpdates() {
    // Update statistics every 30 seconds
    setInterval(() => {
        updateStatistics();
    }, 30000);
    
    // Simulate new activities every 2 minutes
    setInterval(() => {
        simulateNewActivity();
    }, 120000);
}

// Simulate New Activity
function simulateNewActivity() {
    const activityTypes = ['login', 'search', 'user_update'];
    const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    if (randomUser) {
        let description;
        switch(randomType) {
            case 'login':
                description = 'fez login no sistema';
                break;
            case 'search':
                const randomSearch = searchStats[Math.floor(Math.random() * searchStats.length)];
                description = `pesquisou por "${randomSearch.term}"`;
                break;
            case 'user_update':
                description = 'atualizou seus dados';
                break;
        }
        
        addActivity({
            type: randomType,
            user: randomUser.name,
            description: description,
            avatar: randomUser.name.charAt(0).toUpperCase()
        });
    }
}

// Format Time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
        return 'Agora mesmo';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m atrás`;
    } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}h atrás`;
    } else {
        return `${Math.floor(diffInMinutes / 1440)}d atrás`;
    }
}

// Show Message
function showMessage(text, type = 'success') {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Export functions for global access
window.showAddUserModal = showAddUserModal;
window.editUser = editUser;
window.confirmDeleteUser = confirmDeleteUser;
window.closeModal = closeModal;
window.closeConfirmModal = closeConfirmModal;