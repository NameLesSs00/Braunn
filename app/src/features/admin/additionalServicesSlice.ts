import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/AdditionalServices'
import type { AdditionalService, CreateAdditionalServiceRequest } from '../../models/AdditionalService'

interface AdditionalServicesState {
  items: AdditionalService[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error?: string
}

const initialState: AdditionalServicesState = {
  items: [],
  status: 'idle',
  error: undefined,
}

export const fetchAdditionalServices = createAsyncThunk(
  'additionalServices/fetchAdditionalServices',
  async (_, thunkApi) => {
    try {
      return await api.getAdditionalServices(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch additional services'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const addAdditionalService = createAsyncThunk(
  'additionalServices/addAdditionalService',
  async (data: CreateAdditionalServiceRequest, thunkApi) => {
    try {
      await api.createAdditionalService(data)
      return await api.getAdditionalServices()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create additional service'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const additionalServicesSlice = createSlice({
  name: 'additionalServices',
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdditionalServices.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchAdditionalServices.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchAdditionalServices.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      .addCase(addAdditionalService.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload as AdditionalService[]
      })
  },
})

export const { clearError } = additionalServicesSlice.actions
export const additionalServicesReducer = additionalServicesSlice.reducer
