import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type {
  DailyCheckinsData,
  FinancialSummaryData,
  KpiDashboardData,
  RevenueAnalyticsData,
  OccupancyForecastData,
  PaceReportData,
  ChannelPerformanceData,
  CancellationReportData,
} from '../../models/Report'
import * as api from '../../shared/apis/Reports'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type BaseReportParams = {
  startDate: string
  endDate: string
  roomTypeId?: string
  reservationSource?: string
}

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
  kpiDashboard: {
    data?: KpiDashboardData
    status: AsyncStatus
    error?: string
  }
  revenueAnalytics: {
    data?: RevenueAnalyticsData
    status: AsyncStatus
    error?: string
  }
  occupancyForecast: {
    data?: OccupancyForecastData
    status: AsyncStatus
    error?: string
  }
  paceReport: {
    data?: PaceReportData
    status: AsyncStatus
    error?: string
  }
  channelPerformance: {
    data?: ChannelPerformanceData
    status: AsyncStatus
    error?: string
  }
  cancellationReport: {
    data?: CancellationReportData
    status: AsyncStatus
    error?: string
  }
}

const initialState: ReportsState = {
  dailyCheckins: { data: undefined, status: 'idle', error: undefined },
  financialSummary: { data: undefined, status: 'idle', error: undefined },
  kpiDashboard: { data: undefined, status: 'idle', error: undefined },
  revenueAnalytics: { data: undefined, status: 'idle', error: undefined },
  occupancyForecast: { data: undefined, status: 'idle', error: undefined },
  paceReport: { data: undefined, status: 'idle', error: undefined },
  channelPerformance: { data: undefined, status: 'idle', error: undefined },
  cancellationReport: { data: undefined, status: 'idle', error: undefined },
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchDailyCheckinsReport = createAsyncThunk(
  'reports/fetchDailyCheckins',
  async (date: string, thunkApi) => {
    try {
      return await api.getDailyCheckinsReport(date, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(e instanceof Error ? e.message : 'Failed to load daily check-ins report')
    }
  }
)

export const fetchFinancialSummaryReport = createAsyncThunk(
  'reports/fetchFinancialSummary',
  async ({ startDate, endDate }: { startDate: string; endDate: string }, thunkApi) => {
    try {
      return await api.getFinancialSummaryReport(startDate, endDate, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(e instanceof Error ? e.message : 'Failed to load financial summary report')
    }
  }
)

export const fetchKpiDashboard = createAsyncThunk(
  'reports/fetchKpiDashboard',
  async (params: BaseReportParams, thunkApi) => {
    try {
      return await api.getKpiDashboard(params, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(e instanceof Error ? e.message : 'Failed to load KPI dashboard')
    }
  }
)

export const fetchRevenueAnalytics = createAsyncThunk(
  'reports/fetchRevenueAnalytics',
  async (params: BaseReportParams, thunkApi) => {
    try {
      return await api.getRevenueAnalytics(params, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(e instanceof Error ? e.message : 'Failed to load revenue analytics')
    }
  }
)

export const fetchOccupancyForecast = createAsyncThunk(
  'reports/fetchOccupancyForecast',
  async (params: BaseReportParams & { trendDays: number }, thunkApi) => {
    try {
      return await api.getOccupancyForecast(params, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(e instanceof Error ? e.message : 'Failed to load occupancy forecast')
    }
  }
)

export const fetchPaceReport = createAsyncThunk(
  'reports/fetchPaceReport',
  async (params: BaseReportParams & { trendDays: number }, thunkApi) => {
    try {
      return await api.getPaceReport(params, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(e instanceof Error ? e.message : 'Failed to load pace report')
    }
  }
)

export const fetchChannelPerformance = createAsyncThunk(
  'reports/fetchChannelPerformance',
  async (params: BaseReportParams, thunkApi) => {
    try {
      return await api.getChannelPerformance(params, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(e instanceof Error ? e.message : 'Failed to load channel performance')
    }
  }
)

export const fetchCancellationReport = createAsyncThunk(
  'reports/fetchCancellationReport',
  async (params: BaseReportParams & { trendDays: number }, thunkApi) => {
    try {
      return await api.getCancellationReport(params, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(e instanceof Error ? e.message : 'Failed to load cancellation report')
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReportsError(state) {
      state.dailyCheckins.error = undefined
      state.financialSummary.error = undefined
      state.kpiDashboard.error = undefined
      state.revenueAnalytics.error = undefined
      state.occupancyForecast.error = undefined
      state.paceReport.error = undefined
      state.channelPerformance.error = undefined
      state.cancellationReport.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      // Daily Checkins
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

      // Financial Summary
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

      // KPI Dashboard
      .addCase(fetchKpiDashboard.pending, (state) => {
        state.kpiDashboard.status = 'loading'
        state.kpiDashboard.error = undefined
      })
      .addCase(fetchKpiDashboard.fulfilled, (state, action) => {
        state.kpiDashboard.status = 'succeeded'
        state.kpiDashboard.data = action.payload
      })
      .addCase(fetchKpiDashboard.rejected, (state, action) => {
        state.kpiDashboard.status = 'failed'
        state.kpiDashboard.error = (action.payload as string | undefined) ?? action.error.message
      })

      // Revenue Analytics
      .addCase(fetchRevenueAnalytics.pending, (state) => {
        state.revenueAnalytics.status = 'loading'
        state.revenueAnalytics.error = undefined
      })
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        state.revenueAnalytics.status = 'succeeded'
        state.revenueAnalytics.data = action.payload
      })
      .addCase(fetchRevenueAnalytics.rejected, (state, action) => {
        state.revenueAnalytics.status = 'failed'
        state.revenueAnalytics.error = (action.payload as string | undefined) ?? action.error.message
      })

      // Occupancy Forecast
      .addCase(fetchOccupancyForecast.pending, (state) => {
        state.occupancyForecast.status = 'loading'
        state.occupancyForecast.error = undefined
      })
      .addCase(fetchOccupancyForecast.fulfilled, (state, action) => {
        state.occupancyForecast.status = 'succeeded'
        state.occupancyForecast.data = action.payload
      })
      .addCase(fetchOccupancyForecast.rejected, (state, action) => {
        state.occupancyForecast.status = 'failed'
        state.occupancyForecast.error = (action.payload as string | undefined) ?? action.error.message
      })

      // Pace Report
      .addCase(fetchPaceReport.pending, (state) => {
        state.paceReport.status = 'loading'
        state.paceReport.error = undefined
      })
      .addCase(fetchPaceReport.fulfilled, (state, action) => {
        state.paceReport.status = 'succeeded'
        state.paceReport.data = action.payload
      })
      .addCase(fetchPaceReport.rejected, (state, action) => {
        state.paceReport.status = 'failed'
        state.paceReport.error = (action.payload as string | undefined) ?? action.error.message
      })

      // Channel Performance
      .addCase(fetchChannelPerformance.pending, (state) => {
        state.channelPerformance.status = 'loading'
        state.channelPerformance.error = undefined
      })
      .addCase(fetchChannelPerformance.fulfilled, (state, action) => {
        state.channelPerformance.status = 'succeeded'
        state.channelPerformance.data = action.payload
      })
      .addCase(fetchChannelPerformance.rejected, (state, action) => {
        state.channelPerformance.status = 'failed'
        state.channelPerformance.error = (action.payload as string | undefined) ?? action.error.message
      })

      // Cancellation & No Show Report
      .addCase(fetchCancellationReport.pending, (state) => {
        state.cancellationReport.status = 'loading'
        state.cancellationReport.error = undefined
      })
      .addCase(fetchCancellationReport.fulfilled, (state, action) => {
        state.cancellationReport.status = 'succeeded'
        state.cancellationReport.data = action.payload
      })
      .addCase(fetchCancellationReport.rejected, (state, action) => {
        state.cancellationReport.status = 'failed'
        state.cancellationReport.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearReportsError } = reportsSlice.actions
export const reportsReducer = reportsSlice.reducer
