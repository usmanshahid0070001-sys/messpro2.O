import mongoose from 'mongoose';
import Complaint from './complaint.model.js';

export const createComplaint = async (complaintData) => {
  const created = await Complaint.create(complaintData);
  return await Complaint.findById(created._id)
    .populate('roomid', 'roomNumber block floor')
    .populate('hostelid', 'name')
    .populate('studentId', 'name id email')
    .lean();
};

export const getComplaintsByStudent = async (studentId, roll_number, hostelId) => {
  const conditions = [];
  if (studentId) conditions.push({ studentId });
  if (roll_number) conditions.push({ roll_number });

  const query = conditions.length > 0 ? { $or: conditions } : {};
  if (hostelId) {
    query.hostelid = hostelId;
  }

  return await Complaint.find(query)
    .populate('roomid', 'roomNumber block floor')
    .populate('hostelid', 'name')
    .populate('studentId', 'name id email')
    .sort({ createdAt: -1 })
    .lean();
};

export const getComplaintsByFilter = async (filter, pagination = {}) => {
  const { page, limit } = pagination;
  let query = Complaint.find(filter)
    .populate('roomid', 'roomNumber block floor')
    .populate('hostelid', 'name')
    .populate('studentId', 'name id email')
    .sort({ createdAt: -1 });

  if (page && limit) {
    const skip = (Math.max(1, page) - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  return await query.lean();
};

export const countComplaintsByFilter = async (filter) => {
  return await Complaint.countDocuments(filter);
};

export const getComplaintById = async (id, hostelId = null) => {
  const query = { _id: id };
  if (hostelId) {
    query.hostelid = hostelId;
  }
  return await Complaint.findOne(query)
    .populate('roomid', 'roomNumber block floor')
    .populate('hostelid', 'name')
    .populate('studentId', 'name id email');
};

export const deleteComplaint = async (id) => {
  return await Complaint.findByIdAndDelete(id);
};

export const deleteComplaintByFilter = async (filter) => {
  return await Complaint.findOneAndDelete(filter);
};

export const updateComplaint = async (id, updateData) => {
  return await Complaint.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

export const updateComplaintByFilter = async (filter, updateData) => {
  return await Complaint.findOneAndUpdate(filter, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('roomid', 'roomNumber block floor')
    .populate('hostelid', 'name')
    .populate('studentId', 'name id email');
};

export const getComplaintStats = async (hostelId = null) => {
  const matchStage = {};
  if (hostelId) {
    matchStage.hostelid = typeof hostelId === 'string' ? new mongoose.Types.ObjectId(hostelId) : hostelId;
  }

  const stats = await Complaint.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        open: { $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] } },
        assigned: { $sum: { $cond: [{ $eq: ['$status', 'Assigned'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
        urgent: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$intensity', 'Urgent'] },
                  { $ne: ['$status', 'Resolved'] },
                ],
              },
              1,
              0,
            ],
          },
        },
        high: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$intensity', 'High'] },
                  { $ne: ['$status', 'Resolved'] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  if (!stats.length) {
    return {
      total: 0,
      open: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      urgent: 0,
      high: 0,
      active: 0,
    };
  }

  const result = { ...stats[0] };
  delete result._id;
  result.active = (result.open || 0) + (result.assigned || 0) + (result.inProgress || 0);
  return result;
};

