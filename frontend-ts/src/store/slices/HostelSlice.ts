import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface CustomCharge {
  id: string;
  name: string;
  type: string;
  value: number | null;
  linkedFieldId: string | null;
  included: boolean;
}

export interface HostelSettings {
  authMethod?: string;
  attendanceMethod?: string;
  billingModel?: string;
  autoMealVerification?: boolean;
  autoVerification?: boolean;
  customCharges: CustomCharge[];
  isDynamicBillingEnabled: boolean;
}

export interface CustomRegistrationField {
  name: string;
  isRequired: boolean;
  _id?: string | { $oid: string };
}

export interface PlanLimits {
  maxStudents: number;
  maxManagers: number;
  managers: number;
  students: number;
}

export interface PlanFeature {
  name: string;
  isEnabled: boolean;
  _id?: string | { $oid: string };
}

export interface HostelPlan {
  planId?: string | { $oid: string };
  name?: string;
  limits?: PlanLimits;
  features: PlanFeature[];
}

export interface Hostel {
  _id: string | { $oid: string };
  name: string;
  subdomain: string;
  location: string;
  isTrial?: boolean;
  status: string;
  settings: HostelSettings;
  customRegistrationFields: CustomRegistrationField[];
  trialExpiresAt?: string | { $date: string };
  createdAt?: string | { $date: string };
  updatedAt?: string | { $date: string };
  subscriptionExpiresAt?: string | { $date: string };
  plan: HostelPlan;
  qrSecret?: string;
  locationCoords?: {
    lat: number;
    lng: number;
  };
}

export interface HostelState {
  currentHostel: Hostel | null
}

const initialState: HostelState = {
  currentHostel: null,
}

const hostelSlice = createSlice({
  name: 'hostel',
  initialState,
  reducers: {
    setHostel: (state, action: PayloadAction<Hostel>) => {
      state.currentHostel = action.payload
    },
    clearHostel: (state) => {
      state.currentHostel = null
    },
  },
})

export const { setHostel, clearHostel } = hostelSlice.actions
export default hostelSlice.reducer
