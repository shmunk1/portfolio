// Script partagé par toutes les pages
const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;

// ── Préférences ──────────────────────────────────
const PREFS_KEY = 'portfolio-prefs';
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; } catch { return {}; }
}
function savePref(key, value) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify({ ...loadPrefs(), [key]: value })); } catch {}
}
const prefs = loadPrefs();

// ── Curseur personnalisé (souris uniquement) ─────
let cursor = null;
function setCursor(on) {
  root.classList.toggle('cursor-on', on);
  cursor.hidden = !on;
}
if (finePointer) {
  cursor = document.createElement('div');
  cursor.id = 'cursor';
  cursor.innerHTML = '<div class="ring"></div><div class="dot"></div>';
  document.body.append(cursor);
  const dot = cursor.querySelector('.dot'), ring = cursor.querySelector('.ring');
  let mx = -200, my = -200, rx = -200, ry = -200;
  dot.style.left = dot.style.top = '-200px';
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  (function animRing() {
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();
  const HOVERABLE = 'a, button, label, .chip, .zoomable';
  document.addEventListener('mouseover', e => {
    document.body.classList.toggle('cursor-hover', !!e.target.closest(HOVERABLE));
  });
  setCursor(!prefs.cursorOff);
}

// ── Apparition au scroll ─────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Vidéos de démo : lecture seulement quand visibles ─
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause());
  }, { threshold: 0.3 });
  document.querySelectorAll('video[loop]').forEach(v => videoObserver.observe(v));
}

// ── Nav réduite au scroll + bouton retour en haut ─
const nav = document.querySelector('nav');
document.body.insertAdjacentHTML('beforeend', `
  <button id="back-top" aria-label="Retour en haut"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg></button>
  <button id="settings-btn" aria-label="Préférences" aria-expanded="false" aria-controls="settings-panel"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
  <div id="settings-panel">
    <div class="settings-title">Préférences</div>
    ${finePointer ? '<div class="settings-row"><label for="cursor-toggle">Curseur personnalisé</label><span class="toggle"><input type="checkbox" id="cursor-toggle"><span class="toggle-slider"></span></span></div>' : ''}
    <div class="settings-row"><label for="light-toggle">Mode clair</label><span class="toggle"><input type="checkbox" id="light-toggle"><span class="toggle-slider"></span></span></div>
  </div>`);

const backTop = document.getElementById('back-top');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', scrollY > 60);
  backTop.classList.toggle('visible', scrollY > 350);
}, { passive: true });
backTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

// ── Panneau de préférences ───────────────────────
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
function togglePanel(open) {
  settingsPanel.classList.toggle('open', open);
  settingsBtn.setAttribute('aria-expanded', open);
}
settingsBtn.addEventListener('click', e => {
  e.stopPropagation();
  togglePanel(!settingsPanel.classList.contains('open'));
});
document.addEventListener('click', e => { if (!settingsPanel.contains(e.target)) togglePanel(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') togglePanel(false); });

const lightToggle = document.getElementById('light-toggle');
lightToggle.checked = root.classList.contains('light');
lightToggle.addEventListener('change', () => {
  root.classList.toggle('light', lightToggle.checked);
  savePref('light', lightToggle.checked);
});
const cursorToggle = document.getElementById('cursor-toggle');
if (cursorToggle) {
  cursorToggle.checked = !prefs.cursorOff;
  cursorToggle.addEventListener('change', () => {
    setCursor(cursorToggle.checked);
    savePref('cursorOff', !cursorToggle.checked);
  });
}

// ── Transition entre pages ───────────────────────
document.addEventListener('click', e => {
  const link = e.target.closest('a[href]');
  if (!link || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0 || reducedMotion) return;
  const href = link.getAttribute('href');
  if (/^(#|https?:|mailto:|tel:)/.test(href) || link.target || link.hasAttribute('download')) return;
  e.preventDefault();
  document.body.classList.add('page-out');
  setTimeout(() => { location.href = href; }, 230);
});
// Le bouton « retour » peut restaurer la page telle qu'on l'a quittée, donc masquée
window.addEventListener('pageshow', () => document.body.classList.remove('page-out'));

// ── Inclinaison des cartes projet ────────────────
if (finePointer && !reducedMotion) {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      card.style.transform = `perspective(800px) rotateX(${-(y / r.height) * 8}deg) rotateY(${(x / r.width) * 8}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ── Lightbox ─────────────────────────────────────
const zoomables = [...document.querySelectorAll('.visuel-img-wrap, .post-item')].filter(z => z.querySelector('img'));
if (zoomables.length) {
  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="lightbox" aria-label="Image agrandie">
      <button id="lightbox-close" aria-label="Fermer">✕</button>
      <button id="lightbox-prev" aria-label="Image précédente"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
      <img id="lightbox-img" alt="" />
      <button id="lightbox-next" aria-label="Image suivante"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
    </dialog>`);
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const images = zoomables.map(z => z.querySelector('img'));
  let current = 0;

  const show = i => {
    current = (i + images.length) % images.length;
    lightboxImg.src = images[current].src;
    lightboxImg.alt = images[current].alt;
  };
  const open = i => {
    show(i);
    lightbox.showModal();
    // Un <dialog> passe au-dessus de tout : le curseur doit le suivre pour rester visible
    if (cursor) lightbox.append(cursor);
  };

  zoomables.forEach((z, i) => {
    z.classList.add('zoomable');
    z.tabIndex = 0;
    z.setAttribute('role', 'button');
    z.setAttribute('aria-label', `Agrandir : ${images[i].alt}`);
    z.addEventListener('click', () => open(i));
    z.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  document.getElementById('lightbox-close').addEventListener('click', () => lightbox.close());
  document.getElementById('lightbox-prev').addEventListener('click', () => show(current - 1));
  document.getElementById('lightbox-next').addEventListener('click', () => show(current + 1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('close', () => { if (cursor) document.body.append(cursor); });
  lightbox.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
}
