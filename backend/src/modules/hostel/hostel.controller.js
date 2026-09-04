import hostelService from './hostel.service.js';
import {
  createHostelSchema,
  hostelIdParamSchema,
  hostelQuerySchema,
  updateTenantSettingsSchema,
  superadminUpdateHostelSettingsSchema,
  addHostelUserSchema,
} from './hostel.validation.js';
import { catchAsync } from '../../utils/catchAsync.js';

/**
 * Superadmin: Register a new hostel with admin + manager
 */
export const createHostel = catchAsync(async (req, res) => {
  const validatedData = createHostelSchema.parse(req.body);
  const newHostel = await hostelService.registerHostel(validatedData);

  res.status(201).json({
    success: true,
    message: 'Hostel registered successfully.',
    data: newHostel,
  });
});

/**
 * Superadmin: Get list of all hostels with search, status filtering, and pagination
 */
export const getHostels = catchAsync(async (req, res) => {
  const validatedQuery = hostelQuerySchema.parse(req.query);
  const result = await hostelService.getAllHostels(validatedQuery);

  res.status(200).json({
    success: true,
    count: result.hostels.length,
    total: result.total,
    page: result.page,
    data: result.hostels,
  });
});

/**
 * Superadmin or authorized tenant: Get specific hostel by ID
 */
export const getHostelById = catchAsync(async (req, res) => {
  const { id } = hostelIdParamSchema.parse(req.params);

  // Cross-tenant verification: Non-superadmins can only access their own hostel
  if (req.user.role !== 'superadmin' && String(id) !== String(req.user.hostelId)) {
    const error = new Error('Access Denied: You cannot view details for another hostel.');
    error.statusCode = 403;
    throw error;
  }

  const hostel = await hostelService.getHostelById(id, req.user.role);
  res.status(200).json({
    success: true,
    data: hostel,
  });
});

/**
 * Tenant (Admin, Manager, Student): Get details of the caller's assigned hostel
 */
export const getMyHostel = catchAsync(async (req, res) => {
  const hostelId = req.user.hostelId || req.user.hostelid;
  if (!hostelId) {
    const error = new Error('User is not associated with any hostel.');
    error.statusCode = 400;
    throw error;
  }

  const hostel = await hostelService.getHostelById(hostelId, req.user.role);
  res.status(200).json({
    success: true,
    data: hostel,
  });
});

/**
 * Tenant Admin: Update own hostel configuration (Strictly prevents privilege escalation)
 */
export const updateMyHostelSettings = catchAsync(async (req, res) => {
  const hostelId = req.user.hostelId || req.user.hostelid;
  if (!hostelId) {
    const error = new Error('User is not associated with any hostel.');
    error.statusCode = 400;
    throw error;
  }

  const validatedData = updateTenantSettingsSchema.parse(req.body);
  const updatedHostel = await hostelService.updateTenantSettings(hostelId, validatedData);

  res.status(200).json({
    success: true,
    message: 'Hostel settings updated successfully.',
    data: updatedHostel,
  });
});

/**
 * Superadmin: Update hostel configuration, subscription, plan, and status
 */
export const updateSettings = catchAsync(async (req, res) => {
  const { id } = hostelIdParamSchema.parse(req.params);
  const validatedData = superadminUpdateHostelSettingsSchema.parse(req.body);

  const updatedHostel = await hostelService.updateSuperadminHostelSettings(id, validatedData);

  res.status(200).json({
    success: true,
    message: 'Hostel updated successfully.',
    data: updatedHostel,
  });
});

/**
 * Superadmin / Admin / Manager: Add a new user under a hostel
 */
export const addHostelUser = catchAsync(async (req, res) => {
  const { id } = hostelIdParamSchema.parse(req.params);
  const creatorRole = req.user.role;

  if (creatorRole !== 'superadmin' && String(id) !== String(req.user.hostelId)) {
    const error = new Error('Cross-tenant user creation is not allowed.');
    error.statusCode = 403;
    throw error;
  }

  const validatedData = addHostelUserSchema.parse(req.body);
  const newUser = await hostelService.addHostelUser(creatorRole, id, validatedData);

  res.status(201).json({
    success: true,
    message: `${validatedData.role} added successfully.`,
    data: newUser,
  });
});
