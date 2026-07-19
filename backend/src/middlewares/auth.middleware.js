import jwt from 'jsonwebtoken';
import User from '../modules/auth/auth.model.js';
import { catchAsync } from '../utils/catchAsync.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const error = new Error('You are not logged in. Please log in to get access.');
    error.statusCode = 401;
    throw error;
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'messpro-dev-secret');
  } catch (err) {
    const error = new Error('Invalid or expired token. Please log in again.');
    error.statusCode = 401;
    throw error;
  }

  // Check if user still exists
  const currentUser = await User.findById(decoded.sub);
  if (!currentUser) {
    const error = new Error('The user belonging to this token no longer exists.');
    error.statusCode = 401;
    throw error;
  }

  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error('You do not have permission to perform this action.');
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};



export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    const user = req.user; // Assuming your protect/auth middleware sets req.user

    // 1. Superadmins, Admins, and Managers bypass the check completely
    if (['superadmin', 'admin', 'manager'].includes(user.role)) {
      return next();
    }

    // 2. If it is a student, check if the Admin toggled this specific feature ON for them
    if (user.role === 'student' && user.permissions && user.permissions.includes(requiredPermission)) {
      return next();
    }

    // 3. If they don't have the permission, block the request
    return res.status(403).json({ 
      success: false, 
      message: `Access Denied: You do not have the '${requiredPermission}' permission.` 
    });
  };
};


