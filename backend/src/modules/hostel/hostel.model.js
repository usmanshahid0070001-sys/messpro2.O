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
        unique: true,
        lowercase: true,
    },

    location: {
        type: String,
        required: true,
    },


    //each hostel status and plan (tenant)
    plan: {
        type: String,
        enum: ['Basic', 'Premium', 'Enterprise'],
        default: 'Basic'
    },
    status: {
        type: String,
        enum: ['Active', 'Suspended', 'Archived'],
        default: 'Active'
    },

    settings: {
        authMethod: {
            type: String,
            enum: ['RollNumber', 'Email', 'CNIC'],
            default: 'RyollNumber'
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
