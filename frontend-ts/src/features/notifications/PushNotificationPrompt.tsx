import React from 'react';
import { BellRing } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushNotificationPrompt() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { isSupported, permission, isSubscribing, subscribeToNotifications, sendTestNotification } = usePushNotifications();

  // Only show if user is authenticated and browser supports push notifications
  if (!user || !isSupported) {
    return null;
  }

  // If already granted, provide a one-click test button so users can verify it works
  if (permission === 'granted') {
    return (
      <button
        type="button"
        onClick={sendTestNotification}
        className="relative inline-flex h-8 w-8 sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 sm:px-2.5 text-xs font-medium text-emerald-600 transition-all hover:bg-emerald-500/20 dark:text-emerald-400 cursor-pointer"
        title="Notifications Active — Click to test alert"
      >
        <BellRing className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">Test Alert</span>
      </button>
    );
  }

  // Not yet granted: prompt user to enable alerts
  return (
    <button
      type="button"
      onClick={subscribeToNotifications}
      disabled={isSubscribing}
      className="relative inline-flex h-8 w-8 sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 sm:px-2.5 text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20 dark:text-emerald-400 disabled:opacity-50 cursor-pointer"
      title="Enable Push Notifications"
    >
      <BellRing className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden sm:inline">Enable Alerts</span>
    </button>
  );
}

