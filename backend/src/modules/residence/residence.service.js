import Room from './room.model.js';
import User from '../auth/auth.model.js';

class ResidenceService {
  
  // 1. ADD A NEW ROOM (Admin builds the room)
  async createRoom(hostelId, roomData) {
    // Check if this specific hostel already has a room with this name
    const existingRoom = await Room.findOne({ hostelId, roomName: roomData.roomName });
    if (existingRoom) {
      const error = new Error(`Room '${roomData.roomName}' already exists in your hostel.`);
      error.statusCode = 400;
      throw error;
    }

    return await Room.create({ ...roomData, hostelId });
  }

  // 2. GET ALL ROOMS (For the frontend table)
  async getRooms(hostelId) {
    // Sorts the rooms alphabetically by name (e.g., A-1, A-2, B-1)
    return await Room.find({ hostelId }).sort({ roomName: 1 });
  }

  // 3. ALLOTE A ROOM TO A STUDENT
  async alloteRoom(hostelId, studentId, roomId) {
    const room = await Room.findOne({ _id: roomId, hostelId });
    if (!room) throw new Error('Room not found.');
    
    // The Bouncer: Stop them if the room is full
    if (room.occupants >= room.capacity) {
      const error = new Error('This room is already at maximum capacity.');
      error.statusCode = 400;
      throw error;
    }

    const student = await User.findOne({ _id: studentId, hostelId, role: 'student' });
    if (!student) throw new Error('Student not found.');
    if (student.room) {
      const error = new Error('This student already has a room. Use the "Change Room" feature instead.');
      error.statusCode = 400;
      throw error;
    }

    // Step A: Update the Room logic
    room.occupants += 1;
    if (room.occupants === room.capacity) {
      room.status = 'Full'; // Automatically mark it as full if it reaches capacity!
    }
    await room.save();

    // Step B: Attach the room to the student
    student.room = room._id;
    await student.save();

    return { student, room };
  }

  // 4. DISALLOTEMENT (Remove student from room)
  async disalloteRoom(hostelId, studentId) {
    const student = await User.findOne({ _id: studentId, hostelId, role: 'student' });
    if (!student) throw new Error('Student not found.');
    if (!student.room) throw new Error('This student is not currently assigned to any room.');

    const room = await Room.findById(student.room);
    
    if (room) {
      // Step A: Remove 1 from the room count (Math.max prevents it from ever going below 0)
      room.occupants = Math.max(0, room.occupants - 1);
      room.status = 'Available'; // Automatically reopen the room
      await room.save();
    }

    // Step B: Clear the student's room data
    student.room = null;
    await student.save();

    return student;
  }

  // 5. CHANGE ROOM (Move student from one room to another)
  async changeRoom(hostelId, studentId, newRoomId) {
    const student = await User.findOne({ _id: studentId, hostelId, role: 'student' });
    if (!student) throw new Error('Student not found.');
    if (!student.room) throw new Error('Student has no room. Use the "Allote Room" feature instead.');
    if (student.room.toString() === newRoomId) throw new Error('Student is already assigned to this room.');

    const newRoom = await Room.findOne({ _id: newRoomId, hostelId });
    if (!newRoom) throw new Error('New room not found.');
    if (newRoom.occupants >= newRoom.capacity) {
      const error = new Error('The new room is already at maximum capacity.');
      error.statusCode = 400;
      throw error;
    }

    const oldRoom = await Room.findById(student.room);

    // Step A: Remove from old room
    if (oldRoom) {
      oldRoom.occupants = Math.max(0, oldRoom.occupants - 1);
      oldRoom.status = 'Available';
      await oldRoom.save();
    }

    // Step B: Add to new room
    newRoom.occupants += 1;
    if (newRoom.occupants === newRoom.capacity) newRoom.status = 'Full';
    await newRoom.save();

    // Step C: Update student
    student.room = newRoom._id;
    await student.save();

    return { student, newRoom, oldRoom };
  }

  // 6. DELETE A ROOM
  async deleteRoom(hostelId, roomId) {
    const room = await Room.findOne({ _id: roomId, hostelId });
    if (!room) throw new Error('Room not found.');

    // The SaaS Bouncer: Prevent corrupting data
    if (room.occupants > 0) {
      const error = new Error('Cannot delete this room. You must disallote all students inside it first.');
      error.statusCode = 400;
      throw error;
    }

    await Room.deleteOne({ _id: roomId });
    return { message: 'Room deleted successfully.' };
  }
}

export default new ResidenceService();