import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type {
  CorporateAccount,
  CreateCorporateAccountRequest,
  UpdateCorporateAccountRequest,
} from '../../models/CorporateAccount'
import * as api from '../../shared/apis/CorporateAccount'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type CorporateAccountsState = {
  items: CorporateAccount[]
  selected?: CorporateAccount
  status: AsyncStatus
  error?: string
}

const initialState: CorporateAccountsState = {
  items: [],
  selected: undefined,
  status: 'idle',
  error: undefined,
}

export const fetchCorporateAccounts = createAsyncThunk(
  'corporateAccounts/fetchAll',
  async (_, thunkApi) => {
    try {
      return await api.getCorporateAccounts(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load corporate accounts'
      return thunkApi.rejectWithValue(message)
    }
  }
)

/**
 * POST /api/local/corporate-accounts
 * The endpoint now returns the new account id (UUID string) on 201, not the full object.
 * After creation we re-fetch the full list so the UI sees the correct data.
 */
export const addCorporateAccount = createAsyncThunk(
  'corporateAccounts/add',
  async (payload: CreateCorporateAccountRequest, thunkApi) => {
    try {
      const newId = await api.createCorporateAccount(payload, thunkApi.signal)
      // Fetch the newly created account by id to get the full shape (with contracts:[])
      const newAccount = await api.getCorporateAccountById(newId, thunkApi.signal)
      return newAccount
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create corporate account'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchCorporateAccountById = createAsyncThunk(
  'corporateAccounts/fetchById',
  async (id: string, thunkApi) => {
    try {
      return await api.getCorporateAccountById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load corporate account'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const editCorporateAccount = createAsyncThunk(
  'corporateAccounts/edit',
  async ({ id, payload }: { id: string; payload: UpdateCorporateAccountRequest }, thunkApi) => {
    try {
      await api.updateCorporateAccount(id, payload, thunkApi.signal)
      return { id, payload }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update corporate account'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const removeCorporateAccount = createAsyncThunk(
  'corporateAccounts/remove',
  async (id: string, thunkApi) => {
    try {
      await api.deleteCorporateAccount(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete corporate account'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const corporateAccountsSlice = createSlice({
  name: 'corporateAccounts',
  initialState,
  reducers: {
    clearCorporateAccountsError(state) {
      state.error = undefined
    },
    setSelectedCorporateAccount(state, action: PayloadAction<CorporateAccount | undefined>) {
      state.selected = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchAll ──────────────────────────────────────────────────────────
      .addCase(fetchCorporateAccounts.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchCorporateAccounts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchCorporateAccounts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // ── add ───────────────────────────────────────────────────────────────
      .addCase(addCorporateAccount.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(addCorporateAccount.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Prepend the freshly-fetched account (includes contracts: [])
        state.items.unshift(action.payload)
      })
      .addCase(addCorporateAccount.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // ── fetchById ─────────────────────────────────────────────────────────
      .addCase(fetchCorporateAccountById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchCorporateAccountById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchCorporateAccountById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // ── edit ──────────────────────────────────────────────────────────────
      .addCase(editCorporateAccount.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(editCorporateAccount.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const idx = state.items.findIndex((x) => x.id === action.payload.id)
        if (idx >= 0) {
          const existing = state.items[idx]
          const updated: CorporateAccount = {
            ...existing,
            ...action.payload.payload,
          }
          state.items[idx] = updated
          if (state.selected?.id === action.payload.id) {
            state.selected = updated
          }
        }
      })
      .addCase(editCorporateAccount.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // ── remove ────────────────────────────────────────────────────────────
      .addCase(removeCorporateAccount.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(removeCorporateAccount.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = state.items.filter((x) => x.id !== action.payload)
        if (state.selected?.id === action.payload) {
          state.selected = undefined
        }
      })
      .addCase(removeCorporateAccount.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearCorporateAccountsError, setSelectedCorporateAccount } =
  corporateAccountsSlice.actions
export const corporateAccountsReducer = corporateAccountsSlice.reducer
