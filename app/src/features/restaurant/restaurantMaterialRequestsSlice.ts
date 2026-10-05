import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  restaurantMaterialRequestsApi,
  type MaterialRequestsQuery,
} from '../../shared/apis/restaurantMaterialRequestsApi'
import type {
  CreateMaterialRequestRequest,
  MaterialRequest,
  UpdateMaterialRequestRequest,
} from '../../models/RestaurantMaterialRequest'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type RestaurantMaterialRequestsState = {
  items: MaterialRequest[]
  selected: MaterialRequest | null
  totalCount: number
  totalPages: number
  pageNumber: number
  pageSize: number
  status: AsyncStatus
  selectedStatus: AsyncStatus
  mutationStatus: AsyncStatus
  error?: string
  selectedError?: string
  mutationError?: string
}

const initialState: RestaurantMaterialRequestsState = {
  items: [],
  selected: null,
  totalCount: 0,
  totalPages: 0,
  pageNumber: 1,
  pageSize: 20,
  status: 'idle',
  selectedStatus: 'idle',
  mutationStatus: 'idle',
}

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export const fetchRestaurantMaterialRequests = createAsyncThunk(
  'restaurantMaterialRequests/fetchAll',
  async (params: MaterialRequestsQuery | void, thunkApi) => {
    try {
      return await restaurantMaterialRequestsApi.getAll(params || undefined, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch material requests'))
    }
  },
)

export const fetchRestaurantMaterialRequest = createAsyncThunk(
  'restaurantMaterialRequests/fetchById',
  async (id: number, thunkApi) => {
    try {
      return await restaurantMaterialRequestsApi.getById(id, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch material request'))
    }
  },
)

export const createRestaurantMaterialRequest = createAsyncThunk(
  'restaurantMaterialRequests/create',
  async (data: CreateMaterialRequestRequest, thunkApi) => {
    try {
      return await restaurantMaterialRequestsApi.create(data, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to create material request'))
    }
  },
)

export const updateRestaurantMaterialRequest = createAsyncThunk(
  'restaurantMaterialRequests/update',
  async ({ id, data }: { id: number; data: UpdateMaterialRequestRequest }, thunkApi) => {
    try {
      return await restaurantMaterialRequestsApi.update(id, data, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to update material request'))
    }
  },
)

export const cancelRestaurantMaterialRequest = createAsyncThunk(
  'restaurantMaterialRequests/cancel',
  async (id: number, thunkApi) => {
    try {
      return await restaurantMaterialRequestsApi.cancel(id, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to cancel material request'))
    }
  },
)

const restaurantMaterialRequestsSlice = createSlice({
  name: 'restaurantMaterialRequests',
  initialState,
  reducers: {
    clearRestaurantMaterialRequestsErrors(state) {
      state.error = undefined
      state.selectedError = undefined
      state.mutationError = undefined
    },
    clearSelectedRestaurantMaterialRequest(state) {
      state.selected = null
      state.selectedStatus = 'idle'
      state.selectedError = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurantMaterialRequests.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchRestaurantMaterialRequests.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
        state.totalPages = action.payload.totalPages
        state.pageNumber = action.payload.pageNumber
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchRestaurantMaterialRequests.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      .addCase(fetchRestaurantMaterialRequest.pending, (state) => {
        state.selectedStatus = 'loading'
        state.selectedError = undefined
      })
      .addCase(fetchRestaurantMaterialRequest.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchRestaurantMaterialRequest.rejected, (state, action) => {
        state.selectedStatus = 'failed'
        state.selectedError = action.payload as string
      })
      .addCase(createRestaurantMaterialRequest.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(createRestaurantMaterialRequest.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createRestaurantMaterialRequest.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
      .addCase(updateRestaurantMaterialRequest.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(updateRestaurantMaterialRequest.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        if (state.selected?.id === action.payload.id) state.selected = action.payload
      })
      .addCase(updateRestaurantMaterialRequest.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
      .addCase(cancelRestaurantMaterialRequest.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(cancelRestaurantMaterialRequest.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        if (state.selected?.id === action.payload.id) state.selected = action.payload
      })
      .addCase(cancelRestaurantMaterialRequest.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
  },
})

export const {
  clearRestaurantMaterialRequestsErrors,
  clearSelectedRestaurantMaterialRequest,
} = restaurantMaterialRequestsSlice.actions
export const restaurantMaterialRequestsReducer = restaurantMaterialRequestsSlice.reducer
