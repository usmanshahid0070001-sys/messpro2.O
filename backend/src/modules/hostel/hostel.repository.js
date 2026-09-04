import mongoose from 'mongoose';
import Hostel from './hostel.model.js';
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
    return await Hostel.findOne({ name });
  }

  async findBySubdomain(subdomain) {
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
  async findUserByEmail(email) {
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
    const options = { upsert: true, new: true };
    if (session) options.session = session;

    return await PlainUser.findOneAndUpdate(
      { email: plainData.email },
      plainData,
      options
    );
  }

  async deleteUserById(userId, session = null) {
    const options = session ? { session } : {};
    return await User.findByIdAndDelete(userId, options);
  }

  async deletePlainUserByEmail(email, session = null) {
    const options = session ? { session } : {};
    return await PlainUser.findOneAndDelete({ email }, options);
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
}

export default new HostelRepository();
