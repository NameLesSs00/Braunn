import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type {
  DepartmentReadDto,
  DepartmentCreateDto,
  DepartmentUpdateDto,
  DepartmentsQueryParams,
  PaginatedDepartments,
} from '../../../models/HRMmodels/Department'
import * as api from '../../../shared/HRMshared/api/departmentsApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type DepartmentsState = {
  departments: DepartmentReadDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  selectedDepartment: DepartmentReadDto | null
  status: AsyncStatus
  error?: string
}

const initialState: DepartmentsState = {
  departments: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  selectedDepartment: null,
  status: 'idle',
  error: undefined,
}

export const fetchDepartments = createAsyncThunk(
  'departments/fetchAll',
  async (params: DepartmentsQueryParams | undefined, thunkApi) => {
    try {
      return await api.getDepartments(params, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load departments'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createDepartment = createAsyncThunk(
  'departments/create',
  async (payload: DepartmentCreateDto, thunkApi) => {
    try {
      return await api.createDepartment(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create department'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchDepartmentById = createAsyncThunk(
  'departments/fetchById',
  async (id: string, thunkApi) => {
    try {
      return await api.getDepartmentById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load department'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateDepartment = createAsyncThunk(
  'departments/update',
  async ({ id, payload }: { id: string; payload: DepartmentUpdateDto }, thunkApi) => {
    try {
      return await api.updateDepartment(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update department'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const deleteDepartment = createAsyncThunk(
  'departments/delete',
  async (id: string, thunkApi) => {
    try {
      await api.deleteDepartment(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete department'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const departmentsSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    clearDepartmentsError(state) {
      state.error = undefined
    },
    clearSelectedDepartment(state) {
      state.selectedDepartment = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchDepartments.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchDepartments.fulfilled, (state, action: PayloadAction<PaginatedDepartments>) => {
        state.status = 'succeeded'
        state.departments = action.payload.items
        state.totalCount = action.payload.totalCount
        state.pageNumber = action.payload.pageNumber
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createDepartment.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createDepartment.fulfilled, (state, action: PayloadAction<DepartmentReadDto>) => {
        state.status = 'succeeded'
        state.departments.push(action.payload)
        state.totalCount += 1
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchById
      .addCase(fetchDepartmentById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action: PayloadAction<DepartmentReadDto>) => {
        state.status = 'succeeded'
        state.selectedDepartment = action.payload
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateDepartment.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateDepartment.fulfilled, (state, action: PayloadAction<DepartmentReadDto>) => {
        state.status = 'succeeded'
        const index = state.departments.findIndex((d) => d.id === action.payload.id)
        if (index !== -1) Object.assign(state.departments[index], action.payload)
        if (state.selectedDepartment?.id === action.payload.id) state.selectedDepartment = action.payload
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteDepartment.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteDepartment.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded'
        state.departments = state.departments.filter((d) => d.id !== action.payload)
        state.totalCount = Math.max(0, state.totalCount - 1)
        if (state.selectedDepartment?.id === action.payload) state.selectedDepartment = null
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearDepartmentsError, clearSelectedDepartment } = departmentsSlice.actions

export const departmentsReducer = departmentsSlice.reducer
