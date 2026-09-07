(() => {
  'use strict';

  const STORAGE_KEY = 'uabc-admin-draft-v1';
  const META_KEY = 'uabc-admin-draft-meta-v1';
  const ROUTE_MAP = {
    home:'home', eventos:'eventos', publicaciones:'publicaciones', investigacion:'investigacion',
    docencia:'docencia', blog:'blog', galeria:'galeria', podcast:'podcast', contacto:'contacto'
  };

  const state = {
    source: null,
    draft: null,
    cvUrl: 'assets/cv.pdf',
    section: null,
    dirty: false,
    previewReady: false
  };

  const el = id => document.getElementById(id);
  const sectionNav = el('sectionNav');
  const editor = el('editor');
  const sectionTitle = el('sectionTitle');
  const statusText = el('statusText');
  const dirtyBadge = el('dirtyBadge');
  const sourceFrame = el('sourceFrame');
  const previewFrame = el('previewFrame');
  const toast = el('toast');

  const clone = value => JSON.parse(JSON.stringify(value));
  const isPlainObject = value => value && typeof value === 'object' && !Array.isArray(value);
  const isBilingual = value => isPlainObject(value) && Object.keys(value).length <= 3 && ('es' in value || 'en' in value);

  function labelFor(key) {
    const aliases = {
      home:'Inicio', publicaciones:'Publicaciones', investigacion:'Investigación', docencia:'Docencia',
      blog:'Blog', galeria:'Galería', gallery_albums:'Álbumes de galería', eventos:'Eventos',
      podcast:'Podcast', contacto:'Contacto', contacts:'Contactos', positions:'Posiciones',
      education:'Educación', more:'Más información', title:'Título', label:'Nombre / etiqueta',
      sub:'Detalle', href:'Enlace', year:'Año', type:'Tipo', badge:'Insignia', items:'Elementos',
      description:'Descripción', desc:'Descripción', abstract:'Resumen', date:'Fecha', image:'Imagen',
      url:'URL', audio:'Audio', duration:'Duración', author:'Autor', authors:'Autores'
    };
    if (aliases[key]) return aliases[key];
    return String(key).replace(/[_-]+/g,' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  function pathKey(path) { return path.map(String).join('.'); }

  function getAtPath(root, path) {
    return path.reduce((acc, key) => acc == null ? undefined : acc[key], root);
  }

  function setAtPath(root, path, value) {
    if (!path.length) return value;
    const target = path.slice(0, -1).reduce((acc, key) => acc[key], root);
    target[path[path.length - 1]] = value;
    markDirty();
    schedulePreview();
    return root;
  }

  function markDirty() {
    state.dirty = true;
    dirtyBadge.classList.remove('hidden');
    statusText.textContent = 'Editando un borrador local. El portal público permanece intacto.';
  }

  function markSaved() {
    state.dirty = false;
    dirtyBadge.classList.add('hidden');
    statusText.textContent = 'Borrador guardado localmente. Aún no se ha publicado nada.';
  }

  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function currentSectionValue() {
    return state.section && state.draft ? state.draft[state.section] : undefined;
  }

  function renderNav() {
    sectionNav.innerHTML = '';
    if (!state.draft) return;
    Object.keys(state.draft).forEach(key => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav-btn' + (key === state.section ? ' active' : '');
      const value = state.draft[key];
      const count = Array.isArray(value) ? value.length : isPlainObject(value) ? Object.keys(value).length : 1;
      btn.innerHTML = `<span>${escapeHtml(labelFor(key))}</span><span>${count}</span>`;
      btn.addEventListener('click', () => {
        state.section = key;
        renderNav();
        renderSection();
        refreshPreview(true);
      });
      sectionNav.appendChild(btn);
    });
  }

  function renderSection() {
    editor.innerHTML = '';
    if (!state.draft || !state.section) {
      editor.innerHTML = '<div class="empty">No hay contenido cargado.</div>';
      return;
    }
    sectionTitle.textContent = labelFor(state.section);
    const value = currentSectionValue();
    editor.appendChild(renderNode(value, [state.section], labelFor(state.section), 0, true));
  }

  function renderNode(value, path, label, depth = 0, root = false) {
    if (isBilingual(value)) return renderBilingual(value, path, label);
    if (Array.isArray(value)) return renderArray(value, path, label, depth);
    if (isPlainObject(value)) return renderObject(value, path, label, depth, root);
    return renderScalar(value, path, label);
  }

  function renderBilingual(value, path, label) {
    const wrap = document.createElement('div');
    wrap.className = 'field';
    const title = document.createElement('div');
    title.className = 'field-label';
    title.textContent = label;
    wrap.appendChild(title);
    const grid = document.createElement('div');
    grid.className = 'bilingual';
    ['es','en'].forEach(lang => {
      const langWrap = document.createElement('div');
      langWrap.className = 'lang-field';
      langWrap.innerHTML = `<span class="lang-tag">${lang.toUpperCase()}</span>`;
      const input = makeTextControl(value[lang] ?? '', path.concat(lang), label, true);
      langWrap.appendChild(input);
      grid.appendChild(langWrap);
    });
    wrap.appendChild(grid);
    return wrap;
  }

  function renderObject(value, path, label, depth, root) {
    const container = document.createElement('div');
    container.className = root ? '' : 'object-card';
    if (!root) {
      const head = document.createElement('div');
      head.className = 'object-head';
      head.innerHTML = `<strong>${escapeHtml(label)}</strong><span class="muted">Objeto</span>`;
      container.appendChild(head);
    }
    const body = document.createElement('div');
    body.className = root ? 'object-body' : 'object-body';
    const keys = Object.keys(value);
    if (!keys.length) body.innerHTML = '<div class="empty">Objeto vacío</div>';
    keys.forEach(key => body.appendChild(renderNode(value[key], path.concat(key), labelFor(key), depth + 1)));
    container.appendChild(body);
    return container;
  }

  function renderArray(value, path, label, depth) {
    const card = document.createElement('div');
    card.className = 'array-card';
    const head = document.createElement('div');
    head.className = 'array-head';
    const title = document.createElement('strong');
    title.textContent = `${label} (${value.length})`;
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'mini-btn';
    add.textContent = '+ Añadir';
    add.addEventListener('click', () => {
      const target = getAtPath(state.draft, path);
      target.push(blankLike(target[0]));
      markDirty();
      renderSection();
      renderNav();
      schedulePreview();
    });
    head.append(title, add);
    card.appendChild(head);

    const body = document.createElement('div');
    body.className = 'array-body';
    const list = document.createElement('div');
    list.className = 'array-list';
    if (!value.length) list.innerHTML = '<div class="empty">No hay elementos. Usa “Añadir”.</div>';

    value.forEach((item, index) => {
      const itemWrap = document.createElement('div');
      itemWrap.className = 'array-item';
      const actions = document.createElement('div');
      actions.className = 'array-item-actions';
      actions.append(
        miniAction('↑', 'Subir', () => moveArrayItem(path,index,-1), index === 0),
        miniAction('↓', 'Bajar', () => moveArrayItem(path,index,1), index === value.length - 1),
        miniAction('Duplicar', 'Duplicar', () => duplicateArrayItem(path,index)),
        miniAction('Eliminar', 'Eliminar', () => removeArrayItem(path,index), false, true)
      );
      itemWrap.appendChild(actions);
      itemWrap.appendChild(renderNode(item, path.concat(index), `${label} ${index + 1}`, depth + 1));
      list.appendChild(itemWrap);
    });
    body.appendChild(list);
    card.appendChild(body);
    return card;
  }

  function renderScalar(value, path, label) {
    const wrap = document.createElement('div');
    wrap.className = 'field';
    const lab = document.createElement('label');
    lab.htmlFor = `field-${pathKey(path).replace(/[^a-z0-9]/gi,'-')}`;
    lab.textContent = label;
    wrap.appendChild(lab);

    let control;
    if (typeof value === 'boolean') {
      control = document.createElement('select');
      control.className = 'select';
      control.innerHTML = '<option value="true">Sí</option><option value="false">No</option>';
      control.value = String(value);
      control.addEventListener('change', () => setAtPath(state.draft, path, control.value === 'true'));
    } else if (typeof value === 'number') {
      control = document.createElement('input');
      control.type = 'number';
      control.className = 'input';
      control.value = value;
      control.addEventListener('input', () => setAtPath(state.draft, path, Number(control.value)));
    } else {
      control = makeTextControl(value ?? '', path, label);
    }
    control.id = lab.htmlFor;
    wrap.appendChild(control);
    return wrap;
  }

  function makeTextControl(value, path, label, compact = false) {
    const key = String(path[path.length - 1] || '').toLowerCase();
    const longText = !compact && (String(value).length > 90 || /(description|desc|abstract|content|body|intro|bio|summary|resumen|texto|message)/.test(key));
    const control = document.createElement(longText ? 'textarea' : 'input');
    control.className = longText ? 'textarea' : 'input';
    if (!longText) {
      control.type = /(url|href|link|image|audio|video|website)/.test(key) ? 'url' : 'text';
    }
    control.value = value;
    control.placeholder = label;
    control.addEventListener('input', () => setAtPath(state.draft, path, control.value));
    return control;
  }

  function miniAction(text, title, handler, disabled = false, danger = false) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mini-btn' + (danger ? ' danger' : '');
    btn.textContent = text;
    btn.title = title;
    btn.disabled = disabled;
    btn.addEventListener('click', handler);
    return btn;
  }

  function moveArrayItem(path, index, delta) {
    const arr = getAtPath(state.draft, path);
    const next = index + delta;
    if (next < 0 || next >= arr.length) return;
    [arr[index], arr[next]] = [arr[next], arr[index]];
    markDirty(); renderSection(); schedulePreview();
  }

  function duplicateArrayItem(path, index) {
    const arr = getAtPath(state.draft, path);
    arr.splice(index + 1, 0, clone(arr[index]));
    markDirty(); renderSection(); renderNav(); schedulePreview();
  }

  function removeArrayItem(path, index) {
    const arr = getAtPath(state.draft, path);
    arr.splice(index, 1);
    markDirty(); renderSection(); renderNav(); schedulePreview();
  }

  function blankLike(example) {
    if (example === undefined) return '';
    if (Array.isArray(example)) return [];
    if (isPlainObject(example)) {
      const out = {};
      Object.entries(example).forEach(([key,val]) => out[key] = blankLike(val));
      return out;
    }
    if (typeof example === 'boolean') return false;
    if (typeof example === 'number') return 0;
    return '';
  }

  function captureCurrentContent(force = false) {
    try {
      const win = sourceFrame.contentWindow;
      if (!win || !win.CMS_CONTENT) throw new Error('CMS_CONTENT aún no disponible');
      state.source = clone(win.CMS_CONTENT);
      state.cvUrl = win.CMS_CV_URL || 'assets/cv.pdf';

      const saved = !force ? loadStoredDraft() : null;
      state.draft = saved ? saved.content : clone(state.source);
      state.cvUrl = saved?.cvUrl || state.cvUrl;
      state.section = Object.keys(state.draft)[0] || null;
      state.dirty = false;
      dirtyBadge.classList.add('hidden');
      statusText.textContent = saved
        ? `Borrador local recuperado (${formatDate(saved.savedAt)}). El sitio público no fue modificado.`
        : 'Contenido actual cargado como copia editable. El sitio público no fue modificado.';
      renderNav();
      renderSection();
      refreshPreview(true);
      showToast(force ? 'Contenido público recargado' : 'Admin listo');
    } catch (error) {
      statusText.textContent = 'No fue posible leer el contenido del portal. Recarga esta página.';
      console.error(error);
    }
  }

  function saveDraft() {
    if (!state.draft) return;
    const payload = { version:1, savedAt:new Date().toISOString(), cvUrl:state.cvUrl, content:state.draft };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    localStorage.setItem(META_KEY, JSON.stringify({ savedAt: payload.savedAt }));
    markSaved();
    showToast('Borrador guardado en este navegador');
  }

  function loadStoredDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.content ? parsed : null;
    } catch { return null; }
  }

  function discardDraft() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(META_KEY);
    if (state.source) {
      state.draft = clone(state.source);
      state.section = Object.keys(state.draft)[0] || null;
      state.dirty = false;
      dirtyBadge.classList.add('hidden');
      renderNav(); renderSection(); refreshPreview(true);
      statusText.textContent = 'Borrador descartado. Se restauró la copia del contenido público actual.';
      showToast('Borrador descartado');
    }
  }

  function exportJson() {
    if (!state.draft) return;
    const payload = {
      schema:'uabc-professional-portal-content', version:1,
      exportedAt:new Date().toISOString(), cvUrl:state.cvUrl, content:state.draft
    };
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uabc-portal-content-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    showToast('JSON exportado');
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const content = parsed.content || parsed;
        if (!isPlainObject(content)) throw new Error('Formato no válido');
        state.draft = clone(content);
        state.cvUrl = parsed.cvUrl || state.cvUrl;
        state.section = Object.keys(state.draft)[0] || null;
        markDirty(); renderNav(); renderSection(); refreshPreview(true);
        showToast('JSON importado como borrador');
      } catch (error) {
        showToast('El archivo JSON no tiene un formato válido');
      }
    };
    reader.readAsText(file);
  }

  let previewTimer;
  function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => refreshPreview(false), 250);
  }

  function previewRoute() {
    const key = state.section || 'home';
    return ROUTE_MAP[key] || (key === 'gallery_albums' ? 'galeria' : 'home');
  }

  function refreshPreview(forceNavigate = false) {
    if (!state.draft) return;
    const route = previewRoute();
    const expected = `${location.origin}/#/${route}`;
    const apply = () => {
      try {
        const win = previewFrame.contentWindow;
        if (!win) return;
        win.CMS_CONTENT = clone(state.draft);
        win.CMS_CV_URL = state.cvUrl;
        if (typeof win.render === 'function') win.render();
        if (typeof win.translate === 'function') win.translate();
        if (win.feather?.replace) win.feather.replace();
      } catch (error) { console.warn('Preview no disponible', error); }
    };

    if (forceNavigate || !previewFrame.src || !previewFrame.contentWindow) {
      previewFrame.onload = () => { state.previewReady = true; apply(); };
      previewFrame.src = `/#/${route}`;
      return;
    }
    try {
      if (previewFrame.contentWindow.location.hash !== `#/${route}`) {
        previewFrame.onload = () => apply();
        previewFrame.src = `/#/${route}`;
      } else apply();
    } catch { previewFrame.src = expected; }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  function formatDate(iso) {
    try { return new Intl.DateTimeFormat('es-MX',{dateStyle:'medium',timeStyle:'short'}).format(new Date(iso)); }
    catch { return iso || ''; }
  }

  el('saveBtn').addEventListener('click', saveDraft);
  el('exportBtn').addEventListener('click', exportJson);
  el('importBtn').addEventListener('click', () => el('importInput').click());
  el('importInput').addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (file) importJson(file);
    event.target.value = '';
  });
  el('discardBtn').addEventListener('click', discardDraft);
  el('loadCurrentBtn').addEventListener('click', () => captureCurrentContent(true));

  document.querySelectorAll('.viewport-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.viewport-btn').forEach(item => item.classList.toggle('active', item === btn));
    previewFrame.style.width = btn.dataset.width;
  }));

  sourceFrame.addEventListener('load', () => setTimeout(() => captureCurrentContent(false), 220));
  setTimeout(() => {
    if (!state.draft) captureCurrentContent(false);
  }, 1600);
})();
