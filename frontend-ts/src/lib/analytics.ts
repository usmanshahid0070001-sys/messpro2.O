/**
 * Centralized, Privacy-Compliant Analytics Tracker for MessPro 2.0
 * 
 * Complies with GDPR/PECR by strictly verifying user consent from
 * `CookieConsentBanner` (`messpro_cookie_consent`) before mounting external
 * tracking beacons.
 */

export const COOKIE_CONSENT_KEY = 'messpro_cookie_consent';

interface ConsentData {
  type: 'all' | 'essential';
  timestamp: string;
}

let isInitialized = false;

/**
 * Checks whether user has explicitly approved non-essential/performance cookies
 */
export function hasAnalyticsConsent(): boolean {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return false;
    const parsed: ConsentData = JSON.parse(raw);
    return parsed.type === 'all';
  } catch (_) {
    return false;
  }
}

/**
 * Initializes Google Analytics 4 or privacy beacon if user consent is granted
 */
export function initAnalytics(): void {
  if (isInitialized) return;
  if (typeof window === 'undefined') return;

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!hasAnalyticsConsent()) {
    // Analytics deferred until user provides explicit consent via CookieConsentBanner
    return;
  }

  if (gaId && !document.getElementById('ga-script')) {
    // 1. Inject gtag script dynamically
    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // 2. Setup gtag helper
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', gaId, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    });

    isInitialized = true;
  } else {
    // Privacy-first fallback logger in dev or when no GA ID is provided
    isInitialized = true;
  }
}

/**
 * Track route / screen changes
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === 'undefined') return;

  if (!hasAnalyticsConsent()) return;

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (gaId && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  }
}

/**
 * Track user conversion interactions (e.g. "Trial Started", "Support Opened", "Plan Selected")
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;

  if (!hasAnalyticsConsent()) return;

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (gaId && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, params);
  }
}
