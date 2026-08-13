import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    hostelid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
    },
    roomid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      // Not all students might be allotted a room yet, or might just file a general complaint
    },
    roll_number: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    intensity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxLength: 80,
    },
    status: {
      type: String,
      enum: ['Open', 'Assigned', 'In Progress', 'Resolved'],
      default: 'Open',
    },
  },
  {
    timestamps: true,
  }
);

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
