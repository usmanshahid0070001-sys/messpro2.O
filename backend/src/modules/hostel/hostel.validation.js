import { z } from 'zod';

export const createHostelSchema = z.object({
  // Syntactical: Must be a string, at least 3 chars
  name: z.string().min(3, "Hostel name must be at least 3 characters"),

  // Syntactical & Semantic: Must be valid URL format for subdomains
  subdomain: z.string()
    .min(3, "Domain suffix is required")
    // 👇 The regex allows an optional '@' at the start, plus dots!
    .regex(/^@?[a-zA-Z0-9.-]+$/, "Must be a valid email domain (e.g., @student.uet.edu.pk)"),

  location: z.string().min(2, "Location is required"),

  adminName: z.string().min(2, 'Admin name is required.'),
  adminEmail: z.string().email('Valid admin email is required.'),
  managerName: z.string().min(2, 'Manager name is required.'),
  managerEmail: z.string().email('Valid manager email is required.'),

  // Semantic: Plan ID from the database
  plan: z.string().optional(),

  // Settings are optional during creation; defaults will apply
  settings: z.object({
    authMethod: z.enum(['Email', 'RollNumber']).optional(),
    attendanceMethod: z.enum(['Manual', 'QR', 'Biometric']).optional(),
    billingModel: z.enum(['Prepaid', 'Postpaid', 'FlatRate']).optional(),
    // 👇 NEW: Optional max selection default on creation
    maxMealSelection: z.number().int().min(1).max(10).optional(),
  }).optional()
});

export const addHostelUserSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('A valid email is required.'),
  role: z.enum(['admin', 'manager']),
  permissions: z.array(z.string()).optional(),
});


// For the setting of each hostel toggle buttons
export const updateSettingsSchema = z.object({
  plan: z.string().optional(),
  additionalDays: z.number().int().min(0).optional(),
  
  // Existing fields for Hostel Configuration
  subdomain: z.string()
    .min(3, "Domain suffix is required")
    .regex(/^@?[a-zA-Z0-9.-]+$/, "Must be a valid email domain (e.g., @student.uet.edu.pk)")
    .optional(),
  
  location: z.string().min(2, "Location is required").optional(),

  customRegistrationFields: z.array(z.object({
    name: z.string().min(1, "Field name is required"),
    isRequired: z.boolean().default(false)
  })).max(5, "Maximum 5 custom fields allowed").optional(),

  "plan.features": z.array(z.object({
    name: z.string(),
    isEnabled: z.boolean()
  })).optional(),

  // ==========================================
  // 👇 NEW: UNBREAKABLE QR LOGIC & SETTINGS
  // ==========================================

  // GEOFENCING: Validate standard GPS coordinate ranges
  locationCoords: z.object({
    lat: z.number().min(-90, "Latitude must be >= -90").max(90, "Latitude must be <= 90"),
    lng: z.number().min(-180, "Longitude must be >= -180").max(180, "Longitude must be <= 180")
  }).optional(),

  // SECURE POINTER: In case the admin manually resets the printed QR
  qrSecret: z.string().length(8, "QR Secret must be exactly 8 characters").optional(),

  // SETTINGS UPDATES (Includes the new maxMealSelection rule)
  settings: z.object({
    authMethod: z.enum(['Email', 'RollNumber']).optional(),
    attendanceMethod: z.enum(['Manual', 'QR', 'Biometric']).optional(),
    billingModel: z.enum(['Prepaid', 'Postpaid', 'FlatRate']).optional(),
    autoMealVerification: z.boolean().optional(),
    
    // The Bouncer Rule: Admin can allow between 1 and 10 plates per student
    maxMealSelection: z.number()
      .int("Must be a whole number")
      .min(1, "Students must be allowed to select at least 1 meal")
      .max(10, "Cannot exceed 10 meals per selection")
      .optional()
  }).optional(),
});