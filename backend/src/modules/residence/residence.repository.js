import Room from './room.model.js';
import User from '../auth/auth.model.js';

class ResidenceRepository {
  async findRoomByName(hostelId, roomName, session = null) {
    const escapedName = roomName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const query = Room.findOne({
      hostelId,
      roomName: { $regex: new RegExp(`^${escapedName}$`, 'i') },
    });
    if (session) query.session(session);
    return query;
  }

  async createRoom(roomData, session = null) {
    if (session) {
      const [room] = await Room.create([roomData], { session });
      return room;
    }
    return Room.create(roomData);
  }

  async getRooms(hostelId) {
    return Room.find({ hostelId }).sort({ roomName: 1 });
  }

  async findRoomByIdAndHostel(roomId, hostelId, session = null) {
    const query = Room.findOne({ _id: roomId, hostelId });
    if (session) query.session(session);
    return query;
  }

  async findRoomById(roomId, session = null) {
    const query = Room.findById(roomId);
    if (session) query.session(session);
    return query;
  }

  async findRoomByIdLean(roomId) {
    return Room.findById(roomId).lean();
  }

  async findResident(studentId, hostelId, session = null) {
    const query = User.findOne({
      _id: studentId,
      hostelId,
      role: { $in: ['student', 'manager'] },
    });
    if (session) query.session(session);
    return query;
  }

  async findUserById(userId, session = null) {
    const query = User.findById(userId);
    if (session) query.session(session);
    return query;
  }

  async findRoommates(roomId) {
    return User.find({ room: roomId }, 'name id role').lean();
  }

  async updateManyUsers(filter, update, session = null) {
    const options = session ? { session } : {};
    return User.updateMany(filter, update, options);
  }

  async deleteRoomById(roomId, session = null) {
    const options = session ? { session } : {};
    return Room.deleteOne({ _id: roomId }, options);
  }

  async pushCleaningDate(roomId, date = new Date(), limit = -15) {
    return Room.findByIdAndUpdate(
      roomId,
      {
        $push: {
          cleaningDates: {
            $each: [date],
            $slice: limit,
          },
        },
      },
      { new: true }
    );
  }
}

export default new ResidenceRepository();
