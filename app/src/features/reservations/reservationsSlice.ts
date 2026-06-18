import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Reservation } from '../../models/Reservation'
import * as api from '../../shared/apis/reservationsApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type ReservationsState = {
  items: Reservation[]
  selected?: Reservation
  status: AsyncStatus
  checkInStatus: AsyncStatus
  error?: string
}

const initialState: ReservationsState = {
  items: [],
  selected: undefined,
  status: 'idle',
  checkInStatus: 'idle',
  error: undefined,
}

export const fetchReservations = createAsyncThunk('reservations/fetchAll', async (_, thunkApi) => {
  try {
    return await api.getReservations(thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load reservations'
    return thunkApi.rejectWithValue(message)
  }
})

export const fetchReservationById = createAsyncThunk('reservations/fetchById', async (id: string, thunkApi) => {
  try {
    return await api.getReservationById(id, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load reservation'
    return thunkApi.rejectWithValue(message)
  }
})

export const checkInReservation = createAsyncThunk(
  'reservations/checkIn',
  async ({ id, roomId }: { id: string; roomId: string }, thunkApi) => {
    try {
      await api.checkInReservation(id, roomId, thunkApi.signal)
      return await api.getReservationById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to check in reservation'
      return thunkApi.rejectWithValue(message)
    }
  },
)

export const addReservation = createAsyncThunk(
  'reservations/add',
  async (payload: any, thunkApi) => {
    try {
      return await api.createReservation(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create reservation'
      return thunkApi.rejectWithValue(message)
    }
  },
)


const reservationsSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    clearReservationsError(state) {
      state.error = undefined
    },
    setSelectedReservation(state, action: PayloadAction<Reservation | undefined>) {
      state.selected = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReservations.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(fetchReservationById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchReservationById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchReservationById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(checkInReservation.pending, (state) => {
        state.checkInStatus = 'loading'
        state.error = undefined
      })
      .addCase(checkInReservation.fulfilled, (state, action) => {
        state.checkInStatus = 'succeeded'
        state.selected = action.payload
        const idx = state.items.findIndex((r) => r.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
      })
      .addCase(checkInReservation.rejected, (state, action) => {
        state.checkInStatus = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(addReservation.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(addReservation.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
      })
      .addCase(addReservation.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

  },
})

export const { clearReservationsError, setSelectedReservation } = reservationsSlice.actions
export const reservationsReducer = reservationsSlice.reducer
