import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { restaurantProductsApi, type RestaurantProductsQuery } from '../../shared/apis/restaurantProductsApi'
import type {
  CreateRestaurantProductRequest,
  RestaurantProduct,
  UpdateRestaurantProductRequest,
} from '../../models/RestaurantProduct'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type RestaurantProductsState = {
  items: RestaurantProduct[]
  selected: RestaurantProduct | null
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

const initialState: RestaurantProductsState = {
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

export const fetchRestaurantProducts = createAsyncThunk(
  'restaurantProducts/fetchAll',
  async (params: RestaurantProductsQuery | void, thunkApi) => {
    try {
      return await restaurantProductsApi.getAll(params || undefined, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch restaurant products'))
    }
  },
)

export const fetchRestaurantProduct = createAsyncThunk('restaurantProducts/fetchById', async (id: number, thunkApi) => {
  try {
    return await restaurantProductsApi.getById(id, thunkApi.signal)
  } catch (e) {
    return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch restaurant product'))
  }
})

export const createRestaurantProduct = createAsyncThunk(
  'restaurantProducts/create',
  async (data: CreateRestaurantProductRequest, thunkApi) => {
    try {
      return await restaurantProductsApi.create(data, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to create restaurant product'))
    }
  },
)

export const updateRestaurantProduct = createAsyncThunk(
  'restaurantProducts/update',
  async ({ id, data }: { id: number; data: UpdateRestaurantProductRequest }, thunkApi) => {
    try {
      return await restaurantProductsApi.update(id, data, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to update restaurant product'))
    }
  },
)

export const toggleRestaurantProductStatus = createAsyncThunk(
  'restaurantProducts/toggleStatus',
  async ({ id, activate }: { id: number; activate: boolean }, thunkApi) => {
    try {
      if (activate) {
        await restaurantProductsApi.activate(id, thunkApi.signal)
      } else {
        await restaurantProductsApi.deactivate(id, thunkApi.signal)
      }
      return { id, isActive: activate }
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to update product status'))
    }
  },
)

const restaurantProductsSlice = createSlice({
  name: 'restaurantProducts',
  initialState,
  reducers: {
    clearRestaurantProductsError(state) {
      state.error = undefined
      state.selectedError = undefined
      state.mutationError = undefined
    },
    clearSelectedRestaurantProduct(state) {
      state.selected = null
      state.selectedStatus = 'idle'
      state.selectedError = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurantProducts.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchRestaurantProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
        state.totalPages = action.payload.totalPages
        state.pageNumber = action.payload.pageNumber
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchRestaurantProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      .addCase(fetchRestaurantProduct.pending, (state) => {
        state.selectedStatus = 'loading'
        state.selectedError = undefined
      })
      .addCase(fetchRestaurantProduct.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchRestaurantProduct.rejected, (state, action) => {
        state.selectedStatus = 'failed'
        state.selectedError = action.payload as string
      })
      .addCase(createRestaurantProduct.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(createRestaurantProduct.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createRestaurantProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
      .addCase(updateRestaurantProduct.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(updateRestaurantProduct.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        if (state.selected?.id === action.payload.id) state.selected = action.payload
      })
      .addCase(updateRestaurantProduct.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
      .addCase(toggleRestaurantProductStatus.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(toggleRestaurantProductStatus.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index].isActive = action.payload.isActive
        if (state.selected?.id === action.payload.id) state.selected.isActive = action.payload.isActive
      })
      .addCase(toggleRestaurantProductStatus.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
  },
})

export const { clearRestaurantProductsError, clearSelectedRestaurantProduct } = restaurantProductsSlice.actions
export const restaurantProductsReducer = restaurantProductsSlice.reducer
