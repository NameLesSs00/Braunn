import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type {
  HkmInventoryUnitReadDto,
  HkmInventoryUnitCreateDto,
  HkmInventoryUnitUpdateDto,
} from '../../../models/HKmodels/HkmInventoryUnit'
import * as api from '../../../shared/HKshared/api/hkmInventoryUnitsApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type HkmInventoryUnitsState = {
  units: HkmInventoryUnitReadDto[]
  selectedUnit: HkmInventoryUnitReadDto | null
  status: AsyncStatus
  error?: string
}

const initialState: HkmInventoryUnitsState = {
  units: [],
  selectedUnit: null,
  status: 'idle',
  error: undefined,
}

// GET /api/hkm/inventory/units
export const fetchHkmInventoryUnits = createAsyncThunk(
  'hkmInventoryUnits/fetchAll',
  async (_, thunkApi) => {
    try {
      return await api.getHkmInventoryUnits(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load inventory units'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// POST /api/hkm/inventory/units
export const createHkmInventoryUnit = createAsyncThunk(
  'hkmInventoryUnits/create',
  async (payload: HkmInventoryUnitCreateDto, thunkApi) => {
    try {
      return await api.createHkmInventoryUnit(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create inventory unit'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// GET /api/hkm/inventory/units/{id}
export const fetchHkmInventoryUnitById = createAsyncThunk(
  'hkmInventoryUnits/fetchById',
  async (id: number, thunkApi) => {
    try {
      return await api.getHkmInventoryUnitById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load inventory unit'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// PUT /api/hkm/inventory/units/{id}
export const updateHkmInventoryUnit = createAsyncThunk(
  'hkmInventoryUnits/update',
  async ({ id, payload }: { id: number; payload: HkmInventoryUnitUpdateDto }, thunkApi) => {
    try {
      return await api.updateHkmInventoryUnit(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update inventory unit'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// DELETE /api/hkm/inventory/units/{id}
export const deleteHkmInventoryUnit = createAsyncThunk(
  'hkmInventoryUnits/delete',
  async (id: number, thunkApi) => {
    try {
      await api.deleteHkmInventoryUnit(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete inventory unit'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const hkmInventoryUnitsSlice = createSlice({
  name: 'hkmInventoryUnits',
  initialState,
  reducers: {
    clearHkmInventoryUnitsError(state) {
      state.error = undefined
    },
    clearSelectedUnit(state) {
      state.selectedUnit = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchHkmInventoryUnits.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchHkmInventoryUnits.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.units = action.payload
      })
      .addCase(fetchHkmInventoryUnits.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createHkmInventoryUnit.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createHkmInventoryUnit.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.units.push(action.payload)
      })
      .addCase(createHkmInventoryUnit.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchById
      .addCase(fetchHkmInventoryUnitById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchHkmInventoryUnitById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selectedUnit = action.payload
      })
      .addCase(fetchHkmInventoryUnitById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateHkmInventoryUnit.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateHkmInventoryUnit.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.units.findIndex((u) => u.id === action.payload.id)
        if (index !== -1) state.units[index] = action.payload
        if (state.selectedUnit?.id === action.payload.id) state.selectedUnit = action.payload
      })
      .addCase(updateHkmInventoryUnit.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteHkmInventoryUnit.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteHkmInventoryUnit.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.units = state.units.filter((u) => u.id !== action.payload)
        if (state.selectedUnit?.id === action.payload) state.selectedUnit = null
      })
      .addCase(deleteHkmInventoryUnit.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearHkmInventoryUnitsError, clearSelectedUnit } = hkmInventoryUnitsSlice.actions

export const hkmInventoryUnitsReducer = hkmInventoryUnitsSlice.reducer
