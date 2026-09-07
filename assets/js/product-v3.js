(() => {
  'use strict';

  const config = window.PORTAL_CONFIG || {};
  const features = config.features || {};
  const profile = config.branding?.profile || {};
  const app = document.getElementById('app');
  if (!app) return;

  const language = () => (localStorage.getItem('lang') || 'es').toLowerCase();
  const localize = value => {
    if (value && typeof value === 'object') return value[language()] ?? value.es ?? value.en ?? '';
    return value ?? '';
  };

  function applyBranding() {
    const fields = {
      name: profile.name,
      title_name: profile.name,
      role: profile.role,
      university: profile.institution
    };
    for (const [key, value] of Object.entries(fields)) {
      if (!value) continue;
      document.querySelectorAll(`[data-i18n="${key}"]`).forEach(node => {
        node.textContent = localize(value);
      });
    }
  }

  function dataCount(path, fallback = 0) {
    let value = window.CMS_CONTENT;
    for (const key of path) value = value?.[key];
    return Array.isArray(value) ? value.length : fallback;
  }

  function ensureHomeSummary(section) {
    if (features.homeMetrics === false || !section.querySelector('[data-i18n="title_name"]')) return;
    const header = section.querySelector('header');
    if (!header || section.querySelector('.portal-home-summary')) return;

    const labels = language() === 'en'
      ? ['Publications','Research areas','Current courses','Upcoming events']
      : ['Publicaciones','Líneas de investigación','Cursos actuales','Próximos eventos'];
    const values = [
      dataCount(['publicaciones']),
      dataCount(['investigacion']),
      dataCount(['docencia','courses']),
      dataCount(['eventos','upcoming'])
    ];

    const metrics = document.createElement('section');
    metrics.className = 'portal-home-summary';
    metrics.setAttribute('aria-label', language() === 'en' ? 'Academic profile summary' : 'Resumen del perfil académico');
    metrics.innerHTML = values.map((value, index) => `
      <div class="portal-metric">
        <strong>${Number(value || 0).toLocaleString()}</strong>
        <span>${labels[index]}</span>
      </div>`).join('');

    const actions = document.createElement('div');
    actions.className = 'portal-home-actions';
    actions.innerHTML = language() === 'en'
      ? `<a class="portal-action primary" href="/publicaciones" data-v3-route="publicaciones">View publications</a>
         <a class="portal-action" href="/contacto" data-v3-route="contacto">Academic contact</a>
         <button class="portal-action" type="button" data-v3-print>Print profile</button>`
      : `<a class="portal-action primary" href="/publicaciones" data-v3-route="publicaciones">Ver publicaciones</a>
         <a class="portal-action" href="/contacto" data-v3-route="contacto">Contacto académico</a>
         <button class="portal-action" type="button" data-v3-print>Imprimir perfil</button>`;

    header.insertAdjacentElement('afterend', metrics);
    metrics.insertAdjacentElement('afterend', actions);
  }

  const emptyMessages = {
    positionsList:['Sin posiciones registradas','Cuando existan posiciones académicas se mostrarán aquí.'],
    educationList:['Sin formación registrada','La formación académica aparecerá en esta sección.'],
    upcomingEvents:['No hay eventos próximos','Los próximos eventos académicos aparecerán aquí cuando estén disponibles.'],
    pastEvents:['Sin eventos anteriores','El archivo de actividades se mostrará aquí.'],
    pubsContainer:['No hay publicaciones para mostrar','Prueba cambiando los filtros o la búsqueda.'],
    projectsGrid:['Sin proyectos disponibles','Los proyectos de investigación aparecerán en esta sección.'],
    episodesGrid:['Sin episodios disponibles','Los episodios del podcast aparecerán aquí.'],
    postsList:['Sin entradas publicadas','Las entradas del blog aparecerán aquí.'],
    contactCards:['Sin datos de contacto','Los medios de contacto aparecerán aquí.']
  };

  function visibleContent(container) {
    return [...container.children].some(child =>
      !child.classList.contains('portal-empty-state') &&
      getComputedStyle(child).display !== 'none' &&
      (child.textContent || '').trim()
    );
  }

  function ensureEmptyStates(section) {
    if (features.emptyStates === false) return;
    Object.entries(emptyMessages).forEach(([id, es]) => {
      const container = section.querySelector(`#${id}`);
      if (!container) return;
      const existing = container.querySelector(':scope > .portal-empty-state');
      if (visibleContent(container)) { existing?.remove(); return; }
      if (existing) return;
      const text = language() === 'en'
        ? ['Nothing to show yet','This section will update when content becomes available.']
        : es;
      const empty = document.createElement('div');
      empty.className = 'portal-empty-state';
      empty.innerHTML = `<div><span class="portal-empty-state__icon" aria-hidden="true">◇</span><strong>${text[0]}</strong><p>${text[1]}</p></div>`;
      container.appendChild(empty);
    });
  }

  function ensureCitationTools(section) {
    if (features.copyCitation === false) return;
    section.querySelectorAll('#pubsContainer > article, #pubsContainer > div').forEach(card => {
      if (card.querySelector('.portal-card-tools') || card.classList.contains('portal-empty-state')) return;
      const title = card.querySelector('h3,h4')?.textContent?.trim();
      if (!title) return;
      const toolRow = document.createElement('div');
      toolRow.className = 'portal-card-tools';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'portal-card-tool';
      button.textContent = language() === 'en' ? 'Copy reference' : 'Copiar referencia';
      button.addEventListener('click', async () => {
        const text = card.innerText.replace(/Copiar referencia|Copy reference/g,'').trim();
        try {
          await navigator.clipboard.writeText(text);
          button.dataset.state = 'done';
          button.textContent = language() === 'en' ? 'Copied' : 'Copiado';
          setTimeout(() => {
            button.dataset.state = '';
            button.textContent = language() === 'en' ? 'Copy reference' : 'Copiar referencia';
          }, 1600);
        } catch {
          button.textContent = language() === 'en' ? 'Could not copy' : 'No se pudo copiar';
        }
      });
      toolRow.appendChild(button);
      card.appendChild(toolRow);
    });
  }

  function ensureSectionStatus(section) {
    if (section.querySelector('.portal-inline-status[data-v3-status]')) return;
    const title = section.querySelector('.portal-page-title,h2');
    if (!title || section.querySelector('[data-i18n="title_name"]')) return;
    const status = document.createElement('span');
    status.className = 'portal-inline-status';
    status.dataset.v3Status = 'true';
    status.textContent = language() === 'en' ? 'Demo content' : 'Contenido demostrativo';
    title.insertAdjacentElement('afterend', status);
  }

  function decorate() {
    applyBranding();
    const section = app.querySelector(':scope > section');
    if (!section) return;
    ensureHomeSummary(section);
    ensureEmptyStates(section);
    ensureCitationTools(section);
    ensureSectionStatus(section);
  }

  document.addEventListener('click', event => {
    const routeLink = event.target.closest('[data-v3-route]');
    if (routeLink && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      const route = routeLink.dataset.v3Route;
      event.preventDefault();
      history.pushState({ route }, '', route === 'home' ? '/' : `/${route}`);
      window.dispatchEvent(new PopStateEvent('popstate', { state:{ route } }));
    }
    if (event.target.closest('[data-v3-print]')) window.print();
  });

  let timer = 0;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(decorate, 80);
  };
  new MutationObserver(schedule).observe(app, { childList:true, subtree:true });
  new MutationObserver(schedule).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  window.addEventListener('popstate', schedule);
  window.addEventListener('hashchange', schedule);
  window.addEventListener('storage', schedule);
  document.addEventListener('DOMContentLoaded', schedule, { once:true });
  schedule();
})();
