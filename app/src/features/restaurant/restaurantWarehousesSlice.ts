import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  restaurantWarehousesApi,
  type WarehouseTransactionsQuery,
} from '../../shared/apis/restaurantWarehousesApi'
import type {
  RestaurantWarehouse,
  UpdateRestaurantWarehouseRequest,
  WarehouseDetails,
  WarehouseTransaction,
} from '../../models/RestaurantAdmin'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type RestaurantWarehousesState = {
  items: WarehouseDetails[]
  selected: RestaurantWarehouse | null
  selectedDetails: WarehouseDetails | null
  byRestaurant: RestaurantWarehouse | null
  transactions: WarehouseTransaction[]
  transactionsTotalCount: number
  transactionsTotalPages: number
  transactionsPageNumber: number
  transactionsPageSize: number
  status: AsyncStatus
  selectedStatus: AsyncStatus
  selectedDetailsStatus: AsyncStatus
  byRestaurantStatus: AsyncStatus
  transactionsStatus: AsyncStatus
  mutationStatus: AsyncStatus
  error?: string
  selectedError?: string
  selectedDetailsError?: string
  byRestaurantError?: string
  transactionsError?: string
  mutationError?: string
}

const initialState: RestaurantWarehousesState = {
  items: [],
  selected: null,
  selectedDetails: null,
  byRestaurant: null,
  transactions: [],
  transactionsTotalCount: 0,
  transactionsTotalPages: 0,
  transactionsPageNumber: 1,
  transactionsPageSize: 20,
  status: 'idle',
  selectedStatus: 'idle',
  selectedDetailsStatus: 'idle',
  byRestaurantStatus: 'idle',
  transactionsStatus: 'idle',
  mutationStatus: 'idle',
}

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export const fetchRestaurantWarehouse = createAsyncThunk('restaurantWarehouses/fetchById', async (id: number, thunkApi) => {
  try {
    return await restaurantWarehousesApi.getById(id, thunkApi.signal)
  } catch (e) {
    return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch warehouse'))
  }
})

