import { catchAsync } from '../../utils/catchAsync.js';
import billService from './bill.service.js';
import {
  generateBillSchema,
  updatePaymentSchema,
  updateMealPricesSchema,
  updateBillingSettingsSchema,
  updateBillChargesSchema,
  getMealPricesQuerySchema,
  getBillsQuerySchema
} from './bill.validation.js';

export const getBillingSettings = catchAsync(async (req, res) => {
  const settings = await billService.getBillingSettings(req.user.hostelId);
  res.status(200).json({
    success: true,
    data: settings
  });
});

export const updateBillingSettings = catchAsync(async (req, res) => {
  const validatedData = updateBillingSettingsSchema.parse(req.body);
  const settings = await billService.updateBillingSettings(
    req.user.hostelId,
    validatedData.customCharges,
    validatedData.isDynamicBillingEnabled
  );

  res.status(200).json({
    success: true,
    message: 'Billing settings saved successfully.',
    data: settings
  });
});

export const generateMonthlyBills = catchAsync(async (req, res) => {
  // 1. Zod shields the engine from bad math and invalid date ranges
  const validatedData = generateBillSchema.parse(req.body);
  const hostelId = req.user.hostelId;

  // 2. Run the math engine with atomic rollback protection
  const { bills, totalCount, studentBillsCount, guestBillsCount } =
    await billService.generateBills(
      hostelId,
      validatedData.billingPeriod,
      validatedData.customCharges
    );

  res.status(201).json({
    success: true,
    status: 'success',
    message: `Successfully generated ${totalCount} bills (${studentBillsCount} enrolled students, ${guestBillsCount} dining guests).`,
    results: totalCount,
    studentBillsCount,
    guestBillsCount,
    data: bills
  });
});

export const getMealPricesForBilling = catchAsync(async (req, res) => {
  const { startDate, endDate } = getMealPricesQuerySchema.parse(req.query);
  const hostelId = req.user.hostelId;

  const mealPrices = await billService.getMealPricesForBilling(hostelId, startDate, endDate);

  res.status(200).json({
    success: true,
    data: mealPrices
  });
});

export const updateMealPrices = catchAsync(async (req, res) => {
  const validatedData = updateMealPricesSchema.parse(req.body);
  const hostelId = req.user.hostelId;

  const result = await billService.updateMealPrices(hostelId, validatedData.updates);

  res.status(200).json({
    success: true,
    message: 'Meal prices updated successfully',
    data: result
  });
});

export const getBills = catchAsync(async (req, res) => {
  const { month, status, demand } = getBillsQuerySchema.parse(req.query);
  const bills = await billService.getBills(req.user, month, status, demand);

  res.status(200).json({
    success: true,
    results: bills.length,
    data: bills
  });
});

export const getMonthlyBill = catchAsync(async (req, res) => {
  const { month, status, demand } = getBillsQuerySchema.parse(req.query);
  const bills = await billService.getBills(req.user, month, status, demand);

  res.status(200).json({
    success: true,
    results: bills.length,
    data: bills
  });
});

export const payBill = catchAsync(async (req, res) => {
  const billId = req.params.id;
  const hostelId = req.user.hostelId;
  const bill = await billService.findBillForPayment(hostelId, billId);

  const requestedAmount = req.body.paidAmount ?? req.body.amount ?? bill.remainingBill;
  const { paidAmount } = updatePaymentSchema.parse({ paidAmount: Number(requestedAmount) });

  const updatedBill = await billService.processPayment(hostelId, bill, paidAmount);

  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Payment recorded successfully.',
    data: updatedBill
  });
});

export const updateBill = catchAsync(async (req, res) => {
  const billId = req.params.id;
  const hostelId = req.user.hostelId;
  const validatedData = updateBillChargesSchema.parse(req.body);

  const updatedBill = await billService.updateBillCustomCharges(
    hostelId,
    billId,
    validatedData.customCharges
  );

  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Bill updated successfully.',
    data: updatedBill
  });
});
