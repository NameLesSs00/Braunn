import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { GroupPricingRule, CreateGroupPricingRuleRequest, UpdateGroupPricingRuleRequest } from '../../shared/apis/GroupPricingRule'
import * as api from '../../shared/apis/GroupPricingRule'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface GroupPricingState {
  items: GroupPricingRule[]
  selected?: GroupPricingRule
  status: AsyncStatus
  error?: string
}

const initialState: GroupPricingState = {
  items: [],
  selected: undefined,
  status: 'idle',
  error: undefined,
}

export const fetchGroupPricingRules = createAsyncThunk(
  'groupPricing/fetchGroupPricingRules',
  async (_, thunkApi) => {
    try {
      return await api.getGroupPricingRules(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch group pricing rules'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const addGroupPricingRule = createAsyncThunk(
  'groupPricing/addGroupPricingRule',
  async (payload: CreateGroupPricingRuleRequest, thunkApi) => {
    try {
      return await api.createGroupPricingRule(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create group pricing rule'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchGroupPricingRuleById = createAsyncThunk(
  'groupPricing/fetchById',
  async (id: string, thunkApi) => {
    try {
      return await api.getGroupPricingRuleById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch group pricing rule details'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const editGroupPricingRule = createAsyncThunk(
  'groupPricing/editGroupPricingRule',
  async ({ id, payload }: { id: string; payload: UpdateGroupPricingRuleRequest }, thunkApi) => {
    try {
      await api.updateGroupPricingRule(id, payload, thunkApi.signal)
      return { id, payload }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update group pricing rule'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const removeGroupPricingRule = createAsyncThunk(
  'groupPricing/removeGroupPricingRule',
  async (id: string, thunkApi) => {
    try {
      await api.deleteGroupPricingRule(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete group pricing rule'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const groupPricingSlice = createSlice({
  name: 'groupPricing',
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined
    },
    setSelectedPricingRule(state, action: PayloadAction<GroupPricingRule | undefined>) {
      state.selected = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupPricingRules.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchGroupPricingRules.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchGroupPricingRules.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(addGroupPricingRule.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(addGroupPricingRule.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(fetchGroupPricingRuleById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchGroupPricingRuleById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchGroupPricingRuleById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(editGroupPricingRule.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(editGroupPricingRule.fulfilled, (state, action) => {
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
      .addCase(editGroupPricingRule.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      .addCase(removeGroupPricingRule.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(removeGroupPricingRule.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const id = action.payload
        state.items = state.items.filter((item) => item.id !== id)
        if (state.selected?.id === id) {
          state.selected = undefined
        }
      })
      .addCase(removeGroupPricingRule.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearError, setSelectedPricingRule } = groupPricingSlice.actions
export default groupPricingSlice.reducer
