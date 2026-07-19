import { catchAsync } from '../../utils/catchAsync.js';
import * as userService from './user.service.js';
import { updateUserSchema } from './user.validation.js';
import hostelService from '../hostel/hostel.service.js'; // 👈 Import the hostel service we updated earlier!

export const getTargetedUsers = catchAsync(async (req, res) => {
  // Pass WHO is asking, and WHICH hostel they belong to
  const users = await userService.getUsersByHierarchy(req.user.role, req.user.hostelId);

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

export const updateExistingUser = catchAsync(async (req, res) => {
  const targetUserId = req.params.id;
  const validatedData = updateUserSchema.parse(req.body);

  // Pass who is asking, what hostel they are from, who they want to edit, and the new data
  const updatedUser = await userService.updateUser(
    req.user.role,
    req.user.hostelId,
    targetUserId,
    validatedData
  );

  res.status(200).json({
    success: true,
    message: 'User updated successfully.',
    data: updatedUser,
  });
});

// 👇 THE MISSING FUNCTION: This handles the POST /add route
export const createUser = catchAsync(async (req, res) => {
  const userData = req.body; 

  // Pass who is creating the user, what hostel they are in, and the new user's details
  const newUser = await hostelService.addHostelUser(
    req.user.role,
    req.user.hostelId,
    userData
  );

  res.status(201).json({
    success: true,
    message: 'User created successfully and email sent.',
    data: newUser,
  });
});