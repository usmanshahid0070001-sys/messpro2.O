import { z } from 'zod';

// Sub-schema for the dynamic charges during generation
export const customChargeInputSchema = z.object({
  name: z.string().min(1, 'Charge name is required').trim(),
  chargeType: z.enum(['addition', 'multiple', 'percentage']),
  value: z.number().min(0, 'Value must be a non-negative number'),
  target: z.enum(['mess_bill', 'unpaid_bill', 'none']).default('none')
});

// Validation for generating monthly bills
export const generateBillSchema = z.object({
  billingPeriod: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format (YYYY-MM-DD)'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format (YYYY-MM-DD)')
  }),
  customCharges: z.array(customChargeInputSchema).optional().default([])
}).refine(
  (data) => data.billingPeriod.startDate <= data.billingPeriod.endDate,
  {
    message: 'Start date must be earlier than or equal to end date',
    path: ['billingPeriod', 'endDate']
  }
);

// Validation for recording payment
export const updatePaymentSchema = z.object({
  paidAmount: z.number().positive('Paid amount must be greater than zero')
});

// Single meal update item
export const mealPriceUpdateItemSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  mealType: z.string().min(1, 'Meal type is required').trim(),
  oldName: z.string().min(1, 'Original meal name is required').trim(),
  newName: z.string().min(1, 'New meal name is required').trim(),
  newPrice: z.union([z.number(), z.string()]).transform((val) => Number(val)).pipe(
    z.number().min(0, 'New price must be greater than or equal to 0')
  )
});

// Validation for updating meal prices in batch
export const updateMealPricesSchema = z.object({
  updates: z.array(mealPriceUpdateItemSchema).min(1, 'At least one meal price update is required')
});

// Setting field configuration schema
export const billFieldConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Field name is required').trim(),
  type: z.string(),
  value: z.number().nullable().optional(),
  linkedFieldId: z.string().nullable().optional(),
  included: z.boolean().optional().default(true)
});

// Validation for saving billing settings
export const updateBillingSettingsSchema = z.object({
  customCharges: z.array(billFieldConfigSchema).default([]),
  isDynamicBillingEnabled: z.boolean().default(true)
});

// Custom charge modification for an existing bill
export const singleBillChargeSchema = z.object({
  name: z.string().min(1, 'Charge name is required').trim(),
  chargeType: z.enum(['addition', 'multiple', 'percentage']).optional().default('addition'),
  value: z.number().optional().default(0),
  target: z.enum(['mess_bill', 'unpaid_bill', 'none']).optional().default('none'),
  calculatedAmount: z.number().min(0, 'Calculated amount must be non-negative')
});

export const updateBillChargesSchema = z.object({
  customCharges: z.array(singleBillChargeSchema)
});

// Validation for querying meal prices
export const getMealPricesQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format (YYYY-MM-DD)')
}).refine(
  (data) => data.startDate <= data.endDate,
  {
    message: 'Start date must be earlier than or equal to end date',
    path: ['endDate']
  }
);

// Validation for querying bills
export const getBillsQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format (YYYY-MM)').optional(),
  demand: z.enum(['current']).optional(),
  status: z.string().optional()
});