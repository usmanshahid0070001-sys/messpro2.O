


// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import crypto from 'crypto';

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     id: {
//       type: String,
//       unique: true,
//       trim: true,
//       lowercase: true,
//       required: function () {
//         return this.role === 'student';
//       },
//     },
//     hostelId: {
//       type: String,
//       required: true,
//       trim: true,
//       index: true,
//     },
//     role: {
//       type: String,
//       enum: ['student', 'manager', 'admin', 'superadmin'],
//       required: true,
//       default: 'student',
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: true,
//       select: false,
//     },
    
//     // 👇 NEW RESIDENCE ARCHITECTURE 👇
//     // This creates a fast, relational link to the new Room collection
//     room: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Room',
//       default: null, // Starts as null until a room is allotted
//     },
//     // 👆 END NEW ARCHITECTURE 👆

//     additionalInfo: [
//       {
//         key: {
//           type: String,
//           required: true,
//           trim: true,
//         },
//         value: {
//           type: String,
//           required: true,
//           trim: true,
//         },
//       },
//     ],
//     additionalFunctionality: {
//       type: String,
//       default: 'none',
//     },
//   },
//   { timestamps: true }
// );

// userSchema.pre('validate', function (next) {
//   if (!this.id) {
//     const localPart = this.email?.split('@')[0] ?? 'user';
//     this.id = `${this.role}-${localPart}-${crypto.randomBytes(3).toString('hex')}`;
//   }
//   next();
// });

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }

//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// userSchema.methods.toPublicJSON = function () {
//   const userObject = this.toObject();
//   delete userObject.password;
//   return userObject;
// };

// export default mongoose.model('User', userSchema);




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
    
    // 👇 THE NEW SPARSE ARRAY PERMISSIONS 👇
    permissions: {
      type: [String],
      // Define every toggleable feature your SaaS has right here
      enum: [
        'add_student', 
        'edit_menu', 
        'manage_complaints', 
        'take_attendance', 
        'view_reports',
        'meal_settings',
        'user_management',
        'residence_management',
        'service_management'
      ],
      default: [], // Starts empty so it uses zero extra memory!
    },
    // 👆 END NEW PERMISSIONS 👆

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
    
    // 👇 NEW RESIDENCE ARCHITECTURE 👇
    // This creates a fast, relational link to the new Room collection
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null, // Starts as null until a room is allotted
    },
    // 👆 END NEW ARCHITECTURE 👆

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