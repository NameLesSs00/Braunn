import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { restaurantRestaurantsApi, type RestaurantsQuery } from '../../shared/apis/restaurantRestaurantsApi'
import type {
  RestaurantAdmin,
  UpdateRestaurantRequest,
  UpdateRestaurantWarehouseRequest,
} from '../../models/RestaurantAdmin'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type RestaurantRestaurantsState = {
  items: RestaurantAdmin[]
  selected: RestaurantAdmin | null
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

const initialState: RestaurantRestaurantsState = {
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

export const fetchAdminRestaurants = createAsyncThunk(
  'restaurantRestaurants/fetchAll',
  async (params: RestaurantsQuery | void, thunkApi) => {
    try {
      return await restaurantRestaurantsApi.getAll(params || undefined, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch restaurants'))
    }
  },
)

export const fetchAdminRestaurant = createAsyncThunk('restaurantRestaurants/fetchById', async (id: number, thunkApi) => {
  try {
    return await restaurantRestaurantsApi.getById(id, thunkApi.signal)
  } catch (e) {
    return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch restaurant'))
  }
})

export const updateAdminRestaurant = createAsyncThunk(
  'restaurantRestaurants/update',
  async ({ id, data }: { id: number; data: UpdateRestaurantRequest }, thunkApi) => {
    try {
      return await restaurantRestaurantsApi.update(id, data, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to update restaurant'))
    }
  },
)

export const updateAdminRestaurantWarehouse = createAsyncThunk(
  'restaurantRestaurants/updateWarehouse',
  async ({ id, data }: { id: number; data: UpdateRestaurantWarehouseRequest }, thunkApi) => {
    try {
      return await restaurantRestaurantsApi.updateWarehouse(id, data, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to update restaurant warehouse'))
    }
  },
)

export const toggleAdminRestaurantStatus = createAsyncThunk(
  'restaurantRestaurants/toggleStatus',
  async ({ id, activate }: { id: number; activate: boolean }, thunkApi) => {
    try {
      if (activate) {
        await restaurantRestaurantsApi.activate(id, thunkApi.signal)
      } else {
        await restaurantRestaurantsApi.deactivate(id, thunkApi.signal)
      }
      return { id, isActive: activate }
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to update restaurant status'))
    }
  },
)

const restaurantRestaurantsSlice = createSlice({
  name: 'restaurantRestaurants',
  initialState,
  reducers: {
    clearRestaurantRestaurantsError(state) {
      state.error = undefined
      state.selectedError = undefined
      state.mutationError = undefined
    },
    clearSelectedAdminRestaurant(state) {
      state.selected = null
      state.selectedStatus = 'idle'
      state.selectedError = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminRestaurants.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchAdminRestaurants.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
        state.totalPages = action.payload.totalPages
        state.pageNumber = action.payload.pageNumber
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchAdminRestaurants.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      .addCase(fetchAdminRestaurant.pending, (state) => {
        state.selectedStatus = 'loading'
        state.selectedError = undefined
      })
      .addCase(fetchAdminRestaurant.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchAdminRestaurant.rejected, (state, action) => {
        state.selectedStatus = 'failed'
        state.selectedError = action.payload as string
      })
      .addCase(updateAdminRestaurant.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(updateAdminRestaurant.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        if (state.selected?.id === action.payload.id) state.selected = action.payload
      })
      .addCase(updateAdminRestaurant.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
      .addCase(updateAdminRestaurantWarehouse.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(updateAdminRestaurantWarehouse.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const restaurantId = action.payload.restaurantId
        const index = state.items.findIndex((item) => item.id === restaurantId)
        if (index !== -1) state.items[index].warehouse = action.payload
        if (state.selected?.id === restaurantId) state.selected.warehouse = action.payload
      })
      .addCase(updateAdminRestaurantWarehouse.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
      .addCase(toggleAdminRestaurantStatus.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(toggleAdminRestaurantStatus.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index].isActive = action.payload.isActive
        if (state.selected?.id === action.payload.id) state.selected.isActive = action.payload.isActive
      })
      .addCase(toggleAdminRestaurantStatus.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
  },
})

export const { clearRestaurantRestaurantsError, clearSelectedAdminRestaurant } = restaurantRestaurantsSlice.actions
export const restaurantRestaurantsReducer = restaurantRestaurantsSlice.reducer
