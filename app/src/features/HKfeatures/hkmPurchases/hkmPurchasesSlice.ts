import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  HkmPurchaseReadDto,
  HkmPurchaseCreateDto,
  HkmPurchaseUpdateDto,
  HkmPurchasesParams,
  HkmPurchaseStatusAction,
  HkmPurchaseStatus,
} from '../../../models/HKmodels/HkmPurchase'
import { getNextHkmStatusForAction } from '../../../models/HKmodels/HkmPurchase'
import * as api from '../../../shared/HKshared/api/hkmPurchasesApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

const PAGE_SIZE = 10

export type HkmPurchasesState = {
  items: HkmPurchaseReadDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  status: AsyncStatus
  createStatus: AsyncStatus
  updateStatus: AsyncStatus
  deleteStatus: AsyncStatus
  statusActionStatus: AsyncStatus
  error?: string
  params: HkmPurchasesParams
}

const initialState: HkmPurchasesState = {
  items: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: PAGE_SIZE,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
  status: 'idle',
  createStatus: 'idle',
  updateStatus: 'idle',
  deleteStatus: 'idle',
  statusActionStatus: 'idle',
  error: undefined,
  params: { PageNumber: 1, PageSize: PAGE_SIZE },
}

export const fetchHkmPurchases = createAsyncThunk(
  'hkmPurchases/fetchAll',
  async (params: HkmPurchasesParams | undefined, thunkApi) => {
    try {
      return await api.getHkmPurchases(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load purchases'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createHkmPurchase = createAsyncThunk(
  'hkmPurchases/create',
  async (payload: HkmPurchaseCreateDto, thunkApi) => {
    try {
      return await api.createHkmPurchase(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create purchase'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateHkmPurchase = createAsyncThunk(
  'hkmPurchases/update',
  async ({ id, payload }: { id: number; payload: HkmPurchaseUpdateDto }, thunkApi) => {
    try {
      return await api.updateHkmPurchase(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update purchase'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const deleteHkmPurchase = createAsyncThunk(
  'hkmPurchases/delete',
  async (id: number, thunkApi) => {
    try {
      await api.deleteHkmPurchase(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete purchase'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const changeHkmPurchaseStatus = createAsyncThunk(
  'hkmPurchases/changeStatus',
  async (
    {
      id,
      action,
      previousStatus,
    }: { id: number; action: HkmPurchaseStatusAction | string; previousStatus?: HkmPurchaseStatus | string },
    thunkApi
  ) => {
    try {
      await api.updateHkmPurchaseStatus(id, action, thunkApi.signal)
      return { id, action }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to change purchase status'
      return thunkApi.rejectWithValue({ message, id, previousStatus })
    }
  }
)

// Backward compatibility
export const markHkmPurchaseAsReceived = createAsyncThunk(
  'hkmPurchases/markAsReceived',
  async (id: number, thunkApi) => {
    try {
      await api.updateHkmPurchaseStatus(id, 'complete', thunkApi.signal)
      return { id, action: 'complete' }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to mark purchase as received'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const hkmPurchasesSlice = createSlice({
  name: 'hkmPurchases',
  initialState,
  reducers: {
    setPurchasesParams(state, action: PayloadAction<Partial<HkmPurchasesParams>>) {
      state.params = { ...state.params, ...action.payload }
    },
    setPurchasesPage(state, action: PayloadAction<number>) {
      state.params.PageNumber = action.payload
      state.pageNumber = action.payload
    },
    setPurchasesStatusFilter(state, action: PayloadAction<string>) {
      state.params.Status = action.payload !== 'All' ? action.payload : undefined
      state.params.PageNumber = 1
    },
    clearPurchasesError(state) {
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchHkmPurchases.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchHkmPurchases.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const res = action.payload
        state.items = res.items
        state.totalCount = res.totalCount
        state.pageNumber = res.pageNumber ?? state.params.PageNumber ?? 1
        state.pageSize = res.pageSize ?? state.params.PageSize ?? PAGE_SIZE
        state.totalPages = res.totalPages ?? (Math.ceil(res.totalCount / (state.pageSize || 10)) || 1)
        state.hasPreviousPage = Boolean(res.hasPreviousPage)
        state.hasNextPage = Boolean(res.hasNextPage)
      })
      .addCase(fetchHkmPurchases.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })

      // create
      .addCase(createHkmPurchase.pending, (state) => {
        state.createStatus = 'loading'
        state.error = undefined
      })
      .addCase(createHkmPurchase.fulfilled, (state, action) => {
        state.createStatus = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createHkmPurchase.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.error = action.payload as string
      })

      // update
      .addCase(updateHkmPurchase.pending, (state) => {
        state.updateStatus = 'loading'
        state.error = undefined
      })
      .addCase(updateHkmPurchase.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded'
        const idx = state.items.findIndex((p) => p.id === action.payload.id)
        if (idx !== -1) {
          state.items[idx] = action.payload
        }
      })
      .addCase(updateHkmPurchase.rejected, (state, action) => {
        state.updateStatus = 'failed'
        state.error = action.payload as string
      })

      // delete
      .addCase(deleteHkmPurchase.pending, (state) => {
        state.deleteStatus = 'loading'
        state.error = undefined
      })
      .addCase(deleteHkmPurchase.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded'
        state.items = state.items.filter((p) => p.id !== action.payload)
        state.totalCount = Math.max(0, state.totalCount - 1)
      })
      .addCase(deleteHkmPurchase.rejected, (state, action) => {
        state.deleteStatus = 'failed'
        state.error = action.payload as string
      })

      // changeStatus
      .addCase(changeHkmPurchaseStatus.pending, (state, action) => {
        state.statusActionStatus = 'loading'
        // Optimistic update
        const { id, action: statusAction } = action.meta.arg
        const item = state.items.find((p) => p.id === id)
        if (item) {
          item.status = getNextHkmStatusForAction(statusAction as HkmPurchaseStatusAction)
        }
      })
      .addCase(changeHkmPurchaseStatus.fulfilled, (state) => {
        state.statusActionStatus = 'succeeded'
      })
      .addCase(changeHkmPurchaseStatus.rejected, (state, action: any) => {
        state.statusActionStatus = 'failed'
        // Rollback on error
        if (action.payload?.id && action.payload?.previousStatus) {
          const item = state.items.find((p) => p.id === action.payload.id)
          if (item) {
            item.status = action.payload.previousStatus
          }
        }
        state.error = action.payload?.message || 'Failed to update status'
      })

      // markAsReceived
      .addCase(markHkmPurchaseAsReceived.fulfilled, (state, action) => {
        const item = state.items.find((p) => p.id === action.payload.id)
        if (item) {
          item.status = 'Completed'
        }
      })
  },
})

export const {
  setPurchasesParams,
  setPurchasesPage,
  setPurchasesStatusFilter,
  clearPurchasesError,
} = hkmPurchasesSlice.actions

export const hkmPurchasesReducer = hkmPurchasesSlice.reducer
export default hkmPurchasesSlice.reducer
