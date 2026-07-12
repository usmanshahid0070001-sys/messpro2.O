import mongoose from 'mongoose';

const plainUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    hostelId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('PlainUser', plainUserSchema);
