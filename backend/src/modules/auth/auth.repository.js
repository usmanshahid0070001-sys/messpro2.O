import mongoose from 'mongoose';
import User from './auth.model.js';
import PlainUser from './plainUser.model.js';

class AuthRepository {
  async findByEmailOrId(email, id) {
    const conditions = [];
    if (email) conditions.push({ email });
    if (id) conditions.push({ id });
    if (conditions.length === 0) return null;
    return await User.findOne({ $or: conditions });
  }

  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email });
    if (includePassword) {
      query.select('+password');
    }
    return await query;
  }

  async findById(id) {
    return await User.findById(id);
  }

  async countByRole(hostelId, role) {
    return await User.countDocuments({ hostelId: hostelId.toString(), role });
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

  async deleteUserById(id, session = null) {
    const options = session ? { session } : {};
    return await User.findByIdAndDelete(id, options);
  }

  async deletePlainUserByEmail(email, session = null) {
    const options = session ? { session } : {};
    return await PlainUser.findOneAndDelete({ email }, options);
  }

  async startSession() {
    return await mongoose.startSession();
  }
}

export default new AuthRepository();
