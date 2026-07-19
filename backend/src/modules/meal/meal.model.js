import mongoose from 'mongoose';

// We define a sub-schema for the daily menu items to keep the main schema clean
const menuItemSchema = new mongoose.Schema(
  {
    meal: { type: String, required: true }, // e.g., "Chicken Biryani"
    price: { type: Number, required: true, min: 0 }, // e.g., 150
  },
  { _id: false } // We don't need distinct ObjectIds for every single menu item
);

const mealScheduleSchema = new mongoose.Schema(
  {
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
      unique: true, // 👈 ENFORCES THE RULE: Only ONE schedule per hostel!
      index: true,
    },
    groupId: {
      type: String,
      default: null,
    },
    numberOfMeals: {
      type: Number,
      default: 1,
      min: 1,
    },
    mealNames: {
      type: [String], // e.g., ["Breakfast", "Lunch", "Dinner"]
      default: [],
    },
    selectionTiming: {
      type: [String], // e.g., ["04:00 AM", "03:00 PM", "09:00 PM"]
      default: [],
    },
    
   
    menu: {
      Monday: { type: [menuItemSchema], default: [] },
      Tuesday: { type: [menuItemSchema], default: [] },
      Wednesday: { type: [menuItemSchema], default: [] },
      Thursday: { type: [menuItemSchema], default: [] },
      Friday: { type: [menuItemSchema], default: [] },
      Saturday: { type: [menuItemSchema], default: [] },
      Sunday: { type: [menuItemSchema], default: [] },
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active', // 'inactive' means this hostel doesn't offer a mess facility
    },
  },
  { timestamps: true }
);

export default mongoose.model('MealSchedule', mealScheduleSchema);