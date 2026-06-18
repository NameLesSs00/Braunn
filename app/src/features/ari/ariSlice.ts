import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/ARI'
import type { ARIRate, ARIAvailability } from '../../models/ARI'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface ARIState {
  rates: ARIRate[]
  availability: ARIAvailability[]
  status: AsyncStatus
  availabilityStatus: AsyncStatus
  error: string | null
}

const initialState: ARIState = {
  rates: [],
  availability: [],
  status: 'idle',
  availabilityStatus: 'idle',
  error: null,
}

export const fetchARIRates = createAsyncThunk(
  'ari/fetchRates',
  async ({ startDate, endDate }: { startDate: string; endDate: string }, thunkApi) => {
    try {
      return await api.getARIRates(startDate, endDate, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch ARI rates'
      return thunkApi.rejectWithValue(message)
    }
  }
)
 
export const fetchARIAvailability = createAsyncThunk(
  'ari/fetchAvailability',
  async (params: api.GetARIAvailabilityParams, thunkApi) => {
    try {
      return await api.getARIAvailability(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch ARI availability'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const ariSlice = createSlice({
  name: 'ari',
  initialState,
  reducers: {
    clearARIError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchARIRates.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchARIRates.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.rates = action.payload
      })
      .addCase(fetchARIRates.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })
 
      .addCase(fetchARIAvailability.pending, (state) => {
        state.availabilityStatus = 'loading'
        state.error = null
      })
      .addCase(fetchARIAvailability.fulfilled, (state, action) => {
        state.availabilityStatus = 'succeeded'
        state.availability = action.payload
      })
      .addCase(fetchARIAvailability.rejected, (state, action) => {
        state.availabilityStatus = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })
  },
})

export const { clearARIError } = ariSlice.actions
export const ariReducer = ariSlice.reducer
