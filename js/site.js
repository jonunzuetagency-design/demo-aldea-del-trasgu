/* Aldea del Trasgu · v2 — interacciones propias, sin dependencias obligatorias */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesk = () => innerWidth > 900;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /* ---------- WhatsApp con texto prellenado ---------- */
  const waText = encodeURIComponent('Hola, me gustaría consultar disponibilidad en Aldea del Trasgu.\nFechas: \nPersonas: ');
  $$('[data-wa]').forEach(a => { a.href = 'https://wa.me/34640207832?text=' + waText; a.target = '_blank'; a.rel = 'noopener'; });

  /* ---------- Lenis (solo escritorio, sin reduced motion) ---------- */
  let lenis = null;
  const startLenis = () => {
    if (RM || !window.Lenis || matchMedia('(pointer: coarse)').matches) return;
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const el = $(id); if (!el) return; e.preventDefault(); closeMenu(); lenis.scrollTo(el, { offset: 0 });
    }));
  };

  /* ---------- Nav ---------- */
  const nav = $('#nav'); let lastY = 0;
  const navTick = y => {
    nav.classList.toggle('is-solid', y > 40);
    const hide = y > lastY && y > 500 && !document.body.classList.contains('menu-open');
    nav.classList.toggle('is-hidden', hide);
    lastY = y;
  };

  /* ---------- Menú móvil ---------- */
  const burger = $('#burger'), menu = $('#menu');
  function closeMenu() {
    if (!menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open'); lenis && lenis.start();
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 800);
  }
  burger.addEventListener('click', () => {
    if (menu.classList.contains('is-open')) return closeMenu();
    menu.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    burger.setAttribute('aria-expanded', 'true'); document.body.classList.add('menu-open'); lenis && lenis.stop();
  });
  $$('#menu a').forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Botones: el relleno nace donde entra el cursor ---------- */
  $$('.btn').forEach(b => b.addEventListener('pointerenter', e => {
    const r = b.getBoundingClientRect();
    b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* ---------- Reveals con clip-path (escalonados por grupo) ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, sibs = $$('[data-reveal]', el.parentElement).filter(s => !s.classList.contains('in'));
    const i = Math.max(0, sibs.indexOf(el));
    el.style.setProperty('--d', Math.min(i, 6) * 0.09 + 's');
    el.classList.add('in'); io.unobserve(el);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  $$('[data-reveal]').forEach(el => io.observe(el));

  /* ---------- Partir en palabras (respeta <i>) ---------- */
  function splitWords(el, wrap) {
    const out = []; let n = 0;
    const walk = (node, italic) => {
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(tok => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            frag.appendChild(wrap(tok, n++, italic, out));
          });
          ch.replaceWith(frag);
        } else if (ch.nodeType === 1) walk(ch, ch.tagName === 'I' || italic);
      });
    };
    walk(el, false); return out;
  }
  const fills = $$('[data-words]').map(el => ({
    el, words: splitWords(el, (t, i, it, out) => { const s = document.createElement('span'); s.className = 'w'; s.textContent = t; out.push(s); return s; })
  }));
  if (RM) document.documentElement.classList.add('no-words');

  // Reseñas: palabras con máscara
  $$('.q blockquote').forEach(bq => splitWords(bq, (t, i) => {
    const w = document.createElement('span'); w.className = 'wd'; w.style.setProperty('--i', i);
    const s = document.createElement('span'); s.textContent = t; w.appendChild(s); return w;
  }));

  /* ---------- Contadores ---------- */
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; cio.unobserve(en.target);
    const el = en.target, to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    if (RM) return; const t0 = performance.now(), dur = 1400;
    const step = now => {
      const p = clamp((now - t0) / dur), v = to * (1 - Math.pow(1 - p, 4));
      el.textContent = v.toFixed(dec).replace('.', ','); if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- El trasgu que se asoma ---------- */
  const bubble = $('#bubble'); let bubT;
  const pio = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { setTimeout(() => en.target.classList.add('up'), 900); pio.unobserve(en.target); }
  }), { threshold: 1, rootMargin: '0px 0px -15% 0px' });
  $$('.peek').forEach(p => {
    pio.observe(p);
    $('button', p).addEventListener('click', () => {
      $('p', bubble).textContent = p.dataset.peek;
      bubble.hidden = false; bubble.style.animation = 'none'; bubble.offsetHeight; bubble.style.animation = '';
      clearTimeout(bubT); bubT = setTimeout(() => bubble.hidden = true, 9000);
    });
  });
  $('button', bubble).addEventListener('click', () => bubble.hidden = true);

  /* ---------- Habitaciones: scroll horizontal anclado ---------- */
  const rooms = $('.rooms'), track = $('#roomsTrack'), bar = $('#roomsBar');
  let roomsDist = 0;
  const layoutRooms = () => {
    if (isDesk() && !RM) {
      rooms.classList.add('is-pinned'); rooms.classList.remove('no-pin');
      roomsDist = Math.max(0, track.scrollWidth - innerWidth);
      rooms.style.height = (innerHeight + roomsDist) + 'px';
    } else {
      rooms.classList.remove('is-pinned'); rooms.classList.add('no-pin');
      rooms.style.height = ''; track.style.transform = ''; roomsDist = 0;
    }
  };

  /* ---------- Entorno: mar / montaña ---------- */
  const split = $('.world__split'), sw = $('.switch');
  const setSide = side => {
    split.dataset.active = side; sw.classList.toggle('is-mount', side === 'mount');
    $$('button', sw).forEach(b => b.setAttribute('aria-selected', b.dataset.side === side));
  };
  $$('button', sw).forEach(b => b.addEventListener('click', () => setSide(b.dataset.side)));
  $$('.side', split).forEach(s => s.addEventListener('click', () => { if (isDesk()) setSide(s.dataset.side); }));
  // swipe en móvil
  let sx = null;
  split.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
  split.addEventListener('touchend', e => {
    if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) setSide(dx < 0 ? 'mount' : 'sea');
  });

  /* ---------- Galería en bucle (auto + arrastre + pausa) ---------- */
  const PICS = [
    ['aldea-montana', 'Fachadas rojas y la sierra'], ['fuente', 'La fuente del patio'], ['hab-ocre', 'Habitación en ocre'],
    ['fabada', 'Fabada'], ['jardin-patio', 'El patio interior'], ['ribadesella', 'Ribadesella'],
    ['hab-azul', 'Habitación azul'], ['terraza-bar', 'La terraza del bar'], ['lago-enol', 'Lago Enol'],
    ['aldea-flores', 'Hortensias en la fachada'], ['comedor', 'El comedor'], ['balcon-jardin', 'Desde el balcón'],
    ['hab-detalle', 'Rincón de lectura'], ['puente-cangas', 'Cangas de Onís'], ['prado', 'El prado'],
    ['queso', 'Quesos asturianos'], ['picos', 'Picos de Europa'], ['aldea-fachada', 'La entrada']
  ];
  const reel = $('#reel'), rtrack = $('#reelTrack');
  const mk = (p, i) => `<a class="reel__item" href="galeria.html#${p[0]}" draggable="false" data-i="${i}"><img src="img/${p[0]}-t.webp" alt="${p[1]}" loading="lazy" draggable="false" width="900" height="600"></a>`;
  rtrack.innerHTML = PICS.map(mk).join('') + PICS.map(mk).join('').replaceAll('<a ', '<a aria-hidden="true" tabindex="-1" ');
  let rx = 0, rv = RM ? 0 : 0.45, hover = false, drag = null, moved = 0, half = 0;
  const measure = () => { half = rtrack.scrollWidth / 2; };
  addEventListener('load', measure); setTimeout(measure, 1500);
  reel.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
  reel.addEventListener('pointerleave', () => { hover = false; });
  reel.addEventListener('pointerdown', e => {
    drag = { x: e.clientX, y: e.clientY, rx, id: e.pointerId, lock: null }; moved = 0;
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (drag.lock == null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      drag.lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (drag.lock === 'x') { reel.classList.add('is-drag'); try { reel.setPointerCapture(drag.id); } catch (_) {} }
    }
    if (drag.lock === 'x') { rx = drag.rx + dx; moved = Math.abs(dx); }
  });
  const endDrag = () => { if (!drag) return; drag = null; reel.classList.remove('is-drag'); };
  addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
  rtrack.addEventListener('click', e => { if (moved > 8) { e.preventDefault(); moved = 0; } });
  rtrack.addEventListener('dragstart', e => e.preventDefault());
  let reelVisible = true;
  new IntersectionObserver(([en]) => reelVisible = en.isIntersecting).observe(reel);

  /* ---------- Reseñas ---------- */
  const qs = $$('.q'), qBar = $('#qBar'), qNow = $('#qNow');
  let qi = 0, qT = 0, qPause = false; const Q_DUR = 7000;
  const showQ = n => {
    const prev = qs[qi]; qi = (n + qs.length) % qs.length; if (prev === qs[qi]) return;
    prev.classList.remove('is-on'); prev.classList.add('is-out');
    setTimeout(() => prev.classList.remove('is-out'), 700);
    qs[qi].classList.add('is-on'); qNow.textContent = String(qi + 1).padStart(2, '0'); qT = 0;
  };
  $('#qNext').addEventListener('click', () => showQ(qi + 1));
  $('#qPrev').addEventListener('click', () => showQ(qi - 1));
  const stage = $('.voices__stage');
  stage.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') qPause = true; });
  stage.addEventListener('pointerleave', () => qPause = false);
  let qsx = null;
  stage.addEventListener('touchstart', e => qsx = e.touches[0].clientX, { passive: true });
  stage.addEventListener('touchend', e => { if (qsx == null) return; const dx = e.changedTouches[0].clientX - qsx; qsx = null; if (Math.abs(dx) > 45) showQ(qi + (dx < 0 ? 1 : -1)); });
  let voicesVisible = false;
  new IntersectionObserver(([en]) => voicesVisible = en.isIntersecting, { threshold: .25 }).observe($('.voices'));

  /* ---------- Bucle de scroll: todo se lee aquí ---------- */
  const umbral = $('.umbral'), uFrame = $('.umbral__frame'), uImg = $('.umbral__frame img');
  const uL = $('.umbral__w--l'), uR = $('.umbral__w--r');
  const gStage = $('.garden__stage'), gImg = $('.garden__img'), gCopy = $('.garden__copy');
  const legendCap = $('.legend__cap'), legend = $('.legend');
  const closeImg = $('.close__img img'), closeSec = $('.close');
  const prog = (el, startOff = 0) => { // 0 cuando el top toca arriba, 1 cuando el bottom toca abajo
    const r = el.getBoundingClientRect(), total = r.height - innerHeight;
    return total <= 0 ? 0 : clamp((-r.top + startOff) / total);
  };
  const vis = el => { const r = el.getBoundingClientRect(); return r.bottom > -100 && r.top < innerHeight + 100; };

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const y = scrollY;
    navTick(y);

    // Umbral: el arco se abre hasta pantalla completa
    if (!RM && vis(umbral)) {
      const p = ease(clamp(prog(umbral) / 0.8));
      const desk = isDesk();
      const is = (desk ? 38 : 16) * (1 - p) + (desk ? 2.5 : 0) * p, it = (desk ? 22 : 18) * (1 - p) + (desk ? 4 : 0) * p;
      uFrame.style.clipPath = `inset(${it}% ${is}% 0% ${is}% round ${(1 - p) * (desk ? 40 : 46) + p * (desk ? 1 : 0)}vw ${(1 - p) * (desk ? 40 : 46) + p * (desk ? 1 : 0)}vw 0 0)`;
      uImg.style.transform = `scale(${1.15 - 0.15 * p})`;
      const off = p * (desk ? 40 : 60);
      uL.style.setProperty('--tx-l', `${-off}vw`); uR.style.setProperty('--tx-r', `${off}vw`);
      uL.style.opacity = uR.style.opacity = String(1 - clamp(p * 1.6));
    }

    // Texto que se rellena al leer
    if (!RM) fills.forEach(f => {
      if (!vis(f.el)) return;
      const r = f.el.getBoundingClientRect();
      const p = clamp((innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.35));
      const n = Math.round(p * f.words.length);
      f.words.forEach((w, i) => w.classList.toggle('on', i < n));
    });

    // Habitaciones en horizontal
    if (roomsDist && vis(rooms)) {
      const p = prog(rooms);
      track.style.transform = `translate3d(${-p * roomsDist}px,0,0)`;
      bar.style.transform = `scaleX(${p})`;
    }

    // Jardín: el círculo se abre desde la fuente
    if (!RM && vis(gStage)) {
      const p = ease(clamp(prog(gStage) / 0.75));
      gImg.style.setProperty('--cr', (16 + p * 64) + '%');
      gImg.style.setProperty('--gs', String(1.25 - p * 0.25));
      gImg.style.setProperty('--go', String(clamp((p - .55) / .45)));
      gCopy.style.setProperty('--tc', String(clamp((p - .6) / .4)));
    }

    // Gorro que se dibuja
    if (!RM && vis(legend)) {
      const r = legend.getBoundingClientRect();
      legendCap.style.setProperty('--draw', String(1 - clamp((innerHeight - r.top) / (innerHeight * 0.7))));
    }

    // Cierre: parallax suave
    if (!RM && vis(closeSec)) {
      const r = closeSec.getBoundingClientRect();
      closeImg.style.setProperty('--py', `${(r.top / innerHeight) * -6 - 6}%`);
    }

    // Galería en bucle
    if (reelVisible && half) {
      if (!drag && !hover) rx -= rv * dt * 60;
      if (rx <= -half) { rx += half; if (drag) drag.rx += half; }
      if (rx > 0) { rx -= half; if (drag) drag.rx -= half; }
      rtrack.style.transform = `translate3d(${rx}px,0,0)`;
    }

    // Reseñas: autoplay
    if (voicesVisible && !qPause && !RM) {
      qT += dt * 1000; if (qT >= Q_DUR) showQ(qi + 1);
      qBar.style.transform = `scaleX(${clamp(qT / Q_DUR)})`;
    }
    requestAnimationFrame(frame);
  }

  const init = () => {
    layoutRooms(); measure(); startLenis();
    requestAnimationFrame(frame);
  };
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { layoutRooms(); measure(); }, 150); });
  init();
  addEventListener('load', () => { layoutRooms(); measure(); });
  document.fonts && document.fonts.ready.then(() => { layoutRooms(); measure(); });
})();
