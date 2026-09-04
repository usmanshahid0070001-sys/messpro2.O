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
    data: result,
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
    user: result.user,
    token: result.token,
    data: result,
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
  const { code, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (error || !code) {
    const errorMsg = error || 'Google login was cancelled.';
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(errorMsg)}`);
  }

  try {
    const result = await authenticateWithGoogle(code);
    res.cookie('token', result.token, createAuthCookieOptions());
    res.redirect(`${frontendUrl}/?auth=google`);
  } catch (authError) {
    const errorMsg = authError.message || 'Google authentication failed.';
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(errorMsg)}`);
  }
});
