import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  HkmReceptionAssignmentReadDto,
  HkmReceptionAssignmentCreateDto,
  HkmReceptionAssignmentUpdateDto,
  HkmReceptionAssignmentsParams,
} from '../../../models/HKmodels/HkmReceptionAssignment'
import * as api from '../../../shared/HKshared/api/hkmReceptionAssignmentsApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

const PAGE_SIZE = 10

type HkmReceptionAssignmentsState = {
  items: HkmReceptionAssignmentReadDto[]
  totalCount: number
  status: AsyncStatus
  error?: string
  params: HkmReceptionAssignmentsParams
  selectedItem: HkmReceptionAssignmentReadDto | null
}

const initialState: HkmReceptionAssignmentsState = {
  items: [],
  totalCount: 0,
  status: 'idle',
  error: undefined,
  params: { PageNumber: 1, PageSize: PAGE_SIZE },
  selectedItem: null,
}

export const fetchHkmReceptionAssignments = createAsyncThunk(
  'hkmReceptionAssignments/fetchAll',
  async (params: HkmReceptionAssignmentsParams | undefined, thunkApi) => {
    try {
      return await api.getHkmReceptionAssignments(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load reception assignments'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createHkmReceptionAssignment = createAsyncThunk(
  'hkmReceptionAssignments/create',
  async (payload: HkmReceptionAssignmentCreateDto, thunkApi) => {
    try {
      return await api.createHkmReceptionAssignment(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create reception assignment'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchHkmReceptionAssignmentById = createAsyncThunk(
  'hkmReceptionAssignments/fetchById',
  async (id: number, thunkApi) => {
    try {
      return await api.getHkmReceptionAssignmentById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load reception assignment'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateHkmReceptionAssignment = createAsyncThunk(
  'hkmReceptionAssignments/update',
  async ({ id, payload }: { id: number; payload: HkmReceptionAssignmentUpdateDto }, thunkApi) => {
    try {
      return await api.updateHkmReceptionAssignment(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update reception assignment'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const deleteHkmReceptionAssignment = createAsyncThunk(
  'hkmReceptionAssignments/delete',
  async (id: number, thunkApi) => {
    try {
      await api.deleteHkmReceptionAssignment(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete reception assignment'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const setHkmReceptionAssignmentProgress = createAsyncThunk(
  'hkmReceptionAssignments/setProgress',
  async (id: number, thunkApi) => {
    try {
      return await api.setHkmReceptionAssignmentProgress(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to set assignment in progress'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const completeHkmReceptionAssignment = createAsyncThunk(
  'hkmReceptionAssignments/complete',
  async (id: number, thunkApi) => {
    try {
      return await api.completeHkmReceptionAssignment(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to complete reception assignment'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const hkmReceptionAssignmentsSlice = createSlice({
  name: 'hkmReceptionAssignments',
  initialState,
  reducers: {
    setAssignmentsParams(state, action: PayloadAction<Partial<HkmReceptionAssignmentsParams>>) {
      state.params = { ...state.params, ...action.payload }
    },
    setAssignmentsPage(state, action: PayloadAction<number>) {
      state.params.PageNumber = action.payload
    },
    setAssignmentsEmployeeFilter(state, action: PayloadAction<string>) {
      state.params.EmployeeId = action.payload
      state.params.PageNumber = 1
    },
    clearAssignmentsError(state) {
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchHkmReceptionAssignments.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchHkmReceptionAssignments.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchHkmReceptionAssignments.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createHkmReceptionAssignment.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createHkmReceptionAssignment.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createHkmReceptionAssignment.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchById
      .addCase(fetchHkmReceptionAssignmentById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchHkmReceptionAssignmentById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selectedItem = action.payload
      })
      .addCase(fetchHkmReceptionAssignmentById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateHkmReceptionAssignment.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateHkmReceptionAssignment.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
        if (state.selectedItem?.id === action.payload.id) state.selectedItem = action.payload
      })
      .addCase(updateHkmReceptionAssignment.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteHkmReceptionAssignment.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteHkmReceptionAssignment.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((i) => i.id !== action.payload)
        state.totalCount -= 1
      })
      .addCase(deleteHkmReceptionAssignment.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // setProgress
      .addCase(setHkmReceptionAssignmentProgress.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(setHkmReceptionAssignmentProgress.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
        if (state.selectedItem?.id === action.payload.id) state.selectedItem = action.payload
      })
      .addCase(setHkmReceptionAssignmentProgress.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // complete
      .addCase(completeHkmReceptionAssignment.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(completeHkmReceptionAssignment.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
        if (state.selectedItem?.id === action.payload.id) state.selectedItem = action.payload
      })
      .addCase(completeHkmReceptionAssignment.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const {
  setAssignmentsParams,
  setAssignmentsPage,
  setAssignmentsEmployeeFilter,
  clearAssignmentsError,
} = hkmReceptionAssignmentsSlice.actions

export const hkmReceptionAssignmentsReducer = hkmReceptionAssignmentsSlice.reducer
