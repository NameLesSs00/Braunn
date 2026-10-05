import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import type { ChangeHousekeepingStatusRequest, GetHousekeepingRoomsParams, HousekeepingRoom } from '../../models/Housekeeping'
import type { Room } from '../../models/Room'
import * as api from '../../shared/apis/housekeepingApi'
import * as roomsApi from '../../shared/apis/roomsApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type HousekeepingState = {
  rooms: HousekeepingRoom[]
  pmsRooms: Room[]
  totalCount: number
  totalPages: number
  currentPage: number
  status: AsyncStatus
  error?: string
}

const initialState: HousekeepingState = {
  rooms: [],
  pmsRooms: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  status: 'idle',
  error: undefined,
}

export const fetchHousekeepingRooms = createAsyncThunk('housekeeping/fetchRooms', async (params: GetHousekeepingRoomsParams | undefined, thunkApi) => {
  try {
    return await api.getHousekeepingRooms(params, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load housekeeping rooms'
    return thunkApi.rejectWithValue(message)
  }
})

export const fetchAllRooms = createAsyncThunk('housekeeping/fetchAllRooms', async (params: { pageNumber?: number; pageSize?: number; search?: string; status?: string; roomType?: string } | void, thunkApi) => {
  try {
    const res = await roomsApi.getRooms(params || undefined, thunkApi.signal)
    return res
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load all rooms'
    return thunkApi.rejectWithValue(message)
  }
})

export const submitHousekeepingStatusChange = createAsyncThunk(
  'housekeeping/changeStatus',
  async (payload: ChangeHousekeepingStatusRequest, thunkApi) => {
    try {
      await api.changeHousekeepingStatus(payload, thunkApi.signal)
      return payload
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to change housekeeping status'
      return thunkApi.rejectWithValue(message)
    }
  },
)

const housekeepingSlice = createSlice({
  name: 'housekeeping',
  initialState,
  reducers: {
    clearHousekeepingError(state) {
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHousekeepingRooms.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchHousekeepingRooms.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.rooms = action.payload
      })
      .addCase(fetchHousekeepingRooms.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      .addCase(fetchAllRooms.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchAllRooms.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.pmsRooms = action.payload.items
        state.totalCount = action.payload.totalCount
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.pageNumber
      })
      .addCase(fetchAllRooms.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(submitHousekeepingStatusChange.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(submitHousekeepingStatusChange.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(submitHousekeepingStatusChange.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearHousekeepingError } = housekeepingSlice.actions

export const housekeepingReducer = housekeepingSlice.reducer
