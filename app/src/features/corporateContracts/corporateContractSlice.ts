import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  CorporateContract,
  CorporateContractPackage,
  CorporateInventoryQuery,
  CorporateInventoryResponse,
  CorporateContractSummary,
  CreateCorporateContractRequest,
  UpdateCorporateContractRequest,
  CreateCorporateContractPackageRequest,
  CorporateContractPackagesQuery,
  GenerateCorporateInventoryRequest,
  GenerateCorporateInventoryResponse,
} from '../../models/CorporateContract'
import {
  getCorporateContractById,
  getCorporateContractsByAccountId,
  createCorporateContract,
  updateCorporateContract,
  addPackageToCorporateContract,
  removePackageFromCorporateContract,
  getCorporateContractPackages,
  generateCorporatePackageInventory,
  getCorporateContractInventory,
  getCorporateContractSummary,
} from '../../shared/apis/CorporateContract'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

interface CorporateContractState {
  items: CorporateContract[]
  selected?: CorporateContract
  status: AsyncStatus
  error?: string
  activeAccountId?: string // Track which account's contracts we're viewing
  packagesByContractId: Record<string, CorporateContractPackage[]>
  packagesStatus: AsyncStatus
  packagesError?: string
  inventoryByKey: Record<string, CorporateInventoryResponse>
  inventoryStatus: AsyncStatus
  inventoryError?: string
  summaryByContractId: Record<string, CorporateContractSummary>
  summaryStatus: AsyncStatus
  summaryError?: string
  generateInventoryStatus: AsyncStatus
  generateInventoryError?: string
  lastGeneratedInventory?: GenerateCorporateInventoryResponse
}

const initialState: CorporateContractState = {
  items: [],
  selected: undefined,
  status: 'idle',
  error: undefined,
  activeAccountId: undefined,
  packagesByContractId: {},
  packagesStatus: 'idle',
  packagesError: undefined,
  inventoryByKey: {},
  inventoryStatus: 'idle',
  inventoryError: undefined,
  summaryByContractId: {},
  summaryStatus: 'idle',
  summaryError: undefined,
  generateInventoryStatus: 'idle',
  generateInventoryError: undefined,
  lastGeneratedInventory: undefined,
}

