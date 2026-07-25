import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { maintenanceCategoriesApi } from '../../shared/apis/maintenanceCategoriesApi'
import type { MaintenanceCategory, CreateCategoryRequest, UpdateCategoryRequest } from '../../models/MaintenanceCategory'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type MaintenanceCategoriesState = {
  items: MaintenanceCategory[]
  totalCount: number
  fetchStatus: AsyncStatus
  createStatus: AsyncStatus
  updateStatus: AsyncStatus
  deleteStatus: AsyncStatus
  error?: string
}

const initialState: MaintenanceCategoriesState = {
  items: [],
  totalCount: 0,
  fetchStatus: 'idle',
  createStatus: 'idle',
  updateStatus: 'idle',
  deleteStatus: 'idle',
}

export interface CategoryQueryParams {
  search?: string
  type?: string
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  isDescending?: boolean
}

export const fetchMaintenanceCategories = createAsyncThunk(
  'maintenanceCategories/fetchAll',
  async (params: CategoryQueryParams | undefined, thunkApi) => {
    try {
      return await maintenanceCategoriesApi.getAll(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch categories'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const addMaintenanceCategory = createAsyncThunk(
  'maintenanceCategories/add',
  async (payload: CreateCategoryRequest, thunkApi) => {
    try {
      const created = await maintenanceCategoriesApi.create(payload, thunkApi.signal)
      thunkApi.dispatch(fetchMaintenanceCategories(undefined))
      return created
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to add category'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const editMaintenanceCategory = createAsyncThunk(
  'maintenanceCategories/edit',
  async ({ id, payload }: { id: string; payload: UpdateCategoryRequest }, thunkApi) => {
    try {
      const updated = await maintenanceCategoriesApi.update(id, payload, thunkApi.signal)
      thunkApi.dispatch(fetchMaintenanceCategories(undefined))
      return updated
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to edit category'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const removeMaintenanceCategory = createAsyncThunk(
  'maintenanceCategories/remove',
  async (id: string, thunkApi) => {
    try {
      await maintenanceCategoriesApi.delete(id, thunkApi.signal)
      thunkApi.dispatch(fetchMaintenanceCategories(undefined))
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to remove category'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const maintenanceCategoriesSlice = createSlice({
  name: 'maintenanceCategories',
  initialState,
  reducers: {
    clearCategoryError(state) {
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchMaintenanceCategories.pending, (state) => {
        state.fetchStatus = 'loading'
        state.error = undefined
      })
      .addCase(fetchMaintenanceCategories.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchMaintenanceCategories.rejected, (state, action) => {
        state.fetchStatus = 'failed'
        state.error = action.payload as string
      })
      // Create
      .addCase(addMaintenanceCategory.pending, (state) => {
        state.createStatus = 'loading'
        state.error = undefined
      })
      .addCase(addMaintenanceCategory.fulfilled, (state) => {
        state.createStatus = 'succeeded'
      })
      .addCase(addMaintenanceCategory.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.error = action.payload as string
      })
      // Update
      .addCase(editMaintenanceCategory.pending, (state) => {
        state.updateStatus = 'loading'
        state.error = undefined
      })
      .addCase(editMaintenanceCategory.fulfilled, (state) => {
        state.updateStatus = 'succeeded'
      })
      .addCase(editMaintenanceCategory.rejected, (state, action) => {
        state.updateStatus = 'failed'
        state.error = action.payload as string
      })
      // Delete
      .addCase(removeMaintenanceCategory.pending, (state) => {
        state.deleteStatus = 'loading'
        state.error = undefined
      })
      .addCase(removeMaintenanceCategory.fulfilled, (state) => {
        state.deleteStatus = 'succeeded'
      })
      .addCase(removeMaintenanceCategory.rejected, (state, action) => {
        state.deleteStatus = 'failed'
        state.error = action.payload as string
      })
  },
})

export const { clearCategoryError } = maintenanceCategoriesSlice.actions
export const maintenanceCategoriesReducer = maintenanceCategoriesSlice.reducer