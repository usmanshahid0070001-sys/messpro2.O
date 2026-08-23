import mongoose from 'mongoose';




import User from '../auth/auth.model.js';
import PlainUser from '../auth/plainUser.model.js'; // For syncing names & permissions

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
  // 3. Manager & Permitted Student: Sees Students ONLY in their specific hostel
  else if (requesterRole === 'manager' || requesterRole === 'student') {
    query = { hostelId: requesterHostelId, role: 'student' };
  } 
  else {
    const error = new Error('You do not have permission to view user lists.');
    error.statusCode = 403;
    throw error;
  }

  // Execute the query, but hide the passwords from the frontend!
  return await User.find(query).populate('room', 'roomName capacity status').select('-password').sort({ createdAt: -1 });
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
  const updatedUser = await User.findByIdAndUpdate(
    targetUserId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password');

  // 4. Architect Bonus: Keep PlainUser model in sync if they changed the name OR permissions!
  if (updateData.name !== undefined || updateData.permissions !== undefined) {
    const syncData = {};
    if (updateData.name !== undefined) syncData.name = updateData.name;
    if (updateData.permissions !== undefined) syncData.permissions = updateData.permissions;

    await PlainUser.findOneAndUpdate(
      { email: targetUser.email },
      { $set: syncData }
    );
  }

  return updatedUser;
};

// ─── Sign Legal Agreement ────────────────────────────────────────────────────
// Called when the user clicks "I Agree" in the LegalAgreementModal.
// Sets agreement = 'signed' and stamps agreementSignedAt timestamp.
export const signAgreement = async (userId) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        agreement: 'signed',
        agreementSignedAt: new Date(),
      },
    },
    { new: true, runValidators: true }
  ).select('-password');

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
