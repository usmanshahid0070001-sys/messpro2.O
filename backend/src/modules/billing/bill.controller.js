import { catchAsync } from '../../utils/catchAsync.js';
import billService from './bill.service.js';
import { generateBillSchema, updatePaymentSchema } from './bill.validation.js';

export const generateMonthlyBills = catchAsync(async (req, res) => {
  // 1. Zod shields the engine from bad math inputs
  const validatedData = generateBillSchema.parse(req.body);
  const hostelId = req.user.hostelId;

  // 2. Run the math engine
  const bills = await billService.generateBills(
    hostelId, 
    validatedData.billingPeriod, 
    validatedData.customCharges
  );

  res.status(201).json({
    status: 'success',
    message: `Successfully generated ${bills.length} new bills.`,
    results: bills.length,
    data: bills
  });
});

export const getBills = catchAsync(async (req, res) => {
  const bills = await billService.getBills(req.user, req.query.month);

  res.status(200).json({
    success: true,
    results: bills.length,
    data: bills,
  });
});

export const getMonthlyBill = catchAsync(async (req, res) => {
  const bills = await billService.getBills(req.user, req.query.month);

  res.status(200).json({
    success: true,
    results: bills.length,
    data: bills,
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
    status: 'success',
    message: 'Payment recorded successfully.',
    data: updatedBill
  });
});
