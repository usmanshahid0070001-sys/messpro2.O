import mongoose from 'mongoose';
import Hostel from './hostel.model.js';
import HostelRequest from './hostelRequest.model.js';
import User from '../auth/auth.model.js';
import PlainUser from '../auth/plainUser.model.js';
import Plan from '../plan/plan.model.js';

class HostelRepository {
  async startSession() {
    return await mongoose.startSession();
  }

  async create(hostelData, session = null) {
    if (session) {
      const created = await Hostel.create([hostelData], { session });
      return created[0];
    }
    return await Hostel.create(hostelData);
  }

  async findByName(name) {
    if (!name || typeof name !== 'string') return null;
    return await Hostel.findOne({ name: name.trim() });
  }

  async findBySubdomain(subdomain) {
    if (!subdomain || typeof subdomain !== 'string') return null;
    return await Hostel.findOne({ subdomain: subdomain.toLowerCase().trim() });
  }

  async findAll({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 0 } = {}) {
    let query = Hostel.find(filter).sort(sort);
    if (skip > 0) query = query.skip(skip);
    if (limit > 0) query = query.limit(limit);
    return await query.lean();
  }

  async countAll(filter = {}) {
    return await Hostel.countDocuments(filter);
  }

  async findById(id, { lean = false } = {}) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const query = Hostel.findById(id);
    return lean ? await query.lean() : await query;
  }

  async delete(id, session = null) {
    const options = session ? { session } : {};
    return await Hostel.findByIdAndDelete(id, options);
  }

  async deleteHostelWithCascade(hostelId, session = null) {
    const normalizedHostelId = hostelId.toString();
    const options = session ? { session } : {};

    // 1. Fetch emails of all users in this hostel to clean up PlainUser
    const users = await User.find({ hostelId: normalizedHostelId }).select('email').lean();
    const emails = users.map((u) => u.email).filter(Boolean);

    // 2. Delete all Users and PlainUsers belonging to this hostel
    const [deletedUsers, deletedPlainUsers] = await Promise.all([
      User.deleteMany({ hostelId: normalizedHostelId }, options),
      emails.length > 0 ? PlainUser.deleteMany({ email: { $in: emails } }, options) : { deletedCount: 0 },
    ]);

    // 3. Delete associated tenant resources if models exist (Room, Meal, Bill, Complaint, Attendance)
    const cleanupPromises = [];
    try {
      if (mongoose.models.Room) cleanupPromises.push(mongoose.models.Room.deleteMany({ hostelId: normalizedHostelId }, options));
      if (mongoose.models.Meal) cleanupPromises.push(mongoose.models.Meal.deleteMany({ hostelId: normalizedHostelId }, options));
      if (mongoose.models.Bill) cleanupPromises.push(mongoose.models.Bill.deleteMany({ hostelId: normalizedHostelId }, options));
      if (mongoose.models.Complaint) cleanupPromises.push(mongoose.models.Complaint.deleteMany({ hostelId: normalizedHostelId }, options));
      if (mongoose.models.Attendance) cleanupPromises.push(mongoose.models.Attendance.deleteMany({ hostelId: normalizedHostelId }, options));
      if (mongoose.models.StudentAttendance) cleanupPromises.push(mongoose.models.StudentAttendance.deleteMany({ hostelId: normalizedHostelId }, options));
      if (mongoose.models.GuestMeal) cleanupPromises.push(mongoose.models.GuestMeal.deleteMany({ hostelId: normalizedHostelId }, options));
      if (mongoose.models.Inventory) cleanupPromises.push(mongoose.models.Inventory.deleteMany({ hostelId: normalizedHostelId }, options));
    } catch {
      // ignore
    }

    if (cleanupPromises.length > 0) {
      await Promise.allSettled(cleanupPromises);
    }

    // 4. Delete the Hostel document itself
    const deletedHostel = await Hostel.findByIdAndDelete(hostelId, options);

    return {
      hostel: deletedHostel,
      deletedUsersCount: deletedUsers.deletedCount || 0,
      deletedPlainUsersCount: deletedPlainUsers.deletedCount || 0,
    };
  }

  async updateHostel(id, updateData, session = null) {
    const options = { new: true, runValidators: true };
    if (session) options.session = session;

    return await Hostel.findByIdAndUpdate(
      id,
      { $set: updateData },
      options
    );
  }

  async updateLimitCount(id, field, count, session = null) {
    const options = { new: true };
    if (session) options.session = session;

    return await Hostel.findByIdAndUpdate(
      id,
      { $set: { [field]: count } },
      options
    );
  }

  // User database operations encapsulated for the hostel domain
  async findUserById(userId) {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return null;
    return await User.findById(userId);
  }

  async findUserByEmail(email) {
    if (!email || typeof email !== 'string') return null;
    return await User.findOne({ email: email.toLowerCase().trim() });
  }

  async countUsersByRole(hostelId, role) {
    return await User.countDocuments({
      hostelId: hostelId.toString(),
      role,
    });
  }

  async createUser(userData, session = null) {
    if (session) {
      const users = await User.create([userData], { session });
      return users[0];
    }
    return await User.create(userData);
  }

  async upsertPlainUser(plainData, session = null) {
    if (!plainData?.email) return null;
    const options = { upsert: true, new: true };
    if (session) options.session = session;

    return await PlainUser.findOneAndUpdate(
      { email: plainData.email.toLowerCase().trim() },
      plainData,
      options
    );
  }

  async deleteUserById(userId, session = null) {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return null;
    const options = session ? { session } : {};
    return await User.findByIdAndDelete(userId, options);
  }

  async deletePlainUserByEmail(email, session = null) {
    if (!email || typeof email !== 'string') return null;
    const options = session ? { session } : {};
    return await PlainUser.findOneAndDelete({ email: email.toLowerCase().trim() }, options);
  }

  async syncAdminPermissions(hostelId, activePermissions) {
    const normalizedId = hostelId.toString();
    await Promise.all([
      User.updateMany(
        { hostelId: normalizedId, role: 'admin' },
        { $set: { permissions: activePermissions } }
      ),
      PlainUser.updateMany(
        { hostelId: normalizedId, role: 'admin' },
        { $set: { permissions: activePermissions } }
      ),
    ]);
  }

  // Plan database operations encapsulated for hostel domain
  async findPlanById(planId) {
    if (!mongoose.Types.ObjectId.isValid(planId)) return null;
    return await Plan.findById(planId);
  }

  async findDefaultPlan() {
    return await Plan.findOne();
  }

  // ── Hostel Onboarding Requests Operations ──────────────────────────────────
  async createHostelRequest(data) {
    return await HostelRequest.create(data);
  }

  async findHostelRequests({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 0 } = {}) {
    let query = HostelRequest.find(filter).populate('requestedPlan.planId', 'name price limits features').sort(sort);
    if (skip > 0) query = query.skip(skip);
    if (limit > 0) query = query.limit(limit);
    return await query.lean();
  }

  async countHostelRequests(filter = {}) {
    return await HostelRequest.countDocuments(filter);
  }

  async findHostelRequestById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await HostelRequest.findById(id).populate('requestedPlan.planId', 'name price limits features');
  }

  async findPendingHostelRequestByEmail(email) {
    if (!email || typeof email !== 'string') return null;
    return await HostelRequest.findOne({
      adminEmail: email.toLowerCase().trim(),
      status: 'pending',
    });
  }

  async findPendingHostelRequestBySubdomain(subdomain) {
    if (!subdomain || typeof subdomain !== 'string') return null;
    return await HostelRequest.findOne({
      subdomain: subdomain.toLowerCase().trim(),
      status: 'pending',
    });
  }

  async updateHostelRequest(id, updateData) {
    return await HostelRequest.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }
}

export default new HostelRepository();


