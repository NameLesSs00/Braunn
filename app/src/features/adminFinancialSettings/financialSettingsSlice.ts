import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { FinancialDiscount, FinancialService, CreateDiscountPayload, UpdateDiscountPayload } from '../../models/FinancialSettings'
import * as api from '../../shared/apis/AdminFinancialSettings'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface FinancialSettingsState {
  services: FinancialService[]
  discounts: FinancialDiscount[]
  status: AsyncStatus
  discountStatus: AsyncStatus
  error: string | null
  discountError: string | null
}

const initialState: FinancialSettingsState = {
  services: [],
  discounts: [],
  status: 'idle',
  discountStatus: 'idle',
  error: null,
  discountError: null,
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
  async (data: CreateDiscountPayload, { rejectWithValue }) => {
    try {
      return await api.createFinancialDiscount(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create financial discount'
      return rejectWithValue(message)
    }
  },
)

export const updateFinancialDiscount = createAsyncThunk(
  'financialSettings/updateDiscount',
  async ({ id, data }: { id: string; data: UpdateDiscountPayload }, { rejectWithValue }) => {
    try {
      await api.updateFinancialDiscount(id, data)
      return { id, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update financial discount'
      return rejectWithValue(message)
    }
  },
)

export const toggleFinancialDiscount = createAsyncThunk(
  'financialSettings/toggleDiscount',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.toggleFinancialDiscount(id)
      return id
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle financial discount'
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
    clearDiscountError(state) {
      state.discountError = null
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
        state.discountStatus = 'loading'
        state.discountError = null
      })
      .addCase(fetchFinancialDiscounts.fulfilled, (state, action) => {
        state.discountStatus = 'succeeded'
        state.discounts = action.payload
      })
      .addCase(fetchFinancialDiscounts.rejected, (state, action) => {
        state.discountStatus = 'failed'
        state.discountError = (action.payload as string) || 'Something went wrong'
      })

      .addCase(createFinancialDiscount.fulfilled, (state) => {
        state.discountStatus = 'succeeded'
      })

      .addCase(updateFinancialDiscount.fulfilled, (state, action) => {
        const { id, data } = action.payload
        const idx = state.discounts.findIndex((d) => d.id === id)
        if (idx !== -1) {
          state.discounts[idx] = { ...state.discounts[idx], ...data }
        }
      })

      .addCase(toggleFinancialDiscount.fulfilled, (state, action) => {
        const id = action.payload
        const idx = state.discounts.findIndex((d) => d.id === id)
        if (idx !== -1) {
          state.discounts[idx].isActive = !state.discounts[idx].isActive
        }
      })

      .addCase(createFinancialService.fulfilled, (state, action) => {
        state.services.push(action.payload)
      })
  },
})

export const { clearFinancialSettingsError, clearDiscountError } = financialSettingsSlice.actions
export const financialSettingsReducer = financialSettingsSlice.reducer
