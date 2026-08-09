import mongoose from "mongoose";

const customChargeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  value: { type: Number, default: null },
  linkedFieldId: { type: String, default: null },
  included: { type: Boolean, default: true }
}, { _id: false });

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  subdomain: {
    type: String,
    required: true,
    // unique: true,
    lowercase: true,
  },
  location: {
    type: String,
    required: true,
  },
  customRegistrationFields: {
    type: [{
      name: String,        // e.g., "CNIC", "Phone Number", "Blood Group"
      isRequired: Boolean  // e.g., true or false
    }],
    validate: [
      (array) => array.length <= 5, 
      'You can only add a maximum of 5 custom fields.'
    ]
  },

  plan: {
    // We store the ID just so we know which template they originated from
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    name: { type: String, required: true },
    
    // THE SNAPSHOT: The exact limits copied from the Plan at the time of creation
    limits: {
      maxStudents: { type: Number, required: true },
      maxManagers: { type: Number, required: true }
    },
    features: [{
      name: { type: String, required: true },
      isEnabled: { type: Boolean, default: true }
    }]
  },
  
  trialExpiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  isTrial: {
    type: Boolean,
    default: true
  },
  
  status: {
    type: String,
    enum: ['Active', 'Suspended', 'Archived', 'Inactive', 'Expired'],
    default: 'Active'
  },
  
  subscriptionExpiresAt: {
    type: Date,
    default: null
  },

  // 👇 1. THE SECURE POINTER (Moved to root level for easy querying)
  qrSecret: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 10).toUpperCase(), // e.g., "X7B9K2M1"
  },
  
  // 👇 2. THE GEOFENCE CENTER (Moved to root level)
  locationCoords: {
    lat: { type: Number, required: true, default: 0 },
    lng: { type: Number, required: true, default: 0 },
  },

  settings: {
    autoMealVerification: {
      type: Boolean,
      default: true
    },
    isDynamicBillingEnabled: {
      type: Boolean,
      default: true
    },
    customCharges: [customChargeSchema]
  }
}, { timestamps: true });

export default mongoose.model('Hostel', hostelSchema);