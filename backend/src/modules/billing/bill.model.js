import mongoose from 'mongoose';

// 👇 1. We create a sub-schema for the custom charges your teammate requested
const customChargeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  }, // e.g., "Service Charges", "Fines"
  
  chargeType: { 
    type: String, 
    enum: ['addition', 'multiple', 'percentage'], 
    required: true 
  }, // How the math should be applied
  
  value: { 
    type: Number, 
    required: true 
  }, // e.g., 750 (for addition) or 10 (for percentage)
  
  target: { 
    type: String, 
    enum: ['mess_bill', 'unpaid_bill', 'none'], 
    default: 'none' 
  }, // What we apply the percentage/multiple to
  
  calculatedAmount: { 
    type: Number, 
    required: true 
  } // The actual Rupee amount we add/subtract from the final total
}, { _id: false });


// 👇 2. The Main Bill Schema
const billSchema = new mongoose.Schema({
  // Core Identifiers
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // The Collision Shield: The date range this bill covers
  billingPeriod: {
    startDate: { type: String, required: true }, // Format: YYYY-MM-DD
    endDate: { type: String, required: true }    // Format: YYYY-MM-DD
  },

  // The Base Math
  baseMessBill: { 
    type: Number, 
    default: 0 
  }, // The sum of all MealRecords for this period
  
  previousUnpaidArrears: { 
    type: Number, 
    default: 0 
  }, // Brought forward if 'unpaid_bill' flag is true

  // The dynamic attributes array
  customCharges: [customChargeSchema], 

  // 👇 3. The Accounting Ledger (Exactly as requested)
  total: { 
    type: Number, 
    required: true 
  },
  
  paidBill: { 
    type: Number, 
    default: 0 
  },
  
  remainingBill: { 
    type: Number, 
    required: true 
  },
  
  status: { 
    type: String, 
    enum: ['Paid', 'Adjusted in Balance', 'Unpaid'], 
    default: 'Unpaid' 
  }
  
}, { timestamps: true });

export default mongoose.model('Bill', billSchema);