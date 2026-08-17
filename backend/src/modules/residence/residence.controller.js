import { catchAsync } from '../../utils/catchAsync.js';
import residenceService from './residence.service.js';
import { createRoomSchema, alloteRoomSchema, changeRoomSchema } from './residence.validation.js';

export const buildNewRoom = catchAsync(async (req, res) => {
  const validatedData = createRoomSchema.parse(req.body);
  const newRoom = await residenceService.createRoom(req.user.hostelId, validatedData);
  
  res.status(201).json({ success: true, data: newRoom });
});

export const fetchAllRooms = catchAsync(async (req, res) => {
  const rooms = await residenceService.getRooms(req.user.hostelId);
  
  res.status(200).json({ success: true, count: rooms.length, data: rooms });
});

export const assignRoom = catchAsync(async (req, res) => {
  const { studentId, roomId } = alloteRoomSchema.parse(req.body);
  const result = await residenceService.alloteRoom(req.user.hostelId, studentId, roomId);
  
  res.status(200).json({ success: true, message: 'Room allotted successfully.', data: result });
});

export const removeStudentFromRoom = catchAsync(async (req, res) => {
  // We can pass studentId in the body for this one
  const { studentId } = req.body;
  if (!studentId) throw new Error('Student ID is required.');

  const student = await residenceService.disalloteRoom(req.user.hostelId, studentId);
  
  res.status(200).json({ success: true, message: 'Student removed from room successfully.', data: student });
});

export const swapRoom = catchAsync(async (req, res) => {
  const { studentId, newRoomId } = changeRoomSchema.parse(req.body);
  const result = await residenceService.changeRoom(req.user.hostelId, studentId, newRoomId);
  
  res.status(200).json({ success: true, message: 'Room changed successfully.', data: result });
});

export const removeRoom = catchAsync(async (req, res) => {
  const roomId = req.params.id; // Grab the room ID from the URL
  const result = await residenceService.deleteRoom(req.user.hostelId, roomId);
  
  res.status(200).json({ success: true, message: result.message });
});

// Student / Manager room endpoints
export const getMyRoomDetails = catchAsync(async (req, res) => {
  if (!['student', 'manager'].includes(req.user.role)) {
    const error = new Error('Only residents (students or managers) can access this endpoint.');
    error.statusCode = 403;
    throw error;
  }
  
  const roomDetails = await residenceService.getMyRoom(req.user._id);
  res.status(200).json({ success: true, data: roomDetails });
});

export const markRoomCleaning = catchAsync(async (req, res) => {
  if (!['student', 'manager'].includes(req.user.role)) {
    const error = new Error('Only residents (students or managers) can mark room cleaning.');
    error.statusCode = 403;
    throw error;
  }

  const cleaningDates = await residenceService.markCleaningAttendance(req.user._id);
  res.status(200).json({ success: true, message: 'Cleaning attendance marked successfully.', data: cleaningDates });
});