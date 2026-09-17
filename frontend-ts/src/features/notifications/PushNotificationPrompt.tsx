import React from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushNotificationPrompt() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { isSupported, permission, isSubscribing, subscribeToNotifications } = usePushNotifications();

  // Show only for students who haven't granted permission yet
  if (!user || user.role !== 'student' || !isSupported || permission === 'granted') {
    return null;
  }

  return (
    <button
      type="button"
      onClick={subscribeToNotifications}
      disabled={isSubscribing}
      className="relative inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20 dark:text-emerald-400 disabled:opacity-50"
      title="Enable Push Notifications"
    >
      <BellRing className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Enable Alerts</span>
    </button>
  );
}
