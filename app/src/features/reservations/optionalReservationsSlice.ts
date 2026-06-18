import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/OptionalReservation'
import type { OptionalReservation, CreateOptionalReservationRequest } from '../../models/OptionalReservation'

interface OptionalReservationsState {
  items: OptionalReservation[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error?: string
}

const initialState: OptionalReservationsState = {
  items: [],
  status: 'idle',
  error: undefined,
}

export const fetchOptionalReservations = createAsyncThunk(
  'optionalReservations/fetchOptionalReservations',
  async (_, thunkApi) => {
    try {
      return await api.getOptionalReservations(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch optional reservations'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createOptionalReservation = createAsyncThunk(
  'optionalReservations/createOptionalReservation',
  async (data: CreateOptionalReservationRequest, thunkApi) => {
    try {
      await api.createOptionalReservation(data)
      return await api.getOptionalReservations()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create optional reservation'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const confirmOptionalReservation = createAsyncThunk(
  'optionalReservations/confirmOptionalReservation',
  async (id: string, thunkApi) => {
    try {
      await api.confirmOptionalReservation(id)
      return await api.getOptionalReservations()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to confirm optional reservation'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const optionalReservationsSlice = createSlice({
  name: 'optionalReservations',
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOptionalReservations.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchOptionalReservations.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchOptionalReservations.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      .addMatcher(
        (action) => [createOptionalReservation.fulfilled, confirmOptionalReservation.fulfilled].includes(action.type),
        (state, action) => {
          state.status = 'succeeded'
          state.items = action.payload as OptionalReservation[]
        }
      )
  },
})

export const { clearError } = optionalReservationsSlice.actions
export const optionalReservationsReducer = optionalReservationsSlice.reducer
