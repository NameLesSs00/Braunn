import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/Ops'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type OpsState = {
  status: AsyncStatus
  error?: string
  lastResponse?: any
}

const initialState: OpsState = {
  status: 'idle',
  error: undefined,
  lastResponse: undefined,
}

export const assignRoom = createAsyncThunk(
  'ops/assignRoom',
  async (params: api.AssignRoomParams, thunkApi) => {
    try {
      return await api.assignRoom(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to assign room'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const earlyCheckOut = createAsyncThunk(
  'ops/earlyCheckOut',
  async (params: api.EarlyCheckOutParams, thunkApi) => {
    try {
      return await api.earlyCheckOut(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to early check out'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const opsSlice = createSlice({
  name: 'ops',
  initialState,
  reducers: {
    clearOpsError(state) {
      state.error = undefined
    },
    resetOpsStatus(state) {
      state.status = 'idle'
      state.lastResponse = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(assignRoom.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(assignRoom.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.lastResponse = action.payload
      })
      .addCase(assignRoom.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      .addCase(earlyCheckOut.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(earlyCheckOut.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.lastResponse = action.payload
      })
      .addCase(earlyCheckOut.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearOpsError, resetOpsStatus } = opsSlice.actions
export const opsReducer = opsSlice.reducer
