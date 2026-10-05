import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { restaurantCouponsApi, type RestaurantCouponsQuery } from '../../shared/apis/restaurantCouponsApi'
import type {
  CreateRestaurantCouponRequest,
  RestaurantCoupon,
  UpdateRestaurantCouponRequest,
} from '../../models/RestaurantCoupon'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type RestaurantCouponsState = {
  items: RestaurantCoupon[]
  selected: RestaurantCoupon | null
  byMeal: RestaurantCoupon[]
  totalCount: number
  totalPages: number
  pageNumber: number
  pageSize: number
  status: AsyncStatus
  selectedStatus: AsyncStatus
  byMealStatus: AsyncStatus
  mutationStatus: AsyncStatus
  error?: string
  selectedError?: string
  byMealError?: string
  mutationError?: string
}

const initialState: RestaurantCouponsState = {
  items: [],
  selected: null,
  byMeal: [],
  totalCount: 0,
  totalPages: 0,
  pageNumber: 1,
  pageSize: 50,
  status: 'idle',
  selectedStatus: 'idle',
  byMealStatus: 'idle',
  mutationStatus: 'idle',
}

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export const fetchRestaurantCoupons = createAsyncThunk(
  'restaurantCoupons/fetchAll',
  async (params: RestaurantCouponsQuery | void, thunkApi) => {
    try {
      return await restaurantCouponsApi.getAll(params || undefined, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch restaurant coupons'))
    }
  },
)

export const fetchRestaurantCoupon = createAsyncThunk('restaurantCoupons/fetchById', async (id: number, thunkApi) => {
  try {
    return await restaurantCouponsApi.getById(id, thunkApi.signal)
  } catch (e) {
    return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch restaurant coupon'))
  }
})

export const fetchRestaurantCouponsByMeal = createAsyncThunk(
  'restaurantCoupons/fetchByMeal',
  async (mealId: number, thunkApi) => {
    try {
      return await restaurantCouponsApi.getByMeal(mealId, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch coupons for meal'))
    }
  },
)

export const createRestaurantCoupon = createAsyncThunk(
  'restaurantCoupons/create',
  async (data: CreateRestaurantCouponRequest, thunkApi) => {
    try {
      return await restaurantCouponsApi.create(data, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to create restaurant coupon'))
    }
  },
)

export const updateRestaurantCoupon = createAsyncThunk(
  'restaurantCoupons/update',
  async ({ id, data }: { id: number; data: UpdateRestaurantCouponRequest }, thunkApi) => {
    try {
      return await restaurantCouponsApi.update(id, data, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to update restaurant coupon'))
    }
  },
)

export const deleteRestaurantCoupon = createAsyncThunk('restaurantCoupons/delete', async (id: number, thunkApi) => {
  try {
    await restaurantCouponsApi.delete(id, thunkApi.signal)
    return id
  } catch (e) {
    return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to delete restaurant coupon'))
  }
})

const restaurantCouponsSlice = createSlice({
  name: 'restaurantCoupons',
  initialState,
  reducers: {
    clearRestaurantCouponsError(state) {
      state.error = undefined
      state.selectedError = undefined
      state.byMealError = undefined
      state.mutationError = undefined
    },
    clearSelectedRestaurantCoupon(state) {
      state.selected = null
      state.selectedStatus = 'idle'
      state.selectedError = undefined
    },
    clearRestaurantCouponsByMeal(state) {
      state.byMeal = []
      state.byMealStatus = 'idle'
      state.byMealError = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurantCoupons.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchRestaurantCoupons.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
        state.totalPages = action.payload.totalPages
        state.pageNumber = action.payload.pageNumber
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchRestaurantCoupons.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      .addCase(fetchRestaurantCoupon.pending, (state) => {
        state.selectedStatus = 'loading'
        state.selectedError = undefined
      })
      .addCase(fetchRestaurantCoupon.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchRestaurantCoupon.rejected, (state, action) => {
        state.selectedStatus = 'failed'
        state.selectedError = action.payload as string
      })
      .addCase(fetchRestaurantCouponsByMeal.pending, (state) => {
        state.byMealStatus = 'loading'
        state.byMealError = undefined
      })
      .addCase(fetchRestaurantCouponsByMeal.fulfilled, (state, action) => {
        state.byMealStatus = 'succeeded'
        state.byMeal = action.payload
      })
      .addCase(fetchRestaurantCouponsByMeal.rejected, (state, action) => {
        state.byMealStatus = 'failed'
        state.byMealError = action.payload as string
      })
      .addCase(createRestaurantCoupon.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(createRestaurantCoupon.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createRestaurantCoupon.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
      .addCase(updateRestaurantCoupon.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(updateRestaurantCoupon.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        if (state.selected?.id === action.payload.id) state.selected = action.payload
        const byMealIndex = state.byMeal.findIndex((item) => item.id === action.payload.id)
        if (byMealIndex !== -1) state.byMeal[byMealIndex] = action.payload
      })
      .addCase(updateRestaurantCoupon.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
      .addCase(deleteRestaurantCoupon.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(deleteRestaurantCoupon.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        state.items = state.items.filter((item) => item.id !== action.payload)
        state.byMeal = state.byMeal.filter((item) => item.id !== action.payload)
        state.totalCount = Math.max(0, state.totalCount - 1)
        if (state.selected?.id === action.payload) state.selected = null
      })
      .addCase(deleteRestaurantCoupon.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
  },
})

export const {
  clearRestaurantCouponsByMeal,
  clearRestaurantCouponsError,
  clearSelectedRestaurantCoupon,
} = restaurantCouponsSlice.actions
export const restaurantCouponsReducer = restaurantCouponsSlice.reducer
