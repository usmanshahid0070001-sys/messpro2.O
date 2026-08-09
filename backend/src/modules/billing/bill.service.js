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

  async getBills(user, month) {
    const query = { hostelId: user.hostelId };

    if (user.role === 'student') {
      query.studentId = user._id;
    }

    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        throw Object.assign(new Error('Month must use the YYYY-MM format.'), { statusCode: 400 });
      }
      query['billingPeriod.startDate'] = { $gte: `${month}-01`, $lte: `${month}-31` };
    }

    return mongoose.model('Bill')
      .find(query)
      .populate('studentId', 'name id email')
      .sort({ 'billingPeriod.startDate': -1, createdAt: -1 });
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

    // 2. Instantly calculate the sum of all meals eaten by every student in this date range
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
          _id: '$studentId',
          baseMessBill: {
            $sum: { $multiply: ['$mealInfo.price', '$attendance.count'] }
          }
        }
      }
    ]);

    // Create a fast lookup map for the meal costs
    const mealCostMap = new Map();
    mealCosts.forEach(mc => mealCostMap.set(mc._id.toString(), mc.baseMessBill));

    const newBills = [];

    // 3. Process each student
    for (const student of students) {
      const studentId = student._id;

      // 🛡️ THE COLLISION SHIELD: Skip if a bill for this date range already exists
      const existing = await billRepository.findExistingBill(hostelId, studentId, startDate, endDate);
      if (existing) continue; 

      const baseMessBill = mealCostMap.get(studentId.toString()) || 0;

      // Fetch Unpaid Arrears from previous months
      const unpaidBills = await billRepository.findUnpaidBills(hostelId, studentId);
      const previousUnpaidArrears = unpaidBills.reduce((sum, bill) => sum + bill.remainingBill, 0);

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

      // Only generate a bill if the student actually owes money
      if (total > 0) {
        newBills.push({
          hostelId,
          studentId,
          billingPeriod: { startDate, endDate },
          baseMessBill,
          previousUnpaidArrears,
          customCharges: calculatedCustomCharges,
          total,
          paidBill: 0,
          remainingBill: total,
          status: 'Unpaid'
        });
      }
    }

    // 4. Save everything to MongoDB at once
    const generatedBills = await billRepository.createBillsInBulk(newBills);
    return generatedBills;
  }


  // ==========================================
  // 2. PAYMENT PROCESSING LEDGER
  // ==========================================
  async processPayment(hostelId, bill, paidAmount) {

    // Prevent overpaying
    if (paidAmount > bill.remainingBill) {
      throw Object.assign(new Error(`Cannot pay more than the remaining balance of Rs ${bill.remainingBill}`), { statusCode: 400 });
    }

    bill.paidBill += paidAmount;
    bill.remainingBill = bill.total - bill.paidBill;
    
    // Auto-update the status lock
    if (bill.remainingBill === 0) {
      bill.status = 'Paid';
    } else {
      bill.status = 'Adjusted in Balance'; // Partial payment made
    }

    await bill.save();
    return bill;
  }
}

export default new BillService();
