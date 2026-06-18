import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GroupContract } from '../../models/GroupContract'
import {
  CreateGroupContractRequest,
  UpdateGroupContractRequest,
  getGroupContracts,
  createGroupContract,
  getGroupContractById,
  updateGroupContract,
  deleteGroupContract,
  releaseGroupContract,
} from '../../shared/apis/GroupContract'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface GroupContractState {
  items: GroupContract[]
  selected?: GroupContract
  status: AsyncStatus
  error?: string
}

const initialState: GroupContractState = {
  items: [],
  selected: undefined,
  status: 'idle',
  error: undefined,
}

export const fetchGroupContracts = createAsyncThunk(
  'groupContract/fetchGroupContracts',
  async (_, thunkApi) => {
    try {
      return await getGroupContracts(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch group contracts'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const addGroupContract = createAsyncThunk(
  'groupContract/addGroupContract',
  async (payload: CreateGroupContractRequest, thunkApi) => {
    try {
      const id = await createGroupContract(payload, thunkApi.signal)
      // Since it returns just the ID, we might want to fetch it or just return what we know.
      return { id, payload }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create group contract'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchGroupContractById = createAsyncThunk(
  'groupContract/fetchGroupContractById',
  async (id: string, thunkApi) => {
    try {
      return await getGroupContractById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch group contract details'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const editGroupContract = createAsyncThunk(
  'groupContract/editGroupContract',
  async ({ id, payload }: { id: string; payload: UpdateGroupContractRequest }, thunkApi) => {
    try {
      await updateGroupContract(id, payload, thunkApi.signal)
      return { id, payload }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update group contract'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const removeGroupContract = createAsyncThunk(
  'groupContract/removeGroupContract',
  async (id: string, thunkApi) => {
    try {
      await deleteGroupContract(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete group contract'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const releaseGroupContractAction = createAsyncThunk(
  'groupContract/releaseGroupContract',
  async (id: string, thunkApi) => {
    try {
      await releaseGroupContract(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to release group contract'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const groupContractSlice = createSlice({
  name: 'groupContract',
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined
    },
    setSelectedGroupContract(state, action: PayloadAction<GroupContract | undefined>) {
      state.selected = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchGroupContracts
      .addCase(fetchGroupContracts.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchGroupContracts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchGroupContracts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // addGroupContract
      .addCase(addGroupContract.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(addGroupContract.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Since we only get the ID back, we mock a basic object to add to items, 
        // or just let the user re-fetch. In PerPersonPricing, it returned the whole object.
        // We will just let fetchGroupContracts handle the refresh if needed, but we can optimistically insert.
        const { id, payload } = action.payload
        const newContract: GroupContract = {
          id,
          ...payload,
          pickupRooms: 0,
          createdAt: new Date().toISOString()
        }
        state.items.push(newContract)
      })
      .addCase(addGroupContract.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchGroupContractById
      .addCase(fetchGroupContractById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchGroupContractById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchGroupContractById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // editGroupContract
      .addCase(editGroupContract.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(editGroupContract.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const { id, payload } = action.payload
        const index = state.items.findIndex((item) => item.id === id)
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...payload }
        }
        if (state.selected?.id === id) {
          state.selected = { ...state.selected, ...payload }
        }
      })
      .addCase(editGroupContract.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // removeGroupContract
      .addCase(removeGroupContract.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(removeGroupContract.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const id = action.payload
        state.items = state.items.filter((item) => item.id !== id)
        if (state.selected?.id === id) {
          state.selected = undefined
        }
      })
      .addCase(removeGroupContract.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // releaseGroupContractAction
      .addCase(releaseGroupContractAction.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(releaseGroupContractAction.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Just mark status as Released or update it somehow if we had the full object
        // Or re-fetch could be done by component
        const id = action.payload
        const index = state.items.findIndex((item) => item.id === id)
        if (index !== -1) {
          state.items[index] = { ...state.items[index], status: 'Released' }
        }
        if (state.selected?.id === id) {
          state.selected = { ...state.selected, status: 'Released' }
        }
      })
      .addCase(releaseGroupContractAction.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearError, setSelectedGroupContract } = groupContractSlice.actions
export default groupContractSlice.reducer
