import { catchAsync } from '../../utils/catchAsync.js';
import residenceService from './residence.service.js';
import {
  createRoomSchema,
  alloteRoomSchema,
  disalloteRoomSchema,
  changeRoomSchema,
  roomIdParamSchema,
} from './residence.validation.js';

export const buildNewRoom = catchAsync(async (req, res) => {
  const validatedData = createRoomSchema.parse(req.body);
  const newRoom = await residenceService.createRoom(req.user.hostelId, validatedData);
  
  res.status(201).json({
    status: 'success',
    success: true,
    message: `Room '${newRoom.roomName}' created successfully.`,
    data: newRoom,
  });
});

export const fetchAllRooms = catchAsync(async (req, res) => {
  const rooms = await residenceService.getRooms(req.user.hostelId);
  
  res.status(200).json({
    status: 'success',
    success: true,
    count: rooms.length,
    data: rooms,
  });
});

export const assignRoom = catchAsync(async (req, res) => {
  const { studentId, roomId } = alloteRoomSchema.parse(req.body);
  const result = await residenceService.alloteRoom(req.user.hostelId, studentId, roomId);
  
  res.status(200).json({
    status: 'success',
    success: true,
    message: 'Resident allotted to room successfully.',
    data: result,
  });
});

export const removeStudentFromRoom = catchAsync(async (req, res) => {
  const { studentId } = disalloteRoomSchema.parse(req.body);
  const student = await residenceService.disalloteRoom(req.user.hostelId, studentId);
  
  res.status(200).json({
    status: 'success',
    success: true,
    message: 'Resident removed from room successfully.',
    data: student,
  });
});

export const swapRoom = catchAsync(async (req, res) => {
  const { studentId, newRoomId } = changeRoomSchema.parse(req.body);
  const result = await residenceService.changeRoom(req.user.hostelId, studentId, newRoomId);
  
  res.status(200).json({
    status: 'success',
    success: true,
    message: 'Resident room changed successfully.',
    data: result,
  });
});

export const removeRoom = catchAsync(async (req, res) => {
  const { id: roomId } = roomIdParamSchema.parse({ id: req.params.id });
  const result = await residenceService.deleteRoom(req.user.hostelId, roomId);
  
  res.status(200).json({
    status: 'success',
    success: true,
    message: result.message,
  });
});

// Student / Manager room endpoints
export const getMyRoomDetails = catchAsync(async (req, res) => {
  if (!['student', 'manager'].includes(req.user.role)) {
    const error = new Error('Only residents (students or managers) can access this endpoint.');
    error.statusCode = 403;
    throw error;
  }
  
  const roomDetails = await residenceService.getMyRoom(req.user._id);
  res.status(200).json({
    status: 'success',
    success: true,
    data: roomDetails,
  });
});

export const markRoomCleaning = catchAsync(async (req, res) => {
  if (req.user?.status === 'Suspended') {
    const error = new Error('Your account is currently suspended. You cannot request room services while suspended.');
    error.statusCode = 403;
    throw error;
  }

  if (!['student', 'manager'].includes(req.user.role)) {
    const error = new Error('Only residents (students or managers) can mark room cleaning.');
    error.statusCode = 403;
    throw error;
  }

  const cleaningDates = await residenceService.markCleaningAttendance(req.user._id);
  res.status(200).json({
    status: 'success',
    success: true,
    message: 'Cleaning attendance marked successfully.',
    data: cleaningDates,
  });
});