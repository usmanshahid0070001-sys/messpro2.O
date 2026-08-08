import { z } from 'zod';

// Sub-schema for the dynamic charges
const customChargeInputSchema = z.object({
  name: z.string().min(1, "Charge name is required"),
  chargeType: z.enum(['addition', 'multiple', 'percentage']),
  value: z.number().positive("Value must be a positive number"),
  target: z.enum(['mess_bill', 'unpaid_bill', 'none']).default('none')
});

// Validation for generating the bills
export const generateBillSchema = z.object({
  billingPeriod: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format (YYYY-MM-DD)"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format (YYYY-MM-DD)")
  }),
  customCharges: z.array(customChargeInputSchema).optional().default([])
});

// Validation for when a student makes a partial or full payment
export const updatePaymentSchema = z.object({
  paidAmount: z.number().positive("Paid amount must be greater than zero")
});