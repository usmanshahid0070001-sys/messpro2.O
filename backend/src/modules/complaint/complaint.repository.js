import Complaint from './complaint.model.js';

export const createComplaint = async (complaintData) => {
  return await Complaint.create(complaintData);
};

export const getComplaintsByStudent = async (roll_number) => {
  return await Complaint.find({ roll_number }).sort({ createdAt: -1 });
};

export const getComplaintsByFilter = async (filter) => {
  return await Complaint.find(filter)
    .populate('roomid', 'roomNumber block')
    .populate('hostelid', 'name')
    .sort({ createdAt: -1 });
};

export const getComplaintById = async (id) => {
  return await Complaint.findById(id);
};

export const deleteComplaint = async (id) => {
  return await Complaint.findByIdAndDelete(id);
};

export const updateComplaint = async (id, updateData) => {
  return await Complaint.findByIdAndUpdate(id, updateData, { new: true });
};
