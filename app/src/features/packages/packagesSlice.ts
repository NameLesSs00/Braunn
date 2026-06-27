import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import * as api from '../../shared/apis/Packages'
import type { Package, CreatePackagePayload, UpdatePackagePayload } from '../../models/Package'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface PackagesState {
  packages: Package[]
  selectedPackage: Package | null
  status: AsyncStatus
  error: string | null
}

const initialState: PackagesState = {
  packages: [],
  selectedPackage: null,
  status: 'idle',
  error: null,
}

export const fetchPackages = createAsyncThunk(
  'packages/fetchPackages',
  async (_, thunkApi) => {
    try {
      return await api.getPackages(thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch packages'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchPackageById = createAsyncThunk(
  'packages/fetchPackageById',
  async (id: string, thunkApi) => {
    try {
      return await api.getPackageById(id, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch package'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createPackage = createAsyncThunk(
  'packages/createPackage',
  async (payload: CreatePackagePayload, thunkApi) => {
    try {
      return await api.createPackage(payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create package'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updatePackage = createAsyncThunk(
  'packages/updatePackage',
  async ({ id, payload }: { id: string; payload: UpdatePackagePayload }, thunkApi) => {
    try {
      return await api.updatePackage(id, payload, thunkApi.signal)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update package'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const deletePackage = createAsyncThunk(
  'packages/deletePackage',
  async (id: string, thunkApi) => {
    try {
      await api.deletePackage(id, thunkApi.signal)
      return id
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete package'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const packagesSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    clearPackagesError(state) {
      state.error = null
    },
    clearSelectedPackage(state) {
      state.selectedPackage = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPackages
      .addCase(fetchPackages.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPackages.fulfilled, (state, action: PayloadAction<Package[]>) => {
        state.status = 'succeeded'
        state.packages = action.payload
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })
      
      // fetchPackageById
      .addCase(fetchPackageById.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPackageById.fulfilled, (state, action: PayloadAction<Package>) => {
        state.status = 'succeeded'
        state.selectedPackage = action.payload
      })
      .addCase(fetchPackageById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })

      // createPackage
      .addCase(createPackage.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createPackage.fulfilled, (state, action: PayloadAction<Package>) => {
        state.status = 'succeeded'
        if (action.payload) {
          state.packages.push(action.payload)
        }
      })
      .addCase(createPackage.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })

      // updatePackage
      .addCase(updatePackage.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updatePackage.fulfilled, (state, action: PayloadAction<Package>) => {
        state.status = 'succeeded'
        if (action.payload) {
          const index = state.packages.findIndex((p) => p.id === action.payload.id)
          if (index !== -1) {
            state.packages[index] = action.payload
          }
          if (state.selectedPackage?.id === action.payload.id) {
            state.selectedPackage = action.payload
          }
        }
      })
      .addCase(updatePackage.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })

      // deletePackage
      .addCase(deletePackage.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(deletePackage.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded'
        state.packages = state.packages.filter((p) => p.id !== action.payload)
        if (state.selectedPackage?.id === action.payload) {
          state.selectedPackage = null
        }
      })
      .addCase(deletePackage.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string | null) ?? (action.error.message || 'Unknown error')
      })
  },
})

export const { clearPackagesError, clearSelectedPackage } = packagesSlice.actions
export const packagesReducer = packagesSlice.reducer
export default packagesSlice.reducer
