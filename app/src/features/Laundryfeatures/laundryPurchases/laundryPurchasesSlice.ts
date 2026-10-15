import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  LaundryPurchaseReadDto,
  LaundryPurchaseCreateDto,
  LaundryPurchaseUpdateDto,
  LaundryPurchasesParams,
  LaundryPurchaseAction,
} from '../../../models/Laundrymodels/LaundryPurchase'
import * as api from '../../../shared/Laundryshared/api/laundryPurchasesApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

const PAGE_SIZE = 10

export interface LaundryPurchasesState {
  items: LaundryPurchaseReadDto[]
  selectedItem: LaundryPurchaseReadDto | null
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  status: AsyncStatus
  detailStatus: AsyncStatus
  actionStatus: AsyncStatus
  error?: string
  params: LaundryPurchasesParams
}

const initialState: LaundryPurchasesState = {
  items: [],
  selectedItem: null,
  totalCount: 0,
  pageNumber: 1,
  pageSize: PAGE_SIZE,
  totalPages: 1,
  status: 'idle',
  detailStatus: 'idle',
  actionStatus: 'idle',
  error: undefined,
  params: { PageNumber: 1, PageSize: PAGE_SIZE },
}

export const fetchLaundryPurchases = createAsyncThunk(
  'laundryPurchases/fetchAll',
  async (params: LaundryPurchasesParams | undefined, thunkApi) => {
    try {
      return await api.getLaundryPurchases(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load laundry purchases'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchLaundryPurchaseById = createAsyncThunk(
  'laundryPurchases/fetchById',
  async (id: number, thunkApi) => {
    try {
      return await api.getLaundryPurchaseById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load purchase details'
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
      const message = e instanceof Error ? e.message : 'Failed to create purchase request'
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
      const message = e instanceof Error ? e.message : 'Failed to update purchase request'
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
      const message = e instanceof Error ? e.message : 'Failed to delete purchase request'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const changeLaundryPurchaseStatus = createAsyncThunk(
  'laundryPurchases/changeStatus',
  async ({ id, action }: { id: number; action: LaundryPurchaseAction }, thunkApi) => {
    try {
      await api.changeLaundryPurchaseStatus(id, action, thunkApi.signal)
      return { id, action }
    } catch (e) {
      const message = e instanceof Error ? e.message : `Failed to execute action "${action}"`
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
      state.pageNumber = action.payload
    },
    setPurchasesPageSize(state, action: PayloadAction<number>) {
      state.params.PageSize = action.payload
      state.pageSize = action.payload
      state.params.PageNumber = 1
      state.pageNumber = 1
    },
    setPurchasesStatusFilter(state, action: PayloadAction<string | undefined>) {
      state.params.Status = action.payload
      state.params.PageNumber = 1
      state.pageNumber = 1
    },
    setPurchasesDateRange(
      state,
      action: PayloadAction<{ fromDate?: string; toDate?: string }>
    ) {
      state.params.FromDate = action.payload.fromDate
      state.params.ToDate = action.payload.toDate
      state.params.PageNumber = 1
      state.pageNumber = 1
    },
    setPurchasesParams(state, action: PayloadAction<LaundryPurchasesParams>) {
      state.params = { ...state.params, ...action.payload }
      if (action.payload.PageNumber) state.pageNumber = action.payload.PageNumber
      if (action.payload.PageSize) state.pageSize = action.payload.PageSize
    },
    resetPurchasesFilters(state) {
      state.params = { PageNumber: 1, PageSize: state.pageSize }
      state.pageNumber = 1
    },
    clearPurchasesError(state) {
      state.error = undefined
    },
    clearSelectedItem(state) {
      state.selectedItem = null
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
        const raw = action.payload as any
        let itemsList: any[] = []
        if (Array.isArray(raw)) {
          itemsList = raw
        } else if (raw && Array.isArray(raw.items)) {
          itemsList = raw.items
        } else if (raw && Array.isArray(raw.Items)) {
          itemsList = raw.Items
        } else if (raw?.data && Array.isArray(raw.data.items)) {
          itemsList = raw.data.items
        } else if (raw?.data && Array.isArray(raw.data.Items)) {
          itemsList = raw.data.Items
        } else if (raw?.data && Array.isArray(raw.data)) {
          itemsList = raw.data
        } else if (raw?.Data && Array.isArray(raw.Data.Items)) {
          itemsList = raw.Data.Items
        } else if (raw?.Data && Array.isArray(raw.Data)) {
          itemsList = raw.Data
        }

        state.items = itemsList
        state.totalCount = raw?.totalCount ?? raw?.TotalCount ?? raw?.data?.totalCount ?? itemsList.length
        state.pageNumber = raw?.pageNumber || raw?.PageNumber || state.pageNumber || 1
        state.pageSize = raw?.pageSize || raw?.PageSize || state.pageSize || 10
        state.totalPages = raw?.totalPages || raw?.TotalPages || (Math.ceil(state.totalCount / state.pageSize) || 1)
      })
      .addCase(fetchLaundryPurchases.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchById
      .addCase(fetchLaundryPurchaseById.pending, (state) => {
        state.detailStatus = 'loading'
      })
      .addCase(fetchLaundryPurchaseById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        const raw = action.payload as any
        const item = raw?.data ?? raw?.Data ?? raw
        state.selectedItem = item
        if (item && item.id != null) {
          const idx = state.items.findIndex((i) => i.id === item.id)
          if (idx !== -1) {
            state.items[idx] = item
          }
        }
      })
      .addCase(fetchLaundryPurchaseById.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createLaundryPurchase.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = undefined
      })
      .addCase(createLaundryPurchase.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        const raw = action.payload as any
        const item = raw?.data ?? raw?.Data ?? raw
        if (item && item.id != null) {
          const exists = state.items.some((i) => i.id === item.id)
          if (!exists) {
            state.items.unshift(item)
            state.totalCount += 1
          }
        }
      })
      .addCase(createLaundryPurchase.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateLaundryPurchase.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = undefined
      })
      .addCase(updateLaundryPurchase.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        const raw = action.payload as any
        const item = raw?.data ?? raw?.Data ?? raw
        if (item && item.id != null) {
          const idx = state.items.findIndex((i) => i.id === item.id)
          if (idx !== -1) state.items[idx] = item
          if (state.selectedItem?.id === item.id) {
            state.selectedItem = item
          }
        }
      })
      .addCase(updateLaundryPurchase.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteLaundryPurchase.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = undefined
      })
      .addCase(deleteLaundryPurchase.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items = state.items.filter((i) => i.id !== action.payload)
        state.totalCount -= 1
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null
        }
      })
      .addCase(deleteLaundryPurchase.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // changeStatus
      .addCase(changeLaundryPurchaseStatus.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = undefined
      })
      .addCase(changeLaundryPurchaseStatus.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        // Map the action to updated status optimistically if needed
        const { id, action: act } = action.payload
        const statusMap: Record<LaundryPurchaseAction, LaundryPurchaseReadDto['status']> = {
          view: 'Viewed',
          approve: 'Approved',
          order: 'Ordered',
          complete: 'Completed',
          reject: 'Rejected',
          cancel: 'Cancelled',
        }
        const newStatus = statusMap[act]
        if (newStatus) {
          const item = state.items.find((i) => i.id === id)
          if (item) item.status = newStatus
          if (state.selectedItem?.id === id) state.selectedItem.status = newStatus
        }
      })
      .addCase(changeLaundryPurchaseStatus.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const {
  setPurchasesPage,
  setPurchasesPageSize,
  setPurchasesStatusFilter,
  setPurchasesDateRange,
  setPurchasesParams,
  resetPurchasesFilters,
  clearPurchasesError,
  clearSelectedItem,
} = laundryPurchasesSlice.actions

export const laundryPurchasesReducer = laundryPurchasesSlice.reducer
export default laundryPurchasesSlice.reducer
