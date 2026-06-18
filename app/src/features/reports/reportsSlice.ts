import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { DailyCheckinsData, FinancialSummaryData } from '../../models/Report'
import * as api from '../../shared/apis/Reports'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type ReportsState = {
  dailyCheckins: {
    data?: DailyCheckinsData
    status: AsyncStatus
    error?: string
  }
  financialSummary: {
    data?: FinancialSummaryData
    status: AsyncStatus
    error?: string
  }
}

const initialState: ReportsState = {
  dailyCheckins: {
    data: undefined,
    status: 'idle',
    error: undefined,
  },
  financialSummary: {
    data: undefined,
    status: 'idle',
    error: undefined,
  },
}

export const fetchDailyCheckinsReport = createAsyncThunk(
  'reports/fetchDailyCheckins',
  async (date: string, thunkApi) => {
    try {
      return await api.getDailyCheckinsReport(date, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load daily check-ins report'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchFinancialSummaryReport = createAsyncThunk(
  'reports/fetchFinancialSummary',
  async ({ startDate, endDate }: { startDate: string; endDate: string }, thunkApi) => {
    try {
      return await api.getFinancialSummaryReport(startDate, endDate, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load financial summary report'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReportsError(state) {
      state.dailyCheckins.error = undefined
      state.financialSummary.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyCheckinsReport.pending, (state) => {
        state.dailyCheckins.status = 'loading'
        state.dailyCheckins.error = undefined
      })
      .addCase(fetchDailyCheckinsReport.fulfilled, (state, action) => {
        state.dailyCheckins.status = 'succeeded'
        state.dailyCheckins.data = action.payload
      })
      .addCase(fetchDailyCheckinsReport.rejected, (state, action) => {
        state.dailyCheckins.status = 'failed'
        state.dailyCheckins.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(fetchFinancialSummaryReport.pending, (state) => {
        state.financialSummary.status = 'loading'
        state.financialSummary.error = undefined
      })
      .addCase(fetchFinancialSummaryReport.fulfilled, (state, action) => {
        state.financialSummary.status = 'succeeded'
        state.financialSummary.data = action.payload
      })
      .addCase(fetchFinancialSummaryReport.rejected, (state, action) => {
        state.financialSummary.status = 'failed'
        state.financialSummary.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearReportsError } = reportsSlice.actions
export const reportsReducer = reportsSlice.reducer
