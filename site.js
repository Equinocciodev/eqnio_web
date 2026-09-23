// Equinoccio — interacciones del sitio

// Nav scroll state
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => {
    if (window.scrollY > 4) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Hamburger — mobile menu
const hamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');
function closeMobileMenu() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.classList.toggle('open');
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileMenu(); });
}

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Count up
const countIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.count || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = target * eased;
      el.textContent = decimals ? v.toFixed(decimals) : Math.round(v).toString().padStart(el.dataset.pad || 0, '0');
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = decimals ? target.toFixed(decimals) : target.toString().padStart(el.dataset.pad || 0, '0');
    };
    requestAnimationFrame(tick);
    countIO.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

// Cursor dot (hero only)
const dot = document.querySelector('.cursor-dot');
const hero = document.querySelector('.hero');
if (dot && hero && matchMedia('(pointer:fine)').matches) {
  hero.addEventListener('mouseenter', () => dot.classList.add('on'));
  hero.addEventListener('mouseleave', () => dot.classList.remove('on'));
  hero.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
  });
}

// Copy to clipboard
document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const v = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(v);
    } catch (_) {
      const t = document.createElement('textarea'); t.value = v; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (_) {}
      document.body.removeChild(t);
    }
    const orig = btn.textContent;
    btn.classList.add('copied');
    btn.textContent = 'COPIADO';
    setTimeout(() => { btn.classList.remove('copied'); btn.textContent = orig; }, 1600);
  });
});

// Form
document.querySelectorAll('form[data-form]').forEach(form => {
  const success = form.querySelector('.form-success');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Pretend post to /api/contact
    const data = Object.fromEntries(new FormData(form).entries());
    console.log('[/api/contact] payload', data);
    if (success) success.classList.add('show');
    form.querySelectorAll('input,textarea').forEach(i => i.value = '');
    setTimeout(() => success && success.classList.remove('show'), 6000);
  });
});

// ── Venezuela time (VET = UTC−4) ─────────────────────
function getVET() {
  const now = new Date();
  // VET is UTC-4, no daylight saving
  return new Date(now.getTime() - 4 * 60 * 60 * 1000);
}

// Live VET clock for hero block
const clockEl = document.querySelector('[data-utc]');
if (clockEl) {
  const update = () => {
    const vet = getVET();
    const hh = String(vet.getUTCHours()).padStart(2, '0');
    const mm = String(vet.getUTCMinutes()).padStart(2, '0');
    const ss = String(vet.getUTCSeconds()).padStart(2, '0');
    clockEl.textContent = `${hh}:${mm}:${ss}`;
  };
  update();
  setInterval(update, 1000);
}

// ── Theme: auto por hora VET + toggle manual ──────────
const themeBtns = document.querySelectorAll('[data-theme-toggle]');
(function () {
  const root = document.documentElement;

  function applyTheme(mode) {
    if (mode === 'dark') {
      root.removeAttribute('data-theme');
      themeBtns.forEach(b => { b.textContent = 'CLARO'; });
    } else {
      root.setAttribute('data-theme', 'light');
      themeBtns.forEach(b => { b.textContent = 'OSCURO'; });
    }
  }

  function autoTheme() {
    const h = getVET().getUTCHours();
    return (h >= 7 && h < 19) ? 'light' : 'dark';
  }

  const saved = localStorage.getItem('eqn-theme');
  const manual = localStorage.getItem('eqn-theme-manual') === '1';
  applyTheme(manual && saved ? saved : autoTheme());

  setInterval(() => {
    if (localStorage.getItem('eqn-theme-manual') !== '1') {
      applyTheme(autoTheme());
    }
  }, 60 * 1000);

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      const next = isLight ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem('eqn-theme', next);
      localStorage.setItem('eqn-theme-manual', '1');
    });
  });
})();

