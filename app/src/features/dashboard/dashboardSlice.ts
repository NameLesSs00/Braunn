import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import type { DailyDashboardResponse } from '../../models/DailyDashboard'
import { getDailyDashboard } from '../../shared/apis/DailyDashboard'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface DashboardState {
  daily: DailyDashboardResponse | null
  status: AsyncStatus
  error: string | null
}

const initialState: DashboardState = {
  daily: null,
  status: 'idle',
  error: null,
}

export const fetchDailyDashboard = createAsyncThunk(
  'dashboard/fetchDaily',
  async (date: string, thunkApi) => {
    try {
      return await getDailyDashboard(date, thunkApi.signal)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard data'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyDashboard.pending, (state) => {
        state.status = 'loading'
        state.daily = null
        state.error = null
      })
      .addCase(fetchDailyDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.daily = action.payload
      })
      .addCase(fetchDailyDashboard.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.status = 'failed'
        state.daily = null
        state.error = (action.payload as string | null) ?? action.error.message ?? 'Unknown error'
      })
  },
})

export const { clearDashboardError } = dashboardSlice.actions
export const dashboardReducer = dashboardSlice.reducer
