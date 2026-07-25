import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/maintenancePurchasesApi'
import {
  MaintenancePurchase,
  CreateMaintenancePurchaseRequest,
  UpdateMaintenancePurchaseRequest,
  PurchaseStatus,
  PurchaseStatusAction,
  getNextStatusForAction,
} from '../../models/MaintenancePurchase'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type MaintenancePurchasesState = {
  items: MaintenancePurchase[]
  pendingItems: MaintenancePurchase[]
  selectedItem?: MaintenancePurchase
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean

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
      return await api.getMaintenancePurchases(params, thunkApi.signal)
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
      thunkApi.dispatch(fetchMaintenancePurchases(undefined))
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
      thunkApi.dispatch(fetchMaintenancePurchases(undefined))
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
      thunkApi.dispatch(fetchMaintenancePurchases(undefined))
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
      thunkApi.dispatch(fetchMaintenancePurchases(undefined))
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
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
        state.pageNumber = action.payload.pageNumber
        state.pageSize = action.payload.pageSize
        state.totalPages = action.payload.totalPages
        state.hasPreviousPage = action.payload.hasPreviousPage
        state.hasNextPage = action.payload.hasNextPage
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
        state.pendingItems = action.payload.items
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
        state.selectedItem = action.payload
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
      .addCase(addMaintenancePurchase.fulfilled, (state) => {
        state.createStatus = 'succeeded'
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
      .addCase(editMaintenancePurchase.fulfilled, (state) => {
        state.updateStatus = 'succeeded'
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
      .addCase(removeMaintenancePurchase.fulfilled, (state) => {
        state.deleteStatus = 'succeeded'
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

export const { clearPurchaseError, clearSelectedItem } = maintenancePurchasesSlice.actions
export const maintenancePurchasesReducer = maintenancePurchasesSlice.reducer