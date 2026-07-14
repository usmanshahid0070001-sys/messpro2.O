import User from '../auth/auth.model.js';
import PlainUser from '../auth/plainUser.model.js'; // For syncing names

export const getUsersByHierarchy = async (requesterRole, requesterHostelId) => {
  let query = {}; 

  // 1. Super Admin: Sees Admins & Managers across the entire platform
  if (requesterRole === 'superadmin') {
    query = { role: { $in: ['admin', 'manager'] } };
  } 
  // 2. Hostel Admin: Sees Managers & Students ONLY in their specific hostel
  else if (requesterRole === 'admin') {
    query = { hostelId: requesterHostelId, role: { $in: ['manager', 'student'] } };
  } 
  // 3. Manager: Sees Students ONLY in their specific hostel
  else if (requesterRole === 'manager') {
    query = { hostelId: requesterHostelId, role: 'student' };
  } 
  else {
    const error = new Error('You do not have permission to view user lists.');
    error.statusCode = 403;
    throw error;
  }

  // Execute the query, but hide the passwords from the frontend!
  return await User.find(query).select('-password').sort({ createdAt: -1 });
};

export const updateUser = async (requesterRole, requesterHostelId, targetUserId, updateData) => {
  // 1. Find the user they are trying to update
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  // 2. THE SECURITY BOUNCER: Hierarchy & Tenant Isolation Check
  const allowedUpdates = {
    superadmin: ['admin', 'manager'],
    admin:      ['manager', 'student'],
    manager:    ['student']
  };

  // Rule A: Can this role edit that role?
  if (!allowedUpdates[requesterRole]?.includes(targetUser.role)) {
    const error = new Error(`Access Denied: A ${requesterRole} cannot update a ${targetUser.role}.`);
    error.statusCode = 403;
    throw error;
  }

  // Rule B: Are they in the same hostel? (Superadmins bypass this rule)
  if (requesterRole !== 'superadmin' && targetUser.hostelId !== requesterHostelId) {
    const error = new Error('Access Denied: This user belongs to a different hostel.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Perform the update
  const updatedUser = await User.findByIdAndUpdate(
    targetUserId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password');

  // 4. Architect Bonus: Keep PlainUser model in sync if they changed the name!
  if (updateData.name) {
    await PlainUser.findOneAndUpdate(
      { email: targetUser.email },
      { name: updateData.name }
    );
  }

  return updatedUser;
};