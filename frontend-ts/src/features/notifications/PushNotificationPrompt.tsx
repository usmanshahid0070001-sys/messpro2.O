import React from 'react';
import { BellRing, BellOff, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushNotificationPrompt() {
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    isSupported,
    permission,
    isSubscribed,
    isSubscribing,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  } = usePushNotifications();

  // Only render if user is logged in
  if (!user) {
    return null;
  }

  // 1. If permission is granted AND currently subscribed -> Show "Disable Alerts"
  if (permission === 'granted' && isSubscribed) {
    return (
      <button
        type="button"
        onClick={unsubscribeFromNotifications}
        disabled={isSubscribing}
        className="relative inline-flex h-8 w-8 sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 sm:px-2.5 text-xs font-semibold text-amber-600 transition-all hover:bg-amber-500/20 dark:text-amber-400 disabled:opacity-50 cursor-pointer"
        title="Push notifications active. Click to disable."
      >
        {isSubscribing ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
        ) : (
          <BellOff className="h-3.5 w-3.5 shrink-0" />
        )}
        <span className="hidden sm:inline">Disable Alerts</span>
      </button>
    );
  }

  // 2. If unsubscribed (or default permission) -> Show "Enable Alerts"
  return (
    <button
      type="button"
      onClick={subscribeToNotifications}
      disabled={isSubscribing}
      className="relative inline-flex h-8 w-8 sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 sm:px-2.5 text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20 dark:text-emerald-400 disabled:opacity-50 cursor-pointer"
      title="Click to enable push notifications on this device"
    >
      {isSubscribing ? (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
      ) : (
        <BellRing className="h-3.5 w-3.5 shrink-0" />
      )}
      <span className="hidden sm:inline">Enable Alerts</span>
    </button>
  );
}
