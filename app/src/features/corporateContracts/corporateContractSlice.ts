import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CorporateContract, CreateCorporateContractRequest, UpdateCorporateContractRequest, CreateCorporateContractPackageRequest, CorporateContractPackage } from '../../models/CorporateContract'
import {
  getCorporateContractById,
  getCorporateContractsByAccountId,
  createCorporateContract,
  updateCorporateContract,
  addPackageToCorporateContract,
} from '../../shared/apis/CorporateContract'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface CorporateContractState {
  items: CorporateContract[]
  selected?: CorporateContract
  status: AsyncStatus
  error?: string
  activeAccountId?: string // Track which account's contracts we're viewing
}

const initialState: CorporateContractState = {
  items: [],
  selected: undefined,
  status: 'idle',
  error: undefined,
  activeAccountId: undefined,
}

// ============ Async Thunks ============

export const fetchCorporateContractsByAccount = createAsyncThunk(
  'corporateContract/fetchByAccount',
  async (accountId: string, thunkApi) => {
    try {
      return await getCorporateContractsByAccountId(accountId, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch account contracts'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchCorporateContractById = createAsyncThunk(
  'corporateContract/fetchById',
  async (id: string, thunkApi) => {
    try {
      return await getCorporateContractById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch contract details'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createNewCorporateContract = createAsyncThunk(
  'corporateContract/create',
  async (payload: CreateCorporateContractRequest, thunkApi) => {
    try {
      return await createCorporateContract(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create contract'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updateCorporateContractAction = createAsyncThunk(
  'corporateContract/update',
  async ({ id, payload }: { id: string; payload: UpdateCorporateContractRequest }, thunkApi) => {
    try {
      return await updateCorporateContract(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update contract'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const addPackageToContract = createAsyncThunk(
  'corporateContract/addPackage',
  async ({ contractId, payload }: { contractId: string; payload: CreateCorporateContractPackageRequest }, thunkApi) => {
    try {
      const packageData = await addPackageToCorporateContract(contractId, payload, thunkApi.signal)
      return { contractId, packageData }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to add package to contract'
      return thunkApi.rejectWithValue(message)
    }
  }
)

// ============ Slice ============

const corporateContractSlice = createSlice({
  name: 'corporateContract',
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined
    },
    setSelectedContract(state, action: PayloadAction<CorporateContract | undefined>) {
      state.selected = action.payload
    },
    setActiveAccountId(state, action: PayloadAction<string | undefined>) {
      state.activeAccountId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCorporateContractsByAccount
      .addCase(fetchCorporateContractsByAccount.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchCorporateContractsByAccount.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchCorporateContractsByAccount.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchCorporateContractById
      .addCase(fetchCorporateContractById.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchCorporateContractById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selected = action.payload
      })
      .addCase(fetchCorporateContractById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // createNewCorporateContract
      .addCase(createNewCorporateContract.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(createNewCorporateContract.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.push(action.payload)
        state.selected = action.payload
      })
      .addCase(createNewCorporateContract.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // updateCorporateContractAction
      .addCase(updateCorporateContractAction.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateCorporateContractAction.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const updated = action.payload
        const index = state.items.findIndex((item) => item.id === updated.id)
        if (index !== -1) {
          state.items[index] = updated
        }
        if (state.selected?.id === updated.id) {
          state.selected = updated
        }
      })
      .addCase(updateCorporateContractAction.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })

      // addPackageToContract
      .addCase(addPackageToContract.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(addPackageToContract.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const { contractId, packageData } = action.payload
        const contract = state.items.find((item) => item.id === contractId)
        if (contract) {
          contract.packages.push(packageData)
        }
        if (state.selected?.id === contractId) {
          state.selected.packages.push(packageData)
        }
      })
      .addCase(addPackageToContract.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearError, setSelectedContract, setActiveAccountId } = corporateContractSlice.actions
export default corporateContractSlice.reducer
