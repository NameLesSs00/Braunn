import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/corporateCancellationPoliciesApi'
import type { 
  CorporateCancellationPolicy, 
  CreateCorporateCancellationPolicyDto, 
  UpdateCorporateCancellationPolicyDto 
} from '../../models/CorporateCancellationPolicy'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface CorporateCancellationPoliciesState {
  items: CorporateCancellationPolicy[]
  status: AsyncStatus
  error?: string
}

const initialState: CorporateCancellationPoliciesState = {
  items: [],
  status: 'idle',
}

export const fetchCorporateCancellationPolicies = createAsyncThunk(
  'corporateCancellationPolicies/fetchAll',
  async (params: api.GetCorporateCancellationPoliciesParams | undefined, thunkApi) => {
    try {
      return await api.getCorporateCancellationPolicies(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch policies'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createCorporateCancellationPolicy = createAsyncThunk(
  'corporateCancellationPolicies/create',
  async (data: CreateCorporateCancellationPolicyDto, thunkApi) => {
    try {
      return await api.createCorporateCancellationPolicy(data, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create policy'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateCorporateCancellationPolicy = createAsyncThunk(
  'corporateCancellationPolicies/update',
  async ({ id, data }: { id: number; data: UpdateCorporateCancellationPolicyDto }, thunkApi) => {
    try {
      return await api.updateCorporateCancellationPolicy(id, data, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update policy'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const activateCorporateCancellationPolicy = createAsyncThunk(
  'corporateCancellationPolicies/activate',
  async (id: number, thunkApi) => {
    try {
      return await api.activateCorporateCancellationPolicy(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to activate policy'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const deactivateCorporateCancellationPolicy = createAsyncThunk(
  'corporateCancellationPolicies/deactivate',
  async (id: number, thunkApi) => {
    try {
      return await api.deactivateCorporateCancellationPolicy(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to deactivate policy'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const slice = createSlice({
  name: 'corporateCancellationPolicies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCorporateCancellationPolicies.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchCorporateCancellationPolicies.fulfilled, (state, action: PayloadAction<CorporateCancellationPolicy[]>) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchCorporateCancellationPolicies.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      // Create
      .addCase(createCorporateCancellationPolicy.fulfilled, (state, action: PayloadAction<CorporateCancellationPolicy>) => {
        state.items.push(action.payload)
      })
      // Update
      .addCase(updateCorporateCancellationPolicy.fulfilled, (state, action: PayloadAction<CorporateCancellationPolicy>) => {
        const idx = state.items.findIndex(p => p.id === action.payload.id)
        if (idx !== -1) {
          state.items[idx] = action.payload
        }
      })
      // Activate
      .addCase(activateCorporateCancellationPolicy.fulfilled, (state, action: PayloadAction<CorporateCancellationPolicy>) => {
        const idx = state.items.findIndex(p => p.id === action.payload.id)
        if (idx !== -1) {
          state.items[idx] = action.payload
        }
      })
      // Deactivate
      .addCase(deactivateCorporateCancellationPolicy.fulfilled, (state, action: PayloadAction<CorporateCancellationPolicy>) => {
        const idx = state.items.findIndex(p => p.id === action.payload.id)
        if (idx !== -1) {
          state.items[idx] = action.payload
        }
      })
  },
})

export const corporateCancellationPoliciesReducer = slice.reducer
