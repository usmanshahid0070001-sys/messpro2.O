import { z } from 'zod';

// Strict Regex to ensure dates always arrive formatted
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const monthRegex = /^\d{4}-\d{2}$/;
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// ── 1. Student Pre-Selection Schemas ─────────────────────────────────────────
export const bulkSelectMealsSchema = z.object({
  selections: z.array(z.object({
    date: z.string().regex(dateRegex, "Date must be in YYYY-MM-DD format"),
    mealType: z.string().min(1, "Meal type is required"),
    mealInfo: z.object({
      name: z.string().min(1, "Meal name is required"),
      price: z.number().min(0, "Price cannot be negative"),
    }),
    count: z.number().int().min(0, "Count must be positive"),
  })),
}).strict();

export const getStudentSelectionsQuerySchema = z.object({
  startDate: z.string().regex(dateRegex, "startDate must be in YYYY-MM-DD format"),
  endDate: z.string().regex(dateRegex, "endDate must be in YYYY-MM-DD format"),
});

export const getStudentMonthlyRecordsQuerySchema = z.object({
  month: z.string().regex(monthRegex, "month must be in YYYY-MM format (e.g., 2026-09)"),
});

// ── 2. Manager Attendance Schemas ────────────────────────────────────────────
export const markAttendanceSchema = z.object({
  rollNumber: z.string().trim().min(1, "Roll number is required"),
  date: z.string().regex(dateRegex, "Date must be in YYYY-MM-DD format"),
  mealType: z.enum(['Breakfast', 'Lunch', 'Dinner']),
  count: z.number().int().min(1, "Count must be at least 1"),
  isGuest: z.boolean().default(false),
  mealInfo: z.object({
    name: z.string().min(1, "Meal name is required"),
    price: z.number().min(0, "Price cannot be negative"),
  }),
}).strict();

export const getAttendanceSchema = z.object({
  hostelId: z.string().regex(objectIdRegex, "Invalid Hostel ID format"),
  date: z.string().regex(dateRegex, "Date must be in YYYY-MM-DD format"),
  mealType: z.string().min(1, "mealType is required"),
});

export const saveAttendanceSchema = z.object({
  hostelId: z.string().regex(objectIdRegex, "Invalid Hostel ID format"),
  date: z.string().regex(dateRegex, "Date must be in YYYY-MM-DD format"),
  mealType: z.string().min(1, "mealType is required"),
  mealInfo: z.object({
    name: z.string().min(1),
    price: z.number().min(0),
  }),
  records: z.array(z.object({
    rollNumber: z.string().trim().min(1),
    count: z.number().int().min(0),
  })),
});

// ── 3. Overview & Date Queries ───────────────────────────────────────────────
export const dateQuerySchema = z.object({
  date: z.string().regex(dateRegex, "Date must be in YYYY-MM-DD format").optional(),
});

// ── 4. QR Attendance & Overrides Schemas ─────────────────────────────────────
export const scanManagerQRSchema = z.object({
  h: z.string().regex(objectIdRegex, "Invalid target hostel ID"),
  s: z.string().trim().min(1, "QR Secret is required"),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export const requestGuestPermissionSchema = z.object({
  managerHostelId: z.string().regex(objectIdRegex, "Invalid Manager Hostel ID"),
  reason: z.string().trim().optional(),
});

export const respondGuestPermissionSchema = z.object({
  requestId: z.string().min(1, "requestId is required"),
  studentId: z.string().regex(objectIdRegex, "Invalid Student ID"),
  isApproved: z.boolean(),
});

export const scanStudentQRSchema = z.object({
  studentRollNumber: z.string().trim().min(1, "studentRollNumber is required"),
});

// ── 5. Biometric Attendance Schema ───────────────────────────────────────────
export const processBiometricAttendanceSchema = z.object({
  records: z.array(
    z.object({
      rollNumber: z.string().trim().min(1, "Roll number is required").max(60),
      date: z.string().regex(dateRegex, "Date must be in YYYY-MM-DD format"),
      mealType: z.string().trim().min(1, "Meal type is required"),
      count: z.number().int().min(1).default(1),
      punchTime: z.string().optional(),
    })
  ).min(1, "At least one biometric record is required"),
  unrecognizedStudentAction: z.enum(['guest', 'skip']).default('guest'),
  duplicatePunchStrategy: z.enum(['deduplicate', 'accumulate']).default('deduplicate'),
});