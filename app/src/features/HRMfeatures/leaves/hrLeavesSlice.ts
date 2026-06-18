import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type {
  LeaveReadDto,
  LeaveCreateDto,
  LeaveUpdateStatusDto,
  LeavesQueryParams,
  PaginatedLeaves,
} from '../../../models/HRMmodels/Leave'
import * as api from '../../../shared/HRMshared/api/leavesApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type HrLeavesState = {
  leaves: LeaveReadDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  selectedLeave: LeaveReadDto | null
  status: AsyncStatus
  error?: string
}

const initialState: HrLeavesState = {
  leaves: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  selectedLeave: null,
  status: 'idle',
  error: undefined,
}

export const fetchHrLeaves = createAsyncThunk(
  'hrLeaves/fetchAll',
  async (params: LeavesQueryParams | undefined, thunkApi) => {
    try {
      return await api.getLeaves(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load leaves'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createHrLeave = createAsyncThunk(
  'hrLeaves/create',
  async (payload: LeaveCreateDto, thunkApi) => {
    try {
      return await api.createLeave(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create leave'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateHrLeaveStatus = createAsyncThunk(
  'hrLeaves/updateStatus',
  async ({ id, payload }: { id: string; payload: LeaveUpdateStatusDto }, thunkApi) => {
    try {
      await api.updateLeaveStatus(id, payload, thunkApi.signal)
      return { id, status: payload.status }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update leave status'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const deleteHrLeave = createAsyncThunk(
  'hrLeaves/delete',
  async (id: string, thunkApi) => {
    try {
      await api.deleteLeave(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete leave'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const hrLeavesSlice = createSlice({
  name: 'hrLeaves',
  initialState,
  reducers: {
    clearHrLeavesError(state) {
      state.error = undefined
    },
    clearSelectedHrLeave(state) {
      state.selectedLeave = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchHrLeaves.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchHrLeaves.fulfilled, (state, action: PayloadAction<PaginatedLeaves>) => {
        state.status = 'succeeded'
        state.leaves = action.payload.items
        state.totalCount = action.payload.totalCount
        state.pageNumber = action.payload.pageNumber
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchHrLeaves.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createHrLeave.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createHrLeave.fulfilled, (state, action: PayloadAction<LeaveReadDto>) => {
        state.status = 'succeeded'
        state.leaves.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createHrLeave.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // updateStatus
      .addCase(updateHrLeaveStatus.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateHrLeaveStatus.fulfilled, (state, action: PayloadAction<{ id: string; status: import('../../../models/HRMmodels/Leave').LeaveStatus }>) => {
        state.status = 'succeeded'
        const index = state.leaves.findIndex((l) => l.id === action.payload.id)
        if (index !== -1) state.leaves[index].status = action.payload.status
        if (state.selectedLeave?.id === action.payload.id) state.selectedLeave.status = action.payload.status
      })
      .addCase(updateHrLeaveStatus.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteHrLeave.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteHrLeave.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded'
        state.leaves = state.leaves.filter((l) => l.id !== action.payload)
        state.totalCount = Math.max(0, state.totalCount - 1)
        if (state.selectedLeave?.id === action.payload) state.selectedLeave = null
      })
      .addCase(deleteHrLeave.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearHrLeavesError, clearSelectedHrLeave } = hrLeavesSlice.actions

export const hrLeavesReducer = hrLeavesSlice.reducer
