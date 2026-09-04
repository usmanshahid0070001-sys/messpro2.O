import { z } from 'zod';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const SUBDOMAIN_REGEX = /^@?[a-zA-Z0-9.-]+$/;

// Parameter validation for :id
export const hostelIdParamSchema = z.object({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid Hostel ID structure.'),
});

// Query filter schema for listing hostels (Superadmin)
export const hostelQuerySchema = z.object({
  status: z.enum(['Active', 'Suspended', 'Archived', 'Inactive', 'Expired']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
});

// Create Hostel Schema (Superadmin only)
export const createHostelSchema = z.object({
  name: z.string().trim().min(3, 'Hostel name must be at least 3 characters').max(100, 'Hostel name cannot exceed 100 characters'),
  subdomain: z.string()
    .trim()
    .min(3, 'Domain suffix is required')
    .regex(SUBDOMAIN_REGEX, 'Must be a valid domain or email domain (e.g., @student.uet.edu.pk or boys-hostel)'),
  location: z.string().trim().min(2, 'Location is required').max(150, 'Location cannot exceed 150 characters'),
  adminName: z.string().trim().min(2, 'Admin name is required.').max(100),
  adminEmail: z.string().trim().toLowerCase().email('Valid admin email is required.'),
  managerName: z.string().trim().max(100).optional().or(z.literal('')),
  managerEmail: z.string().trim().toLowerCase().email('Valid manager email is required.').optional().or(z.literal('')),
  plan: z.string().regex(OBJECT_ID_REGEX, 'Invalid Plan ID structure.').optional(),
  settings: z.object({
    authMethod: z.enum(['Email', 'RollNumber']).default('Email').optional(),
    attendanceMethod: z.enum(['Manual', 'QR', 'Biometric']).default('Manual').optional(),
    billingModel: z.enum(['Prepaid', 'Postpaid', 'FlatRate']).default('Prepaid').optional(),
    autoMealVerification: z.boolean().default(true).optional(),
    maxMealSelection: z.number().int().min(1, 'Minimum 1 meal').max(10, 'Maximum 10 meals').default(4).optional(),
  }).optional(),
});

// Add Staff or Member User Schema
export const addHostelUserSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.').max(100),
  email: z.string().trim().toLowerCase().email('A valid email is required.'),
  role: z.enum(['admin', 'manager', 'student']),
  permissions: z.array(z.string().trim()).optional(),
});

// Tenant Configuration Schema (Admin updating own hostel settings)
// Strictly forbids tenant privilege escalation (cannot modify plan, additionalDays, status, limits)
export const updateTenantSettingsSchema = z.object({
  subdomain: z.union([
    z.string().length(0),
    z.string().trim().min(3, 'Domain suffix must be at least 3 characters').regex(SUBDOMAIN_REGEX, 'Must be a valid domain suffix')
  ]).optional(),
  
  location: z.string().trim().min(2, 'Location is required').max(150).optional(),

  customRegistrationFields: z.array(z.object({
    name: z.string().trim().min(1, 'Field name is required').max(50, 'Field name too long'),
    isRequired: z.boolean().default(false),
  }))
  .max(5, 'Maximum 5 custom fields allowed')
  .refine(
    (fields) => {
      const names = fields.map(f => f.name.toLowerCase());
      return new Set(names).size === names.length;
    },
    { message: 'Custom field names must be unique.' }
  )
  .optional(),

  'plan.features': z.array(z.object({
    name: z.string().trim(),
    isEnabled: z.boolean(),
  })).optional(),

  planFeatures: z.array(z.object({
    name: z.string().trim(),
    isEnabled: z.boolean(),
  })).optional(),

  locationCoords: z.object({
    lat: z.number().min(-90, 'Latitude must be >= -90').max(90, 'Latitude must be <= 90'),
    lng: z.number().min(-180, 'Longitude must be >= -180').max(180, 'Longitude must be <= 180'),
  }).optional(),

  qrSecret: z.string().trim().length(8, 'QR Secret must be exactly 8 characters').optional(),

  settings: z.object({
    authMethod: z.enum(['Email', 'RollNumber']).optional(),
    attendanceMethod: z.enum(['Manual', 'QR', 'Biometric']).optional(),
    billingModel: z.enum(['Prepaid', 'Postpaid', 'FlatRate']).optional(),
    autoMealVerification: z.boolean().optional(),
    maxMealSelection: z.number().int().min(1, 'Students must be allowed at least 1 meal').max(10, 'Cannot exceed 10 meals per selection').optional(),
  }).optional(),
});

