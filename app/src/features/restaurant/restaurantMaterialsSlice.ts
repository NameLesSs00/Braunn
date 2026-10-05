import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import { restaurantMaterialsApi, type RestaurantMaterialsQuery } from '../../shared/apis/restaurantMaterialsApi'
import type {
  CreateMaterialConversionRequest,
  CreateRestaurantMaterialRequest,
  RestaurantMaterial,
  UpdateMaterialConversionRequest,
  UpdateRestaurantMaterialRequest,
} from '../../models/RestaurantMaterial'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type RestaurantMaterialsState = {
  items: RestaurantMaterial[]
  selected: RestaurantMaterial | null
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

const initialState: RestaurantMaterialsState = {
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

export const fetchRestaurantMaterials = createAsyncThunk(
  'restaurantMaterials/fetchAll',
  async (params: RestaurantMaterialsQuery | void, thunkApi) => {
    try {
      return await restaurantMaterialsApi.getAll(params || undefined, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch restaurant materials'))
    }
  },
)

export const fetchRestaurantMaterial = createAsyncThunk('restaurantMaterials/fetchById', async (id: number, thunkApi) => {
  try {
    return await restaurantMaterialsApi.getById(id, thunkApi.signal)
  } catch (e) {
    return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to fetch restaurant material'))
  }
})

export const createRestaurantMaterial = createAsyncThunk(
  'restaurantMaterials/create',
  async (data: CreateRestaurantMaterialRequest, thunkApi) => {
    try {
      return await restaurantMaterialsApi.create(data, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to create restaurant material'))
    }
  },
)

export const updateRestaurantMaterial = createAsyncThunk(
  'restaurantMaterials/update',
  async ({ id, data }: { id: number; data: UpdateRestaurantMaterialRequest }, thunkApi) => {
    try {
      return await restaurantMaterialsApi.update(id, data, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to update restaurant material'))
    }
  },
)

export const toggleRestaurantMaterialStatus = createAsyncThunk(
  'restaurantMaterials/toggleStatus',
  async ({ id, activate }: { id: number; activate: boolean }, thunkApi) => {
    try {
      if (activate) {
        await restaurantMaterialsApi.activate(id, thunkApi.signal)
      } else {
        await restaurantMaterialsApi.deactivate(id, thunkApi.signal)
      }
      return { id, isActive: activate }
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to update material status'))
    }
  },
)

export const createMaterialConversion = createAsyncThunk(
  'restaurantMaterials/createConversion',
  async ({ materialId, data }: { materialId: number; data: CreateMaterialConversionRequest }, thunkApi) => {
    try {
      return await restaurantMaterialsApi.createConversion(materialId, data, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to create material conversion'))
    }
  },
)

export const updateMaterialConversion = createAsyncThunk(
  'restaurantMaterials/updateConversion',
  async ({ id, data }: { id: number; data: UpdateMaterialConversionRequest }, thunkApi) => {
    try {
      return await restaurantMaterialsApi.updateConversion(id, data, thunkApi.signal)
    } catch (e) {
      return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to update material conversion'))
    }
  },
)

export const deleteMaterialConversion = createAsyncThunk('restaurantMaterials/deleteConversion', async (id: number, thunkApi) => {
  try {
    await restaurantMaterialsApi.deleteConversion(id, thunkApi.signal)
    return id
  } catch (e) {
    return thunkApi.rejectWithValue(toErrorMessage(e, 'Failed to delete material conversion'))
  }
})

const restaurantMaterialsSlice = createSlice({
  name: 'restaurantMaterials',
  initialState,
  reducers: {
    clearRestaurantMaterialsError(state) {
      state.error = undefined
      state.selectedError = undefined
      state.mutationError = undefined
    },
    clearSelectedRestaurantMaterial(state) {
      state.selected = null
      state.selectedStatus = 'idle'
      state.selectedError = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurantMaterials.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchRestaurantMaterials.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
        state.totalPages = action.payload.totalPages
        state.pageNumber = action.payload.pageNumber
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchRestaurantMaterials.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      .addCase(fetchRestaurantMaterial.pending, (state) => {
        state.selectedStatus = 'loading'
        state.selectedError = undefined
      })
      .addCase(fetchRestaurantMaterial.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchRestaurantMaterial.rejected, (state, action) => {
        state.selectedStatus = 'failed'
        state.selectedError = action.payload as string
      })
      .addCase(createRestaurantMaterial.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(createRestaurantMaterial.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createRestaurantMaterial.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
      .addCase(updateRestaurantMaterial.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(updateRestaurantMaterial.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        if (state.selected?.id === action.payload.id) state.selected = action.payload
      })
      .addCase(updateRestaurantMaterial.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
      .addCase(toggleRestaurantMaterialStatus.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = undefined
      })
      .addCase(toggleRestaurantMaterialStatus.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index].isActive = action.payload.isActive
        if (state.selected?.id === action.payload.id) state.selected.isActive = action.payload.isActive
      })
      .addCase(toggleRestaurantMaterialStatus.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload as string
      })
      .addMatcher(
        isAnyOf(createMaterialConversion.pending, updateMaterialConversion.pending, deleteMaterialConversion.pending),
        (state) => {
          state.mutationStatus = 'loading'
          state.mutationError = undefined
        },
      )
      .addMatcher(
        isAnyOf(createMaterialConversion.fulfilled, updateMaterialConversion.fulfilled, deleteMaterialConversion.fulfilled),
        (state) => {
          state.mutationStatus = 'succeeded'
        },
      )
      .addMatcher(
        isAnyOf(createMaterialConversion.rejected, updateMaterialConversion.rejected, deleteMaterialConversion.rejected),
        (state, action) => {
          state.mutationStatus = 'failed'
          state.mutationError = action.payload as string
        },
      )
  },
})

export const { clearRestaurantMaterialsError, clearSelectedRestaurantMaterial } = restaurantMaterialsSlice.actions
export const restaurantMaterialsReducer = restaurantMaterialsSlice.reducer
