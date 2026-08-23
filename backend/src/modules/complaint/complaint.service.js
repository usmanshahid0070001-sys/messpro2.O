import * as complaintRepository from './complaint.repository.js';

export const createComplaint = async (complaintData) => {
  return await complaintRepository.createComplaint(complaintData);
};

export const getStudentComplaints = async (roll_number) => {
  return await complaintRepository.getComplaintsByStudent(roll_number);
};

export const getComplaints = async (statusFilter, hostelId) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const filter = {
    createdAt: { $gte: thirtyDaysAgo },
  };

  if (hostelId) {
    filter.hostelid = hostelId;
  }

  // Handle status filter logic
  if (statusFilter) {
    const status = statusFilter.toLowerCase();
    if (status === 'all') {
      // 'All' toggle: return unresolved complaints
      filter.status = { $in: ['Open', 'Assigned', 'In Progress'] };
    } else if (status === 'resolved') {
      filter.status = 'Resolved';
    } else if (status === 'open') {
      filter.status = 'Open';
    } else if (status === 'assigned') {
      filter.status = 'Assigned';
    } else if (status === 'in progress') {
      filter.status = 'In Progress';
    }
  } else {
    // Default to unresolved if no filter provided
    filter.status = { $in: ['Open', 'Assigned', 'In Progress'] };
  }

  return await complaintRepository.getComplaintsByFilter(filter);
};

export const deleteComplaint = async (id, roll_number) => {
  const complaint = await complaintRepository.getComplaintById(id);
  
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  // Ensure only the owner can delete
  if (complaint.roll_number !== roll_number) {
    const error = new Error('You do not have permission to delete this complaint');
    error.statusCode = 403;
    throw error;
  }

  // Ensure it can only be deleted if it is 'Open'
  if (complaint.status !== 'Open') {
    const error = new Error('You can only delete complaints that are in Open status');
    error.statusCode = 400;
    throw error;
  }

  return await complaintRepository.deleteComplaint(id);
};

export const updateComplaintStatus = async (id, status, hostelId) => {
  const filter = hostelId ? { _id: id, hostelid: hostelId } : { _id: id };
  const complaint = await complaintRepository.updateComplaintByFilter(filter, { status });
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }
  return complaint;
};
