import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type {
  BonusDeductionReadDto,
  BonusDeductionCreateDto,
  BonusDeductionUpdateDto,
  BonusDeductionQueryParams,
  PaginatedBonusDeduction,
} from '../../../models/HRMmodels/BonusesAndDeductions'
import * as api from '../../../shared/HRMshared/api/bonusesApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type BonusesState = {
  items: BonusDeductionReadDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  status: AsyncStatus
  error?: string
}

const initialState: BonusesState = {
  items: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  status: 'idle',
  error: undefined,
}

export const fetchBonuses = createAsyncThunk<
  PaginatedBonusDeduction,
  BonusDeductionQueryParams | undefined
>('bonuses/fetchAll', async (params, thunkApi) => {
  try {
    return await api.getBonuses(params, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load bonuses'
    return thunkApi.rejectWithValue(message)
  }
})

export const createBonus = createAsyncThunk<BonusDeductionReadDto, BonusDeductionCreateDto>(
  'bonuses/create',
  async (payload, thunkApi) => {
    try {
      return await api.createBonus(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create bonus'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateBonus = createAsyncThunk<
  BonusDeductionReadDto,
  { id: string; payload: BonusDeductionUpdateDto }
>('bonuses/update', async ({ id, payload }, thunkApi) => {
  try {
    return await api.updateBonus(id, payload, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update bonus'
    return thunkApi.rejectWithValue(message)
  }
})

export const deleteBonus = createAsyncThunk<string, string>(
  'bonuses/delete',
  async (id, thunkApi) => {
    try {
      await api.deleteBonus(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete bonus'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const bonusesSlice = createSlice({
  name: 'bonuses',
  initialState,
  reducers: {
    clearBonusesError(state) {
      state.error = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchBonuses.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchBonuses.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
        state.pageNumber = action.payload.pageNumber
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchBonuses.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // create
      .addCase(createBonus.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createBonus.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createBonus.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // update
      .addCase(updateBonus.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateBonus.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.items.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(updateBonus.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // delete
      .addCase(deleteBonus.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(deleteBonus.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((c) => c.id !== action.payload)
        state.totalCount -= 1
      })
      .addCase(deleteBonus.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearBonusesError } = bonusesSlice.actions

export const bonusesReducer = bonusesSlice.reducer
