document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const floralContainer = document.getElementById('floral-container');

    if (floralContainer) {
        const drops = [];
        const totalDrops = 38;

        for (let i = 0; i < totalDrops; i++) {
            const drop = document.createElement('span');
            drop.classList.add('rain-drop');

            const size = 2 + Math.random() * 8;
            drop.style.width = `${size * 0.7}px`;
            drop.style.height = `${size * 3.5}px`;
            drop.style.opacity = String(0.25 + Math.random() * 0.6);

            floralContainer.appendChild(drop);

            drops.push({
                el: drop,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                speed: 2 + Math.random() * 4,
                sway: (Math.random() - 0.5) * 1.5,
                size
            });
        }

        function animateRain() {
            const time = Date.now() * 0.001;

            drops.forEach((drop, index) => {
                drop.y += drop.speed;
                drop.x += Math.sin(time + index) * drop.sway;

                if (drop.y > window.innerHeight + 40) {
                    drop.y = -40;
                    drop.x = Math.random() * window.innerWidth;
                }

                if (drop.x < -20) drop.x = window.innerWidth + 20;
                if (drop.x > window.innerWidth + 20) drop.x = -20;

                drop.el.style.left = `${drop.x}px`;
                drop.el.style.top = `${drop.y}px`;
                drop.el.style.transform = `rotate(${Math.sin(time + index) * 25}deg)`;
            });

            requestAnimationFrame(animateRain);
        }

        requestAnimationFrame(animateRain);
    }

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

    const animatedElements = document.querySelectorAll('.section-title, .skill-category, .project-card, .contact-container, .contact-info');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        revealObserver.observe(el);
    });
});
