import webpush from 'web-push';
import User from '../auth/auth.model.js';

// Ensure web-push VAPID details are initialized if available
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      'mailto:support@messpro.app',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (err) {
    // Already set or invalid format
  }
}

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

export const unsubscribeFromNotifications = async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (endpoint) {
      user.pushSubscriptions = (user.pushSubscriptions || []).filter(
        sub => sub.endpoint !== endpoint
      );
    } else {
      user.pushSubscriptions = [];
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Unsubscribed from notifications successfully',
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

export const broadcastNotification = async (req, res, next) => {
  try {
    const { title, body } = req.body;

    if (!title || !title.trim() || !body || !body.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Notification title and body are required.',
      });
    }

    // Query for students with at least one push subscription
    const query = {
      role: 'student',
      'pushSubscriptions.0': { $exists: true },
    };

    // If admin is bound to a specific hostel, scope to that hostel's students if present
    if (req.user.role === 'admin' && req.user.hostelId) {
      const hostelStudentCount = await User.countDocuments({
        ...query,
        hostelId: req.user.hostelId,
      });
      if (hostelStudentCount > 0) {
        query.hostelId = req.user.hostelId;
      }
    }

    const students = await User.find(query);

    if (!students || students.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'Sent to 0 students (no registered push subscriptions found).',
        data: { sentCount: 0, failCount: 0, totalStudents: 0 },
      });
    }

    const payload = JSON.stringify({
      title: title.trim(),
      body: body.trim(),
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      url: '/app',
    });

    let sentCount = 0;
    let failCount = 0;

    for (const student of students) {
      const validSubscriptions = [];
      let listModified = false;

      for (const subscription of student.pushSubscriptions) {
        try {
          await webpush.sendNotification(subscription, payload);
          validSubscriptions.push(subscription);
          sentCount++;
        } catch (error) {
          failCount++;
          // HTTP 404 or 410 indicates the subscription has expired or is no longer valid
          if (error.statusCode === 404 || error.statusCode === 410) {
            listModified = true;
          } else {
            validSubscriptions.push(subscription);
          }
        }
      }

      if (listModified) {
        student.pushSubscriptions = validSubscriptions;
        await student.save();
      }
    }

    const summaryMessage = `Sent to ${sentCount} student device(s)${failCount > 0 ? `, ${failCount} failed` : ''}.`;

    return res.status(200).json({
      status: 'success',
      message: summaryMessage,
      data: {
        sentCount,
        failCount,
        totalStudents: students.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
