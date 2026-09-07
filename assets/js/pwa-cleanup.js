(() => {
  'use strict';
  if (!('serviceWorker' in navigator)) return;

  const RELOAD_KEY = 'portal-pwa-cleanup-reloaded';
  const isPortalCache = key => /^(uabc-portal-|academic-portal-)/.test(key);

  window.addEventListener('load', async () => {
    try {
      const hadController = Boolean(navigator.serviceWorker.controller);
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));

      let staleCaches = [];
      if ('caches' in window) {
        const keys = await caches.keys();
        staleCaches = keys.filter(isPortalCache);
        await Promise.all(staleCaches.map(key => caches.delete(key)));
      }

      const cleanedLegacyRuntime = hadController || registrations.length > 0 || staleCaches.length > 0;
      if (cleanedLegacyRuntime && sessionStorage.getItem(RELOAD_KEY) !== '1') {
        sessionStorage.setItem(RELOAD_KEY, '1');
        location.reload();
      }
    } catch {
      /* Cleanup is best effort and must never block the portal. */
    }
  }, { once:true });
})();
