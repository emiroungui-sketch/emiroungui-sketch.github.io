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
    const isMobile = window.innerWidth <= 900;
    const positions = isMobile
        ? [ // mobile : cartes en quinconce
            { top: 10, left: 3 },
            { top: 240, left: 22 },
            { top: 470, left: 5 },
            { top: 700, left: 24 },
            { top: 930, left: 10 }
        ]
        : [ // PC
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
        card.dataset.rot = randomRotate;
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


    // Plateformes : placement initial (top en px, left en vw)
    const platforms = document.querySelectorAll('.platform');
    const platSpots = isMobile
        ? [{ top: 1100, left: 8 }, { top: 980, left: 45 }, { top: 860, left: 12 }, { top: 740, left: 55 }, { top: 1040, left: 62 }, { top: 620, left: 20 }]
        : [{ top: 1090, left: 12 }, { top: 960, left: 28 }, { top: 1060, left: 46 }, { top: 900, left: 60 }, { top: 1000, left: 76 }, { top: 700, left: 38 }];
    platforms.forEach((p, i) => {
        p.style.top = `${platSpots[i % platSpots.length].top}px`;
        p.style.left = `${platSpots[i % platSpots.length].left}vw`;
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
            if (btn.dataset.target === 'card-contact') countContactClick(); // easter egg
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


    // 5. Glisser-déposer des cartes (souris et doigt, directement)
    let topZIndex = 10;

    [...cards, ...platforms].forEach(card => {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        card.addEventListener('pointerdown', (e) => {
            if (card.classList.contains('expanded')) return;
            if (e.target.closest('input, textarea, button, a')) return;

            isDragging = true;
            topZIndex++;
            card.style.zIndex = topZIndex;
            card.setPointerCapture(e.pointerId);

            startX = e.clientX;
            startY = e.clientY;
            const rect = card.getBoundingClientRect();
            const parentRect = card.parentElement.getBoundingClientRect();
            initialX = rect.left - parentRect.left;
            initialY = rect.top - parentRect.top;
            card.style.cursor = 'grabbing';
        });

        card.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            card.style.left = `${initialX + e.clientX - startX}px`;
            card.style.top = `${initialY + e.clientY - startY}px`;
            card.style.right = 'auto';
        });

        const stopDrag = () => {
            isDragging = false;
            card.style.cursor = '';
        };
        card.addEventListener('pointerup', stopDrag);
        card.addEventListener('pointercancel', stopDrag);
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


    // 7. Petit personnage : gravité, inertie, double saut, collisions avec les cartes
    const hero = document.getElementById('hero');
    const HW = 26, HH = 34;
    const GRAVITY = 0.55, JUMP = -13.5, ACCEL = 0.9, MAX_VX = 6;
    const input = { left: false, right: false };
    const hs = { x: 40, y: 0, vx: 0, vy: 0, onGround: false, face: 1, jumps: 2 };
    // Le sol = la ligne du footer (mesurée sur la page, indépendante du personnage)
    const footerEl = document.querySelector('footer');
    const floorY = () => footerEl.offsetTop;
    hs.y = floorY() - HH;

    function jump() {
        if (!hs.onGround && hs.jumps === 2) hs.jumps = 1; // tombé d'un rebord : un seul saut en l'air
        if (hs.jumps > 0) {
            hs.vy = JUMP;
            hs.jumps--;
        }
    }

    // Clavier (flèches, ZQSD, WASD, espace)
    const LEFT = ['arrowleft', 'q', 'a'], RIGHT = ['arrowright', 'd'], UP = ['arrowup', 'z', 'w', ' '];
    window.addEventListener('keydown', (e) => {
        if (!document.body.classList.contains('game-on')) return; // jeu verrouillé : les touches gardent leur rôle normal
        if (e.target.closest('input, textarea')) return;
        const k = e.key.toLowerCase();
        if (LEFT.includes(k)) input.left = true;
        else if (RIGHT.includes(k)) input.right = true;
        else if (UP.includes(k)) { if (!e.repeat) jump(); }
        else return;
        e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
        const k = e.key.toLowerCase();
        if (LEFT.includes(k)) input.left = false;
        if (RIGHT.includes(k)) input.right = false;
    });

    // Boutons tactiles
    document.querySelectorAll('#pad button').forEach(btn => {
        const key = btn.dataset.key;
        const release = () => {
            btn.classList.remove('pressed');
            if (key !== 'jump') input[key] = false;
        };
        btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            btn.classList.add('pressed');
            if (key === 'jump') jump();
            else input[key] = true;
        });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => btn.addEventListener(ev, release));
        btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });

    // Rectangles solides (cartes inclinées + plateformes), en coordonnées du document
    function getBoxes() {
        const sx = window.scrollX, sy = window.scrollY;
        return [...cards, ...platforms]
            .filter(c => !c.classList.contains('expanded'))
            .map(c => {
                const r = c.getBoundingClientRect();
                return {
                    cx: r.left + r.width / 2 + sx,
                    cy: r.top + r.height / 2 + sy,
                    hw: c.offsetWidth / 2,
                    hh: c.offsetHeight / 2,
                    a: (parseFloat(c.dataset.rot) || 0) * Math.PI / 180
                };
            });
    }

    // Collision rectangle (personnage) / rectangle incliné (carte) : théorème de l'axe séparateur
    function penetration(b) {
        const co = Math.cos(b.a), si = Math.sin(b.a);
        const dx = hs.x + HW / 2 - b.cx, dy = hs.y + HH / 2 - b.cy;
        let best = null;
        for (const [ax, ay] of [[1, 0], [0, 1], [co, si], [-si, co]]) {
            const rh = (HW / 2) * Math.abs(ax) + (HH / 2) * Math.abs(ay);
            const rc = b.hw * Math.abs(co * ax + si * ay) + b.hh * Math.abs(-si * ax + co * ay);
            const d = dx * ax + dy * ay;
            const pen = rh + rc - Math.abs(d);
            if (pen <= 0) return null;
            if (!best || pen < best.pen) best = { pen, nx: d >= 0 ? ax : -ax, ny: d >= 0 ? ay : -ay };
        }
        return best;
    }

    function resolveBox(b) {
        const m = penetration(b);
        if (!m) return;
        if (Math.abs(m.ny) > 0.7) {            // dessus ou dessous : poussée purement verticale
            hs.y += m.pen / m.ny;
            if (m.ny < 0) { hs.onGround = true; if (hs.vy > 0) hs.vy = 0; }
            else if (hs.vy < 0) hs.vy = 0;
        } else {                               // côté : poussée purement horizontale
            hs.x += m.pen / m.nx;
            if (m.nx * hs.vx < 0) hs.vx = 0;
        }
    }

    // Easter egg : 5 clics (espacés de 3 s maximum) sur « Contact » débloquent le mini-jeu
    let contactClicks = 0, contactTimer;
    const toast = document.getElementById('gameToast');

    function countContactClick() {
        if (document.body.classList.contains('game-on')) return;
        contactClicks++;
        clearTimeout(contactTimer);
        contactTimer = setTimeout(() => { contactClicks = 0; }, 3000);
        if (contactClicks >= 5) {
            contactClicks = 0;
            unlockGame();
        }
    }

    function unlockGame() {
        closeAllExpanded();
        document.body.classList.add('game-on');
        hs.x = 40; hs.y = floorY() - HH; hs.vx = 0; hs.vy = 0; hs.jumps = 2;
        const touch = window.matchMedia('(pointer: coarse)').matches;
        toast.textContent = touch
            ? 'MINI-JEU DÉBLOQUÉ — boutons ◀ ▶ ▲ en bas de l\'écran'
            : 'MINI-JEU DÉBLOQUÉ — flèches ou ZQSD pour bouger, ↑ / Espace pour sauter';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 5000);
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }

    let lastTime = performance.now();
    function heroLoop(now) {
        if (!document.body.classList.contains('game-on')) { lastTime = now; requestAnimationFrame(heroLoop); return; }
        const dt = Math.min((now - lastTime) / 16.67, 1.5);
        lastTime = now;

        const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
        if (dir) hs.face = dir;
        hs.vx += dir * ACCEL * dt;
        hs.vx *= Math.pow(dir ? 0.9 : 0.8, dt);
        hs.vx = Math.max(-MAX_VX, Math.min(MAX_VX, hs.vx));
        hs.vy = Math.min(hs.vy + GRAVITY * dt, 14);

        const boxes = getBoxes();
        const maxX = document.documentElement.clientWidth - HW;
        const ground = floorY();

        hs.x += hs.vx * dt;
        hs.y += hs.vy * dt;
        hs.onGround = false;
        for (let i = 0; i < 3; i++) boxes.forEach(resolveBox);
        hs.x = Math.max(0, Math.min(maxX, hs.x));

        if (!isFinite(hs.x) || !isFinite(hs.y)) { hs.x = 40; hs.y = ground - HH; hs.vx = hs.vy = 0; }
        if (hs.y + HH >= ground) { hs.y = ground - HH; hs.vy = 0; hs.onGround = true; }
        if (hs.y < 0) { hs.y = 0; hs.vy = 0; }
        if (hs.onGround) hs.jumps = 2;

        // Affichage
        hero.style.transform = `translate(${hs.x}px, ${hs.y}px) scaleX(${hs.face})`;
        hero.classList.toggle('walk', hs.onGround && Math.abs(hs.vx) > 0.6);

        // Caméra : suit le personnage quand il bouge près du bord de l'écran
        const top = window.scrollY, vh = window.innerHeight;
        const moving = dir || !hs.onGround || Math.abs(hs.vx) > 0.5;
        if (moving && !overlay.classList.contains('active') &&
            (hs.y < top + 90 || hs.y + HH > top + vh - 90)) {
            window.scrollTo(0, top + (hs.y - vh / 2 - top) * 0.08);
        }

        requestAnimationFrame(heroLoop);
    }
    requestAnimationFrame(heroLoop);
});
