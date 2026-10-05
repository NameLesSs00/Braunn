import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { restaurantUnitsApi } from '../../shared/apis/restaurantUnitsApi'
import { RestaurantUnit, CreateRestaurantUnitRequest, UpdateRestaurantUnitRequest } from '../../models/RestaurantUnit'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type RestaurantUnitsState = {
  items: RestaurantUnit[]
  totalCount: number
  status: AsyncStatus
  error?: string
}

const initialState: RestaurantUnitsState = {
  items: [],
  totalCount: 0,
  status: 'idle',
}

export const fetchRestaurantUnits = createAsyncThunk(
  'restaurantUnits/fetchAll',
  async (params: { search?: string; isActive?: boolean; pageNumber?: number; pageSize?: number } | void, thunkApi) => {
    try {
      return await restaurantUnitsApi.getAll(params || undefined, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch restaurant units'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createRestaurantUnit = createAsyncThunk(
  'restaurantUnits/create',
  async (data: CreateRestaurantUnitRequest, thunkApi) => {
    try {
      return await restaurantUnitsApi.create(data, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create restaurant unit'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateRestaurantUnit = createAsyncThunk(
  'restaurantUnits/update',
  async ({ id, data }: { id: number; data: UpdateRestaurantUnitRequest }, thunkApi) => {
    try {
      return await restaurantUnitsApi.update(id, data, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update restaurant unit'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const toggleRestaurantUnitStatus = createAsyncThunk(
  'restaurantUnits/toggleStatus',
  async ({ id, activate }: { id: number; activate: boolean }, thunkApi) => {
    try {
      if (activate) {
        await restaurantUnitsApi.activate(id, thunkApi.signal)
      } else {
        await restaurantUnitsApi.deactivate(id, thunkApi.signal)
      }
      return { id, isActive: activate }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to toggle unit status'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const restaurantUnitsSlice = createSlice({
  name: 'restaurantUnits',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchRestaurantUnits.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchRestaurantUnits.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchRestaurantUnits.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      // Create
      .addCase(createRestaurantUnit.fulfilled, (state, action) => {
        // Option 1: push directly, though typically handled by re-fetching
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      // Update
      .addCase(updateRestaurantUnit.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      // Toggle status
      .addCase(toggleRestaurantUnitStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index].isActive = action.payload.isActive
        }
      })
  },
})

export const restaurantUnitsReducer = restaurantUnitsSlice.reducer
