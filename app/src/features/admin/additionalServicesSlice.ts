import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/AdditionalServices'
import type {
  AdditionalService,
  CreateAdditionalServiceRequest,
  UpdateAdditionalServiceRequest,
} from '../../models/AdditionalService'

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
      const created = await api.createAdditionalService(data)
      return created
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create additional service'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateAdditionalService = createAsyncThunk(
  'additionalServices/updateAdditionalService',
  async ({ id, data }: { id: string; data: UpdateAdditionalServiceRequest }, thunkApi) => {
    try {
      await api.updateAdditionalService(id, data)
      return { id, data }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update additional service'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const deleteAdditionalService = createAsyncThunk(
  'additionalServices/deleteAdditionalService',
  async (id: string, thunkApi) => {
    try {
      await api.deleteAdditionalService(id)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete additional service'
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
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch ────────────────────────────────────────────────────────────────
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

      // ── Create ───────────────────────────────────────────────────────────────
      .addCase(addAdditionalService.fulfilled, (state, action) => {
        state.items.push(action.payload as AdditionalService)
      })

      // ── Update ───────────────────────────────────────────────────────────────
      .addCase(updateAdditionalService.fulfilled, (state, action) => {
        const { id, data } = action.payload
        const idx = state.items.findIndex((s) => s.id === id)
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...data }
        }
      })

      // ── Delete ───────────────────────────────────────────────────────────────
      .addCase(deleteAdditionalService.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s.id !== action.payload)
      })
  },
})

export const { clearError } = additionalServicesSlice.actions
export const additionalServicesReducer = additionalServicesSlice.reducer
