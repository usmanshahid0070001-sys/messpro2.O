import mongoose from 'mongoose';
import Bill from './bill.model.js';
import User from '../auth/auth.model.js';
import MealRecord from '../mealRecord/mealRecord.model.js';
import Hostel from '../hostel/hostel.model.js';

class BillRepository {
  // ── Hostel Settings ────────────────────────────────────────────────────────
  async getHostelSettings(hostelId) {
    return await Hostel.findById(hostelId).select('settings');
  }

  async updateHostelSettings(hostelId, customCharges, isDynamicBillingEnabled) {
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) return null;

    if (!hostel.settings) {
      hostel.settings = {};
    }
    hostel.settings.customCharges = customCharges;
    hostel.settings.isDynamicBillingEnabled = isDynamicBillingEnabled;

    await hostel.save();
    return hostel.settings;
  }

  // ── Bill Querying ──────────────────────────────────────────────────────────
  async findBills(query) {
    return await Bill.find(query)
      .populate('studentId', 'name id email')
      .sort({ 'billingPeriod.endDate': -1, createdAt: -1 });
  }

  async findLatestHostelBill(hostelId) {
    return await Bill.findOne({ hostelId }).sort({ 'billingPeriod.endDate': -1 });
  }

  async findBillByIdAndHostel(billId, hostelId) {
    return await Bill.findOne({ _id: billId, hostelId });
  }

  // ── Collision and Arrears Checks ───────────────────────────────────────────
  async findExistingBillsBulk(hostelId, startDate, endDate) {
    return await Bill.find({
      hostelId,
      'billingPeriod.startDate': startDate,
      'billingPeriod.endDate': endDate
    }).select('rollNumber');
  }

  /**
   * Arrears Hunter: Strictly retrieves unpaid bills that concluded BEFORE the current start date.
   * This prevents overlapping or subsequent bills from being counted as prior arrears.
   */
  async findUnpaidArrearsBeforeDate(hostelId, beforeDate) {
    return await Bill.find({
      hostelId,
      status: 'Unpaid',
      remainingBill: { $gt: 0 },
      'billingPeriod.endDate': { $lt: beforeDate }
    }).select('_id rollNumber remainingBill');
  }

  // ── Student & Meal Aggregations ───────────────────────────────────────────
  async findActiveStudentsByHostel(hostelId) {
    return await User.find({
      hostelId,
      role: 'student',
      status: { $ne: 'Suspended' },
    }).select('_id id name');
  }

  async aggregateMealCosts(hostelId, startDate, endDate) {
    return await MealRecord.aggregate([
      {
        $match: {
          hostelId: new mongoose.Types.ObjectId(hostelId),
          date: { $gte: startDate, $lte: endDate },
          'attendance.hasEaten': true // Only charge for meals actually eaten
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
  }

  async aggregateMealPrices(hostelId, startDate, endDate) {
    const pipeline = [
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

    return await MealRecord.aggregate(pipeline);
  }

  async bulkUpdateMealPrices(hostelId, updates) {
    const bulkOps = updates.map((update) => ({
      updateMany: {
        filter: {
          hostelId: new mongoose.Types.ObjectId(hostelId),
          date: update.date,
          mealType: update.mealType,
          'mealInfo.name': update.oldName
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
      return await MealRecord.bulkWrite(bulkOps);
    }
    return { modifiedCount: 0 };
  }

  // ── Bill Creation, Adjustments & Payment ──────────────────────────────────
  async createBillsInBulk(billDocuments, session = null) {
    if (!billDocuments || billDocuments.length === 0) return [];
    const options = session ? { session } : {};
    return await Bill.insertMany(billDocuments, options);
  }

  async markBillsAdjustedInBalance(hostelId, billIds, session = null) {
    if (!billIds || billIds.length === 0) return { modifiedCount: 0 };
    const options = session ? { session } : {};
    return await Bill.updateMany(
      { _id: { $in: billIds }, hostelId },
      { $set: { status: 'Adjusted in Balance' } },
      options
    );
  }

  /**
   * Compensating rollback helper in case standalone MongoDB cannot use sessions
   */
  async deleteBillsByIds(billIds) {
    if (!billIds || billIds.length === 0) return { deletedCount: 0 };
    return await Bill.deleteMany({ _id: { $in: billIds } });
  }

  async executePayment(hostelId, billId, paidAmount, newPaidBill, newRemainingBill, newStatus) {
    return await Bill.findOneAndUpdate(
      {
        _id: billId,
        hostelId,
        remainingBill: { $gte: paidAmount }
      },
      {
        $set: {
          paidBill: newPaidBill,
          remainingBill: newRemainingBill,
          status: newStatus
        }
      },
      { new: true }
    );
  }

  async saveBill(bill) {
    return await bill.save();
  }
}

export default new BillRepository();