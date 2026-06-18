import { createSlice } from '@reduxjs/toolkit'

interface ShiftState {
  isShiftActive: boolean
}

const initialState: ShiftState = {
  isShiftActive: false,
}

export const shiftSlice = createSlice({
  name: 'shift',
  initialState,
  reducers: {
    startShift: (state) => {
      state.isShiftActive = true
    },
    endShift: (state) => {
      state.isShiftActive = false
    },
  },
})

export const { startShift, endShift } = shiftSlice.actions
export const shiftReducer = shiftSlice.reducer
