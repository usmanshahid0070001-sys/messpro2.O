import mongoose from 'mongoose';
import billRepository from './bill.repository.js';

/**
 * Utility to eliminate JavaScript floating-point inaccuracies in financial calculations.
 * Rounds to 2 decimal places.
 */
const roundCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

class BillService {
  // ── Hostel Settings ────────────────────────────────────────────────────────
  async getBillingSettings(hostelId) {
    if (!hostelId) {
      throw Object.assign(new Error('Hostel context is required.'), { statusCode: 403 });
    }
    const hostel = await billRepository.getHostelSettings(hostelId);
    if (!hostel) {
      throw Object.assign(new Error('Hostel not found.'), { statusCode: 404 });
    }
    return hostel.settings || { customCharges: [], isDynamicBillingEnabled: true };
  }

  async updateBillingSettings(hostelId, customCharges, isDynamicBillingEnabled) {
    if (!hostelId) {
      throw Object.assign(new Error('Hostel context is required.'), { statusCode: 403 });
    }
    const settings = await billRepository.updateHostelSettings(
      hostelId,
      customCharges,
      isDynamicBillingEnabled
    );
    if (!settings) {
      throw Object.assign(new Error('Hostel not found.'), { statusCode: 404 });
    }
    return settings;
  }

  // ── Bill Querying ──────────────────────────────────────────────────────────
  async getBills(user, month, status, demand) {
    if (!user?.hostelId) {
      throw Object.assign(new Error('User is not associated with any hostel.'), { statusCode: 403 });
    }

    const query = { hostelId: user.hostelId };

    if (user.role === 'student') {
      query.studentId = user._id;
    }

    // Date range filtering
    if (demand === 'current') {
      const today = new Date();
      const currentMonth = today.toISOString().substring(0, 7);
      const prevDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const prevMonth = prevDate.toISOString().substring(0, 7);

      query['billingPeriod.endDate'] = {
        $gte: `${prevMonth}-01`,
        $lte: `${currentMonth}-31`
      };
    } else if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        throw Object.assign(new Error('Month must use the YYYY-MM format.'), { statusCode: 400 });
      }
      query['billingPeriod.endDate'] = { $gte: `${month}-01`, $lte: `${month}-31` };
    } else {
      // Default to the latest billing cycle recorded for this hostel
      const latestBill = await billRepository.findLatestHostelBill(user.hostelId);
      if (latestBill?.billingPeriod?.endDate) {
        const latestMonthStr = latestBill.billingPeriod.endDate.substring(0, 7);
        query['billingPeriod.endDate'] = { $gte: `${latestMonthStr}-01`, $lte: `${latestMonthStr}-31` };
      }
    }

    // Status filtering - applies to both Current and Monthly views
    if (status && status !== 'all') {
      const normalizedStatus = status.toLowerCase();
      if (normalizedStatus === 'unpaid') {
        query.status = { $in: ['Unpaid', 'Adjusted in Balance'] };
      } else if (normalizedStatus === 'paid') {
        query.status = 'Paid';
      } else {
        query.status = status;
      }
    }

    return await billRepository.findBills(query);
  }

  async findBillForPayment(hostelId, billId) {
    if (!hostelId) {
      throw Object.assign(new Error('Hostel context is required.'), { statusCode: 403 });
    }
    const bill = await billRepository.findBillByIdAndHostel(billId, hostelId);
    if (!bill) {
      throw Object.assign(new Error('Bill not found in this hostel.'), { statusCode: 404 });
    }
    return bill;
  }

  // ── Meal Price Aggregation & History ──────────────────────────────────────
  async getMealPricesForBilling(hostelId, startDate, endDate) {
    if (!hostelId) {
      throw Object.assign(new Error('Hostel context is required.'), { statusCode: 403 });
    }
    if (!startDate || !endDate) {
      throw Object.assign(new Error('Start and end dates are required.'), { statusCode: 400 });
    }

    return await billRepository.aggregateMealPrices(hostelId, startDate, endDate);
  }

  async updateMealPrices(hostelId, updates) {
    if (!hostelId) {
      throw Object.assign(new Error('Hostel context is required.'), { statusCode: 403 });
    }
    if (!updates || !Array.isArray(updates)) {
      throw Object.assign(new Error('Updates must be an array.'), { statusCode: 400 });
    }

    const result = await billRepository.bulkUpdateMealPrices(hostelId, updates);
    return { updatedCount: updates.length, modifiedCount: result.modifiedCount || 0 };
  }

  // ── Bill Generation & Financial Math Engine ────────────────────────────────
  async generateBills(hostelId, billingPeriod, customChargesInput = []) {
    if (!hostelId) {
      throw Object.assign(new Error('Hostel context is required.'), { statusCode: 403 });
    }

    const { startDate, endDate } = billingPeriod;

    // 1. Fetch active students in this hostel
    const students = await billRepository.findActiveStudentsByHostel(hostelId);

    // 2. Aggregate meals consumed during this period
    const mealCosts = await billRepository.aggregateMealCosts(hostelId, startDate, endDate);

    // Separate costs into student map and guest array
    const studentMealCostMap = new Map();
    const guestMealCosts = [];

    mealCosts.forEach((mc) => {
      const baseCost = roundCurrency(mc.baseMessBill);
      if (mc._id.isGuest) {
        guestMealCosts.push({
          rollNumber: mc._id.rollNumber,
          baseMessBill: baseCost
        });
      } else {
        studentMealCostMap.set(mc._id.rollNumber, baseCost);
      }
    });

    const billableEntities = [];

    // Registered students: queued even if 0 meals consumed (they may incur room or static fees)
    for (const student of students) {
      billableEntities.push({
        studentId: student._id,
        rollNumber: student.id,
        isGuest: false,
        baseMessBill: roundCurrency(studentMealCostMap.get(student.id) || 0)
      });
    }

    // Guests: billed only if they consumed meals during this period
    for (const guest of guestMealCosts) {
      billableEntities.push({
        studentId: null,
        rollNumber: guest.rollNumber,
        isGuest: true,
        baseMessBill: roundCurrency(guest.baseMessBill)
      });
    }

    // 3. Collision Shield: Prevent duplicate bills for the exact same billing window
    const existingBillsRaw = await billRepository.findExistingBillsBulk(hostelId, startDate, endDate);
    const existingBillsSet = new Set(existingBillsRaw.map((b) => b.rollNumber));

    // 4. Arrears Scope: Strictly retrieve unpaid bills that concluded BEFORE this billing startDate
    const unpaidBillsRaw = await billRepository.findUnpaidArrearsBeforeDate(hostelId, startDate);
    const unpaidArrearsMap = new Map();
    const oldBillIdsByRollNumber = new Map();

    unpaidBillsRaw.forEach((b) => {
      const remaining = roundCurrency(b.remainingBill);
      if (remaining > 0) {
        const current = unpaidArrearsMap.get(b.rollNumber) || 0;
        unpaidArrearsMap.set(b.rollNumber, roundCurrency(current + remaining));

        if (!oldBillIdsByRollNumber.has(b.rollNumber)) {
          oldBillIdsByRollNumber.set(b.rollNumber, []);
        }
        oldBillIdsByRollNumber.get(b.rollNumber).push(b._id);
      }
    });

    const newBills = [];
    const oldBillIdsToUpdate = [];

    // 5. Dynamic Math Engine per billable entity
    for (const entity of billableEntities) {
      const { studentId, rollNumber, isGuest, baseMessBill } = entity;

      // Skip if bill already exists for this exact period
      if (existingBillsSet.has(rollNumber)) continue;

      const previousUnpaidArrears = roundCurrency(unpaidArrearsMap.get(rollNumber) || 0);

      let totalCustomCharges = 0;
      const calculatedCustomCharges = [];

      for (const charge of customChargesInput) {
        // Guests should not be charged static tenant additions
        if (isGuest && charge.chargeType === 'addition' && charge.target === 'none') {
          continue;
        }

        let amount = 0;
        const targetValue =
          charge.target === 'unpaid_bill'
            ? previousUnpaidArrears
            : charge.target === 'mess_bill'
            ? baseMessBill
            : 0;

        if (charge.chargeType === 'addition') {
          amount = Number(charge.value) || 0;
        } else if (charge.chargeType === 'multiple') {
          amount = targetValue * (Number(charge.value) || 0);
        } else if (charge.chargeType === 'percentage') {
          amount = (targetValue * (Number(charge.value) || 0)) / 100;
        }

        amount = roundCurrency(amount);

        calculatedCustomCharges.push({
          name: charge.name,
          chargeType: charge.chargeType,
          value: charge.value,
          target: charge.target,
          calculatedAmount: amount
        });

        totalCustomCharges = roundCurrency(totalCustomCharges + amount);
      }

      const total = roundCurrency(baseMessBill + previousUnpaidArrears + totalCustomCharges);

      // Only generate bill if the resident/guest owes money
      if (total > 0) {
        newBills.push({
          hostelId,
          studentId,
          rollNumber,
          isGuest,
          billingPeriod: { startDate, endDate },
          baseMessBill,
          previousUnpaidArrears,
          customCharges: calculatedCustomCharges,
          total,
          paidBill: 0,
          remainingBill: total,
          status: 'Unpaid'
        });

        const oldIds = oldBillIdsByRollNumber.get(rollNumber) || [];
        oldBillIdsToUpdate.push(...oldIds);
      }
    }

    if (newBills.length === 0) {
      return {
        bills: [],
        totalCount: 0,
        studentBillsCount: 0,
        guestBillsCount: 0
      };
    }

    // 6. Atomic Transaction & Compensating Rollback Shield
    let session = null;
    let supportsTransactions = true;

    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (err) {
      // Standalone MongoDB (e.g. without replica set in local testing)
      supportsTransactions = false;
      session = null;
    }

    let generatedBills = [];
    try {
      // Insert new bills
      generatedBills = await billRepository.createBillsInBulk(newBills, session);

      // Mark rolled-over bills as 'Adjusted in Balance'
      if (oldBillIdsToUpdate.length > 0) {
        await billRepository.markBillsAdjustedInBalance(hostelId, oldBillIdsToUpdate, session);
      }

      if (session && supportsTransactions) {
        await session.commitTransaction();
      }
    } catch (error) {
      if (session && supportsTransactions) {
        await session.abortTransaction();
      } else if (generatedBills.length > 0) {
        // Compensating rollback for environments without replica set transactions
        const createdIds = generatedBills.map((b) => b._id);
        await billRepository.deleteBillsByIds(createdIds);
      }
      throw error;
    } finally {
      if (session) {
        session.endSession();
      }
    }

    const studentBillsCount = generatedBills.filter((b) => !b.isGuest).length;
    const guestBillsCount = generatedBills.filter((b) => b.isGuest).length;

    return {
      bills: generatedBills,
      totalCount: generatedBills.length,
      studentBillsCount,
      guestBillsCount
    };
  }

  // ── Payment Processing Ledger ─────────────────────────────────────────────
  async processPayment(hostelId, bill, paidAmount) {
    if (!hostelId) {
      throw Object.assign(new Error('Hostel context is required.'), { statusCode: 403 });
    }

    const roundedPaidAmount = roundCurrency(paidAmount);
    const currentRemaining = roundCurrency(bill.remainingBill);

    if (roundedPaidAmount <= 0) {
      throw Object.assign(new Error('Payment amount must be greater than zero.'), { statusCode: 400 });
    }

    if (roundedPaidAmount > currentRemaining) {
      throw Object.assign(
        new Error(`Payment amount (Rs. ${roundedPaidAmount}) exceeds the remaining balance of Rs. ${currentRemaining}.`),
        { statusCode: 400 }
      );
    }

    const newPaidBill = roundCurrency((bill.paidBill || 0) + roundedPaidAmount);
    const newRemainingBill = roundCurrency(currentRemaining - roundedPaidAmount);
    const newStatus = newRemainingBill <= 0 ? 'Paid' : 'Unpaid';

    const updatedBill = await billRepository.executePayment(
      hostelId,
      bill._id,
      roundedPaidAmount,
      newPaidBill,
      newRemainingBill,
      newStatus
    );

    if (!updatedBill) {
      throw Object.assign(
        new Error('Payment could not be completed because the bill balance changed. Please refresh and try again.'),
        { statusCode: 409 }
      );
    }

    return updatedBill;
  }

  // ── Custom Charge Modification for Specific Bill ───────────────────────────
  async updateBillCustomCharges(hostelId, billId, customCharges) {
    if (!hostelId) {
      throw Object.assign(new Error('Hostel context is required.'), { statusCode: 403 });
    }

    const bill = await billRepository.findBillByIdAndHostel(billId, hostelId);
    if (!bill) {
      throw Object.assign(new Error('Bill not found in this hostel.'), { statusCode: 404 });
    }

    if (bill.status === 'Adjusted in Balance') {
      throw Object.assign(
        new Error('Cannot modify charges on a bill that has already been rolled over into arrears balance.'),
        { statusCode: 400 }
      );
    }

    if (!Array.isArray(customCharges)) {
      throw Object.assign(new Error('Custom charges must be an array.'), { statusCode: 400 });
    }

    // Apply clean rounded numbers to custom charges
    bill.customCharges = customCharges.map((charge) => ({
      name: charge.name,
      chargeType: charge.chargeType || 'addition',
      value: roundCurrency(charge.value || charge.calculatedAmount || 0),
      target: charge.target || 'none',
      calculatedAmount: roundCurrency(charge.calculatedAmount || 0)
    }));

    const totalCustomCharges = roundCurrency(
      bill.customCharges.reduce((sum, charge) => sum + charge.calculatedAmount, 0)
    );

    bill.total = roundCurrency(bill.baseMessBill + bill.previousUnpaidArrears + totalCustomCharges);
    bill.remainingBill = roundCurrency(Math.max(0, bill.total - (bill.paidBill || 0)));

    if (bill.remainingBill <= 0 && bill.total > 0) {
      bill.status = 'Paid';
    } else if (bill.total === 0) {
      bill.status = 'Paid';
    } else {
      bill.status = 'Unpaid';
    }

    return await billRepository.saveBill(bill);
  }
}

export default new BillService();
