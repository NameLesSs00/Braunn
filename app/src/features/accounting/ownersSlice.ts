import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Owner, CreateOwnerRequest, UpdateOwnerRequest } from '../../models/Accounting/owner'
import * as api from '../../shared/Accountingshared/ownersApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type OwnersState = {
  items: Owner[]
  status: AsyncStatus
  error?: string
}

const initialState: OwnersState = {
  items: [],
  status: 'idle',
  error: undefined,
}

export const fetchOwners = createAsyncThunk('owners/fetchAll', async (fullName: string | undefined, thunkApi) => {
  try {
    return await api.getOwners(fullName, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch owners'
    return thunkApi.rejectWithValue(message)
  }
})

export const fetchOwnerById = createAsyncThunk('owners/fetchById', async (id: string, thunkApi) => {
  try {
    return await api.getOwnerById(id, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch owner'
    return thunkApi.rejectWithValue(message)
  }
})

export const addOwner = createAsyncThunk('owners/add', async (payload: CreateOwnerRequest, thunkApi) => {
  try {
    return await api.createOwner(payload, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create owner'
    return thunkApi.rejectWithValue(message)
  }
})

export const editOwner = createAsyncThunk(
  'owners/edit',
  async ({ id, payload }: { id: string; payload: UpdateOwnerRequest }, thunkApi) => {
    try {
      await api.updateOwner(id, payload, thunkApi.signal)
      return { id, payload }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update owner'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const deactivateOwner = createAsyncThunk('owners/deactivate', async (id: string, thunkApi) => {
  try {
    return await api.deactivateOwner(id, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to deactivate owner'
    return thunkApi.rejectWithValue(message)
  }
})

export const removeOwner = createAsyncThunk('owners/remove', async (id: string, thunkApi) => {
  try {
    await api.deleteOwner(id, thunkApi.signal)
    return id
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete owner'
    return thunkApi.rejectWithValue(message)
  }
})

const ownersSlice = createSlice({
  name: 'owners',
  initialState,
  reducers: {
    clearOwnersError(state) {
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchOwners
      .addCase(fetchOwners.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchOwners.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchOwners.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      // addOwner
      .addCase(addOwner.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(addOwner.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
      })
      .addCase(addOwner.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      // editOwner
      .addCase(editOwner.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(editOwner.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((x) => x.id === action.payload.id)
        if (idx >= 0) {
          state.items[idx] = { ...state.items[idx], ...action.payload.payload }
        }
      })
      .addCase(editOwner.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      // deactivateOwner
      .addCase(deactivateOwner.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deactivateOwner.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((x) => x.id === action.payload.id)
        if (idx >= 0) {
          state.items[idx] = action.payload
        }
      })
      .addCase(deactivateOwner.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      // removeOwner
      .addCase(removeOwner.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(removeOwner.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((x) => x.id !== action.payload)
      })
      .addCase(removeOwner.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearOwnersError } = ownersSlice.actions
export const ownersReducer = ownersSlice.reducer
