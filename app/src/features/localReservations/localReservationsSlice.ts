import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type {
  LocalReservation,
  CreateLocalReservationRequest,
  UpdateLocalReservationRequest,
  UnifiedReservationsQueryParams,
} from '../../models/LocalReservation'
import * as api from '../../shared/apis/LocalReservations'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type LocalReservationsState = {
  items: LocalReservation[]
  selected?: LocalReservation
  totalCount: number
  status: AsyncStatus
  error?: string
}

const initialState: LocalReservationsState = {
  items: [],
  selected: undefined,
  totalCount: 0,
  status: 'idle',
  error: undefined,
}


export const createLocalReservation = createAsyncThunk(
  'localReservations/create',
  async (payload: CreateLocalReservationRequest, thunkApi) => {
    try {
      return await api.createLocalReservation(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create local reservation'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchLocalReservationById = createAsyncThunk(
  'localReservations/fetchById',
  async (id: string, thunkApi) => {
    try {
      return await api.getLocalReservationById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch local reservation'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const editLocalReservation = createAsyncThunk(
  'localReservations/edit',
  async ({ id, payload }: { id: string; payload: UpdateLocalReservationRequest }, thunkApi) => {
    try {
      const updated = await api.updateLocalReservation(id, payload, thunkApi.signal)
      return { id, updated }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update local reservation'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const removeLocalReservation = createAsyncThunk(
  'localReservations/remove',
  async (
    { id, cancellationReason, cancellationFee }: { id: string; cancellationReason?: string; cancellationFee?: number },
    thunkApi
  ) => {
    try {
      await api.deleteLocalReservation(id, { cancellationReason, cancellationFee }, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete local reservation'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchUnifiedLocalReservations = createAsyncThunk(
  'localReservations/fetchUnified',
  async (params: UnifiedReservationsQueryParams | undefined, thunkApi) => {
    try {
      return await api.getUnifiedLocalReservations(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch unified local reservations'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const localReservationsSlice = createSlice({
  name: 'localReservations',
  initialState,
  reducers: {
    clearLocalReservationsError(state) {
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createLocalReservation.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createLocalReservation.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
      })
      .addCase(createLocalReservation.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      .addCase(fetchLocalReservationById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchLocalReservationById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchLocalReservationById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      .addCase(editLocalReservation.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(editLocalReservation.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const { id, updated } = action.payload
        const idx = state.items.findIndex((x) => x.id === id)
        if (idx >= 0) state.items[idx] = updated
        if (state.selected?.id === id) state.selected = updated
      })
      .addCase(editLocalReservation.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      .addCase(removeLocalReservation.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(removeLocalReservation.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((x) => x.id !== action.payload)
        if (state.selected?.id === action.payload) state.selected = undefined
      })
      .addCase(removeLocalReservation.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      .addCase(fetchUnifiedLocalReservations.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchUnifiedLocalReservations.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchUnifiedLocalReservations.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearLocalReservationsError } = localReservationsSlice.actions
export const localReservationsReducer = localReservationsSlice.reducer
