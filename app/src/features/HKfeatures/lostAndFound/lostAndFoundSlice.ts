import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type {
  LostAndFoundReadDto,
  LostAndFoundCreateDto,
  LostAndFoundUpdateDto,
  LostAndFoundQueryParams,
  PaginatedLostAndFound,
} from '../../../models/HKmodels/LostAndFound'
import * as api from '../../../shared/HKshared/api/lostAndFoundApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type LostAndFoundState = {
  items: LostAndFoundReadDto[]
  selectedItem: LostAndFoundReadDto | null
  totalCount: number
  pageNumber: number
  pageSize: number
  status: AsyncStatus
  error?: string
}

const initialState: LostAndFoundState = {
  items: [],
  selectedItem: null,
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  status: 'idle',
  error: undefined,
}

// GET /api/lost-found
export const fetchLostAndFoundItems = createAsyncThunk<
  PaginatedLostAndFound,
  LostAndFoundQueryParams | undefined
>('lostAndFound/fetchAll', async (params, thunkApi) => {
  try {
    return await api.getLostAndFound(params, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load lost & found items'
    return thunkApi.rejectWithValue(message)
  }
})

// POST /api/lost-found
export const createLostAndFoundItem = createAsyncThunk<LostAndFoundReadDto, LostAndFoundCreateDto>(
  'lostAndFound/create',
  async (payload, thunkApi) => {
    try {
      return await api.createLostAndFound(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create item'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// GET /api/lost-found/{id}
export const fetchLostAndFoundById = createAsyncThunk<LostAndFoundReadDto, number>(
  'lostAndFound/fetchById',
  async (id, thunkApi) => {
    try {
      return await api.getLostAndFoundById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load item'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// PUT /api/lost-found/{id}
export const updateLostAndFoundItem = createAsyncThunk<
  LostAndFoundReadDto,
  { id: number; payload: LostAndFoundUpdateDto }
>('lostAndFound/update', async ({ id, payload }, thunkApi) => {
  try {
    return await api.updateLostAndFound(id, payload, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update item'
    return thunkApi.rejectWithValue(message)
  }
})

// DELETE /api/lost-found/{id}
export const deleteLostAndFoundItem = createAsyncThunk<number, number>(
  'lostAndFound/delete',
  async (id, thunkApi) => {
    try {
      await api.deleteLostAndFound(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete item'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// POST /api/lost-found/lost/{id}/claim
export const claimLostItem = createAsyncThunk<LostAndFoundReadDto, { id: number; employeeId: string }>(
  'lostAndFound/claimLost',
  async ({ id, employeeId }, thunkApi) => {
    try {
      return await api.claimLostItem(id, employeeId, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to claim lost item'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// POST /api/lost-found/found/{id}/claim
export const claimFoundItem = createAsyncThunk<LostAndFoundReadDto, { id: number; guestId: string }>(
  'lostAndFound/claimFound',
  async ({ id, guestId }, thunkApi) => {
    try {
      return await api.claimFoundItem(id, guestId, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to claim found item'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const lostAndFoundSlice = createSlice({
  name: 'lostAndFound',
  initialState,
  reducers: {
    clearLostAndFoundError(state) {
      state.error = undefined
    },
    clearSelectedLostAndFoundItem(state) {
      state.selectedItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchLostAndFoundItems.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchLostAndFoundItems.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
        state.pageNumber = action.payload.pageNumber
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchLostAndFoundItems.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createLostAndFoundItem.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createLostAndFoundItem.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createLostAndFoundItem.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchById
      .addCase(fetchLostAndFoundById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchLostAndFoundById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selectedItem = action.payload
      })
      .addCase(fetchLostAndFoundById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateLostAndFoundItem.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateLostAndFoundItem.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.items.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        if (state.selectedItem?.id === action.payload.id) state.selectedItem = action.payload
      })
      .addCase(updateLostAndFoundItem.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteLostAndFoundItem.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteLostAndFoundItem.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((c) => c.id !== action.payload)
        if (state.selectedItem?.id === action.payload) state.selectedItem = null
        state.totalCount -= 1
      })
      .addCase(deleteLostAndFoundItem.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // claimLost
      .addCase(claimLostItem.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(claimLostItem.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.items.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        if (state.selectedItem?.id === action.payload.id) state.selectedItem = action.payload
      })
      .addCase(claimLostItem.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // claimFound
      .addCase(claimFoundItem.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(claimFoundItem.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.items.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        if (state.selectedItem?.id === action.payload.id) state.selectedItem = action.payload
      })
      .addCase(claimFoundItem.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearLostAndFoundError, clearSelectedLostAndFoundItem } = lostAndFoundSlice.actions

export const lostAndFoundReducer = lostAndFoundSlice.reducer
