import User from '../auth/auth.model.js';
import { AppError } from '../../middlewares/error.middleware.js';

export const subscribeToNotifications = async (req, res, next) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return next(new AppError('Invalid subscription object', 400));
    }

    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
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
