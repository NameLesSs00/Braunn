import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { PerPersonPricing, CreatePerPersonPricingRequest, UpdatePerPersonPricingRequest } from '../../shared/apis/PerPersonPricing'
import * as api from '../../shared/apis/PerPersonPricing'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface PerPersonPricingState {
  items: PerPersonPricing[]
  selected?: PerPersonPricing
  status: AsyncStatus
  error?: string
}

const initialState: PerPersonPricingState = {
  items: [],
  selected: undefined,
  status: 'idle',
  error: undefined,
}

export const fetchPerPersonPricing = createAsyncThunk(
  'perPersonPricing/fetchPerPersonPricing',
  async (_, thunkApi) => {
    try {
      return await api.getPerPersonPricing(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch per person pricing'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const addPerPersonPricing = createAsyncThunk(
  'perPersonPricing/addPerPersonPricing',
  async (payload: CreatePerPersonPricingRequest, thunkApi) => {
    try {
      return await api.createPerPersonPricing(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create per person pricing'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchPerPersonPricingById = createAsyncThunk(
  'perPersonPricing/fetchById',
  async (id: string, thunkApi) => {
    try {
      return await api.getPerPersonPricingById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch per person pricing details'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const editPerPersonPricing = createAsyncThunk(
  'perPersonPricing/editPerPersonPricing',
  async ({ id, payload }: { id: string; payload: UpdatePerPersonPricingRequest }, thunkApi) => {
    try {
      await api.updatePerPersonPricing(id, payload, thunkApi.signal)
      return { id, payload }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update per person pricing'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const removePerPersonPricing = createAsyncThunk(
  'perPersonPricing/removePerPersonPricing',
  async (id: string, thunkApi) => {
    try {
      await api.deletePerPersonPricing(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete per person pricing'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const perPersonPricingSlice = createSlice({
  name: 'perPersonPricing',
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined
    },
    setSelectedPricing(state, action: PayloadAction<PerPersonPricing | undefined>) {
      state.selected = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPerPersonPricing.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchPerPersonPricing.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchPerPersonPricing.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(addPerPersonPricing.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(addPerPersonPricing.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(fetchPerPersonPricingById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchPerPersonPricingById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchPerPersonPricingById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(editPerPersonPricing.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(editPerPersonPricing.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const { id, payload } = action.payload
        const index = state.items.findIndex((item) => item.id === id)
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...payload }
        }
        if (state.selected?.id === id) {
          state.selected = { ...state.selected, ...payload }
        }
      })
      .addCase(editPerPersonPricing.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(removePerPersonPricing.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(removePerPersonPricing.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const id = action.payload
        state.items = state.items.filter((item) => item.id !== id)
        if (state.selected?.id === id) {
          state.selected = undefined
        }
      })
      .addCase(removePerPersonPricing.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearError, setSelectedPricing } = perPersonPricingSlice.actions
export default perPersonPricingSlice.reducer
