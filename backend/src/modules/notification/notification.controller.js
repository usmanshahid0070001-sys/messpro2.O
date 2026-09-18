import webpush from 'web-push';
import User from '../auth/auth.model.js';

export const subscribeToNotifications = async (req, res, next) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ status: 'error', message: 'Invalid subscription object' });
    }

    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Check if subscription already exists (using endpoint as unique identifier)
    const exists = user.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
    
    if (!exists) {
      user.pushSubscriptions.push(subscription);
      await user.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Subscribed to notifications successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const sendTestNotification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No push subscriptions found for this user. Click "Enable Alerts" in the UI first.',
      });
    }

    const payload = JSON.stringify({
      title: 'MessPro Push Alert',
      body: '🎉 Push notification delivered successfully to your device!',
      icon: '/pwa-192x192.png',
      url: '/app',
    });

    const results = await Promise.allSettled(
      user.pushSubscriptions.map((sub) => webpush.sendNotification(sub, payload))
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;

    res.status(200).json({
      status: 'success',
      message: `Test notification sent to ${successful} subscription(s).`,
      results,
    });
  } catch (error) {
    next(error);
  }
};

