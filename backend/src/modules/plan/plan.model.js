import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  // The exact limits the Super Admin can customize in the UI
  limits: {
    maxStudents: {
      type: Number,
      required: true,
      default: 100, // -1 could represent unlimited
    },
    maxManagers: {
      type: Number,
      required: true,
      default: 1,
    }
  },
  // The exact features the Super Admin can provide in the UI
  features: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

export default mongoose.model('Plan', planSchema);