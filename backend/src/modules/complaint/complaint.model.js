import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    hostelid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    roomid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    roll_number: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    intensity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      required: true,
      default: 'Medium',
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxLength: 500,
    },
    status: {
      type: String,
      enum: ['Open', 'Assigned', 'In Progress', 'Resolved'],
      default: 'Open',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Compound Indexes
complaintSchema.index({ hostelid: 1, status: 1, createdAt: -1 });
complaintSchema.index({ hostelid: 1, studentId: 1, createdAt: -1 });
complaintSchema.index({ hostelid: 1, roll_number: 1 });
complaintSchema.index({ hostelid: 1, intensity: 1, status: 1 });
complaintSchema.index({ studentId: 1, createdAt: -1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;

