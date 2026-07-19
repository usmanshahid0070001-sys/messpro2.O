// import { catchAsync } from '../../utils/catchAsync.js';
// import { registerSchema, loginSchema } from './auth.validation.js';
// import {
//   registerUser,
//   loginUser,
//   verifyUser,
//   logoutUser,
//   buildGoogleAuthUrl,
//   authenticateWithGoogle,
// } from './auth.service.js';

// // Centralized cookie configuration helper moved to the top
// const createAuthCookieOptions = () => ({
//   httpOnly: true,
//   sameSite: 'lax',
//   secure: process.env.NODE_ENV === 'production',
//   maxAge: 7 * 24 * 60 * 60 * 1000,
// });

// export const register = catchAsync(async (req, res) => {
//   const data = registerSchema.parse(req.body);
//   const result = await registerUser(data);  

//   res.status(201).json({
//     success: true,
//     message: 'User registered successfully.',
//     ...result,
//   });
// });

// export const login = catchAsync(async (req, res) => {
//   const data = loginSchema.parse(req.body);
  
//   // Call the service (no req/res passed!)
//   const result = await loginUser(data);

//   // The Controller sets the cookie!
//   res.cookie('token', result.token, createAuthCookieOptions());

//   res.status(200).json({
//     success: true,
//     message: 'Login successful.',
//     ...result, 
//   });
// });

// export const verify = catchAsync(async (req, res) => {
//   const result = await verifyUser(req);

//   res.status(200).json({
//     success: true,
//     message: 'Session is valid.',
//     ...result,
//   });
// });

// export const logout = catchAsync(async (req, res) => {
//   // Clear the cookie directly in the controller
//   res.clearCookie('token', createAuthCookieOptions());
  
//   res.status(200).json({ 
//     success: true, 
//     message: 'Logged out successfully.' 
//   });
// });

// export const googleAuth = catchAsync(async (req, res) => {
//   const authUrl = buildGoogleAuthUrl();
//   res.redirect(authUrl);
// });

// export const googleCallback = catchAsync(async (req, res) => {
//   const { code } = req.query;

//   if (!code) {
//     return res.status(400).json({ success: false, message: 'Google login was cancelled.' });
//   }

//   // Passing the code to the service
//   const result = await authenticateWithGoogle(code);

//   // Set the token cookie using our clean helper function
//   res.cookie('token', result.token, createAuthCookieOptions());

//   const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
//   res.redirect(`${frontendUrl}/?auth=google`);
// });


import { catchAsync } from '../../utils/catchAsync.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import hostelService from '../hostel/hostel.service.js'; // 👈 Imported our service
import {
  registerUser,
  loginUser,
  verifyUser,
  logoutUser,
  buildGoogleAuthUrl,
  authenticateWithGoogle,
} from './auth.service.js';

const createAuthCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const register = catchAsync(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const result = await registerUser(data);  

  res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    ...result,
  });
});

export const login = catchAsync(async (req, res) => {
  const data = loginSchema.parse(req.body);
  
  const result = await loginUser(data);

  // 👇 THE SAAS LOCKOUT CHECK: Ask the Hostel Service for the status
  if (result.user && result.user.hostelId && result.user.role !== 'superadmin') {
    result.user.hostelStatus = await hostelService.getAndSyncHostelStatus(result.user.hostelId);
  }

  res.cookie('token', result.token, createAuthCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    ...result, 
  });
});

export const verify = catchAsync(async (req, res) => {
  const result = await verifyUser(req);

  // 👇 THE SAAS LOCKOUT CHECK: Re-verify status on page reload
  if (result.user && result.user.hostelId && result.user.role !== 'superadmin') {
    result.user.hostelStatus = await hostelService.getAndSyncHostelStatus(result.user.hostelId);
  }

  res.status(200).json({
    success: true,
    message: 'Session is valid.',
    ...result,
  });
});

export const logout = catchAsync(async (req, res) => {
  res.clearCookie('token', createAuthCookieOptions());
  
  res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully.' 
  });
});

export const googleAuth = catchAsync(async (req, res) => {
  const authUrl = buildGoogleAuthUrl();
  res.redirect(authUrl);
});

export const googleCallback = catchAsync(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Google login was cancelled.' });
  }

  const result = await authenticateWithGoogle(code);
  res.cookie('token', result.token, createAuthCookieOptions());

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/?auth=google`);
});