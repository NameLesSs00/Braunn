import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RequestItem, RequestQueryParams, RequestListResponse, CreateRequestRequest, UpdateRequestRequest } from '../../models/Request'
import * as api from '../../shared/apis/Requests'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface RequestsState {
  items: RequestItem[]
  selected?: RequestItem
  totalCount: number
  status: AsyncStatus
  error?: string
}

const initialState: RequestsState = {
  items: [],
  selected: undefined,
  totalCount: 0,
  status: 'idle',
  error: undefined,
}

export const fetchRequests = createAsyncThunk(
  'requests/fetchRequests',
  async (params: RequestQueryParams | undefined, thunkApi) => {
    try {
      return await api.getRequests(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch requests'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchRequestById = createAsyncThunk(
  'requests/fetchById',
  async (id: string, thunkApi) => {
    try {
      return await api.getRequestById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch request details'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const addRequest = createAsyncThunk(
  'requests/addRequest',
  async (payload: CreateRequestRequest, thunkApi) => {
    try {
      return await api.createRequest(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create request'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const editRequest = createAsyncThunk(
  'requests/editRequest',
  async ({ id, payload }: { id: string; payload: UpdateRequestRequest }, thunkApi) => {
    try {
      await api.updateRequest(id, payload, thunkApi.signal)
      return { id, payload }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update request'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const removeRequest = createAsyncThunk(
  'requests/removeRequest',
  async (id: string, thunkApi) => {
    try {
      await api.deleteRequest(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete request'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const setRequestPending = createAsyncThunk(
  'requests/setRequestPending',
  async (id: string, thunkApi) => {
    try {
      await api.setRequestPending(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to set request to pending'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const setRequestProgress = createAsyncThunk(
  'requests/setRequestProgress',
  async (id: string, thunkApi) => {
    try {
      await api.setRequestProgress(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to set request to progress'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const setRequestSuccess = createAsyncThunk(
  'requests/setRequestSuccess',
  async (id: string, thunkApi) => {
    try {
      await api.setRequestSuccess(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to set request to success'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearRequestsError(state) {
      state.error = undefined
    },
    setSelectedRequest(state, action: PayloadAction<RequestItem | undefined>) {
      state.selected = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(fetchRequestById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchRequestById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(addRequest.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(addRequest.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(addRequest.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(editRequest.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(editRequest.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((x) => x.id === action.payload.id)
        if (idx >= 0) {
          state.items[idx] = { ...state.items[idx], ...action.payload.payload }
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = { ...state.selected, ...action.payload.payload }
        }
      })
      .addCase(editRequest.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(removeRequest.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(removeRequest.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((x) => x.id !== action.payload)
        if (state.selected?.id === action.payload) {
          state.selected = undefined
        }
      })
      .addCase(removeRequest.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(setRequestPending.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(setRequestPending.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((x) => x.id === action.payload)
        if (idx >= 0) {
          state.items[idx].status = 'Pending'
        }
        if (state.selected?.id === action.payload) {
          state.selected.status = 'Pending'
        }
      })
      .addCase(setRequestPending.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(setRequestProgress.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(setRequestProgress.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((x) => x.id === action.payload)
        if (idx >= 0) {
          state.items[idx].status = 'Progress'
        }
        if (state.selected?.id === action.payload) {
          state.selected.status = 'Progress'
        }
      })
      .addCase(setRequestProgress.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(setRequestSuccess.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(setRequestSuccess.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((x) => x.id === action.payload)
        if (idx >= 0) {
          state.items[idx].status = 'Success'
        }
        if (state.selected?.id === action.payload) {
          state.selected.status = 'Success'
        }
      })
      .addCase(setRequestSuccess.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearRequestsError, setSelectedRequest } = requestsSlice.actions
export const requestsReducer = requestsSlice.reducer




