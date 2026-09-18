import { useState, useEffect } from 'react';
import apiClient from '@/api/client';
import { toast } from 'sonner';


// Make sure to replace this with the generated public VAPID key
// Ideally this should come from import.meta.env.VITE_VAPID_PUBLIC_KEY
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';


// Helper function to convert base64 URL to Uint8Array
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const subscribeToNotifications = async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser.');
      return;
    }

    if (!VAPID_PUBLIC_KEY) {
      toast.error('VAPID public key is missing. Contact administrator.');
      return;
    }

    setIsSubscribing(true);

    try {
      // 1. Request Permission
      const currentPermission = await Notification.requestPermission();
      setPermission(currentPermission);

      if (currentPermission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // 2. Ensure Service Worker Registration exists and is ready
      let registration: ServiceWorkerRegistration;
      try {
        const existing = await navigator.serviceWorker.getRegistration('/sw.js');
        registration = existing || (await navigator.serviceWorker.register('/sw.js', { scope: '/' }));
        await navigator.serviceWorker.ready;
      } catch (regError) {
        console.error('[PWA] Service Worker registration failed in usePushNotifications:', regError);
        throw new Error('Service Worker registration failed');
      }


      // 3. Subscribe to Push Manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 4. Send Subscription to Backend via configured apiClient
      await apiClient.post('/notifications/subscribe', { subscription });

      toast.success('Successfully subscribed to notifications!');
    } catch (error: any) {
      console.error('Error subscribing to notifications:', error);
      if (error.message === 'Notification permission denied') {
        toast.error('Please allow notifications in your browser settings.');
      } else {
        toast.error('Failed to subscribe to notifications.');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      await apiClient.post('/notifications/test');
      toast.success('Test notification requested!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to trigger test notification');
    }
  };

  return {
    isSupported,
    permission,
    isSubscribing,
    subscribeToNotifications,
    sendTestNotification,
  };
};

