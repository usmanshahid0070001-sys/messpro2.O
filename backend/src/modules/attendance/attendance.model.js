import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    mealType: {
      type: String, // 'Breakfast', 'Lunch', 'Dinner'
      required: true,
    },
    mealInfo: {
      name: { type: String, required: true },
      price: { type: Number, required: true }, // Snapshotted at time of attendance for billing
    },
    // The student or guest roll number. We use this as a string to allow unregistered guests.
    rollNumber: {
      type: String,
      required: true,
    },
    // If the roll number belongs to a registered user (even from another hostel), reference them.
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    count: {
      type: Number,
      required: true,
      default: 1,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    // The user who marked this attendance (manager/admin)
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  { timestamps: true }
);

// Compound index for fast querying and uniqueness per person per meal
attendanceSchema.index({ hostel: 1, date: 1, mealType: 1, rollNumber: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
