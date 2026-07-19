// import mongoose from 'mongoose';

// const plainUserSchema = new mongoose.Schema(
//   {
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
//     },
//     role: {
//       type: String,
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     hostelId: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model('PlainUser', plainUserSchema);



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
    
    // 👇 SYNCHRONIZED SPARSE ARRAY PERMISSIONS 👇
    permissions: {
      type: [String],
      // This enum must perfectly match auth.model.js
      enum: [
        'add_student', 
        'edit_menu', 
        'manage_complaints', 
        'take_attendance', 
        'view_reports'
      ],
      default: [], // Starts empty, zero memory bloat
    },
    // 👆 END NEW PERMISSIONS 👆

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