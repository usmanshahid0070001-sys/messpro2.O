import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    id: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: function () {
        return this.role === 'student';
      },
    },
    hostelId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['student', 'manager', 'admin', 'superadmin'],
      required: true,
      default: 'student',
    },
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
      select: false,
    },
    additionalInfo: [
      {
        key: {
          type: String,
          required: true,
          trim: true,
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    additionalFunctionality: {
      type: String,
      default: 'none',
    },
  },
  { timestamps: true }
);

userSchema.pre('validate', function (next) {
  if (!this.id) {
    const localPart = this.email?.split('@')[0] ?? 'user';
    this.id = `${this.role}-${localPart}-${crypto.randomBytes(3).toString('hex')}`;
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model('User', userSchema);
