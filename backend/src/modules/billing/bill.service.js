import mongoose from 'mongoose';
import User from '../auth/auth.model.js';
import MealRecord from '../mealRecord/mealRecord.model.js';
import billRepository from './bill.repository.js';
import Hostel from '../hostel/hostel.model.js';

class BillService {
  async getBillingSettings(hostelId) {
    const hostel = await Hostel.findById(hostelId).select('settings');
    if (!hostel) throw Object.assign(new Error('Hostel not found.'), { statusCode: 404 });
    return hostel.settings;
  }

  async updateBillingSettings(hostelId, customCharges, isDynamicBillingEnabled) {
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) throw Object.assign(new Error('Hostel not found.'), { statusCode: 404 });

    hostel.settings.customCharges = customCharges;
    hostel.settings.isDynamicBillingEnabled = isDynamicBillingEnabled;

    await hostel.save();
    return hostel.settings;
  }

  async getBills(user, month, status, demand) {
    const query = { hostelId: user.hostelId };

    if (user.role === 'student') {
      query.studentId = user._id;
    }

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
      // If no month is provided, default to the latest available month
      const latestBill = await mongoose.model('Bill').findOne({ hostelId: user.hostelId }).sort({ 'billingPeriod.endDate': -1 });
      if (latestBill && latestBill.billingPeriod && latestBill.billingPeriod.endDate) {
        const latestMonthStr = latestBill.billingPeriod.endDate.substring(0, 7); // Extracts 'YYYY-MM'
        query['billingPeriod.endDate'] = { $gte: `${latestMonthStr}-01`, $lte: `${latestMonthStr}-31` };
      }
    }

    if (demand !== 'current') {
      if (status === 'unpaid') {
        query.status = { $in: ['Unpaid', 'Adjusted in Balance'] };
      } else if (status) {
        query.status = status;
      }
    }

    return await billRepository.findBills(query);
  }

  async findBillForPayment(hostelId, billId) {
    const bill = await mongoose.model('Bill').findOne({ _id: billId, hostelId });
    if (!bill) throw Object.assign(new Error('Bill not found.'), { statusCode: 404 });
    return bill;
  }
  
  // ==========================================
  // 1. MEAL PRICE AGGREGATION FOR SETTINGS
  // ==========================================
  async getMealPricesForBilling(hostelId, startDate, endDate) {
    if (!startDate || !endDate) {
      throw Object.assign(new Error('Start and end dates are required.'), { statusCode: 400 });
    }

    const aggregationPipeline = [
      {
        $match: {
          hostelId: new mongoose.Types.ObjectId(hostelId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { date: '$date', mealType: '$mealType', name: '$mealInfo.name' },
          price: { $first: '$mealInfo.price' },
          attendanceCount: {
            $sum: { $cond: ['$attendance.hasEaten', '$attendance.count', 0] }
          },
          selectionCount: {
            $sum: { $cond: ['$selection.hasSelected', '$selection.count', 0] }
          }
        }
      },
      {
        $match: {
          attendanceCount: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          meals: {
            $push: {
              id: { $concat: ['$_id.date', '_', '$_id.mealType', '_', '$_id.name'] },
              mealType: '$_id.mealType',
              mealInfo: {
                name: '$_id.name',
                price: '$price'
              },
              attendanceCount: '$attendanceCount',
              selectionCount: '$selectionCount'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          meals: 1
        }
      },
      {
        $sort: { date: 1 }
      }
    ];

    return await MealRecord.aggregate(aggregationPipeline);
  }

  async updateMealPrices(hostelId, updates) {
    if (!updates || !Array.isArray(updates)) {
      throw Object.assign(new Error('Updates must be an array.'), { statusCode: 400 });
    }

    const bulkOps = updates.map(update => ({
      updateMany: {
        filter: { 
          hostelId: new mongoose.Types.ObjectId(hostelId),
          date: update.date,
          mealType: update.mealType,
          'mealInfo.name': update.oldName // Match by the original name to update all students' records
        },
        update: {
          $set: {
            'mealInfo.name': update.newName,
            'mealInfo.price': Number(update.newPrice)
          }
        }
      }
    }));

    if (bulkOps.length > 0) {
      await MealRecord.bulkWrite(bulkOps);
    }
    
    return { updatedCount: bulkOps.length };
  }

  // ==========================================
  // 2. BILL GENERATION & MATH ENGINE
  // ==========================================
  async generateBills(hostelId, billingPeriod, customChargesInput) {
    const { startDate, endDate } = billingPeriod;

    // 1. Get all active students in this hostel
    const students = await User.find({ hostelId, role: 'student' }).select('_id id name');

    // 2. Instantly calculate the sum of all meals eaten by every person in this date range
    const mealCosts = await MealRecord.aggregate([
      {
        $match: {
          hostelId: new mongoose.Types.ObjectId(hostelId),
          date: { $gte: startDate, $lte: endDate },
          'attendance.hasEaten': true // Only charge for meals actually eaten/claimed
        }
      },
      {
        $group: {
          _id: { rollNumber: '$rollNumber', isGuest: '$isGuest', studentId: '$studentId' },
          baseMessBill: {
            $sum: { $multiply: ['$mealInfo.price', '$attendance.count'] }
          }
        }
      }
    ]);

    // Separate costs into student map and guest array
    const studentMealCostMap = new Map();
    const guestMealCosts = [];

    mealCosts.forEach(mc => {
      if (mc._id.isGuest) {
        guestMealCosts.push({
          rollNumber: mc._id.rollNumber,
          baseMessBill: mc.baseMessBill
        });
      } else {
        studentMealCostMap.set(mc._id.rollNumber, mc.baseMessBill);
      }
    });

    const billableEntities = [];

    // Queue all registered students (they get billed even if they didn't eat, for static charges)
    for (const student of students) {
      billableEntities.push({
        studentId: student._id,
        rollNumber: student.id,
        isGuest: false,
        baseMessBill: studentMealCostMap.get(student.id) || 0
      });
    }

    // Queue all guests (only billed if they actually ate, which is true if they are in guestMealCosts)
    for (const guest of guestMealCosts) {
      billableEntities.push({
        studentId: null,
        rollNumber: guest.rollNumber,
        isGuest: true,
        baseMessBill: guest.baseMessBill
      });
    }

    const newBills = [];

    // 🚀 PERFORMANCE OPTIMIZATION: Fix N+1 Query Problem
    // Pre-fetch all necessary collision and arrears data in 2 bulk queries instead of 2*N queries inside the loop!
    const existingBillsRaw = await billRepository.findExistingBillsBulk(hostelId, startDate, endDate);
    const existingBillsSet = new Set(existingBillsRaw.map(b => b.rollNumber));

    const unpaidBillsRaw = await billRepository.findUnpaidBillsBulk(hostelId);
    const unpaidArrearsMap = new Map();
    const oldBillIdsByRollNumber = new Map();

    unpaidBillsRaw.forEach(b => {
      const current = unpaidArrearsMap.get(b.rollNumber) || 0;
      unpaidArrearsMap.set(b.rollNumber, current + b.remainingBill);
      
      if (!oldBillIdsByRollNumber.has(b.rollNumber)) {
        oldBillIdsByRollNumber.set(b.rollNumber, []);
      }
      oldBillIdsByRollNumber.get(b.rollNumber).push(b._id);
    });

    const oldBillIdsToUpdate = [];

    // 3. Process each entity through the math engine
    for (const entity of billableEntities) {
      const { studentId, rollNumber, isGuest, baseMessBill } = entity;

      // 🛡️ THE COLLISION SHIELD: O(1) lookup
      if (existingBillsSet.has(rollNumber)) continue; 

      // Fetch Unpaid Arrears from previous months (O(1) lookup)
      const previousUnpaidArrears = unpaidArrearsMap.get(rollNumber) || 0;

      let totalCustomCharges = 0;
      const calculatedCustomCharges = [];

      // 🧮 THE DYNAMIC MATH ENGINE
      for (const charge of customChargesInput) {
        let amount = 0;
        // Determine what number we are applying the math to
        const targetValue = charge.target === 'unpaid_bill' ? previousUnpaidArrears : 
                            charge.target === 'mess_bill' ? baseMessBill : 0;

        if (charge.chargeType === 'addition') {
          amount = charge.value; // Flat fee (e.g., +750 Rs)
        } 
        else if (charge.chargeType === 'multiple') {
          amount = targetValue * charge.value; // Factor multiplier (e.g., Base * 0.1)
        } 
        else if (charge.chargeType === 'percentage') {
          amount = (targetValue * charge.value) / 100; // Percentage (e.g., 5% of Unpaid Arrears)
        }

        amount = Math.round(amount); // Round to nearest Rupee

        calculatedCustomCharges.push({
          name: charge.name,
          chargeType: charge.chargeType,
          value: charge.value,
          target: charge.target,
          calculatedAmount: amount
        });

        totalCustomCharges += amount;
      }

      // Calculate the final Grand Total
      const total = baseMessBill + previousUnpaidArrears + totalCustomCharges;

      // Only generate a bill if the entity actually owes money
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
        
        // Collect the old bill IDs that were successfully rolled over
        const oldIds = oldBillIdsByRollNumber.get(rollNumber) || [];
        oldBillIdsToUpdate.push(...oldIds);
      }
    }

    // 4. Save everything to MongoDB at once
    const generatedBills = await billRepository.createBillsInBulk(newBills);

    // 5. Update old bills to 'Adjusted in Balance'
    if (oldBillIdsToUpdate.length > 0) {
      await mongoose.model('Bill').updateMany(
        { _id: { $in: oldBillIdsToUpdate } },
        { $set: { status: 'Adjusted in Balance' } }
      );
    }

    return generatedBills;
  }


  // ==========================================
  // 2. PAYMENT PROCESSING LEDGER
  // ==========================================
  async processPayment(hostelId, bill, paidAmount) {
    const updatedBill = await mongoose.model('Bill').findOneAndUpdate(
      { _id: bill._id, hostelId, remainingBill: { $gte: paidAmount } },
      [
        {
          $set: {
            paidBill: { $add: ['$paidBill', paidAmount] },
            remainingBill: { $subtract: ['$remainingBill', paidAmount] },
          },
        },
        {
          $set: {
            status: { $cond: [{ $eq: ['$remainingBill', 0] }, 'Paid', 'Unpaid'] },
          },
        },
      ],
      { new: true }
    );

    if (!updatedBill) {
      throw Object.assign(new Error('Payment exceeds the remaining balance or the bill was changed.'), { statusCode: 409 });
    }
    return updatedBill;
  }

  async updateBillCustomCharges(hostelId, billId, customCharges) {
    const bill = await mongoose.model('Bill').findOne({ _id: billId, hostelId });
    if (!bill) throw Object.assign(new Error('Bill not found.'), { statusCode: 404 });

    // Validate structure of customCharges
    if (!Array.isArray(customCharges)) {
      throw Object.assign(new Error('Custom charges must be an array.'), { statusCode: 400 });
    }

    // Replace the custom charges
    bill.customCharges = customCharges.map(charge => ({
      name: charge.name,
      chargeType: charge.chargeType || 'addition', // Fallback
      value: charge.value || charge.calculatedAmount,
      target: charge.target || 'mess_bill', // Fallback
      calculatedAmount: Number(charge.calculatedAmount) || 0
    }));

    // Recalculate total custom charges
    const totalCustomCharges = bill.customCharges.reduce((sum, charge) => sum + charge.calculatedAmount, 0);

    // Recalculate grand total
    bill.total = bill.baseMessBill + bill.previousUnpaidArrears + totalCustomCharges;

    // Prevent negative remaining bill (in case they remove a charge and total drops below paid amount)
    // If total < paidBill, maybe they need a refund, but for now we cap it to 0 or leave it as negative (credit)
    // Actually, remainingBill can be negative, meaning advance payment or credit. Let's keep it simple.
    bill.remainingBill = bill.total - bill.paidBill;

    // Update status
    if (bill.remainingBill <= 0 && bill.total > 0) {
      bill.status = 'Paid';
    } else if (bill.total === 0) {
      bill.status = 'Paid';
    } else {
      bill.status = 'Unpaid';
    }

    await bill.save();
    return bill;
  }
}

export default new BillService();
