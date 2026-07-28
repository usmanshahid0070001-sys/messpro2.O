import mongoose from 'mongoose';

const mealRecordSchema = new mongoose.Schema({
  // 1. Core Identifiers
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
  date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
  mealType: { type: String, required: true }, // e.g., 'Breakfast', 'Lunch', 'Dinner'
  
  // 2. Identity (Handles both registered students AND unregistered walk-in guests)
  rollNumber: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Null if it's a guest
  isGuest: { type: Boolean, default: false },

  // 3. The Financial Snapshot (Inflation-Proof Billing)
  mealInfo: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },

  // 4. STAGE 1: The Selection (Done before the cutoff time)
  selection: {
    hasSelected: { type: Boolean, default: false },
    count: { type: Number, default: 0 }, // How many portions they selected (Max limit enforced in Service)
  },

  // 5. STAGE 2: The Attendance (Done at the dining hall)
  attendance: {
    hasEaten: { type: Boolean, default: false },
    count: { type: Number, default: 0 }, // How many portions they actually took
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // The Manager Audit Trail
  }
}); // 👈 Removed { timestamps: true } to keep the database lightweight

// 6. The Double-Dip Bouncer
// This physically prevents a student from having two separate records for the same meal.
mealRecordSchema.index({ hostelId: 1, date: 1, mealType: 1, rollNumber: 1 }, { unique: true });

export default mongoose.model('MealRecord', mealRecordSchema);