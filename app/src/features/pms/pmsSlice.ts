import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PmsReservation, PmsReservationDetails, PmsCheckInByDate, PmsInHouseReservation } from '../../models/PmsReservation'
import * as api from '../../shared/apis/PmsReservation'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface PmsState {
  reservations: PmsReservation[]
  reservationsTableRows: PmsReservation[]
  inHouseListRows: PmsReservation[]
  roomAllocationRows: PmsReservation[]
  checkInsByDate: PmsCheckInByDate[]
  inHouseReservations: PmsInHouseReservation[]
  selected: PmsReservationDetails | null
  status: AsyncStatus
  reservationsTableStatus: AsyncStatus
  inHouseListStatus: AsyncStatus
  roomAllocationStatus: AsyncStatus
  checkInsStatus: AsyncStatus
  inHouseStatus: AsyncStatus
  detailStatus: AsyncStatus
  checkInStatus: AsyncStatus
  error: string | null
}

const initialState: PmsState = {
  reservations: [],
  reservationsTableRows: [],
  inHouseListRows: [],
  roomAllocationRows: [],
  checkInsByDate: [],
  inHouseReservations: [],
  selected: null,
  status: 'idle',
  reservationsTableStatus: 'idle',
  inHouseListStatus: 'idle',
  roomAllocationStatus: 'idle',
  checkInsStatus: 'idle',
  inHouseStatus: 'idle',
  detailStatus: 'idle',
  checkInStatus: 'idle',
  error: null,
}

