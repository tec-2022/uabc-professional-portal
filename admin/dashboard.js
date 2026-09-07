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
    let records = 0;
    let empty = 0;
    let bilingualMissing = 0;
    const media = new Set();
    const urls = new Set();
    const titles = new Map();
    const duplicates = [];

    const walk = (node, key = '') => {
      if (node == null || node === '') {
        empty++;
        return;
      }

      if (typeof node === 'string') {
        if (/^https?:\/\//i.test(node)) {
          urls.add(node);
          if (/(image|img|photo|foto|audio|video|pdf|file|document|src|cover)/i.test(key) || /\.(png|jpe?g|webp|gif|svg|mp3|wav|m4a|mp4|pdf)(\?|$)/i.test(node)) {
            media.add(node);
          }
        }
        return;
      }

      if (Array.isArray(node)) {
        records += node.length;
        node.forEach(item => walk(item, key));
        return;
      }

      if (typeof node === 'object') {
        if ('es' in node || 'en' in node) {
          if (!node.es || !node.en) bilingualMissing++;
        }

        const candidate = text(node.title || node.titulo || node.label || node.name);
        if (candidate) {
          const normalized = candidate.trim().toLowerCase();
          if (titles.has(normalized)) duplicates.push(candidate);
          else titles.set(normalized, true);
        }

        Object.entries(node).forEach(([childKey, value]) => walk(value, childKey));
      }
    };

    walk(content);
    return {
      sections: Object.keys(content || {}).length,
      records,
      empty,
      bilingualMissing,
      media: [...media],
      urls: [...urls],
      duplicates
    };
  }

  function friendlyFileName(url) {
    try {
      const parsed = new URL(url);
      const last = decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || 'Recurso');
      return last.length > 42 ? `${last.slice(0, 39)}…` : last;
    } catch {
      return 'Recurso';
    }
  }

  function mediaLabel(url) {
    const ext = (url.match(/\.([a-z0-9]+)(?:\?|$)/i)?.[1] || '').toLowerCase();
    if (['png','jpg','jpeg','webp','gif','svg'].includes(ext)) return 'Imagen';
    if (['mp3','wav','m4a'].includes(ext)) return 'Audio';
    if (['mp4','webm','mov'].includes(ext)) return 'Video';
    if (ext === 'pdf') return 'Documento';
    return 'Archivo';
  }

  function createDashboard(content) {
    document.getElementById('adminDashboard')?.remove();
    const report = scan(content);
    const warnings = report.empty + report.bilingualMissing + report.duplicates.length;
    const section = document.createElement('section');
    section.id = 'adminDashboard';
    section.className = 'admin-dashboard';

    section.innerHTML = `
      <div class="dash-head">
        <div><p class="eyebrow">RESUMEN</p><h2>Revisión del contenido</h2></div>
        <span class="quality-pill ${warnings ? 'warn' : 'ok'}">${warnings ? `${warnings} cosas por revisar` : 'Todo se ve bien'}</span>
      </div>

      <div class="metric-grid">
        <article><strong>${report.sections}</strong><span>Secciones</span></article>
        <article><strong>${report.records}</strong><span>Elementos</span></article>
        <article><strong>${report.media.length}</strong><span>Imágenes y archivos</span></article>
        <article><strong>${report.urls.length}</strong><span>Enlaces</span></article>
      </div>

      <div class="quality-grid">
        <div class="quality-card">
          <strong>Información pendiente</strong><span>${report.empty}</span>
          <small>Campos que todavía están vacíos.</small>
        </div>
        <div class="quality-card">
          <strong>Traducciones incompletas</strong><span>${report.bilingualMissing}</span>
          <small>Textos que tienen español o inglés pendiente.</small>
        </div>
        <div class="quality-card">
          <strong>Posibles repetidos</strong><span>${report.duplicates.length}</span>
          <small>${report.duplicates.slice(0,2).join(' · ') || 'No encontramos elementos repetidos'}</small>
        </div>
      </div>

      <details class="media-library">
        <summary>Imágenes y archivos (${report.media.length})</summary>
        <div class="media-grid">
          ${report.media.slice(0,24).map(url => `
            <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" title="Abrir recurso">
              <span>${mediaLabel(url)}</span>
              <span class="media-name">${escapeHtml(friendlyFileName(url))}</span>
              <span class="media-action">Abrir ↗</span>
            </a>`).join('') || '<p>No hay imágenes o archivos registrados en esta copia.</p>'}
        </div>
      </details>`;

    notice.insertAdjacentElement('afterend', section);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    })[char]);
  }

  function refresh() {
    try {
      const content = frame.contentWindow?.CMS_CONTENT;
      if (content) createDashboard(content);
    } catch {}
  }

  frame.addEventListener('load', () => setTimeout(refresh, 350));
  setTimeout(refresh, 1400);

  const topbar = document.querySelector('.top-actions');
  if (topbar && !document.getElementById('adminSearchFields')) {
    const input = document.createElement('input');
    input.id = 'adminSearchFields';
    input.className = 'admin-field-search';
    input.type = 'search';
    input.placeholder = 'Buscar un campo…';
    input.setAttribute('aria-label', 'Buscar un campo en la sección actual');
    topbar.prepend(input);

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      document.querySelectorAll('#editor .field, #editor .object-card, #editor .array-item').forEach(node => {
        node.classList.toggle('admin-filter-hidden', query && !node.textContent.toLowerCase().includes(query));
      });
    });
  }
})();
