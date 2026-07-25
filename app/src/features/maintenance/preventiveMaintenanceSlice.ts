import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { preventiveMaintenanceApi } from '../../shared/apis/preventiveMaintenanceApi'
import type {
  PreventiveMaintenancePlan,
  PreventiveMaintenancePlanListResponse,
  PreventiveMaintenanceRequest,
  PreventiveMaintenanceRequestListResponse,
  PreventiveMaintenancePlanPayload,
  PreventiveMaintenanceRequestPayload,
  PreventiveMaintenanceAssignPayload,
} from '../../models/PreventiveMaintenance'

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

type PreventiveMaintenanceState = {
  plans: PreventiveMaintenancePlan[]
  plansTotalCount: number
  plansPageNumber: number
  plansPageSize: number
  plansStatus: AsyncStatus
  planError?: string
  requests: PreventiveMaintenanceRequest[]
  requestsTotalCount: number
  requestsPageNumber: number
  requestsPageSize: number
  requestsStatus: AsyncStatus
  requestError?: string
  creatingPlan: boolean
  updatingPlan: boolean
  activatingPlan: boolean
  cancelingPlan: boolean
  startingRequest: boolean
  completingRequest: boolean
  assigningRequest: boolean
}

const initialState: PreventiveMaintenanceState = {
  plans: [],
  plansTotalCount: 0,
  plansPageNumber: 1,
  plansPageSize: 10,
  plansStatus: 'idle',
  requests: [],
  requestsTotalCount: 0,
  requestsPageNumber: 1,
  requestsPageSize: 10,
  requestsStatus: 'idle',
  creatingPlan: false,
  updatingPlan: false,
  activatingPlan: false,
  cancelingPlan: false,
  startingRequest: false,
  completingRequest: false,
  assigningRequest: false,
}

