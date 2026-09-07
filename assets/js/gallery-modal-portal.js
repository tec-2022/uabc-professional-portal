(() => {
  'use strict';

  const MODAL_ID = 'uabcLb';
  const APP_ID = 'app';

  function forceViewportGeometry(modal) {
    if (!modal) return;
    modal.style.setProperty('position', 'fixed', 'important');
    modal.style.setProperty('inset', '0', 'important');
    modal.style.setProperty('width', '100vw', 'important');
    modal.style.setProperty('height', '100dvh', 'important');
    modal.style.setProperty('max-width', 'none', 'important');
    modal.style.setProperty('max-height', 'none', 'important');
    modal.style.setProperty('z-index', '100000', 'important');

    const title = modal.querySelector('#uabcLbTitle');
    if (title) title.style.setProperty('color', '#f8fafc', 'important');
  }

  function portalizeGalleryModal() {
    const gallery = document.getElementById('uabcGallery');
    const modal = document.getElementById(MODAL_ID);
    if (!gallery || !modal) return false;

    forceViewportGeometry(modal);
    if (modal.parentElement !== document.body) {
      modal.dataset.portalized = 'gallery';
      document.body.appendChild(modal);
    }
    return true;
  }

  function removeOrphanedModal() {
    if (document.getElementById('uabcGallery')) return;
    document.querySelectorAll(`body > #${MODAL_ID}[data-portalized="gallery"]`).forEach(modal => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      modal.remove();
    });
    document.body.classList.remove('overflow-hidden');
  }

  function syncGalleryModal() {
    if (!portalizeGalleryModal()) removeOrphanedModal();
  }

  function init() {
    const app = document.getElementById(APP_ID);
    syncGalleryModal();

    if (app) {
      const observer = new MutationObserver(() => queueMicrotask(syncGalleryModal));
      observer.observe(app, { childList: true, subtree: true });
    }

    window.addEventListener('hashchange', () => queueMicrotask(syncGalleryModal));
    window.addEventListener('popstate', () => queueMicrotask(syncGalleryModal));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
