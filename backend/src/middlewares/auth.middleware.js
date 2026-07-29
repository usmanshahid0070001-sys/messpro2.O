import jwt from 'jsonwebtoken';
import User from '../modules/auth/auth.model.js';
import Hostel from '../modules/hostel/hostel.model.js';
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
  return catchAsync(async (req, res, next) => {
    const user = req.user;

    // 1. Superadmins bypass the check completely
    if (user.role === 'superadmin') {
      return next();
    }

    const normalize = (str) => (str || '').toLowerCase().replace(/_/g, ' ');
    const normalizedReq = normalize(requiredPermission);

    // Features where Managers are checked against the Hostel plan instead of individual permissions
    const managerFeatureExemptions = ['meal settings', 'qr attendance', 'manual attendance', 'biometric attendance'];

    // 2. For Admins, or Managers accessing exempt features, check the hostel features list
    if (user.role === 'admin' || (user.role === 'manager' && managerFeatureExemptions.includes(normalizedReq))) {
      const hostel = await Hostel.findById(user.hostelId);
      
      if (!hostel) {
        return res.status(404).json({ success: false, message: 'Hostel not found.' });
      }

      const feature = hostel.plan?.features?.find(f => normalize(f.name) === normalizedReq);
      
      if (feature && feature.isEnabled) {
        return next();
      }
      
      return res.status(403).json({ 
        success: false, 
        message: `Access Denied: The '${requiredPermission}' feature is not enabled in your plan.` 
      });
    }

    // 3. For students, or Managers accessing non-exempt features, check individual permissions
    if (['student', 'manager'].includes(user.role) && user.permissions && user.permissions.includes(requiredPermission)) {
      return next();
    }

    // 4. If they don't have the permission, block the request
    return res.status(403).json({ 
      success: false, 
      message: `Access Denied: You do not have the '${requiredPermission}' permission.` 
    });
  });
};
