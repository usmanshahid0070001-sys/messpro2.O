import User from '../auth/auth.model.js';
import PlainUser from '../auth/plainUser.model.js';

class UserRepository {
  async findUsers(query = {}) {
    return User.find(query)
      .populate('room', 'roomName capacity status')
      .select('-password')
      .sort({ createdAt: -1 });
  }

  async findById(userId) {
    return User.findById(userId);
  }

  async findByIdAndUpdate(userId, updateData, options = { new: true, runValidators: true }) {
    return User.findByIdAndUpdate(userId, { $set: updateData }, options).select('-password');
  }

  async syncPlainUser(email, syncData) {
    if (!email || typeof email !== 'string') return null;
    return PlainUser.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { $set: syncData }
    );
  }
}

export default new UserRepository();
