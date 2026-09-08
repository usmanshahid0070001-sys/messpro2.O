import User from '../auth/auth.model.js';
import PlainUser from '../auth/plainUser.model.js';
import Bill from '../billing/bill.model.js';
import Room from '../residence/room.model.js';
import Hostel from '../hostel/hostel.model.js';
import { cache } from '../../config/cache.js';

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

  async findPendingBillsByUser(hostelId, userId, rollNumber) {
    const conditions = [];
    if (userId) conditions.push({ studentId: userId });
    if (rollNumber) conditions.push({ rollNumber: String(rollNumber).toLowerCase().trim() });

    if (conditions.length === 0) return [];

    return Bill.find({
      hostelId,
      $or: conditions,
      $and: [
        {
          $or: [
            { status: 'Unpaid' },
            { remainingBill: { $gt: 0 } }
          ]
        }
      ]
    }).lean();
  }

  async unassignRoomOccupant(roomId) {
    if (!roomId) return null;
    const room = await Room.findById(roomId);
    if (!room) return null;

    room.occupants = Math.max(0, (room.occupants || 0) - 1);
    if (room.status === 'Full' && room.occupants < room.capacity) {
      room.status = 'Available';
    }
    return await room.save();
  }

  async deleteUserById(userId) {
    return User.findByIdAndDelete(userId);
  }

  async deletePlainUserByEmail(email) {
    if (!email || typeof email !== 'string') return null;
    return PlainUser.findOneAndDelete({ email: email.toLowerCase().trim() });
  }

  async syncHostelUserLimit(hostelId, role) {
    if (!hostelId || (role !== 'student' && role !== 'manager')) return;
    const count = await User.countDocuments({ hostelId, role });
    const countField = role === 'manager' ? 'plan.limits.managers' : 'plan.limits.students';
    await Hostel.findByIdAndUpdate(hostelId, { $set: { [countField]: count } });
    await cache.del(`hostel:config:${hostelId}`);
  }
}

export default new UserRepository();
