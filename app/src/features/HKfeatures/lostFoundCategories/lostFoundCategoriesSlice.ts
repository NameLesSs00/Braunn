import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type {
  LostFoundCategoryReadDto,
  LostFoundCategoryCreateDto,
  LostFoundCategoryUpdateDto,
  LostFoundCategoryQueryParams,
  PaginatedLostFoundCategories,
} from '../../../models/HKmodels/HkmLostFoundCategory'
import * as api from '../../../shared/HKshared/api/lostFoundCategoriesApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type LostFoundCategoriesState = {
  categories: LostFoundCategoryReadDto[]
  selectedCategory: LostFoundCategoryReadDto | null
  totalCount: number
  pageNumber: number
  pageSize: number
  status: AsyncStatus
  error?: string
}

const initialState: LostFoundCategoriesState = {
  categories: [],
  selectedCategory: null,
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  status: 'idle',
  error: undefined,
}

// GET /api/lost-found-categories
export const fetchLostFoundCategories = createAsyncThunk<
  PaginatedLostFoundCategories,
  LostFoundCategoryQueryParams | undefined
>(
  'lostFoundCategories/fetchAll',
  async (params, thunkApi) => {
    try {
      return await api.getLostFoundCategories(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load lost & found categories'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// POST /api/lost-found-categories
export const createLostFoundCategory = createAsyncThunk<LostFoundCategoryReadDto, LostFoundCategoryCreateDto>(
  'lostFoundCategories/create',
  async (payload, thunkApi) => {
    try {
      return await api.createLostFoundCategory(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create category'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// GET /api/lost-found-categories/{id}
export const fetchLostFoundCategoryById = createAsyncThunk<LostFoundCategoryReadDto, number>(
  'lostFoundCategories/fetchById',
  async (id, thunkApi) => {
    try {
      return await api.getLostFoundCategoryById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load category'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// PUT /api/lost-found-categories/{id}
export const updateLostFoundCategory = createAsyncThunk<
  LostFoundCategoryReadDto,
  { id: number; payload: LostFoundCategoryUpdateDto }
>(
  'lostFoundCategories/update',
  async ({ id, payload }, thunkApi) => {
    try {
      return await api.updateLostFoundCategory(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update category'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// DELETE /api/lost-found-categories/{id}
export const deleteLostFoundCategory = createAsyncThunk<number, number>(
  'lostFoundCategories/delete',
  async (id, thunkApi) => {
    try {
      await api.deleteLostFoundCategory(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete category'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const lostFoundCategoriesSlice = createSlice({
  name: 'lostFoundCategories',
  initialState,
  reducers: {
    clearLostFoundCategoriesError(state) {
      state.error = undefined
    },
    clearSelectedLostFoundCategory(state) {
      state.selectedCategory = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchLostFoundCategories.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchLostFoundCategories.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.categories = action.payload.items
        state.totalCount = action.payload.totalCount
        state.pageNumber = action.payload.pageNumber
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchLostFoundCategories.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createLostFoundCategory.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createLostFoundCategory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.categories.push(action.payload)
        state.totalCount += 1
      })
      .addCase(createLostFoundCategory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchById
      .addCase(fetchLostFoundCategoryById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchLostFoundCategoryById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selectedCategory = action.payload
      })
      .addCase(fetchLostFoundCategoryById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateLostFoundCategory.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateLostFoundCategory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.categories.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) state.categories[index] = action.payload
        if (state.selectedCategory?.id === action.payload.id) state.selectedCategory = action.payload
      })
      .addCase(updateLostFoundCategory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteLostFoundCategory.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteLostFoundCategory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.categories = state.categories.filter((c) => c.id !== action.payload)
        if (state.selectedCategory?.id === action.payload) state.selectedCategory = null
        state.totalCount -= 1
      })
      .addCase(deleteLostFoundCategory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearLostFoundCategoriesError, clearSelectedLostFoundCategory } = lostFoundCategoriesSlice.actions

export const lostFoundCategoriesReducer = lostFoundCategoriesSlice.reducer
