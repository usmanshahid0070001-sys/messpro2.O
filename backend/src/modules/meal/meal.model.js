import mongoose from 'mongoose';

// We define a sub-schema for the daily menu items to keep the main schema clean
const menuItemSchema = new mongoose.Schema(
  {
    meal: { type: String, required: true }, // e.g., "Chicken Biryani"
    price: { type: Number, required: true, min: 0 }, // e.g., 150
  },
  { _id: false } // We don't need distinct ObjectIds for every single menu item
);

// Sub-schema for time window ranges (start time and end time)
const timeWindowSchema = new mongoose.Schema(
  {
    start: { type: String, default: '' }, // e.g., "06:00 AM" or "06:00"
    end: { type: String, default: '' },   // e.g., "10:00 AM" or "10:00"
  },
  { _id: false }
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
      type: [timeWindowSchema], // Student meal booking time range [start, end]
      default: [],
    },
    servingTiming: {
      type: [timeWindowSchema], // Dining hall serving & attendance time range [start, end]
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

    maxMealSelection: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active', // 'active' means students can select meals. 'inactive' means view menu only.
    },
  },
  { timestamps: true }
);

export default mongoose.model('MealSchedule', mealScheduleSchema);