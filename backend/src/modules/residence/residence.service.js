import mongoose from 'mongoose';
import residenceRepository from './residence.repository.js';

class ResidenceService {
  // Helper to execute with transaction if MongoDB replica set is available,
  // or execute with compensating rollback for standalone MongoDB
  async _executeWithTransaction(workFn, compensateFn = null) {
    let session = null;
    let supportsTransactions = false;

    try {
      session = await mongoose.startSession();
      session.startTransaction();
      supportsTransactions = true;
    } catch {
      // Standalone MongoDB without replica set does not support multi-doc transactions
      if (session) {
        await session.endSession().catch(() => {});
        session = null;
      }
      supportsTransactions = false;
    }

    if (supportsTransactions && session) {
      try {
        const result = await workFn(session);
        await session.commitTransaction();
        return result;
      } catch (err) {
        await session.abortTransaction().catch(() => {});
        throw err;
      } finally {
        await session.endSession().catch(() => {});
      }
    }

    // Fallback path: execute directly with manual compensating rollback
    try {
      return await workFn(null);
    } catch (err) {
      if (compensateFn) {
        try {
          await compensateFn();
        } catch (compErr) {
          console.error('Compensating rollback failed:', compErr);
        }
      }
      throw err;
    }
  }

  // 1. ADD A NEW ROOM (Admin builds the room)
  async createRoom(hostelId, roomData) {
    const existingRoom = await residenceRepository.findRoomByName(hostelId, roomData.roomName);
    if (existingRoom) {
      const error = new Error(`Room '${roomData.roomName}' already exists in your hostel.`);
      error.statusCode = 409; // Conflict
      throw error;
    }

    return await residenceRepository.createRoom({
      ...roomData,
      hostelId,
      occupants: 0,
      status: 'Available',
      cleaningDates: [],
    });
  }

  // 2. GET ALL ROOMS (For the frontend table)
  async getRooms(hostelId) {
    return await residenceRepository.getRooms(hostelId);
  }

  // 3. ALLOTE A ROOM TO A RESIDENT (Atomic with Rollback)
  async alloteRoom(hostelId, studentId, roomId) {
    const room = await residenceRepository.findRoomByIdAndHostel(roomId, hostelId);
    if (!room) {
      const error = new Error('Room not found.');
      error.statusCode = 404;
      throw error;
    }

    if (room.status === 'Maintenance') {
      const error = new Error(`Cannot allot resident to Room '${room.roomName}' because it is currently under maintenance.`);
      error.statusCode = 400;
      throw error;
    }

    if (room.occupants >= room.capacity) {
      const error = new Error(`Room '${room.roomName}' is already at maximum capacity (${room.capacity} beds).`);
      error.statusCode = 400;
      throw error;
    }

    const student = await residenceRepository.findResident(studentId, hostelId);
    if (!student) {
      const error = new Error('Resident not found in this hostel.');
      error.statusCode = 404;
      throw error;
    }

    if (student.room) {
      const error = new Error('This resident is already assigned to a room. Please use the "Swap Room" feature instead.');
      error.statusCode = 400;
      throw error;
    }

    const previousRoomOccupants = room.occupants;
    const previousRoomStatus = room.status;

    return await this._executeWithTransaction(
      async (session) => {
        // Step A: Update room occupancy and status
        room.occupants += 1;
        if (room.occupants >= room.capacity) {
          room.status = 'Full';
        }
        await room.save(session ? { session } : undefined);

        // Step B: Attach room to resident
        student.room = room._id;
        await student.save(session ? { session } : undefined);

        return { student, room };
      },
      // Compensating rollback for standalone Mongo:
      async () => {
        room.occupants = previousRoomOccupants;
        room.status = previousRoomStatus;
        await room.save().catch(() => {});
      }
    );
  }

  // 4. DISALLOTEMENT (Remove resident from room with Rollback)
  async disalloteRoom(hostelId, studentId) {
    const student = await residenceRepository.findResident(studentId, hostelId);
    if (!student) {
      const error = new Error('Resident not found in this hostel.');
      error.statusCode = 404;
      throw error;
    }

    if (!student.room) {
      const error = new Error('This resident is not currently assigned to any room.');
      error.statusCode = 400;
      throw error;
    }

    const room = await residenceRepository.findRoomById(student.room);
    const assignedRoomId = student.room;
    let previousRoomOccupants = room?.occupants ?? 0;
    let previousRoomStatus = room?.status ?? 'Available';

    return await this._executeWithTransaction(
      async (session) => {
        // Step A: Update room if exists
        if (room) {
          room.occupants = Math.max(0, room.occupants - 1);
          if (room.status === 'Full' && room.occupants < room.capacity) {
            room.status = 'Available';
          }
          await room.save(session ? { session } : undefined);
        }

        // Step B: Clear resident's room
        student.room = null;
        await student.save(session ? { session } : undefined);

        return student;
      },
      // Compensating rollback:
      async () => {
        student.room = assignedRoomId;
        await student.save().catch(() => {});
        if (room) {
          room.occupants = previousRoomOccupants;
          room.status = previousRoomStatus;
          await room.save().catch(() => {});
        }
      }
    );
  }

