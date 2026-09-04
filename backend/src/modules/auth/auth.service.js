import jwt from 'jsonwebtoken';
import authRepository from './auth.repository.js';
import hostelRepository from '../hostel/hostel.repository.js';
import { cache } from '../../config/cache.js';

const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const createAuthCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const normalizeIdentifier = (identifier) => identifier?.toString().trim().toLowerCase();

export const registerUser = async (data) => {
  const email = data.email?.toLowerCase().trim();
  const rollId = data.id?.toLowerCase().trim();
  const existingUser = await authRepository.findByEmailOrId(email, rollId);

  if (existingUser) {
    const error = new Error('A user with this email or roll number already exists.');
    error.statusCode = 409;
    throw error;
  }

  // 👇 THE SAAS LIMIT CHECK 👇
  const role = data.role || 'student';
  if (role === 'student' || role === 'manager') {
    const hostel = await hostelRepository.findById(data.hostelId);
    if (!hostel) {
      const error = new Error('Hostel not found.');
      error.statusCode = 404;
      throw error;
    }

    const limit = role === 'manager' ? hostel.plan?.limits?.maxManagers : hostel.plan?.limits?.maxStudents;
    const current = await authRepository.countByRole(data.hostelId, role);

    if (limit !== undefined && limit !== -1 && current >= limit) {
      const error = new Error(`Upgrade required. Your current plan only allows ${limit} ${role}(s).`);
      error.statusCode = 402;
      throw error;
    }
  }

  // Transaction support with safe compensating fallback for standalone MongoDB
  let session = null;
  let useTransaction = false;
  try {
    session = await authRepository.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch {
    session = null;
    useTransaction = false;
  }

  let createdUser = null;
  let isPlainUserCreated = false;

  try {
    const userPayload = {
      ...data,
      email,
      password: data.password,
      id: rollId,
      hostelId: data.hostelId,
      additionalInfo: Array.isArray(data.additionalInfo) ? data.additionalInfo : [],
      additionalFunctionality: data.additionalFunctionality || 'none',
    };

    createdUser = await authRepository.createUser(userPayload, session);

    await authRepository.upsertPlainUser(
      {
        email,
        password: data.password,
        role: data.role || 'student',
        name: data.name,
        hostelId: data.hostelId,
      },
      session
    );
    isPlainUserCreated = true;

    if (role === 'student' || role === 'manager') {
      const updatedCount = await authRepository.countByRole(data.hostelId, role);
      const countField = role === 'manager' ? 'plan.limits.managers' : 'plan.limits.students';
      await hostelRepository.updateLimitCount(data.hostelId, countField, updatedCount);

      if (data.hostelId) {
        await cache.del(`hostel:config:${data.hostelId}`);
      }
    }

    if (useTransaction && session) {
      await session.commitTransaction();
    }

    return {
      user: createdUser.toPublicJSON(),
    };
  } catch (error) {
    if (useTransaction && session) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        console.error('Failed to abort transaction', abortErr);
      }
    } else {
      // Compensating rollback for standalone MongoDB
      if (createdUser?._id) {
        try {
          await authRepository.deleteUserById(createdUser._id);
        } catch (delErr) {
          console.error('Compensating rollback failed for User', delErr);
        }
      }
      if (isPlainUserCreated) {
        try {
          await authRepository.deletePlainUserByEmail(email);
        } catch (delErr) {
          console.error('Compensating rollback failed for PlainUser', delErr);
        }
      }
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const loginUser = async (credentials) => {
  const email = normalizeIdentifier(credentials.email);
  const password = credentials.password;

  if (!email || !password) {
    const error = new Error('Email and password are required.');
    error.statusCode = 400;
    throw error;
  }

  const user = await authRepository.findByEmail(email, true);

  if (!user) {
    const error = new Error('Invalid credentials.');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    const error = new Error('Invalid credentials.');
    error.statusCode = 401;
    throw error;
  }

  // Generate token, but do NOT set the cookie here!
  const token = createToken(user._id);

  return {
    user: user.toPublicJSON(),
    token,
  };
};

export const verifyUser = async (req) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    const error = new Error('No authentication token provided.');
    error.statusCode = 401;
    throw error;
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    const authError = new Error('Invalid or expired authentication token.');
    authError.statusCode = 401;
    throw authError;
  }

  const user = await authRepository.findById(payload.sub);

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 401;
    throw error;
  }

  return {
    user: user.toPublicJSON(),
    token,
  };
};

export const logoutUser = async (req, res) => {
  res.clearCookie('token', createAuthCookieOptions());
  return { success: true, message: 'Logged out successfully.' };
};

export const buildGoogleAuthUrl = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId) {
    throw new Error('Google OAuth is not configured.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const authenticateWithGoogle = async (code, req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured.');
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error('Unable to complete Google sign-in.');
  }

  const tokenData = await tokenResponse.json();
  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileResponse.ok) {
    throw new Error('Unable to fetch Google profile.');
  }
// ... (previous Google token fetching logic remains the same)
  
  const profile = await profileResponse.json();
  const email = profile.email?.toLowerCase();

  if (!email) {
    throw new Error('Google account did not return an email address.');
  }

  // 1. Check if the user is on the VIP list (already in our DB)
  let user = await authRepository.findByEmail(email);

  // 2. THE SAAS BOUNCER: If they aren't in the DB, reject the login instantly.
  if (!user) {
    const error = new Error(
      'Access Denied: No account found with this email. Please ask your Admin to register you, or use your official university email.'
    );
    error.statusCode = 401; // 401 means "Unauthorized"
    throw error;
  }

  // 3. If they ARE in the database, generate their token.
  const token = createToken(user._id);

  // 4. Return the data to the Controller. (Notice we deleted the res.cookie line!)
  return {
    user: user.toPublicJSON(),
    token,
  };
};