export const fetchRestaurantWarehouseDetails = createAsyncThunk(
  'restaurantWarehouses/fetchDetails',
  async (_: void, thunkApi) => {
    try {
      return await restaurantWarehousesApi.getDetails(thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch warehouse details'))
    }
  },
)

export const fetchRestaurantWarehouseDetailsById = createAsyncThunk(
  'restaurantWarehouses/fetchDetailsById',
  async (id: number, thunkApi) => {
    try {
      return await restaurantWarehousesApi.getDetailsById(id, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch warehouse details'))
    }
  },
)

export const fetchRestaurantWarehouseByRestaurant = createAsyncThunk(
  'restaurantWarehouses/fetchByRestaurant',
  async (restaurantId: number, thunkApi) => {
    try {
      return await restaurantWarehousesApi.getByRestaurant(restaurantId, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch restaurant warehouse'))
    }
  },
)

export const updateRestaurantWarehouse = createAsyncThunk(
  'restaurantWarehouses/update',
  async ({ id, data }: { id: number; data: UpdateRestaurantWarehouseRequest }, thunkApi) => {
    try {
      return await restaurantWarehousesApi.update(id, data, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to update warehouse'))
    }
  },
)

export const toggleRestaurantWarehouseStatus = createAsyncThunk(
  'restaurantWarehouses/toggleStatus',
  async ({ id, activate }: { id: number; activate: boolean }, thunkApi) => {
    try {
      if (activate) {
        await restaurantWarehousesApi.activate(id, thunkApi.signal)
      } else {
        await restaurantWarehousesApi.deactivate(id, thunkApi.signal)
      }
      return { id, isActive: activate }
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to update warehouse status'))
    }
  },
)

export const fetchRestaurantWarehouseTransactions = createAsyncThunk(
  'restaurantWarehouses/fetchTransactions',
  async ({ id, params }: { id: number; params?: WarehouseTransactionsQuery }, thunkApi) => {
    try {
      return await restaurantWarehousesApi.getTransactions(id, params, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch warehouse transactions'))
    }
  },
)

const restaurantWarehousesSlice = createSlice({
  name: 'restaurantWarehouses',
  initialState,
  reducers: {
    clearRestaurantWarehousesError(state) {
      state.error = undefined
      state.selectedError = undefined
      state.selectedDetailsError = undefined
      state.byRestaurantError = undefined
      state.transactionsError = undefined
      state.mutationError = undefined
    },
    clearSelectedRestaurantWarehouse(state) {
      state.selected = null
      state.selectedStatus = 'idle'
      state.selectedError = undefined
    },
    clearSelectedRestaurantWarehouseDetails(state) {
      state.selectedDetails = null
      state.selectedDetailsStatus = 'idle'
      state.selectedDetailsError = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurantWarehouse.pending, (state) => {
        state.selectedStatus = 'loading'
        state.selectedError = undefined
      })
      .addCase(fetchRestaurantWarehouse.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchRestaurantWarehouse.rejected, (state, action) => {
        state.selectedStatus = 'failed'
        state.selectedError = action.payload as string
      })
      .addCase(fetchRestaurantWarehouseDetails.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchRestaurantWarehouseDetails.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchRestaurantWarehouseDetails.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      .addCase(fetchRestaurantWarehouseDetailsById.pending, (state) => {
        state.selectedDetailsStatus = 'loading'
        state.selectedDetailsError = undefined
      })
      .addCase(fetchRestaurantWarehouseDetailsById.fulfilled, (state, action) => {
        state.selectedDetailsStatus = 'succeeded'
        state.selectedDetails = action.payload
      })
      .addCase(fetchRestaurantWarehouseDetailsById.rejected, (state, action) => {
        state.selectedDetailsStatus = 'failed'
        state.selectedDetailsError = action.payload as string
      })
      .addCase(fetchRestaurantWarehouseByRestaurant.pending, (state) => {
        state.byRestaurantStatus = 'loading'
        state.byRestaurantError = undefined
      })
      .addCase(fetchRestaurantWarehouseByRestaurant.fulfilled, (state, action) => {
        state.byRestaurantStatus = 'succeeded'
        state.byRestaurant = action.payload
      })
      .addCase(fetchRestaurantWarehouseByRestaurant.rejected, (state, action) => {
        state.byRestaurantStatus = 'failed'
        state.byRestaurantError = action.payload as string
      })
      .addCase(updateRestaurantWarehouse.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(updateRestaurantWarehouse.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const index = state.items.findIndex((item) => item.warehouseId === action.payload.id)
        if (index !== -1) {
          state.items[index].warehouseName = action.payload.name
          state.items[index].isActive = action.payload.isActive
        }
        if (state.selected?.id === action.payload.id) state.selected = action.payload
        if (state.selectedDetails?.warehouseId === action.payload.id) {
          state.selectedDetails.warehouseName = action.payload.name
          state.selectedDetails.isActive = action.payload.isActive
        }
      })
      .addCase(updateRestaurantWarehouse.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
      .addCase(toggleRestaurantWarehouseStatus.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(toggleRestaurantWarehouseStatus.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const index = state.items.findIndex((item) => item.warehouseId === action.payload.id)
        if (index !== -1) state.items[index].isActive = action.payload.isActive
        if (state.selected?.id === action.payload.id) state.selected.isActive = action.payload.isActive
        if (state.selectedDetails?.warehouseId === action.payload.id) {
          state.selectedDetails.isActive = action.payload.isActive
        }
      })
      .addCase(toggleRestaurantWarehouseStatus.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
      .addCase(fetchRestaurantWarehouseTransactions.pending, (state) => {
        state.transactionsStatus = 'loading'
        state.transactionsError = undefined
      })
      .addCase(fetchRestaurantWarehouseTransactions.fulfilled, (state, action) => {
        state.transactionsStatus = 'succeeded'
        state.transactions = action.payload.items
        state.transactionsTotalCount = action.payload.totalCount
        state.transactionsTotalPages = action.payload.totalPages
        state.transactionsPageNumber = action.payload.pageNumber
        state.transactionsPageSize = action.payload.pageSize
      })
      .addCase(fetchRestaurantWarehouseTransactions.rejected, (state, action) => {
        state.transactionsStatus = 'failed'
        state.transactionsError = action.payload as string
      })
  },
})

export const {
  clearRestaurantWarehousesError,
  clearSelectedRestaurantWarehouse,
  clearSelectedRestaurantWarehouseDetails,
} = restaurantWarehousesSlice.actions
export const restaurantWarehousesReducer = restaurantWarehousesSlice.reducer
