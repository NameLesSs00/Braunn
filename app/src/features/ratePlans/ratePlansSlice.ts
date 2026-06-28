import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/RatePlans'
import type { RatePlan, GetRatePlansParams } from '../../models/RatePlan'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface RatePlansState {
  items: RatePlan[]
  status: AsyncStatus
  error: string | null
}

const initialState: RatePlansState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchRatePlans = createAsyncThunk(
  'ratePlans/fetchRatePlans',
  async (params: GetRatePlansParams | undefined, thunkApi) => {
    try {
      return await api.getRatePlans(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch rate plans'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createRatePlan = createAsyncThunk(
  'ratePlans/createRatePlan',
  async (payload: Parameters<typeof api.createRatePlan>[0], thunkApi) => {
    try {
      return await api.createRatePlan(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create rate plan'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateRatePlan = createAsyncThunk(
  'ratePlans/updateRatePlan',
  async ({ id, payload }: { id: string; payload: Parameters<typeof api.updateRatePlan>[1] }, thunkApi) => {
    try {
      return await api.updateRatePlan(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update rate plan'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const activateRatePlan = createAsyncThunk(
  'ratePlans/activateRatePlan',
  async (id: string, thunkApi) => {
    try {
      return await api.activateRatePlan(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to activate rate plan'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const deactivateRatePlan = createAsyncThunk(
  'ratePlans/deactivateRatePlan',
  async (id: string, thunkApi) => {
    try {
      return await api.deactivateRatePlan(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to deactivate rate plan'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const ratePlansSlice = createSlice({
  name: 'ratePlans',
  initialState,
  reducers: {
    clearRatePlansError(state) {
      state.error = null
    },
    clearRatePlans(state) {
      state.items = []
      state.status = 'idle'
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRatePlans.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchRatePlans.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchRatePlans.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })
      .addCase(createRatePlan.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(updateRatePlan.fulfilled, (state, action) => {
        const index = state.items.findIndex(rp => rp.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(activateRatePlan.fulfilled, (state, action) => {
        const id = action.meta.arg
        const index = state.items.findIndex(rp => rp.id === id)
        if (index !== -1) {
          state.items[index].isActive = true
        }
      })
      .addCase(deactivateRatePlan.fulfilled, (state, action) => {
        const id = action.meta.arg
        const index = state.items.findIndex(rp => rp.id === id)
        if (index !== -1) {
          state.items[index].isActive = false
        }
      })
  },
})

export const { clearRatePlansError, clearRatePlans } = ratePlansSlice.actions
export const ratePlansReducer = ratePlansSlice.reducer
export default ratePlansSlice.reducer
