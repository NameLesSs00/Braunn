import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type { CreateGuestRequest, Guest, UpdateGuestRequest } from '../../models/Guest'
import * as api from '../../shared/apis/guestsApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type GuestsState = {
  items: Guest[]
  selected?: Guest
  status: AsyncStatus
  error?: string
}

const initialState: GuestsState = {
  items: [],
  selected: undefined,
  status: 'idle',
  error: undefined,
}

export const fetchGuests = createAsyncThunk('guests/fetchAll', async (_, thunkApi) => {
  try {
    return await api.getGuests(thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load guests'
    return thunkApi.rejectWithValue(message)
  }
})

export const fetchGuestById = createAsyncThunk('guests/fetchById', async (id: string, thunkApi) => {
  try {
    return await api.getGuestById(id, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load guest'
    return thunkApi.rejectWithValue(message)
  }
})

export const fetchGuestByNationalId = createAsyncThunk('guests/fetchByNationalId', async (idNumber: string, thunkApi) => {
  try {
    return await api.getGuestByNationalId(idNumber, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load guest'
    return thunkApi.rejectWithValue(message)
  }
})

export const addGuest = createAsyncThunk('guests/add', async (payload: CreateGuestRequest, thunkApi) => {
  try {
    return await api.createGuest(payload, thunkApi.signal)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create guest'
    return thunkApi.rejectWithValue(message)
  }
})

export const editGuest = createAsyncThunk(
  'guests/edit',
  async ({ id, payload }: { id: string; payload: UpdateGuestRequest }, thunkApi) => {
    try {
      await api.updateGuest(id, payload, thunkApi.signal)
      return { id, payload }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update guest'
      return thunkApi.rejectWithValue(message)
    }
  },
)

export const removeGuest = createAsyncThunk('guests/remove', async (id: string, thunkApi) => {
  try {
    await api.deleteGuest(id, thunkApi.signal)
    return id
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete guest'
    return thunkApi.rejectWithValue(message)
  }
})

const guestsSlice = createSlice({
  name: 'guests',
  initialState,
  reducers: {
    clearGuestsError(state) {
      state.error = undefined
    },
    setSelectedGuest(state, action: PayloadAction<Guest | undefined>) {
      state.selected = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuests.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(fetchGuestById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchGuestById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchGuestById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(fetchGuestByNationalId.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchGuestByNationalId.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchGuestByNationalId.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(addGuest.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(addGuest.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
      })
      .addCase(addGuest.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(editGuest.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(editGuest.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((x) => x.id === action.payload.id)
        if (idx >= 0) state.items[idx] = { ...state.items[idx], ...action.payload.payload }
        if (state.selected?.id === action.payload.id) state.selected = { ...state.selected, ...action.payload.payload }
      })
      .addCase(editGuest.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(removeGuest.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(removeGuest.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((x) => x.id !== action.payload)
        if (state.selected?.id === action.payload) state.selected = undefined
      })
      .addCase(removeGuest.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearGuestsError, setSelectedGuest } = guestsSlice.actions

export const guestsReducer = guestsSlice.reducer
