document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des icônes Lucide
    if (window.lucide) {
        lucide.createIcons();
    }

    // Mise à jour automatique de l'année du footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Effet d'apparition au défilement (Scroll Reveal)
    const observerOptions = {
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Application de l'effet d'animation sur les sections et cartes
    const animatedElements = document.querySelectorAll('.section-title, .about-card, .skill-card, .project-card, .contact-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        revealObserver.observe(el);
    });
});
