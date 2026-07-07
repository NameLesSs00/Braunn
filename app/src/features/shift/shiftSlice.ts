import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/CashierShift'
import type { CashierShift, OpenShiftPayload, CloseShiftPayload } from '../../models/CashierShift'

// ─── LocalStorage keys ────────────────────────────────────────────────────────
const LS_SHIFT_ID = 'cashier_shift_id'
const LS_CASHIER_USER_ID = 'cashier_user_id'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface ShiftState {
  // Business Date
  businessDate: string | null
  lastClosedBusinessDate: string | null
  businessDateStatus: AsyncStatus

  // Active Shift
  currentShift: CashierShift | null
  shiftStatus: AsyncStatus       // fetch current shift
  openStatus: AsyncStatus        // open shift
  closeStatus: AsyncStatus       // close shift
  error: string | null
}

const initialState: ShiftState = {
  businessDate: null,
  lastClosedBusinessDate: null,
  businessDateStatus: 'idle',

  currentShift: null,
  shiftStatus: 'idle',
  openStatus: 'idle',
  closeStatus: 'idle',
  error: null,
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchBusinessDate = createAsyncThunk(
  'shift/fetchBusinessDate',
  async (_, thunkApi) => {
    try {
      return await api.getCurrentBusinessDate(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch business date'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchCurrentShift = createAsyncThunk(
  'shift/fetchCurrentShift',
  async (_, thunkApi) => {
    try {
      return await api.getCurrentShift(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch current shift'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const openCashierShift = createAsyncThunk(
  'shift/openCashierShift',
  async (payload: OpenShiftPayload, thunkApi) => {
    try {
      const shift = await api.openShift(payload, thunkApi.signal)
      // Persist to localStorage for refresh resilience
      localStorage.setItem(LS_SHIFT_ID, shift.id)
      localStorage.setItem(LS_CASHIER_USER_ID, shift.cashierUserId)
      return shift
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to open shift'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const closeCashierShift = createAsyncThunk(
  'shift/closeCashierShift',
  async ({ shiftId, payload }: { shiftId: string; payload: CloseShiftPayload }, thunkApi) => {
    try {
      const shift = await api.closeShift(shiftId, payload, thunkApi.signal)
      localStorage.removeItem(LS_SHIFT_ID)
      localStorage.removeItem(LS_CASHIER_USER_ID)
      return shift
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to close shift'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const shiftSlice = createSlice({
  name: 'shift',
  initialState,
  reducers: {
    clearShiftError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBusinessDate
      .addCase(fetchBusinessDate.pending, (state) => {
        state.businessDateStatus = 'loading'
        state.error = null
      })
      .addCase(fetchBusinessDate.fulfilled, (state, action) => {
        state.businessDateStatus = 'succeeded'
        state.businessDate = action.payload.currentBusinessDate
        state.lastClosedBusinessDate = action.payload.lastClosedBusinessDate
      })
      .addCase(fetchBusinessDate.rejected, (state, action) => {
        state.businessDateStatus = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })

      // fetchCurrentShift
      .addCase(fetchCurrentShift.pending, (state) => {
        state.shiftStatus = 'loading'
        state.error = null
      })
      .addCase(fetchCurrentShift.fulfilled, (state, action) => {
        state.shiftStatus = 'succeeded'
        state.currentShift = action.payload
        // Re-sync localStorage in case data was cleared
        if (action.payload && action.payload.status === 'Open') {
          localStorage.setItem(LS_SHIFT_ID, action.payload.id)
          localStorage.setItem(LS_CASHIER_USER_ID, action.payload.cashierUserId)
        }
      })
      .addCase(fetchCurrentShift.rejected, (state, action) => {
        state.shiftStatus = 'failed'
        state.currentShift = null
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })

      // openCashierShift
      .addCase(openCashierShift.pending, (state) => {
        state.openStatus = 'loading'
        state.error = null
      })
      .addCase(openCashierShift.fulfilled, (state, action) => {
        state.openStatus = 'succeeded'
        state.currentShift = action.payload
      })
      .addCase(openCashierShift.rejected, (state, action) => {
        state.openStatus = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })

      // closeCashierShift
      .addCase(closeCashierShift.pending, (state) => {
        state.closeStatus = 'loading'
        state.error = null
      })
      .addCase(closeCashierShift.fulfilled, (state, action) => {
        state.closeStatus = 'succeeded'
        state.currentShift = action.payload
      })
      .addCase(closeCashierShift.rejected, (state, action) => {
        state.closeStatus = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })
  },
})

// ─── Selectors ────────────────────────────────────────────────────────────────

/** True when there is a current shift with status "Open" */
export function selectIsShiftActive(state: { shift: ShiftState }): boolean {
  return state.shift.currentShift?.status === 'Open'
}

/** The cashierUserId from the active shift, or null */
export function selectCashierUserId(state: { shift: ShiftState }): string | null {
  return state.shift.currentShift?.cashierUserId ?? null
}

/** The current business date string (YYYY-MM-DD), or null if not yet fetched */
export function selectCurrentBusinessDate(state: { shift: ShiftState }): string | null {
  return state.shift.businessDate
}

export const { clearShiftError } = shiftSlice.actions
export const shiftReducer = shiftSlice.reducer
export default shiftSlice.reducer
