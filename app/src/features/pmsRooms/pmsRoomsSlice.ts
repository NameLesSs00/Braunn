import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { pmsRoomsApi } from '../../shared/apis/pmsRoomsApi'
import { PmsRoom } from '../../models/PmsRoom'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type PmsRoomsState = {
  items: PmsRoom[]
  totalCount: number
  totalPages: number
  currentPage: number
  status: AsyncStatus
  error?: string
}

const initialState: PmsRoomsState = {
  items: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  status: 'idle',
}

export const fetchPmsRooms = createAsyncThunk(
  'pmsRooms/fetchAll',
  async (
    params: {
      pageNumber?: number
      pageSize?: number
      search?: string
      status?: string
      roomType?: string
      managementType?: string
      ownershipType?: string
      floor?: number
      roomTypeId?: string
    } | void,
    thunkApi
  ) => {
    try {
      const res = await pmsRoomsApi.getAll(params || undefined, thunkApi.signal)
      return res
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch rooms'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const pmsRoomsSlice = createSlice({
  name: 'pmsRooms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPmsRooms.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchPmsRooms.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.pageNumber
      })
      .addCase(fetchPmsRooms.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
  },
})

export const pmsRoomsReducer = pmsRoomsSlice.reducer
