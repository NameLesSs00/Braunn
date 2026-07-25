import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { pmsRoomsApi } from '../../shared/apis/pmsRoomsApi'
import { PmsRoom } from '../../models/PmsRoom'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type PmsRoomsState = {
  items: PmsRoom[]
  status: AsyncStatus
  error?: string
}

const initialState: PmsRoomsState = {
  items: [],
  status: 'idle',
}

export const fetchPmsRooms = createAsyncThunk(
  'pmsRooms/fetchAll',
  async (_, thunkApi) => {
    try {
      return await pmsRoomsApi.getAll(thunkApi.signal)
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
        state.items = action.payload
      })
      .addCase(fetchPmsRooms.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
  },
})

export const pmsRoomsReducer = pmsRoomsSlice.reducer
