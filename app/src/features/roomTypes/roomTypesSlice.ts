import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { CreateRoomTypeRequest, RoomType, UpdateRoomTypeRequest } from '../../models/RoomType'
import * as api from '../../shared/apis/roomTypesApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type RoomTypesState = {
  items: RoomType[]
  selected?: RoomType
  status: AsyncStatus
  error?: string
}

const initialState: RoomTypesState = {
  items: [],
  selected: undefined,
  status: 'idle',
  error: undefined,
}

export const fetchRoomTypes = createAsyncThunk('roomTypes/fetchAll', async (_, thunkApi) => {
  try {
    return await api.getRoomTypes(thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load room types'
    return thunkApi.rejectWithValue(message)
  }
})

export const fetchRoomTypeById = createAsyncThunk('roomTypes/fetchById', async (id: string, thunkApi) => {
  try {
    return await api.getRoomTypeById(id, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load room type'
    return thunkApi.rejectWithValue(message)
  }
})

export const addRoomType = createAsyncThunk('roomTypes/add', async (payload: CreateRoomTypeRequest, thunkApi) => {
  try {
    return await api.createRoomType(payload, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create room type'
    return thunkApi.rejectWithValue(message)
  }
})

export const editRoomType = createAsyncThunk(
  'roomTypes/edit',
  async ({ id, payload }: { id: string; payload: UpdateRoomTypeRequest }, thunkApi) => {
    try {
      await api.updateRoomType(id, payload, thunkApi.signal)
      return { id, payload }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update room type'
      return thunkApi.rejectWithValue(message)
    }
  },
)

export const removeRoomType = createAsyncThunk('roomTypes/remove', async (id: string, thunkApi) => {
  try {
    await api.deleteRoomType(id, thunkApi.signal)
    return id
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete room type'
    return thunkApi.rejectWithValue(message)
  }
})

const roomTypesSlice = createSlice({
  name: 'roomTypes',
  initialState,
  reducers: {
    clearRoomTypesError(state) {
      state.error = undefined
    },
    setSelectedRoomType(state, action: PayloadAction<RoomType | undefined>) {
      state.selected = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoomTypes.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchRoomTypes.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchRoomTypes.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(fetchRoomTypeById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchRoomTypeById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchRoomTypeById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(addRoomType.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(addRoomType.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
      })
      .addCase(addRoomType.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(editRoomType.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(editRoomType.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((x) => x.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload.payload
        if (state.selected?.id === action.payload.id) state.selected = action.payload.payload
      })
      .addCase(editRoomType.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(removeRoomType.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(removeRoomType.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((x) => x.id !== action.payload)
        if (state.selected?.id === action.payload) state.selected = undefined
      })
      .addCase(removeRoomType.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearRoomTypesError, setSelectedRoomType } = roomTypesSlice.actions
export const roomTypesReducer = roomTypesSlice.reducer
