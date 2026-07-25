import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/OptionalReservation'
import type {
  OptionalReservationListItem,
  OptionalReservationListResponse,
  OptionalReservationDetail,
  OptionalReservationFilters,
  CreateOptionalReservationRequest,
  UpdateOptionalReservationRequest,
  ExtendExpiryRequest,
  DeleteOptionalReservationRequest,
  ConvertOptionalReservationRequest,
  ConversionPreviewResponse,
} from '../../models/OptionalReservation'

interface OptionalReservationsState {
  list: OptionalReservationListItem[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  selectedDetail: OptionalReservationDetail | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  actionStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | undefined
  actionError: string | undefined
  // Keep a copy of the last used filters so we can refresh after mutations
  lastFilters: OptionalReservationFilters
}

const initialState: OptionalReservationsState = {
  list: [],
  totalCount: 0,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  selectedDetail: null,
  status: 'idle',
  detailStatus: 'idle',
  actionStatus: 'idle',
  error: undefined,
  actionError: undefined,
  lastFilters: {},
}

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchOptionalReservationsList = createAsyncThunk(
  'optionalReservations/fetchList',
  async (filters: OptionalReservationFilters = {}, thunkApi) => {
    try {
      return await api.getOptionalReservationsList(filters, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch optional reservations'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchOptionalReservationDetail = createAsyncThunk(
  'optionalReservations/fetchDetail',
  async (id: string, thunkApi) => {
    try {
      return await api.getOptionalReservationById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch reservation detail'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createOptionalReservation = createAsyncThunk(
  'optionalReservations/create',
  async (data: CreateOptionalReservationRequest, thunkApi) => {
    try {
      await api.createOptionalReservation(data)
      const state = (thunkApi.getState() as any).optionalReservations as OptionalReservationsState
      return await api.getOptionalReservationsList(state.lastFilters)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create optional reservation'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateOptionalReservation = createAsyncThunk(
  'optionalReservations/update',
  async ({ id, data }: { id: string; data: UpdateOptionalReservationRequest }, thunkApi) => {
    try {
      const detail = await api.updateOptionalReservation(id, data)
      const state = (thunkApi.getState() as any).optionalReservations as OptionalReservationsState
      const list = await api.getOptionalReservationsList(state.lastFilters)
      return { detail, list }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update optional reservation'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const deleteOptionalReservation = createAsyncThunk(
  'optionalReservations/delete',
  async ({ id, body }: { id: string; body: DeleteOptionalReservationRequest }, thunkApi) => {
    try {
      await api.deleteOptionalReservation(id, body)
      const state = (thunkApi.getState() as any).optionalReservations as OptionalReservationsState
      return await api.getOptionalReservationsList(state.lastFilters)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete optional reservation'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const extendOptionalReservationExpiry = createAsyncThunk(
  'optionalReservations/extendExpiry',
  async ({ id, data }: { id: string; data: ExtendExpiryRequest }, thunkApi) => {
    try {
      await api.extendOptionalReservationExpiry(id, data)
      const state = (thunkApi.getState() as any).optionalReservations as OptionalReservationsState
      const [detail, list] = await Promise.all([
        api.getOptionalReservationById(id),
        api.getOptionalReservationsList(state.lastFilters),
      ])
      return { detail, list }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to extend expiry'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// Legacy thunks kept so existing code doesn't break
export const fetchOptionalReservations = fetchOptionalReservationsList
export const confirmOptionalReservation = createAsyncThunk(
  'optionalReservations/confirm',
  async (id: string, thunkApi) => {
    try {
      await api.confirmOptionalReservation(id)
      const state = (thunkApi.getState() as any).optionalReservations as OptionalReservationsState
      return await api.getOptionalReservationsList(state.lastFilters)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to confirm optional reservation'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const previewOptionalReservationConversionThunk = createAsyncThunk(
  'optionalReservations/previewConversion',
  async ({ id, data }: { id: string; data: ConvertOptionalReservationRequest }, thunkApi) => {
    try {
      return await api.previewOptionalReservationConversion(id, data)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to preview conversion'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const convertOptionalReservationThunk = createAsyncThunk(
  'optionalReservations/convert',
  async ({ id, data }: { id: string; data: ConvertOptionalReservationRequest }, thunkApi) => {
    try {
      await api.convertOptionalReservation(id, data)
      const state = (thunkApi.getState() as any).optionalReservations as OptionalReservationsState
      return await api.getOptionalReservationsList(state.lastFilters)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to convert optional reservation'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const applyListResponse = (
  state: OptionalReservationsState,
  payload: OptionalReservationListResponse
) => {
  state.list = payload.items
  state.totalCount = payload.totalCount
  state.page = payload.page
  state.pageSize = payload.pageSize
  state.totalPages = payload.totalPages
}

const optionalReservationsSlice = createSlice({
  name: 'optionalReservations',
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined
      state.actionError = undefined
    },
    clearDetail(state) {
      state.selectedDetail = null
      state.detailStatus = 'idle'
    },
    clearActionStatus(state) {
      state.actionStatus = 'idle'
      state.actionError = undefined
    },
  },
  extraReducers: (builder) => {
    // ── fetchList ──────────────────────────────────────────────────────────
    builder
      .addCase(fetchOptionalReservationsList.pending, (state, action) => {
        state.status = 'loading'
        state.error = undefined
        state.lastFilters = action.meta.arg ?? {}
      })
      .addCase(fetchOptionalReservationsList.fulfilled, (state, action) => {
        state.status = 'succeeded'
        applyListResponse(state, action.payload as OptionalReservationListResponse)
      })
      .addCase(fetchOptionalReservationsList.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

    // ── fetchDetail ────────────────────────────────────────────────────────
    builder
      .addCase(fetchOptionalReservationDetail.pending, (state) => {
        state.detailStatus = 'loading'
      })
      .addCase(fetchOptionalReservationDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.selectedDetail = action.payload as OptionalReservationDetail
      })
      .addCase(fetchOptionalReservationDetail.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

    // ── create ─────────────────────────────────────────────────────────────
    builder
      .addCase(createOptionalReservation.pending, (state) => {
        state.actionStatus = 'loading'
      })
      .addCase(createOptionalReservation.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        applyListResponse(state, action.payload as OptionalReservationListResponse)
      })
      .addCase(createOptionalReservation.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.actionError = (action.payload as string | undefined) ?? action.error.message
      })

    // ── update ─────────────────────────────────────────────────────────────
    builder
      .addCase(updateOptionalReservation.pending, (state) => {
        state.actionStatus = 'loading'
      })
      .addCase(updateOptionalReservation.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        const { detail, list } = action.payload as { detail: OptionalReservationDetail; list: OptionalReservationListResponse }
        state.selectedDetail = detail
        applyListResponse(state, list)
      })
      .addCase(updateOptionalReservation.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.actionError = (action.payload as string | undefined) ?? action.error.message
      })

    // ── delete ─────────────────────────────────────────────────────────────
    builder
      .addCase(deleteOptionalReservation.pending, (state) => {
        state.actionStatus = 'loading'
      })
      .addCase(deleteOptionalReservation.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.selectedDetail = null
        applyListResponse(state, action.payload as OptionalReservationListResponse)
      })
      .addCase(deleteOptionalReservation.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.actionError = (action.payload as string | undefined) ?? action.error.message
      })

    // ── extendExpiry ───────────────────────────────────────────────────────
    builder
      .addCase(extendOptionalReservationExpiry.pending, (state) => {
        state.actionStatus = 'loading'
      })
      .addCase(extendOptionalReservationExpiry.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        const { detail, list } = action.payload as { detail: OptionalReservationDetail; list: OptionalReservationListResponse }
        state.selectedDetail = detail
        applyListResponse(state, list)
      })
      .addCase(extendOptionalReservationExpiry.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.actionError = (action.payload as string | undefined) ?? action.error.message
      })

    // ── confirm (legacy) ───────────────────────────────────────────────────
    builder
      .addCase(confirmOptionalReservation.fulfilled, (state, action) => {
        state.status = 'succeeded'
        applyListResponse(state, action.payload as OptionalReservationListResponse)
      })

    // ── convert ────────────────────────────────────────────────────────────
    builder
      .addCase(convertOptionalReservationThunk.pending, (state) => {
        state.actionStatus = 'loading'
      })
      .addCase(convertOptionalReservationThunk.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.selectedDetail = null
        applyListResponse(state, action.payload as OptionalReservationListResponse)
      })
      .addCase(convertOptionalReservationThunk.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.actionError = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearError, clearDetail, clearActionStatus } = optionalReservationsSlice.actions
export const optionalReservationsReducer = optionalReservationsSlice.reducer
