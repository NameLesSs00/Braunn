import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  LaundryPurchaseReadDto,
  LaundryPurchaseCreateDto,
  LaundryPurchaseUpdateDto,
  LaundryPurchasesParams,
} from '../../../models/Laundrymodels/LaundryPurchase'
import * as api from '../../../shared/Laundryshared/api/laundryPurchasesApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

const PAGE_SIZE = 10

type LaundryPurchasesState = {
  items: LaundryPurchaseReadDto[]
  totalCount: number
  status: AsyncStatus
  error?: string
  params: LaundryPurchasesParams
}

const initialState: LaundryPurchasesState = {
  items: [],
  totalCount: 0,
  status: 'idle',
  error: undefined,
  params: { PageNumber: 1, PageSize: PAGE_SIZE },
}

export const fetchLaundryPurchases = createAsyncThunk(
  'laundryPurchases/fetchAll',
  async (params: LaundryPurchasesParams | undefined, thunkApi) => {
    try {
      return await api.getLaundryPurchases(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load purchases'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createLaundryPurchase = createAsyncThunk(
  'laundryPurchases/create',
  async (payload: LaundryPurchaseCreateDto, thunkApi) => {
    try {
      return await api.createLaundryPurchase(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create purchase'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateLaundryPurchase = createAsyncThunk(
  'laundryPurchases/update',
  async ({ id, payload }: { id: number; payload: LaundryPurchaseUpdateDto }, thunkApi) => {
    try {
      return await api.updateLaundryPurchase(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update purchase'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const deleteLaundryPurchase = createAsyncThunk(
  'laundryPurchases/delete',
  async (id: number, thunkApi) => {
    try {
      await api.deleteLaundryPurchase(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete purchase'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const laundryPurchasesSlice = createSlice({
  name: 'laundryPurchases',
  initialState,
  reducers: {
    setPurchasesPage(state, action: PayloadAction<number>) {
      state.params.PageNumber = action.payload
    },
    setPurchasesSupplierFilter(state, action: PayloadAction<string | undefined>) {
      state.params.SupplierName = action.payload
      state.params.PageNumber = 1
    },
    setPurchasesDateFilter(state, action: PayloadAction<string | undefined>) {
      state.params.Date = action.payload
      state.params.PageNumber = 1
    },
    clearPurchasesError(state) {
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchLaundryPurchases.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchLaundryPurchases.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchLaundryPurchases.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      // create
      .addCase(createLaundryPurchase.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createLaundryPurchase.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createLaundryPurchase.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      // update
      .addCase(updateLaundryPurchase.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateLaundryPurchase.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(updateLaundryPurchase.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      // delete
      .addCase(deleteLaundryPurchase.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteLaundryPurchase.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((i) => i.id !== action.payload)
        state.totalCount -= 1
      })
      .addCase(deleteLaundryPurchase.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const {
  setPurchasesPage,
  setPurchasesSupplierFilter,
  setPurchasesDateFilter,
  clearPurchasesError,
} = laundryPurchasesSlice.actions

export const laundryPurchasesReducer = laundryPurchasesSlice.reducer
