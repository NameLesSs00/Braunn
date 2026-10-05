import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type {
  RoomManagementContract,
  CreateRoomManagementContractRequest,
  UpdateRoomManagementContractRequest,
} from '../../models/Accounting/roomManagementContract'
import * as api from '../../shared/Accountingshared/roomManagementContractsApi'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type RoomManagementContractsState = {
  items: RoomManagementContract[] // Contracts for a specific room when loaded
  activeContract: RoomManagementContract | null
  status: AsyncStatus
  error?: string
}

const initialState: RoomManagementContractsState = {
  items: [],
  activeContract: null,
  status: 'idle',
  error: undefined,
}

export const fetchContractsByRoomId = createAsyncThunk(
  'roomManagementContracts/fetchByRoomId',
  async (roomId: string, thunkApi) => {
    try {
      return await api.getManagementContractsByRoomId(roomId, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch room management contracts'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchActiveContractByRoomId = createAsyncThunk(
  'roomManagementContracts/fetchActiveByRoomId',
  async ({ roomId, date }: { roomId: string; date: string }, thunkApi) => {
    try {
      return await api.getActiveManagementContractByRoomId(roomId, date, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch active management contract'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchContractById = createAsyncThunk(
  'roomManagementContracts/fetchById',
  async (id: string, thunkApi) => {
    try {
      return await api.getRoomManagementContractById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch room management contract'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const addContract = createAsyncThunk(
  'roomManagementContracts/add',
  async (payload: CreateRoomManagementContractRequest, thunkApi) => {
    try {
      return await api.createRoomManagementContract(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create room management contract'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const editContract = createAsyncThunk(
  'roomManagementContracts/edit',
  async ({ id, payload }: { id: string; payload: UpdateRoomManagementContractRequest }, thunkApi) => {
    try {
      const result = await api.updateRoomManagementContract(id, payload, thunkApi.signal)
      return { id, result }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update room management contract'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const roomManagementContractsSlice = createSlice({
  name: 'roomManagementContracts',
  initialState,
  reducers: {
    clearContractsError(state) {
      state.error = undefined
    },
    clearActiveContract(state) {
      state.activeContract = null
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchContractsByRoomId
      .addCase(fetchContractsByRoomId.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchContractsByRoomId.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchContractsByRoomId.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchActiveContractByRoomId
      .addCase(fetchActiveContractByRoomId.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchActiveContractByRoomId.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.activeContract = action.payload
      })
      .addCase(fetchActiveContractByRoomId.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchContractById
      .addCase(fetchContractById.fulfilled, (state, action) => {
        // Find if it exists in the list and update it, else add it
        const idx = state.items.findIndex(x => x.id === action.payload.id)
        if (idx >= 0) {
          state.items[idx] = action.payload
        }
      })

      // addContract
      .addCase(addContract.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(addContract.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
      })
      .addCase(addContract.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // editContract
      .addCase(editContract.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(editContract.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((x) => x.id === action.payload.id)
        if (idx >= 0) {
          state.items[idx] = action.payload.result
        }
        if (state.activeContract?.id === action.payload.id) {
          state.activeContract = action.payload.result
        }
      })
      .addCase(editContract.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearContractsError, clearActiveContract } = roomManagementContractsSlice.actions
export const roomManagementContractsReducer = roomManagementContractsSlice.reducer
