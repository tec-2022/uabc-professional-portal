(() => {
  'use strict';

  const navGlyphs = {
    inicio:'IN', eventos:'EV', publicaciones:'PU', investigación:'IV', investigacion:'IV',
    docencia:'DO', blog:'BL', galería:'GA', galeria:'GA', podcast:'PO', contacto:'CO',
    'álbumes de galería':'AL', 'datos de contacto':'DC', 'posiciones académicas':'PA',
    'formación académica':'FA'
  };

  const hintRules = [
    [/título|nombre/i, 'Usa un texto breve y descriptivo; será lo primero que verá el visitante.'],
    [/descripción|resumen|abstract/i, 'Explica lo esencial con lenguaje claro y evita repetir el título.'],
    [/autor/i, 'Separa autores de forma consistente para mantener una presentación uniforme.'],
    [/año/i, 'Usa cuatro dígitos, por ejemplo 2026.'],
    [/fecha/i, 'Selecciona la fecha correspondiente al contenido o actividad.'],
    [/enlace|url/i, 'Pega la dirección completa que debe abrir el visitante.'],
    [/imagen/i, 'Usa una imagen horizontal o cuadrada de buena calidad y con permiso de uso.'],
    [/audio/i, 'Usa una dirección directa o pública para el episodio o archivo de audio.']
  ];

  function labelOf(field) {
    return field.querySelector(':scope > label, :scope > .field-label')?.textContent.trim() || '';
  }

  function controlOf(field) {
    return field.querySelector(':scope > input, :scope > textarea, :scope > select, :scope > .bilingual input, :scope > .bilingual textarea');
  }

  function decorateNav() {
    document.querySelectorAll('#sectionNav .nav-btn').forEach(btn => {
      if (btn.querySelector('.admin-nav-glyph')) return;
      const label = btn.querySelector('span:first-child');
      if (!label) return;
      const key = label.textContent.trim().toLowerCase();
      const glyph = document.createElement('span');
      glyph.className = 'admin-nav-glyph';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.textContent = navGlyphs[key] || key.slice(0, 2).toUpperCase();
      btn.insertBefore(glyph, label);
    });
  }

  function makeHint(field, label) {
    if (!label || field.querySelector(':scope > .field-help')) return;
    const match = hintRules.find(([regex]) => regex.test(label));
    if (!match) return;
    const hint = document.createElement('small');
    hint.className = 'field-help';
    hint.textContent = match[1];
    field.appendChild(hint);
  }

  function enhanceControl(field, label, control) {
    if (!control || control.dataset.proEnhanced === 'true') return;
    control.dataset.proEnhanced = 'true';
    const normalized = label.toLowerCase();

    if (/^año$/.test(normalized) && control.tagName === 'INPUT') {
      control.type = 'number';
      control.min = '1900';
      control.max = '2100';
      control.inputMode = 'numeric';
    }

    if (/fecha/.test(normalized) && control.tagName === 'INPUT' && /^\d{4}-\d{2}-\d{2}/.test(control.value)) {
      control.type = 'date';
      control.value = control.value.slice(0, 10);
    }

    if (control.tagName === 'TEXTAREA') {
      const resize = () => {
        control.style.height = 'auto';
        control.style.height = `${Math.min(Math.max(control.scrollHeight, 104), 360)}px`;
      };
      control.addEventListener('input', resize);
      requestAnimationFrame(resize);
    }

    if (/imagen/.test(normalized) && control.tagName === 'INPUT') {
      const preview = document.createElement('div');
      preview.className = 'field-media-preview';
      preview.innerHTML = '<img alt="Vista previa"><span>Vista previa de la imagen indicada.</span>';
      field.appendChild(preview);
      const image = preview.querySelector('img');
      const copy = preview.querySelector('span');
      const update = () => {
        const value = control.value.trim();
        preview.hidden = !/^https?:\/\//i.test(value);
        if (!preview.hidden) image.src = value;
      };
      image.addEventListener('error', () => { copy.textContent = 'No fue posible mostrar esta imagen. Revisa la dirección.'; });
      image.addEventListener('load', () => { copy.textContent = 'Vista previa de la imagen indicada.'; });
      control.addEventListener('input', update);
      update();
    }

    if (/enlace|url|audio/.test(normalized) && control.tagName === 'INPUT') {
      const action = document.createElement('a');
      action.className = 'field-inline-action';
      action.target = '_blank';
      action.rel = 'noopener noreferrer';
      action.textContent = 'Abrir enlace ↗';
      field.appendChild(action);
      const update = () => {
        const value = control.value.trim();
        const valid = /^https?:\/\//i.test(value);
        action.hidden = !valid;
        if (valid) action.href = value;
      };
      control.addEventListener('input', update);
      update();
    }
  }

  function decorateFields() {
    document.querySelectorAll('#editor .field').forEach(field => {
      if (field.dataset.proField === 'true') return;
      field.dataset.proField = 'true';
      const label = labelOf(field);
      const control = controlOf(field);
      makeHint(field, label);
      enhanceControl(field, label, control);
    });
  }

  function findItemTitle(item) {
    const preferred = [/título/i, /nombre/i, /proyecto/i, /evento/i, /curso/i, /autor/i];
    const fields = [...item.querySelectorAll('.field')];
    for (const regex of preferred) {
      const field = fields.find(candidate => regex.test(labelOf(candidate)));
      const control = field && controlOf(field);
      if (control?.value?.trim()) return control.value.trim();
    }
    const any = fields.map(controlOf).find(control => control?.value?.trim());
    return any?.value?.trim() || 'Elemento sin título';
  }

  function decorateItems() {
    document.querySelectorAll('#editor .array-item').forEach((item, index) => {
      let summary = item.querySelector(':scope > .friendly-item-summary');
      if (!summary) {
        summary = document.createElement('div');
        summary.className = 'friendly-item-summary';
        item.prepend(summary);
        item.addEventListener('input', () => updateItemSummary(item, index));
      }
      updateItemSummary(item, index);
    });
  }

  function updateItemSummary(item, index) {
    const summary = item.querySelector(':scope > .friendly-item-summary');
    if (!summary) return;
    const title = findItemTitle(item);
    const nextKey = `${title}::${index + 1}`;
    if (summary.dataset.summaryKey === nextKey) return;
    summary.dataset.summaryKey = nextKey;
    summary.innerHTML = `<span>${escapeHtml(title)}</span> <small>· ${index + 1}</small>`;
  }

  function decorateDashboard() {
    const dashboard = document.getElementById('adminDashboard');
    if (!dashboard || dashboard.querySelector('.admin-quality-overview')) return;
    const values = [...dashboard.querySelectorAll('.quality-card > span')]
      .map(node => Number(node.textContent.trim()))
      .filter(Number.isFinite);
    const warnings = values.reduce((sum, value) => sum + value, 0);
    const score = Math.max(0, Math.min(100, 100 - warnings * 4));
    const overview = document.createElement('div');
    overview.className = 'admin-quality-overview';
    overview.innerHTML = `<div><strong>${score >= 90 ? 'Contenido en muy buen estado' : score >= 70 ? 'Contenido casi listo' : 'Contenido con elementos por revisar'}</strong><br><span>Indicador orientativo basado en campos pendientes, traducciones y posibles repeticiones.</span></div><div><div class="admin-quality-meter" aria-label="Calidad ${score}%"><i style="width:${score}%"></i></div><span>${score}% revisado</span></div>`;
    dashboard.querySelector('.dash-head')?.insertAdjacentElement('afterend', overview);
  }

  function addBuildLabel() {
    const bottom = document.querySelector('.sidebar-bottom');
    if (!bottom || bottom.querySelector('.admin-build-label')) return;
    const label = document.createElement('div');
    label.className = 'admin-build-label';
    label.textContent = 'Plantilla profesional · demo v2.2';
    bottom.appendChild(label);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  function enhance() {
    decorateNav();
    decorateFields();
    decorateItems();
    decorateDashboard();
    addBuildLabel();
  }

  document.addEventListener('DOMContentLoaded', () => {
    enhance();
    const root = document.querySelector('.admin-shell');
    if (!root) return;
    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        enhance();
      });
    });
    observer.observe(root, { childList:true, subtree:true });
  });
})();
