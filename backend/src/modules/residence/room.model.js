import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
    },
    roomName: {
      type: String,
      required: true,
      trim: true,
      // e.g., "A-1", "Room 14"
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'A room must have at least 1 bed.'],
    },
    occupants: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Available', 'Full', 'Maintenance'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

// 🚨 THE ARCHITECT'S INDEX: 
// A hostel cannot have two rooms with the exact same name.
// But two DIFFERENT hostels can both have a "Room A-1".
roomSchema.index({ hostelId: 1, roomName: 1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema);
export default Room;