export const fetchPreventiveMaintenancePlans = createAsyncThunk(
  'preventiveMaintenance/fetchPlans',
  async (params: Record<string, string | number | boolean | undefined> | undefined, thunkApi) => {
    try {
      return await preventiveMaintenanceApi.fetchPlans(params)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load plans'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const createPreventiveMaintenancePlan = createAsyncThunk(
  'preventiveMaintenance/createPlan',
  async ({ payload }: { payload: PreventiveMaintenancePlanPayload }, thunkApi) => {
    try {
      return await preventiveMaintenanceApi.createPlan(payload)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create plan'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const updatePreventiveMaintenancePlan = createAsyncThunk(
  'preventiveMaintenance/updatePlan',
  async ({ id, payload }: { id: number | string; payload: PreventiveMaintenancePlanPayload }, thunkApi) => {
    try {
      return await preventiveMaintenanceApi.updatePlan(id, payload)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update plan'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const activatePreventiveMaintenancePlan = createAsyncThunk(
  'preventiveMaintenance/activatePlan',
  async (id: number | string, thunkApi) => {
    try {
      return await preventiveMaintenanceApi.activatePlan(id)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to activate plan'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const cancelPreventiveMaintenancePlan = createAsyncThunk(
  'preventiveMaintenance/cancelPlan',
  async (id: number | string, thunkApi) => {
    try {
      return await preventiveMaintenanceApi.cancelPlan(id)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to cancel plan'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const fetchPreventiveMaintenanceRequests = createAsyncThunk(
  'preventiveMaintenance/fetchRequests',
  async (params: Record<string, string | number | boolean | undefined> | undefined, thunkApi) => {
    try {
      return await preventiveMaintenanceApi.fetchRequests(params)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load requests'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const startPreventiveMaintenanceRequest = createAsyncThunk(
  'preventiveMaintenance/startRequest',
  async (id: number | string, thunkApi) => {
    try {
      return await preventiveMaintenanceApi.startRequest(id)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to start request'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const completePreventiveMaintenanceRequest = createAsyncThunk(
  'preventiveMaintenance/completeRequest',
  async ({ id, payload }: { id: number | string; payload: PreventiveMaintenanceRequestPayload }, thunkApi) => {
    try {
      return await preventiveMaintenanceApi.completeRequest(id, payload)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to complete request'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const assignPreventiveMaintenanceRequest = createAsyncThunk(
  'preventiveMaintenance/assignRequest',
  async ({ id, payload }: { id: number | string; payload: PreventiveMaintenanceAssignPayload }, thunkApi) => {
    try {
      return await preventiveMaintenanceApi.assignRequest(id, payload)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to assign request'
      return thunkApi.rejectWithValue(message)
    }
  }
)

export const reassignPreventiveMaintenanceRequest = createAsyncThunk(
  'preventiveMaintenance/reassignRequest',
  async ({ id, payload }: { id: number | string; payload: PreventiveMaintenanceAssignPayload }, thunkApi) => {
    try {
      return await preventiveMaintenanceApi.reassignRequest(id, payload)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to reassign request'
      return thunkApi.rejectWithValue(message)
    }
  }
)

const preventiveMaintenanceSlice = createSlice({
  name: 'preventiveMaintenance',
  initialState,
  reducers: {
    clearPreventiveMaintenanceError(state) {
      state.planError = undefined
      state.requestError = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreventiveMaintenancePlans.pending, (state) => {
        state.plansStatus = 'loading'
        state.planError = undefined
      })
      .addCase(fetchPreventiveMaintenancePlans.fulfilled, (state, action) => {
        state.plansStatus = 'succeeded'
        const payload = action.payload as PreventiveMaintenancePlanListResponse
        state.plans = payload.items ?? []
        state.plansTotalCount = payload.totalCount ?? 0
        state.plansPageNumber = payload.pageNumber ?? 1
        state.plansPageSize = payload.pageSize ?? 10
      })
      .addCase(fetchPreventiveMaintenancePlans.rejected, (state, action) => {
        state.plansStatus = 'failed'
        state.planError = action.payload as string
      })
      .addCase(createPreventiveMaintenancePlan.pending, (state) => {
        state.creatingPlan = true
      })
      .addCase(createPreventiveMaintenancePlan.fulfilled, (state) => {
        state.creatingPlan = false
      })
      .addCase(createPreventiveMaintenancePlan.rejected, (state) => {
        state.creatingPlan = false
      })
      .addCase(updatePreventiveMaintenancePlan.pending, (state) => {
        state.updatingPlan = true
      })
      .addCase(updatePreventiveMaintenancePlan.fulfilled, (state) => {
        state.updatingPlan = false
      })
      .addCase(updatePreventiveMaintenancePlan.rejected, (state) => {
        state.updatingPlan = false
      })
      .addCase(activatePreventiveMaintenancePlan.pending, (state) => {
        state.activatingPlan = true
      })
      .addCase(activatePreventiveMaintenancePlan.fulfilled, (state) => {
        state.activatingPlan = false
      })
      .addCase(activatePreventiveMaintenancePlan.rejected, (state) => {
        state.activatingPlan = false
      })
      .addCase(cancelPreventiveMaintenancePlan.pending, (state) => {
        state.cancelingPlan = true
      })
      .addCase(cancelPreventiveMaintenancePlan.fulfilled, (state) => {
        state.cancelingPlan = false
      })
      .addCase(cancelPreventiveMaintenancePlan.rejected, (state) => {
        state.cancelingPlan = false
      })
      .addCase(fetchPreventiveMaintenanceRequests.pending, (state) => {
        state.requestsStatus = 'loading'
        state.requestError = undefined
      })
      .addCase(fetchPreventiveMaintenanceRequests.fulfilled, (state, action) => {
        state.requestsStatus = 'succeeded'
        const payload = action.payload as PreventiveMaintenanceRequestListResponse
        state.requests = payload.items ?? []
        state.requestsTotalCount = payload.totalCount ?? 0
        state.requestsPageNumber = payload.pageNumber ?? 1
        state.requestsPageSize = payload.pageSize ?? 10
      })
      .addCase(fetchPreventiveMaintenanceRequests.rejected, (state, action) => {
        state.requestsStatus = 'failed'
        state.requestError = action.payload as string
      })
      .addCase(startPreventiveMaintenanceRequest.pending, (state) => {
        state.startingRequest = true
      })
      .addCase(startPreventiveMaintenanceRequest.fulfilled, (state) => {
        state.startingRequest = false
      })
      .addCase(startPreventiveMaintenanceRequest.rejected, (state) => {
        state.startingRequest = false
      })
      .addCase(completePreventiveMaintenanceRequest.pending, (state) => {
        state.completingRequest = true
      })
      .addCase(completePreventiveMaintenanceRequest.fulfilled, (state) => {
        state.completingRequest = false
      })
      .addCase(completePreventiveMaintenanceRequest.rejected, (state) => {
        state.completingRequest = false
      })
      .addCase(assignPreventiveMaintenanceRequest.pending, (state) => {
        state.assigningRequest = true
      })
      .addCase(assignPreventiveMaintenanceRequest.fulfilled, (state) => {
        state.assigningRequest = false
      })
      .addCase(assignPreventiveMaintenanceRequest.rejected, (state) => {
        state.assigningRequest = false
      })
      .addCase(reassignPreventiveMaintenanceRequest.pending, (state) => {
        state.assigningRequest = true
      })
      .addCase(reassignPreventiveMaintenanceRequest.fulfilled, (state) => {
        state.assigningRequest = false
      })
      .addCase(reassignPreventiveMaintenanceRequest.rejected, (state) => {
        state.assigningRequest = false
      })
  },
})

export const { clearPreventiveMaintenanceError } = preventiveMaintenanceSlice.actions
export const preventiveMaintenanceReducer = preventiveMaintenanceSlice.reducer
