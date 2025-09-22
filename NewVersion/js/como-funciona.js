// Como Funciona page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeComoFuncionaPage();
});

function initializeComoFuncionaPage() {
    // Add scroll animations for step cards
    observeStepCards();
    
    // Add hover effects for feature cards
    addFeatureCardEffects();
}

// Intersection Observer for step cards animation
function observeStepCards() {
    const stepCards = document.querySelectorAll('.step-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    stepCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Add interactive effects to feature cards
function addFeatureCardEffects() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

// Add parallax effect to benefits section
window.addEventListener('scroll', function() {
    const benefitsSection = document.querySelector('.benefits-section');
    if (benefitsSection) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        benefitsSection.style.transform = `translateY(${rate}px)`;
    }
});