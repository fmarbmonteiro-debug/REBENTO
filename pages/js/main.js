document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const serviceWorkerSupported = 'serviceWorker' in navigator;
  if (serviceWorkerSupported) {
    window.addEventListener('load', () => {
      const serviceWorkerUrl = new URL('../sw.js', document.baseURI);
      const serviceWorkerScope = new URL('../', document.baseURI);

      navigator.serviceWorker.register(serviceWorkerUrl, {
        scope: serviceWorkerScope.href
      }).catch((error) => {
        console.error('Não foi possível registar o service worker.', error);
      });
    });
  }
});
