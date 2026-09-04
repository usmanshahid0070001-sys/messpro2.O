import mongoose from 'mongoose';
import userRepository from './user.repository.js';

export const getUsersByHierarchy = async (requesterRole, requesterHostelId) => {
  let query = {}; 

  // 1. Super Admin: Sees Admins & Managers across the entire platform
  if (requesterRole === 'superadmin') {
    query = { role: { $in: ['admin', 'manager'] } };
  } 
  // 2. Hostel Admin: Sees Managers & Students ONLY in their specific hostel
  else if (requesterRole === 'admin') {
    if (!requesterHostelId) {
      const error = new Error('No hostel associated with this administrator account.');
      error.statusCode = 400;
      throw error;
    }
    query = { hostelId: requesterHostelId, role: { $in: ['manager', 'student'] } };
  } 
  // 3. Manager & Permitted Student: Sees Students ONLY in their specific hostel
  else if (requesterRole === 'manager' || requesterRole === 'student') {
    if (!requesterHostelId) {
      const error = new Error('No hostel associated with this account.');
      error.statusCode = 400;
      throw error;
    }
    query = { hostelId: requesterHostelId, role: 'student' };
  } 
  else {
    const error = new Error('You do not have permission to view user lists.');
    error.statusCode = 403;
    throw error;
  }

  // Execute the query via repository, hiding passwords
  return await userRepository.findUsers(query);
};

export const updateUser = async (requesterRole, requesterHostelId, targetUserId, updateData) => {
  // 1. Find the user they are trying to update
  const targetUser = await userRepository.findById(targetUserId);
  if (!targetUser) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  // 2. THE SECURITY BOUNCER: Hierarchy & Tenant Isolation Check
  const allowedUpdates = {
    superadmin: ['admin', 'manager'],
    admin:      ['manager', 'student'],
    manager:    ['student'],
    student:    ['student']
  };

  // Rule A: Can this role edit that role?
  if (!allowedUpdates[requesterRole]?.includes(targetUser.role)) {
    const error = new Error(`Access Denied: A ${requesterRole} cannot update a ${targetUser.role}.`);
    error.statusCode = 403;
    throw error;
  }

  // Rule B: Are they in the same hostel? (Superadmins bypass this rule)
  if (requesterRole !== 'superadmin' && String(targetUser.hostelId) !== String(requesterHostelId)) {
    const error = new Error('Access Denied: This user belongs to a different hostel.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Perform the update on the main User table
  const updatedUser = await userRepository.findByIdAndUpdate(targetUserId, updateData);

  // 4. Architect Bonus: Keep PlainUser model in sync if they changed name, status, OR permissions!
  if (updateData.name !== undefined || updateData.permissions !== undefined || updateData.status !== undefined) {
    const syncData = {};
    if (updateData.name !== undefined) syncData.name = updateData.name;
    if (updateData.permissions !== undefined) syncData.permissions = updateData.permissions;
    if (updateData.status !== undefined) syncData.status = updateData.status;

    await userRepository.syncPlainUser(targetUser.email, syncData);
  }

  return updatedUser;
};

export const deleteUser = async (requesterRole, requesterHostelId, targetUserId) => {
  // 1. Find target user
  const targetUser = await userRepository.findById(targetUserId);
  if (!targetUser) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Hierarchy & Tenant Isolation Check
  const allowedDeletions = {
    superadmin: ['admin', 'manager'],
    admin:      ['manager', 'student'],
    manager:    ['student'],
  };

  if (!allowedDeletions[requesterRole]?.includes(targetUser.role)) {
    const error = new Error(`Access Denied: A ${requesterRole} is not permitted to delete a ${targetUser.role}.`);
    error.statusCode = 403;
    throw error;
  }

  if (requesterRole !== 'superadmin' && String(targetUser.hostelId) !== String(requesterHostelId)) {
    const error = new Error('Access Denied: This user belongs to a different hostel.');
    error.statusCode = 403;
    throw error;
  }

  // 3. FINANCIAL GUARD: Ensure no pending dues or unpaid bills exist
  const pendingBills = await userRepository.findPendingBillsByUser(
    targetUser.hostelId,
    targetUser._id,
    targetUser.id
  );

  if (pendingBills && pendingBills.length > 0) {
    const totalDues = pendingBills.reduce((acc, b) => acc + (b.remainingBill || 0), 0);
    const error = new Error(
      `Cannot delete user: ${targetUser.name} has ${pendingBills.length} unpaid bill(s) with pending dues totaling Rs. ${totalDues}. All pending dues must be cleared first before deleting the user.`
    );
    error.statusCode = 400;
    throw error;
  }

  // 4. Room Occupancy Cleanup
  if (targetUser.room) {
    await userRepository.unassignRoomOccupant(targetUser.room);
  }

  // 5. Delete User Doc & PlainUser Doc (Preserving MealRecords and Bills intact)
  await userRepository.deleteUserById(targetUserId);
  await userRepository.deletePlainUserByEmail(targetUser.email);

  // 6. Recalculate and sync hostel student / manager limits
  if (targetUser.role === 'student' || targetUser.role === 'manager') {
    await userRepository.syncHostelUserLimit(targetUser.hostelId, targetUser.role);
  }

  return {
    success: true,
    message: `User ${targetUser.name} (${targetUser.role}) has been deleted successfully.`,
    userId: targetUserId,
  };
};

// ─── Sign Legal Agreement ────────────────────────────────────────────────────
// Called when the user clicks "I Agree" in the LegalAgreementModal.
// Sets agreement = 'signed' and stamps agreementSignedAt timestamp.
export const signAgreement = async (userId) => {
  const updatedUser = await userRepository.findByIdAndUpdate(
    userId,
    {
      agreement: 'signed',
      agreementSignedAt: new Date(),
    }
  );

  if (!updatedUser) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return updatedUser;
};

// ─── Superadmin System Health Check ──────────────────────────────────────────
export const getSystemHealth = async () => {
  const dbStatusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  const dbState = mongoose.connection.readyState;
  const memoryUsage = process.memoryUsage();

  return {
    status: dbState === 1 ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: {
      status: dbStatusMap[dbState] || 'Unknown',
      connected: dbState === 1,
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A',
    },
    system: {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      }
    }
  };
};
