import { z } from 'zod';

export const createHostelSchema = z.object({
  // Syntactical: Must be a string, at least 3 chars
  name: z.string().min(3, "Hostel name must be at least 3 characters"),
  
  // Syntactical & Semantic: Must be valid URL format for subdomains
  subdomain: z.string()
    .min(3, "Subdomain is required")
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
  
  location: z.string().min(2, "Location is required"),
  
  // Semantic: Must exactly match our allowed plans
  plan: z.enum(['Basic', 'Premium', 'Enterprise']).optional(),
  
  // Settings are optional during creation; defaults will apply
  settings: z.object({
    authMethod: z.enum(['RollNumber', 'Email', 'CNIC']).optional(),
    attendanceMethod: z.enum(['Manual', 'QR', 'Biometric']).optional(),
    billingModel: z.enum(['Prepaid', 'Postpaid', 'FlatRate']).optional(),
  }).optional()
});


//for the setting of each hostel toggle buttons
export const updateSettingsSchema = z.object({
  authMethod: z.enum(['RollNumber', 'Email', 'CNIC']).optional(),
  attendanceMethod: z.enum(['Manual', 'QR', 'Biometric']).optional(),
  billingModel: z.enum(['Prepaid', 'Postpaid', 'FlatRate']).optional(),
  autoMealVerification: z.boolean().optional()
});