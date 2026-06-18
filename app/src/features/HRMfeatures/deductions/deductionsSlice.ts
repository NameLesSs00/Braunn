import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type {
  BonusDeductionReadDto,
  BonusDeductionCreateDto,
  BonusDeductionUpdateDto,
  BonusDeductionQueryParams,
  PaginatedBonusDeduction,
} from '../../../models/HRMmodels/BonusesAndDeductions'
import * as api from '../../../shared/HRMshared/api/deductionsApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type DeductionsState = {
  items: BonusDeductionReadDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  status: AsyncStatus
  error?: string
}

const initialState: DeductionsState = {
  items: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  status: 'idle',
  error: undefined,
}

export const fetchDeductions = createAsyncThunk<
  PaginatedBonusDeduction,
  BonusDeductionQueryParams | undefined
>('deductions/fetchAll', async (params, thunkApi) => {
  try {
    return await api.getDeductions(params, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load deductions'
    return thunkApi.rejectWithValue(message)
  }
})

export const createDeduction = createAsyncThunk<BonusDeductionReadDto, BonusDeductionCreateDto>(
  'deductions/create',
  async (payload, thunkApi) => {
    try {
      return await api.createDeduction(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create deduction'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateDeduction = createAsyncThunk<
  BonusDeductionReadDto,
  { id: string; payload: BonusDeductionUpdateDto }
>('deductions/update', async ({ id, payload }, thunkApi) => {
  try {
    return await api.updateDeduction(id, payload, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update deduction'
    return thunkApi.rejectWithValue(message)
  }
})

export const deleteDeduction = createAsyncThunk<string, string>(
  'deductions/delete',
  async (id, thunkApi) => {
    try {
      await api.deleteDeduction(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete deduction'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const deductionsSlice = createSlice({
  name: 'deductions',
  initialState,
  reducers: {
    clearDeductionsError(state) {
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchDeductions.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchDeductions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
        state.pageNumber = action.payload.pageNumber
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchDeductions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createDeduction.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createDeduction.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createDeduction.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateDeduction.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateDeduction.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.items.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(updateDeduction.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteDeduction.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteDeduction.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((c) => c.id !== action.payload)
        state.totalCount -= 1
      })
      .addCase(deleteDeduction.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearDeductionsError } = deductionsSlice.actions

export const deductionsReducer = deductionsSlice.reducer
