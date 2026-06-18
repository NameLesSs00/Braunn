import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  HkmPurchaseReadDto,
  HkmPurchaseCreateDto,
  HkmPurchaseUpdateDto,
  HkmPurchasesParams,
} from '../../../models/HKmodels/HkmPurchase'
import * as api from '../../../shared/HKshared/api/hkmPurchasesApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

const PAGE_SIZE = 10

type HkmPurchasesState = {
  items: HkmPurchaseReadDto[]
  totalCount: number
  status: AsyncStatus
  error?: string
  params: HkmPurchasesParams
}

const initialState: HkmPurchasesState = {
  items: [],
  totalCount: 0,
  status: 'idle',
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

export const markHkmPurchaseAsReceived = createAsyncThunk(
  'hkmPurchases/markAsReceived',
  async (id: number, thunkApi) => {
    try {
      return await api.markPurchaseAsReceived(id, thunkApi.signal)
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
    },
    setPurchasesSupplierFilter(state, action: PayloadAction<string>) {
      state.params.SupplierName = action.payload
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
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchHkmPurchases.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createHkmPurchase.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createHkmPurchase.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createHkmPurchase.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateHkmPurchase.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateHkmPurchase.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(updateHkmPurchase.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteHkmPurchase.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteHkmPurchase.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((i) => i.id !== action.payload)
        state.totalCount -= 1
      })
      .addCase(deleteHkmPurchase.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // markAsReceived
      .addCase(markHkmPurchaseAsReceived.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(markHkmPurchaseAsReceived.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(markHkmPurchaseAsReceived.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const {
  setPurchasesParams,
  setPurchasesPage,
  setPurchasesSupplierFilter,
  clearPurchasesError,
} = hkmPurchasesSlice.actions

export const hkmPurchasesReducer = hkmPurchasesSlice.reducer
