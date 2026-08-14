import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface HostelState {
  currentHostel: any | null
}

const initialState: HostelState = {
  currentHostel: null,
}

const hostelSlice = createSlice({
  name: 'hostel',
  initialState,
  reducers: {
    setHostel: (state, action: PayloadAction<any>) => {
      state.currentHostel = action.payload
    },
    clearHostel: (state) => {
      state.currentHostel = null
    },
  },
})

export const { setHostel, clearHostel } = hostelSlice.actions
export default hostelSlice.reducer
