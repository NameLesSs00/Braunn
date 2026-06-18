import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/RTIntegration'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type RTState = {
  status: AsyncStatus
  error?: string
  lastResponse?: any
}

const initialState: RTState = {
  status: 'idle',
  error: undefined,
  lastResponse: undefined,
}

export const syncRTReservation = createAsyncThunk(
  'rt/syncReservation',
  async (payload: any, thunkApi) => {
    try {
      return await api.postRTReservation(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to sync RT reservation'
      return thunkApi.rejectWithValue(message)
    }
  },
)

export const syncRTOps = createAsyncThunk(
  'rt/syncOps',
  async (payload: any, thunkApi) => {
    try {
      return await api.postRTOps(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to sync RT ops'
      return thunkApi.rejectWithValue(message)
    }
  },
)

const rtSlice = createSlice({
  name: 'rt',
  initialState,
  reducers: {
    clearRTError(state) {
      state.error = undefined
    },
    resetRTStatus(state) {
      state.status = 'idle'
      state.lastResponse = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncRTReservation.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(syncRTReservation.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.lastResponse = action.payload
      })
      .addCase(syncRTReservation.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      .addCase(syncRTOps.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(syncRTOps.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.lastResponse = action.payload
      })
      .addCase(syncRTOps.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearRTError, resetRTStatus } = rtSlice.actions
export const rtReducer = rtSlice.reducer
