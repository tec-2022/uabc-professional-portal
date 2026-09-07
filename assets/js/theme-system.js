(() => {
  'use strict';

  const ROOT = document.documentElement;
  const THEME_META = 'meta[name="theme-color"]';
  const CARD_HOSTS = [
    '#positionsList','#educationList','#moreSections','#upcomingEvents','#pastEvents',
    '#pubsContainer','#projectsGrid','#episodesGrid','#postsList','#latestPost','#contactCards'
  ].join(',');

  const INTENTIONAL_COLOR = /(?:^|\s)(?:text-white(?:\/\d+)?|text-(?:primary|accent|blue|red|green|purple|teal)-(?:100|200|300|400|500|600|700|800|900)|dark:text-(?:white|primary|accent|blue|red|green|purple|teal)-(?:100|200|300|400|500|600|700|800|900)|bg-(?:primary|accent|blue|red|green|purple|teal|black)-)/;

  function storedTheme() {
    try { return localStorage.getItem('theme') || 'light'; }
    catch { return 'light'; }
  }

  function syncThemeState() {
    const dark = ROOT.classList.contains('dark');
    ROOT.style.colorScheme = dark ? 'dark' : 'light';
    const meta = document.querySelector(THEME_META);
    if (meta) meta.setAttribute('content', dark ? '#0b1220' : '#083321');
    const button = document.getElementById('themeBtn');
    if (button) {
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('title', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }
  }

  if (storedTheme() === 'dark') ROOT.classList.add('dark');
  else ROOT.classList.remove('dark');
  syncThemeState();

  function clearSemanticClasses(section) {
    section.querySelectorAll('.portal-profile-name,.portal-page-title,.portal-page-intro,.portal-section-heading,.portal-card-title,.portal-meta')
      .forEach(node => node.classList.remove('portal-profile-name','portal-page-title','portal-page-intro','portal-section-heading','portal-card-title','portal-meta'));
  }

  function isHome(section) {
    return Boolean(section.querySelector('[data-i18n="title_name"]'));
  }

  function findIntro(title, section) {
    if (!title) return null;
    let sibling = title.nextElementSibling;
    while (sibling && ['HR','DIV'].includes(sibling.tagName) && !sibling.matches('p')) sibling = sibling.nextElementSibling;
    if (sibling?.matches('p')) return sibling;

    const parent = title.parentElement;
    if (parent && parent !== section) {
      const p = [...parent.children].find(node => node.tagName === 'P' && !node.classList.contains('eyebrow'));
      if (p) return p;
    }
    return [...section.children].find(node => node.tagName === 'P') || null;
  }

  function insideCard(node) {
    if (node.closest(CARD_HOSTS)) return true;
    return Boolean(node.closest('article,.portal-card,.timeline-card,.uabc-card'));
  }

  function hasIntentionalColor(node) {
    const classes = typeof node.className === 'string' ? node.className : '';
    if (INTENTIONAL_COLOR.test(classes)) return true;
    return Boolean(node.closest(
      'button,[role="button"],.badge,.tag,[class~="text-white"],[class*="bg-primary-"],[class*="bg-accent-"],[class*="bg-blue-"],[class*="bg-red-"],[class*="bg-green-"],[class*="bg-purple-"],[class*="bg-teal-"]'
    ));
  }

  function decorateSection() {
    const app = document.getElementById('app');
    const section = app?.querySelector(':scope > section');
    if (!section) return;

    clearSemanticClasses(section);

    if (isHome(section)) {
      const name = section.querySelector('[data-i18n="title_name"]');
      if (name) name.classList.add('portal-profile-name');
    } else {
      const title = section.querySelector('h2');
      if (title) {
        title.classList.add('portal-page-title');
        const intro = findIntro(title, section);
        if (intro) intro.classList.add('portal-page-intro');
      }
    }

    section.querySelectorAll('h3').forEach(heading => {
      heading.classList.add(insideCard(heading) ? 'portal-card-title' : 'portal-section-heading');
    });
    section.querySelectorAll('h4').forEach(heading => heading.classList.add('portal-card-title'));

    section.querySelectorAll('.text-xs,.text-sm').forEach(node => {
      if (!node.matches('h1,h2,h3,h4,strong') && !hasIntentionalColor(node)) {
        node.classList.add('portal-meta');
      }
    });
  }

  function observeApp() {
    const app = document.getElementById('app');
    if (!app) return;
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        decorateSection();
      });
    };
    schedule();
    new MutationObserver(schedule).observe(app, { childList:true, subtree:true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      observeApp();
      syncThemeState();
    }, { once:true });
  } else {
    observeApp();
    syncThemeState();
  }

  new MutationObserver(syncThemeState).observe(ROOT, { attributes:true, attributeFilter:['class'] });
})();
