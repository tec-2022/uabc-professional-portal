(() => {
  'use strict';

  const editor = document.getElementById('editor');
  const saveBtn = document.getElementById('saveBtn');
  const discardBtn = document.getElementById('discardBtn');
  const loadBtn = document.getElementById('loadCurrentBtn');
  const topActions = document.querySelector('.top-actions');
  const previewTitle = document.querySelector('.preview-head h2');
  if (!editor || !topActions) return;

  const status = document.createElement('span');
  status.className = 'admin-save-state';
  status.dataset.state = 'saved';
  status.setAttribute('role','status');
  status.setAttribute('aria-live','polite');
  status.textContent = 'Sin cambios pendientes';
  topActions.prepend(status);

  if (previewTitle && !previewTitle.parentElement.querySelector('.admin-preview-badge')) {
    const badge = document.createElement('span');
    badge.className = 'admin-preview-badge';
    badge.textContent = 'Vista del borrador';
    previewTitle.insertAdjacentElement('afterend', badge);
  }

  let dirty = false;
  let previewTimer = 0;

  function setState(next, message) {
    dirty = next === 'dirty';
    document.body.classList.toggle('admin-has-unsaved', dirty);
    status.dataset.state = next;
    status.textContent = message;
  }

  function currentSectionName() {
    const active = document.querySelector('#sectionNav .nav-btn.active');
    return active?.textContent?.trim() || 'esta sección';
  }

  function ensureGuide() {
    const card = document.querySelector('.editor-card');
    if (!card || card.querySelector('.admin-section-guide')) return;
    const guide = document.createElement('p');
    guide.className = 'admin-section-guide';
    guide.innerHTML = `<strong>Editando ${currentSectionName()}.</strong> Los cambios se reflejan en la vista previa y permanecen solo como borrador en este navegador.`;
    const head = card.querySelector('.card-head');
    head?.insertAdjacentElement('afterend', guide);
  }

  function updateGuide() {
    const guide = document.querySelector('.admin-section-guide');
    if (!guide) return ensureGuide();
    guide.innerHTML = `<strong>Editando ${currentSectionName()}.</strong> Los cambios se reflejan en la vista previa y permanecen solo como borrador en este navegador.`;
  }

  function markDirty() {
    if (!dirty) setState('dirty','Cambios sin guardar');
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      const frame = document.getElementById('previewFrame');
      frame?.setAttribute('title', `Vista previa actualizada de ${currentSectionName()}`);
    }, 220);
  }

  editor.addEventListener('input', markDirty, true);
  editor.addEventListener('change', markDirty, true);

  saveBtn?.addEventListener('click', () => {
    status.dataset.state = 'loading';
    status.textContent = 'Guardando borrador…';
    setTimeout(() => setState('saved','Borrador guardado'), 180);
  });

  discardBtn?.addEventListener('click', () => setTimeout(() => setState('saved','Borrador restaurado'), 80));
  loadBtn?.addEventListener('click', () => setTimeout(() => setState('saved','Contenido recargado'), 120));

  document.getElementById('sectionNav')?.addEventListener('click', () => setTimeout(updateGuide, 60));

  window.addEventListener('beforeunload', event => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  const observer = new MutationObserver(() => {
    ensureGuide();
    updateGuide();
  });
  observer.observe(editor, { childList:true, subtree:false });
  ensureGuide();
})();
