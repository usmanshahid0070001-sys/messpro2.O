import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { initAnalytics } from '@/lib/analytics';

export const COOKIE_CONSENT_KEY = 'messpro_cookie_consent';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for smooth entrance after page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // If user had previously accepted all cookies, initialize analytics
      try {
        const parsed = JSON.parse(consent);
        if (parsed.type === 'all') {
          initAnalytics();
        }
      } catch (_) {}
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({ type: 'all', timestamp: new Date().toISOString() })
    );
    initAnalytics();
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({ type: 'essential', timestamp: new Date().toISOString() })
    );
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent notice"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-[90] animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Cookie & Privacy Notice</h3>
              <p className="text-[11px] text-muted-foreground">Session security & user preferences</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss cookie banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body Description */}
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          MessPro uses strictly essential cookies for secure session authentication (HTTP-only JWT) and functional preferences (theme and sidebar state). We never use third-party advertising cookies. Learn more in our{' '}
          <Link
            to="/cookies"
            className="text-primary font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Cookie Policy
          </Link>
          .
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            onClick={handleAcceptAll}
            className="flex-1 h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-xs cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Accept All
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleEssentialOnly}
            className="flex-1 h-8 text-xs font-medium rounded-xl border-border hover:bg-muted cursor-pointer"
          >
            Essential Only
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
