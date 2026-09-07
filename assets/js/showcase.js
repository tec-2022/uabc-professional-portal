(() => {
  'use strict';

  const app = document.getElementById('app');
  let toastTimer;

  function ensureToast() {
    let toast = document.getElementById('portalDemoToast');
    if (toast) return toast;
    toast = document.createElement('div');
    toast.id = 'portalDemoToast';
    toast.className = 'portal-demo-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = '<strong>Enlace de ejemplo</strong><span>Esta acción forma parte de la demostración y se activa al personalizar la plantilla.</span>';
    document.body.appendChild(toast);
    return toast;
  }

  function showDemoToast() {
    const toast = ensureToast();
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function isPlaceholderLink(link) {
    const href = (link.getAttribute('href') || '').trim();
    return href === '#' || /10\.xxxx\//i.test(href) || /example\.com/i.test(href);
  }

  function decorateLinks(root = document) {
    root.querySelectorAll?.('a[href]').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (isPlaceholderLink(link)) {
        if (link.dataset.demoBound === 'true') return;
        link.dataset.demoBound = 'true';
        link.dataset.demoLink = 'true';
        link.setAttribute('aria-label', `${link.getAttribute('aria-label') || link.textContent.trim() || 'Enlace'} — demostración`);
        link.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          showDemoToast();
        });
        return;
      }

      if (/^https?:\/\//i.test(href)) {
        try {
          const url = new URL(href, window.location.href);
          if (url.origin !== window.location.origin) {
            link.target = link.target || '_blank';
            const rel = new Set((link.rel || '').split(/\s+/).filter(Boolean));
            rel.add('noopener');
            rel.add('noreferrer');
            link.rel = [...rel].join(' ');
          }
        } catch {}
      }
    });
  }

  function decorateSection() {
    if (!app) return;
    const section = app.querySelector(':scope > section');
    if (!section) return;
    section.classList.add('portal-enter');

    const heading = section.querySelector(':scope > h2, :scope > div:first-child > h2');
    if (heading) heading.classList.add('portal-section-title');

    section.querySelectorAll([
      '#pubsContainer > *','#projectsGrid > *','#episodesGrid > *','#postsList > *','#latestPost > *',
      '#contactCards > *','#upcomingEvents > *','#pastEvents > *'
    ].join(',')).forEach(card => card.classList.add('portal-card'));

    decorateLinks(section);
  }

  function updateLegacyCopyright() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const currentYear = new Date().getFullYear();
    [...sidebar.querySelectorAll('div')].forEach(node => {
      const text = node.textContent.trim();
      if (/^©\s*Copyright\s+Eduardo Ahumada-Tello\s+2021$/i.test(text)) {
        node.textContent = `© 2021–${currentYear} Eduardo Ahumada-Tello`;
        node.dataset.portalCopyright = 'true';
      }
    });
  }

  function enhance() {
    decorateLinks(document);
    decorateSection();
    updateLegacyCopyright();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhance, { once:true });
  } else {
    enhance();
  }

  if (app) {
    const observer = new MutationObserver(() => requestAnimationFrame(decorateSection));
    observer.observe(app, { childList:true, subtree:false });
  }
})();
