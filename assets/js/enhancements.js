(() => {
  'use strict';

  const routeToPath = {
    home: '/', eventos: '/eventos', publicaciones: '/publicaciones', investigacion: '/investigacion',
    docencia: '/docencia', blog: '/blog', galeria: '/galeria', podcast: '/podcast', contacto: '/contacto',
    privacidad: '/privacidad', cookies: '/cookies'
  };
  const pathToRoute = Object.fromEntries(Object.entries(routeToPath).map(([route, path]) => [path, route]));

  const routeFromPath = () => pathToRoute[location.pathname.replace(/\/$/, '') || '/'] || null;
  const cleanPath = route => routeToPath[route] || '/';

  function armRoute(route, mode = 'replace') {
    if (!route) return;
    const url = `${cleanPath(route)}#/${route}${location.search || ''}`;
    history[`${mode}State`]({ route }, '', url);
  }

  function cleanRoute(route) {
    if (!route) return;
    queueMicrotask(() => history.replaceState({ route }, '', `${cleanPath(route)}${location.search || ''}`));
  }

  const initialRoute = routeFromPath();
  if (initialRoute && !location.hash) armRoute(initialRoute, 'replace');

  document.addEventListener('DOMContentLoaded', () => {
    cleanRoute((location.hash || '').replace('#/', '') || initialRoute || 'home');

    document.addEventListener('click', event => {
      const anchor = event.target.closest('a[href^="#/"]');
      if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const route = anchor.getAttribute('href').replace('#/', '').toLowerCase();
      if (!routeToPath[route]) return;
      event.preventDefault();
      history.pushState({ route }, '', `${cleanPath(route)}#/${route}`);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      cleanRoute(route);
    });

    window.addEventListener('popstate', () => {
      const route = routeFromPath() || 'home';
      armRoute(route, 'replace');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      cleanRoute(route);
    });
  });
})();
(() => {
  'use strict';

  const BASE = 'https://prueba-pi-eight.vercel.app';
  const ROUTES = {
    home: ['Portal Académico · Dr. Eduardo Ahumada-Tello', 'Perfil académico, investigación, docencia y producción científica.','/'],
    eventos: ['Eventos académicos · Eduardo Ahumada-Tello', 'Conferencias, seminarios, talleres y actividades académicas.','/eventos'],
    publicaciones: ['Publicaciones · Eduardo Ahumada-Tello', 'Producción científica, artículos, libros y trabajos de congreso.','/publicaciones'],
    investigacion: ['Investigación · Eduardo Ahumada-Tello', 'Proyectos, líneas y colaboración de investigación.','/investigacion'],
    docencia: ['Docencia · Eduardo Ahumada-Tello', 'Cursos, materiales y trayectoria docente.','/docencia'],
    blog: ['Blog académico · Eduardo Ahumada-Tello', 'Notas y contenidos sobre investigación, tecnología y educación.','/blog'],
    galeria: ['Galería · Eduardo Ahumada-Tello', 'Registro visual de actividades académicas y profesionales.','/galeria'],
    podcast: ['Podcast · Eduardo Ahumada-Tello', 'Conversaciones sobre investigación, tecnología y educación.','/podcast'],
    contacto: ['Contacto · Eduardo Ahumada-Tello', 'Contacto para colaboración académica, asesoría y proyectos.','/contacto'],
    privacidad: ['Aviso de privacidad · Portal Académico', 'Aviso de privacidad del portal académico.','/privacidad'],
    cookies: ['Política de cookies · Portal Académico', 'Política de cookies del portal académico.','/cookies']
  };

  const route = () => {
    const hash = (location.hash || '').replace('#/', '').toLowerCase();
    if (ROUTES[hash]) return hash;
    const entry = Object.entries(ROUTES).find(([, value]) => value[2] === (location.pathname.replace(/\/$/, '') || '/'));
    return entry?.[0] || 'home';
  };

  function setMeta(selector, attr, value) {
    let node = document.querySelector(selector);
    if (!node) {
      node = document.createElement('meta');
      const match = selector.match(/meta\[(name|property)="([^"]+)"\]/);
      if (!match) return;
      node.setAttribute(match[1], match[2]);
      document.head.appendChild(node);
    }
    node.setAttribute(attr, value);
  }

  function applySeo() {
    const [title, description, path] = ROUTES[route()] || ROUTES.home;
    const canonicalUrl = `${BASE}${path}`;
    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }

  function ensureStructuredData() {
    if (document.getElementById('academic-person-schema')) return;
    const contacts = window.CMS_CONTENT?.home?.contacts || [];
    const sameAs = contacts.map(item => item?.href).filter(Boolean);
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'academic-person-schema';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Person',
      name: 'Eduardo Ahumada-Tello', jobTitle: 'Profesor Investigador',
      affiliation: {'@type':'CollegeOrUniversity','name':'Universidad Autónoma de Baja California'},
      url: BASE, sameAs
    });
    document.head.appendChild(script);
  }

  document.addEventListener('DOMContentLoaded', () => { applySeo(); ensureStructuredData(); });
  window.addEventListener('hashchange', applySeo);
  window.addEventListener('popstate', applySeo);
})();
(() => {
  'use strict';

  function optimizeMedia(root = document) {
    const images = [...root.querySelectorAll('img')];
    images.forEach((img, index) => {
      img.decoding = 'async';
      if (index > 0 && !img.hasAttribute('loading')) img.loading = 'lazy';
      if (!img.hasAttribute('referrerpolicy')) img.referrerPolicy = 'no-referrer-when-downgrade';
    });
    root.querySelectorAll('iframe').forEach(frame => {
      if (!frame.hasAttribute('loading')) frame.loading = 'lazy';
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    optimizeMedia();
    const app = document.getElementById('app');
    if (!app) return;
    new MutationObserver(mutations => {
      mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) optimizeMedia(node);
      }));
    }).observe(app, { childList:true, subtree:true });
  });
})();
(() => {
  'use strict';

  function ensureSkipLink() {
    if (document.querySelector('.skip-link')) return;
    const link = document.createElement('a');
    link.className = 'skip-link';
    link.href = '#app';
    link.textContent = 'Saltar al contenido principal';
    document.body.prepend(link);
    const app = document.getElementById('app');
    if (app && !app.hasAttribute('tabindex')) app.tabIndex = -1;
  }

  function ensureAnnouncer() {
    if (document.getElementById('routeAnnouncer')) return;
    const node = document.createElement('div');
    node.id = 'routeAnnouncer';
    node.className = 'sr-only';
    node.setAttribute('aria-live', 'polite');
    node.setAttribute('aria-atomic', 'true');
    document.body.appendChild(node);
  }

  function announceAndFocus() {
    const announcer = document.getElementById('routeAnnouncer');
    const heading = document.querySelector('#app h1, #app h2');
    if (announcer) announcer.textContent = heading?.textContent?.trim() || document.title;
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    document.querySelectorAll('.menu-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const active = href.endsWith(location.hash || '#/home') || link.classList.contains('active-menu-item');
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
  }

  function improveControls() {
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
      const rel = new Set((link.rel || '').split(/\s+/).filter(Boolean));
      rel.add('noopener'); rel.add('noreferrer'); link.rel = [...rel].join(' ');
    });
    document.querySelectorAll('img:not([alt])').forEach(img => img.alt = '');
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureSkipLink(); ensureAnnouncer(); improveControls();
    setTimeout(announceAndFocus, 100);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') document.getElementById('closeSidebarBtn')?.click();
      if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) {
        event.preventDefault(); document.getElementById('globalSearchButton')?.click();
      }
    });
  });
  window.addEventListener('hashchange', () => setTimeout(announceAndFocus, 60));
})();
(() => {
  'use strict';

  let index = [];
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

  function createUi() {
    if (document.getElementById('globalSearchButton')) return;
    const button = document.createElement('button');
    button.id = 'globalSearchButton';
    button.className = 'global-search-button';
    button.type = 'button';
    button.setAttribute('aria-label', 'Buscar en el portal');
    button.setAttribute('aria-keyshortcuts', '/');
    button.innerHTML = '<span aria-hidden="true">⌕</span><span>Buscar</span><kbd>/</kbd>';

    const dialog = document.createElement('dialog');
    dialog.id = 'globalSearchDialog';
    dialog.className = 'global-search-dialog';
    dialog.innerHTML = `
      <form method="dialog" class="search-panel">
        <div class="search-head">
          <label for="globalSearchInput">Buscar en publicaciones, investigación, docencia, blog y más</label>
          <button value="cancel" class="search-close" aria-label="Cerrar búsqueda">×</button>
        </div>
        <input id="globalSearchInput" class="search-input" type="search" autocomplete="off" placeholder="Escribe un término…">
        <div id="globalSearchResults" class="search-results" role="listbox"></div>
        <p class="search-help">Enter abre el primer resultado · Esc cierra</p>
      </form>`;
    document.body.append(button, dialog);

    const input = dialog.querySelector('#globalSearchInput');
    const results = dialog.querySelector('#globalSearchResults');

    button.addEventListener('click', () => { dialog.showModal(); setTimeout(() => input.focus(), 0); renderResults(''); });
    input.addEventListener('input', () => renderResults(input.value));
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        const first = results.querySelector('a');
        if (first) { event.preventDefault(); first.click(); }
      }
    });

    function renderResults(query) {
      const q = normalize(query.trim());
      const matches = (q ? index.filter(item => normalize(`${item.title} ${item.text} ${item.section}`).includes(q)) : index.slice(0, 10)).slice(0, 20);
      results.innerHTML = matches.length ? matches.map(item => `
        <a class="search-result" href="${escapeHtml(item.url || '/')}">
          <span class="search-section">${escapeHtml(item.sectionLabel || item.section || 'Portal')}</span>
          <strong>${escapeHtml(item.title || 'Contenido')}</strong>
          <span>${escapeHtml((item.text || '').slice(0, 180))}</span>
        </a>`).join('') : '<div class="search-empty">No encontramos coincidencias.</div>';
      results.querySelectorAll('a').forEach(link => link.addEventListener('click', () => dialog.close()));
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  document.addEventListener('DOMContentLoaded', async () => {
    createUi();
    try {
      const response = await fetch('/assets/data/search-index.json', { cache:'no-cache' });
      if (response.ok) index = await response.json();
    } catch { index = []; }
  });
})();
(() => {
  'use strict';
  if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;
  window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js').catch(() => {}));
})();
