import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  LaundryInventoryItemReadDto,
  LaundryInventoryItemCreateDto,
  LaundryInventoryItemUpdateDto,
  LaundryInventoryItemsParams,
  LaundryItemStatus,
  LaundryMaintenanceStatus,
} from '../../../models/Laundrymodels/LaundryInventoryItem'
import * as api from '../../../shared/Laundryshared/api/laundryInventoryItemsApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

const PAGE_SIZE = 10

type LaundryInventoryItemsState = {
  items: LaundryInventoryItemReadDto[]
  totalCount: number
  status: AsyncStatus
  error?: string
  params: LaundryInventoryItemsParams
}

const initialState: LaundryInventoryItemsState = {
  items: [],
  totalCount: 0,
  status: 'idle',
  error: undefined,
  params: { PageNumber: 1, PageSize: PAGE_SIZE },
}

// GET /api/laundry/inventory/items
export const fetchLaundryInventoryItems = createAsyncThunk(
  'laundryInventoryItems/fetchAll',
  async (params: LaundryInventoryItemsParams | undefined, thunkApi) => {
    try {
      return await api.getLaundryInventoryItems(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load items'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// POST /api/laundry/inventory/items
export const createLaundryInventoryItem = createAsyncThunk(
  'laundryInventoryItems/create',
  async (payload: LaundryInventoryItemCreateDto, thunkApi) => {
    try {
      return await api.createLaundryInventoryItem(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create item'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// PUT /api/laundry/inventory/items/{id}
export const updateLaundryInventoryItem = createAsyncThunk(
  'laundryInventoryItems/update',
  async ({ id, payload }: { id: number; payload: LaundryInventoryItemUpdateDto }, thunkApi) => {
    try {
      return await api.updateLaundryInventoryItem(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update item'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// DELETE /api/laundry/inventory/items/{id}
export const deleteLaundryInventoryItem = createAsyncThunk(
  'laundryInventoryItems/delete',
  async (id: number, thunkApi) => {
    try {
      await api.deleteLaundryInventoryItem(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete item'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const laundryInventoryItemsSlice = createSlice({
  name: 'laundryInventoryItems',
  initialState,
  reducers: {
    setItemsParams(state, action: PayloadAction<Partial<LaundryInventoryItemsParams>>) {
      state.params = { ...state.params, ...action.payload }
    },
    setItemsPage(state, action: PayloadAction<number>) {
      state.params.PageNumber = action.payload
    },
    setItemsCategoryFilter(state, action: PayloadAction<number | ''>) {
      state.params.CategoryId = action.payload
      state.params.PageNumber = 1
    },
    setItemsStatusFilter(state, action: PayloadAction<LaundryItemStatus | ''>) {
      state.params.Status = action.payload
      state.params.PageNumber = 1
    },
    setItemsMaintenanceStatusFilter(state, action: PayloadAction<LaundryMaintenanceStatus | ''>) {
      state.params.MaintenanceStatus = action.payload
      state.params.PageNumber = 1
    },
    setItemsNameFilter(state, action: PayloadAction<string>) {
      state.params.Name = action.payload
      state.params.PageNumber = 1
    },
    clearItemsError(state) {
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchLaundryInventoryItems.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchLaundryInventoryItems.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchLaundryInventoryItems.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createLaundryInventoryItem.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createLaundryInventoryItem.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createLaundryInventoryItem.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateLaundryInventoryItem.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateLaundryInventoryItem.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(updateLaundryInventoryItem.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteLaundryInventoryItem.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteLaundryInventoryItem.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((i) => i.id !== action.payload)
        state.totalCount -= 1
      })
      .addCase(deleteLaundryInventoryItem.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const {
  setItemsParams,
  setItemsPage,
  setItemsCategoryFilter,
  setItemsStatusFilter,
  setItemsMaintenanceStatusFilter,
  setItemsNameFilter,
  clearItemsError,
} = laundryInventoryItemsSlice.actions

export const laundryInventoryItemsReducer = laundryInventoryItemsSlice.reducer
