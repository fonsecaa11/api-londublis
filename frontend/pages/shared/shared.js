// Shared JavaScript functionality
function initializeLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Mobile menu management
function toggleMobileMenu() {
    const mobileNav = document.querySelector('.nav-mobile');
    const menuIcon = document.querySelector('.menu-icon');
    const closeIcon = document.querySelector('.close-icon');

    if (mobileNav && menuIcon && closeIcon) {
        mobileNav.classList.toggle('hidden');
        menuIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
    }
}

function closeMobileMenu() {
    const mobileNav = document.querySelector('.nav-mobile');
    const menuIcon = document.querySelector('.menu-icon');
    const closeIcon = document.querySelector('.close-icon');

    if (mobileNav && menuIcon && closeIcon) {
        mobileNav.classList.add('hidden');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    }
}

// Set active navigation item based on current page
function setActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item, .nav-item-mobile');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Load shared HTML components
async function loadSharedComponents() {
    try {
        const headerResponse = await fetch('shared/header.html');
        if (!headerResponse.ok) throw new Error('Failed to load header');
        const headerHTML = await headerResponse.text();
        document.getElementById('header-placeholder').innerHTML = headerHTML;

        const footerResponse = await fetch('shared/footer.html');
        if (!footerResponse.ok) throw new Error('Failed to load footer');
        const footerHTML = await footerResponse.text();
        document.getElementById('footer-placeholder').innerHTML = footerHTML;

        setActiveNavigation();
        initializeLucideIcons();
    } catch (error) {
        console.error('Error loading shared components:', error);
        document.getElementById('header-placeholder').innerHTML = '<p>Erro ao carregar o header.</p>';
        document.getElementById('footer-placeholder').innerHTML = '<p>Erro ao carregar o footer.</p>';
    }
}


// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth >= 768) {
        closeMobileMenu();
    }
});

// Handle clicks outside mobile menu
document.addEventListener('click', function(event) {
    const mobileNav = document.querySelector('.nav-mobile');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    if (mobileNav && !mobileNav.classList.contains('hidden') && 
        !mobileNav.contains(event.target) && 
        !mobileMenuBtn.contains(event.target)) {
        closeMobileMenu();
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadSharedComponents();
});