export function buildCorporateInventoryKey(contractId: string, packageId?: string, versionId?: string): string {
  return [contractId, packageId ?? 'all-packages', versionId ?? 'all-versions'].join(':')
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

export const fetchCorporatePackagesByContract = createAsyncThunk(
  'corporateContract/fetchPackagesByContract',
  async ({ contractId, params }: { contractId: string; params?: CorporateContractPackagesQuery }, thunkApi) => {
    try {
      const packages = await getCorporateContractPackages(contractId, params, thunkApi.signal)
      return { contractId, packages }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch contract packages'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const removePackageFromContract = createAsyncThunk(
  'corporateContract/removePackage',
  async ({ contractId, contractPackageId }: { contractId: string; contractPackageId: string }, thunkApi) => {
    try {
      await removePackageFromCorporateContract(contractId, contractPackageId, thunkApi.signal)
      return { contractId, contractPackageId }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to remove package from contract'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchCorporateInventory = createAsyncThunk(
  'corporateContract/fetchInventory',
  async ({ contractId, params }: { contractId: string; params?: CorporateInventoryQuery }, thunkApi) => {
    try {
      const inventory = await getCorporateContractInventory(contractId, params, thunkApi.signal)
      return {
        key: buildCorporateInventoryKey(contractId, params?.packageId, params?.versionId),
        inventory,
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch corporate inventory'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchCorporateContractSummary = createAsyncThunk(
  'corporateContract/fetchSummary',
  async (contractId: string, thunkApi) => {
    try {
      const summary = await getCorporateContractSummary(contractId, thunkApi.signal)
      return { contractId, summary }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch contract summary'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const generateCorporateInventory = createAsyncThunk(
  'corporateContract/generateInventory',
  async (
    {
      packageId,
      versionId,
      payload,
    }: { packageId: string; versionId: string; payload: GenerateCorporateInventoryRequest },
    thunkApi
  ) => {
    try {
      return await generateCorporatePackageInventory(packageId, versionId, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to generate corporate inventory'
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
        if (action.payload.packages && action.payload.packages.length > 0) {
          state.packagesByContractId[action.payload.id] = action.payload.packages
        }
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
        state.packagesStatus = 'loading'
        state.packagesError = undefined
      })
      .addCase(addPackageToContract.fulfilled, (state, action) => {
        state.packagesStatus = 'succeeded'
        const { contractId, packageData } = action.payload
        state.packagesByContractId[contractId] = [
          packageData,
          ...(state.packagesByContractId[contractId] ?? []).filter((item) => item.id !== packageData.id),
        ]
        const contract = state.items.find((item) => item.id === contractId)
        if (contract) {
          contract.packages = contract.packages ?? []
          contract.packages = [packageData, ...contract.packages.filter((item) => item.id !== packageData.id)]
        }
        if (state.selected?.id === contractId) {
          state.selected.packages = state.selected.packages ?? []
          state.selected.packages = [packageData, ...state.selected.packages.filter((item) => item.id !== packageData.id)]
        }
      })
      .addCase(addPackageToContract.rejected, (state, action) => {
        state.packagesStatus = 'failed'
        state.packagesError = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchCorporatePackagesByContract
      .addCase(fetchCorporatePackagesByContract.pending, (state) => {
        state.packagesStatus = 'loading'
        state.packagesError = undefined
      })
      .addCase(fetchCorporatePackagesByContract.fulfilled, (state, action) => {
        state.packagesStatus = 'succeeded'
        const { contractId, packages } = action.payload
        if (packages.length > 0 || state.packagesByContractId[contractId] === undefined) {
          state.packagesByContractId[contractId] = packages
        }
        const contract = state.items.find((item) => item.id === contractId)
        if (contract) {
          contract.packages = state.packagesByContractId[contractId] ?? packages
        }
        if (state.selected?.id === contractId) {
          state.selected.packages = state.packagesByContractId[contractId] ?? packages
        }
      })
      .addCase(fetchCorporatePackagesByContract.rejected, (state, action) => {
        state.packagesStatus = 'failed'
        state.packagesError = (action.payload as string | undefined) ?? action.error.message
      })

      // removePackageFromContract
      .addCase(removePackageFromContract.pending, (state) => {
        state.packagesStatus = 'loading'
        state.packagesError = undefined
      })
      .addCase(removePackageFromContract.fulfilled, (state, action) => {
        state.packagesStatus = 'succeeded'
        const { contractId, contractPackageId } = action.payload
        state.packagesByContractId[contractId] = (state.packagesByContractId[contractId] ?? []).filter((p) => p.id !== contractPackageId)
        const contract = state.items.find((item) => item.id === contractId)
        if (contract) {
          contract.packages = (contract.packages ?? []).filter((p) => p.id !== contractPackageId)
        }
        if (state.selected?.id === contractId) {
          state.selected.packages = (state.selected.packages ?? []).filter((p) => p.id !== contractPackageId)
        }
      })
      .addCase(removePackageFromContract.rejected, (state, action) => {
        state.packagesStatus = 'failed'
        state.packagesError = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchCorporateInventory
      .addCase(fetchCorporateInventory.pending, (state) => {
        state.inventoryStatus = 'loading'
        state.inventoryError = undefined
      })
      .addCase(fetchCorporateInventory.fulfilled, (state, action) => {
        state.inventoryStatus = 'succeeded'
        state.inventoryByKey[action.payload.key] = action.payload.inventory
      })
      .addCase(fetchCorporateInventory.rejected, (state, action) => {
        state.inventoryStatus = 'failed'
        state.inventoryError = (action.payload as string | undefined) ?? action.error.message
      })

      // fetchCorporateContractSummary
      .addCase(fetchCorporateContractSummary.pending, (state) => {
        state.summaryStatus = 'loading'
        state.summaryError = undefined
      })
      .addCase(fetchCorporateContractSummary.fulfilled, (state, action) => {
        state.summaryStatus = 'succeeded'
        state.summaryByContractId[action.payload.contractId] = action.payload.summary
      })
      .addCase(fetchCorporateContractSummary.rejected, (state, action) => {
        state.summaryStatus = 'failed'
        state.summaryError = (action.payload as string | undefined) ?? action.error.message
      })

      // generateCorporateInventory
      .addCase(generateCorporateInventory.pending, (state) => {
        state.generateInventoryStatus = 'loading'
        state.generateInventoryError = undefined
        state.lastGeneratedInventory = undefined
      })
      .addCase(generateCorporateInventory.fulfilled, (state, action) => {
        state.generateInventoryStatus = 'succeeded'
        state.lastGeneratedInventory = action.payload
      })
      .addCase(generateCorporateInventory.rejected, (state, action) => {
        state.generateInventoryStatus = 'failed'
        state.generateInventoryError = (action.payload as string | undefined) ?? action.error.message
      })
  },
})

export const { clearError, setSelectedContract, setActiveAccountId } = corporateContractSlice.actions
export default corporateContractSlice.reducer
