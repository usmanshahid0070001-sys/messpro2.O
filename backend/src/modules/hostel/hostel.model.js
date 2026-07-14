import mongoose from "mongoose";
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
      }
,
    //each hostel status and plan (tenant)
    // plan: {
    //     type: String,
    //     enum: ['Basic', 'Standard', 'Premium', 'Enterprise'],
    //     default: 'Basic'
    // },
    // Inside your hostel.model.js, update the plan and settings section:

  plan: {
    // We store the ID just so we know which template they originated from
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    name: { type: String, required: true },
    
    // THE SNAPSHOT: The exact limits copied from the Plan at the time of creation
    limits: {
      maxStudents: { type: Number, required: true },
      maxManagers: { type: Number, required: true }
    },
    features: {
      allowedAttendanceMethods: [String],
      allowedBillingModels: [String],
      allowAutoMealVerification: Boolean
    }
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
        enum: ['Active', 'Suspended', 'Archived'],
        default: 'Active'
    },

    settings: {
        authMethod: {
            type: String,
            enum: ['Email', 'RollNumber'],
            
        },
        attendanceMethod: {
            type: String,
            enum: ['Manual', 'QR', 'Biometric'],
            default: 'Manual'
        },
        billingModel: {
            type: String,
            enum: ['Prepaid', 'Postpaid', 'FlatRate'],
            default: 'Prepaid'
        },
        autoMealVerification: {
            type: Boolean,
            default: true
        }
    }
}, { timestamps: true });
export default mongoose.model('Hostel', hostelSchema)
