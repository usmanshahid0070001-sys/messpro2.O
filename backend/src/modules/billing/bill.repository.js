import Bill from './bill.model.js';

class BillRepository {
  
  async findBills(query) {
    return await Bill.find(query)
      .populate('studentId', 'name id email')
      .sort({ 'billingPeriod.endDate': -1, createdAt: -1 });
  }

  // 1. The Collision Checker: Finds if a bill already exists for this exact date range
  async findExistingBill(hostelId, rollNumber, startDate, endDate) {
    return await Bill.findOne({
      hostelId,
      rollNumber,
      'billingPeriod.startDate': startDate,
      'billingPeriod.endDate': endDate
    });
  }

  // Bulk Collision Checker
  async findExistingBillsBulk(hostelId, startDate, endDate) {
    return await Bill.find({
      hostelId,
      'billingPeriod.startDate': startDate,
      'billingPeriod.endDate': endDate
    }).select('rollNumber');
  }

  // 2. The Arrears Hunter: Finds all unpaid or partially paid bills for a student
  async findUnpaidBills(hostelId, rollNumber) {
    return await Bill.find({
      hostelId,
      rollNumber,
      status: 'Unpaid'
    });
  }

  // Bulk Arrears Hunter
  async findUnpaidBillsBulk(hostelId) {
    return await Bill.find({
      hostelId,
      status: 'Unpaid'
    }).select('_id rollNumber remainingBill');
  }

  // 3. Save the newly generated bill
  async createBillsInBulk(billDocuments) {
    if (billDocuments.length > 0) {
      return await Bill.insertMany(billDocuments);
    }
    return [];
  }

  // 4. Update the ledger when a payment is made
  async updateLedger(billId, updateData) {
    return await Bill.findByIdAndUpdate(
      billId,
      { $set: updateData },
      { new: true }
    );
  }
}

export default new BillRepository();