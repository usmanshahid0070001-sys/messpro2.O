import Bill from './bill.model.js';

class BillRepository {
  
  // 1. The Collision Checker: Finds if a bill already exists for this exact date range
  async findExistingBill(hostelId, studentId, startDate, endDate) {
    return await Bill.findOne({
      hostelId,
      studentId,
      'billingPeriod.startDate': startDate,
      'billingPeriod.endDate': endDate
    });
  }

  // 2. The Arrears Hunter: Finds all unpaid or partially paid bills for a student
  async findUnpaidBills(hostelId, studentId) {
    return await Bill.find({
      hostelId,
      studentId,
      status: { $in: ['Unpaid', 'Adjusted in Balance'] }
    });
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