export const fetchPmsReservations = createAsyncThunk(
  'pms/fetchReservations',
  async (params: api.GetPmsReservationsParams, thunkApi) => {
    try {
      return await api.getPmsReservations(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load PMS reservations'
      return thunkApi.rejectWithValue(message)
    }
  }
)

function createPageReservationsThunk(type: string) {
  return createAsyncThunk(
    type,
    async (params: api.GetPmsReservationsParams, thunkApi) => {
      try {
        return await api.getPmsReservations(params, thunkApi.signal)
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to load PMS reservations'
        return thunkApi.rejectWithValue(message)
      }
    }
  )
}

export const fetchReservationsTable = createPageReservationsThunk('pms/fetchReservationsTable')
export const fetchInHouseListReservations = createPageReservationsThunk('pms/fetchInHouseListReservations')
export const fetchRoomAllocationReservations = createPageReservationsThunk('pms/fetchRoomAllocationReservations')

export const fetchPmsReservationById = createAsyncThunk(
  'pms/fetchReservationById',
  async (id: string, thunkApi) => {
    try {
      return await api.getPmsReservationById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load PMS reservation details'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const checkInPmsReservation = createAsyncThunk(
  'pms/checkIn',
  async (params: api.PmsCheckInParams, thunkApi) => {
    try {
      await api.checkInPmsReservation(params, thunkApi.signal)
      return await api.getPmsReservationById(params.reservationId, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to check in PMS reservation'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchPmsCheckInsByDate = createAsyncThunk(
  'pms/fetchCheckInsByDate',
  async (date: string, thunkApi) => {
    try {
      return await api.getPmsCheckInsByDate(date, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load check-ins by date'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchPmsInHouseReservations = createAsyncThunk(
  'pms/fetchInHouseReservations',
  async (_, thunkApi) => {
    try {
      return await api.getPmsInHouseReservations(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load in-house reservations'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const addPmsReservationService = createAsyncThunk(
  'pms/addService',
  async ({ id, params }: { id: string; params: api.AddPmsReservationServiceParams }, thunkApi) => {
    try {
      return await api.addPmsReservationService(id, params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to add service to reservation'
      return thunkApi.rejectWithValue(message)
    }
  }
)


const pmsSlice = createSlice({
  name: 'pms',
  initialState,
  reducers: {
    clearPmsError(state) {
      state.error = null
    },
    resetPmsStatus(state) {
      state.status = 'idle'
      state.detailStatus = 'idle'
      state.checkInStatus = 'idle'
    },
    setSelectedPmsReservation(state, action: PayloadAction<PmsReservationDetails | null>) {
      state.selected = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPmsReservations.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPmsReservations.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.reservations = action.payload
      })
      .addCase(fetchPmsReservations.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) || action.error.message || 'Unknown error'
      })

      .addCase(fetchReservationsTable.pending, (state) => {
        state.reservationsTableStatus = 'loading'
        state.reservationsTableRows = []
        state.error = null
      })
      .addCase(fetchReservationsTable.fulfilled, (state, action) => {
        state.reservationsTableStatus = 'succeeded'
        state.reservationsTableRows = action.payload
      })
      .addCase(fetchReservationsTable.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.reservationsTableStatus = 'failed'
        state.reservationsTableRows = []
        state.error = (action.payload as string) || action.error.message || 'Unknown error'
      })

      .addCase(fetchInHouseListReservations.pending, (state) => {
        state.inHouseListStatus = 'loading'
        state.inHouseListRows = []
        state.error = null
      })
      .addCase(fetchInHouseListReservations.fulfilled, (state, action) => {
        state.inHouseListStatus = 'succeeded'
        state.inHouseListRows = action.payload
      })
      .addCase(fetchInHouseListReservations.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.inHouseListStatus = 'failed'
        state.inHouseListRows = []
        state.error = (action.payload as string) || action.error.message || 'Unknown error'
      })

      .addCase(fetchRoomAllocationReservations.pending, (state) => {
        state.roomAllocationStatus = 'loading'
        state.roomAllocationRows = []
        state.error = null
      })
      .addCase(fetchRoomAllocationReservations.fulfilled, (state, action) => {
        state.roomAllocationStatus = 'succeeded'
        state.roomAllocationRows = action.payload
      })
      .addCase(fetchRoomAllocationReservations.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.roomAllocationStatus = 'failed'
        state.roomAllocationRows = []
        state.error = (action.payload as string) || action.error.message || 'Unknown error'
      })

      .addCase(fetchPmsReservationById.pending, (state) => {
        state.detailStatus = 'loading'
        state.error = null
      })
      .addCase(fetchPmsReservationById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchPmsReservationById.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.error = (action.payload as string) || action.error.message || 'Unknown error'
      })
 
      .addCase(checkInPmsReservation.pending, (state) => {
        state.checkInStatus = 'loading'
        state.error = null
      })
      .addCase(checkInPmsReservation.fulfilled, (state, action) => {
        state.checkInStatus = 'succeeded'
        state.selected = action.payload
        const idx = state.reservations.findIndex((r) => r.id === action.payload.id)
        if (idx >= 0) {
          state.reservations[idx] = action.payload
        }
      })
      .addCase(checkInPmsReservation.rejected, (state, action) => {
        state.checkInStatus = 'failed'
        state.error = (action.payload as string) || action.error.message || 'Unknown error'
      })

      .addCase(fetchPmsCheckInsByDate.pending, (state) => {
        state.checkInsStatus = 'loading'
        state.error = null
      })
      .addCase(fetchPmsCheckInsByDate.fulfilled, (state, action) => {
        state.checkInsStatus = 'succeeded'
        state.checkInsByDate = action.payload
      })
      .addCase(fetchPmsCheckInsByDate.rejected, (state, action) => {
        state.checkInsStatus = 'failed'
        state.error = (action.payload as string) || action.error.message || 'Unknown error'
      })

      .addCase(fetchPmsInHouseReservations.pending, (state) => {
        state.inHouseStatus = 'loading'
        state.error = null
      })
      .addCase(fetchPmsInHouseReservations.fulfilled, (state, action) => {
        state.inHouseStatus = 'succeeded'
        state.inHouseReservations = action.payload
      })
      .addCase(fetchPmsInHouseReservations.rejected, (state, action) => {
        state.inHouseStatus = 'failed'
        state.error = (action.payload as string) || action.error.message || 'Unknown error'
      })

      .addCase(addPmsReservationService.pending, (state) => {
        state.detailStatus = 'loading'
        state.error = null
      })
      .addCase(addPmsReservationService.fulfilled, (state) => {
        state.detailStatus = 'succeeded'
      })
      .addCase(addPmsReservationService.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.error = (action.payload as string) || action.error.message || 'Unknown error'
      })
  },
})

export const { clearPmsError, resetPmsStatus, setSelectedPmsReservation } = pmsSlice.actions
export const pmsReducer = pmsSlice.reducer
