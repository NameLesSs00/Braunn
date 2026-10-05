import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  restaurantInventoryApi,
  type RestaurantInventoryQuery,
  type RestaurantInventoryTransactionsQuery,
} from '../../shared/apis/restaurantInventoryApi'
import type { RestaurantInventoryItem, RestaurantInventoryTransaction } from '../../models/RestaurantInventory'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type RestaurantInventoryState = {
  items: RestaurantInventoryItem[]
  selected: RestaurantInventoryItem | null
  transactions: RestaurantInventoryTransaction[]
  selectedTransaction: RestaurantInventoryTransaction | null
  totalCount: number
  totalPages: number
  pageNumber: number
  pageSize: number
  transactionsTotalCount: number
  transactionsTotalPages: number
  transactionsPageNumber: number
  transactionsPageSize: number
  status: AsyncStatus
  selectedStatus: AsyncStatus
  transactionsStatus: AsyncStatus
  selectedTransactionStatus: AsyncStatus
  error?: string
  selectedError?: string
  transactionsError?: string
  selectedTransactionError?: string
}

const initialState: RestaurantInventoryState = {
  items: [],
  selected: null,
  transactions: [],
  selectedTransaction: null,
  totalCount: 0,
  totalPages: 0,
  pageNumber: 1,
  pageSize: 20,
  transactionsTotalCount: 0,
  transactionsTotalPages: 0,
  transactionsPageNumber: 1,
  transactionsPageSize: 20,
  status: 'idle',
  selectedStatus: 'idle',
  transactionsStatus: 'idle',
  selectedTransactionStatus: 'idle',
}

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export const fetchRestaurantInventory = createAsyncThunk(
  'restaurantInventory/fetchAll',
  async (params: RestaurantInventoryQuery | void, thunkApi) => {
    try {
      return await restaurantInventoryApi.getAll(params || undefined, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch restaurant inventory'))
    }
  },
)

export const fetchRestaurantInventoryItem = createAsyncThunk(
  'restaurantInventory/fetchById',
  async (id: number, thunkApi) => {
    try {
      return await restaurantInventoryApi.getById(id, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch inventory item'))
    }
  },
)

export const fetchRestaurantInventoryTransactions = createAsyncThunk(
  'restaurantInventory/fetchTransactions',
  async (params: RestaurantInventoryTransactionsQuery | void, thunkApi) => {
    try {
      return await restaurantInventoryApi.getTransactions(params || undefined, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch inventory transactions'))
    }
  },
)

export const fetchRestaurantInventoryTransaction = createAsyncThunk(
  'restaurantInventory/fetchTransactionById',
  async (id: number, thunkApi) => {
    try {
      return await restaurantInventoryApi.getTransactionById(id, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch inventory transaction'))
    }
  },
)

const restaurantInventorySlice = createSlice({
  name: 'restaurantInventory',
  initialState,
  reducers: {
    clearRestaurantInventoryErrors(state) {
      state.error = undefined
      state.selectedError = undefined
      state.transactionsError = undefined
      state.selectedTransactionError = undefined
    },
    clearSelectedRestaurantInventoryItem(state) {
      state.selected = null
      state.selectedStatus = 'idle'
      state.selectedError = undefined
    },
    clearSelectedRestaurantInventoryTransaction(state) {
      state.selectedTransaction = null
      state.selectedTransactionStatus = 'idle'
      state.selectedTransactionError = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurantInventory.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchRestaurantInventory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
        state.totalPages = action.payload.totalPages
        state.pageNumber = action.payload.pageNumber
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchRestaurantInventory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      .addCase(fetchRestaurantInventoryItem.pending, (state) => {
        state.selectedStatus = 'loading'
        state.selectedError = undefined
      })
      .addCase(fetchRestaurantInventoryItem.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchRestaurantInventoryItem.rejected, (state, action) => {
        state.selectedStatus = 'failed'
        state.selectedError = action.payload as string
      })
      .addCase(fetchRestaurantInventoryTransactions.pending, (state) => {
        state.transactionsStatus = 'loading'
        state.transactionsError = undefined
      })
      .addCase(fetchRestaurantInventoryTransactions.fulfilled, (state, action) => {
        state.transactionsStatus = 'succeeded'
        state.transactions = action.payload.items
        state.transactionsTotalCount = action.payload.totalCount
        state.transactionsTotalPages = action.payload.totalPages
        state.transactionsPageNumber = action.payload.pageNumber
        state.transactionsPageSize = action.payload.pageSize
      })
      .addCase(fetchRestaurantInventoryTransactions.rejected, (state, action) => {
        state.transactionsStatus = 'failed'
        state.transactionsError = action.payload as string
      })
      .addCase(fetchRestaurantInventoryTransaction.pending, (state) => {
        state.selectedTransactionStatus = 'loading'
        state.selectedTransactionError = undefined
      })
      .addCase(fetchRestaurantInventoryTransaction.fulfilled, (state, action) => {
        state.selectedTransactionStatus = 'succeeded'
        state.selectedTransaction = action.payload
      })
      .addCase(fetchRestaurantInventoryTransaction.rejected, (state, action) => {
        state.selectedTransactionStatus = 'failed'
        state.selectedTransactionError = action.payload as string
      })
  },
})

export const {
  clearRestaurantInventoryErrors,
  clearSelectedRestaurantInventoryItem,
  clearSelectedRestaurantInventoryTransaction,
} = restaurantInventorySlice.actions
export const restaurantInventoryReducer = restaurantInventorySlice.reducer
