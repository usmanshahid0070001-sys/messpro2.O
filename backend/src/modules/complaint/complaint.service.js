import * as complaintRepository from './complaint.repository.js';

export const createComplaint = async (complaintData) => {
  if (!complaintData.hostelid) {
    const error = new Error('Hostel ID is required to file a complaint.');
    error.statusCode = 400;
    throw error;
  }
  return await complaintRepository.createComplaint(complaintData);
};

export const getStudentComplaints = async (studentId, roll_number, hostelId) => {
  return await complaintRepository.getComplaintsByStudent(studentId, roll_number, hostelId);
};

export const getComplaints = async ({
  statusFilter = 'all',
  intensity,
  category,
  search,
  startDate,
  endDate,
  hostelId,
  page,
  limit,
}) => {
  const filter = {};

  if (hostelId) {
    filter.hostelid = hostelId;
  }

  // Handle status filter logic
  if (statusFilter) {
    const s = statusFilter.trim().toLowerCase();
    if (s === 'active') {
      filter.status = { $in: ['Open', 'Assigned', 'In Progress'] };
    } else if (s === 'resolved') {
      filter.status = 'Resolved';
    } else if (s === 'open') {
      filter.status = 'Open';
    } else if (s === 'assigned') {
      filter.status = 'Assigned';
    } else if (s === 'in progress') {
      filter.status = 'In Progress';
    }
    // If 'all', do not constrain status so all complaints are returned
  }

  // Intensity filter
  if (intensity && intensity.toLowerCase() !== 'all') {
    filter.intensity = {
      $regex: new RegExp(`^${intensity}$`, 'i'),
    };
  }

  // Category filter
  if (category && category.toLowerCase() !== 'all') {
    filter.category = {
      $regex: new RegExp(`^${category}$`, 'i'),
    };
  }

  // Date range filter (optional)
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  // Search filter (text match across roll number, category, description)
  if (search && search.trim()) {
    const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { roll_number: { $regex: sanitizedSearch, $options: 'i' } },
      { category: { $regex: sanitizedSearch, $options: 'i' } },
      { description: { $regex: sanitizedSearch, $options: 'i' } },
    ];
  }

  const pagination = {};
  if (page && limit) {
    pagination.page = Number(page);
    pagination.limit = Number(limit);
  }

  return await complaintRepository.getComplaintsByFilter(filter, pagination);
};

export const getComplaintStats = async (hostelId) => {
  return await complaintRepository.getComplaintStats(hostelId);
};

export const deleteComplaint = async (id, studentUser) => {
  const complaint = await complaintRepository.getComplaintById(id);

  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  // Multi-tenant hostel check: student must be in the same hostel
  const complaintHostelId = complaint.hostelid
    ? (complaint.hostelid._id ? complaint.hostelid._id.toString() : complaint.hostelid.toString())
    : null;
  const studentHostelId = studentUser.hostelId ? studentUser.hostelId.toString() : null;

  if (studentHostelId && complaintHostelId && complaintHostelId !== studentHostelId) {
    const error = new Error('You do not have permission to delete complaints in another hostel');
    error.statusCode = 403;
    throw error;
  }

  // Ownership verification: either studentId matches user _id, or roll_number matches user id / roll_number
  const userIdStr = studentUser._id ? studentUser._id.toString() : '';
  const complaintStudentIdStr = complaint.studentId
    ? (complaint.studentId._id || complaint.studentId).toString()
    : '';

  const userRollNumber = (studentUser.id || studentUser.roll_number || '').toLowerCase();
  const complaintRollNumber = (complaint.roll_number || '').toLowerCase();

  const isOwner =
    (complaintStudentIdStr && complaintStudentIdStr === userIdStr) ||
    (complaintRollNumber && complaintRollNumber === userRollNumber);

  if (!isOwner) {
    const error = new Error('You do not have permission to delete this complaint');
    error.statusCode = 403;
    throw error;
  }

  // Ensure it can only be deleted if it is 'Open'
  if (complaint.status !== 'Open') {
    const error = new Error('You can only withdraw complaints that are in Open status');
    error.statusCode = 400;
    throw error;
  }

  return await complaintRepository.deleteComplaint(id);
};

export const updateComplaintStatus = async (id, status, hostelId) => {
  const filter = { _id: id };
  if (hostelId) {
    filter.hostelid = hostelId;
  }

  const complaint = await complaintRepository.updateComplaintByFilter(filter, { status });
  if (!complaint) {
    const error = new Error('Complaint not found or belongs to another hostel');
    error.statusCode = 404;
    throw error;
  }
  return complaint;
};

