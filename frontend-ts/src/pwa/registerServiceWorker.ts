/**
 * Progressive Web App (PWA) Service Worker Registration & Lifecycle Manager
 */

export function registerServiceWorker(onUpdate?: (registration: ServiceWorkerRegistration) => void) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  const register = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);

      // Check for updates periodically (e.g. every 1 hour)
      setInterval(() => {
        registration.update().catch((err) => {
          console.error('[PWA] Periodic update check failed:', err);
        });
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
      console.error('[PWA] Service Worker registration failed:', error);
    }
  };

  // If window already loaded, register immediately; otherwise wait for load event
  if (document.readyState === 'complete') {
    register();
  } else {
    window.addEventListener('load', register);
  }


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
