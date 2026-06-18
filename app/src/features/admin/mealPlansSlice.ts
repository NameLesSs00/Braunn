import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/AdminMealPlan'
import type { MealPlan, CreateMealPlanRequest } from '../../models/MealPlan'

interface MealPlansState {
  items: MealPlan[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error?: string
}

const initialState: MealPlansState = {
  items: [],
  status: 'idle',
  error: undefined,
}

export const fetchMealPlans = createAsyncThunk(
  'mealPlans/fetchMealPlans',
  async (_, thunkApi) => {
    try {
      return await api.getMealPlans(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch meal plans'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const addMealPlan = createAsyncThunk(
  'mealPlans/addMealPlan',
  async (data: CreateMealPlanRequest, thunkApi) => {
    try {
      await api.createMealPlan(data)
      return await api.getMealPlans()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create meal plan'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateMealPlan = createAsyncThunk(
  'mealPlans/updateMealPlan',
  async ({ id, data }: { id: string; data: CreateMealPlanRequest }, thunkApi) => {
    try {
      await api.updateMealPlan(id, data)
      return await api.getMealPlans()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update meal plan'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const toggleMealPlanStatus = createAsyncThunk(
  'mealPlans/toggleMealPlanStatus',
  async (id: string, thunkApi) => {
    try {
      await api.toggleMealPlan(id)
      return await api.getMealPlans()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to toggle meal plan'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const mealPlansSlice = createSlice({
  name: 'mealPlans',
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMealPlans.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchMealPlans.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchMealPlans.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
      // We use the same pattern for mutations: refresh the list on success
      .addMatcher(
        (action) => [addMealPlan.fulfilled, updateMealPlan.fulfilled, toggleMealPlanStatus.fulfilled].includes(action.type),
        (state, action) => {
          state.status = 'succeeded'
          state.items = action.payload as MealPlan[]
        }
      )
  },
})

export const { clearError } = mealPlansSlice.actions
export const mealPlansReducer = mealPlansSlice.reducer
