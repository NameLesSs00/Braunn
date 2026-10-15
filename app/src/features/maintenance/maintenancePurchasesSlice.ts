import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/maintenancePurchasesApi'
import {
  MaintenancePurchaseSummary,
  MaintenancePurchaseDetail,
  CreateMaintenancePurchaseRequest,
  UpdateMaintenancePurchaseRequest,
  PurchaseStatus,
  PurchaseStatusAction,
  getNextStatusForAction,
} from '../../models/MaintenancePurchase'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type MaintenancePurchasesState = {
  items: MaintenancePurchaseSummary[]
  pendingItems: MaintenancePurchaseSummary[]
  selectedItem?: MaintenancePurchaseDetail
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  filters: api.GetMaintenancePurchasesParams

  fetchStatus: AsyncStatus
  pendingFetchStatus: AsyncStatus
  fetchDetailsStatus: AsyncStatus
  createStatus: AsyncStatus
  updateStatus: AsyncStatus
  deleteStatus: AsyncStatus
  statusChangeStatus: AsyncStatus
  error?: string
}

const initialState: MaintenancePurchasesState = {
  items: [],
  pendingItems: [],
  selectedItem: undefined,
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
  filters: {
    pageNumber: 1,
    pageSize: 10,
  },

  fetchStatus: 'idle',
  pendingFetchStatus: 'idle',
  fetchDetailsStatus: 'idle',
  createStatus: 'idle',
  updateStatus: 'idle',
  deleteStatus: 'idle',
  statusChangeStatus: 'idle',
}

// ---------------------------------------------------------------------------
// Async Thunks
// ---------------------------------------------------------------------------

