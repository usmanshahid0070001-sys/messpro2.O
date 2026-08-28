/**
 * Progressive Web App (PWA) Service Worker Registration & Lifecycle Manager
 */

export function registerServiceWorker(onUpdate?: (registration: ServiceWorkerRegistration) => void) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Register service worker after initial window load to avoid blocking critical initial render
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      // Check for updates periodically (e.g. every 1 hour)
      setInterval(() => {
        registration.update().catch(() => {});
      }, 60 * 60 * 1000);

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available; execute update callback if provided
              if (onUpdate) {
                onUpdate(registration);
              }
            }
          }
        });
      });
    } catch (error) {
      console.warn('[PWA] Service Worker registration failed:', error);
    }
  });

  // Handle controller reload loop prevention
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

/**
 * Trigger immediate activation of a waiting Service Worker
 */
export function activateWaitingServiceWorker(registration: ServiceWorkerRegistration) {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}
