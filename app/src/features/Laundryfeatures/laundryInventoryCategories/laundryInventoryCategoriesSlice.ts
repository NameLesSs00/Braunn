import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type {
  LaundryInventoryCategoryReadDto,
  LaundryInventoryCategoryCreateDto,
  LaundryInventoryCategoryUpdateDto,
} from '../../../models/Laundrymodels/LaundryInventoryCategory'
import * as api from '../../../shared/Laundryshared/api/laundryInventoryCategoriesApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type LaundryInventoryCategoriesState = {
  categories: LaundryInventoryCategoryReadDto[]
  selectedCategory: LaundryInventoryCategoryReadDto | null
  status: AsyncStatus
  error?: string
}

const initialState: LaundryInventoryCategoriesState = {
  categories: [],
  selectedCategory: null,
  status: 'idle',
  error: undefined,
}

// GET /api/laundry/inventory/categories
export const fetchLaundryInventoryCategories = createAsyncThunk(
  'laundryInventoryCategories/fetchAll',
  async (_, thunkApi) => {
    try {
      return await api.getLaundryInventoryCategories(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load categories'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// POST /api/laundry/inventory/categories
export const createLaundryInventoryCategory = createAsyncThunk(
  'laundryInventoryCategories/create',
  async (payload: LaundryInventoryCategoryCreateDto, thunkApi) => {
    try {
      return await api.createLaundryInventoryCategory(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create category'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// GET /api/laundry/inventory/categories/{id}
export const fetchLaundryInventoryCategoryById = createAsyncThunk(
  'laundryInventoryCategories/fetchById',
  async (id: number, thunkApi) => {
    try {
      return await api.getLaundryInventoryCategoryById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load category'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// PUT /api/laundry/inventory/categories/{id}
export const updateLaundryInventoryCategory = createAsyncThunk(
  'laundryInventoryCategories/update',
  async ({ id, payload }: { id: number; payload: LaundryInventoryCategoryUpdateDto }, thunkApi) => {
    try {
      return await api.updateLaundryInventoryCategory(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update category'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// DELETE /api/laundry/inventory/categories/{id}
export const deleteLaundryInventoryCategory = createAsyncThunk(
  'laundryInventoryCategories/delete',
  async (id: number, thunkApi) => {
    try {
      await api.deleteLaundryInventoryCategory(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete category'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const laundryInventoryCategoriesSlice = createSlice({
  name: 'laundryInventoryCategories',
  initialState,
  reducers: {
    clearLaundryInventoryCategoriesError(state) {
      state.error = undefined
    },
    clearSelectedCategory(state) {
      state.selectedCategory = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchLaundryInventoryCategories.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchLaundryInventoryCategories.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.categories = action.payload
      })
      .addCase(fetchLaundryInventoryCategories.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createLaundryInventoryCategory.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createLaundryInventoryCategory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.categories.push(action.payload)
      })
      .addCase(createLaundryInventoryCategory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchById
      .addCase(fetchLaundryInventoryCategoryById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchLaundryInventoryCategoryById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selectedCategory = action.payload
      })
      .addCase(fetchLaundryInventoryCategoryById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateLaundryInventoryCategory.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateLaundryInventoryCategory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.categories.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) state.categories[index] = action.payload
        if (state.selectedCategory?.id === action.payload.id) state.selectedCategory = action.payload
      })
      .addCase(updateLaundryInventoryCategory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteLaundryInventoryCategory.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteLaundryInventoryCategory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.categories = state.categories.filter((c) => c.id !== action.payload)
        if (state.selectedCategory?.id === action.payload) state.selectedCategory = null
      })
      .addCase(deleteLaundryInventoryCategory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearLaundryInventoryCategoriesError, clearSelectedCategory } = laundryInventoryCategoriesSlice.actions

export const laundryInventoryCategoriesReducer = laundryInventoryCategoriesSlice.reducer