export const fetchMaintenancePurchases = createAsyncThunk(
  'maintenancePurchases/fetchAll',
  async (params: api.GetMaintenancePurchasesParams | undefined, thunkApi) => {
    try {
      const state = (thunkApi.getState() as { maintenancePurchases: MaintenancePurchasesState }).maintenancePurchases
      const effectiveParams: api.GetMaintenancePurchasesParams = {
        pageNumber: params?.pageNumber || state.pageNumber || 1,
        pageSize: params?.pageSize || state.pageSize || 10,
        status: params?.status !== undefined ? (String(params.status) !== 'All' ? params.status : undefined) : state.filters.status,
        fromDate: params?.fromDate !== undefined ? (params.fromDate || undefined) : state.filters.fromDate,
        toDate: params?.toDate !== undefined ? (params.toDate || undefined) : state.filters.toDate,
      }
      return await api.getMaintenancePurchases(effectiveParams, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch purchases'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchPendingPurchases = createAsyncThunk(
  'maintenancePurchases/fetchPending',
  async (params: Omit<api.GetMaintenancePurchasesParams, 'status'> | undefined, thunkApi) => {
    try {
      const queryParams: api.GetMaintenancePurchasesParams = { ...params, status: 'Pending' }
      return await api.getMaintenancePurchases(queryParams, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch pending purchases'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchMaintenancePurchaseById = createAsyncThunk(
  'maintenancePurchases/fetchById',
  async (id: number, thunkApi) => {
    try {
      return await api.getMaintenancePurchaseById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch purchase details'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const addMaintenancePurchase = createAsyncThunk(
  'maintenancePurchases/add',
  async (payload: CreateMaintenancePurchaseRequest, thunkApi) => {
    try {
      const created = await api.createMaintenancePurchase(payload, thunkApi.signal)
      thunkApi.dispatch(fetchPendingPurchases(undefined))
      return created
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to add purchase'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const editMaintenancePurchase = createAsyncThunk(
  'maintenancePurchases/edit',
  async ({ id, payload }: { id: number; payload: UpdateMaintenancePurchaseRequest }, thunkApi) => {
    try {
      const updated = await api.updateMaintenancePurchase(id, payload, thunkApi.signal)
      thunkApi.dispatch(fetchPendingPurchases(undefined))
      return updated
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to edit purchase'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const removeMaintenancePurchase = createAsyncThunk(
  'maintenancePurchases/remove',
  async (id: number, thunkApi) => {
    try {
      await api.deleteMaintenancePurchase(id, thunkApi.signal)
      thunkApi.dispatch(fetchPendingPurchases(undefined))
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to remove purchase'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const changeMaintenancePurchaseStatus = createAsyncThunk(
  'maintenancePurchases/changeStatus',
  async (
    { id, statusAction, previousStatus }: { id: number; statusAction: PurchaseStatusAction; previousStatus: PurchaseStatus },
    thunkApi
  ) => {
    try {
      await api.updateMaintenancePurchaseStatus(id, statusAction, thunkApi.signal)
      thunkApi.dispatch(fetchPendingPurchases(undefined))
      return { id, statusAction }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to change purchase status'
      return thunkApi.rejectWithValue({ message, id, previousStatus })
    }
  }
)

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const maintenancePurchasesSlice = createSlice({
  name: 'maintenancePurchases',
  initialState,
  reducers: {
    clearPurchaseError(state) {
      state.error = undefined
    },
    clearSelectedItem(state) {
      state.selectedItem = undefined
    },
    setFilters(state, action: { payload: Partial<api.GetMaintenancePurchasesParams> }) {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters(state) {
      state.filters = { pageNumber: 1, pageSize: 10 }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchMaintenancePurchases.pending, (state) => {
        state.fetchStatus = 'loading'
        state.error = undefined
      })
      .addCase(fetchMaintenancePurchases.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded'
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

        state.items = itemsList.map((item: any) => ({
          id: item.id != null ? Number(item.id) : 0,
          requiredDate: item.requiredDate || new Date().toISOString(),
          reason: item.reason || '',
          status: item.status || 'Pending',
          itemCount: item.itemCount ?? (Array.isArray(item.items) ? item.items.length : 1),
          createdAt: item.createdAt || new Date().toISOString(),
          createdBy: item.createdBy,
          createdByName: item.createdByName,
        }))

        state.totalCount = raw?.totalCount ?? raw?.TotalCount ?? raw?.data?.totalCount ?? state.items.length
        state.pageNumber = raw?.pageNumber || raw?.PageNumber || state.pageNumber || 1
        state.pageSize = raw?.pageSize || raw?.PageSize || state.pageSize || 10
        state.totalPages = raw?.totalPages || raw?.TotalPages || (Math.ceil(state.totalCount / state.pageSize) || 1)
        state.hasPreviousPage = state.pageNumber > 1
        state.hasNextPage = state.pageNumber < state.totalPages
        state.filters.pageNumber = state.pageNumber
        state.filters.pageSize = state.pageSize
      })
      .addCase(fetchMaintenancePurchases.rejected, (state, action) => {
        state.fetchStatus = 'failed'
        state.error = action.payload as string
      })

      // Fetch Pending
      .addCase(fetchPendingPurchases.pending, (state) => {
        state.pendingFetchStatus = 'loading'
        state.error = undefined
      })
      .addCase(fetchPendingPurchases.fulfilled, (state, action) => {
        state.pendingFetchStatus = 'succeeded'
        const raw = action.payload as any
        let pendingList: any[] = []
        if (Array.isArray(raw)) {
          pendingList = raw
        } else if (raw && Array.isArray(raw.items)) {
          pendingList = raw.items
        } else if (raw && Array.isArray(raw.Items)) {
          pendingList = raw.Items
        } else if (raw?.data && Array.isArray(raw.data.items)) {
          pendingList = raw.data.items
        } else if (raw?.data && Array.isArray(raw.data)) {
          pendingList = raw.data
        }
        state.pendingItems = pendingList.map((item: any) => ({
          id: item.id != null ? Number(item.id) : 0,
          requiredDate: item.requiredDate || new Date().toISOString(),
          reason: item.reason || '',
          status: item.status || 'Pending',
          itemCount: item.itemCount ?? (Array.isArray(item.items) ? item.items.length : 1),
          createdAt: item.createdAt || new Date().toISOString(),
          createdBy: item.createdBy,
          createdByName: item.createdByName,
        }))
      })
      .addCase(fetchPendingPurchases.rejected, (state, action) => {
        state.pendingFetchStatus = 'failed'
        state.error = action.payload as string
      })

      // Fetch By Id
      .addCase(fetchMaintenancePurchaseById.pending, (state) => {
        state.fetchDetailsStatus = 'loading'
        state.error = undefined
      })
      .addCase(fetchMaintenancePurchaseById.fulfilled, (state, action) => {
        state.fetchDetailsStatus = 'succeeded'
        const raw = action.payload as any
        state.selectedItem = (raw?.data ?? raw?.Data ?? raw) as any
      })
      .addCase(fetchMaintenancePurchaseById.rejected, (state, action) => {
        state.fetchDetailsStatus = 'failed'
        state.error = action.payload as string
      })

      // Add / Create
      .addCase(addMaintenancePurchase.pending, (state) => {
        state.createStatus = 'loading'
        state.error = undefined
      })
      .addCase(addMaintenancePurchase.fulfilled, (state, action) => {
        state.createStatus = 'succeeded'
        const raw = action.payload as any
        const p = (raw?.data ?? raw?.Data ?? raw) as any
        if (p && p.id != null) {
          const newItem: MaintenancePurchaseSummary = {
            id: Number(p.id),
            requiredDate: p.requiredDate || new Date().toISOString(),
            reason: p.reason || '',
            status: p.status || 'Pending',
            itemCount: Array.isArray(p.items) ? p.items.length : (p.itemCount ?? 1),
            createdAt: p.createdAt || new Date().toISOString(),
            createdBy: p.createdBy,
            createdByName: p.createdByName,
          }
          const exists = state.items.some((i) => i.id === newItem.id)
          if (!exists) {
            state.items.unshift(newItem)
            state.totalCount += 1
          }
        }
      })
      .addCase(addMaintenancePurchase.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.error = action.payload as string
      })

      // Edit / Update
      .addCase(editMaintenancePurchase.pending, (state) => {
        state.updateStatus = 'loading'
        state.error = undefined
      })
      .addCase(editMaintenancePurchase.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded'
        if (action.payload) {
          const p = action.payload as any
          const idx = state.items.findIndex((i) => i.id === p.id)
          if (idx !== -1) {
            state.items[idx] = {
              ...state.items[idx],
              requiredDate: p.requiredDate ?? state.items[idx].requiredDate,
              reason: p.reason ?? state.items[idx].reason,
              status: p.status ?? state.items[idx].status,
              itemCount: p.items?.length ?? state.items[idx].itemCount,
            }
          }
          if (state.selectedItem?.id === p.id) {
            state.selectedItem = p
          }
        }
      })
      .addCase(editMaintenancePurchase.rejected, (state, action) => {
        state.updateStatus = 'failed'
        state.error = action.payload as string
      })

      // Remove / Delete
      .addCase(removeMaintenancePurchase.pending, (state) => {
        state.deleteStatus = 'loading'
        state.error = undefined
      })
      .addCase(removeMaintenancePurchase.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded'
        const id = action.payload
        state.items = state.items.filter((i) => i.id !== id)
        state.pendingItems = state.pendingItems.filter((i) => i.id !== id)
        state.totalCount = Math.max(0, state.totalCount - 1)
        if (state.selectedItem?.id === id) {
          state.selectedItem = undefined
        }
      })
      .addCase(removeMaintenancePurchase.rejected, (state, action) => {
        state.deleteStatus = 'failed'
        state.error = action.payload as string
      })

      // Status Change (Optimistic Update)
      .addCase(changeMaintenancePurchaseStatus.pending, (state, action) => {
        state.statusChangeStatus = 'loading'
        state.error = undefined

        const id = action.meta.arg.id
        const statusAction = action.meta.arg.statusAction
        const newStatus = getNextStatusForAction(statusAction)

        const item = state.items.find((i) => i.id === id)
        if (item) item.status = newStatus

        const pendingItem = state.pendingItems.find((i) => i.id === id)
        if (pendingItem) pendingItem.status = newStatus

        if (state.selectedItem && state.selectedItem.id === id) {
          state.selectedItem.status = newStatus
        }
      })
      .addCase(changeMaintenancePurchaseStatus.fulfilled, (state) => {
        state.statusChangeStatus = 'succeeded'
      })
      .addCase(changeMaintenancePurchaseStatus.rejected, (state, action: any) => {
        state.statusChangeStatus = 'failed'
        state.error = action.payload?.message || 'Failed to change status'

        if (action.payload) {
          const { id, previousStatus } = action.payload

          const item = state.items.find((i) => i.id === id)
          if (item) item.status = previousStatus

          const pendingItem = state.pendingItems.find((i) => i.id === id)
          if (pendingItem) pendingItem.status = previousStatus

          if (state.selectedItem && state.selectedItem.id === id) {
            state.selectedItem.status = previousStatus
          }
        }
      })
  },
})

export const { clearPurchaseError, clearSelectedItem, setFilters, resetFilters } = maintenancePurchasesSlice.actions
export const maintenancePurchasesReducer = maintenancePurchasesSlice.reducer