  // 5. CHANGE ROOM (Move resident between rooms with Rollback)
  async changeRoom(hostelId, studentId, newRoomId) {
    const student = await residenceRepository.findResident(studentId, hostelId);
    if (!student) {
      const error = new Error('Resident not found in this hostel.');
      error.statusCode = 404;
      throw error;
    }

    if (!student.room) {
      const error = new Error('Resident has no active room allocation. Please use "Allot Resident" instead.');
      error.statusCode = 400;
      throw error;
    }

    if (String(student.room) === String(newRoomId)) {
      const error = new Error('Resident is already assigned to this exact room.');
      error.statusCode = 400;
      throw error;
    }

    const newRoom = await residenceRepository.findRoomByIdAndHostel(newRoomId, hostelId);
    if (!newRoom) {
      const error = new Error('Target room not found.');
      error.statusCode = 404;
      throw error;
    }

    if (newRoom.status === 'Maintenance') {
      const error = new Error(`Cannot transfer to Room '${newRoom.roomName}' because it is under maintenance.`);
      error.statusCode = 400;
      throw error;
    }

    if (newRoom.occupants >= newRoom.capacity) {
      const error = new Error(`Room '${newRoom.roomName}' is already at maximum capacity (${newRoom.capacity} beds).`);
      error.statusCode = 400;
      throw error;
    }

    const oldRoom = await residenceRepository.findRoomById(student.room);
    const oldRoomPrevOccupants = oldRoom?.occupants ?? 0;
    const oldRoomPrevStatus = oldRoom?.status ?? 'Available';
    const newRoomPrevOccupants = newRoom.occupants;
    const newRoomPrevStatus = newRoom.status;

    return await this._executeWithTransaction(
      async (session) => {
        // Step A: Evict from old room
        if (oldRoom) {
          oldRoom.occupants = Math.max(0, oldRoom.occupants - 1);
          if (oldRoom.status === 'Full' && oldRoom.occupants < oldRoom.capacity) {
            oldRoom.status = 'Available';
          }
          await oldRoom.save(session ? { session } : undefined);
        }

        // Step B: Add to new room
        newRoom.occupants += 1;
        if (newRoom.occupants >= newRoom.capacity) {
          newRoom.status = 'Full';
        }
        await newRoom.save(session ? { session } : undefined);

        // Step C: Update student reference
        student.room = newRoom._id;
        await student.save(session ? { session } : undefined);

        return { student, newRoom, oldRoom };
      },
      // Compensating rollback:
      async () => {
        student.room = oldRoom ? oldRoom._id : null;
        await student.save().catch(() => {});
        if (oldRoom) {
          oldRoom.occupants = oldRoomPrevOccupants;
          oldRoom.status = oldRoomPrevStatus;
          await oldRoom.save().catch(() => {});
        }
        newRoom.occupants = newRoomPrevOccupants;
        newRoom.status = newRoomPrevStatus;
        await newRoom.save().catch(() => {});
      }
    );
  }

  // 6. DELETE A ROOM (With Rollback for Occupants)
  async deleteRoom(hostelId, roomId) {
    const room = await residenceRepository.findRoomByIdAndHostel(roomId, hostelId);
    if (!room) {
      const error = new Error('Room not found.');
      error.statusCode = 404;
      throw error;
    }

    return await this._executeWithTransaction(
      async (session) => {
        // Disallot all occupants atomically
        if (room.occupants > 0) {
          await residenceRepository.updateManyUsers(
            { room: roomId, hostelId },
            { $set: { room: null } },
            session
          );
        }

        await residenceRepository.deleteRoomById(roomId, session);
        return { message: `Room '${room.roomName}' deleted and residents deallocated successfully.` };
      },
      // Compensating rollback:
      async () => {
        // In case deleteRoom failed after updating users
        await residenceRepository.createRoom(room.toObject()).catch(() => {});
      }
    );
  }

  // 7. GET MY ROOM (For Student Dashboard)
  async getMyRoom(studentId) {
    const student = await residenceRepository.findUserById(studentId);
    if (!student || !student.room) {
      const error = new Error('You do not have a room allotted yet. Please contact your hostel administrator or manager.');
      error.statusCode = 404;
      throw error;
    }

    const room = await residenceRepository.findRoomByIdLean(student.room);
    if (!room) {
      const error = new Error('Your allotted room details could not be found.');
      error.statusCode = 404;
      throw error;
    }

    // Fetch roommates
    const roommates = await residenceRepository.findRoommates(student.room);
    room.roommates = roommates || [];
    return room;
  }

  // 8. MARK CLEANING ATTENDANCE (Student logs that room was cleaned)
  async markCleaningAttendance(studentId) {
    const student = await residenceRepository.findUserById(studentId);
    if (!student || !student.room) {
      const error = new Error('You must be allotted a room to log cleaning attendance.');
      error.statusCode = 400;
      throw error;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const room = await residenceRepository.findRoomById(student.room);
    if (!room) {
      const error = new Error('Room not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check if already marked today
    const alreadyMarkedToday = room.cleaningDates?.some((date) => {
      const markDate = new Date(date);
      markDate.setHours(0, 0, 0, 0);
      return markDate.getTime() === today.getTime();
    });

    if (alreadyMarkedToday) {
      const error = new Error('Cleaning attendance has already been logged for today.');
      error.statusCode = 400;
      throw error;
    }

    // Push new date and keep only the last 15 entries
    const updatedRoom = await residenceRepository.pushCleaningDate(student.room);
    return updatedRoom.cleaningDates;
  }
}

export default new ResidenceService();