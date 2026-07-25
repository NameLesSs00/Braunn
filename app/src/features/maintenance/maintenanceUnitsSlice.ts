import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { maintenanceUnitsApi } from '../../shared/apis/maintenanceUnitsApi'
import { MaintenanceUnit } from '../../models/MaintenanceUnit'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type MaintenanceUnitsState = {
  items: MaintenanceUnit[]
  totalCount: number
  status: AsyncStatus
  error?: string
}

const initialState: MaintenanceUnitsState = {
  items: [],
  totalCount: 0,
  status: 'idle',
}

export const fetchMaintenanceUnits = createAsyncThunk(
  'maintenanceUnits/fetchAll',
  async (params?: { search?: string; pageNumber?: number; pageSize?: number; sortBy?: string; isDescending?: boolean }, thunkApi) => {
    try {
      return await maintenanceUnitsApi.getAll(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch units'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const maintenanceUnitsSlice = createSlice({
  name: 'maintenanceUnits',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaintenanceUnits.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchMaintenanceUnits.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchMaintenanceUnits.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
  },
})

export const maintenanceUnitsReducer = maintenanceUnitsSlice.reducer
