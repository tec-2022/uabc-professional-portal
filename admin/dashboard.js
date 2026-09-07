(() => {
  'use strict';
  const frame = document.getElementById('sourceFrame');
  const notice = document.querySelector('.notice');
  if (!frame || !notice) return;

  const text = value => {
    if (value == null) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (Array.isArray(value)) return value.map(text).join(' ');
    if (typeof value === 'object' && ('es' in value || 'en' in value)) return text(value.es ?? value.en);
    return '';
  };

  function scan(content) {
    let records = 0, empty = 0, bilingualMissing = 0;
    const media = new Set(), urls = new Set(), titles = new Map(), duplicates = [];
    const walk = (node, key = '') => {
      if (node == null || node === '') { empty++; return; }
      if (typeof node === 'string') {
        if (/^https?:\/\//i.test(node)) {
          urls.add(node);
          if (/(image|img|photo|foto|audio|video|pdf|file|document|src|cover)/i.test(key) || /\.(png|jpe?g|webp|gif|svg|mp3|wav|m4a|mp4|pdf)(\?|$)/i.test(node)) media.add(node);
        }
        return;
      }
      if (Array.isArray(node)) { records += node.length; node.forEach(item => walk(item, key)); return; }
      if (typeof node === 'object') {
        if ('es' in node || 'en' in node) { if (!node.es || !node.en) bilingualMissing++; }
        const candidate = text(node.title || node.titulo || node.label || node.name);
        if (candidate) {
          const normalized = candidate.trim().toLowerCase();
          if (titles.has(normalized)) duplicates.push(candidate); else titles.set(normalized, true);
        }
        Object.entries(node).forEach(([childKey, value]) => walk(value, childKey));
      }
    };
    walk(content);
    return { sections:Object.keys(content || {}).length, records, empty, bilingualMissing, media:[...media], urls:[...urls], duplicates };
  }

  function createDashboard(content) {
    document.getElementById('adminDashboard')?.remove();
    const report = scan(content);
    const section = document.createElement('section');
    section.id = 'adminDashboard';
    section.className = 'admin-dashboard';
    const warnings = report.empty + report.bilingualMissing + report.duplicates.length;
    section.innerHTML = `
      <div class="dash-head"><div><p class="eyebrow">RESUMEN</p><h2>Salud del contenido</h2></div><span class="quality-pill ${warnings ? 'warn' : 'ok'}">${warnings ? `${warnings} revisiones` : 'Sin alertas'}</span></div>
      <div class="metric-grid">
        <article><strong>${report.sections}</strong><span>Secciones</span></article>
        <article><strong>${report.records}</strong><span>Registros</span></article>
        <article><strong>${report.media.length}</strong><span>Recursos multimedia</span></article>
        <article><strong>${report.urls.length}</strong><span>Enlaces detectados</span></article>
      </div>
      <div class="quality-grid">
        <div class="quality-card"><strong>Campos vacíos</strong><span>${report.empty}</span><small>Conviene revisarlos antes de publicar.</small></div>
        <div class="quality-card"><strong>ES/EN incompletos</strong><span>${report.bilingualMissing}</span><small>Campos bilingües con un idioma faltante.</small></div>
        <div class="quality-card"><strong>Posibles duplicados</strong><span>${report.duplicates.length}</span><small>${report.duplicates.slice(0,2).join(' · ') || 'No detectados'}</small></div>
      </div>
      <details class="media-library"><summary>Biblioteca de medios preparada (${report.media.length})</summary><div class="media-grid">${report.media.slice(0,24).map(url => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"><span>${mediaType(url)}</span><code>${escapeHtml(short(url))}</code></a>`).join('') || '<p>No se detectaron recursos multimedia.</p>'}</div></details>`;
    notice.insertAdjacentElement('afterend', section);
  }

  function short(url) { try { const u = new URL(url); return `${u.hostname}${u.pathname}`.slice(0,72); } catch { return url.slice(0,72); } }
  function mediaType(url) { const ext = (url.match(/\.([a-z0-9]+)(?:\?|$)/i)?.[1] || 'URL').toUpperCase(); return ext; }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function refresh() {
    try { const content = frame.contentWindow?.CMS_CONTENT; if (content) createDashboard(content); } catch {}
  }
  frame.addEventListener('load', () => setTimeout(refresh, 350));
  setTimeout(refresh, 1400);

  const topbar = document.querySelector('.top-actions');
  if (topbar && !document.getElementById('adminSearchFields')) {
    const input = document.createElement('input');
    input.id = 'adminSearchFields'; input.className = 'admin-field-search'; input.type = 'search'; input.placeholder = 'Filtrar campos…'; input.setAttribute('aria-label','Filtrar campos del editor');
    topbar.prepend(input);
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      document.querySelectorAll('#editor .field, #editor .object-card, #editor .array-item').forEach(node => node.classList.toggle('admin-filter-hidden', q && !node.textContent.toLowerCase().includes(q)));
    });
  }
})();
