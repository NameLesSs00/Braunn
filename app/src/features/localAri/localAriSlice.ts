import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/LocalAri'
import type { LocalARIRate, GetLocalARIRatesParams, CreateLocalARIRatePayload, CreateLocalARIAvailabilityPayload, GetLocalARIAvailabilityParams, LocalARIAvailability, UpdateLocalARISingleDayRatePayload, ARIRatePlan, ARIUpdateRatesPayload, ARIUpdateRatesResponse } from '../../models/LocalAri'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface LocalARIState {
  rates: LocalARIRate[]
  availability: LocalARIAvailability[]
  status: AsyncStatus
  availabilityStatus: AsyncStatus
  error: string | null
  ariRatePlans: ARIRatePlan[]
  ariRatePlansStatus: AsyncStatus
  ariSubmitStatus: AsyncStatus
  ariLastResponse: ARIUpdateRatesResponse | null
}

const initialState: LocalARIState = {
  rates: [],
  availability: [],
  status: 'idle',
  availabilityStatus: 'idle',
  error: null,
  ariRatePlans: [],
  ariRatePlansStatus: 'idle',
  ariSubmitStatus: 'idle',
  ariLastResponse: null,
}

export const fetchLocalARIRates = createAsyncThunk(
  'localAri/fetchRates',
  async (params: GetLocalARIRatesParams, thunkApi) => {
    try {
      return await api.getLocalARIRates(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch local ARI rates'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchLocalARIAvailability = createAsyncThunk(
  'localAri/fetchAvailability',
  async (params: GetLocalARIAvailabilityParams, thunkApi) => {
    try {
      return await api.getLocalARIAvailability(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch local ARI availability'
      return thunkApi.rejectWithValue(message)
    }
  }
)
export const saveLocalARIRates = createAsyncThunk(
  'localAri/saveRates',
  async (payload: CreateLocalARIRatePayload, thunkApi) => {
    try {
      return await api.saveLocalARIRates(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to save local ARI rates'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const saveLocalARIAvailability = createAsyncThunk(
  'localAri/saveAvailability',
  async (payload: CreateLocalARIAvailabilityPayload, thunkApi) => {
    try {
      return await api.saveLocalARIAvailability(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to save local ARI availability'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateLocalARISingleDayRate = createAsyncThunk(
  'localAri/updateSingleDayRate',
  async (payload: UpdateLocalARISingleDayRatePayload, thunkApi) => {
    try {
      return await api.updateLocalARISingleDayRate(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update local ARI single day rate'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchARIRatePlans = createAsyncThunk(
  'localAri/fetchARIRatePlans',
  async (_, thunkApi) => {
    try {
      return await api.getARIRatePlans(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch OTA rate plans'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const submitARIUpdateRates = createAsyncThunk(
  'localAri/submitARIUpdateRates',
  async (payload: ARIUpdateRatesPayload, thunkApi) => {
    try {
      return await api.updateARIRates(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to submit OTA rate update'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const localAriSlice = createSlice({
  name: 'localAri',
  initialState,
  reducers: {
    clearLocalARIError(state) {
      state.error = null
    },
    clearLocalARIRates(state) {
      state.rates = []
      state.status = 'idle'
    },
    clearLocalARIAvailability(state) {
      state.availability = []
      state.availabilityStatus = 'idle'
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocalARIRates.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchLocalARIRates.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.rates = action.payload
      })
      .addCase(fetchLocalARIRates.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })

      .addCase(fetchLocalARIAvailability.pending, (state) => {
        state.availabilityStatus = 'loading'
        state.error = null
      })
      .addCase(fetchLocalARIAvailability.fulfilled, (state, action) => {
        state.availabilityStatus = 'succeeded'
        state.availability = action.payload
      })
      .addCase(fetchLocalARIAvailability.rejected, (state, action) => {
        state.availabilityStatus = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })

      .addCase(saveLocalARIRates.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(saveLocalARIRates.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(saveLocalARIRates.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })

      .addCase(saveLocalARIAvailability.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(saveLocalARIAvailability.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(saveLocalARIAvailability.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })

      .addCase(updateLocalARISingleDayRate.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateLocalARISingleDayRate.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(updateLocalARISingleDayRate.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })

      // fetchARIRatePlans
      .addCase(fetchARIRatePlans.pending, (state) => {
        state.ariRatePlansStatus = 'loading'
        state.error = null
      })
      .addCase(fetchARIRatePlans.fulfilled, (state, action) => {
        state.ariRatePlansStatus = 'succeeded'
        state.ariRatePlans = action.payload
      })
      .addCase(fetchARIRatePlans.rejected, (state, action) => {
        state.ariRatePlansStatus = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })

      // submitARIUpdateRates
      .addCase(submitARIUpdateRates.pending, (state) => {
        state.ariSubmitStatus = 'loading'
        state.error = null
      })
      .addCase(submitARIUpdateRates.fulfilled, (state, action) => {
        state.ariSubmitStatus = 'succeeded'
        state.ariLastResponse = action.payload
      })
      .addCase(submitARIUpdateRates.rejected, (state, action) => {
        state.ariSubmitStatus = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })
  },
})

export const { clearLocalARIError, clearLocalARIRates, clearLocalARIAvailability } = localAriSlice.actions
export const localAriReducer = localAriSlice.reducer
export default localAriSlice.reducer

