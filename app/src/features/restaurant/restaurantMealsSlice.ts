import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { restaurantMealsApi, type RestaurantMealsQuery } from '../../shared/apis/restaurantMealsApi'
import type {
  CreateRestaurantMealRequest,
  RestaurantMeal,
  UpdateRestaurantMealRequest,
} from '../../models/RestaurantMeal'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type RestaurantMealsState = {
  items: RestaurantMeal[]
  selected: RestaurantMeal | null
  totalCount: number
  totalPages: number
  pageNumber: number
  pageSize: number
  status: AsyncStatus
  selectedStatus: AsyncStatus
  mutationStatus: AsyncStatus
  error?: string
  selectedError?: string
  mutationError?: string
}

const initialState: RestaurantMealsState = {
  items: [],
  selected: null,
  totalCount: 0,
  totalPages: 0,
  pageNumber: 1,
  pageSize: 20,
  status: 'idle',
  selectedStatus: 'idle',
  mutationStatus: 'idle',
}

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export const fetchRestaurantMeals = createAsyncThunk(
  'restaurantMeals/fetchAll',
  async (params: RestaurantMealsQuery | void, thunkApi) => {
    try {
      return await restaurantMealsApi.getAll(params || undefined, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch restaurant meals'))
    }
  },
)

export const fetchRestaurantMeal = createAsyncThunk('restaurantMeals/fetchById', async (id: number, thunkApi) => {
  try {
    return await restaurantMealsApi.getById(id, thunkApi.signal)
  } catch (e) {
    return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch restaurant meal'))
  }
})

export const createRestaurantMeal = createAsyncThunk(
  'restaurantMeals/create',
  async (data: CreateRestaurantMealRequest, thunkApi) => {
    try {
      return await restaurantMealsApi.create(data, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to create restaurant meal'))
    }
  },
)

export const updateRestaurantMeal = createAsyncThunk(
  'restaurantMeals/update',
  async ({ id, data }: { id: number; data: UpdateRestaurantMealRequest }, thunkApi) => {
    try {
      return await restaurantMealsApi.update(id, data, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to update restaurant meal'))
    }
  },
)

export const deleteRestaurantMeal = createAsyncThunk('restaurantMeals/delete', async (id: number, thunkApi) => {
  try {
    await restaurantMealsApi.delete(id, thunkApi.signal)
    return id
  } catch (e) {
    return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to delete restaurant meal'))
  }
})

const restaurantMealsSlice = createSlice({
  name: 'restaurantMeals',
  initialState,
  reducers: {
    clearRestaurantMealsError(state) {
      state.error = undefined
      state.selectedError = undefined
      state.mutationError = undefined
    },
    clearSelectedRestaurantMeal(state) {
      state.selected = null
      state.selectedStatus = 'idle'
      state.selectedError = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurantMeals.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchRestaurantMeals.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
        state.totalPages = action.payload.totalPages
        state.pageNumber = action.payload.pageNumber
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchRestaurantMeals.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      .addCase(fetchRestaurantMeal.pending, (state) => {
        state.selectedStatus = 'loading'
        state.selectedError = undefined
      })
      .addCase(fetchRestaurantMeal.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchRestaurantMeal.rejected, (state, action) => {
        state.selectedStatus = 'failed'
        state.selectedError = action.payload as string
      })
      .addCase(createRestaurantMeal.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(createRestaurantMeal.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createRestaurantMeal.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
      .addCase(updateRestaurantMeal.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(updateRestaurantMeal.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        if (state.selected?.id === action.payload.id) state.selected = action.payload
      })
      .addCase(updateRestaurantMeal.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
      .addCase(deleteRestaurantMeal.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(deleteRestaurantMeal.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.totalCount = Math.max(0, state.totalCount - 1)
        if (state.selected?.id === action.payload) state.selected = null
      })
      .addCase(deleteRestaurantMeal.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
  },
})

export const { clearRestaurantMealsError, clearSelectedRestaurantMeal } = restaurantMealsSlice.actions
export const restaurantMealsReducer = restaurantMealsSlice.reducer
