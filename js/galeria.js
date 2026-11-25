(() => {
  const $ = s => document.querySelector(s);
  const PICS = [
    ['aldea-montana', 'Las casas rojas con la sierra detrás', 'aldea', 542],
    ['fuente', 'La fuente del patio interior', 'jardin', 554],
    ['hab-ocre', 'Habitación en tonos ocre', 'hab', 556],
    ['fabada', 'Fabada', 'mesa', 675],
    ['jardin-patio', 'El patio, con la fuente en el centro', 'jardin', 855],
    ['aldea-prado', 'La aldea desde el prado', 'aldea', 675],
    ['hab-detalle', 'Rincón de lectura', 'hab', 837],
    ['comedor', 'El comedor del restaurante', 'mesa', 553],
    ['ribadesella', 'Ribadesella, a 5 km', 'entorno', 493],
    ['aldea-flores', 'Hortensias junto a la fachada', 'aldea', 493],
    ['hab-azul', 'Habitación azul con cama de forja', 'hab', 556],
    ['balcon-jardin', 'El jardín visto desde un balcón', 'jardin', 524],
    ['lago-enol', 'Lago Enol, Lagos de Covadonga', 'entorno', 680],
    ['terraza-bar', 'La terraza del bar comedor', 'mesa', 538],
    ['aldea-hortensias', 'Flores y fachadas rojas', 'aldea', 545],
    ['hab-doble', 'Habitación doble', 'hab', 675],
    ['jardin-camino', 'Camino de piedra hacia la fuente', 'jardin', 845],
    ['queso', 'Quesos asturianos', 'mesa', 675],
    ['puente-cangas', 'Puente romano de Cangas de Onís', 'entorno', 648],
    ['aldea-fachada', 'La entrada de la aldea', 'aldea', 531],
    ['hab-cuadros', 'Dormitorio con cuadros', 'hab', 447],
    ['prado', 'El prado con columpios', 'jardin', 678],
    ['postre', 'Postre', 'mesa', 716],
    ['covadonga', 'La Santa Cueva de Covadonga', 'entorno', 876],
    ['aldea-letrero', 'Los edificios de la aldea', 'aldea', 532],
    ['hab-calida', 'Dormitorio en tonos chocolate', 'hab', 410],
    ['picos', 'Picos de Europa', 'entorno', 493],
    ['aldea-montes', 'Pueblo de montaña del oriente', 'entorno', 675]
  ];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const waText = encodeURIComponent('Hola, me gustaría consultar disponibilidad en Aldea del Trasgu.\nFechas: \nPersonas: ');
  document.querySelectorAll('[data-wa]').forEach(a => { a.href = 'https://wa.me/34640207832?text=' + waText; a.target = '_blank'; a.rel = 'noopener'; });

  const grid = $('#grid');
  grid.innerHTML = PICS.map((p, i) => `<button class="g__item" data-i="${i}" data-c="${p[2]}" aria-label="Ampliar: ${p[1]}"><img src="img/${p[0]}-t.webp" alt="${p[1]}" width="900" height="${p[3]}" loading="${i < 6 ? 'eager' : 'lazy'}"><span>${p[1]}</span></button>`).join('');
  const items = [...grid.children];
  $('#gCount').textContent = PICS.length;

  const io = new IntersectionObserver(es => {
    let k = 0;
    es.forEach(en => { if (en.isIntersecting) { en.target.style.setProperty('--d', (k++ % 6) * 0.07 + 's'); en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -5% 0px', threshold: .08 });
  items.forEach(el => io.observe(el));

  // filtros
  let list = PICS.map((_, i) => i);
  document.querySelectorAll('.g__filters button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.g__filters button').forEach(x => x.setAttribute('aria-selected', x === b));
    const f = b.dataset.f;
    list = [];
    items.forEach((el, i) => {
      const on = f === 'all' || el.dataset.c === f;
      el.classList.toggle('off', !on);
      if (on) { list.push(i); el.classList.remove('in'); el.style.setProperty('--d', (list.length % 6) * 0.06 + 's'); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in'))); }
    });
    $('#gCount').textContent = list.length;
  }));

  // visor
  const lb = $('#lb'), img = $('#lbImg'), cap = $('#lbCap'), cnt = $('#lbCount');
  let cur = 0, lastFocus = null;
  const load = (i, dir) => {
    cur = (i + list.length) % list.length;
    const p = PICS[list[cur]];
    const set = () => {
      img.src = `img/${p[0]}.webp`; img.alt = p[1]; cap.textContent = p[1];
      cnt.textContent = `${String(cur + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
      history.replaceState(null, '', '#' + p[0]);
    };
    if (dir && !RM) {
      img.classList.add('is-swap'); img.classList.toggle('back', dir < 0);
      setTimeout(() => { set(); img.onload = () => requestAnimationFrame(() => img.classList.remove('is-swap', 'back')); if (img.complete) img.onload(); }, 260);
    } else set();
    [1, -1].forEach(d => { const q = PICS[list[(cur + d + list.length) % list.length]]; const pre = new Image(); pre.src = `img/${q[0]}.webp`; });
  };
  const open = (idx, ox, oy) => {
    lastFocus = document.activeElement;
    cur = Math.max(0, list.indexOf(idx)); if (list.indexOf(idx) < 0) { list = PICS.map((_, i) => i); cur = idx; }
    lb.style.setProperty('--ox', (ox ?? innerWidth / 2) + 'px'); lb.style.setProperty('--oy', (oy ?? innerHeight / 2) + 'px');
    load(cur); lb.hidden = false; document.body.classList.add('lb-open');
    requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add('is-open')));
    $('#lbClose').focus({ preventScroll: true });
  };
  const close = () => {
    lb.classList.remove('is-open'); document.body.classList.remove('lb-open');
    history.replaceState(null, '', location.pathname);
    setTimeout(() => { lb.hidden = true; }, RM ? 0 : 750);
    lastFocus && lastFocus.focus({ preventScroll: true });
  };
  items.forEach(el => el.addEventListener('click', e => open(+el.dataset.i, e.clientX || null, e.clientY || null)));
  $('#lbClose').addEventListener('click', close);
  $('#lbNext').addEventListener('click', () => load(cur + 1, 1));
  $('#lbPrev').addEventListener('click', () => load(cur - 1, -1));
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') load(cur + 1, 1);
    if (e.key === 'ArrowLeft') load(cur - 1, -1);
    if (e.key === 'Tab') { // foco dentro del visor
      const f = [...lb.querySelectorAll('button')]; const i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  // swipe
  let sx = null, sy = null;
  const st = $('#lbStage');
  st.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  st.addEventListener('touchend', e => {
    if (sx == null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) load(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    else if (dy > 90) close();
  });
  st.addEventListener('click', e => { if (e.target === st) close(); });

  // deep link desde la portada (#nombre)
  const h = decodeURIComponent(location.hash.slice(1));
  if (h) { const idx = PICS.findIndex(p => p[0] === h); if (idx >= 0) setTimeout(() => open(idx), 350); }
})();
