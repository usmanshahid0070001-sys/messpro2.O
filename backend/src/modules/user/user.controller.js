import { catchAsync } from '../../utils/catchAsync.js';
import * as userService from './user.service.js';
import { updateUserSchema, addUserSchema, userIdParamSchema } from './user.validation.js';
import hostelService from '../hostel/hostel.service.js';

export const getTargetedUsers = catchAsync(async (req, res) => {
  // Pass WHO is asking, and WHICH hostel they belong to
  const users = await userService.getUsersByHierarchy(req.user.role, req.user.hostelId);

  res.status(200).json({
    status: 'success',
    success: true,
    count: users.length,
    data: users,
  });
});

export const updateExistingUser = catchAsync(async (req, res) => {
  const { id: targetUserId } = userIdParamSchema.parse(req.params);
  const validatedData = updateUserSchema.parse(req.body);

  // Pass who is asking, what hostel they are from, who they want to edit, and the new data
  const updatedUser = await userService.updateUser(
    req.user.role,
    req.user.hostelId,
    targetUserId,
    validatedData
  );

  res.status(200).json({
    status: 'success',
    success: true,
    message: 'User updated successfully.',
    data: updatedUser,
  });
});

export const deleteExistingUser = catchAsync(async (req, res) => {
  const { id: targetUserId } = userIdParamSchema.parse(req.params);

  const result = await userService.deleteUser(
    req.user.role,
    req.user.hostelId,
    targetUserId
  );

  res.status(200).json({
    status: 'success',
    success: true,
    message: result.message,
    data: { userId: result.userId },
  });
});

// 👇 THE MISSING FUNCTION: This handles the POST /add route
export const createUser = catchAsync(async (req, res) => {
  const userData = addUserSchema.parse(req.body);

  // Pass who is creating the user, what hostel they are in, and the new user's details
  const newUser = await hostelService.addHostelUser(
    req.user.role,
    req.user.hostelId,
    userData
  );

  res.status(201).json({
    status: 'success',
    success: true,
    message: 'User created successfully and email sent.',
    data: newUser,
  });
});

// ─── Sign Legal Agreement ────────────────────────────────────────────────────
// POST /api/users/sign-agreement
// The authenticated user signs their own agreement — no body required.
export const signAgreementHandler = catchAsync(async (req, res) => {
  const updatedUser = await userService.signAgreement(req.user._id);

  res.status(200).json({
    status: 'success',
    success: true,
    message: 'Agreement signed successfully.',
    data: updatedUser,
  });
});

export const getHealthCheck = catchAsync(async (req, res) => {
  const healthData = await userService.getSystemHealth();

  res.status(healthData.status === 'healthy' ? 200 : 503).json({
    status: healthData.status === 'healthy' ? 'success' : 'fail',
    success: healthData.status === 'healthy',
    data: healthData,
  });
});