// Team banner — auto-scroll con navegación manual
const teamTrack = document.getElementById('team-track');
const teamPrev  = document.getElementById('team-prev');
const teamNext  = document.getElementById('team-next');
const teamPause = document.getElementById('team-pause');
if (teamTrack && teamPrev && teamNext && teamPause) {
  let manualX = 0;
  let isManual = false;
  const cards = () => teamTrack.querySelectorAll('.member');
  // Paso real entre tarjetas, medido del DOM en vez de calculado: así no depende
  // del box-sizing, de los bordes de 1px ni de un gap futuro. El `offsetWidth + 1`
  // anterior adelantaba 1px de más en cada paso y el desfase se acumulaba.
  const cardW = () => {
    const c = cards();
    if (c.length >= 2) return c[1].offsetLeft - c[0].offsetLeft;
    return c.length ? c[0].offsetWidth : 360;
  };
  // La pista lleva la lista duplicada para el bucle infinito: media vuelta es
  // exactamente la mitad de las tarjetas. Derivarlo del paso real evita el
  // arrastre de decimales que traía scrollWidth / 2.
  const half = () => cardW() * (cards().length / 2);

  function getAnimX() {
    const m = getComputedStyle(teamTrack).transform;
    if (m && m !== 'none') {
      const v = m.match(/matrix\((.+)\)/);
      if (v) return parseFloat(v[1].split(',')[4]) || 0;
    }
    return 0;
  }

  function enterManual() {
    if (isManual) return;
    // Alinear a la tarjeta más cercana. La animación CSS se detiene en una
    // posición fraccionaria arbitraria; sin este redondeo, toda navegación
    // posterior hereda ese desfase y las fotos quedan cortadas a la mitad.
    const w = cardW();
    manualX = w ? Math.round(getAnimX() / w) * w : getAnimX();
    teamTrack.style.animation = 'none';
    teamTrack.style.transform = `translateX(${manualX}px)`;
    isManual = true;
    teamPause.textContent = '▷';
  }

  function resume() {
    teamTrack.style.animation = '';
    teamTrack.style.transform = '';
    isManual = false;
    teamPause.textContent = 'II';
  }

  function navigate(dir) {
    enterManual();
    manualX += dir * -cardW();
    // loop: keep within first half
    if (manualX < -half()) manualX += half();
    if (manualX > 0) manualX -= half();
    teamTrack.style.transition = 'transform .4s ease';
    teamTrack.style.transform = `translateX(${manualX}px)`;
    setTimeout(() => teamTrack.style.transition = '', 420);
  }

  // El ancho de tarjeta es clamp() con vw: al rotar el móvil cambia y la
  // posición fijada en píxeles deja de caer en un borde de tarjeta.
  window.addEventListener('resize', () => {
    if (!isManual) return;
    const w = cardW();
    if (!w) return;
    manualX = Math.round(manualX / w) * w;
    teamTrack.style.transform = `translateX(${manualX}px)`;
  }, { passive: true });

  teamPrev.addEventListener('click', () => navigate(-1));
  teamNext.addEventListener('click', () => navigate(1));
  teamPause.addEventListener('click', () => isManual ? resume() : enterManual());
  teamTrack.addEventListener('mouseenter', () => { if (!isManual) teamTrack.classList.add('paused'); });
  teamTrack.addEventListener('mouseleave', () => { if (!isManual) teamTrack.classList.remove('paused'); });
  let teamTouch = 0;
  teamTrack.addEventListener('touchstart', e => { teamTouch = e.touches[0].clientX; }, { passive: true });
  teamTrack.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - teamTouch;
    if (Math.abs(dx) > 40) navigate(dx < 0 ? 1 : -1);
  });
}

// Casos carousel
const casosTrack = document.getElementById('casos-track');
const casosPrev  = document.getElementById('casos-prev');
const casosNext  = document.getElementById('casos-next');
if (casosTrack && casosPrev && casosNext) {
  const cardW = () => { const c = casosTrack.querySelector('.caso'); return c ? c.offsetWidth : 400; };
  casosPrev.addEventListener('click', () => casosTrack.scrollBy({ left: -cardW(), behavior: 'smooth' }));
  casosNext.addEventListener('click', () => casosTrack.scrollBy({ left:  cardW(), behavior: 'smooth' }));
  let isDown = false, startX = 0, scrollLeft = 0;
  casosTrack.addEventListener('mousedown',  e => { isDown = true; startX = e.pageX - casosTrack.offsetLeft; scrollLeft = casosTrack.scrollLeft; });
  casosTrack.addEventListener('mouseleave', () => isDown = false);
  casosTrack.addEventListener('mouseup',    () => isDown = false);
  casosTrack.addEventListener('mousemove',  e => { if (!isDown) return; e.preventDefault(); casosTrack.scrollLeft = scrollLeft - (e.pageX - casosTrack.offsetLeft - startX); });
  let casTouch = 0;
  casosTrack.addEventListener('touchstart', e => { casTouch = e.touches[0].clientX; }, { passive: true });
  casosTrack.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - casTouch;
    if (Math.abs(dx) > 40) casosTrack.scrollBy({ left: dx < 0 ? cardW() : -cardW(), behavior: 'smooth' });
  });
}

// Language toggle (placeholder — flips a tiny set of labels)
const i18n = {
  es: { nav_man: 'Misión', nav_cap: 'Capacidades', nav_eq: 'Equipo', nav_con: 'Contacto', cta: 'Iniciar conversación' },
  en: { nav_man: 'Mission', nav_cap: 'Capabilities', nav_eq: 'Team', nav_con: 'Contact', cta: 'Start a conversation' },
};
const langBtns = document.querySelectorAll('[data-lang]');
if (langBtns.length) {
  let lang = 'es';
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      lang = lang === 'es' ? 'en' : 'es';
      langBtns.forEach(b => { b.textContent = lang.toUpperCase(); });
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.dataset.i18n;
        if (i18n[lang][k]) el.textContent = i18n[lang][k];
      });
    });
  });
}
