import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import type { GetRoomPlanParams, RoomPlanResponse } from '../../models/RoomPlan'
import { getRoomPlan } from '../../shared/apis/RoomPlan'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface RoomPlanState {
  data: RoomPlanResponse | null
  status: AsyncStatus
  error: string | null
}

const initialState: RoomPlanState = {
  data: null,
  status: 'idle',
  error: null,
}

export const fetchRoomPlan = createAsyncThunk(
  'roomPlan/fetch',
  async (params: GetRoomPlanParams, thunkApi) => {
    try {
      return await getRoomPlan(params, thunkApi.signal)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load the room plan'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const roomPlanSlice = createSlice({
  name: 'roomPlan',
  initialState,
  reducers: {
    clearRoomPlan(state) {
      state.data = null
      state.status = 'idle'
      state.error = null
    },
    clearRoomPlanError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoomPlan.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchRoomPlan.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload
      })
      .addCase(fetchRoomPlan.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.status = 'failed'
        state.error = (action.payload as string | null) ?? action.error.message ?? 'Unknown error'
      })
  },
})

export const { clearRoomPlan, clearRoomPlanError } = roomPlanSlice.actions
export const roomPlanReducer = roomPlanSlice.reducer
