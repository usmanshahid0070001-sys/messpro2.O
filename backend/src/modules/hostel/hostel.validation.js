import { z } from 'zod';

export const createHostelSchema = z.object({
  // Syntactical: Must be a string, at least 3 chars
  name: z.string().min(3, "Hostel name must be at least 3 characters"),

  // Syntactical & Semantic: Must be valid URL format for subdomains
  subdomain: z.string()
    .min(3, "Subdomain is required")
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),

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
  }).optional()
});

export const addHostelUserSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('A valid email is required.'),
  role: z.enum(['admin', 'manager']),
});


//for the setting of each hostel toggle buttons
export const updateSettingsSchema = z.object({
  plan: z.string().optional(),
});