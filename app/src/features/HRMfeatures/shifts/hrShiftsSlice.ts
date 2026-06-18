import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type {
  ShiftReadDto,
  ShiftCreateDto,
  ShiftUpdateDto,
  ShiftsQueryParams,
  PaginatedShifts,
} from '../../../models/HRMmodels/Shift'
import * as api from '../../../shared/HRMshared/api/shiftsApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type HrShiftsState = {
  shifts: ShiftReadDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  selectedShift: ShiftReadDto | null
  status: AsyncStatus
  error?: string
}

const initialState: HrShiftsState = {
  shifts: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  selectedShift: null,
  status: 'idle',
  error: undefined,
}

export const fetchHrShifts = createAsyncThunk(
  'hrShifts/fetchAll',
  async (params: ShiftsQueryParams | undefined, thunkApi) => {
    try {
      return await api.getShifts(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load shifts'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createHrShift = createAsyncThunk(
  'hrShifts/create',
  async (payload: ShiftCreateDto, thunkApi) => {
    try {
      return await api.createShift(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create shift'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchHrShiftById = createAsyncThunk(
  'hrShifts/fetchById',
  async (id: string, thunkApi) => {
    try {
      return await api.getShiftById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load shift'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateHrShift = createAsyncThunk(
  'hrShifts/update',
  async ({ id, payload }: { id: string; payload: ShiftUpdateDto }, thunkApi) => {
    try {
      return await api.updateShift(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update shift'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const deleteHrShift = createAsyncThunk(
  'hrShifts/delete',
  async (id: string, thunkApi) => {
    try {
      await api.deleteShift(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete shift'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const hrShiftsSlice = createSlice({
  name: 'hrShifts',
  initialState,
  reducers: {
    clearHrShiftsError(state) {
      state.error = undefined
    },
    clearSelectedHrShift(state) {
      state.selectedShift = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchHrShifts.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchHrShifts.fulfilled, (state, action: PayloadAction<PaginatedShifts>) => {
        state.status = 'succeeded'
        state.shifts = action.payload.items
        state.totalCount = action.payload.totalCount
        state.pageNumber = action.payload.pageNumber
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchHrShifts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createHrShift.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createHrShift.fulfilled, (state, action: PayloadAction<ShiftReadDto>) => {
        state.status = 'succeeded'
        state.shifts.push(action.payload)
        state.totalCount += 1
      })
      .addCase(createHrShift.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchById
      .addCase(fetchHrShiftById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchHrShiftById.fulfilled, (state, action: PayloadAction<ShiftReadDto>) => {
        state.status = 'succeeded'
        state.selectedShift = action.payload
      })
      .addCase(fetchHrShiftById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateHrShift.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateHrShift.fulfilled, (state, action: PayloadAction<ShiftReadDto>) => {
        state.status = 'succeeded'
        const index = state.shifts.findIndex((s) => s.id === action.payload.id)
        if (index !== -1) Object.assign(state.shifts[index], action.payload)
        if (state.selectedShift?.id === action.payload.id) state.selectedShift = action.payload
      })
      .addCase(updateHrShift.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteHrShift.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteHrShift.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded'
        state.shifts = state.shifts.filter((s) => s.id !== action.payload)
        state.totalCount = Math.max(0, state.totalCount - 1)
        if (state.selectedShift?.id === action.payload) state.selectedShift = null
      })
      .addCase(deleteHrShift.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearHrShiftsError, clearSelectedHrShift } = hrShiftsSlice.actions

export const hrShiftsReducer = hrShiftsSlice.reducer
