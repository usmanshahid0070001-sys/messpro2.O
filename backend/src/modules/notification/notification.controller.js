import User from '../auth/auth.model.js';
export const subscribeToNotifications = async (req, res, next) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ status: 'error', message: 'Invalid subscription object' });
    }

    const userId = req.user.id;

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
