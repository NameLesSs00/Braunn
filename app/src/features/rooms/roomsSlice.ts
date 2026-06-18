import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { Room, RoomAvailability } from '../../models/Room'
import * as api from '../../shared/apis/roomsApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type RoomsState = {
  items: Room[]
  availability: RoomAvailability[]
  status: AsyncStatus
  availabilityStatus: AsyncStatus
  error?: string
}

const initialState: RoomsState = {
  items: [],
  availability: [],
  status: 'idle',
  availabilityStatus: 'idle',
  error: undefined,
}

export const fetchRooms = createAsyncThunk('rooms/fetchAll', async (_, thunkApi) => {
  try {
    return await api.getRooms(thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load rooms'
    return thunkApi.rejectWithValue(message)
  }
})

export const fetchRoomsAvailability = createAsyncThunk(
  'rooms/fetchAvailability',
  async (params: api.GetRoomsAvailabilityParams, thunkApi) => {
    try {
      return await api.getRoomsAvailability(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load availability'
      return thunkApi.rejectWithValue(message)
    }
  },
)

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    clearRoomsError(state) {
      state.error = undefined
    },
    setRooms(state, action: PayloadAction<Room[]>) {
      state.items = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      // fetchRoomsAvailability
      .addCase(fetchRoomsAvailability.pending, (state) => {
        state.availabilityStatus = 'loading'
      })
      .addCase(fetchRoomsAvailability.fulfilled, (state, action) => {
        state.availabilityStatus = 'succeeded'
        state.availability = action.payload
      })
      .addCase(fetchRoomsAvailability.rejected, (state, action) => {
        state.availabilityStatus = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearRoomsError, setRooms } = roomsSlice.actions

export const roomsReducer = roomsSlice.reducer
