import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  LaundryIssueReadDto,
  LaundryIssueCreateDto,
  LaundryIssueUpdateDto,
  LaundryIssuesParams,
} from '../../../models/Laundrymodels/LaundryIssue'
import * as api from '../../../shared/Laundryshared/api/laundryIssuesApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

const PAGE_SIZE = 10

type LaundryIssuesState = {
  items: LaundryIssueReadDto[]
  totalCount: number
  status: AsyncStatus
  error?: string
  params: LaundryIssuesParams
}

const initialState: LaundryIssuesState = {
  items: [],
  totalCount: 0,
  status: 'idle',
  error: undefined,
  params: { PageNumber: 1, PageSize: PAGE_SIZE },
}

export const fetchLaundryIssues = createAsyncThunk(
  'laundryIssues/fetchAll',
  async (params: LaundryIssuesParams | undefined, thunkApi) => {
    try {
      return await api.getLaundryIssues(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load issues'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createLaundryIssue = createAsyncThunk(
  'laundryIssues/create',
  async (payload: LaundryIssueCreateDto, thunkApi) => {
    try {
      return await api.createLaundryIssue(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create issue'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateLaundryIssue = createAsyncThunk(
  'laundryIssues/update',
  async ({ id, payload }: { id: number; payload: LaundryIssueUpdateDto }, thunkApi) => {
    try {
      return await api.updateLaundryIssue(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update issue'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const deleteLaundryIssue = createAsyncThunk(
  'laundryIssues/delete',
  async (id: number, thunkApi) => {
    try {
      await api.deleteLaundryIssue(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete issue'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const laundryIssuesSlice = createSlice({
  name: 'laundryIssues',
  initialState,
  reducers: {
    setIssuesPage(state, action: PayloadAction<number>) {
      state.params.PageNumber = action.payload
    },
    setIssuesItemFilter(state, action: PayloadAction<number | undefined>) {
      state.params.ItemId = action.payload
      state.params.PageNumber = 1
    },
    setIssuesDateFilter(state, action: PayloadAction<string | undefined>) {
      state.params.Date = action.payload
      state.params.PageNumber = 1
    },
    clearIssuesError(state) {
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchLaundryIssues.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchLaundryIssues.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchLaundryIssues.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      // create
      .addCase(createLaundryIssue.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createLaundryIssue.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createLaundryIssue.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      // update
      .addCase(updateLaundryIssue.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateLaundryIssue.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(updateLaundryIssue.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      // delete
      .addCase(deleteLaundryIssue.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteLaundryIssue.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((i) => i.id !== action.payload)
        state.totalCount -= 1
      })
      .addCase(deleteLaundryIssue.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const {
  setIssuesPage,
  setIssuesItemFilter,
  setIssuesDateFilter,
  clearIssuesError,
} = laundryIssuesSlice.actions

export const laundryIssuesReducer = laundryIssuesSlice.reducer
