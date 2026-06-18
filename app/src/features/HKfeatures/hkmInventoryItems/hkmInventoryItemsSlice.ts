import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  HkmInventoryItemReadDto,
  HkmInventoryItemCreateDto,
  HkmInventoryItemUpdateDto,
  HkmInventoryItemsParams,
  HkmInventoryItemStatus,
} from '../../../models/HKmodels/HkmInventoryItem'
import * as api from '../../../shared/HKshared/api/hkmInventoryItemsApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

const PAGE_SIZE = 10

type HkmInventoryItemsState = {
  items: HkmInventoryItemReadDto[]
  totalCount: number
  status: AsyncStatus
  error?: string
  params: HkmInventoryItemsParams
}

const initialState: HkmInventoryItemsState = {
  items: [],
  totalCount: 0,
  status: 'idle',
  error: undefined,
  params: { PageNumber: 1, PageSize: PAGE_SIZE },
}

// GET /api/hkm/inventory/items
export const fetchHkmInventoryItems = createAsyncThunk(
  'hkmInventoryItems/fetchAll',
  async (params: HkmInventoryItemsParams | undefined, thunkApi) => {
    try {
      return await api.getHkmInventoryItems(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load items'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// POST /api/hkm/inventory/items
export const createHkmInventoryItem = createAsyncThunk(
  'hkmInventoryItems/create',
  async (payload: HkmInventoryItemCreateDto, thunkApi) => {
    try {
      return await api.createHkmInventoryItem(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create item'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// PUT /api/hkm/inventory/items/{id}
export const updateHkmInventoryItem = createAsyncThunk(
  'hkmInventoryItems/update',
  async ({ id, payload }: { id: number; payload: HkmInventoryItemUpdateDto }, thunkApi) => {
    try {
      return await api.updateHkmInventoryItem(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update item'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// DELETE /api/hkm/inventory/items/{id}
export const deleteHkmInventoryItem = createAsyncThunk(
  'hkmInventoryItems/delete',
  async (id: number, thunkApi) => {
    try {
      await api.deleteHkmInventoryItem(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete item'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const hkmInventoryItemsSlice = createSlice({
  name: 'hkmInventoryItems',
  initialState,
  reducers: {
    setItemsParams(state, action: PayloadAction<Partial<HkmInventoryItemsParams>>) {
      state.params = { ...state.params, ...action.payload }
    },
    setItemsPage(state, action: PayloadAction<number>) {
      state.params.PageNumber = action.payload
    },
    setItemsCategoryFilter(state, action: PayloadAction<number | ''>) {
      state.params.CategoryId = action.payload
      state.params.PageNumber = 1
    },
    setItemsUnitFilter(state, action: PayloadAction<number | ''>) {
      state.params.UnitId = action.payload
      state.params.PageNumber = 1
    },
    setItemsStatusFilter(state, action: PayloadAction<HkmInventoryItemStatus | ''>) {
      state.params.Status = action.payload
      state.params.PageNumber = 1
    },
    clearItemsError(state) {
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchHkmInventoryItems.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchHkmInventoryItems.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchHkmInventoryItems.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createHkmInventoryItem.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createHkmInventoryItem.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createHkmInventoryItem.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateHkmInventoryItem.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateHkmInventoryItem.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(updateHkmInventoryItem.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteHkmInventoryItem.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteHkmInventoryItem.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((i) => i.id !== action.payload)
        state.totalCount -= 1
      })
      .addCase(deleteHkmInventoryItem.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const {
  setItemsParams,
  setItemsPage,
  setItemsCategoryFilter,
  setItemsUnitFilter,
  setItemsStatusFilter,
  clearItemsError,
} = hkmInventoryItemsSlice.actions

export const hkmInventoryItemsReducer = hkmInventoryItemsSlice.reducer
