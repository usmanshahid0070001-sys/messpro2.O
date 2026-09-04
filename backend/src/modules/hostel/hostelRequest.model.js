import mongoose from 'mongoose';

const hostelRequestSchema = new mongoose.Schema(
  {
    hostelName: {
      type: String,
      required: true,
      trim: true,
    },
    subdomain: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      default: 'Asia/Karachi',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    adminEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    adminPhone: {
      type: String,
      required: true,
      trim: true,
    },
    managerName: {
      type: String,
      trim: true,
      default: '',
    },
    managerEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    requestedPlan: {
      planType: {
        type: String,
        enum: ['trial', '10_day_trial', 'standard', 'enterprise', 'custom'],
        default: '10_day_trial',
      },
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        default: null,
      },
      estimatedStudents: {
        type: Number,
        default: 100,
      },
      estimatedManagers: {
        type: Number,
        default: 2,
      },
      desiredFeatures: {
        type: [String],
        default: [],
      },
      customFeatures: {
        type: [String],
        default: [],
      },
      notes: {
        type: String,
        default: '',
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    approvedHostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    supportContact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('HostelRequest', hostelRequestSchema);
