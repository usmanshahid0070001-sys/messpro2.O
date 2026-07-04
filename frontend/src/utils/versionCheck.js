// Version checking utility for auto-updating the app on new deployments
// Uses multiple detection strategies for maximum reliability on Vercel

let currentVersion = null;
let versionCheckInterval = null;
let updateNotified = false;

// Strategy 1: Check if service worker has a pending update (VitePWA)
const checkServiceWorkerUpdate = () => {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null);
  
  return navigator.serviceWorker.getRegistrations().then(registrations => {
    if (registrations.length === 0) return null;
    
    const registration = registrations[0];
    
    // Check if there's a waiting service worker (new version downloaded)
    if (registration.waiting) {
      return { type: 'service-worker', hasUpdate: true };
    }
    
    // Check for updates
    registration.update().catch(err => console.warn('Service worker update check failed:', err));
    return { type: 'service-worker', hasUpdate: !!registration.waiting };
  }).catch(err => {
    console.warn('Error checking service worker:', err);
    return null;
  });
};

// Strategy 2: Check index.html content hash (cache-busting headers)
const getAppVersionHash = async () => {
  try {
    const response = await fetch(`/index.html?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const html = await response.text();
    
    // Extract script src from HTML to get the bundle hash
    const scriptMatch = html.match(/src="\/assets\/index-([a-f0-9]+)\.js"/);
    if (scriptMatch) {
      return scriptMatch[1];
    }
    
    // Fallback: use ETag or Last-Modified headers
    return response.headers.get('etag') || 
           response.headers.get('last-modified') || 
           response.headers.get('date');
  } catch (error) {
    console.warn('Error checking app version:', error);
    return null;
  }
};

// Strategy 3: Periodically check if main bundle is different (polling)
const checkBundleUpdate = async () => {
  try {
    const newVersion = await getAppVersionHash();
    
    if (!newVersion) return false;
    
    if (currentVersion && newVersion !== currentVersion) {
      console.log('🚀 New version detected!', { 
        old: currentVersion.slice(0, 8), 
        new: newVersion.slice(0, 8) 
      });
      return true;
    }
    
    if (!currentVersion) {
      currentVersion = newVersion;
    }
    
    return false;
  } catch (error) {
    console.error('Bundle update check failed:', error);
    return false;
  }
};

// Auto-reload when new version is detected
const reloadApp = () => {
  if (updateNotified) return;
  updateNotified = true;
  
  console.log('🔄 Reloading app in 10 seconds to get the latest version...');
  
  setTimeout(() => {
    window.location.href = window.location.href.split('#')[0].split('?')[0] + `?v=${Date.now()}`;
  }, 10000);
};

// Initialize version checking with multiple strategies
export const initVersionCheck = async () => {
  try {
    currentVersion = await getAppVersionHash();
    
    if (!currentVersion) {
      console.warn('⚠️ Could not determine initial app version');
    } else {
      console.log('📦 App version initialized:', currentVersion.slice(0, 8));
    }

    // Check for service worker updates immediately
    checkServiceWorkerUpdate().then(result => {
      if (result?.hasUpdate) {
        console.log('✓ Service worker update available');
        reloadApp();
      }
    });

    // Polling strategy: Check every 3 minutes
    versionCheckInterval = setInterval(async () => {
      const hasUpdate = await checkBundleUpdate();
      if (hasUpdate) {
        reloadApp();
      }
    }, 3 * 60 * 1000);

  } catch (error) {
    console.error('Failed to initialize version check:', error);
  }
};

// Cleanup version check
export const stopVersionCheck = () => {
  if (versionCheckInterval) {
    clearInterval(versionCheckInterval);
    versionCheckInterval = null;
  }
};
