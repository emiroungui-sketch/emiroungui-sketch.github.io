(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Année du footer
  $('#year').textContent = new Date().getFullYear();

  // Deux ambiances : flammes pixel (flame) ou demi-teinte noir et blanc (mono)
  const root = document.documentElement, btn = $('#theme');
  let pal;
  const setTheme = t => { root.dataset.theme = t; btn.textContent = t === 'flame' ? '🔥' : '☁️'; pal = palette(t); try { localStorage.setItem('theme', t); } catch {} };
  btn.onclick = () => setTheme(root.dataset.theme === 'flame' ? 'mono' : 'flame');

  // Menu mobile
  $('#burger').onclick = () => $('#menu').classList.toggle('open');
  $$('#menu a').forEach(a => a.onclick = () => $('#menu').classList.remove('open'));

  // Effet machine à écrire
  const words = ['Étudiant en informatique', 'Développeur web en devenir', 'Futur ingénieur'];
  let w = 0, c = 0, del = false;
  (function type() {
    const word = words[w];
    $('#typed').textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(type, 1500); }
    if (del && c === 0) { del = false; w = (w + 1) % words.length; }
    c += del ? -1 : 1;
    setTimeout(type, del ? 40 : 80);
  })();

  // Apparition au scroll + barres de compétences + compteurs
  const countUp = el => {
    const target = +el.dataset.count; let n = 0;
    const t = setInterval(() => { el.textContent = ++n; if (n >= target) clearInterval(t); }, 300 / target + 60);
  };
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    $$('.skill', e.target).forEach(s => $('i', s).style.width = s.dataset.level + '%');
    $$('[data-count]', e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));

  // Filtres de projets
  $$('.chip').forEach(chip => chip.onclick = () => {
    $$('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter;
    $$('.card').forEach(card => card.classList.toggle('hide', f !== 'all' && card.dataset.cat !== f));
  });

  // Lien actif, barre de progression, bouton haut de page
  const links = $$('#menu a'), sections = links.map(a => $(a.getAttribute('href')));
  addEventListener('scroll', () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    $('#progress').style.width = (y / h * 100) + '%';
    $('#top').classList.toggle('show', y > 500);
    sections.forEach((s, i) => links[i].classList.toggle('active', s.offsetTop - 120 <= y && s.offsetTop + s.offsetHeight - 120 > y));
  }, { passive: true });
  $('#top').onclick = () => scrollTo({ top: 0 });

  // Formulaire de contact (validation + ouverture du client mail)
  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, st = $('#status');
    const nom = f.nom.value.trim(), email = f.email.value.trim(), msg = f.message.value.trim();
    if (!nom || !/^\S+@\S+\.\S+$/.test(email) || !msg) { st.textContent = '⚠️ Remplis correctement tous les champs.'; return; }
    location.href = `mailto:ton.email@exemple.com?subject=${encodeURIComponent('Contact portfolio - ' + nom)}&body=${encodeURIComponent(msg + '\n\n' + email)}`;
    st.textContent = '✅ Ton client mail va s\'ouvrir.';
    f.reset();
  });

  // Flammes pixel (canvas) : algorithme de feu classique, palette selon l'ambiance
  const cv = $('#fire'), ctx = cv.getContext('2d'), H = 56, MAX = 28;
  const PAL = {
    flame: [[0,0,0],[90,0,0],[200,20,20],[255,120,20],[255,190,60],[255,240,190]],
    mono: [[0,0,0],[50,50,50],[130,130,130],[210,210,210],[255,255,255],[255,255,255]]
  };
  function palette(name) {
    const s = PAL[name];
    return Array.from({ length: MAX + 1 }, (_, i) => {
      const p = i / MAX * (s.length - 1), k = Math.min(Math.floor(p), s.length - 2), t = p - k;
      return s[k].map((v, j) => v + (s[k + 1][j] - v) * t);
    });
  }
  let W, fire;
  const size = () => { W = Math.ceil(innerWidth / 6); cv.width = W; cv.height = H; fire = new Uint8Array(W * H); fire.fill(MAX, W * (H - 1)); };
  const step = () => {
    for (let x = 0; x < W; x++) for (let y = 1; y < H; y++) {
      const i = y * W + x, v = fire[i], r = Math.floor(Math.random() * 4);
      fire[Math.max(i - r + 1 - W, 0)] = v > 0 ? v - (r & 1) : 0;
    }
  };
  const draw = () => {
    const img = ctx.createImageData(W, H);
    for (let i = 0; i < fire.length; i++) {
      const v = fire[i], c = pal[v], o = i * 4;
      if (v) { img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255; }
    }
    ctx.putImageData(img, 0, 0);
  };
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  addEventListener('resize', size);

  let saved = null; try { saved = localStorage.getItem('theme'); } catch {}
  size();
  setTheme(saved === 'mono' ? 'mono' : 'flame');
  if (still) for (let i = 0; i < 80; i++) step();
  (function loop() { step(); draw(); if (!still) setTimeout(loop, 55); })();
})();