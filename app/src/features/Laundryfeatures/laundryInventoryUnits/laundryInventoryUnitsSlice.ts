import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type {
  LaundryInventoryUnitReadDto,
  LaundryInventoryUnitCreateDto,
  LaundryInventoryUnitUpdateDto,
} from '../../../models/Laundrymodels/LaundryInventoryUnit'
import * as api from '../../../shared/Laundryshared/api/laundryInventoryUnitsApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type LaundryInventoryUnitsState = {
  units: LaundryInventoryUnitReadDto[]
  selectedUnit: LaundryInventoryUnitReadDto | null
  status: AsyncStatus
  error?: string
}

const initialState: LaundryInventoryUnitsState = {
  units: [],
  selectedUnit: null,
  status: 'idle',
  error: undefined,
}

// GET /api/laundry/inventory/units
export const fetchLaundryInventoryUnits = createAsyncThunk(
  'laundryInventoryUnits/fetchAll',
  async (_, thunkApi) => {
    try {
      return await api.getLaundryInventoryUnits(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load units'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// POST /api/laundry/inventory/units
export const createLaundryInventoryUnit = createAsyncThunk(
  'laundryInventoryUnits/create',
  async (payload: LaundryInventoryUnitCreateDto, thunkApi) => {
    try {
      return await api.createLaundryInventoryUnit(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create unit'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// GET /api/laundry/inventory/units/{id}
export const fetchLaundryInventoryUnitById = createAsyncThunk(
  'laundryInventoryUnits/fetchById',
  async (id: number, thunkApi) => {
    try {
      return await api.getLaundryInventoryUnitById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load unit'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// PUT /api/laundry/inventory/units/{id}
export const updateLaundryInventoryUnit = createAsyncThunk(
  'laundryInventoryUnits/update',
  async ({ id, payload }: { id: number; payload: LaundryInventoryUnitUpdateDto }, thunkApi) => {
    try {
      return await api.updateLaundryInventoryUnit(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update unit'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// DELETE /api/laundry/inventory/units/{id}
export const deleteLaundryInventoryUnit = createAsyncThunk(
  'laundryInventoryUnits/delete',
  async (id: number, thunkApi) => {
    try {
      await api.deleteLaundryInventoryUnit(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete unit'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const laundryInventoryUnitsSlice = createSlice({
  name: 'laundryInventoryUnits',
  initialState,
  reducers: {
    clearLaundryInventoryUnitsError(state) {
      state.error = undefined
    },
    clearSelectedUnit(state) {
      state.selectedUnit = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchLaundryInventoryUnits.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchLaundryInventoryUnits.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.units = action.payload
      })
      .addCase(fetchLaundryInventoryUnits.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createLaundryInventoryUnit.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createLaundryInventoryUnit.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.units.push(action.payload)
      })
      .addCase(createLaundryInventoryUnit.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchById
      .addCase(fetchLaundryInventoryUnitById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchLaundryInventoryUnitById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selectedUnit = action.payload
      })
      .addCase(fetchLaundryInventoryUnitById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateLaundryInventoryUnit.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateLaundryInventoryUnit.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.units.findIndex((u) => u.id === action.payload.id)
        if (index !== -1) state.units[index] = action.payload
        if (state.selectedUnit?.id === action.payload.id) state.selectedUnit = action.payload
      })
      .addCase(updateLaundryInventoryUnit.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteLaundryInventoryUnit.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteLaundryInventoryUnit.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.units = state.units.filter((u) => u.id !== action.payload)
        if (state.selectedUnit?.id === action.payload) state.selectedUnit = null
      })
      .addCase(deleteLaundryInventoryUnit.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearLaundryInventoryUnitsError, clearSelectedUnit } = laundryInventoryUnitsSlice.actions

export const laundryInventoryUnitsReducer = laundryInventoryUnitsSlice.reducer
