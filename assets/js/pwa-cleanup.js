(() => {
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => key.startsWith('uabc-portal-')).map(key => caches.delete(key)));
      }
    } catch {
      /* Cleanup is best effort and must never block the portal. */
    }
  }, { once:true });
})();
