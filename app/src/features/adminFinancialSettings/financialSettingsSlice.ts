import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { FinancialDiscount, FinancialService } from '../../models/FinancialSettings'
import * as api from '../../shared/apis/AdminFinancialSettings'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface FinancialSettingsState {
  services: FinancialService[]
  discounts: FinancialDiscount[]
  status: AsyncStatus
  error: string | null
}

const initialState: FinancialSettingsState = {
  services: [],
  discounts: [],
  status: 'idle',
  error: null,
}

export const fetchFinancialServices = createAsyncThunk(
  'financialSettings/fetchServices',
  async (_, { signal, rejectWithValue }) => {
    try {
      return await api.getFinancialServices(signal)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch financial services'
      return rejectWithValue(message)
    }
  },
)

export const fetchFinancialDiscounts = createAsyncThunk(
  'financialSettings/fetchDiscounts',
  async (_, { signal, rejectWithValue }) => {
    try {
      return await api.getFinancialDiscounts(signal)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch financial discounts'
      return rejectWithValue(message)
    }
  },
)

export const createFinancialDiscount = createAsyncThunk(
  'financialSettings/createDiscount',
  async (data: { name: string; value: number; type: 'FixedAmount' | 'Percentage' }, { rejectWithValue }) => {
    try {
      return await api.createFinancialDiscount(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create financial discount'
      return rejectWithValue(message)
    }
  },
)

export const createFinancialService = createAsyncThunk(
  'financialSettings/createService',
  async (data: { name: string; price: number }, { rejectWithValue }) => {
    try {
      return await api.createFinancialService(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create financial service'
      return rejectWithValue(message)
    }
  },
)

const financialSettingsSlice = createSlice({
  name: 'financialSettings',
  initialState,
  reducers: {
    clearFinancialSettingsError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinancialServices.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchFinancialServices.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.services = action.payload
      })
      .addCase(fetchFinancialServices.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || 'Something went wrong'
      })
      .addCase(fetchFinancialDiscounts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchFinancialDiscounts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.discounts = action.payload
      })
      .addCase(fetchFinancialDiscounts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || 'Something went wrong'
      })
      .addCase(createFinancialDiscount.fulfilled, (state, action) => {
        state.discounts.push(action.payload)
      })
      .addCase(createFinancialService.fulfilled, (state, action) => {
        state.services.push(action.payload)
      })
  },
})

export const { clearFinancialSettingsError } = financialSettingsSlice.actions
export const financialSettingsReducer = financialSettingsSlice.reducer