// Superadmin Hostel Update Schema (Supports subscription extension, plan upgrade, status changes, and settings)
export const superadminUpdateHostelSettingsSchema = updateTenantSettingsSchema.extend({
  name: z.string().trim().min(3).max(100).optional(),
  plan: z.string().regex(OBJECT_ID_REGEX, 'Invalid Plan ID structure.').optional(),
  additionalDays: z.number().int().min(0, 'Additional days cannot be negative').optional(),
  status: z.enum(['Active', 'Suspended', 'Archived', 'Inactive', 'Expired']).optional(),
  isTrial: z.boolean().optional(),
});

// Backward-compatibility alias
export const updateSettingsSchema = superadminUpdateHostelSettingsSchema;

// ─── Public Hostel Setup Request Schema ───────────────────────────────────────
export const createHostelRequestSchema = z.object({
  hostelName: z.string().trim().min(3, 'Hostel name must be at least 3 characters.').max(100),
  subdomain: z.string().trim().min(3, 'Subdomain must be at least 3 characters.').max(50).toLowerCase(),
  location: z.string().trim().min(2, 'Location / Timezone is required.').default('Asia/Karachi'),
  address: z.string().trim().max(250).optional().default(''),
  adminName: z.string().trim().min(2, 'Administrator name is required.').max(100),
  adminEmail: z.string().trim().email('Valid administrator email is required.').toLowerCase(),
  adminPhone: z.string().trim().min(6, 'Valid WhatsApp contact phone number is required.').max(30),
  managerName: z.string().trim().max(100).optional().default(''),
  managerEmail: z.string().trim().email('Valid manager email is required.').toLowerCase().optional().or(z.literal('')),
  requestedPlan: z.object({
    planType: z.enum(['10_day_trial', 'trial', 'standard', 'enterprise', 'custom']).default('10_day_trial'),
    planId: z.string().regex(OBJECT_ID_REGEX, 'Invalid Plan ID format.').optional(),
    estimatedStudents: z.number().int().min(1).max(50000).default(100),
    estimatedManagers: z.number().int().min(1).max(500).default(2),
    desiredFeatures: z.array(z.string().trim()).optional().default([]),
    customFeatures: z.array(z.string().trim()).optional().default([]),
    notes: z.string().trim().max(1000).optional().default(''),
  }).optional().default({}),
});


// ─── Superadmin Approval & Rejection Schemas ──────────────────────────────────
export const approveHostelRequestSchema = z.object({
  planId: z.string().regex(OBJECT_ID_REGEX, 'Selected subscription Plan ID is required.'),
  temporaryPassword: z.string().trim().min(6, 'Temporary password must be at least 6 characters.').max(100).optional().or(z.literal('')),
  supportEmail: z.string().trim().email('Invalid support email.').toLowerCase().optional().or(z.literal('')),
  supportPhone: z.string().trim().max(50).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional(),
});

export const rejectHostelRequestSchema = z.object({
  reason: z.string().trim().min(3, 'Please provide a clear reason for rejecting the request.').max(500),
});

export const hostelRequestIdParamSchema = z.object({
  id: z.string().regex(OBJECT_ID_REGEX, 'Invalid Hostel Request ID format.'),
});