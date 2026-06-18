import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  HkmIssueReadDto,
  HkmIssueCreateDto,
  HkmIssueUpdateDto,
  HkmIssuesParams,
} from '../../../models/HKmodels/HkmIssue'
import * as api from '../../../shared/HKshared/api/hkmIssuesApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

const PAGE_SIZE = 10

type HkmIssuesState = {
  items: HkmIssueReadDto[]
  totalCount: number
  status: AsyncStatus
  error?: string
  params: HkmIssuesParams
}

const initialState: HkmIssuesState = {
  items: [],
  totalCount: 0,
  status: 'idle',
  error: undefined,
  params: { PageNumber: 1, PageSize: PAGE_SIZE },
}

export const fetchHkmIssues = createAsyncThunk(
  'hkmIssues/fetchAll',
  async (params: HkmIssuesParams | undefined, thunkApi) => {
    try {
      return await api.getHkmIssues(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load issues'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createHkmIssue = createAsyncThunk(
  'hkmIssues/create',
  async (payload: HkmIssueCreateDto, thunkApi) => {
    try {
      return await api.createHkmIssue(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create issue'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateHkmIssue = createAsyncThunk(
  'hkmIssues/update',
  async ({ id, payload }: { id: number; payload: HkmIssueUpdateDto }, thunkApi) => {
    try {
      return await api.updateHkmIssue(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update issue'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const deleteHkmIssue = createAsyncThunk(
  'hkmIssues/delete',
  async (id: number, thunkApi) => {
    try {
      await api.deleteHkmIssue(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete issue'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const hkmIssuesSlice = createSlice({
  name: 'hkmIssues',
  initialState,
  reducers: {
    setIssuesParams(state, action: PayloadAction<Partial<HkmIssuesParams>>) {
      state.params = { ...state.params, ...action.payload }
    },
    setIssuesPage(state, action: PayloadAction<number>) {
      state.params.PageNumber = action.payload
    },
    setIssuesItemFilter(state, action: PayloadAction<number | ''>) {
      state.params.ItemId = action.payload
      state.params.PageNumber = 1
    },
    setIssuesRoomFilter(state, action: PayloadAction<string | ''>) {
      state.params.RoomId = action.payload
      state.params.PageNumber = 1
    },
    clearIssuesError(state) {
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchHkmIssues.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchHkmIssues.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchHkmIssues.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createHkmIssue.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createHkmIssue.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createHkmIssue.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateHkmIssue.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateHkmIssue.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(updateHkmIssue.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteHkmIssue.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteHkmIssue.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((i) => i.id !== action.payload)
        state.totalCount -= 1
      })
      .addCase(deleteHkmIssue.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const {
  setIssuesParams,
  setIssuesPage,
  setIssuesItemFilter,
  setIssuesRoomFilter,
  clearIssuesError,
} = hkmIssuesSlice.actions

export const hkmIssuesReducer = hkmIssuesSlice.reducer
