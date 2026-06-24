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
  },
})

export const { clearRatePlansError, clearRatePlans } = ratePlansSlice.actions
export const ratePlansReducer = ratePlansSlice.reducer
export default ratePlansSlice.reducer
