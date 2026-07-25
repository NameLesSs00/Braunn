import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/maintenanceIssuesApi'
import { MaintenanceIssue, CreateMaintenanceIssueRequest, UpdateMaintenanceIssueRequest } from '../../models/MaintenanceIssue'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type MaintenanceIssuesState = {
  items: MaintenanceIssue[]
  totalCount: number
  fetchStatus: AsyncStatus
  createStatus: AsyncStatus
  updateStatus: AsyncStatus
  deleteStatus: AsyncStatus
  error?: string
}

const initialState: MaintenanceIssuesState = {
  items: [],
  totalCount: 0,
  fetchStatus: 'idle',
  createStatus: 'idle',
  updateStatus: 'idle',
  deleteStatus: 'idle',
}

export const fetchMaintenanceIssues = createAsyncThunk('maintenanceIssues/fetchAll', async (_, thunkApi) => {
  try {
    return await api.getMaintenanceIssues(undefined, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch issues'
    return thunkApi.rejectWithValue(message)
  }
})

export const addMaintenanceIssue = createAsyncThunk('maintenanceIssues/add', async (payload: CreateMaintenanceIssueRequest, thunkApi) => {
  try {
    const created = await api.createMaintenanceIssue(payload, thunkApi.signal)
    thunkApi.dispatch(fetchMaintenanceIssues())
    return created
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to add issue'
    return thunkApi.rejectWithValue(message)
  }
})

export const editMaintenanceIssue = createAsyncThunk('maintenanceIssues/edit', async ({ id, payload }: { id: number; payload: UpdateMaintenanceIssueRequest }, thunkApi) => {
  try {
    const updated = await api.updateMaintenanceIssue(id, payload, thunkApi.signal)
    thunkApi.dispatch(fetchMaintenanceIssues())
    return updated
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to edit issue'
    return thunkApi.rejectWithValue(message)
  }
})

export const removeMaintenanceIssue = createAsyncThunk('maintenanceIssues/remove', async (id: number, thunkApi) => {
  try {
    await api.deleteMaintenanceIssue(id, thunkApi.signal)
    thunkApi.dispatch(fetchMaintenanceIssues())
    return id
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to remove issue'
    return thunkApi.rejectWithValue(message)
  }
})

const maintenanceIssuesSlice = createSlice({
  name: 'maintenanceIssues',
  initialState,
  reducers: {
    clearIssueError(state) {
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchMaintenanceIssues.pending, (state) => { state.fetchStatus = 'loading'; state.error = undefined })
      .addCase(fetchMaintenanceIssues.fulfilled, (state, action) => { 
        state.fetchStatus = 'succeeded'
        state.items = action.payload.items 
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchMaintenanceIssues.rejected, (state, action) => { state.fetchStatus = 'failed'; state.error = action.payload as string })
      // create
      .addCase(addMaintenanceIssue.pending, (state) => { state.createStatus = 'loading'; state.error = undefined })
      .addCase(addMaintenanceIssue.fulfilled, (state) => { state.createStatus = 'succeeded' })
      .addCase(addMaintenanceIssue.rejected, (state, action) => { state.createStatus = 'failed'; state.error = action.payload as string })
      // update
      .addCase(editMaintenanceIssue.pending, (state) => { state.updateStatus = 'loading'; state.error = undefined })
      .addCase(editMaintenanceIssue.fulfilled, (state) => { state.updateStatus = 'succeeded' })
      .addCase(editMaintenanceIssue.rejected, (state, action) => { state.updateStatus = 'failed'; state.error = action.payload as string })
      // delete
      .addCase(removeMaintenanceIssue.pending, (state) => { state.deleteStatus = 'loading'; state.error = undefined })
      .addCase(removeMaintenanceIssue.fulfilled, (state) => { state.deleteStatus = 'succeeded' })
      .addCase(removeMaintenanceIssue.rejected, (state, action) => { state.deleteStatus = 'failed'; state.error = action.payload as string })
  },
})

export const { clearIssueError } = maintenanceIssuesSlice.actions
export const maintenanceIssuesReducer = maintenanceIssuesSlice.reducer
