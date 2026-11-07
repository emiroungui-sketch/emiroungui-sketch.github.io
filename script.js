document.addEventListener('DOMContentLoaded', () => {

    // 1. Palette de couleurs aléatoire au refresh
    const colorPalettes = [
        { accent: '#d80018', name: 'Rouge Cyber' },
        { accent: '#0055ff', name: 'Bleu Matrix' },
        { accent: '#00cc44', name: 'Vert Terminal' },
        { accent: '#ff8800', name: 'Orange Alerte' },
        { accent: '#cc00ff', name: 'Violet Néon' }
    ];
    const randomPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
    document.documentElement.style.setProperty('--paper-accent', randomPalette.accent);

    // Convertit #rrggbb en rgba(r, g, b, alpha)
    function hexToRgba(hex, alpha) {
        const n = parseInt(hex.slice(1), 16);
        return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
    }


    // 2. Disposition aléatoire des cartes au refresh
    const cards = document.querySelectorAll('.paper-card');
    const positions = [
        { top: 50, left: 6 },
        { top: 30, right: 8 },
        { top: 420, left: 5 },
        { top: 450, right: 10 },
        { top: 790, left: 25 }
    ];

    cards.forEach((card, index) => {
        const pos = positions[index];
        const randomRotate = (Math.random() * 8 - 4).toFixed(1);

        card.style.transform = `rotate(${randomRotate}deg)`;
        card.style.top = `${pos.top}px`;

        if (pos.left !== undefined) {
            const variation = Math.floor(Math.random() * 60) - 30;
            card.style.left = `${pos.left + variation / 10}vw`;
        }
        if (pos.right !== undefined) {
            const variation = Math.floor(Math.random() * 60) - 30;
            card.style.right = `${pos.right + variation / 10}vw`;
        }
    });


    // 3. Navigation et agrandissement (overlay sombre + flou géré en CSS)
    // Le z-index de la carte agrandie est géré par la classe .expanded (CSS),
    // donc on ne touche plus à style.zIndex ici.
    const overlay = document.getElementById('pageOverlay');
    const navButtons = document.querySelectorAll('.nav-btn');

    function closeAllExpanded() {
        cards.forEach(c => c.classList.remove('expanded'));
        overlay.classList.remove('active');
    }

    function toggleCard(card) {
        const wasExpanded = card.classList.contains('expanded');
        closeAllExpanded();
        if (!wasExpanded) {
            card.classList.add('expanded');
            overlay.classList.add('active');
        }
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetCard = document.getElementById(btn.getAttribute('data-target'));
            if (targetCard) toggleCard(targetCard);
        });
    });

    cards.forEach(card => {
        const toggleBtn = card.querySelector('.expand-toggle');
        toggleBtn.addEventListener('mousedown', (e) => e.stopPropagation()); // pas de drag depuis le bouton
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCard(card);
        });
    });

    overlay.addEventListener('click', closeAllExpanded);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllExpanded();
    });


    // 4. Animation PS3 et étoiles filantes en arrière-plan
    const canvas = document.getElementById('ps3Canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let step = 0;
    const shootingStars = [];
    for (let i = 0; i < 6; i++) {
        shootingStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.5,
            length: Math.random() * 80 + 40,
            speed: Math.random() * 4 + 3,
            opacity: Math.random() * 0.7 + 0.3
        });
    }

    function drawBackground() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, '#0a0a14');
        bgGradient.addColorStop(1, '#020205');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const lines = 12;
        for (let i = 0; i < lines; i++) {
            ctx.beginPath();
            ctx.lineWidth = 2.5;

            const alpha = (i + 1) / lines * 0.35;
            ctx.strokeStyle = i % 2 === 0
                ? `rgba(60, 140, 255, ${alpha})`
                : hexToRgba(randomPalette.accent, alpha);

            const yOffset = (canvas.height / lines) * i + Math.sin(step * 0.02 + i) * 30;

            for (let x = 0; x <= canvas.width; x += 30) {
                const y = yOffset
                    + Math.sin(x * 0.003 + step * 0.03 + i * 0.5) * 60
                    + Math.cos(x * 0.001 - step * 0.02) * 40;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        ctx.lineWidth = 2;
        shootingStars.forEach(star => {
            ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(star.x - star.length, star.y - star.length * 0.5);
            ctx.stroke();

            star.x += star.speed;
            star.y += star.speed * 0.5;

            if (star.x > canvas.width + 100 || star.y > canvas.height + 100) {
                star.x = Math.random() * -200;
                star.y = Math.random() * (canvas.height * 0.4);
            }
        });

        step += 1.5;
        requestAnimationFrame(drawBackground);
    }

    drawBackground();


    // 5. Glisser-déposer des cartes
    let topZIndex = 10;

    cards.forEach(card => {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        card.addEventListener('mousedown', (e) => {
            if (card.classList.contains('expanded')) return;
            if (e.target.closest('input, textarea, button')) return; // ne pas bloquer les champs du formulaire

            isDragging = true;
            topZIndex++;
            card.style.zIndex = topZIndex;

            startX = e.clientX;
            startY = e.clientY;

            const rect = card.getBoundingClientRect();
            const parentRect = card.parentElement.getBoundingClientRect();
            initialX = rect.left - parentRect.left;
            initialY = rect.top - parentRect.top;

            card.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            card.style.left = `${initialX + e.clientX - startX}px`;
            card.style.top = `${initialY + e.clientY - startY}px`;
            card.style.right = 'auto';
        });

        window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            card.style.cursor = '';
        });
    });


    // 6. Formulaire de contact
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            formMessage.style.display = 'block';
            contactForm.reset();
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 4000);
        });
    }
});
