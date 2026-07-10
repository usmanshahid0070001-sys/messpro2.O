import { catchAsync } from '../../utils/catchAsync.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import {
  registerUser,
  loginUser,
  verifyUser,
  logoutUser,
  buildGoogleAuthUrl,
  authenticateWithGoogle,
} from './auth.service.js';

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
  const result = await loginUser(data, req, res);

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    ...result,
  });
});

export const verify = catchAsync(async (req, res) => {
  const result = await verifyUser(req);

  res.status(200).json({
    success: true,
    message: 'Session is valid.',
    ...result,
  });
});

export const logout = catchAsync(async (req, res) => {
  const result = await logoutUser(req, res);

  res.status(200).json(result);
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

  const result = await authenticateWithGoogle(code, req, res);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/?auth=google`);
});
