import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type {
  HkmInventoryCategoryReadDto,
  HkmInventoryCategoryCreateDto,
  HkmInventoryCategoryUpdateDto,
} from '../../../models/HKmodels/HkmInventoryCategory'
import * as api from '../../../shared/HKshared/api/hkmInventoryCategoriesApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type HkmInventoryCategoriesState = {
  categories: HkmInventoryCategoryReadDto[]
  selectedCategory: HkmInventoryCategoryReadDto | null
  status: AsyncStatus
  error?: string
}

const initialState: HkmInventoryCategoriesState = {
  categories: [],
  selectedCategory: null,
  status: 'idle',
  error: undefined,
}

// GET /api/hkm/inventory/categories
export const fetchHkmInventoryCategories = createAsyncThunk(
  'hkmInventoryCategories/fetchAll',
  async (_, thunkApi) => {
    try {
      return await api.getHkmInventoryCategories(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load categories'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// POST /api/hkm/inventory/categories
export const createHkmInventoryCategory = createAsyncThunk(
  'hkmInventoryCategories/create',
  async (payload: HkmInventoryCategoryCreateDto, thunkApi) => {
    try {
      return await api.createHkmInventoryCategory(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create category'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// GET /api/hkm/inventory/categories/{id}
export const fetchHkmInventoryCategoryById = createAsyncThunk(
  'hkmInventoryCategories/fetchById',
  async (id: number, thunkApi) => {
    try {
      return await api.getHkmInventoryCategoryById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load category'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// PUT /api/hkm/inventory/categories/{id}
export const updateHkmInventoryCategory = createAsyncThunk(
  'hkmInventoryCategories/update',
  async ({ id, payload }: { id: number; payload: HkmInventoryCategoryUpdateDto }, thunkApi) => {
    try {
      return await api.updateHkmInventoryCategory(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update category'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// DELETE /api/hkm/inventory/categories/{id}
export const deleteHkmInventoryCategory = createAsyncThunk(
  'hkmInventoryCategories/delete',
  async (id: number, thunkApi) => {
    try {
      await api.deleteHkmInventoryCategory(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete category'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const hkmInventoryCategoriesSlice = createSlice({
  name: 'hkmInventoryCategories',
  initialState,
  reducers: {
    clearHkmInventoryCategoriesError(state) {
      state.error = undefined
    },
    clearSelectedCategory(state) {
      state.selectedCategory = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchHkmInventoryCategories.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchHkmInventoryCategories.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.categories = action.payload
      })
      .addCase(fetchHkmInventoryCategories.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createHkmInventoryCategory.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createHkmInventoryCategory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.categories.push(action.payload)
      })
      .addCase(createHkmInventoryCategory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchById
      .addCase(fetchHkmInventoryCategoryById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchHkmInventoryCategoryById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selectedCategory = action.payload
      })
      .addCase(fetchHkmInventoryCategoryById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateHkmInventoryCategory.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateHkmInventoryCategory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.categories.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) state.categories[index] = action.payload
        if (state.selectedCategory?.id === action.payload.id) state.selectedCategory = action.payload
      })
      .addCase(updateHkmInventoryCategory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteHkmInventoryCategory.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteHkmInventoryCategory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.categories = state.categories.filter((c) => c.id !== action.payload)
        if (state.selectedCategory?.id === action.payload) state.selectedCategory = null
      })
      .addCase(deleteHkmInventoryCategory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearHkmInventoryCategoriesError, clearSelectedCategory } = hkmInventoryCategoriesSlice.actions

export const hkmInventoryCategoriesReducer = hkmInventoryCategoriesSlice.reducer
